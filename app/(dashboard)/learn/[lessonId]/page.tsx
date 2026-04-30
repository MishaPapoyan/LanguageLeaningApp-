"use client";

import { useParams, useRouter } from "next/navigation";
import { getLessonById, getAllLessons } from "@/data/learning-path";
import { getLessonByIdEs, getAllLessonsEs } from "@/data/learning-path-es";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const targetLang = session?.user?.targetLanguage ?? "fr";
  const lesson = targetLang === "es" ? getLessonByIdEs(lessonId) : getLessonById(lessonId);
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
      <div className="max-w-3xl text-center py-20">
        <p style={{ fontSize: 24, marginBottom: 12, color: "var(--text-3)" }}>◈</p>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-display)" }}>Lesson not found</h1>
        <Link href="/learn" className="btn-primary mt-4 inline-flex">Back to Learning Path</Link>
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
    const all = targetLang === "es" ? getAllLessonsEs() : getAllLessons();
    const idx = all.findIndex((l) => l.id === lesson.id);
    return idx < all.length - 1 ? all[idx + 1] : null;
  };

  // ── LEARN PHASE ──────────────────────────────────────────────────────────────
  if (phase === "learn") {
    return (
      <div className="max-w-3xl">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <Link href="/learn" style={{
            width: 32, height: 32, borderRadius: 10, flexShrink: 0,
            background: "var(--surface-2)", border: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--text-2)",
          }}>
            <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <p style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>{lesson.topicTitle}</p>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>{lesson.title}</h1>
          </div>
        </div>

        <div className="space-y-5">
          {lesson.content.map((section, i) => (
            <div key={i} style={{ background: "var(--surface-2)", borderRadius: 18, border: "1px solid var(--border-md)", padding: "22px 24px" }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-display)", marginBottom: 8 }}>{section.heading}</h2>
              <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.7, marginBottom: 16 }}>{section.body}</p>

              {section.table && (
                <div style={{ overflowX: "auto", marginBottom: 16 }}>
                  <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border)" }}>
                        {section.table.columns.map((col, j) => (
                          <th key={j} style={{
                            textAlign: "left", paddingBottom: 8, paddingLeft: 8,
                            fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                            letterSpacing: "0.07em", color: "var(--text-3)",
                          }}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.rows.map((row, j) => (
                        <tr key={j} style={{ borderBottom: "1px solid var(--border)" }}>
                          {row.map((cell, k) => (
                            <td key={k} style={{
                              padding: "9px 8px",
                              color: k === 0 ? "var(--accent-2)" : "var(--text-2)",
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
                    <div key={j} style={{
                      display: "flex", gap: 12, alignItems: "baseline",
                      background: "var(--accent-dim)", borderRadius: 10,
                      padding: "9px 14px", border: "1px solid rgba(99,102,241,0.2)",
                    }}>
                      <span style={{ fontWeight: 700, color: "var(--accent-2)", fontSize: 13 }}>{ex.fr}</span>
                      <span style={{ color: "var(--text-3)", fontSize: 13 }}>— {ex.en}</span>
                    </div>
                  ))}
                </div>
              )}

              {section.tip && (
                <div style={{
                  background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.22)",
                  borderRadius: 12, padding: "12px 14px", marginTop: 12,
                }}>
                  <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>
                    <span style={{ fontWeight: 700, color: "rgba(245,158,11,0.9)" }}>Tip: </span>{section.tip}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => { setPhase("practice"); setCurrentExercise(0); setAnswers({}); setShowResult({}); setScore(0); }}
          className="btn-primary w-full"
          style={{ marginTop: 24, padding: "14px" }}
        >
          Practice What You Learned ({exercises.length} questions)
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
      <div className="max-w-2xl">
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <Link href="/learn" style={{
              width: 32, height: 32, borderRadius: 10,
              background: "var(--surface-2)", border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--text-2)",
            }}>
              <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Link>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
              {currentExercise + 1} / {exercises.length}
            </span>
          </div>
          <div style={{ height: 6, background: "var(--surface-3)", borderRadius: 999, overflow: "hidden" }}>
            <div
              style={{
                height: "100%", borderRadius: 999, transition: "width 0.5s ease",
                background: "linear-gradient(90deg, var(--accent), var(--accent-2))",
                width: `${((currentExercise + 1) / exercises.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <div style={{ background: "var(--surface-2)", borderRadius: 18, border: "1px solid var(--border-md)", padding: "22px 24px" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-display)", marginBottom: 20 }}>{exercise.question}</h2>

          {/* Multiple choice */}
          {exercise.type === "multiple-choice" && exercise.options && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {exercise.options.map((opt) => {
                const selected = userAnswer === opt;
                const correct = opt === exercise.answer;

                let bg = "var(--surface-3)";
                let border = "var(--border)";
                let color = "var(--text-2)";

                if (answered && correct)            { bg = "rgba(16,185,129,0.10)"; border = "rgba(16,185,129,0.4)"; color = "var(--green)"; }
                else if (answered && selected)      { bg = "rgba(239,68,68,0.10)";  border = "rgba(239,68,68,0.4)";  color = "var(--red)"; }

                return (
                  <button
                    key={opt}
                    onClick={() => !answered && handleAnswer(opt)}
                    disabled={!!answered}
                    style={{
                      width: "100%", textAlign: "left", padding: "12px 16px",
                      borderRadius: 12, border: `1px solid ${border}`,
                      background: bg, color, fontSize: 13, fontWeight: 500,
                      cursor: answered ? "default" : "pointer", transition: "all 0.12s",
                    }}
                  >
                    {opt}
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
                <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 10 }}>Hint: {exercise.hint}</p>
              )}
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  type="text"
                  value={fillInput}
                  onChange={(e) => setFillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && fillInput.trim() && !answered) handleAnswer(fillInput); }}
                  placeholder="Type your answer..."
                  className="input flex-1"
                  disabled={!!answered}
                  autoFocus
                />
                {!answered && (
                  <button
                    onClick={() => fillInput.trim() && handleAnswer(fillInput)}
                    disabled={!fillInput.trim()}
                    className="btn-primary"
                    style={{ padding: "0 20px" }}
                  >
                    Check
                  </button>
                )}
              </div>
              {answered && (
                <div style={{
                  marginTop: 12, padding: "10px 14px", borderRadius: 12, fontSize: 13,
                  background: isCorrect ? "rgba(16,185,129,0.10)" : "rgba(239,68,68,0.10)",
                  border: `1px solid ${isCorrect ? "rgba(16,185,129,0.35)" : "rgba(239,68,68,0.35)"}`,
                  color: isCorrect ? "var(--green)" : "var(--red)",
                }}>
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
            <button onClick={nextExercise} className="btn-primary w-full" style={{ marginTop: 20, padding: "13px" }}>
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
  const pctColor = pct >= 80 ? "var(--green)" : pct >= 50 ? "var(--xp)" : "var(--red)";

  return (
    <div className="max-w-2xl animate-fade-up" style={{ textAlign: "center" }}>
      <div style={{ background: "var(--surface-2)", borderRadius: 20, border: "1px solid var(--border-md)", padding: "40px 32px" }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18, margin: "0 auto 16px",
          background: "linear-gradient(135deg, var(--accent), #4338ca)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 26, color: "#fff",
        }}>
          {pct >= 80 ? "◈" : pct >= 50 ? "▤" : "△"}
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", fontFamily: "var(--font-display)", letterSpacing: "-0.02em", marginBottom: 4 }}>
          Lesson Complete!
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 24 }}>{lesson.title}</p>

        <div style={{
          display: "inline-flex", alignItems: "center", gap: 24,
          background: "var(--surface-3)", borderRadius: 16, padding: "16px 28px",
          marginBottom: 24, border: "1px solid var(--border)",
        }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 28, fontWeight: 800, color: "var(--accent-2)", fontFamily: "var(--font-mono)", letterSpacing: "-0.03em" }}>
              {score}/{exercises.length}
            </p>
            <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>Correct</p>
          </div>
          <div style={{ width: 1, height: 40, background: "var(--border-md)" }} />
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 28, fontWeight: 800, color: pctColor, fontFamily: "var(--font-mono)", letterSpacing: "-0.03em" }}>
              {pct}%
            </p>
            <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>Score</p>
          </div>
          {xpEarned > 0 && (
            <>
              <div style={{ width: 1, height: 40, background: "var(--border-md)" }} />
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 28, fontWeight: 800, color: "var(--accent-2)", fontFamily: "var(--font-mono)", letterSpacing: "-0.03em" }}>
                  +{xpEarned}
                </p>
                <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>XP Earned</p>
              </div>
            </>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 280, margin: "0 auto" }}>
          {pct < 80 && (
            <button
              onClick={() => { setPhase("learn"); setCurrentExercise(0); setAnswers({}); setShowResult({}); setScore(0); setFillInput(""); }}
              className="btn-secondary w-full"
              style={{ padding: "12px" }}
            >
              Review Lesson
            </button>
          )}
          {nextLesson && (
            <Link href={`/learn/${nextLesson.id}`} className="btn-primary w-full" style={{ padding: "12px", textAlign: "center" }}>
              Next: {nextLesson.title}
            </Link>
          )}
          <Link href="/learn" className="btn-ghost w-full" style={{ padding: "12px", textAlign: "center" }}>
            Back to Learning Path
          </Link>
        </div>
      </div>
    </div>
  );
}
