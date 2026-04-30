"use client";

import { useState, useCallback, useRef } from "react";
import { Volume2, Loader2 } from "lucide-react";
import { speakTarget } from "@/lib/speech";

const SPEEDS = [
  { label: "0.75×", value: 0.75 },
  { label: "1×",    value: 1.0  },
  { label: "1.25×", value: 1.25 },
];

interface SpeakButtonProps {
  text: string;
  lang: string;
  size?: number;
  rate?: number;
  /** Show 0.75× / 1× / 1.25× speed selector next to the button */
  showSpeed?: boolean;
  style?: React.CSSProperties;
}

export function SpeakButton({
  text,
  lang,
  size = 15,
  rate = 0.85,
  showSpeed = false,
  style,
}: SpeakButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "playing">("idle");
  const [speed, setSpeed] = useState(rate);
  const ignoreRef = useRef(false);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (status !== "idle" || !text) return;
      ignoreRef.current = false;
      speakTarget(text.trim(), lang, speed, {
        onLoading: () => { if (!ignoreRef.current) setStatus("loading"); },
        onPlaying: () => { if (!ignoreRef.current) setStatus("playing"); },
        onEnd:     () => { if (!ignoreRef.current) setStatus("idle"); },
        onError:   () => { if (!ignoreRef.current) setStatus("idle"); },
      });
    },
    [text, lang, speed, status]
  );

  const isLoading = status === "loading";
  const isPlaying = status === "playing";
  const active = isLoading || isPlaying;

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <button
        onClick={handleClick}
        title={isLoading ? "Loading…" : isPlaying ? "Playing" : "Hear pronunciation"}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: size + 16,
          height: size + 16,
          borderRadius: "50%",
          border: `1.5px solid ${active ? "var(--accent)" : "var(--border-md)"}`,
          background: active ? "var(--accent-dim)" : "transparent",
          color: active ? "var(--accent)" : "var(--text-3)",
          cursor: active ? "default" : "pointer",
          transition: "all 0.15s",
          flexShrink: 0,
          animation: isPlaying ? "speak-pulse 0.9s ease-in-out infinite" : "none",
          ...style,
        }}
      >
        {isLoading
          ? <Loader2 size={size} style={{ animation: "spin 0.8s linear infinite" }} />
          : <Volume2 size={size} />
        }
      </button>

      {showSpeed && (
        <span style={{ display: "inline-flex", gap: 2 }}>
          {SPEEDS.map((s) => (
            <button
              key={s.value}
              onClick={(e) => { e.stopPropagation(); setSpeed(s.value); }}
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 6px",
                borderRadius: 6,
                border: `1px solid ${speed === s.value ? "var(--accent)" : "var(--border)"}`,
                background: speed === s.value ? "var(--accent-dim)" : "transparent",
                color: speed === s.value ? "var(--accent-2)" : "var(--text-3)",
                cursor: "pointer",
                transition: "all 0.12s",
                fontFamily: "var(--font-mono)",
              }}
            >
              {s.label}
            </button>
          ))}
        </span>
      )}

      <style>{`
        @keyframes speak-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(1.18); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </span>
  );
}
