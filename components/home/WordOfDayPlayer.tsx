"use client";

import { Volume2 } from "lucide-react";
import { speak } from "@/lib/speech";

interface Props {
  word: string;
  ttsLocale?: string;
}

export function WordOfDayPlayer({ word, ttsLocale = "fr-FR" }: Props) {
  const handlePlay = () => {
    speak(word, { lang: ttsLocale, rate: 0.85 });
  };

  return (
    <button
      aria-label="Listen to pronunciation"
      onClick={handlePlay}
      className="flex items-center justify-center rounded-full p-1 transition-opacity hover:opacity-70"
      style={{ color: "var(--text-3)", background: "transparent", border: "none", cursor: "pointer" }}
    >
      <Volume2 size={14} />
    </button>
  );
}
