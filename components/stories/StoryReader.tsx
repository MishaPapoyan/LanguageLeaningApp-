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
        <Link href="/stories" style={{ width: 32, height: 32, borderRadius: 10, background: "var(--surface-2)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-2)" }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <p style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Chapter {story.chapter}</p>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-display)", letterSpacing: "-0.015em" }}>{story.title}</h1>
        </div>
        <div className="ml-auto text-4xl">{story.imageEmoji}</div>
      </div>

      {!showQuiz ? (
        <>
          {/* Story content */}
          <div className="bento p-6 mb-6">
            {paragraphs.map((para: any, i: number) => (
              <p key={i} style={{ marginBottom: 16, color: "var(--text-1)", lineHeight: 1.75, fontSize: 16 }}>
                {renderParagraphWithHighlights(para, handleWordClick)}
              </p>
            ))}
          </div>

          {/* Word tooltip */}
          {selectedWord && (
            <div className="bento p-5 mb-6 animate-fade-up" style={{ border: "1px solid rgba(99,102,241,0.3)", boxShadow: "0 0 24px rgba(99,102,241,0.12)" }}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
                    {selectedWord.imageEmoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-display)" }}>{selectedWord.word}</span>
                      <button
                        onClick={() => speakTarget(selectedWord.word, story.language)}
                        style={{ width: 28, height: 28, borderRadius: 8, background: "var(--accent-dim)", color: "var(--accent-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, border: "none", cursor: "pointer" }}
                        title="Listen"
                      >
                        ♪
                      </button>
                    </div>
                    <p style={{ color: "var(--accent-2)", fontWeight: 600, marginTop: 2 }}>{selectedWord.translation}</p>
                    <p style={{ fontSize: 13, color: "var(--text-2)", marginTop: 4 }}>{selectedWord.definition}</p>
                    <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 3, fontStyle: "italic" }}>&ldquo;{selectedWord.exampleFr}&rdquo;</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleSaveWord(selectedWord.id)}
                    disabled={savingWord === selectedWord.id}
                    style={{
                      fontSize: 12, padding: "6px 14px", borderRadius: 999, fontWeight: 600,
                      background: savedWords.has(selectedWord.id) ? "var(--green-dim)" : "var(--accent-dim)",
                      color: savedWords.has(selectedWord.id) ? "var(--green)" : "var(--accent-2)",
                      border: `1px solid ${savedWords.has(selectedWord.id) ? "rgba(16,185,129,0.3)" : "rgba(99,102,241,0.3)"}`,
                      cursor: "pointer",
                    }}
                  >
                    {savingWord === selectedWord.id ? "..." : savedWords.has(selectedWord.id) ? "✓ Saved" : "+ Save"}
                  </button>
                  <button onClick={() => setSelectedWord(null)} className="btn-ghost text-sm px-3 py-1.5">
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Vocabulary list */}
          <div className="bento p-5 mb-6">
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>
              Key Vocabulary · {story.words.length} words
            </p>
            <div className="flex flex-wrap gap-2">
              {story.words.map((word) => (
                <button
                  key={word.id}
                  onClick={() => setSelectedWord(word)}
                  style={{
                    padding: "6px 12px", borderRadius: 10, fontSize: 13, border: "1px solid",
                    transition: "all 0.12s", cursor: "pointer",
                    background: savedWords.has(word.id) ? "var(--green-dim)" : "var(--surface-2)",
                    borderColor: savedWords.has(word.id) ? "rgba(16,185,129,0.3)" : "var(--border-md)",
                    color: savedWords.has(word.id) ? "var(--green)" : "var(--text-2)",
                  }}
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
    <div className="space-y-5 animate-fade-up">
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-display)" }}>
        Comprehension Quiz
      </h2>

      {score !== null && (
        <div
          style={{
            borderRadius: 18, padding: "24px", textAlign: "center",
            background: score >= 70 ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
            border: `2px solid ${score >= 70 ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
            boxShadow: score >= 70 ? "0 4px 24px rgba(16,185,129,0.1)" : "0 4px 24px rgba(239,68,68,0.1)",
          }}
        >
          <p style={{ fontSize: 36, marginBottom: 8 }}>{score >= 70 ? "◈" : "▤"}</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: score >= 70 ? "var(--green)" : "var(--red)", fontFamily: "var(--font-mono)", letterSpacing: "-0.02em" }}>
            {score}%
          </p>
          <p style={{ color: "var(--text-2)", marginTop: 4, fontSize: 14 }}>
            {score === 100 ? "Perfect score!" : score >= 70 ? "Well done!" : "Keep practicing!"}
          </p>
          {xpEarned > 0 && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10,
              background: "var(--accent-dim)", border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: 999, padding: "5px 14px",
              fontSize: 13, fontWeight: 800, color: "var(--accent-2)",
            }}>
              ⚡ +{xpEarned} XP earned!
            </div>
          )}
          <div style={{ marginTop: 16 }}>
            <Link href="/stories" className="btn-primary">
              Back to Stories
            </Link>
          </div>
        </div>
      )}

      {quizzes.map((quiz, qi) => (
        <div key={quiz.id} style={{
          borderRadius: 16, padding: "18px 20px",
          background: "var(--surface-2)", border: "1px solid var(--border)",
        }}>
          <p style={{ fontWeight: 600, color: "var(--text)", marginBottom: 12, fontSize: 14 }}>
            {qi + 1}. {quiz.question}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {quiz.options.map((option, oi) => {
              const isSelected = quizAnswers[qi] === oi;
              const isCorrect = quiz.answer === oi;

              let bg = "var(--surface-3)";
              let border = "var(--border)";
              let color = "var(--text-2)";

              if (!submitted) {
                if (isSelected) { bg = "var(--accent-dim)"; border = "rgba(99,102,241,0.5)"; color = "var(--accent-2)"; }
              } else {
                if (isCorrect)               { bg = "rgba(16,185,129,0.10)"; border = "rgba(16,185,129,0.4)"; color = "var(--green)"; }
                else if (isSelected)         { bg = "rgba(239,68,68,0.10)";  border = "rgba(239,68,68,0.4)";  color = "var(--red)"; }
                else                         { bg = "var(--surface-3)"; border = "var(--border)"; color = "var(--text-3)"; }
              }

              return (
                <button
                  key={oi}
                  onClick={() => {
                    if (!submitted) {
                      const next = [...quizAnswers];
                      next[qi] = oi;
                      setQuizAnswers(next);
                    }
                  }}
                  disabled={submitted}
                  style={{
                    width: "100%", textAlign: "left", padding: "11px 14px",
                    borderRadius: 11, border: `1px solid ${border}`,
                    background: bg, color, fontSize: 13, fontWeight: 500,
                    cursor: submitted ? "default" : "pointer",
                    transition: "all 0.12s",
                  }}
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
          className="btn-primary w-full"
          style={{ padding: "13px" }}
        >
          Submit Quiz
        </button>
      )}
    </div>
  );
}
