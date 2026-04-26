"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { RotateCcw, ChevronLeft, Volume2, BookOpen } from "lucide-react";
import { speak } from "@/lib/speech";
import { useSession } from "next-auth/react";
import { getLanguageConfig } from "@/data/language-config";
import { t, getLocale } from "@/lib/i18n";

interface ReviewWord {
  id: string;
  word: string;
  translation: string;
  imageEmoji: string;
  nextReview: number;
  interval: number;
  ease: number;
  repetitions: number;
}

function calculateNext(word: ReviewWord, quality: number): ReviewWord {
  let { interval, ease, repetitions } = word;
  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 3;
    else interval = Math.round(interval * ease);
    repetitions++;
    ease = Math.max(1.3, ease + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  }
  return { ...word, interval, ease, repetitions, nextReview: Date.now() + interval * 86_400_000 };
}

const RATING_KEYS = [
  { q: 0, key: "review_forgot" as const, color: "var(--red)",   bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.35)" },
  { q: 3, key: "review_hard" as const,   color: "var(--gold)",  bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.35)" },
  { q: 4, key: "review_good" as const,   color: "var(--blue)",  bg: "rgba(96,165,250,0.1)",  border: "rgba(96,165,250,0.35)" },
  { q: 5, key: "review_easy" as const,   color: "var(--green)", bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.35)" },
];

