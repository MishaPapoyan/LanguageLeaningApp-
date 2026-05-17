"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { t, getLocale } from "@/lib/i18n";
import { SpeakButton } from "@/components/ui/SpeakButton";

interface SentenceData {
  id: string;
  english: string;
  words: string[]; // correct order
  distractors: string[];
}

const SENTENCES: Record<string, SentenceData[]> = {
  fr: [
    { id: "fr1",  english: "I eat an apple",           words: ["Je", "mange", "une", "pomme"],          distractors: ["boit", "grand"] },
    { id: "fr2",  english: "She is a student",          words: ["Elle", "est", "étudiante"],             distractors: ["il", "mange"] },
    { id: "fr3",  english: "We go to school",           words: ["Nous", "allons", "à", "l'école"],      distractors: ["venons", "maison"] },
    { id: "fr4",  english: "He reads a book",           words: ["Il", "lit", "un", "livre"],             distractors: ["mange", "belle"] },
    { id: "fr5",  english: "They speak French",         words: ["Ils", "parlent", "français"],           distractors: ["mangent", "anglais"] },
    { id: "fr6",  english: "I like coffee",             words: ["J'aime", "le", "café"],                 distractors: ["déteste", "thé"] },
    { id: "fr7",  english: "She has a cat",             words: ["Elle", "a", "un", "chat"],              distractors: ["chien", "mange"] },
    { id: "fr8",  english: "We are happy",              words: ["Nous", "sommes", "heureux"],            distractors: ["tristes", "mangeons"] },
    { id: "fr9",  english: "The weather is beautiful",  words: ["Le", "temps", "est", "beau"],           distractors: ["mauvais", "nuit"] },
    { id: "fr10", english: "I want some water",         words: ["Je", "veux", "de", "l'eau"],            distractors: ["mange", "rouge"] },
    { id: "fr11", english: "The dog runs fast",         words: ["Le", "chien", "court", "vite"],         distractors: ["chat", "mange"] },
    { id: "fr12", english: "I live in Paris",           words: ["J'habite", "à", "Paris"],               distractors: ["Lyon", "mange"] },
  ],
  es: [
    { id: "es1",  english: "I eat an apple",            words: ["Yo", "como", "una", "manzana"],         distractors: ["bebo", "grande"] },
    { id: "es2",  english: "She is a student",          words: ["Ella", "es", "estudiante"],             distractors: ["él", "come"] },
    { id: "es3",  english: "We go to school",           words: ["Vamos", "a", "la", "escuela"],          distractors: ["venimos", "casa"] },
    { id: "es4",  english: "He reads a book",           words: ["Él", "lee", "un", "libro"],             distractors: ["come", "bonito"] },
    { id: "es5",  english: "They speak Spanish",        words: ["Ellos", "hablan", "español"],           distractors: ["comen", "inglés"] },
    { id: "es6",  english: "I like coffee",             words: ["Me", "gusta", "el", "café"],            distractors: ["molesta", "té"] },
    { id: "es7",  english: "She has a cat",             words: ["Ella", "tiene", "un", "gato"],          distractors: ["perro", "come"] },
    { id: "es8",  english: "We are happy",              words: ["Somos", "muy", "felices"],              distractors: ["tristes", "comemos"] },
    { id: "es9",  english: "The weather is beautiful",  words: ["El", "tiempo", "es", "hermoso"],        distractors: ["malo", "noche"] },
    { id: "es10", english: "I want water",              words: ["Quiero", "agua", "por", "favor"],       distractors: ["como", "roja"] },
    { id: "es11", english: "The dog runs fast",         words: ["El", "perro", "corre", "rápido"],       distractors: ["gato", "come"] },
    { id: "es12", english: "I live in Madrid",          words: ["Vivo", "en", "Madrid"],                 distractors: ["Barcelona", "como"] },
  ],
  en: [
    { id: "en1",  english: "Put the words in order",   words: ["The", "cat", "sits", "on", "the", "mat"],        distractors: ["runs", "under"] },
    { id: "en2",  english: "She works every day",       words: ["She", "works", "every", "day"],                  distractors: ["play", "night"] },
    { id: "en3",  english: "They are playing football", words: ["They", "are", "playing", "football"],            distractors: ["is", "basketball"] },
    { id: "en4",  english: "I have two brothers",       words: ["I", "have", "two", "brothers"],                  distractors: ["sister", "three"] },
    { id: "en5",  english: "We went to the market",     words: ["We", "went", "to", "the", "market"],             distractors: ["school", "come"] },
    { id: "en6",  english: "He is reading a book",      words: ["He", "is", "reading", "a", "book"],              distractors: ["write", "magazine"] },
    { id: "en7",  english: "The train arrives at noon",  words: ["The", "train", "arrives", "at", "noon"],         distractors: ["leaves", "midnight"] },
    { id: "en8",  english: "Can you help me please",    words: ["Can", "you", "help", "me", "please"],            distractors: ["could", "them"] },
    { id: "en9",  english: "I would like some coffee",  words: ["I", "would", "like", "some", "coffee"],          distractors: ["want", "tea"] },
    { id: "en10", english: "She is taller than him",    words: ["She", "is", "taller", "than", "him"],            distractors: ["shorter", "her"] },
    { id: "en11", english: "The children are playing",  words: ["The", "children", "are", "playing"],             distractors: ["sleeping", "is"] },
    { id: "en12", english: "It is raining outside",     words: ["It", "is", "raining", "outside"],               distractors: ["snowing", "are"] },
  ],
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function SentenceBuilder({ targetLang }: { targetLang: string }) {
  const { data: session } = useSession();
  const locale = getLocale((session?.user as { nativeLanguage?: string })?.nativeLanguage);
  const lang = (["fr","es","en"].includes(targetLang) ? targetLang : "fr") as "fr" | "es" | "en";
  const langLabel = lang === "es" ? "Spanish" : lang === "en" ? "English" : "French";
  const allSentences = SENTENCES[lang];
  const ROUNDS = allSentences.length;

  const [queue] = useState(() => shuffle(allSentences));
  const [round, setRound] = useState(0);
  const [pool, setPool] = useState<{ word: string; key: string }[]>([]);
  const [answer, setAnswer] = useState<{ word: string; key: string }[]>([]);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const sentence = queue[round];

  // Build tile pool on round change
  useEffect(() => {
    if (!sentence) return;
    const tiles = shuffle([...sentence.words, ...sentence.distractors]).map((word, i) => ({
      word,
      key: `${word}-${i}`,
    }));
    setPool(tiles);
    setAnswer([]);
    setStatus("idle");
  }, [round, sentence]);

  // Timer
  useEffect(() => {
    if (finished) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [finished]);

  const checkAnswer = useCallback(
    (currentAnswer: { word: string; key: string }[]) => {
      const attempt = currentAnswer.map((t) => t.word);
      const correct = sentence.words;
      if (attempt.join(" ") === correct.join(" ")) {
        setStatus("correct");
        setScore((s) => s + 1);
        setTimeout(() => advance(true), 700);
      } else if (attempt.length === correct.length) {
        setStatus("wrong");
        setTimeout(() => {
          // Return answer tiles back to pool (reshuffled)
          setPool((p) => shuffle([...p, ...currentAnswer]));
          setAnswer([]);
          setStatus("idle");
        }, 900);
      }
    },
    [sentence, round, score]
  );

  const advance = (wasCorrect: boolean) => {
    const nextRound = round + 1;
    if (nextRound >= ROUNDS) {
      setFinished(true);
      const finalScore = score + (wasCorrect ? 1 : 0);
      fetch("/api/games/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameType: "SENTENCE_BUILDER",
          score: finalScore,
          wordsUsed: [],
        }),
      })
        .then((r) => r.json())
        .then((d) => {
          setXpEarned(d.xpEarned ?? 10);
          window.dispatchEvent(new CustomEvent("xp-updated"));
        })
        .catch(() => {});
    } else {
      setRound(nextRound);
    }
  };

  const pickTile = (tile: { word: string; key: string }) => {
    if (status !== "idle") return;
    const newAnswer = [...answer, tile];
    setPool((p) => p.filter((t) => t.key !== tile.key));
    setAnswer(newAnswer);
    checkAnswer(newAnswer);
  };

  const removeTile = (tile: { word: string; key: string }) => {
    if (status !== "idle") return;
    setAnswer((a) => a.filter((t) => t.key !== tile.key));
    setPool((p) => shuffle([...p, tile]));
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (finished) {
    const pct = Math.round((score / ROUNDS) * 100);
    return (
      <div style={{ maxWidth: 480, textAlign: "center" }}>
        <div className="card" style={{ padding: "40px 28px" }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>{pct === 100 ? "🏆" : pct >= 60 ? "🎉" : "💪"}</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", margin: "0 0 8px" }}>{t(locale, "game_done")}</h2>
          <p style={{ fontSize: 14, color: "var(--text-2)", margin: "0 0 20px" }}>
            <strong style={{ color: "var(--accent)" }}>{score}/{ROUNDS}</strong> correct · {fmt(elapsed)} · {pct}%
          </p>
          {xpEarned > 0 && (
            <div style={{ padding: "10px 16px", borderRadius: 12, background: "var(--accent-dim)", marginBottom: 20, fontSize: 14, fontWeight: 700, color: "var(--accent)" }}>
              +{xpEarned} XP earned!
            </div>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => window.location.reload()} className="btn-primary" style={{ flex: 1 }}>
              Play again
            </button>
            <Link href="/games" className="btn-outline" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
              Back
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!sentence) return null;
  const pctDone = (round / ROUNDS) * 100;
  const borderColor =
    status === "correct" ? "var(--green)" : status === "wrong" ? "var(--red)" : "var(--border-md)";

  return (
    <div style={{ maxWidth: 600 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <p style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", margin: 0 }}>{t(locale, "game_sentenceBuilder")}</p>
          <p style={{ fontSize: 12, color: "var(--text-3)", margin: 0 }}>{round + 1} of {ROUNDS}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--green)" }}>✓ {score}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-3)" }}>⏱ {fmt(elapsed)}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 5, background: "var(--surface-3)", borderRadius: 999, overflow: "hidden", marginBottom: 24 }}>
        <div style={{ height: "100%", width: `${pctDone}%`, background: "linear-gradient(90deg,var(--accent),var(--accent-2))", borderRadius: 999, transition: "width 0.3s ease" }} />
      </div>

      {/* Prompt card */}
      <div className="card" style={{ padding: "24px 24px 20px", marginBottom: 20, textAlign: "center" }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", margin: "0 0 8px" }}>
          Build this sentence in {langLabel}:
        </p>
        <p style={{ fontSize: 24, fontWeight: 900, color: "var(--accent)", margin: "0 0 10px" }}>
          {sentence.english}
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <SpeakButton text={sentence.words.join(" ")} lang={lang} size={13} />
          <span style={{ fontSize: 12, color: "var(--text-3)" }}>hear correct sentence</span>
        </div>
      </div>

      {/* Answer area */}
      <div
        style={{
          minHeight: 64,
          padding: "14px 16px",
          borderRadius: 14,
          border: `2px solid ${borderColor}`,
          background: "var(--surface-2)",
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          alignItems: "center",
          marginBottom: 16,
          transition: "border-color 0.2s",
        }}
      >
        {answer.length === 0 ? (
          <span style={{ fontSize: 13, color: "var(--text-3)", fontStyle: "italic" }}>
            Tap words below to build the sentence…
          </span>
        ) : (
          answer.map((tile) => (
            <button
              key={tile.key}
              onClick={() => removeTile(tile)}
              disabled={status !== "idle"}
              style={{
                padding: "8px 14px",
                borderRadius: 10,
                border: `1.5px solid ${status === "correct" ? "var(--green)" : status === "wrong" ? "var(--red)" : "var(--accent)"}`,
                background: status === "correct" ? "rgba(34,197,94,0.12)" : status === "wrong" ? "rgba(239,68,68,0.1)" : "var(--accent-dim)",
                color: status === "correct" ? "var(--green)" : status === "wrong" ? "var(--red)" : "var(--accent)",
                fontSize: 15,
                fontWeight: 700,
                cursor: status === "idle" ? "pointer" : "default",
                transition: "all 0.15s",
              }}
            >
              {tile.word}
            </button>
          ))
        )}
        {status === "correct" && (
          <span style={{ marginLeft: "auto", fontSize: 18, color: "var(--green)" }}>✓</span>
        )}
        {status === "wrong" && (
          <span style={{ marginLeft: "auto", fontSize: 18, color: "var(--red)" }}>✗</span>
        )}
      </div>

      {/* Word pool */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
        {pool.map((tile) => (
          <button
            key={tile.key}
            onClick={() => pickTile(tile)}
            disabled={status !== "idle"}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "1.5px solid var(--border-md)",
              background: "var(--surface-2)",
              color: "var(--text)",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.12s",
            }}
            onMouseEnter={(e) => {
              if (status === "idle") {
                e.currentTarget.style.background = "var(--accent-dim)";
                e.currentTarget.style.color = "var(--accent)";
                e.currentTarget.style.borderColor = "var(--accent)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--surface-2)";
              e.currentTarget.style.color = "var(--text)";
              e.currentTarget.style.borderColor = "var(--border-md)";
            }}
          >
            {tile.word}
          </button>
        ))}
      </div>

      {/* Correct answer hint on wrong */}
      {status === "wrong" && (
        <div style={{ marginTop: 14, padding: "10px 16px", borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", textAlign: "center" }}>
          <span style={{ fontSize: 13, color: "var(--red)" }}>
            Correct: <strong>{sentence.words.join(" ")}</strong>
          </span>
        </div>
      )}
    </div>
  );
}
