"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { getLanguageConfig } from "@/data/language-config";
import Link from "next/link";
import { Check, X, AlertCircle, RefreshCw, Loader2 } from "lucide-react";

interface GameData {
  targetWord: string;
  words: string[];
  correctIndices: number[];
  timeLimit: number;
}

type CardState = "idle" | "selected" | "correct" | "wrong" | "missed";

interface Props { language?: string; level?: string; }

export function WordAssociation({ language, level }: Props) {
  const { data: session } = useSession();
  const langConfig = getLanguageConfig(session?.user?.targetLanguage ?? language ?? "fr");
  const userLevel = (session?.user as any)?.level ?? level ?? "B1";

  const [gameData, setGameData]   = useState<GameData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [cardStates, setCardStates] = useState<CardState[]>([]);
  const [selected, setSelected]   = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft]   = useState(60);
  const [started, setStarted]     = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resultScore, setResultScore] = useState(0);
  const [xpEarned, setXpEarned]   = useState(0);
  const [saving, setSaving]       = useState(false);

  const loadGame = useCallback(async () => {
    setLoading(true);
    setStarted(false);
    setSubmitted(false);
    setSelected(new Set());
    setCardStates([]);
    setTimeLeft(60);
    try {
      const res = await fetch(`/api/games/word-association?language=${langConfig.code}&level=${userLevel}`);
      const data: GameData = await res.json();
      setGameData(data);
      setCardStates(new Array(data.words.length).fill("idle"));
      setTimeLeft(data.timeLimit ?? 60);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [langConfig.code, userLevel]);

  useEffect(() => { loadGame(); }, [loadGame]);

  // Countdown timer
  useEffect(() => {
    if (!started || submitted || timeLeft <= 0) {
      if (timeLeft <= 0 && started && !submitted) handleSubmit();
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, submitted, timeLeft]);

  const toggleCard = (i: number) => {
    if (!started || submitted) return;
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
    setCardStates((prev) => {
      const next = [...prev];
      next[i] = next[i] === "selected" ? "idle" : "selected";
      return next;
    });
  };

  const handleSubmit = useCallback(async () => {
    if (!gameData || submitted) return;
    setSubmitted(true);

    const correctSet = new Set(gameData.correctIndices);
    const states: CardState[] = gameData.words.map((_, i) => {
      if (selected.has(i) && correctSet.has(i)) return "correct";
      if (selected.has(i) && !correctSet.has(i)) return "wrong";
      if (!selected.has(i) && correctSet.has(i)) return "missed";
      return "idle";
    });
    setCardStates(states);

    const correctCount  = [...selected].filter((i) => correctSet.has(i)).length;
    const totalCorrect  = gameData.correctIndices.length;
    const pct = totalCorrect > 0 ? Math.round((correctCount / totalCorrect) * 100) : 0;
    setResultScore(pct);

    setSaving(true);
    try {
      const res = await fetch("/api/games/word-association", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: pct, wordsUsed: [], newWords: [gameData.targetWord, ...gameData.words] }),
      });
      const d = await res.json();
      setXpEarned(d.xpEarned ?? 10);
      window.dispatchEvent(new CustomEvent("xp-updated"));
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  }, [gameData, submitted, selected]);

  const timerPct = gameData ? (timeLeft / (gameData.timeLimit ?? 60)) * 100 : 100;
  const timerColor = timeLeft <= 15 ? "var(--red)" : timeLeft <= 30 ? "var(--gold)" : "var(--accent)";

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Loader2 size={32} className="animate-spin" style={{ color: "var(--accent)" }} />
      <p style={{ color: "var(--text-3)", fontSize: 13 }}>Generating word set…</p>
    </div>
  );

  if (!gameData) return (
    <div className="text-center py-16">
      <p style={{ color: "var(--text-2)" }}>Failed to load game.</p>
      <button onClick={loadGame} className="btn-secondary mt-4">Try again</button>
    </div>
  );

  // ─── Result screen ──────────────────────────────────────────────
  if (submitted) {
    const correct = cardStates.filter((s) => s === "correct").length;
    const wrong   = cardStates.filter((s) => s === "wrong").length;
    const missed  = cardStates.filter((s) => s === "missed").length;

    return (
      <div className="max-w-lg mx-auto text-center py-8 animate-fade-up space-y-6">
        <div className="text-6xl">{resultScore >= 90 ? "🎉" : resultScore >= 70 ? "👏" : resultScore >= 50 ? "📚" : "💪"}</div>
        <div>
          <p style={{ fontSize: 48, fontWeight: 900, color: "var(--text)", lineHeight: 1 }}>{resultScore}%</p>
          <p style={{ color: "var(--text-3)", fontSize: 13, marginTop: 4 }}>Score for "{gameData.targetWord}"</p>
        </div>

        <div className="flex justify-center gap-6">
          {[
            { label: "Correct", count: correct, color: "var(--green)" },
            { label: "Wrong",   count: wrong,   color: "var(--red)" },
            { label: "Missed",  count: missed,  color: "var(--gold)" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.count}</p>
              <p style={{ fontSize: 11, color: "var(--text-3)" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {saving ? (
          <p style={{ color: "var(--text-3)", fontSize: 12 }}>Saving…</p>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <span style={{ fontSize: 20 }}>⚡</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: "var(--gold)" }}>+{xpEarned} XP</span>
          </div>
        )}

        {/* Word grid review */}
        <div className="grid grid-cols-4 gap-2">
          {gameData.words.map((word, i) => {
            const s = cardStates[i];
            let bg = "var(--surface-2)";
            let color = "var(--text-3)";
            let icon = null;
            if (s === "correct") { bg = "rgba(16,185,129,0.2)"; color = "var(--green)"; icon = <Check size={10} />; }
            if (s === "wrong")   { bg = "rgba(239,68,68,0.2)";  color = "var(--red)";   icon = <X size={10} />; }
            if (s === "missed")  { bg = "rgba(245,158,11,0.2)"; color = "var(--gold)";  icon = <AlertCircle size={10} />; }
            return (
              <div key={i} className="flex flex-col items-center justify-center gap-1 rounded-xl py-2 px-1"
                style={{ background: bg, minHeight: 56 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color, textAlign: "center" }}>{word}</span>
                {icon && <span style={{ color }}>{icon}</span>}
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 justify-center">
          <button onClick={loadGame} className="btn-primary flex items-center gap-2">
            <RefreshCw size={14} /> Play Again
          </button>
          <Link href="/games" className="btn-secondary">All Games</Link>
        </div>
      </div>
    );
  }

  // ─── Pre-start screen ───────────────────────────────────────────
  if (!started) return (
    <div className="max-w-md mx-auto text-center py-12 space-y-6 animate-fade-up">
      <div className="text-5xl">🔗</div>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)" }}>Word Association</h2>
        <p style={{ color: "var(--text-2)", fontSize: 13, marginTop: 6 }}>
          A target word appears. Tap all words in the grid that are <strong style={{ color: "var(--accent)" }}>semantically related</strong> to it before time runs out.
        </p>
      </div>
      <div className="rounded-2xl p-4 text-left space-y-2" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
        {[
          "🎯 Target word shown at top",
          "👆 Tap related words — tap again to deselect",
          "⏱️ 60 seconds — submit before time runs out",
          "✅ Score = correct selections / total correct words",
        ].map((tip) => (
          <p key={tip} style={{ fontSize: 12, color: "var(--text-2)" }}>{tip}</p>
        ))}
      </div>
      <button onClick={() => setStarted(true)} className="btn-primary w-full text-base py-3">Start Game</button>
    </div>
  );

  // ─── Game screen ────────────────────────────────────────────────
  return (
    <div className="max-w-lg mx-auto space-y-5 animate-fade-up">
      {/* Timer + target word */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>TARGET WORD</p>
          <div className="inline-block rounded-xl px-4 py-2" style={{ background: "var(--accent)", color: "#fff" }}>
            <span style={{ fontSize: 22, fontWeight: 900 }}>{gameData.targetWord}</span>
          </div>
        </div>
        {/* Circular timer */}
        <div className="relative flex items-center justify-center" style={{ width: 64, height: 64 }}>
          <svg width="64" height="64" style={{ transform: "rotate(-90deg)", position: "absolute" }}>
            <circle cx="32" cy="32" r="28" fill="none" stroke="var(--surface-2)" strokeWidth="5" />
            <circle cx="32" cy="32" r="28" fill="none" stroke={timerColor} strokeWidth="5"
              strokeDasharray={`${2 * Math.PI * 28}`}
              strokeDashoffset={`${2 * Math.PI * 28 * (1 - timerPct / 100)}`}
              style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }} />
          </svg>
          <span style={{ fontSize: 16, fontWeight: 800, color: timerColor, position: "relative", zIndex: 1 }}>{timeLeft}</span>
        </div>
      </div>

      {/* Word grid */}
      <div className="grid grid-cols-4 gap-2">
        {gameData.words.map((word, i) => {
          const s = cardStates[i];
          const isSelected = s === "selected";
          return (
            <button key={i} onClick={() => toggleCard(i)}
              className="rounded-xl flex items-center justify-center text-center transition-all"
              style={{
                minHeight: 64,
                padding: "8px 4px",
                fontSize: 12,
                fontWeight: isSelected ? 700 : 500,
                background: isSelected ? "var(--accent)" : "var(--surface-2)",
                color: isSelected ? "#fff" : "var(--text-2)",
                border: `1px solid ${isSelected ? "var(--accent)" : "var(--border)"}`,
                cursor: "pointer",
                transform: isSelected ? "scale(1.04)" : "scale(1)",
              }}>
              {word}
            </button>
          );
        })}
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={selected.size === 0}
        className="btn-primary w-full py-3 text-base"
        style={{ opacity: selected.size === 0 ? 0.5 : 1 }}>
        Submit ({selected.size} selected)
      </button>
    </div>
  );
}
