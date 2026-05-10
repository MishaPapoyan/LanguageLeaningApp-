"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { getLanguageConfig } from "@/data/language-config";
import Link from "next/link";
import { speak } from "@/lib/speech";

interface WordData {
  id: string;
  word: string;
  translation: string;
  definition: string;
  exampleFr: string;
  exampleEn: string;
  miniStory: string | null;
  category: string;
  difficulty: string;
  imageEmoji: string;
  isSaved: boolean;
  masteryLevel: number;
  quizAttempts: number;
  quizCorrect: number;
}

export function WordDetail({ word }: { word: WordData }) {
  const { data: session } = useSession();
  const langConfig = getLanguageConfig(session?.user?.targetLanguage ?? "fr");
  const [isSaved, setIsSaved] = useState(word.isSaved);
  const [saving, setSaving] = useState(false);

  const handleSpeak = (text: string, lang = "fr-FR") => {
    speak(text, { lang });
  };

  const toggleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/dictionary/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordId: word.id, remove: isSaved }),
      });
      setIsSaved((prev) => !prev);
    } finally {
      setSaving(false);
    }
  };

  const diffColor =
    word.difficulty === "beginner" ? "var(--green)" :
    word.difficulty === "intermediate" ? "var(--xp)" : "var(--red)";

  return (
    <div className="max-w-2xl mx-auto animate-fade-up">
      {/* Back + category */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <Link
          href="/dictionary"
          style={{
            width: 32, height: 32, borderRadius: 10,
            background: "var(--surface-2)", border: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--text-2)",
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <span style={{
          fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
          background: "var(--surface-2)", color: "var(--text-2)", border: "1px solid var(--border)",
          borderRadius: 999, padding: "3px 10px",
        }}>
          {word.category}
        </span>
        <span style={{
          fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
          borderRadius: 999, padding: "3px 10px",
          background: `${diffColor}18`, color: diffColor,
          border: `1px solid ${diffColor}40`,
        }}>
          {word.difficulty}
        </span>
      </div>

      {/* Main word card */}
      <div className="bento p-6 mb-4" style={{ border: "1px solid var(--border-md)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 68, height: 68, borderRadius: 18, flexShrink: 0,
              background: "var(--accent-dim)", border: "1px solid rgba(16,185,129,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36,
            }}>
              {word.imageEmoji}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 2 }}>
                <h1 style={{ fontSize: 30, fontWeight: 800, color: "var(--text)", fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>
                  {word.word}
                </h1>
                <button
                  onClick={() => handleSpeak(word.word)}
                  style={{
                    width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                    background: "var(--accent-dim)", color: "var(--accent-2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "1px solid rgba(16,185,129,0.25)", cursor: "pointer", fontSize: 14,
                  }}
                  title={`Listen (${langConfig.label})`}
                >
                  в™Є
                </button>
              </div>
              <p style={{ fontSize: 20, color: "var(--accent-2)", fontWeight: 700, marginBottom: 4 }}>
                {word.translation}
              </p>
              <button
                onClick={() => handleSpeak(word.translation, "en-US")}
                style={{ fontSize: 11, color: "var(--text-3)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                в™Є English pronunciation
              </button>
            </div>
          </div>

          <button
            onClick={toggleSave}
            disabled={saving}
            style={{
              fontSize: 12, padding: "7px 16px", borderRadius: 999, fontWeight: 700, flexShrink: 0,
              cursor: "pointer", transition: "all 0.15s",
              background: isSaved ? "var(--green-dim)" : "var(--surface-3)",
              color: isSaved ? "var(--green)" : "var(--text-2)",
              border: `1px solid ${isSaved ? "rgba(16,185,129,0.3)" : "var(--border-md)"}`,
            }}
          >
            {saving ? "..." : isSaved ? "вњ“ Saved" : "+ Save"}
          </button>
        </div>

        {/* Definition */}
        <div style={{
          background: "var(--surface-3)", borderRadius: 12, padding: "14px 16px",
          border: "1px solid var(--border)",
        }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
            Definition
          </p>
          <p style={{ fontSize: 14, color: "var(--text-1)", lineHeight: 1.6 }}>{word.definition}</p>
        </div>

        {/* Quiz stats вЂ” only for saved words with attempts */}
        {word.isSaved && word.quizAttempts > 0 && (
          <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 16, fontSize: 13 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ color: "var(--text-3)" }}>Quiz accuracy:</span>
              <span style={{ fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-mono)" }}>
                {Math.round((word.quizCorrect / word.quizAttempts) * 100)}%
              </span>
              <span style={{ color: "var(--text-3)" }}>({word.quizCorrect}/{word.quizAttempts})</span>
            </div>
            {/* Mastery dots */}
            <div style={{ display: "flex", gap: 3 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  style={{
                    width: 16, height: 16, borderRadius: 4,
                    background: n <= word.masteryLevel ? "var(--accent)" : "var(--surface-3)",
                    border: `1px solid ${n <= word.masteryLevel ? "rgba(16,185,129,0.4)" : "var(--border)"}`,
                    transition: "background 0.2s",
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {word.isSaved && word.quizAttempts === 0 && (
          <p style={{ marginTop: 10, fontSize: 12, color: "var(--text-3)" }}>
            Not reviewed yet вЂ”{" "}
            <a href="/review" style={{ color: "var(--accent-2)", textDecoration: "none" }}>
              Visit Review
            </a>{" "}
            to start practicing.
          </p>
        )}
      </div>

      {/* Examples */}
      <div className="bento p-6 mb-4" style={{ border: "1px solid var(--border)" }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-display)", marginBottom: 14 }}>
          Examples
        </h2>
        <div style={{
          background: "var(--accent-dim)", borderRadius: 14, padding: "16px 18px",
          border: "1px solid rgba(16,185,129,0.25)",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
            <p style={{ fontSize: 14, color: "var(--text-1)", fontStyle: "italic", lineHeight: 1.55 }}>
              &ldquo;{word.exampleFr}&rdquo;
            </p>
            <button
              onClick={() => handleSpeak(word.exampleFr)}
              style={{
                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                background: "rgba(0,0,0,0.2)", color: "var(--accent-2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "none", cursor: "pointer", fontSize: 14,
              }}
            >
              в™Є
            </button>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 6 }}>
            &ldquo;{word.exampleEn}&rdquo;
          </p>
        </div>
      </div>

      {/* Mini story */}
      {word.miniStory && (
        <div className="bento p-6 mb-4" style={{ border: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-display)", marginBottom: 14 }}>
            Mini Story
          </h2>
          <div style={{
            background: "rgba(245,158,11,0.08)", borderRadius: 14, padding: "16px 18px",
            border: "1px solid rgba(245,158,11,0.22)", position: "relative",
          }}>
            <button
              onClick={() => handleSpeak(word.miniStory!)}
              style={{
                float: "right",
                width: 30, height: 30, borderRadius: 8,
                background: "rgba(245,158,11,0.15)", color: "var(--xp)",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "1px solid rgba(245,158,11,0.25)", cursor: "pointer", fontSize: 14,
              }}
            >
              в™Є
            </button>
            <p style={{ fontSize: 14, color: "var(--text-1)", lineHeight: 1.65 }}>{word.miniStory}</p>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 10 }}>
        <Link href="/games/flashcards" className="btn-secondary" style={{ flex: 1, textAlign: "center", fontSize: 13 }}>
          Practice with flashcards
        </Link>
        <Link href="/games/matching" className="btn-secondary" style={{ flex: 1, textAlign: "center", fontSize: 13 }}>
          Play matching game
        </Link>
      </div>
    </div>
  );
}
