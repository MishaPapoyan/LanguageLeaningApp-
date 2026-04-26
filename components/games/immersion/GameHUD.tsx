"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { GameState } from "./useGameState";

interface GameHUDProps {
  state: GameState;
  onRepeat: () => void;
  onRestart: () => void;
}

export default function GameHUD({ state, onRepeat, onRestart }: GameHUDProps) {
  const { phase, round, score, vocab, currentTask, language } = state;
  const total = vocab.length;
  const flag = language === "es" ? "🇪🇸" : "🇫🇷";
  const [visible, setVisible] = useState(false);
  const [flashColor, setFlashColor] = useState<string | null>(null);

  // Slide bubble in when asking
  useEffect(() => {
    if (phase === "asking" || phase === "wrong") {
      setVisible(true);
    } else if (phase === "correct" || phase === "intro") {
      setVisible(false);
    }
  }, [phase]);

  // Flash feedback
  useEffect(() => {
    if (phase === "correct") {
      setFlashColor("rgba(34,197,94,0.22)");
      const t = setTimeout(() => setFlashColor(null), 700);
      return () => clearTimeout(t);
    }
    if (phase === "wrong") {
      setFlashColor("rgba(239,68,68,0.22)");
      const t = setTimeout(() => setFlashColor(null), 600);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const responseText =
    phase === "correct"
      ? language === "es" ? "¡Perfecto! 👍" : "Parfait ! 👍"
      : phase === "wrong"
      ? language === "es" ? "No, no… 🙈" : "Non, non… 🙈"
      : null;

  const isComplete = phase === "complete";

  return (
    <>
      {/* Full-screen flash */}
      {flashColor && (
        <div
          style={{
            position: "absolute", inset: 0,
            background: flashColor,
            pointerEvents: "none",
            zIndex: 20,
            transition: "opacity 0.3s",
            borderRadius: "inherit",
          }}
        />
      )}

      {/* Top HUD bar */}
      {!isComplete && (
        <div
          style={{
            position: "absolute", top: 16, left: "50%",
            transform: "translateX(-50%)",
            display: "flex", alignItems: "center", gap: 20,
            background: "rgba(10,8,6,0.72)",
            backdropFilter: "blur(8px)",
            borderRadius: 999,
            padding: "8px 24px",
            zIndex: 10,
            pointerEvents: "none",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 800, color: "#FFD580" }}>
            ⭐ {score} pts
          </span>
          <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.2)" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>
            {flag} Round {Math.min(round, total)} / {total}
          </span>
          {/* progress dots */}
          <div style={{ display: "flex", gap: 5 }}>
            {vocab.map((_, i) => (
              <div
                key={i}
                style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: i < round - 1
                    ? "#4ade80"
                    : i === round - 1
                    ? "#FFD580"
                    : "rgba(255,255,255,0.2)",
                  transition: "background 0.3s",
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Bottom speech bubble */}
      <div
        style={{
          position: "absolute",
          bottom: visible ? 24 : -140,
          left: "50%",
          transform: "translateX(-50%)",
          transition: "bottom 0.4s cubic-bezier(.34,1.56,.64,1)",
          zIndex: 10,
          width: "min(92%, 680px)",
        }}
      >
        <div
          style={{
            background: "rgba(8,6,4,0.82)",
            backdropFilter: "blur(12px)",
            borderRadius: 20,
            padding: "16px 22px",
            border: "1px solid rgba(255,214,128,0.2)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          {/* Waiter avatar */}
          <div
            style={{
              width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg,#1a1a2e,#3a2a1a)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, border: "2px solid rgba(255,214,128,0.3)",
            }}
          >
            🤵
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            {/* instruction or response */}
            {phase === "asking" && currentTask ? (
              <>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 3, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {flag} Waiter says
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                  {currentTask.instruction.split(currentTask.word).map((part, i, arr) =>
                    i < arr.length - 1 ? (
                      <span key={i}>
                        {part}
                        <span style={{ color: "#FFD580", fontWeight: 900 }}>{currentTask.word}</span>
                      </span>
                    ) : (
                      <span key={i}>{part}</span>
                    )
                  )}
                </div>
              </>
            ) : responseText ? (
              <div style={{ fontSize: 18, fontWeight: 800, color: phase === "correct" ? "#4ade80" : "#f87171" }}>
                {responseText}
              </div>
            ) : null}
          </div>

          {/* Repeat button */}
          {phase === "asking" && (
            <button
              onClick={onRepeat}
              style={{
                flexShrink: 0,
                background: "rgba(255,214,128,0.12)",
                border: "1px solid rgba(255,214,128,0.3)",
                color: "#FFD580",
                borderRadius: 10,
                padding: "7px 14px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                transition: "all 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,214,128,0.22)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,214,128,0.12)")}
            >
              🔊 Répéter
            </button>
          )}
        </div>
      </div>

      {/* Game complete overlay */}
      {isComplete && (
        <div
          style={{
            position: "absolute", inset: 0,
            background: "rgba(8,6,4,0.88)",
            backdropFilter: "blur(10px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 30,
            borderRadius: "inherit",
          }}
        >
          <div
            style={{
              textAlign: "center",
              padding: "40px 48px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,214,128,0.25)",
              borderRadius: 24,
              boxShadow: "0 24px 80px rgba(0,0,0,0.8)",
              maxWidth: 400,
              width: "90%",
            }}
          >
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <h2
              style={{
                fontSize: 28, fontWeight: 900, color: "#FFD580",
                margin: "0 0 8px", lineHeight: 1.2,
              }}
            >
              {language === "es" ? "¡Très bien !" : "Très bien !"}
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", margin: "0 0 24px" }}>
              {language === "es" ? "Completaste el café" : "Vous avez terminé le café"} ☕
            </p>

            {/* Score */}
            <div
              style={{
                background: "rgba(255,214,128,0.08)",
                border: "1px solid rgba(255,214,128,0.2)",
                borderRadius: 16,
                padding: "16px 24px",
                marginBottom: 28,
              }}
            >
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Final Score
              </div>
              <div style={{ fontSize: 42, fontWeight: 900, color: "#FFD580" }}>
                {score} <span style={{ fontSize: 18, color: "rgba(255,255,255,0.4)" }}>/ {total * 15}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 10 }}>
                {vocab.map((_, i) => (
                  <span key={i} style={{ fontSize: 18 }}>⭐</span>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={onRestart}
                style={{
                  padding: "11px 22px",
                  borderRadius: 12,
                  border: "none",
                  background: "linear-gradient(135deg,#f59e0b,#d97706)",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 4px 20px rgba(245,158,11,0.4)",
                }}
              >
                ↺ Play Again
              </button>
              <Link
                href="/games"
                style={{
                  padding: "11px 22px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.8)",
                  fontSize: 14,
                  fontWeight: 700,
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                ← Back to Games
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Intro overlay */}
      {phase === "intro" && (
        <div
          style={{
            position: "absolute", bottom: 24, left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(8,6,4,0.75)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,214,128,0.2)",
            borderRadius: 16,
            padding: "12px 24px",
            zIndex: 10,
            pointerEvents: "none",
            color: "rgba(255,255,255,0.6)",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {flag} {language === "es" ? "Un camarero se acerca…" : "Un serveur s'approche…"}
        </div>
      )}
    </>
  );
}
