"use client";

import { useParams, useRouter } from "next/navigation";
import { getLessonById, getAllLessons } from "@/data/learning-path";
import { getLessonByIdEs, getAllLessonsEs } from "@/data/learning-path-es";
import { getLessonByIdEn, getAllLessonsEn } from "@/data/learning-path-en";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const targetLang = session?.user?.targetLanguage ?? "fr";
  const lesson = targetLang === "es" ? getLessonByIdEs(lessonId)
               : targetLang === "en" ? getLessonByIdEn(lessonId)
               : getLessonById(lessonId);
  const [phase, setPhase] = useState<"learn" | "practice" | "done">("learn");
  const [currentExercise, setCurrentExercise] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState<Record<number, boolean>>({});
  const [fillInput, setFillInput] = useState("");
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(`completedLessons_${targetLang}`);
    if (saved) setCompletedLessons(JSON.parse(saved));
  }, [targetLang]);

  if (!lesson) {
    return (
      <div className="max-w-3xl mx-auto" style={{ textAlign: "center", padding: "80px 0" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <span className="lv-stamp" style={{ color: "var(--rose)", transform: "rotate(-3deg)" }}>Not found</span>
        </div>
        <h1 className="serif-i" style={{ fontFamily: "var(--display)", fontSize: 40, lineHeight: 1.1, marginBottom: 20 }}>
          Lesson not found
        </h1>
        <Link href="/learn" className="lv-btn lv-btn--primary" style={{ display: "inline-flex" }}>Back to Learning Path</Link>
      </div>
    );
  }

  const exercises = lesson.exercises;
  const exercise = exercises[currentExercise];

  function normalize(s: string) {
    return s.toLowerCase().trim().replace(/^[¿¡]+/, "").replace(/[.!?,;¿¡]+$/, "").trim();
  }

  const handleAnswer = (answer: string) => {
    setAnswers({ ...answers, [currentExercise]: answer });
    setShowResult({ ...showResult, [currentExercise]: true });
    const isCorrect = normalize(answer) === normalize(exercise.answer);
    if (isCorrect) setScore((s) => s + 1);
  };

  const nextExercise = () => {
    setShowResult({ ...showResult, [currentExercise]: false });
    setFillInput("");
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
    } else {
      setPhase("done");
      const updated = [...new Set([...completedLessons, lesson.id])];
      setCompletedLessons(updated);
      localStorage.setItem(`completedLessons_${targetLang}`, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("lesson-completed"));
      fetch("/api/learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: lesson.id,
          score: score + (normalize(answers[currentExercise] ?? "") === normalize(exercise.answer) ? 1 : 0),
          totalQuestions: exercises.length,
        }),
      })
        .then((r) => r.json())
        .then((data) => { if (data.xpEarned) setXpEarned(data.xpEarned); })
        .catch(() => {});
    }
  };

  const getNextLesson = () => {
    const all = targetLang === "es" ? getAllLessonsEs()
              : targetLang === "en" ? getAllLessonsEn()
              : getAllLessons();
    const idx = all.findIndex((l) => l.id === lesson.id);
    return idx < all.length - 1 ? all[idx + 1] : null;
  };

  // ── LEARN PHASE ──────────────────────────────────────────────────────────────
  if (phase === "learn") {
    return (
      <div className="max-w-3xl mx-auto lv-fade-up">
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
          <Link href="/learn" className="lv-btn lv-btn--ghost lv-btn--icon" aria-label="Back to Learning Path">
            <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>§ {lesson.topicTitle}</p>
        </div>
        <h1
          className="serif-i"
          style={{ fontFamily: "var(--display)", fontSize: 56, lineHeight: 1.05, letterSpacing: "-0.02em", margin: "12px 0 36px" }}
        >
          {lesson.title}
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {lesson.content.map((section, i) => (
            <div key={i} className="lv-card" style={{ padding: "24px 26px" }}>
              <h2 className="serif-i" style={{ fontFamily: "var(--display)", fontSize: 26, marginBottom: 10, lineHeight: 1.15 }}>{section.heading}</h2>
              <p style={{ fontSize: 15, color: "var(--ink-2)", lineHeight: 1.7, marginBottom: 16 }}>{section.body}</p>

              {section.table && (
                <div style={{ overflowX: "auto", marginBottom: 16 }}>
                  <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--line)" }}>
                        {section.table.columns.map((col, j) => (
                          <th key={j} className="mono" style={{
                            textAlign: "left", paddingBottom: 8, paddingLeft: 8,
                            fontSize: 10, color: "var(--ink-3)",
                          }}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.rows.map((row, j) => (
                        <tr key={j} style={{ borderBottom: "1px solid var(--line)" }}>
                          {row.map((cell, k) => (
                            <td key={k} style={{
                              padding: "9px 8px",
                              color: k === 0 ? "var(--terracotta)" : "var(--ink-2)",
                              fontWeight: k === 0 ? 700 : 400,
                            }}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {section.examples && section.examples.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                  {section.examples.map((ex, j) => (
                    <div key={j} className="lv-card lv-card--paper2" style={{
                      display: "flex", gap: 12, alignItems: "baseline",
                      padding: "10px 16px",
                    }}>
                      <span style={{ fontWeight: 700, color: "var(--terracotta)", fontSize: 14 }}>{ex.fr}</span>
                      <span style={{ color: "var(--ink-3)", fontSize: 14 }}>— {ex.en}</span>
                    </div>
                  ))}
                </div>
              )}

              {section.tip && (
                <div className="lv-card lv-card--paper2" style={{ padding: "12px 16px", marginTop: 12, borderColor: "var(--terracotta)" }}>
                  <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.6 }}>
                    <span className="mono" style={{ fontWeight: 700, color: "var(--terracotta)" }}>Tip: </span>{section.tip}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => { setPhase("practice"); setCurrentExercise(0); setAnswers({}); setShowResult({}); setScore(0); }}
          className="lv-btn lv-btn--primary lv-btn--lg"
          style={{ marginTop: 28, width: "100%", justifyContent: "center" }}
        >
          Practice What You Learned ({exercises.length} questions)
          <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  }

  // ── PRACTICE PHASE ───────────────────────────────────────────────────────────
  if (phase === "practice" && exercise) {
    const answered = showResult[currentExercise];
    const userAnswer = answers[currentExercise];
    const isCorrect = normalize(userAnswer ?? "") === normalize(exercise.answer);

    return (
      <div className="max-w-2xl mx-auto lv-fade-up">
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <Link href="/learn" className="lv-btn lv-btn--ghost lv-btn--icon" aria-label="Exit lesson">
              <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Link>
            <span className="mono" style={{ fontSize: 12, color: "var(--ink-3)" }}>
              {currentExercise + 1} / {exercises.length}
            </span>
          </div>
          <div className="lv-progress lv-progress--terra">
            <span style={{ width: `${((currentExercise + 1) / exercises.length) * 100}%` }} />
          </div>
        </div>

        <div className="lv-card" style={{ padding: "26px 28px" }}>
          <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 8 }}>
            {exercise.type === "multiple-choice" ? "Multiple choice" : exercise.type === "translate" ? "Translate" : "Fill the blank"}
          </p>
          <h2 className="serif-i" style={{ fontFamily: "var(--display)", fontSize: 32, lineHeight: 1.1, marginBottom: 24 }}>{exercise.question}</h2>

          {/* Multiple choice */}
          {exercise.type === "multiple-choice" && exercise.options && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {exercise.options.map((opt, oi) => {
                const selected = userAnswer === opt;
                const correct = opt === exercise.answer;

                let bg = "var(--paper)";
                let border = "var(--line-2)";
                let color = "var(--ink)";

                if (answered && correct)       { bg = "var(--success-soft)"; border = "var(--success)"; color = "var(--success)"; }
                else if (answered && selected) { bg = "var(--rose-soft)";    border = "var(--rose)";    color = "var(--rose)"; }

                return (
                  <button
                    key={opt}
                    onClick={() => !answered && handleAnswer(opt)}
                    disabled={!!answered}
                    className="lv-card lv-card--hover"
                    style={{
                      width: "100%", textAlign: "left", padding: "16px 18px",
                      border: `1.5px solid ${border}`,
                      background: bg, color, fontSize: 16, fontWeight: 500,
                      display: "flex", alignItems: "center", gap: 14,
                      cursor: answered ? "default" : "pointer",
                    }}
                  >
                    <span className="mono" style={{
                      width: 28, height: 28, borderRadius: "var(--r-sm)",
                      background: "var(--paper-2)", color: "var(--ink-3)",
                      display: "grid", placeItems: "center", fontSize: 11, flexShrink: 0,
                    }}>{oi + 1}</span>
                    <span style={{ flex: 1 }}>{opt}</span>
                    {answered && correct && " ✓"}
                    {answered && selected && !correct && " ✗"}
                  </button>
                );
              })}
            </div>
          )}

          {/* Fill in the blank / translate */}
          {(exercise.type === "fill-blank" || exercise.type === "translate") && (
            <div>
              {exercise.hint && !answered && (
                <p className="mono" style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 12 }}>Hint: {exercise.hint}</p>
              )}
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  type="text"
                  value={fillInput}
                  onChange={(e) => setFillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && fillInput.trim() && !answered) handleAnswer(fillInput); }}
                  placeholder="Type your answer..."
                  className="input flex-1"
                  style={{
                    flex: 1, padding: "14px 16px", fontSize: 16,
                    borderRadius: "var(--r-md)", border: "1.5px solid var(--line-2)",
                    background: "var(--paper)", color: "var(--ink)",
                  }}
                  disabled={!!answered}
                  autoFocus
                />
                {!answered && (
                  <button
                    onClick={() => fillInput.trim() && handleAnswer(fillInput)}
                    disabled={!fillInput.trim()}
                    className="lv-btn lv-btn--primary"
                  >
                    Check
                  </button>
                )}
              </div>
              {answered && (
                <div
                  className="lv-card"
                  style={{
                    marginTop: 14, padding: "12px 16px", fontSize: 14,
                    background: isCorrect ? "var(--success-soft)" : "var(--rose-soft)",
                    border: `1.5px solid ${isCorrect ? "var(--success)" : "var(--rose)"}`,
                    color: isCorrect ? "var(--success)" : "var(--rose)",
                  }}
                >
                  {isCorrect ? (
                    <span>Correct! ✓</span>
                  ) : (
                    <span>The answer is: <strong>{exercise.answer}</strong></span>
                  )}
                </div>
              )}
            </div>
          )}

          {answered && (
            <button onClick={nextExercise} className="lv-btn lv-btn--primary lv-btn--lg" style={{ marginTop: 22, width: "100%", justifyContent: "center" }}>
              {currentExercise < exercises.length - 1 ? "Next Question" : "See Results"}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── DONE PHASE ───────────────────────────────────────────────────────────────
  const pct = Math.round((score / exercises.length) * 100);
  const nextLesson = getNextLesson();
  const pctColor = pct >= 80 ? "var(--success)" : pct >= 50 ? "var(--terracotta)" : "var(--rose)";

  return (
    <div className="max-w-2xl mx-auto lv-fade-up" style={{ textAlign: "center" }}>
      <div className="lv-card" style={{ padding: "48px 36px" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <span className="lv-stamp" style={{ color: "oklch(0.55 0.18 130)", transform: "rotate(-3deg)" }}>Lesson complete</span>
        </div>
        <div style={{ fontSize: 60, lineHeight: 1, marginBottom: 8 }}>
          {pct >= 80 ? "◈" : pct >= 50 ? "▤" : "△"}
        </div>
        <h1
          className="serif-i"
          style={{ fontFamily: "var(--display)", fontSize: 56, lineHeight: 1, letterSpacing: "-0.02em", margin: "16px 0 8px" }}
        >
          <em style={{ color: "var(--terracotta)" }}>¡Bien hecho!</em>
        </h1>
        <p style={{ fontSize: 15, color: "var(--ink-3)", marginBottom: 32 }}>{lesson.title}</p>

        <div
          className="lv-card lv-card--paper2"
          style={{
            display: "inline-flex", alignItems: "center", gap: 28,
            padding: "20px 32px", marginBottom: 32,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <p className="serif-i" style={{ fontFamily: "var(--display)", fontSize: 40, color: "var(--terracotta)", lineHeight: 1 }}>
              {score}/{exercises.length}
            </p>
            <p className="mono" style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 6 }}>Correct</p>
          </div>
          <div style={{ width: 1, height: 44, background: "var(--line-2)" }} />
          <div style={{ textAlign: "center" }}>
            <p className="serif-i" style={{ fontFamily: "var(--display)", fontSize: 40, color: pctColor, lineHeight: 1 }}>
              {pct}%
            </p>
            <p className="mono" style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 6 }}>Score</p>
          </div>
          {xpEarned > 0 && (
            <>
              <div style={{ width: 1, height: 44, background: "var(--line-2)" }} />
              <div style={{ textAlign: "center" }}>
                <p className="serif-i" style={{ fontFamily: "var(--display)", fontSize: 40, color: "var(--marine)", lineHeight: 1 }}>
                  +{xpEarned}
                </p>
                <p className="mono" style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 6 }}>XP Earned</p>
              </div>
            </>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 300, margin: "0 auto" }}>
          {pct < 80 && (
            <button
              onClick={() => { setPhase("learn"); setCurrentExercise(0); setAnswers({}); setShowResult({}); setScore(0); setFillInput(""); }}
              className="lv-btn lv-btn--ghost"
              style={{ width: "100%", justifyContent: "center" }}
            >
              Review Lesson
            </button>
          )}
          {nextLesson && (
            <Link href={`/learn/${nextLesson.id}`} className="lv-btn lv-btn--primary" style={{ width: "100%", justifyContent: "center" }}>
              Next: {nextLesson.title}
            </Link>
          )}
          <Link href="/learn" className="lv-btn lv-btn--ghost" style={{ width: "100%", justifyContent: "center" }}>
            Back to Learning Path
          </Link>
        </div>
      </div>
    </div>
  );
}
