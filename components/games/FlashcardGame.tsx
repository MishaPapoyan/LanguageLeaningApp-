"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { speakFr } from "@/lib/speech";

interface Word {
  id: string;
  word: string;
  translation: string;
  exampleFr: string;
  imageEmoji: string;
}

export function FlashcardGame({ words }: { words: Word[] }) {
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
        try {
          const res = await fetch("/api/games/score", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ gameType: "FLASHCARDS", score, wordsUsed: words.map((w) => w.id) }),
          });
          const data = await res.json();
          setXpEarned(data.xpEarned ?? 10);
        } catch {}
        setFinished(true);
      } else {
        setFlipped(false);
        setTimeout(() => setCurrent((prev) => prev + 1), 150);
      }
    },
    [card, current, known, words]
  );


  if (finished) {
    const knownCount = known.length + 1;
    const learnCount = words.length - knownCount;
    return (
      <div className="bg-white rounded-2xl border border-zinc-100 p-8 text-center animate-fade-up">
        <p className="text-4xl mb-3">{knownCount >= words.length * 0.7 ? "◈" : "▤"}</p>
        <h2 className="text-xl font-serif text-zinc-900 mb-2">Round Complete!</h2>
        <p className="text-sm text-zinc-500 mb-6">You got through {words.length} cards</p>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-emerald-50 rounded-xl p-4 ring-1 ring-emerald-100">
            <p className="text-3xl font-bold text-emerald-700">{knownCount}</p>
            <p className="text-xs text-zinc-500 mt-1">I knew it</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 ring-1 ring-amber-100">
            <p className="text-3xl font-bold text-amber-700">{learnCount}</p>
            <p className="text-xs text-zinc-500 mt-1">Still learning</p>
          </div>
        </div>
        {xpEarned > 0 && (
          <p className="text-violet-600 font-semibold mb-4">+{xpEarned} XP earned!</p>
        )}
        <div className="flex gap-3">
          <button
            onClick={() => { setCurrent(0); setFlipped(false); setKnown([]); setLearning([]); setFinished(false); }}
            className="btn-primary flex-1"
          >
            Play again
          </button>
          <Link href="/games" className="btn-outline flex-1 text-center">
            Back to games
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Progress */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-500 rounded-full transition-all duration-500"
            style={{ width: `${((current) / words.length) * 100}%` }}
          />
        </div>
        <span className="text-xs font-bold text-zinc-500">{current + 1}/{words.length}</span>
      </div>

      {/* Card */}
      <div
        className="perspective-1000 cursor-pointer mb-6"
        onClick={() => setFlipped((f) => !f)}
      >
        <div
          className={`relative h-64 transition-all duration-500 preserve-3d ${flipped ? "rotate-y-180" : ""}`}
          style={{ transformStyle: "preserve-3d", transition: "transform 0.4s" }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-white rounded-2xl border border-zinc-100 flex flex-col items-center justify-center bg-gradient-to-b from-violet-50/50 to-white"
            style={{ backfaceVisibility: "hidden" }}
          >
            <span className="text-5xl mb-4">{card.imageEmoji}</span>
            <p className="text-3xl font-serif text-zinc-900">{card.word}</p>
            <p className="text-sm text-violet-500 mt-4 font-medium">Tap to reveal</p>
            <button
              onClick={(e) => { e.stopPropagation(); speakFr(card.word); }}
              className="mt-2 w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center hover:bg-violet-100 transition-colors text-sm"
            >
              ♪
            </button>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 bg-white rounded-2xl border-2 border-violet-200 flex flex-col items-center justify-center bg-violet-50"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <p className="text-2xl font-serif text-violet-700">{card.translation}</p>
            <p className="text-zinc-500 text-sm mt-2 text-center px-4 italic">&ldquo;{card.exampleFr}&rdquo;</p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      {flipped && (
        <div className="flex gap-3 animate-fade-up">
          <button
            onClick={() => next(false)}
            className="flex-1 py-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 font-medium hover:bg-amber-100 transition-colors"
          >
            Still learning
          </button>
          <button
            onClick={() => next(true)}
            className="flex-1 py-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 font-medium hover:bg-emerald-100 transition-colors"
          >
            I knew it!
          </button>
        </div>
      )}

      {!flipped && (
        <p className="text-center text-zinc-400 text-sm">Click the card to see the answer</p>
      )}
    </div>
  );
}
