"use client";

import { useState, useCallback } from "react";
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

export function FlashcardGame({ words }: { words: Word[] }) {
  const { data: session } = useSession();
  const langConfig = getLanguageConfig(session?.user?.targetLanguage ?? "fr");
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<string[]>([]);
  const [learning, setLearning] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  const card = words[current];

  const next = useCallback(
    async (isKnown: boolean) => {
      if (isKnown) setKnown((prev) => [...prev, card.id]);
      else setLearning((prev) => [...prev, card.id]);

      if (current + 1 >= words.length) {
        const score = Math.round(((isKnown ? known.length + 1 : known.length) / words.length) * 100);
        setFinished(true);
        try {
          const res = await fetch("/api/games/score", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ gameType: "FLASHCARDS", score, wordsUsed: words.map((w) => w.id) }),
          });
          const data = await res.json();
          setXpEarned(data.xpEarned ?? 10);
          window.dispatchEvent(new CustomEvent("xp-updated"));
        } catch {}
      } else {
        setFlipped(false);
        setTimeout(() => setCurrent((prev) => prev + 1), 150);
      }
    },
    [card, current, known, words]
  );

  // ── Results screen ──────────────────────────────────────────────────────────
  if (finished) {
    const knownCount = known.length;
    const learnCount = words.length - knownCount;
    const pct = Math.round((knownCount / words.length) * 100);

    return (
      <div className="bento p-8 text-center animate-fade-up" style={{ maxWidth: 480, margin: "0 auto" }}>
        <div
          style={{
            width: 80, height: 80, borderRadius: "50%", margin: "0 auto 20px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 36,
            background: pct >= 70 ? "rgba(16,185,129,0.12)" : "var(--accent-dim)",
            border: `2px solid ${pct >= 70 ? "rgba(16,185,129,0.3)" : "rgba(99,102,241,0.3)"}`,
          }}
        >
          {pct >= 70 ? "◈" : "▤"}
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", fontFamily: "var(--font-display)", marginBottom: 6 }}>
          Round Complete!
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 24 }}>
          You got through {words.length} cards
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
          <div style={{
            background: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.28)",
            borderRadius: 14, padding: "16px 12px", textAlign: "center",
          }}>
            <p style={{ fontSize: 32, fontWeight: 800, color: "var(--green)", fontFamily: "var(--font-mono)", letterSpacing: "-0.02em" }}>
              {knownCount}
            </p>
            <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>I knew it</p>
          </div>
          <div style={{
            background: "rgba(245,158,11,0.10)", border: "1px solid rgba(245,158,11,0.28)",
            borderRadius: 14, padding: "16px 12px", textAlign: "center",
          }}>
            <p style={{ fontSize: 32, fontWeight: 800, color: "var(--xp)", fontFamily: "var(--font-mono)", letterSpacing: "-0.02em" }}>
              {learnCount}
            </p>
            <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>Still learning</p>
          </div>
        </div>

        {xpEarned > 0 && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20,
            background: "var(--accent-dim)", border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: 999, padding: "6px 16px",
            fontSize: 14, fontWeight: 800, color: "var(--accent-2)",
          }}>
            ⚡ +{xpEarned} XP earned!
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => { setCurrent(0); setFlipped(false); setKnown([]); setLearning([]); setFinished(false); }}
            className="btn-primary"
            style={{ flex: 1 }}
          >
            Play again
          </button>
          <Link href="/games" className="btn-secondary" style={{ flex: 1, textAlign: "center" }}>
            Back to games
          </Link>
        </div>
      </div>
    );
  }

  // ── Game screen ─────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      {/* Progress bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div style={{ flex: 1, height: 6, background: "var(--surface-3)", borderRadius: 999, overflow: "hidden" }}>
          <div
            style={{
              height: "100%", borderRadius: 999, transition: "width 0.5s ease",
              background: "linear-gradient(90deg, var(--accent), var(--accent-2))",
              width: `${(current / words.length) * 100}%`,
            }}
          />
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-3)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>
          {current + 1}/{words.length}
        </span>
      </div>

      {/* Card — 3D flip */}
      <div
        style={{ perspective: "1200px", cursor: "pointer", marginBottom: 20 }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div
          style={{
            position: "relative", height: 240,
            transformStyle: "preserve-3d",
            transition: "transform 0.45s cubic-bezier(0.4, 0.2, 0.2, 1)",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front */}
          <div
            style={{
              position: "absolute", inset: 0,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              borderRadius: 20,
              background: "var(--surface-2)",
              border: "1px solid var(--border-md)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 10,
            }}
          >
            <p style={{ fontSize: 30, fontWeight: 800, color: "var(--text)", fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>
              {card.word}
            </p>
            <p style={{ fontSize: 13, color: "var(--text-3)" }}>Tap to reveal</p>
            <button
              onClick={(e) => { e.stopPropagation(); speakTarget(card.word, langConfig.code); }}
              style={{
                width: 34, height: 34, borderRadius: 9,
                background: "var(--accent-dim)", color: "var(--accent-2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "1px solid rgba(99,102,241,0.25)", cursor: "pointer", fontSize: 16,
              }}
            >
              ♪
            </button>
          </div>

          {/* Back */}
          <div
            style={{
              position: "absolute", inset: 0,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              borderRadius: 20,
              background: "linear-gradient(145deg, var(--surface-2), var(--surface-3))",
              border: "1px solid rgba(99,102,241,0.35)",
              boxShadow: "0 0 32px rgba(99,102,241,0.12)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              padding: "24px",
              gap: 8,
            }}
          >
            <p style={{ fontSize: 26, fontWeight: 800, color: "var(--accent-2)", fontFamily: "var(--font-display)", letterSpacing: "-0.02em", textAlign: "center" }}>
              {card.translation}
            </p>
            <p style={{ fontSize: 13, color: "var(--text-3)", fontStyle: "italic", textAlign: "center", lineHeight: 1.5 }}>
              &ldquo;{card.exampleFr}&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      {flipped && (
        <div style={{ display: "flex", gap: 10 }} className="animate-fade-up">
          <button
            onClick={() => next(false)}
            style={{
              flex: 1, padding: "14px 0", borderRadius: 14,
              background: "rgba(245,158,11,0.10)", border: "1px solid rgba(245,158,11,0.3)",
              color: "var(--xp)", fontWeight: 700, fontSize: 14, cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(245,158,11,0.18)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(245,158,11,0.10)"}
          >
            Still learning
          </button>
          <button
            onClick={() => next(true)}
            style={{
              flex: 1, padding: "14px 0", borderRadius: 14,
              background: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.3)",
              color: "var(--green)", fontWeight: 700, fontSize: 14, cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(16,185,129,0.18)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(16,185,129,0.10)"}
          >
            I knew it! ✓
          </button>
        </div>
      )}

      {!flipped && (
        <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-3)" }}>
          Click the card to see the answer
        </p>
      )}
    </div>
  );
}
