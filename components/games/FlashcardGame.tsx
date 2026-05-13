"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getLanguageConfig } from "@/data/language-config";
import { speakTarget } from "@/lib/speech";

interface Word {
  id: string;
  word: string;
  translation: string;
  exampleFr: string;
  imageEmoji: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildOptions(correct: Word, pool: Word[]): string[] {
  const distractors = shuffle(pool.filter(w => w.id !== correct.id))
    .slice(0, 3)
    .map(w => w.translation);
  return shuffle([correct.translation, ...distractors]);
}

export function FlashcardGame({ words }: { words: Word[] }) {
  const { data: session } = useSession();
  const langConfig = getLanguageConfig(session?.user?.targetLanguage ?? "fr");

  const [queue] = useState(() => shuffle(words).slice(0, Math.min(words.length, 20)));
  const [current, setCurrent]   = useState(0);
  const [flipped, setFlipped]   = useState(false);
  const [options, setOptions]   = useState<string[]>([]);
  const [chosen, setChosen]     = useState<string | null>(null);
  const [score, setScore]       = useState(0);
  const [finished, setFinished] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  const card = queue[current];

  // Build fresh options when card changes
  useEffect(() => {
    if (!card) return;
    setOptions(buildOptions(card, words));
    setChosen(null);
    setFlipped(false);
  }, [current, card, words]);

  const pick = useCallback((opt: string) => {
    if (chosen || !card) return;
    setChosen(opt);
    const correct = opt === card.translation;
    if (correct) setScore(s => s + 1);

    // Flip card to show answer
    setTimeout(() => setFlipped(true), 200);

    // Advance after showing result
    setTimeout(async () => {
      const next = current + 1;
      if (next >= queue.length) {
        setFinished(true);
        const pct = Math.round(((score + (correct ? 1 : 0)) / queue.length) * 100);
        try {
          const res = await fetch("/api/games/score", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ gameType: "FLASHCARDS", score: pct, wordsUsed: queue.map(w => w.id) }),
          });
          const data = await res.json();
          setXpEarned(data.xpEarned ?? 10);
          window.dispatchEvent(new CustomEvent("xp-updated"));
        } catch {}
      } else {
        setCurrent(next);
      }
    }, 1400);
  }, [chosen, card, current, queue, score]);

  const restart = () => {
    setCurrent(0); setScore(0); setFinished(false);
    setChosen(null); setFlipped(false);
  };

  // ── Results ──────────────────────────────────────────────────────────────────
  if (finished) {
    const pct = Math.round((score / queue.length) * 100);
    return (
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <div className="bento p-8 text-center animate-fade-up">
          <div style={{
            width: 80, height: 80, borderRadius: "50%", margin: "0 auto 20px",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36,
            background: pct >= 70 ? "rgba(16,185,129,0.12)" : "var(--accent-dim)",
            border: `2px solid ${pct >= 70 ? "rgba(16,185,129,0.3)" : "rgba(16,185,129,0.3)"}`,
          }}>
            {pct >= 80 ? "🏆" : pct >= 60 ? "🎉" : "💪"}
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", marginBottom: 6 }}>Round Complete!</h2>
          <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 24 }}>
            <strong style={{ color: "var(--accent)" }}>{score}/{queue.length}</strong> correct · {pct}%
          </p>
          {xpEarned > 0 && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20,
              background: "var(--accent-dim)", border: "1px solid rgba(16,185,129,0.3)",
              borderRadius: 999, padding: "6px 16px", fontSize: 14, fontWeight: 800, color: "var(--accent-2)",
            }}>
              ⚡ +{xpEarned} XP earned!
            </div>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={restart} className="btn-primary" style={{ flex: 1 }}>Play again</button>
            <Link href="/games" className="btn-secondary" style={{ flex: 1, textAlign: "center" }}>Back to games</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!card) return null;
  const pctDone = (current / queue.length) * 100;

  // ── Game ─────────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      {/* Progress */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div style={{ flex: 1, height: 6, background: "var(--surface-3)", borderRadius: 999, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 999, transition: "width 0.5s ease",
            background: "linear-gradient(90deg, var(--accent), var(--accent-2))",
            width: `${pctDone}%`,
          }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-3)", whiteSpace: "nowrap" }}>
          {current + 1}/{queue.length}
        </span>
      </div>

      {/* Card */}
      <div style={{ perspective: "1200px", marginBottom: 20 }}>
        <div style={{
          position: "relative", height: 200,
          transformStyle: "preserve-3d",
          transition: "transform 0.45s cubic-bezier(0.4, 0.2, 0.2, 1)",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}>
          {/* Front — word */}
          <div style={{
            position: "absolute", inset: 0, backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden", borderRadius: 20,
            background: "var(--surface-2)", border: "1px solid var(--border-md)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10,
          }}>
            <p style={{ fontSize: 13, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {langConfig.flag} {langConfig.label} word
            </p>
            <p style={{ fontSize: 34, fontWeight: 800, color: "var(--text)", fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>
              {card.imageEmoji} {card.word}
            </p>
            <button
              onClick={() => speakTarget(card.word, langConfig.code)}
              style={{
                width: 34, height: 34, borderRadius: 9,
                background: "var(--accent-dim)", color: "var(--accent-2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "1px solid rgba(16,185,129,0.25)", cursor: "pointer", fontSize: 16,
              }}
            >♪</button>
          </div>

          {/* Back — translation + example */}
          <div style={{
            position: "absolute", inset: 0, backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)",
            borderRadius: 20,
            background: chosen === null
              ? "var(--surface-2)"
              : chosen === card.translation
                ? "linear-gradient(145deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))"
                : "linear-gradient(145deg, rgba(239,68,68,0.12), rgba(239,68,68,0.04))",
            border: `1px solid ${chosen === null ? "var(--border-md)" : chosen === card.translation ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.35)"}`,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: "24px", gap: 8,
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: chosen === null ? "var(--text-3)" : chosen === card.translation ? "var(--green)" : "var(--red)" }}>
              {chosen === null ? "" : chosen === card.translation ? "✓ Correct!" : "✗ Not quite"}
            </p>
            <p style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", textAlign: "center" }}>
              {card.translation}
            </p>
            {card.exampleFr && (
              <p style={{ fontSize: 12, color: "var(--text-3)", fontStyle: "italic", textAlign: "center", lineHeight: 1.5 }}>
                &ldquo;{card.exampleFr}&rdquo;
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Instruction */}
      {!chosen && (
        <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-3)", marginBottom: 14 }}>
          Pick the correct translation ↓
        </p>
      )}

      {/* Multiple choice options */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {options.map((opt) => {
          const isChosen  = chosen === opt;
          const isCorrect = opt === card.translation;
          let bg = "var(--surface-2)", border = "var(--border-md)", color = "var(--text)";
          if (chosen) {
            if (isCorrect)       { bg = "rgba(16,185,129,0.12)"; border = "rgba(16,185,129,0.45)"; color = "var(--green)"; }
            else if (isChosen)   { bg = "rgba(239,68,68,0.10)";  border = "rgba(239,68,68,0.40)";  color = "var(--red)"; }
            else                 { bg = "var(--surface-2)"; border = "var(--border)"; color = "var(--text-3)"; }
          }
          return (
            <button
              key={opt}
              onClick={() => pick(opt)}
              disabled={!!chosen}
              style={{
                padding: "12px 14px", borderRadius: 13,
                background: bg, border: `1.5px solid ${border}`, color,
                fontSize: 13, fontWeight: 600, textAlign: "left",
                cursor: chosen ? "default" : "pointer",
                transition: "all 0.15s",
                opacity: chosen && !isChosen && !isCorrect ? 0.4 : 1,
              }}
            >
              {isChosen && !isCorrect ? "✗ " : isCorrect && chosen ? "✓ " : ""}{opt}
            </button>
          );
        })}
      </div>

      {/* Score */}
      <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "var(--text-3)" }}>
        ✓ {score} correct so far
      </div>
    </div>
  );
}
