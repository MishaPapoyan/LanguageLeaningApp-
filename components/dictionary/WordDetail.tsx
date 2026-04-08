"use client";

import { useState } from "react";
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

  return (
    <div className="max-w-2xl mx-auto animate-fade-up">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dictionary" className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <span className="badge-gray">{word.category}</span>
      </div>

      {/* Main word card */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-6 mb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center text-4xl">
              {word.imageEmoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-serif text-zinc-900">{word.word}</h1>
                <button
                  onClick={() => handleSpeak(word.word)}
                  className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center hover:bg-violet-100 transition-colors text-sm"
                  title="Listen (French)"
                >
                  ♪
                </button>
              </div>
              <p className="text-xl text-violet-600 font-semibold mt-1">{word.translation}</p>
              <button
                onClick={() => handleSpeak(word.translation, "en-US")}
                className="text-[11px] text-zinc-400 hover:text-zinc-600 mt-1 font-medium"
              >
                ♪ English pronunciation
              </button>
            </div>
          </div>
          <button
            onClick={toggleSave}
            disabled={saving}
            className={`text-sm px-4 py-2 rounded-full font-medium transition-all ${
              isSaved ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "btn-outline"
            }`}
          >
            {saving ? "..." : isSaved ? "Saved" : "+ Save"}
          </button>
        </div>

        <div className="bg-zinc-50 rounded-xl p-4">
          <p className="text-[11px] text-zinc-400 uppercase tracking-wider font-medium mb-1">Definition</p>
          <p className="text-zinc-700">{word.definition}</p>
        </div>

        {/* Quiz stats — only shown for saved words with at least one attempt */}
        {word.isSaved && word.quizAttempts > 0 && (
          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400">Quiz accuracy:</span>
              <span className="font-semibold text-zinc-700">
                {Math.round((word.quizCorrect / word.quizAttempts) * 100)}%
              </span>
              <span className="text-zinc-400">({word.quizCorrect}/{word.quizAttempts})</span>
            </div>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  className="w-4 h-4 rounded-sm"
                  style={{
                    background: n <= word.masteryLevel
                      ? "var(--accent, #7c3aed)"
                      : "#e5e7eb",
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {word.isSaved && word.quizAttempts === 0 && (
          <p className="mt-3 text-xs text-zinc-400">
            Not reviewed yet — visit <a href="/review" className="text-violet-500 hover:underline">Review</a> to start practicing.
          </p>
        )}
      </div>

      {/* Examples */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-6 mb-4">
        <h2 className="font-serif text-zinc-900 mb-3">Examples</h2>
        <div className="space-y-3">
          <div className="bg-violet-50 rounded-xl p-4 ring-1 ring-violet-100">
            <div className="flex items-start justify-between">
              <p className="text-zinc-800 font-medium italic">&ldquo;{word.exampleFr}&rdquo;</p>
              <button onClick={() => handleSpeak(word.exampleFr)} className="w-8 h-8 rounded-lg bg-white text-violet-600 flex items-center justify-center hover:bg-violet-100 ml-2 flex-shrink-0 text-sm transition-colors">
                ♪
              </button>
            </div>
            <p className="text-sm text-zinc-500 mt-1">&ldquo;{word.exampleEn}&rdquo;</p>
          </div>
        </div>
      </div>

      {/* Mini story */}
      {word.miniStory && (
        <div className="bg-white rounded-2xl border border-zinc-100 p-6 mb-4">
          <h2 className="font-serif text-zinc-900 mb-3">Mini Story</h2>
          <div className="bg-amber-50 rounded-xl p-4 ring-1 ring-amber-100">
            <button onClick={() => handleSpeak(word.miniStory!)} className="float-right w-8 h-8 rounded-lg bg-white text-amber-600 flex items-center justify-center hover:bg-amber-100 text-sm transition-colors">
              ♪
            </button>
            <p className="text-zinc-700 leading-relaxed">{word.miniStory}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Link href="/games/flashcards" className="btn-outline flex-1 text-center text-sm py-2.5">
          Practice with flashcards
        </Link>
        <Link href="/games/matching" className="btn-outline flex-1 text-center text-sm py-2.5">
          Play matching game
        </Link>
      </div>
    </div>
  );
}
