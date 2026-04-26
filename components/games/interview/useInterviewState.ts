"use client";
import { useCallback, useEffect, useMemo, useState } from "react";

export type Phase = "intro" | "asking" | "correct" | "wrong" | "complete";

export interface Answer {
  text: string;
  correct: boolean;
}

export interface Question {
  id: string;
  question: string;
  answers: Answer[];  // will be shuffled on init
}

const QUESTIONS: Record<string, Question[]> = {
  fr: [
    {
      id: "intro",
      question: "Bonjour ! Comment vous appelez-vous ?",
      answers: [
        { text: "Je m'appelle Marie Dupont, enchantée.", correct: true },
        { text: "Je voudrais un café, s'il vous plaît.", correct: false },
        { text: "Il fait très beau aujourd'hui.", correct: false },
      ],
    },
    {
      id: "experience",
      question: "Quelle est votre expérience professionnelle ?",
      answers: [
        { text: "J'ai trois ans d'expérience en marketing digital.", correct: true },
        { text: "Je n'ai jamais vraiment travaillé.", correct: false },
        { text: "J'aime surtout regarder la télévision.", correct: false },
      ],
    },
    {
      id: "motivation",
      question: "Pourquoi voulez-vous travailler ici ?",
      answers: [
        { text: "Je suis passionné par l'innovation de votre entreprise.", correct: true },
        { text: "Parce que j'ai besoin d'argent rapidement.", correct: false },
        { text: "Je ne sais pas vraiment pourquoi.", correct: false },
      ],
    },
    {
      id: "strengths",
      question: "Quels sont vos points forts ?",
      answers: [
        { text: "Je suis organisé, créatif et je travaille bien en équipe.", correct: true },
        { text: "J'arrive souvent en retard le matin.", correct: false },
        { text: "Je n'ai pas de qualités particulières.", correct: false },
      ],
    },
    {
      id: "questions",
      question: "Avez-vous des questions pour nous ?",
      answers: [
        { text: "Oui, quand est-ce que je pourrais commencer ?", correct: true },
        { text: "Non, je n'ai vraiment aucune question.", correct: false },
        { text: "Est-ce que je peux partir maintenant ?", correct: false },
      ],
    },
  ],
  es: [
    {
      id: "intro",
      question: "¡Buenos días! ¿Cómo se llama usted?",
      answers: [
        { text: "Me llamo Carlos García, es un placer.", correct: true },
        { text: "Quisiera un vaso de agua, por favor.", correct: false },
        { text: "Hace muy buen tiempo hoy.", correct: false },
      ],
    },
    {
      id: "experience",
      question: "¿Cuál es su experiencia profesional?",
      answers: [
        { text: "Tengo tres años de experiencia en marketing digital.", correct: true },
        { text: "Nunca he trabajado realmente antes.", correct: false },
        { text: "Me gusta mucho ver la televisión.", correct: false },
      ],
    },
    {
      id: "motivation",
      question: "¿Por qué quiere trabajar aquí?",
      answers: [
        { text: "Me apasiona la innovación de su empresa.", correct: true },
        { text: "Porque necesito dinero urgentemente.", correct: false },
        { text: "La verdad es que no lo sé bien.", correct: false },
      ],
    },
    {
      id: "strengths",
      question: "¿Cuáles son sus puntos fuertes?",
      answers: [
        { text: "Soy organizado, creativo y trabajo bien en equipo.", correct: true },
        { text: "Suelo llegar tarde por las mañanas.", correct: false },
        { text: "No tengo ninguna cualidad especial.", correct: false },
      ],
    },
    {
      id: "questions",
      question: "¿Tiene alguna pregunta para nosotros?",
      answers: [
        { text: "Sí, ¿cuándo podría incorporarme al puesto?", correct: true },
        { text: "No, no tengo ninguna pregunta.", correct: false },
        { text: "¿Puedo marcharme ya?", correct: false },
      ],
    },
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

export interface InterviewState {
  phase: Phase;
  setPhase: (p: Phase) => void;
  round: number;
  score: number;
  total: number;
  questions: Question[];
  currentQuestion: Question | null;
  language: string;
  selectedAnswer: number | null;
  onAnswer: (index: number) => void;
  advanceRound: () => void;
  restart: () => void;
}

export function useInterviewState(language: string): InterviewState {
  const lang = language === "es" ? "es" : "fr";

  const questions = useMemo(() =>
    QUESTIONS[lang].map((q) => ({ ...q, answers: shuffle(q.answers) })),
    [lang]
  );

  const [phase, setPhase] = useState<Phase>("intro");
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const currentQuestion = round < questions.length ? questions[round] : null;

  const onAnswer = useCallback((index: number) => {
    if (phase !== "asking" || selectedAnswer !== null) return;
    setSelectedAnswer(index);
    const isCorrect = questions[round]?.answers[index]?.correct ?? false;
    if (isCorrect) {
      setScore((s) => s + 20);
      setPhase("correct");
    } else {
      setPhase("wrong");
    }
  }, [phase, selectedAnswer, questions, round]);

  const advanceRound = useCallback(() => {
    setSelectedAnswer(null);
    setRound((r) => r + 1);
  }, []);

  useEffect(() => {
    if (round === 0) return;
    if (round >= questions.length) {
      setPhase("complete");
    } else {
      setPhase("asking");
    }
  }, [round, questions.length]);

  const restart = useCallback(() => {
    setPhase("intro");
    setRound(0);
    setScore(0);
    setSelectedAnswer(null);
  }, []);

  return {
    phase,
    setPhase,
    round: Math.min(round + 1, questions.length),
    score,
    total: questions.length,
    questions,
    currentQuestion,
    language: lang,
    selectedAnswer,
    onAnswer,
    advanceRound,
    restart,
  };
}
