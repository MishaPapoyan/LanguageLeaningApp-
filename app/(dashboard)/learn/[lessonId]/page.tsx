"use client";

import { useParams, useRouter } from "next/navigation";
import { getLessonById, getAllLessons } from "@/data/learning-path";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const router = useRouter();
  const lesson = getLessonById(lessonId);
  const [phase, setPhase] = useState<"learn" | "practice" | "done">("learn");
  const [currentExercise, setCurrentExercise] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState<Record<number, boolean>>({});
  const [fillInput, setFillInput] = useState("");
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("completedLessons");
    if (saved) setCompletedLessons(JSON.parse(saved));
  }, []);

  if (!lesson) {
    return (
      <div className="max-w-3xl text-center py-20">
        <p className="text-2xl mb-3 text-zinc-300">◈</p>
        <h1 className="text-xl font-serif text-zinc-900">Lesson not found</h1>
        <Link href="/learn" className="btn-primary mt-4 inline-flex">Back to Learning Path</Link>
      </div>
    );
  }

  const exercises = lesson.exercises;
  const exercise = exercises[currentExercise];

  const handleAnswer = (answer: string) => {
    setAnswers({ ...answers, [currentExercise]: answer });
    setShowResult({ ...showResult, [currentExercise]: true });
    const isCorrect = answer.toLowerCase().trim() === exercise.answer.toLowerCase().trim();
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
      localStorage.setItem("completedLessons", JSON.stringify(updated));
      fetch("/api/learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: lesson.id,
          score: score + (answers[currentExercise]?.toLowerCase().trim() === exercise.answer.toLowerCase().trim() ? 1 : 0),
          totalQuestions: exercises.length,
        }),
      })
        .then((r) => r.json())
        .then((data) => { if (data.xpEarned) setXpEarned(data.xpEarned); })
        .catch(() => {});
    }
  };

  const getNextLesson = () => {
    const all = getAllLessons();
    const idx = all.findIndex((l) => l.id === lesson.id);
    return idx < all.length - 1 ? all[idx + 1] : null;
  };

  // ── LEARN PHASE ──
  if (phase === "learn") {
    return (
      <div className="max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/learn" className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <p className="text-[11px] text-zinc-400 uppercase tracking-wider font-medium">{lesson.topicTitle}</p>
            <h1 className="text-xl font-serif text-zinc-900">{lesson.title}</h1>
          </div>
        </div>

        <div className="space-y-5">
          {lesson.content.map((section, i) => (
            <div key={i} className="bg-white rounded-2xl border border-zinc-100 p-6">
              <h2 className="font-serif text-lg text-zinc-900 mb-2">{section.heading}</h2>
              <p className="text-zinc-600 text-sm leading-relaxed mb-4">{section.body}</p>

              {section.table && (
                <div className="overflow-x-auto mb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-100">
                        {section.table.columns.map((col, j) => (
                          <th key={j} className="text-left py-2 px-3 text-zinc-400 font-medium">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.rows.map((row, j) => (
                        <tr key={j} className="border-b border-zinc-50">
                          {row.map((cell, k) => (
                            <td key={k} className={`py-2 px-3 ${k === 0 ? "font-semibold text-violet-600" : "text-zinc-700"}`}>
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
                <div className="space-y-2 mb-4">
                  {section.examples.map((ex, j) => (
                    <div key={j} className="flex gap-3 bg-violet-50 rounded-xl px-4 py-2.5">
                      <span className="font-semibold text-violet-600 text-sm min-w-0">{ex.fr}</span>
                      <span className="text-zinc-400 text-sm">— {ex.en}</span>
                    </div>
                  ))}
                </div>
              )}

              {section.tip && (
                <div className="bg-amber-50 ring-1 ring-amber-100 rounded-xl p-3 mt-3">
                  <p className="text-sm text-amber-800">
                    <span className="font-semibold">Tip:</span> {section.tip}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => { setPhase("practice"); setCurrentExercise(0); setAnswers({}); setShowResult({}); setScore(0); }}
          className="btn-primary w-full py-3.5 mt-6 text-base"
        >
          Practice What You Learned ({exercises.length} questions)
        </button>
      </div>
    );
  }

  // ── PRACTICE PHASE ──
  if (phase === "practice" && exercise) {
    const answered = showResult[currentExercise];
    const userAnswer = answers[currentExercise];
    const isCorrect = userAnswer?.toLowerCase().trim() === exercise.answer.toLowerCase().trim();

    return (
      <div className="max-w-2xl">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <Link href="/learn" className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Link>
            <span className="text-xs font-medium text-zinc-400">{currentExercise + 1} / {exercises.length}</span>
          </div>
          <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
              style={{ width: `${((currentExercise + 1) / exercises.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-100 p-6">
          <h2 className="font-serif text-lg text-zinc-900 mb-6">{exercise.question}</h2>

          {/* Multiple choice */}
          {exercise.type === "multiple-choice" && exercise.options && (
            <div className="space-y-3">
              {exercise.options.map((opt) => {
                const selected = userAnswer === opt;
                const correct = opt === exercise.answer;
                let cls = "border border-zinc-200 bg-white hover:border-violet-300 text-zinc-700";
                if (answered && correct) cls = "border-2 border-emerald-400 bg-emerald-50 text-emerald-700";
                else if (answered && selected && !correct) cls = "border-2 border-rose-400 bg-rose-50 text-rose-700";

                return (
                  <button
                    key={opt}
                    onClick={() => !answered && handleAnswer(opt)}
                    disabled={!!answered}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.98] ${cls}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          {/* Fill in the blank */}
          {(exercise.type === "fill-blank" || exercise.type === "translate") && (
            <div>
              {exercise.hint && !answered && (
                <p className="text-xs text-zinc-400 mb-3">Hint: {exercise.hint}</p>
              )}
              <div className="flex gap-3">
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
                    className="btn-primary px-5"
                  >
                    Check
                  </button>
                )}
              </div>
              {answered && (
                <div className={`mt-3 p-3 rounded-xl text-sm ${isCorrect ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                  {isCorrect ? (
                    <span>Correct!</span>
                  ) : (
                    <span>The answer is: <strong>{exercise.answer}</strong></span>
                  )}
                </div>
              )}
            </div>
          )}

          {answered && (
            <button onClick={nextExercise} className="btn-primary w-full py-3 mt-6">
              {currentExercise < exercises.length - 1 ? "Next Question" : "See Results"}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── DONE PHASE ──
  const pct = Math.round((score / exercises.length) * 100);
  const nextLesson = getNextLesson();

  return (
    <div className="max-w-2xl text-center">
      <div className="bg-white rounded-2xl border border-zinc-100 p-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-2xl mx-auto mb-4">
          {pct >= 80 ? "◈" : pct >= 50 ? "▤" : "△"}
        </div>
        <h1 className="text-2xl font-serif text-zinc-900 mb-1">Lesson Complete!</h1>
        <p className="text-zinc-400 text-sm mb-6">{lesson.title}</p>

        <div className="inline-flex items-center gap-6 bg-zinc-50 rounded-2xl px-8 py-4 mb-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-violet-600">{score}/{exercises.length}</p>
            <p className="text-xs text-zinc-400 mt-1">Correct</p>
          </div>
          <div className="w-px h-10 bg-zinc-200" />
          <div className="text-center">
            <p className={`text-3xl font-bold ${pct >= 80 ? "text-emerald-600" : pct >= 50 ? "text-amber-600" : "text-rose-600"}`}>
              {pct}%
            </p>
            <p className="text-xs text-zinc-400 mt-1">Score</p>
          </div>
          {xpEarned > 0 && (
            <>
              <div className="w-px h-10 bg-zinc-200" />
              <div className="text-center">
                <p className="text-3xl font-bold text-violet-600">+{xpEarned}</p>
                <p className="text-xs text-zinc-400 mt-1">XP Earned</p>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          {pct < 80 && (
            <button
              onClick={() => { setPhase("learn"); setCurrentExercise(0); setAnswers({}); setShowResult({}); setScore(0); setFillInput(""); }}
              className="btn-outline w-full py-3"
            >
              Review Lesson
            </button>
          )}
          {nextLesson && (
            <Link href={`/learn/${nextLesson.id}`} className="btn-primary w-full py-3">
              Next: {nextLesson.title}
            </Link>
          )}
          <Link href="/learn" className="btn-ghost w-full py-3">Back to Learning Path</Link>
        </div>
      </div>
    </div>
  );
}
