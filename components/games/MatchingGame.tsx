"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface Word { id: string; word: string; translation: string; imageEmoji: string; }

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function MatchingGame({ words }: { words: Word[] }) {
  const [frCards, setFrCards] = useState<Word[]>(() => shuffle(words));
  const [enCards, setEnCards] = useState<Word[]>(() => shuffle(words));
  const [selected, setSelected] = useState<{ col: "fr" | "en"; id: string } | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [errors, setErrors] = useState(0);
  const startRef = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 500);
    return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
  }, []);

  const handleSelect = async (col: "fr" | "en", id: string) => {
    if (matched.has(id) || wrongId) return;

    if (!selected) { setSelected({ col, id }); return; }
    if (selected.col === col) { setSelected({ col, id }); return; }

    if (selected.id === id) {
      // Correct match
      const newMatched = new Set(matched);
      newMatched.add(id);
      setMatched(newMatched);
      setSelected(null);

      if (newMatched.size === words.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        const score = Math.max(0, 100 - errors * 10);
        try {
          const res = await fetch("/api/games/score", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ gameType: "MATCHING", score, wordsUsed: words.map((w) => w.id) }),
          });
          const d = await res.json();
          setXpEarned(d.xpEarned ?? 10);
          window.dispatchEvent(new CustomEvent("xp-updated"));
        } catch { /* silent */ }
        setFinished(true);
      }
    } else {
      // Wrong match — flash the card that was already selected
      setWrongId(selected.id);
      setErrors((e) => e + 1);
      setTimeout(() => { setWrongId(null); setSelected(null); }, 800);
    }
  };

  const restart = () => {
    startRef.current = Date.now();
    setMatched(new Set());
    setSelected(null);
    setWrongId(null);
    setFinished(false);
    setErrors(0);
    setElapsed(0);
    setFrCards(shuffle(words));
    setEnCards(shuffle(words));
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 500);
  };

  const cardStyle = (col: "fr" | "en", id: string): React.CSSProperties => {
    if (matched.has(id)) return {
      background: "var(--green-dim)", border: "1px solid rgba(52,211,153,0.3)",
      color: "var(--green)", opacity: 0.55, cursor: "default",
    };
    if (wrongId === id) return {
      background: "var(--red-dim)", border: "1px solid rgba(248,113,113,0.5)",
      color: "var(--red)",
    };
    if (selected?.col === col && selected?.id === id) return {
      background: "var(--accent-dim)", border: "1px solid rgba(124,106,255,0.6)",
      color: "var(--accent)", boxShadow: "0 0 16px rgba(124,106,255,0.2)",
    };
    return {
      background: "var(--surface-2)", border: "1px solid var(--border)",
      color: "var(--text-2)", cursor: "pointer",
    };
  };

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  if (finished) {
    return (
      <div className="card p-8 text-center animate-fade-up">
        <p className="text-5xl mb-3">🎯</p>
        <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text)" }}>All matched!</h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-2)" }}>
          {errors === 0 ? "Perfect — no mistakes! 🏆" : `${errors} mistake${errors !== 1 ? "s" : ""}`}
        </p>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Time", value: `${mins}:${String(secs).padStart(2,"0")}` },
            { label: "Mistakes", value: String(errors) },
            { label: "XP", value: `+${xpEarned}` },
          ].map((s) => (
            <div key={s.label} className="rounded-xl p-3" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <p className="text-lg font-extrabold" style={{ color: "var(--accent)" }}>{s.value}</p>
              <p className="text-[11px]" style={{ color: "var(--text-3)" }}>{s.label}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={restart} className="btn-primary flex-1">Play again</button>
          <Link href="/games" className="btn-secondary flex-1 text-center">Back to Games</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 text-xs font-semibold" style={{ color: "var(--text-3)" }}>
        <span>⏱ {mins}:{String(secs).padStart(2,"0")}</span>
        <span style={{ color: "var(--text-2)" }}>{matched.size}/{words.length} matched</span>
        <span style={{ color: errors > 0 ? "var(--red)" : "var(--text-3)" }}>{errors} mistakes</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <p className="section-label mb-2">French</p>
          {frCards.map((w) => (
            <button key={w.id} onClick={() => handleSelect("fr", w.id)} disabled={matched.has(w.id)}
              className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150"
              style={cardStyle("fr", w.id)}>
              {w.imageEmoji} {w.word}{matched.has(w.id) && " ✓"}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          <p className="section-label mb-2">English</p>
          {enCards.map((w) => (
            <button key={w.id} onClick={() => handleSelect("en", w.id)} disabled={matched.has(w.id)}
              className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150"
              style={cardStyle("en", w.id)}>
              {w.translation}{matched.has(w.id) && " ✓"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
