"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { getLanguageConfig } from "@/data/language-config";
import Link from "next/link";
import { speakTarget } from "@/lib/speech";

interface Word { id: string; word: string; translation: string; imageEmoji: string; definition: string; }

const PALACE_OBJECTS = [
  { id: "table", label: "table", emoji: "🪑", x: 20, y: 60 },
  { id: "coffee", label: "coffee", emoji: "☕", x: 50, y: 30 },
  { id: "bread", label: "bread", emoji: "🥖", x: 75, y: 55 },
  { id: "window", label: "window", emoji: "🪟", x: 35, y: 15 },
  { id: "menu", label: "menu", emoji: "📋", x: 65, y: 20 },
  { id: "cheese", label: "cheese", emoji: "🧀", x: 15, y: 35 },
  { id: "wine", label: "wine", emoji: "🍷", x: 82, y: 75 },
  { id: "flower", label: "flower", emoji: "🌸", x: 50, y: 75 },
];

export function MemoryPalace({ words }: { words: Word[] }) {
  const { data: session } = useSession();
  const langConfig = getLanguageConfig(session?.user?.targetLanguage ?? "fr");
  const [activeObj, setActiveObj] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [quizMode, setQuizMode] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  const assignments: Record<string, Word> = {};
  const usedWords = words.slice(0, PALACE_OBJECTS.length);
  PALACE_OBJECTS.forEach((obj, i) => {
    if (usedWords[i]) assignments[obj.id] = usedWords[i];
  });

  const handleReveal = (objId: string) => {
    setActiveObj(objId);
    const newRevealed = new Set(revealed).add(objId);
    setRevealed(newRevealed);
    const word = assignments[objId];
    if (word) speakTarget(word.word, langConfig.code);
  };

  const handleStartQuiz = () => {
    setActiveObj(null);
    setQuizMode(true);
  };

  const handleSubmitQuiz = async () => {
    let correct = 0;
    for (const [objId, answer] of Object.entries(quizAnswers)) {
      const word = assignments[objId];
      if (word && answer.toLowerCase().trim() === word.word.toLowerCase()) {
        correct++;
      }
    }
    const score = Math.round((correct / usedWords.length) * 100);
    setQuizSubmitted(true);

    try {
      const res = await fetch("/api/games/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameType: "MEMORY_PALACE", score, wordsUsed: usedWords.map((w) => w.id) }),
      });
      const data = await res.json();
      setXpEarned(data.xpEarned ?? 10);
      window.dispatchEvent(new CustomEvent("xp-updated"));
    } catch {}
  };

  return (
    <div>
      {!quizMode ? (
        <>
          {/* Palace view */}
          <div
            style={{
              position: "relative", width: "100%", height: 350,
              borderRadius: 20, overflow: "hidden", marginBottom: 20,
              background: "radial-gradient(ellipse at top, var(--surface-3) 0%, var(--surface) 80%)",
              border: "1px solid var(--border-md)",
            }}
          >
            {/* Faint background label */}
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "flex-end", justifyContent: "center",
              paddingBottom: 16, pointerEvents: "none",
            }}>
              <p style={{ fontSize: 80, fontWeight: 800, color: "var(--text)", opacity: 0.04, fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}>
                Café
              </p>
            </div>

            {/* Grid overlay */}
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              backgroundImage: "linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }} />

            {PALACE_OBJECTS.map((obj) => {
              const word = assignments[obj.id];
              const isRevealed = revealed.has(obj.id);
              const isActive = activeObj === obj.id;

              return (
                <button
                  key={obj.id}
                  onClick={() => handleReveal(obj.id)}
                  style={{
                    position: "absolute", left: `${obj.x}%`, top: `${obj.y}%`,
                    transform: `translate(-50%, -50%) scale(${isActive ? 1.25 : 1})`,
                    display: "flex", flexDirection: "column", alignItems: "center",
                    background: "none", border: "none", cursor: "pointer",
                    transition: "transform 0.2s",
                    zIndex: isActive ? 10 : 1,
                  }}
                >
                  <span style={{ fontSize: 28 }}>{obj.emoji}</span>
                  {isRevealed && word ? (
                    <span style={{
                      background: "var(--surface-2)", border: "1px solid rgba(99,102,241,0.35)",
                      color: "var(--accent-2)", fontSize: 11, fontWeight: 700,
                      padding: "2px 8px", borderRadius: 8, marginTop: 4,
                      whiteSpace: "nowrap", boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                    }}>
                      {word.word}
                    </span>
                  ) : (
                    <span style={{
                      background: "var(--surface-3)", color: "var(--text-3)",
                      fontSize: 11, padding: "2px 8px", borderRadius: 8, marginTop: 4,
                    }}>?</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Word popup */}
          {activeObj && assignments[activeObj] && (
            <div
              className="animate-fade-up"
              style={{
                borderRadius: 16, padding: "16px 18px", marginBottom: 16,
                background: "var(--surface-2)", border: "1px solid rgba(99,102,241,0.35)",
                boxShadow: "0 0 24px rgba(99,102,241,0.12)",
              }}
            >
              <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                You clicked on:
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 24 }}>{assignments[activeObj].imageEmoji}</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", fontFamily: "var(--font-display)" }}>
                  {assignments[activeObj].word}
                </span>
                <button
                  onClick={() => speakTarget(assignments[activeObj].word, langConfig.code)}
                  style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: "var(--accent-dim)", color: "var(--accent-2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "1px solid rgba(99,102,241,0.25)", cursor: "pointer", fontSize: 14,
                  }}
                >
                  ♪
                </button>
              </div>
              <p style={{ fontSize: 14, color: "var(--accent-2)", fontWeight: 600, marginTop: 4 }}>
                {assignments[activeObj].translation}
              </p>
              <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 3 }}>
                {assignments[activeObj].definition}
              </p>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 600 }}>
              {revealed.size}/{usedWords.length} explored
            </p>
            <button
              onClick={handleStartQuiz}
              disabled={revealed.size < 3}
              className="btn-primary"
            >
              Test Yourself
            </button>
          </div>
        </>
      ) : !quizSubmitted ? (
        <div className="space-y-4 animate-fade-up">
          <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 16 }}>
            What {langConfig.label} word goes with each object in the café?
          </p>
          {PALACE_OBJECTS.filter((obj) => assignments[obj.id]).map((obj) => {
            const word = assignments[obj.id];
            return (
              <div key={obj.id} style={{
                borderRadius: 14, padding: "14px 16px",
                background: "var(--surface-2)", border: "1px solid var(--border)",
                display: "flex", alignItems: "center", gap: 14,
              }}>
                <span style={{ fontSize: 28 }}>{obj.emoji}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 6 }}>{word.translation}</p>
                  <input
                    type="text"
                    value={quizAnswers[obj.id] ?? ""}
                    onChange={(e) => setQuizAnswers((prev) => ({ ...prev, [obj.id]: e.target.value }))}
                    className="input"
                    placeholder={`Type the ${langConfig.label} word…`}
                  />
                </div>
              </div>
            );
          })}
          <button onClick={handleSubmitQuiz} className="btn-primary w-full" style={{ padding: "13px" }}>
            Check my answers
          </button>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-up">
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", fontFamily: "var(--font-display)" }}>
            Results
          </h2>
          {PALACE_OBJECTS.filter((obj) => assignments[obj.id]).map((obj) => {
            const word = assignments[obj.id];
            const answer = quizAnswers[obj.id] ?? "";
            const correct = answer.toLowerCase().trim() === word.word.toLowerCase();
            return (
              <div
                key={obj.id}
                style={{
                  borderRadius: 14, padding: "14px 16px",
                  background: correct ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
                  border: `1px solid ${correct ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                  display: "flex", alignItems: "center", gap: 14,
                }}
              >
                <span style={{ fontSize: 28 }}>{obj.emoji}</span>
                <div>
                  <p style={{ fontSize: 12, color: "var(--text-3)" }}>{word.translation}</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: correct ? "var(--green)" : "var(--red)" }}>
                    {answer || "(blank)"} {correct ? "✓" : "✗"}
                  </p>
                  {!correct && (
                    <p style={{ fontSize: 12, color: "var(--text-2)", marginTop: 2 }}>
                      Correct: <span style={{ color: "var(--green)", fontWeight: 600 }}>{word.word}</span>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
          {xpEarned > 0 && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "var(--accent-dim)", border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: 999, padding: "6px 16px",
              fontSize: 14, fontWeight: 800, color: "var(--accent-2)",
            }}>
              ⚡ +{xpEarned} XP earned!
            </div>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => { setQuizMode(false); setQuizAnswers({}); setQuizSubmitted(false); setRevealed(new Set()); setActiveObj(null); }}
              className="btn-primary"
              style={{ flex: 1 }}
            >
              Try again
            </button>
            <Link href="/games" className="btn-secondary" style={{ flex: 1, textAlign: "center" }}>
              Back
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
