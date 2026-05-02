"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { InterviewState } from "./useInterviewState";

interface InterviewHUDProps {
  state: InterviewState;
  onRepeat: () => void;
  onRestart: () => void;
}

export default function InterviewHUD({ state, onRepeat, onRestart }: InterviewHUDProps) {
  const { phase, round, score, total, currentQuestion, language, selectedAnswer, onAnswer } = state;
  const flag = language === "es" ? "🇪🇸" : language === "en" ? "🇬🇧" : "🇫🇷";
  const [flash, setFlash] = useState<string | null>(null);
  const [questionVisible, setQuestionVisible] = useState(false);
  const [answersVisible, setAnswersVisible] = useState(false);

  // Slide question in
  useEffect(() => {
    if (phase === "asking") {
      setQuestionVisible(true);
      const t = setTimeout(() => setAnswersVisible(true), 600);
      return () => clearTimeout(t);
    } else {
      setAnswersVisible(false);
      if (phase !== "correct" && phase !== "wrong") setQuestionVisible(false);
    }
  }, [phase]);

  // Flash on answer
  useEffect(() => {
    if (phase === "correct") {
      setFlash("rgba(34,197,94,0.2)");
      const t = setTimeout(() => setFlash(null), 800);
      return () => clearTimeout(t);
    }
    if (phase === "wrong") {
      setFlash("rgba(239,68,68,0.18)");
      const t = setTimeout(() => setFlash(null), 700);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const isComplete = phase === "complete";
  const pct = score / (total * 20);
  const resultEmoji = pct >= 0.8 ? "🎉" : pct >= 0.6 ? "😅" : "😔";
  const resultTitle =
    pct >= 0.8
      ? language === "es" ? "¡Está contratado!" : language === "en" ? "You're hired!" : "Vous êtes engagé !"
      : pct >= 0.6
      ? language === "es" ? "Casi… quizás la próxima vez" : language === "en" ? "Close… maybe next time!" : "Presque… peut-être la prochaine fois"
      : language === "es" ? "Sigue practicando" : language === "en" ? "Keep practising!" : "Continuez à pratiquer";

  return (
    <>
      {/* Screen flash */}
      {flash && (
        <div style={{ position: "absolute", inset: 0, background: flash, pointerEvents: "none", zIndex: 20 }} />
      )}

      {/* Top bar */}
      {!isComplete && (
        <div style={{
          position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)",
          display: "flex", alignItems: "center", gap: 16,
          background: "rgba(10,12,20,0.78)", backdropFilter: "blur(8px)",
          borderRadius: 999, padding: "8px 22px", zIndex: 10, pointerEvents: "none",
          border: "1px solid rgba(255,255,255,0.1)",
        }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#7dd3fc" }}>
            💼 Interview
          </span>
          <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.15)" }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#FFD580" }}>
            ⭐ {score} pts
          </span>
          <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.15)" }} />
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
            {flag} Q {Math.min(round, total)} / {total}
          </span>
          {/* Progress dots */}
          <div style={{ display: "flex", gap: 4 }}>
            {Array.from({ length: total }).map((_, i) => (
              <div key={i} style={{
                width: 7, height: 7, borderRadius: "50%",
                background: i < round - 1 ? "#4ade80" : i === round - 1 ? "#FFD580" : "rgba(255,255,255,0.2)",
                transition: "background 0.3s",
              }} />
            ))}
          </div>
        </div>
      )}

      {/* Intro hint */}
      {phase === "intro" && (
        <div style={{
          position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: "rgba(10,12,20,0.75)", backdropFilter: "blur(8px)",
          border: "1px solid rgba(125,211,252,0.25)", borderRadius: 14,
          padding: "11px 24px", zIndex: 10, pointerEvents: "none",
          color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: 600,
        }}>
          {flag} {language === "es" ? "El entrevistador está listo para comenzar…" : language === "en" ? "The interviewer is ready to begin…" : "L'entretien va commencer…"}
        </div>
      )}

      {/* Question bubble */}
      {(phase === "asking" || phase === "correct" || phase === "wrong") && currentQuestion && (
        <div style={{
          position: "absolute",
          top: questionVisible ? 70 : -120,
          left: "50%", transform: "translateX(-50%)",
          transition: "top 0.4s cubic-bezier(.34,1.56,.64,1)",
          width: "min(94%, 700px)", zIndex: 15,
        }}>
          <div style={{
            background: "rgba(8,10,20,0.88)", backdropFilter: "blur(14px)",
            border: "1px solid rgba(125,211,252,0.22)", borderRadius: 18,
            padding: "14px 20px",
            display: "flex", alignItems: "center", gap: 12,
            boxShadow: "0 8px 40px rgba(0,0,0,0.7)",
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg,#1C2340,#2a3560)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, border: "2px solid rgba(125,211,252,0.3)",
            }}>
              👔
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: "rgba(125,211,252,0.7)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>
                {flag} Interviewer
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                {currentQuestion.question}
              </div>
            </div>
            <button
              onClick={onRepeat}
              style={{
                flexShrink: 0, background: "rgba(125,211,252,0.1)",
                border: "1px solid rgba(125,211,252,0.25)", color: "#7dd3fc",
                borderRadius: 10, padding: "6px 13px", fontSize: 12, fontWeight: 700,
                cursor: "pointer",
              }}
            >
              🔊
            </button>
          </div>
        </div>
      )}

      {/* Answer choices */}
      {(phase === "asking" || phase === "correct" || phase === "wrong") && currentQuestion && (
        <div style={{
          position: "absolute",
          bottom: answersVisible ? 20 : -300,
          left: "50%", transform: "translateX(-50%)",
          transition: "bottom 0.45s cubic-bezier(.34,1.56,.64,1)",
          width: "min(96%, 720px)", zIndex: 15,
          display: "flex", flexDirection: "column", gap: 8,
        }}>
          {currentQuestion.answers.map((ans, i) => {
            const isSelected = selectedAnswer === i;
            const showResult = selectedAnswer !== null;
            const isCorrect = ans.correct;

            let bg = "rgba(12,14,24,0.88)";
            let border = "1px solid rgba(255,255,255,0.1)";
            let textColor = "rgba(255,255,255,0.85)";
            let icon = "";

            if (showResult && isSelected && isCorrect) {
              bg = "rgba(20,80,40,0.9)"; border = "1px solid #4ade80"; textColor = "#4ade80"; icon = "✓ ";
            } else if (showResult && isSelected && !isCorrect) {
              bg = "rgba(80,20,20,0.9)"; border = "1px solid #f87171"; textColor = "#f87171"; icon = "✗ ";
            } else if (showResult && !isSelected && isCorrect) {
              bg = "rgba(20,60,30,0.7)"; border = "1px solid rgba(74,222,128,0.4)"; textColor = "rgba(74,222,128,0.8)"; icon = "✓ ";
            }

            return (
              <button
                key={i}
                onClick={() => onAnswer(i)}
                disabled={selectedAnswer !== null}
                style={{
                  background: bg, border, borderRadius: 14,
                  padding: "13px 18px",
                  display: "flex", alignItems: "center", gap: 12,
                  cursor: selectedAnswer === null ? "pointer" : "default",
                  textAlign: "left",
                  backdropFilter: "blur(12px)",
                  boxShadow: isSelected ? "0 4px 20px rgba(0,0,0,0.5)" : "none",
                  transition: "all 0.18s",
                  transform: isSelected ? "scale(1.01)" : "none",
                }}
                onMouseEnter={e => {
                  if (selectedAnswer === null) {
                    e.currentTarget.style.background = "rgba(30,40,70,0.92)";
                    e.currentTarget.style.border = "1px solid rgba(125,211,252,0.3)";
                  }
                }}
                onMouseLeave={e => {
                  if (selectedAnswer === null) {
                    e.currentTarget.style.background = "rgba(12,14,24,0.88)";
                    e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)";
                  }
                }}
              >
                {/* Letter badge */}
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: isSelected && !isCorrect && showResult ? "rgba(239,68,68,0.3)" : "rgba(125,211,252,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 800,
                  color: isSelected && isCorrect && showResult ? "#4ade80" : isSelected && !isCorrect && showResult ? "#f87171" : "#7dd3fc",
                  border: `1px solid ${isSelected && showResult ? (isCorrect ? "rgba(74,222,128,0.4)" : "rgba(248,113,113,0.4)") : "rgba(125,211,252,0.2)"}`,
                }}>
                  {["A", "B", "C"][i]}
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: textColor, lineHeight: 1.4 }}>
                  {icon}{ans.text}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Complete overlay */}
      {isComplete && (
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(6,8,18,0.92)", backdropFilter: "blur(12px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 30, borderRadius: "inherit",
        }}>
          <div style={{
            textAlign: "center", padding: "44px 52px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(125,211,252,0.2)",
            borderRadius: 24, boxShadow: "0 24px 80px rgba(0,0,0,0.8)",
            maxWidth: 420, width: "90%",
          }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>{resultEmoji}</div>
            <h2 style={{ fontSize: 26, fontWeight: 900, color: pct >= 0.8 ? "#4ade80" : pct >= 0.6 ? "#FFD580" : "#f87171", margin: "0 0 8px" }}>
              {resultTitle}
            </h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "0 0 28px" }}>
              {flag} {language === "es" ? "Entrevista completada" : language === "en" ? "Interview complete" : "Entretien terminé"} 💼
            </p>

            {/* Score breakdown */}
            <div style={{
              background: "rgba(125,211,252,0.06)", border: "1px solid rgba(125,211,252,0.15)",
              borderRadius: 16, padding: "18px 24px", marginBottom: 28,
            }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Your Score
              </div>
              <div style={{ fontSize: 44, fontWeight: 900, color: "#7dd3fc" }}>
                {score} <span style={{ fontSize: 18, color: "rgba(255,255,255,0.35)" }}>/ {total * 20}</span>
              </div>
              {/* Score bar */}
              <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 999, overflow: "hidden", marginTop: 14 }}>
                <div style={{
                  height: "100%", width: `${pct * 100}%`,
                  background: pct >= 0.8 ? "linear-gradient(90deg,#4ade80,#22c55e)" : pct >= 0.6 ? "linear-gradient(90deg,#FFD580,#f59e0b)" : "linear-gradient(90deg,#f87171,#ef4444)",
                  borderRadius: 999, transition: "width 1s ease",
                }} />
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 8 }}>
                {score / 20} / {total} correct answers
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={onRestart}
                style={{
                  padding: "11px 22px", borderRadius: 12,
                  background: "linear-gradient(135deg,#1C2340,#2a3560)",
                  color: "#7dd3fc", fontSize: 14, fontWeight: 800, cursor: "pointer",
                  border: "1px solid rgba(125,211,252,0.3)",
                  boxShadow: "0 4px 20px rgba(28,35,64,0.5)",
                } as React.CSSProperties}
              >
                ↺ Try Again
              </button>
              <Link href="/games" style={{
                padding: "11px 22px", borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.05)",
                color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 700,
                textDecoration: "none", display: "inline-block",
              }}>
                ← Back to Games
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
