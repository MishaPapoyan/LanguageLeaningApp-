"use client";

import { useState, useEffect, useCallback } from "react";
import { speakFr } from "@/lib/speech";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CustomWord {
  id: string;
  front: string; // native language side  (e.g. "hello")
  back: string;  // French side           (e.g. "bonjour")
  createdAt: number;
}

type Mode = "list" | "quiz" | "result";

interface QuizQuestion {
  word: CustomWord;
  options: string[]; // 4 native-side choices
  correctIndex: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = "linguaflow_custom_words";

function loadWords(): CustomWord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveWords(words: CustomWord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Build a quiz question for `word` using the rest of the pool as distractors */
function buildQuestion(word: CustomWord, pool: CustomWord[]): QuizQuestion {
  const distractors = shuffle(pool.filter((w) => w.id !== word.id))
    .slice(0, 3)
    .map((w) => w.front);

  // Pad with generic fillers when pool is small
  const fillers = ["None of these", "I don't know", "Skip", "—"];
  while (distractors.length < 3) {
    distractors.push(fillers[distractors.length]);
  }

  const options = shuffle([word.front, ...distractors]);
  return {
    word,
    options,
    correctIndex: options.indexOf(word.front),
  };
}

function buildQuiz(words: CustomWord[]): QuizQuestion[] {
  return shuffle(words).map((w) => buildQuestion(w, words));
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MyWordsPage() {
  const [words, setWords] = useState<CustomWord[]>([]);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [mode, setMode] = useState<Mode>("list");

  // Quiz state
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    setWords(loadWords());
  }, []);

  // ── Word management ────────────────────────────────────────────────────────

  const addWord = useCallback(() => {
    const f = front.trim();
    const b = back.trim();
    if (!f || !b) return;

    const updated = [
      { id: crypto.randomUUID(), front: f, back: b, createdAt: Date.now() },
      ...words,
    ];
    setWords(updated);
    saveWords(updated);
    setFront("");
    setBack("");
  }, [front, back, words]);

  const deleteWord = useCallback(
    (id: string) => {
      const updated = words.filter((w) => w.id !== id);
      setWords(updated);
      saveWords(updated);
    },
    [words]
  );

  // ── Quiz ──────────────────────────────────────────────────────────────────

  const startQuiz = () => {
    if (words.length < 2) return;
    setQuestions(buildQuiz(words));
    setQIndex(0);
    setSelected(null);
    setScore(0);
    setMode("quiz");
  };

  const handleAnswer = (optionIndex: number) => {
    if (selected !== null) return; // already answered
    setSelected(optionIndex);

    const correct = questions[qIndex].correctIndex === optionIndex;
    if (correct) setScore((s) => s + 1);

    // Auto-advance after 1 s
    setTimeout(() => {
      if (qIndex + 1 >= questions.length) {
        setMode("result");
      } else {
        setQIndex((i) => i + 1);
        setSelected(null);
      }
    }, 1000);
  };

  // ── Render helpers ────────────────────────────────────────────────────────

  const currentQ = questions[qIndex];
  const percentage =
    questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  // ══════════════════════════════════════════════════════════════════════════
  //  RESULT SCREEN
  // ══════════════════════════════════════════════════════════════════════════
  if (mode === "result") {
    const emoji =
      percentage === 100 ? "🏆" : percentage >= 70 ? "🎉" : percentage >= 40 ? "👍" : "💪";
    return (
      <div className="max-w-md pt-8 animate-fade-up">
        <div className="card p-8 text-center space-y-4">
          <div className="text-6xl">{emoji}</div>
          <h2 className="font-serif text-2xl text-zinc-900 dark:text-zinc-100">
            Quiz complete!
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            You got{" "}
            <span className="font-semibold text-violet-600">{score}</span> out
            of{" "}
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              {questions.length}
            </span>{" "}
            correct
          </p>

          {/* Score ring */}
          <div className="flex justify-center py-2">
            <div className="relative w-28 h-28">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f4f4f5" strokeWidth="10" />
                <circle
                  cx="50" cy="50" r="40" fill="none"
                  stroke={percentage >= 70 ? "#7c3aed" : "#f59e0b"}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - percentage / 100)}`}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {percentage}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={startQuiz}
              className="flex-1 btn-primary py-2.5 text-sm"
            >
              Retry quiz
            </button>
            <button
              onClick={() => setMode("list")}
              className="flex-1 btn-outline py-2.5 text-sm"
            >
              My words
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  QUIZ SCREEN
  // ══════════════════════════════════════════════════════════════════════════
  if (mode === "quiz" && currentQ) {
    return (
      <div className="max-w-md pt-6 space-y-6 animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setMode("list")}
            className="text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 flex items-center gap-1.5 transition-colors"
          >
            <span>←</span> Exit quiz
          </button>
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {qIndex + 1} / {questions.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${((qIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question card */}
        <div className="card p-8 text-center space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            What does this mean?
          </p>
          <div className="flex items-center justify-center gap-2">
            <p className="font-serif text-4xl text-zinc-900 dark:text-zinc-100">
              {currentQ.word.back}
            </p>
            <button
              onClick={() => speakFr(currentQ.word.back)}
              className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center hover:bg-violet-100 dark:hover:bg-violet-950/70 transition-colors flex-shrink-0"
              title="Listen"
            >
              ♪
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3">
          {currentQ.options.map((option, i) => {
            let style =
              "border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-violet-300 dark:hover:border-violet-700 hover:bg-violet-50/50 dark:hover:bg-violet-950/20 text-zinc-700 dark:text-zinc-300";

            if (selected !== null) {
              if (i === currentQ.correctIndex) {
                style =
                  "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400";
              } else if (i === selected && selected !== currentQ.correctIndex) {
                style =
                  "border-rose-400 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400";
              } else {
                style =
                  "border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 opacity-40 text-zinc-500";
              }
            }

            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={selected !== null}
                className={`border rounded-xl p-4 text-sm font-medium text-center transition-all duration-150 disabled:cursor-default ${style}`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {/* Score so far */}
        <p className="text-center text-xs text-zinc-400 dark:text-zinc-600">
          Score: {score} correct
        </p>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  LIST / ADD SCREEN
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="max-w-2xl space-y-6 animate-fade-up">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-zinc-900 dark:text-zinc-100">
            My Words
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Add your own word pairs and quiz yourself
          </p>
        </div>
        {words.length >= 2 && (
          <button
            onClick={startQuiz}
            className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2"
          >
            <span>▶</span> Start quiz
          </button>
        )}
      </div>

      {/* Add word form */}
      <div className="card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Add a word pair
        </h2>
        <div className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
              Your language
            </label>
            <input
              type="text"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && back.trim() && addWord()}
              placeholder="e.g. hello"
              className="input text-sm"
            />
          </div>

          <div className="mt-5 text-xl text-zinc-300 dark:text-zinc-600 select-none">→</div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
              French
            </label>
            <input
              type="text"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && front.trim() && addWord()}
              placeholder="e.g. bonjour"
              className="input text-sm"
            />
          </div>

          <button
            onClick={addWord}
            disabled={!front.trim() || !back.trim()}
            className="mt-5 w-9 h-9 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-100 dark:disabled:bg-zinc-800 disabled:text-zinc-300 dark:disabled:text-zinc-600 text-white flex items-center justify-center text-lg transition-colors disabled:cursor-not-allowed"
            title="Add word"
          >
            +
          </button>
        </div>
      </div>

      {/* Word list */}
      {words.length === 0 ? (
        <div className="card p-12 text-center space-y-3">
          <div className="text-4xl">📝</div>
          <p className="font-serif text-lg text-zinc-500 dark:text-zinc-400">
            No words yet
          </p>
          <p className="text-sm text-zinc-400 dark:text-zinc-600">
            Add your first word pair above to get started
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
            {words.length} word{words.length !== 1 ? "s" : ""}
            {words.length < 2 && (
              <span className="normal-case font-normal ml-2 text-amber-500">
                — add at least 2 to start a quiz
              </span>
            )}
          </p>

          {words.map((word) => (
            <div
              key={word.id}
              className="card px-4 py-3 flex items-center gap-4 group hover:shadow-sm transition-shadow"
            >
              {/* Front */}
              <span className="flex-1 text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate">
                {word.front}
              </span>

              {/* Arrow */}
              <span className="text-zinc-300 dark:text-zinc-600 text-sm select-none">→</span>

              {/* Back + speaker */}
              <div className="flex-1 flex items-center gap-1.5 min-w-0">
                <span className="text-sm font-semibold text-violet-600 dark:text-violet-400 truncate">
                  {word.back}
                </span>
                <button
                  onClick={() => speakFr(word.back)}
                  className="w-6 h-6 rounded-lg bg-violet-50 dark:bg-violet-950/40 text-violet-500 dark:text-violet-400 flex items-center justify-center text-xs hover:bg-violet-100 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                  title="Listen"
                >
                  ♪
                </button>
              </div>

              {/* Delete */}
              <button
                onClick={() => deleteWord(word.id)}
                className="w-7 h-7 rounded-lg text-zinc-300 dark:text-zinc-600 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-center text-sm transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
                title="Remove"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Start quiz CTA when list is long enough */}
      {words.length >= 2 && (
        <button
          onClick={startQuiz}
          className="w-full py-3.5 rounded-xl border-2 border-dashed border-violet-200 dark:border-violet-900 text-violet-600 dark:text-violet-400 text-sm font-medium hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors"
        >
          ▶ Start quiz ({words.length} words)
        </button>
      )}
    </div>
  );
}