export default function ReviewPage() {
  const { data: session } = useSession();
  const locale = getLocale((session?.user as any)?.nativeLanguage);
  const langConfig = getLanguageConfig(session?.user?.targetLanguage ?? "fr");

  const [dueWords, setDueWords]       = useState<ReviewWord[]>([]);
  const [current, setCurrent]         = useState(0);
  const [flipped, setFlipped]         = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [loading, setLoading]         = useState(true);
  const [reviewed, setReviewed]       = useState(0);
  const [correct, setCorrect]         = useState(0);

  useEffect(() => {
    fetch("/api/review/words")
      .then((r) => r.json())
      .then((data) => {
        const words: ReviewWord[] = data.words ?? [];
        setDueWords(words);
        if (words.length === 0) setSessionDone(true);
      })
      .catch(() => setSessionDone(true))
      .finally(() => setLoading(false));
  }, []);

  const handleRate = async (quality: number) => {
    const word = dueWords[current];
    const updated = calculateNext(word, quality);
    if (quality >= 3) setCorrect((c) => c + 1);
    setReviewed((r) => r + 1);

    // Persist SM-2 state to DB (fire-and-forget; UI doesn't wait)
    fetch("/api/review/rate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wordId: updated.id,
        quality,
        interval: updated.interval,
        ease: updated.ease,
        repetitions: updated.repetitions,
        nextReview: updated.nextReview,
      }),
    }).catch(() => {/* silent — don't block the UI */});

    setFlipped(false);
    if (current < dueWords.length - 1) setCurrent(current + 1);
    else setSessionDone(true);
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ maxWidth: 520, margin: "0 auto", paddingTop: 80, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
        <p style={{ color: "var(--text-3)", fontSize: 14 }}>{t(locale, "review_loading")}</p>
      </div>
    );
  }

  // ── Done / empty state ──────────────────────────────────────────────────────
  if (sessionDone) {
    const acc = reviewed > 0 ? Math.round((correct / reviewed) * 100) : 0;
    return (
      <div style={{ maxWidth: 520, margin: "0 auto", paddingTop: 48, textAlign: "center" }}>
        <div className="card" style={{ padding: "52px 32px" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>{reviewed > 0 ? "🎯" : "✨"}</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "var(--text)", margin: "0 0 10px" }}>
            {reviewed > 0 ? t(locale, "review_sessionComplete") : t(locale, "review_allCaughtUp")}
          </h2>

          {reviewed > 0 ? (
            <>
              <p style={{ fontSize: 14, color: "var(--text-3)", margin: "0 0 28px" }}>
                {t(locale, "review_statsLine", { n: reviewed.toString(), correct: correct.toString(), pct: acc.toString() })}
              </p>
              <div style={{ height: 8, background: "var(--surface-3)", borderRadius: 999, overflow: "hidden", marginBottom: 28 }}>
                <div style={{
                  height: "100%", width: `${acc}%`,
                  background: acc >= 70 ? "var(--green)" : acc >= 40 ? "var(--gold)" : "var(--red)",
                  borderRadius: 999, transition: "width 0.8s ease",
                }} />
              </div>
            </>
          ) : (
            <>
              <p style={{ fontSize: 14, color: "var(--text-3)", margin: "0 0 12px" }}>
                {t(locale, "review_spacedDesc1")}
              </p>
              <p style={{ fontSize: 13, color: "var(--text-3)", margin: "0 0 28px" }}>
                {t(locale, "review_spacedDesc2")}
              </p>
            </>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link href="/learn" className="btn-primary" style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 8, padding: "13px 0", fontSize: 14, fontWeight: 700, textDecoration: "none",
            }}>
              <BookOpen size={15} /> {t(locale, "review_continueLearning")}
            </Link>
            <Link href="/home" style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "12px 0", fontSize: 14, color: "var(--text-3)",
              textDecoration: "none", borderRadius: 12,
              border: "1px solid var(--border)",
              transition: "background 0.15s",
            }}>
              {t(locale, "review_backToHome")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const word = dueWords[current];
  if (!word) return null;

  const progress = ((current + 1) / dueWords.length) * 100;

  return (
    <div style={{ maxWidth: 580, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <RotateCcw size={15} color="#fff" />
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", margin: 0 }}>{t(locale, "review_practiceTitle")}</p>
            <p style={{ fontSize: 11, color: "var(--text-3)", margin: 0 }}>{t(locale, "review_wordsDue", { n: dueWords.length.toString() })}</p>
          </div>
        </div>
        <span style={{
          fontSize: 13, fontWeight: 700, color: "var(--text-2)",
          background: "var(--surface-2)", border: "1px solid var(--border)",
          borderRadius: 99, padding: "4px 12px",
        }}>
          {current + 1} / {dueWords.length}
        </span>
      </div>

      {/* Progress */}
      <div style={{ height: 6, background: "var(--surface-3)", borderRadius: 999, overflow: "hidden", marginBottom: 24 }}>
        <div style={{
          height: "100%", width: `${progress}%`,
          background: "linear-gradient(90deg, var(--accent), var(--accent-2))",
          borderRadius: 999, transition: "width 0.4s ease",
        }} />
      </div>

      {/* Flashcard */}
      <div
        onClick={() => !flipped && setFlipped(true)}
        style={{
          borderRadius: 22, minHeight: 320,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          cursor: flipped ? "default" : "pointer",
          padding: "40px 32px",
          border: "1px solid var(--border-md)",
          background: flipped
            ? "var(--surface-2)"
            : "linear-gradient(145deg, var(--surface-2), var(--surface))",
          transition: "background 0.25s ease",
          textAlign: "center",
          userSelect: "none",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          marginBottom: 16,
          position: "relative",
        }}
      >
        <div style={{
          position: "absolute", top: 16, left: 20,
          fontSize: 10, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.1em", color: "var(--text-3)",
          background: "var(--surface-3)", borderRadius: 99, padding: "3px 10px",
        }}>
          {langConfig.flag} {langConfig.label}
        </div>

        <div style={{ fontSize: 64, marginBottom: 16 }}>{word.imageEmoji}</div>
        <p style={{ fontSize: 38, fontWeight: 900, color: "var(--text)", margin: "0 0 8px", lineHeight: 1.1 }}>
          {word.word}
        </p>

        {!flipped ? (
          <p style={{ fontSize: 13, color: "var(--accent)", marginTop: 16, fontWeight: 600 }}>
            {t(locale, "review_tapToReveal")}
          </p>
        ) : (
          <>
            <div style={{ width: 48, height: 2, background: "var(--border-md)", borderRadius: 999, margin: "12px 0" }} />
            <p style={{ fontSize: 26, fontWeight: 800, color: "var(--accent)", margin: "0 0 16px" }}>
              {word.translation}
            </p>
            <button
              onClick={(e) => { e.stopPropagation(); speak(word.word, { lang: langConfig.ttsLocale }); }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "7px 16px", borderRadius: 99,
                background: "var(--accent-dim)", border: "1px solid rgba(99,102,241,0.25)",
                color: "var(--accent)", fontSize: 12, fontWeight: 700, cursor: "pointer",
              }}
            >
              <Volume2 size={13} /> {t(locale, "review_listen")}
            </button>
          </>
        )}
      </div>

      {/* Rating buttons — only when flipped */}
      {flipped && (
        <>
          <p style={{ fontSize: 12, textAlign: "center", color: "var(--text-3)", marginBottom: 10 }}>
            {t(locale, "review_howWell")}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {RATING_KEYS.map((r) => (
              <button
                key={r.q}
                onClick={() => handleRate(r.q)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  padding: "14px 8px", borderRadius: 14,
                  background: r.bg, border: `1.5px solid ${r.border}`,
                  color: r.color, cursor: "pointer", fontWeight: 700,
                  transition: "opacity 0.15s",
                }}
              >
                <span style={{ fontSize: 22 }}>
                  {r.q === 0 ? "😵" : r.q === 3 ? "😬" : r.q === 4 ? "😊" : "🤩"}
                </span>
                <span style={{ fontSize: 11 }}>{t(locale, r.key)}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Stats row */}
      {reviewed > 0 && (
        <div style={{
          marginTop: 20, padding: "12px 16px", borderRadius: 14,
          background: "var(--surface-2)", border: "1px solid var(--border)",
          display: "flex", alignItems: "center", gap: 16, fontSize: 13,
        }}>
          <span style={{ color: "var(--text-3)" }}>{t(locale, "review_session")}</span>
          <span style={{ color: "var(--green)", fontWeight: 700 }}>✓ {t(locale, "review_correctCount", { n: correct.toString() })}</span>
          <span style={{ color: "var(--red)", fontWeight: 700 }}>✗ {t(locale, "review_missedCount", { n: (reviewed - correct).toString() })}</span>
          <span style={{ marginLeft: "auto", color: "var(--text-3)", fontWeight: 600 }}>
            {t(locale, "review_accuracyPct", { pct: Math.round((correct / reviewed) * 100).toString() })}
          </span>
        </div>
      )}
    </div>
  );
}
