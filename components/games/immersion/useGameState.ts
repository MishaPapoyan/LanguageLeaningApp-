"use client";
import { useCallback, useEffect, useMemo, useState } from "react";

export type Phase = "intro" | "idle" | "asking" | "correct" | "wrong" | "complete";

export interface VocabItem {
  id: string;
  word: string;
  instruction: string;
}

const VOCAB: Record<string, VocabItem[]> = {
  fr: [
    { id: "cafe",      word: "café",       instruction: "Donnez-moi un café, s'il vous plaît" },
    { id: "eau",       word: "l'eau",      instruction: "Je voudrais de l'eau, s'il vous plaît" },
    { id: "croissant", word: "croissant",  instruction: "Un croissant, s'il vous plaît" },
    { id: "sucre",     word: "sucre",      instruction: "Avez-vous du sucre ?" },
    { id: "addition",  word: "l'addition", instruction: "L'addition, s'il vous plaît" },
  ],
  es: [
    { id: "cafe",      word: "café",       instruction: "Un café, por favor" },
    { id: "agua",      word: "agua",       instruction: "Un vaso de agua, por favor" },
    { id: "croissant", word: "croissant",  instruction: "Un croissant, por favor" },
    { id: "azucar",    word: "azúcar",     instruction: "¿Tiene azúcar?" },
    { id: "cuenta",    word: "la cuenta",  instruction: "La cuenta, por favor" },
  ],
};

export interface GameState {
  phase: Phase;
  setPhase: (p: Phase) => void;
  round: number;
  score: number;
  vocab: VocabItem[];
  currentTask: VocabItem | null;
  language: string;
  onCorrect: () => void;
  onWrong: () => void;
  advanceFromCorrect: () => void;
  advanceFromWrong: () => void;
  arriveAtTable: () => void;
  restart: () => void;
}

export function useGameState(language: string): GameState {
  const lang = language === "es" ? "es" : "fr";
  const vocab = useMemo(() => VOCAB[lang], [lang]);
  const [phase, setPhase] = useState<Phase>("intro");
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);

  const currentTask = round < vocab.length ? vocab[round] : null;

  const onCorrect = useCallback(() => {
    setScore((s) => s + 15);
    setPhase("correct");
  }, []);

  const onWrong = useCallback(() => {
    setScore((s) => Math.max(0, s - 5));
    setPhase("wrong");
  }, []);

  const advanceFromCorrect = useCallback(() => {
    setRound((r) => r + 1);
  }, []);

  const advanceFromWrong = useCallback(() => {
    setPhase("asking");
  }, []);

  const arriveAtTable = useCallback(() => {
    setPhase("asking");
  }, []);

  // When round changes, decide if game complete or continue asking
  useEffect(() => {
    if (round === 0) return;
    if (round >= vocab.length) {
      setPhase("complete");
    } else {
      setPhase("asking");
    }
  }, [round, vocab.length]);

  const restart = useCallback(() => {
    setPhase("intro");
    setRound(0);
    setScore(0);
  }, []);

  return {
    phase,
    setPhase,
    round: Math.min(round + 1, vocab.length),
    score,
    vocab,
    currentTask,
    language: lang,
    onCorrect,
    onWrong,
    advanceFromCorrect,
    advanceFromWrong,
    arriveAtTable,
    restart,
  };
}
