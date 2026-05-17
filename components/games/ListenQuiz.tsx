"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { t, getLocale } from "@/lib/i18n";
import { speakTarget } from "@/lib/speech";

interface Word { id: string; word: string; translation: string; }

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildRound(correct: Word | undefined, pool: Word[]): { options: Word[]; correct: Word } | null {
  if (!correct) return null;
  const validPool = pool.filter((w): w is Word => w != null && !!w.id);
  if (validPool.length < 2) return null;
  const others = shuffle(validPool.filter((w) => w.id !== correct.id)).slice(0, 3);
  const options = shuffle([correct, ...others]).filter((w): w is Word => w != null && !!w.id);
  if (options.length < 2) return null;
  return { options, correct };
}

export function ListenQuiz({ words, targetLang }: { words: Word[]; targetLang: string }) {
  const { data: session } = useSession();
  const locale = getLocale((session?.user as { nativeLanguage?: string })?.nativeLanguage);
  const ROUNDS = Math.min(words.length, 12);
  const [queue] = useState(() => shuffle(words).slice(0, ROUNDS));
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [round, setRound] = useState(() => buildRound(queue[0], words));
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (finished) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [finished]);

  const playWord = useCallback((word: string) => {
    if (!word) return;
    speakTarget(word, targetLang, 0.8, {
      onEnd: () => setPlaying(false),
      onError: () => setPlaying(false),
    });
    // setPlaying deferred so it doesn't fire during render cycle
    setTimeout(() => setPlaying(true), 0);
  }, [targetLang]);

  useEffect(() => {
    const w = queue[current];
    if (!w) return;
    const newRound = buildRound(w, words);
    setRound(newRound);
    setSelected(null);
    const t = setTimeout(() => playWord(w.word), 300);
    return () => clearTimeout(t);
  }, [current, queue, words, playWord]);

  const handlePick = (wordId: string) => {
    if (selected !== null || !round) return;
    setSelected(wordId);
    const correct = wordId === round.correct.id;
    if (correct) setScore((s) => s + 1);
    setTimeout(() => {
      const next = current + 1;
      if (next >= ROUNDS) {
        setFinished(true);
        const finalScore = score + (correct ? 1 : 0);
        fetch("/api/games/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gameType: "LISTEN_QUIZ",
            score: finalScore,
            wordsUsed: queue.map((w) => w.id),
          }),
        }).then((r) => r.json()).then((d) => {
          setXpEarned(d.xpEarned ?? 10);
          window.dispatchEvent(new CustomEvent("xp-updated"));
        }).catch(() => {});
      } else {
        setCurrent(next);
      }
    }, 900);
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (finished) {
    const pct = Math.round((score / ROUNDS) * 100);
    return (
      <div style={{ maxWidth: 440, textAlign: "center" }}>
        <div className="card" style={{ padding: "40px 28px" }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>{pct === 100 ? "🎧" : pct >= 60 ? "🎉" : "💪"}</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", margin: "0 0 8px" }}>{t(locale, "game_done")}</h2>
          <p style={{ fontSize: 14, color: "var(--text-2)", margin: "0 0 20px" }}>
            <strong style={{ color: "var(--accent)" }}>{score}/{ROUNDS}</strong> correct · {fmt(elapsed)} · {pct}%
          </p>
          {xpEarned > 0 && (
            <div style={{ padding: "10px 16px", borderRadius: 12, background: "var(--accent-dim)", marginBottom: 20, fontSize: 14, fontWeight: 700, color: "var(--accent)" }}>
              +{xpEarned} XP earned!
            </div>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => window.location.reload()} className="btn-primary" style={{ flex: 1 }}>{t(locale, "game_playAgain")}</button>
            <Link href="/games" className="btn-outline" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>{t(locale, "game_back")}</Link>
          </div>
        </div>
      </div>
    );
  }

  // Not enough valid words — show friendly empty state
  if (!round) {
    return (
      <div style={{ maxWidth: 440, textAlign: "center" }}>
        <div className="card" style={{ padding: "40px 28px" }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🎧</div>
          <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>{t(locale, "game_notEnoughWords")}</p>
          <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 24 }}>
            Play other games first — words get saved to your dictionary automatically and will appear here.
          </p>
          <Link href="/games" className="btn-primary" style={{ display: "inline-block", textDecoration: "none" }}>← Back to Games</Link>
        </div>
      </div>
    );
  }

  const pctDone = (current / ROUNDS) * 100;

  return (
    <div style={{ maxWidth: 520 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <p style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", margin: 0 }}>Listen & Choose</p>
          <p style={{ fontSize: 12, color: "var(--text-3)", margin: 0 }}>{current + 1} of {ROUNDS}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--green)" }}>✓ {score}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-3)" }}>⏱ {fmt(elapsed)}</span>
        </div>
      </div>

      {/* Progress */}
      <div style={{ height: 5, background: "var(--surface-3)", borderRadius: 999, overflow: "hidden", marginBottom: 24 }}>
        <div style={{ height: "100%", width: `${pctDone}%`, background: "linear-gradient(90deg,var(--accent),var(--accent-2))", borderRadius: 999, transition: "width 0.3s ease" }} />
      </div>

      {/* Listen button */}
      <div className="card" style={{ padding: "36px 28px", textAlign: "center", marginBottom: 20 }}>
        <p style={{ fontSize: 12, color: "var(--text-3)", margin: "0 0 18px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Listen and pick the correct meaning
        </p>
        <button
          onClick={() => playWord(round.correct.word)}
          style={{
            width: 80, height: 80, borderRadius: "50%",
            background: playing
              ? "linear-gradient(135deg, var(--accent), var(--accent-2))"
              : "var(--surface-3)",
            border: playing ? "none" : "2px solid var(--border-md)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", fontSize: 30,
            transition: "all 0.2s",
            boxShadow: playing ? "0 0 24px rgba(16,185,129,0.5)" : "none",
            animation: playing ? "pulse 0.8s ease infinite alternate" : "none",
          }}
        >
          {playing ? "🔊" : "▶"}
        </button>
        <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 12 }}>
          {playing ? "Playing…" : "Tap to hear again"}
        </p>
      </div>

      {/* Options */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {round.options.filter((opt): opt is Word => opt != null && !!opt.id).map((opt) => {
          const isSelected = selected === opt.id;
          const isCorrect = opt.id === round.correct.id;
          let bg = "var(--surface-2)";
          let border = "1px solid var(--border)";
          let color = "var(--text)";

          if (selected !== null) {
            if (isCorrect) { bg = "rgba(34,197,94,0.12)"; border = "1.5px solid var(--green)"; color = "var(--green)"; }
            else if (isSelected) { bg = "rgba(239,68,68,0.1)"; border = "1.5px solid var(--red)"; color = "var(--red)"; }
          }

          return (
            <button
              key={opt.id}
              onClick={() => handlePick(opt.id)}
              disabled={selected !== null}
              style={{
                padding: "18px 14px", borderRadius: 14, fontSize: 15, fontWeight: 700,
                background: bg, border, color,
                cursor: selected !== null ? "default" : "pointer",
                transition: "all 0.15s", textAlign: "center",
              }}
            >
              {opt.translation}
              {selected !== null && isCorrect && <div style={{ fontSize: 18, marginTop: 4 }}>✓</div>}
              {selected !== null && isSelected && !isCorrect && <div style={{ fontSize: 18, marginTop: 4 }}>✗</div>}
            </button>
          );
        })}
      </div>

      <style>{`
        @keyframes pulse { from { transform: scale(1); } to { transform: scale(1.06); } }
      `}</style>
    </div>
  );
}
