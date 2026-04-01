"use client";

import { useState, useCallback } from "react";
import { speak } from "@/lib/speech";

interface Word {
  id: string;
  word: string;
  translation: string;
  exampleFr: string;
  exampleEn: string;
  imageEmoji: string;
  category: string;
}

interface Props {
  words: Word[];
  categories: string[];
}

export function PronunciationClient({ words, categories }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [speed, setSpeed] = useState<number>(0.7);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [playing, setPlaying] = useState(false);

  const filtered = selectedCategory
    ? words.filter((w) => w.category === selectedCategory)
    : words;

  const speakText = useCallback((text: string, lang = "fr-FR") => {
    setPlaying(true);
    speak(text, {
      lang,
      rate: speed,
      onEnd: () => setPlaying(false),
      onError: () => setPlaying(false),
    });
  }, [speed]);

  const playWord = (word: Word) => {
    setCurrentWord(word);
    speakText(word.word);
  };

  const playExample = (word: Word) => {
    setCurrentWord(word);
    speak(word.exampleFr);
  };

  return (
    <>
      {/* Tip */}
      <div className="flex items-start gap-3 bg-violet-50 rounded-xl p-4 mb-6 ring-1 ring-violet-100">
        <span className="text-lg">♪</span>
        <p className="text-sm text-violet-800">
          <span className="font-semibold">How to practice:</span> Click the speaker icon to hear a word,
          then try repeating it out loud. Use the speed slider to slow it down.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-5 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">
              Speed: {speed === 0.5 ? "Slow" : speed === 0.7 ? "Normal" : "Fast"}
            </label>
            <input
              type="range"
              min={0.3}
              max={1.0}
              step={0.1}
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full accent-violet-500"
            />
            <div className="flex justify-between text-[11px] text-zinc-400 mt-0.5">
              <span>Slow</span>
              <span>Fast</span>
            </div>
          </div>
        </div>
      </div>

      {/* Currently playing */}
      {currentWord && (
        <div className="bg-white rounded-2xl border-2 border-violet-200 p-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-violet-50 flex items-center justify-center text-3xl flex-shrink-0">
              {currentWord.imageEmoji}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-2xl font-serif text-zinc-900">{currentWord.word}</p>
                {playing && (
                  <span className="inline-flex items-center gap-1 text-violet-600 text-xs animate-pulse font-medium">
                    Playing...
                  </span>
                )}
              </div>
              <p className="text-violet-600 font-medium">{currentWord.translation}</p>
              <p className="text-sm text-zinc-500 mt-1 italic">&ldquo;{currentWord.exampleFr}&rdquo;</p>
              <p className="text-xs text-zinc-400">{currentWord.exampleEn}</p>
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <button
                onClick={() => speakText(currentWord.word)}
                className="btn-primary text-sm px-3 py-2"
                disabled={playing}
              >
                ♪ Word
              </button>
              <button
                onClick={() => speakText(currentWord.exampleFr)}
                className="btn-outline text-sm px-3 py-2"
                disabled={playing}
              >
                ♪ Example
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Word list */}
      <div className="space-y-2">
        {filtered.map((word) => (
          <div
            key={word.id}
            className={`bg-white rounded-2xl border p-4 flex items-center gap-3 cursor-pointer transition-all hover:shadow-sm ${
              currentWord?.id === word.id ? "border-violet-300 bg-violet-50/30" : "border-zinc-100 hover:border-zinc-200"
            }`}
            onClick={() => playWord(word)}
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-xl flex-shrink-0">
              {word.imageEmoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-zinc-800">{word.word}</span>
                <span className="text-sm text-violet-600">{word.translation}</span>
              </div>
              <p className="text-[11px] text-zinc-400 truncate mt-0.5">{word.exampleFr}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); playWord(word); }}
                className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center hover:bg-violet-100 transition-colors text-sm"
                title="Listen to word"
              >
                ♪
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); playExample(word); }}
                className="w-8 h-8 rounded-lg bg-zinc-50 text-zinc-500 flex items-center justify-center hover:bg-zinc-100 transition-colors text-sm"
                title="Listen to example"
              >
                ◈
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-zinc-400">
          <p className="text-2xl mb-2">♪</p>
          <p>No words found in this category</p>
        </div>
      )}
    </>
  );
}
