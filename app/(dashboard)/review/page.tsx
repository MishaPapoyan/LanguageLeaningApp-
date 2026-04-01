"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
  if (quality < 3) { repetitions = 0; interval = 1; }
  else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 3;
    else interval = Math.round(interval * ease);
    repetitions++;
    ease = Math.max(1.3, ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  }
  return { ...word, interval, ease, repetitions, nextReview: Date.now() + interval * 86400000 };
}

const DEFAULT_WORDS: ReviewWord[] = [
  { id: "r1", word: "bonjour", translation: "hello", imageEmoji: "👋", nextReview: 0, interval: 0, ease: 2.5, repetitions: 0 },
  { id: "r2", word: "merci", translation: "thank you", imageEmoji: "🙏", nextReview: 0, interval: 0, ease: 2.5, repetitions: 0 },
  { id: "r3", word: "au revoir", translation: "goodbye", imageEmoji: "👋", nextReview: 0, interval: 0, ease: 2.5, repetitions: 0 },
  { id: "r4", word: "s'il vous plaît", translation: "please", imageEmoji: "🙏", nextReview: 0, interval: 0, ease: 2.5, repetitions: 0 },
  { id: "r5", word: "oui", translation: "yes", imageEmoji: "✅", nextReview: 0, interval: 0, ease: 2.5, repetitions: 0 },
  { id: "r6", word: "non", translation: "no", imageEmoji: "❌", nextReview: 0, interval: 0, ease: 2.5, repetitions: 0 },
  { id: "r7", word: "le pain", translation: "bread", imageEmoji: "🥖", nextReview: 0, interval: 0, ease: 2.5, repetitions: 0 },
  { id: "r8", word: "le fromage", translation: "cheese", imageEmoji: "🧀", nextReview: 0, interval: 0, ease: 2.5, repetitions: 0 },
  { id: "r9", word: "l'eau", translation: "water", imageEmoji: "💧", nextReview: 0, interval: 0, ease: 2.5, repetitions: 0 },
  { id: "r10", word: "le café", translation: "coffee", imageEmoji: "☕", nextReview: 0, interval: 0, ease: 2.5, repetitions: 0 },
  { id: "r11", word: "la famille", translation: "family", imageEmoji: "👨‍👩‍👧‍👦", nextReview: 0, interval: 0, ease: 2.5, repetitions: 0 },
  { id: "r12", word: "grand", translation: "big / tall", imageEmoji: "📏", nextReview: 0, interval: 0, ease: 2.5, repetitions: 0 },
  { id: "r13", word: "petit", translation: "small / short", imageEmoji: "🤏", nextReview: 0, interval: 0, ease: 2.5, repetitions: 0 },
  { id: "r14", word: "manger", translation: "to eat", imageEmoji: "🍽️", nextReview: 0, interval: 0, ease: 2.5, repetitions: 0 },
  { id: "r15", word: "parler", translation: "to speak", imageEmoji: "🗣️", nextReview: 0, interval: 0, ease: 2.5, repetitions: 0 },
];

export default function ReviewPage() {
  const [words, setWords] = useState<ReviewWord[]>([]);
  const [dueWords, setDueWords] = useState<ReviewWord[]>([]);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [correct, setCorrect] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("reviewWords");
    const parsed: ReviewWord[] = saved ? JSON.parse(saved) : DEFAULT_WORDS;
    setWords(parsed);
    const due = parsed.filter((w) => w.nextReview <= Date.now()).slice(0, 10);
    setDueWords(due);
    if (due.length === 0) setSessionDone(true);
  }, []);

  const handleRate = (quality: number) => {
    const word = dueWords[current];
    const updated = calculateNext(word, quality);
    if (quality >= 3) setCorrect((c) => c + 1);
    setReviewed((r) => r + 1);
    const newWords = words.map((w) => (w.id === updated.id ? updated : w));
    setWords(newWords);
    localStorage.setItem("reviewWords", JSON.stringify(newWords));
    setFlipped(false);
    if (current < dueWords.length - 1) setCurrent(current + 1);
    else setSessionDone(true);
  };

  if (sessionDone) {
    const hasReviewed = reviewed > 0;
    return (
      <div className="max-w-md text-center py-16">
        <div className="bg-white rounded-2xl p-10 border border-zinc-100">
          <p className="text-6xl mb-4">{hasReviewed ? "🎯" : "✨"}</p>
          <h2 className="font-serif text-2xl text-zinc-900 mb-2">
            {hasReviewed ? "Review Complete!" : "All Caught Up!"}
          </h2>
          {hasReviewed ? (
            <p className="text-sm text-zinc-500 mb-6">
              {reviewed} words reviewed — {correct} correct ({Math.round((correct / reviewed) * 100)}%)
            </p>
          ) : (
            <p className="text-sm text-zinc-500 mb-6">No words due right now. Come back later!</p>
          )}
          <div className="flex flex-col gap-2">
            <Link href="/learn" className="btn-primary w-full py-3">Continue Learning</Link>
            <Link href="/home" className="btn-ghost w-full py-2.5">Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  const word = dueWords[current];
  if (!word) return null;

  const ratings = [
    { q: 0, label: "Forgot", emoji: "😵", bg: "bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700" },
    { q: 3, label: "Hard", emoji: "😬", bg: "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700" },
    { q: 4, label: "Good", emoji: "😊", bg: "bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-700" },
    { q: 5, label: "Easy", emoji: "🤩", bg: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700" },
  ];

  return (
    <div className="max-w-md">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium text-zinc-400">{dueWords.length} words due</span>
        <span className="text-xs font-bold text-zinc-500">{current + 1}/{dueWords.length}</span>
      </div>

      {/* Progress */}
      <div className="h-1 bg-zinc-100 rounded-full overflow-hidden mb-6">
        <div className="h-full rounded-full bg-violet-500 transition-all duration-500"
          style={{ width: `${((current + 1) / dueWords.length) * 100}%` }} />
      </div>

      {/* Card */}
      <div onClick={() => !flipped && setFlipped(true)}
        className={`bg-white rounded-2xl border border-zinc-100 min-h-[300px] flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-sm ${
          !flipped ? "bg-gradient-to-b from-violet-50/50 to-white" : ""
        }`}>
        <span className="text-5xl mb-4">{word.imageEmoji}</span>
        <p className="text-3xl font-serif text-zinc-900">{word.word}</p>
        {!flipped ? (
          <p className="text-sm text-violet-500 mt-6 font-medium">Tap to reveal</p>
        ) : (
          <p className="text-xl text-violet-600 font-semibold mt-4">{word.translation}</p>
        )}
      </div>

      {/* Rating */}
      {flipped && (
        <div className="mt-4">
          <p className="text-xs text-center text-zinc-400 mb-3">How well did you know it?</p>
          <div className="grid grid-cols-4 gap-2">
            {ratings.map((r) => (
              <button key={r.q} onClick={() => handleRate(r.q)}
                className={`btn border py-3 flex-col rounded-xl ${r.bg}`}>
                <span className="text-lg">{r.emoji}</span>
                <span className="text-[11px] mt-1 font-medium">{r.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
