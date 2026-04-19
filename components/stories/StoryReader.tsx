"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { StoryData, WordData, QuizData } from "@/types";
import { speakTarget } from "@/lib/speech";

interface Props {
  story: StoryData;
}

export function StoryReader({ story }: Props) {
  const [selectedWord, setSelectedWord] = useState<WordData | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [savingWord, setSavingWord] = useState<string | null>(null);
  const [savedWords, setSavedWords] = useState<Set<string>>(
    new Set(story.words.filter((w) => w.isSaved).map((w) => w.id))
  );
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [xpEarned, setXpEarned] = useState(0);

  const wordMap = useMemo(
    () => new Map(story.words.map((w) => [w.word.toLowerCase(), w])),
    [story.words]
  );

  const handleWordClick = (wordText: string) => {
    const word = wordMap.get(wordText.toLowerCase());
    if (word) setSelectedWord(word);
  };

  const handleSaveWord = async (wordId: string) => {
    setSavingWord(wordId);
    const isSaved = savedWords.has(wordId);
    try {
      await fetch("/api/dictionary/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordId, remove: isSaved }),
      });
      setSavedWords((prev) => {
        const next = new Set(prev);
        if (isSaved) next.delete(wordId);
        else next.add(wordId);
        return next;
      });
    } finally {
      setSavingWord(null);
    }
  };

  const handleQuizSubmit = async () => {
    const correct = story.quizzes.filter((q, i) => quizAnswers[i] === q.answer).length;
    const score = Math.round((correct / story.quizzes.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);

    const res = await fetch(`/api/stories/${story.id}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score, completed: true }),
    });
    const data = await res.json();
    if (data.xpEarned) setXpEarned(data.xpEarned);
  };

  const paragraphs = (story.content as any).paragraphs ?? [];

  return (
    <div className="max-w-3xl mx-auto animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/stories" className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <p className="text-[11px] text-zinc-400 uppercase tracking-wider font-medium">Chapter {story.chapter}</p>
          <h1 className="text-2xl font-serif text-zinc-900">{story.title}</h1>
        </div>
        <div className="ml-auto text-4xl">{story.imageEmoji}</div>
      </div>

      {!showQuiz ? (
        <>
          {/* Story content */}
          <div className="bg-white rounded-2xl border border-zinc-100 p-6 mb-6">
            <div className="prose prose-zinc max-w-none">
              {paragraphs.map((para: any, i: number) => (
                <p key={i} className="mb-4 text-zinc-700 leading-relaxed text-base">
                  {renderParagraphWithHighlights(para, handleWordClick)}
                </p>
              ))}
            </div>
          </div>

          {/* Word tooltip */}
          {selectedWord && (
            <div className="bg-white rounded-2xl border-2 border-violet-200 p-5 mb-6 animate-fade-up">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center text-2xl flex-shrink-0">
                    {selectedWord.imageEmoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-serif text-zinc-900">{selectedWord.word}</span>
                      <button
                        onClick={() => speakTarget(selectedWord.word, story.language)}
                        className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center text-sm hover:bg-violet-100 transition-colors"
                        title="Listen"
                      >
                        ♪
                      </button>
                    </div>
                    <p className="text-violet-600 font-medium">{selectedWord.translation}</p>
                    <p className="text-sm text-zinc-600 mt-1">{selectedWord.definition}</p>
                    <p className="text-sm text-zinc-500 mt-1 italic">&ldquo;{selectedWord.exampleFr}&rdquo;</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleSaveWord(selectedWord.id)}
                    disabled={savingWord === selectedWord.id}
                    className={`text-sm px-3 py-1.5 rounded-full font-medium transition-all ${
                      savedWords.has(selectedWord.id)
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                        : "btn-outline"
                    }`}
                  >
                    {savingWord === selectedWord.id
                      ? "..."
                      : savedWords.has(selectedWord.id)
                      ? "Saved"
                      : "+ Save"}
                  </button>
                  <button onClick={() => setSelectedWord(null)} className="btn-ghost text-sm px-3 py-1.5">
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Vocabulary list */}
          <div className="bg-white rounded-2xl border border-zinc-100 p-6 mb-6">
            <h3 className="font-serif text-zinc-900 mb-3">Key Vocabulary ({story.words.length} words)</h3>
            <div className="flex flex-wrap gap-2">
              {story.words.map((word) => (
                <button
                  key={word.id}
                  onClick={() => setSelectedWord(word)}
                  className={`px-3 py-1.5 rounded-xl text-sm border transition-all ${
                    savedWords.has(word.id)
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : "bg-white border-zinc-200 text-zinc-700 hover:border-violet-300"
                  }`}
                >
                  {word.imageEmoji} {word.word}
                  {savedWords.has(word.id) && " ✓"}
                </button>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="flex justify-end">
            <button onClick={() => setShowQuiz(true)} className="btn-primary px-8 py-3">
              Take Quiz
            </button>
          </div>
        </>
      ) : (
        <Quiz
          quizzes={story.quizzes}
          quizAnswers={quizAnswers}
          setQuizAnswers={setQuizAnswers}
          submitted={quizSubmitted}
          onSubmit={handleQuizSubmit}
          score={quizScore}
          xpEarned={xpEarned}
          storyId={story.id}
        />
      )}
    </div>
  );
}

function renderParagraphWithHighlights(
  para: { text: string; highlights?: Array<{ word: string }> },
  onClick: (word: string) => void
) {
  if (!para.highlights || para.highlights.length === 0) {
    return para.text;
  }

  const words = para.highlights.map((h: any) => h.word);
  const wordSet = new Set(words.map((w: string) => w.toLowerCase()));

  const parts: React.ReactNode[] = [];
  let keyIndex = 0;

  const pattern = new RegExp(
    `(${words.map((w: string) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "gi"
  );

  const segments = para.text.split(pattern);

  for (const segment of segments) {
    const isHighlight = wordSet.has(segment.toLowerCase());
    if (isHighlight) {
      parts.push(
        <span
          key={keyIndex++}
          className="vocab-highlight"
          onClick={() => onClick(segment)}
        >
          {segment}
        </span>
      );
    } else {
      parts.push(<span key={keyIndex++}>{segment}</span>);
    }
  }

  return parts;
}

interface QuizProps {
  quizzes: QuizData[];
  quizAnswers: number[];
  setQuizAnswers: (a: number[]) => void;
  submitted: boolean;
  onSubmit: () => void;
  score: number | null;
  xpEarned: number;
  storyId: string;
}

function Quiz({ quizzes, quizAnswers, setQuizAnswers, submitted, onSubmit, score, xpEarned, storyId }: QuizProps) {
  return (
    <div className="space-y-6 animate-fade-up">
      <h2 className="text-xl font-serif text-zinc-900">Comprehension Quiz</h2>

      {score !== null && (
        <div className={`bg-white rounded-2xl border-2 text-center p-6 ${score >= 70 ? "border-emerald-300 bg-emerald-50" : "border-rose-300 bg-rose-50"}`}>
          <p className="text-4xl mb-2">{score >= 70 ? "◈" : "▤"}</p>
          <p className="text-2xl font-bold text-zinc-800">{score}%</p>
          <p className="text-zinc-600 mt-1">
            {score === 100 ? "Perfect score!" : score >= 70 ? "Well done!" : "Keep practicing!"}
          </p>
          {xpEarned > 0 && (
            <p className="text-violet-600 font-medium mt-2">+{xpEarned} XP earned!</p>
          )}
          <Link href="/stories" className="btn-primary mt-4 inline-block">
            Back to Stories
          </Link>
        </div>
      )}

      {quizzes.map((quiz, qi) => (
        <div key={quiz.id} className="bg-white rounded-2xl border border-zinc-100 p-5">
          <p className="font-medium text-zinc-800 mb-3">
            {qi + 1}. {quiz.question}
          </p>
          <div className="space-y-2">
            {quiz.options.map((option, oi) => {
              const isSelected = quizAnswers[qi] === oi;
              const isCorrect = quiz.answer === oi;
              let cls = "w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ";

              if (!submitted) {
                cls += isSelected
                  ? "border-violet-400 bg-violet-50 text-violet-700"
                  : "border-zinc-200 hover:border-zinc-300 text-zinc-700";
              } else {
                if (isCorrect) cls += "border-emerald-400 bg-emerald-50 text-emerald-700";
                else if (isSelected && !isCorrect) cls += "border-rose-400 bg-rose-50 text-rose-700";
                else cls += "border-zinc-200 text-zinc-400";
              }

              return (
                <button
                  key={oi}
                  className={cls}
                  onClick={() => {
                    if (!submitted) {
                      const next = [...quizAnswers];
                      next[qi] = oi;
                      setQuizAnswers(next);
                    }
                  }}
                  disabled={submitted}
                >
                  {String.fromCharCode(65 + oi)}. {option}
                  {submitted && isCorrect && " ✓"}
                  {submitted && isSelected && !isCorrect && " ✗"}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {!submitted && (
        <button
          onClick={onSubmit}
          disabled={quizAnswers.length < quizzes.length}
          className="btn-primary w-full py-3"
        >
          Submit Quiz
        </button>
      )}
    </div>
  );
}
