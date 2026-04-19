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
            className="relative w-full bg-gradient-to-b from-violet-50 to-amber-50/50 border border-zinc-200 rounded-2xl overflow-hidden mb-6"
            style={{ height: "350px" }}
          >
            <div className="absolute inset-0 flex items-end justify-center pb-4 opacity-10">
              <p className="text-8xl font-serif text-zinc-900">Café</p>
            </div>

            {PALACE_OBJECTS.map((obj) => {
              const word = assignments[obj.id];
              const isRevealed = revealed.has(obj.id);
              const isActive = activeObj === obj.id;

              return (
                <button
                  key={obj.id}
                  onClick={() => handleReveal(obj.id)}
                  className={`absolute flex flex-col items-center transition-all duration-200 ${
                    isActive ? "scale-125 z-10" : "hover:scale-110"
                  }`}
                  style={{ left: `${obj.x}%`, top: `${obj.y}%`, transform: "translate(-50%, -50%)" }}
                >
                  <span className="text-3xl">{obj.emoji}</span>
                  {isRevealed && word && (
                    <span className="bg-white border border-violet-200 text-violet-700 text-xs font-bold px-2 py-0.5 rounded-lg mt-1 whitespace-nowrap shadow-sm">
                      {word.word}
                    </span>
                  )}
                  {!isRevealed && (
                    <span className="bg-zinc-200 text-zinc-400 text-xs px-2 py-0.5 rounded-lg mt-1">?</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Word popup */}
          {activeObj && assignments[activeObj] && (
            <div className="bg-white rounded-2xl border-2 border-violet-200 p-4 mb-4 animate-fade-up">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-zinc-400 uppercase tracking-wider font-medium mb-0.5">You clicked on:</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{assignments[activeObj].imageEmoji}</span>
                    <span className="text-xl font-serif text-zinc-900">{assignments[activeObj].word}</span>
                    <button onClick={() => speakTarget(assignments[activeObj].word, langConfig.code)} className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center text-sm">♪</button>
                  </div>
                  <p className="text-violet-600 font-medium">{assignments[activeObj].translation}</p>
                  <p className="text-sm text-zinc-500 mt-1">{assignments[activeObj].definition}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-400 font-medium">
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
          <p className="text-sm text-zinc-600 mb-4">
            What {langConfig.label} word goes with each object in the café?
          </p>
          {PALACE_OBJECTS.filter((obj) => assignments[obj.id]).map((obj) => {
            const word = assignments[obj.id];
            return (
              <div key={obj.id} className="bg-white rounded-2xl border border-zinc-100 p-4 flex items-center gap-4">
                <span className="text-3xl">{obj.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm text-zinc-500 mb-1">{word.translation}</p>
                  <input
                    type="text"
                    value={quizAnswers[obj.id] ?? ""}
                    onChange={(e) => setQuizAnswers((prev) => ({ ...prev, [obj.id]: e.target.value }))}
                    className="input"
                    placeholder={`Type the ${langConfig.label} word...`}
                  />
                </div>
              </div>
            );
          })}
          <button onClick={handleSubmitQuiz} className="btn-primary w-full py-3">
            Check my answers
          </button>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-up">
          <h2 className="text-xl font-serif text-zinc-900">Results</h2>
          {PALACE_OBJECTS.filter((obj) => assignments[obj.id]).map((obj) => {
            const word = assignments[obj.id];
            const answer = quizAnswers[obj.id] ?? "";
            const correct = answer.toLowerCase().trim() === word.word.toLowerCase();
            return (
              <div
                key={obj.id}
                className={`rounded-2xl border p-4 flex items-center gap-4 ${correct ? "border-emerald-300 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}
              >
                <span className="text-3xl">{obj.emoji}</span>
                <div>
                  <p className="text-sm text-zinc-500">{word.translation}</p>
                  <p className={`font-semibold ${correct ? "text-emerald-700" : "text-rose-700"}`}>
                    {answer || "(blank)"} {correct ? "✓" : "✗"}
                  </p>
                  {!correct && <p className="text-sm text-zinc-600">Correct: {word.word}</p>}
                </div>
              </div>
            );
          })}
          {xpEarned > 0 && <p className="text-violet-600 font-semibold">+{xpEarned} XP earned!</p>}
          <div className="flex gap-3">
            <button
              onClick={() => { setQuizMode(false); setQuizAnswers({}); setQuizSubmitted(false); setRevealed(new Set()); setActiveObj(null); }}
              className="btn-primary flex-1"
            >
              Try again
            </button>
            <Link href="/games" className="btn-outline flex-1 text-center">Back</Link>
          </div>
        </div>
      )}
    </div>
  );
}
