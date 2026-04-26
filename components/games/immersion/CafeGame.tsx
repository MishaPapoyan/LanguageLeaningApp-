"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useGameState } from "./useGameState";
import { useTTS } from "./useTTS";
import CafeScene from "./CafeScene";
import GameHUD from "./GameHUD";

interface CafeGameProps {
  language: string;
}

export default function CafeGame({ language }: CafeGameProps) {
  const state = useGameState(language);
  const { speak } = useTTS(language);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const speakingRef = useRef(false);

  // Speak the current instruction whenever we enter "asking"
  useEffect(() => {
    if (state.phase !== "asking" || !state.currentTask) return;
    if (speakingRef.current) return;
    speakingRef.current = true;
    speak(state.currentTask.instruction).finally(() => {
      speakingRef.current = false;
    });
  }, [state.phase, state.currentTask, speak]);

  // Submit score when complete
  useEffect(() => {
    if (state.phase !== "complete" || scoreSubmitted) return;
    setScoreSubmitted(true);
    fetch("/api/games/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameType: "IMMERSION",
        score: state.score,
        wordsUsed: [],
      }),
    }).catch(() => {});
  }, [state.phase, state.score, scoreSubmitted]);

  const handleObjectClick = useCallback(
    (clickedId: string) => {
      if (state.phase !== "asking" || !state.currentTask) return;

      // Normalise: es vocab ids differ from mesh ids
      const targetMeshId = normaliseMeshId(state.currentTask.id);
      if (clickedId === targetMeshId) {
        state.onCorrect();
      } else {
        state.onWrong();
      }
    },
    [state]
  );

  const handleRepeat = useCallback(() => {
    if (!state.currentTask || speakingRef.current) return;
    speakingRef.current = true;
    speak(state.currentTask.instruction).finally(() => {
      speakingRef.current = false;
    });
  }, [state.currentTask, speak]);

  const handleRestart = useCallback(() => {
    setScoreSubmitted(false);
    state.restart();
  }, [state]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "600px",
        borderRadius: 20,
        overflow: "hidden",
        background: "#1a0e08",
        boxShadow: "0 20px 80px rgba(0,0,0,0.6)",
      }}
    >
      <Canvas
        shadows
        camera={{ position: [0, 3.2, 5.8], fov: 48 }}
        gl={{ antialias: true, toneMapping: 4 /* ACESFilmicToneMapping */ }}
        style={{ display: "block" }}
      >
        <fog attach="fog" args={["#2a1a0e", 14, 28]} />
        <CafeScene
          state={state}
          onObjectClick={handleObjectClick}
          onWaiterArrive={state.arriveAtTable}
        />
      </Canvas>

      <GameHUD
        state={state}
        onRepeat={handleRepeat}
        onRestart={handleRestart}
      />
    </div>
  );
}

/** Map ES vocab IDs → mesh IDs (mesh IDs use FR conventions) */
function normaliseMeshId(vocabId: string): string {
  switch (vocabId) {
    case "agua":   return "eau";
    case "azucar": return "sucre";
    case "cuenta": return "addition";
    default:       return vocabId;
  }
}
