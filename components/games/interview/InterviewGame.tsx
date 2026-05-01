"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useInterviewState } from "./useInterviewState";
import { useTTS } from "../immersion/useTTS";
import OfficeScene from "./OfficeScene";
import InterviewHUD from "./InterviewHUD";

export default function InterviewGame({ language }: { language: string }) {
  const state = useInterviewState(language);
  const { speak } = useTTS(language);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const speakingRef = useRef(false);

  // Speak greeting on intro, then question on asking
  useEffect(() => {
    if (speakingRef.current) return;

    if (state.phase === "intro") {
      speakingRef.current = true;
      const greeting = language === "es" ? "Buenos días, siéntese por favor."
                     : language === "en" ? "Good morning, please take a seat."
                     : "Bonjour, asseyez-vous je vous en prie.";
      speak(greeting).finally(() => {
        speakingRef.current = false;
        // Auto-advance to first question after greeting
        setTimeout(() => state.setPhase("asking"), 600);
      });
    }

    if (state.phase === "asking" && state.currentQuestion) {
      speakingRef.current = true;
      speak(state.currentQuestion.question).finally(() => {
        speakingRef.current = false;
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, state.round]);

  // Submit score on complete
  useEffect(() => {
    if (state.phase !== "complete" || scoreSubmitted) return;
    setScoreSubmitted(true);
    fetch("/api/games/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameType: "INTERVIEW", score: state.score, wordsUsed: [] }),
    }).catch(() => {});
  }, [state.phase, state.score, scoreSubmitted]);

  const handleRepeat = useCallback(() => {
    if (!state.currentQuestion || speakingRef.current) return;
    speakingRef.current = true;
    speak(state.currentQuestion.question).finally(() => { speakingRef.current = false; });
  }, [state.currentQuestion, speak]);

  const handleRestart = useCallback(() => {
    setScoreSubmitted(false);
    state.restart();
  }, [state]);

  return (
    <div style={{
      position: "relative", width: "100%", height: "620px",
      borderRadius: 20, overflow: "hidden",
      background: "#08090e",
      boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
    }}>
      <Canvas
        shadows
        camera={{ position: [0, 1.75, 4.2], fov: 50 }}
        gl={{ antialias: true, toneMapping: 4 }}
        style={{ display: "block" }}
      >
        <fog attach="fog" args={["#0e1018", 10, 22]} />
        <OfficeScene state={state} />
      </Canvas>

      <InterviewHUD
        state={state}
        onRepeat={handleRepeat}
        onRestart={handleRestart}
      />
    </div>
  );
}
