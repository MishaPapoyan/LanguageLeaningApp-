"use client";

import { useState, useCallback } from "react";
import { Volume2 } from "lucide-react";
import { speakTarget } from "@/lib/speech";

interface SpeakButtonProps {
  text: string;
  lang: string;           // "fr" | "es" | "en" etc.
  size?: number;          // icon px (default 15)
  rate?: number;          // speech rate (default 0.85)
  style?: React.CSSProperties;
}

export function SpeakButton({ text, lang, size = 15, rate = 0.85, style }: SpeakButtonProps) {
  const [playing, setPlaying] = useState(false);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (playing || !text) return;
    setPlaying(true);
    speakTarget(text.trim(), lang, rate, {
      onEnd:  () => setPlaying(false),
      onError: () => setPlaying(false),
    });
  }, [text, lang, rate, playing]);

  return (
    <button
      onClick={handleClick}
      title="Hear pronunciation"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width:  size + 16,
        height: size + 16,
        borderRadius: "50%",
        border: `1.5px solid ${playing ? "var(--accent)" : "var(--border-md)"}`,
        background: playing ? "var(--accent-dim)" : "transparent",
        color: playing ? "var(--accent)" : "var(--text-3)",
        cursor: playing ? "default" : "pointer",
        transition: "all 0.15s",
        flexShrink: 0,
        animation: playing ? "speak-pulse 0.9s ease-in-out infinite" : "none",
        ...style,
      }}
    >
      <Volume2 size={size} />
      <style>{`
        @keyframes speak-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(1.18); }
        }
      `}</style>
    </button>
  );
}
