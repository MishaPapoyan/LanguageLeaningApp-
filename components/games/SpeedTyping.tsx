"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { speakTarget } from "@/lib/speech";

interface Word { id: string; word: string; translation: string; }

function stripDiacritics(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function SpeedTyping({ words, targetLang }: { words: Word[]; targetLang: string }) {
  if (words.length < 3) {
    return (
      <div style={{ maxWidth: 440, textAlign: "center" }}>
        <div className="card" style={{ padding: "40px 28px" }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>⌨️</div>
          <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>Not enough words yet</p>
          <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 24 }}>
            Play other games first — words get saved to your dictionary automatically and will appear here.
          </p>
          <a href="/games" style={{ display: "inline-block", textDecoration: "none" }} className="btn-primary">← Back to Games</a>
        </div>
      </div>
    );
  }
  const ROUNDS = Math.min(words.length, 12);
  const [queue] = useState(() => shuffle(words).slice(0, ROUNDS));
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState("");
  const [accentHint, setAccentHint] = useState(false);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong" | "skip">("idle");
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (finished) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [finished]);

  useEffect(() => {
    if (!finished) inputRef.current?.focus();
  }, [current, finished]);

  useEffect(() => {
    const t = setTimeout(() => speakTarget(queue[current]?.word ?? "", targetLang), 100);
    return () => clearTimeout(t);
  }, [current, queue, targetLang]);

  const advance = useCallback((wasCorrect: boolean) => {
    if (wasCorrect) setScore((s) => s + 1);
    const nextIdx = current + 1;
    if (nextIdx >= ROUNDS) {
      setFinished(true);
      const finalScore = score + (wasCorrect ? 1 : 0);
      fetch("/api/games/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameType: "SPEED_TYPING",
          score: finalScore,
          wordsUsed: queue.map((w) => w.id),
        }),
      }).then((r) => r.json()).then((d) => {
        setXpEarned(d.xpEarned ?? 10);
        window.dispatchEvent(new CustomEvent("xp-updated"));
      }).catch(() => {});
    } else {
      setCurrent(nextIdx);
      setInput("");
      setStatus("idle");
    }
  }, [current, score, ROUNDS, queue]);

  const handleInput = (val: string) => {
    setInput(val);
    setAccentHint(false);
    const target = queue[current].word.toLowerCase().trim();
    const typed = val.toLowerCase().trim();
    if (typed === target) {
      setStatus("correct");
      setTimeout(() => advance(true), 400);
    } else if (stripDiacritics(typed) === stripDiacritics(target) && typed.length === target.length) {
      // Correct word but missing accent — accept and hint
      setAccentHint(true);
      setStatus("correct");
      setTimeout(() => advance(true), 900);
    }
  };

  const handleSkip = () => {
    setStatus("skip");
    setTimeout(() => advance(false), 500);
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (finished) {
    const pct = Math.round((score / ROUNDS) * 100);
    return (
      <div style={{ maxWidth: 440, textAlign: "center" }}>
        <div className="card" style={{ padding: "40px 28px" }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>{pct === 100 ? "⚡" : pct >= 60 ? "🎉" : "💪"}</div>
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

  const word = queue[current];
  const pctDone = (current / ROUNDS) * 100;
  const borderColor = status === "correct" ? "var(--green)" : status === "wrong" || status === "skip" ? "var(--red)" : "var(--border-md)";

  return (
    <div style={{ maxWidth: 520 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <p style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", margin: 0 }}>Speed Typing</p>
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
      <div className="card" style={{ padding: "36px 28px", textAlign: "center", marginBottom: 20, border: `2px solid ${borderColor}`, transition: "border-color 0.2s" }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", margin: "0 0 10px" }}>
          Type the {targetLang === "es" ? "Spanish" : "French"} word for:
        </p>
        <p style={{ fontSize: 36, fontWeight: 900, color: "var(--accent)", margin: "0 0 6px", lineHeight: 1.1 }}>
          {word.translation}
        </p>
        <button
          onClick={() => speakTarget(word.word, targetLang)}
          style={{ fontSize: 12, color: "var(--text-3)", background: "none", border: "none", cursor: "pointer", padding: "4px 8px" }}
        >
          🔊 Hear it
        </button>
      </div>

      {/* Input */}
      <div style={{ position: "relative", marginBottom: 12 }}>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => handleInput(e.target.value)}
          disabled={status === "correct"}
          placeholder={`Type in ${targetLang === "es" ? "Spanish" : "French"}…`}
          autoCapitalize="none"
          autoComplete="off"
          spellCheck={false}
          style={{
            width: "100%", boxSizing: "border-box",
            padding: "16px 20px", borderRadius: 14,
            fontSize: 20, fontWeight: 700,
            background: "var(--surface-2)",
            border: `2px solid ${borderColor}`,
            color: status === "correct" ? "var(--green)" : "var(--text)",
            outline: "none", transition: "border-color 0.2s",
            textAlign: "center",
          }}
        />
        {status === "correct" && (
          <div style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", fontSize: 20, color: "var(--green)" }}>✓</div>
        )}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={handleSkip}
          disabled={status === "correct"}
          style={{
            flex: 1, padding: "12px", borderRadius: 12, fontSize: 13, fontWeight: 700,
            background: "var(--surface-2)", border: "1px solid var(--border)",
            color: "var(--text-3)", cursor: "pointer",
          }}
        >
          Skip → show answer
        </button>
      </div>

      {accentHint && (
        <div style={{ marginTop: 12, padding: "10px 16px", borderRadius: 12, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", textAlign: "center" }}>
          <span style={{ fontSize: 13, color: "#d97706" }}>✓ Correct! Remember the accent: <strong>{word.word}</strong></span>
        </div>
      )}

      {status === "skip" && (
        <div style={{ marginTop: 12, padding: "12px 16px", borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", textAlign: "center" }}>
          <span style={{ fontSize: 14, color: "var(--red)" }}>Answer: <strong>{word.word}</strong></span>
        </div>
      )}
    </div>
  );
}
