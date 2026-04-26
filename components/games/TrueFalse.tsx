"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { SpeakButton } from "@/components/ui/SpeakButton";

interface Word { id: string; word: string; translation: string; }

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildRounds(words: Word[], total: number): { word: Word; shownTranslation: string; isCorrect: boolean }[] {
  const shuffled = shuffle(words);
  const rounds = [];
  for (let i = 0; i < total; i++) {
    const word = shuffled[i % shuffled.length];
    const correct = Math.random() > 0.45;
    let shownTranslation = word.translation;
    if (!correct) {
      const others = words.filter((w) => w.id !== word.id);
      const other = others[Math.floor(Math.random() * others.length)];
      shownTranslation = other ? other.translation : word.translation + "?";
    }
    rounds.push({ word, shownTranslation, isCorrect: correct });
  }
  return rounds;
}

export function TrueFalse({ words }: { words: Word[] }) {
  const { data: session } = useSession();
  const targetLang = session?.user?.targetLanguage ?? "fr";
  if (words.length < 3) {
    return (
      <div style={{ maxWidth: 440, textAlign: "center" }}>
        <div className="card" style={{ padding: "40px 28px" }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>✅</div>
          <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>Not enough words yet</p>
          <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 24 }}>
            Play other games first — words get saved to your dictionary automatically and will appear here.
          </p>
          <a href="/games" style={{ display: "inline-block", textDecoration: "none" }} className="btn-primary">← Back to Games</a>
        </div>
      </div>
    );
  }
  const ROUNDS = Math.min(words.length >= 6 ? 15 : 10, words.length * 2);
  const [rounds] = useState(() => buildRounds(words, ROUNDS));
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  useEffect(() => {
    if (finished) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [finished]);

  const answer = useCallback((userSaysTrue: boolean) => {
    if (status !== "idle") return;
    const round = rounds[current];
    const correct = userSaysTrue === round.isCorrect;
    setStatus(correct ? "correct" : "wrong");
    if (correct) setScore((s) => s + 1);
    setTimeout(() => {
      if (current + 1 >= ROUNDS) {
        setFinished(true);
        const finalScore = score + (correct ? 1 : 0);
        fetch("/api/games/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gameType: "TRUE_FALSE",
            score: finalScore,
            wordsUsed: [...new Set(rounds.map((r) => r.word.id))],
          }),
        }).then((r) => r.json()).then((d) => {
          setXpEarned(d.xpEarned ?? 10);
          window.dispatchEvent(new CustomEvent("xp-updated"));
        }).catch(() => {});
      } else {
        setCurrent((c) => c + 1);
        setStatus("idle");
      }
    }, 600);
  }, [status, rounds, current, score, ROUNDS]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft" || e.key === "f" || e.key === "F") answer(false);
      if (e.key === "ArrowRight" || e.key === "t" || e.key === "T") answer(true);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answer]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (finished) {
    const pct = Math.round((score / ROUNDS) * 100);
    return (
      <div style={{ maxWidth: 440, textAlign: "center" }}>
        <div className="card" style={{ padding: "40px 28px" }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>{pct === 100 ? "🏆" : pct >= 60 ? "🎉" : "💪"}</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", margin: "0 0 8px" }}>Done!</h2>
          <p style={{ fontSize: 14, color: "var(--text-2)", margin: "0 0 20px" }}>
            <strong style={{ color: "var(--accent)" }}>{score}/{ROUNDS}</strong> correct · {fmt(elapsed)} · {pct}%
          </p>
          {xpEarned > 0 && (
            <div style={{ padding: "10px 16px", borderRadius: 12, background: "var(--accent-dim)", marginBottom: 20, fontSize: 14, fontWeight: 700, color: "var(--accent)" }}>
              +{xpEarned} XP earned!
            </div>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => window.location.reload()} className="btn-primary" style={{ flex: 1 }}>Play again</button>
            <Link href="/games" className="btn-outline" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>Back</Link>
          </div>
        </div>
      </div>
    );
  }

  const round = rounds[current];
  const pctDone = (current / ROUNDS) * 100;
  const statusColor = status === "correct" ? "var(--green)" : status === "wrong" ? "var(--red)" : "var(--border-md)";

  return (
    <div style={{ maxWidth: 520 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <p style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", margin: 0 }}>True or False</p>
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

      {/* Card */}
      <div className="card" style={{ padding: "36px 28px", textAlign: "center", marginBottom: 24, border: `2px solid ${statusColor}`, transition: "border-color 0.2s" }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", margin: "0 0 10px" }}>
          Is this translation correct?
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, margin: "0 0 14px" }}>
          <p style={{ fontSize: 32, fontWeight: 900, color: "var(--text)", margin: 0, lineHeight: 1.15 }}>
            {round.word.word}
          </p>
          <SpeakButton text={round.word.word} lang={targetLang} size={16} />
        </div>
        <div style={{ width: 40, height: 2, background: "var(--border-md)", borderRadius: 999, margin: "0 auto 14px" }} />
        <p style={{ fontSize: 22, fontWeight: 700, color: status === "idle" ? "var(--accent)" : status === "correct" ? "var(--green)" : "var(--red)", margin: 0 }}>
          {round.shownTranslation}
        </p>
        {status !== "idle" && (
          <p style={{ fontSize: 13, marginTop: 12, color: "var(--text-3)" }}>
            {status === "correct" ? "✓ Correct!" : `✗ Wrong — answer: ${round.word.translation}`}
          </p>
        )}
      </div>

      {/* Buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <button
          onClick={() => answer(false)}
          disabled={status !== "idle"}
          style={{
            padding: "20px 16px", borderRadius: 16, fontSize: 16, fontWeight: 800,
            background: "rgba(239,68,68,0.1)", border: "2px solid rgba(239,68,68,0.35)",
            color: "var(--red)", cursor: status !== "idle" ? "not-allowed" : "pointer",
            transition: "all 0.15s", opacity: status !== "idle" ? 0.5 : 1,
          }}
        >
          ✗ False
          <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(239,68,68,0.6)", marginTop: 4 }}>← or F key</div>
        </button>
        <button
          onClick={() => answer(true)}
          disabled={status !== "idle"}
          style={{
            padding: "20px 16px", borderRadius: 16, fontSize: 16, fontWeight: 800,
            background: "rgba(34,197,94,0.1)", border: "2px solid rgba(34,197,94,0.35)",
            color: "var(--green)", cursor: status !== "idle" ? "not-allowed" : "pointer",
            transition: "all 0.15s", opacity: status !== "idle" ? 0.5 : 1,
          }}
        >
          ✓ True
          <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(34,197,94,0.6)", marginTop: 4 }}>→ or T key</div>
        </button>
      </div>
    </div>
  );
}
