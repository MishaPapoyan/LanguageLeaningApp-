"use client";
import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { InterviewState } from "./useInterviewState";

const SKIN   = "#F5CBA7";
const HAIR   = "#2C1810";
const SUIT   = "#1C2340";
const SHIRT  = "#F8F8FF";
const TIE    = "#8B0000";

interface InterviewerProps {
  state: InterviewState;
}

export default function Interviewer({ state }: InterviewerProps) {
  const root   = useRef<THREE.Group>(null);
  const torso  = useRef<THREE.Group>(null);
  const head   = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const leftArm  = useRef<THREE.Group>(null);

  const phaseTimer = useRef(0);
  const advancedRef = useRef(false);

  useEffect(() => {
    phaseTimer.current = 0;
    advancedRef.current = false;
  }, [state.phase, state.round]);

  useFrame((_, delta) => {
    if (!root.current) return;
    phaseTimer.current += delta;
    const t = performance.now() / 1000;
    const pt = phaseTimer.current;

    // Idle breathing always
    if (torso.current) {
      torso.current.scale.y = 1 + Math.sin(t * 1.8) * 0.015;
    }

    switch (state.phase) {
      case "intro": {
        // Looking at papers (head down), then looks up after 1.5s
        if (head.current) {
          const lookUp = Math.min(pt / 1.5, 1);
          head.current.rotation.x = THREE.MathUtils.lerp(0.45, 0, lookUp);
          head.current.rotation.y = Math.sin(t * 0.5) * 0.05;
        }
        // Arms resting on desk — slight typing motion early on
        if (pt < 1.5) {
          if (leftArm.current)  leftArm.current.rotation.x  = -0.3 + Math.sin(t * 8) * 0.04;
          if (rightArm.current) rightArm.current.rotation.x = -0.3 + Math.sin(t * 8 + 1) * 0.04;
        } else {
          if (leftArm.current)  leftArm.current.rotation.x  = THREE.MathUtils.lerp(leftArm.current.rotation.x, -0.1, 0.08);
          if (rightArm.current) rightArm.current.rotation.x = THREE.MathUtils.lerp(rightArm.current.rotation.x, -0.1, 0.08);
        }
        if (torso.current) torso.current.rotation.x = THREE.MathUtils.lerp(torso.current.rotation.x, 0, 0.05);
        break;
      }

      case "asking": {
        // Leans forward slightly, right arm gestures
        if (torso.current) torso.current.rotation.x = THREE.MathUtils.lerp(torso.current.rotation.x, -0.12, 0.06);
        if (head.current) {
          head.current.rotation.x = THREE.MathUtils.lerp(head.current.rotation.x, 0, 0.08);
          head.current.rotation.y = Math.sin(t * 1.1) * 0.12;
        }
        // Talking hand gesture
        if (rightArm.current) {
          rightArm.current.rotation.x = -0.5 + Math.sin(t * 2.5) * 0.18;
          rightArm.current.rotation.z = THREE.MathUtils.lerp(rightArm.current.rotation.z, -0.25, 0.08);
        }
        if (leftArm.current) leftArm.current.rotation.x = THREE.MathUtils.lerp(leftArm.current.rotation.x, -0.15, 0.06);
        break;
      }

      case "correct": {
        // Nod twice + leans back approvingly, picks up pen
        if (head.current) {
          head.current.rotation.x = Math.sin(pt * Math.PI * 3) * 0.3 * Math.max(0, 1 - pt);
          head.current.rotation.y = THREE.MathUtils.lerp(head.current.rotation.y, 0, 0.1);
        }
        if (torso.current) torso.current.rotation.x = THREE.MathUtils.lerp(torso.current.rotation.x, 0.08, 0.05);
        // Pen writing gesture
        if (rightArm.current) {
          rightArm.current.rotation.x = -0.2 + Math.sin(pt * 6) * 0.08;
          rightArm.current.rotation.z = THREE.MathUtils.lerp(rightArm.current.rotation.z, 0, 0.1);
        }
        // Advance after 2s
        if (pt > 2.0 && !advancedRef.current) {
          advancedRef.current = true;
          state.advanceRound();
        }
        break;
      }

      case "wrong": {
        // Leans back, skeptical head tilt, one eyebrow gesture (arm up)
        if (torso.current) torso.current.rotation.x = THREE.MathUtils.lerp(torso.current.rotation.x, 0.15, 0.06);
        if (head.current) {
          head.current.rotation.z = Math.sin(pt * 3) * 0.08 * Math.max(0, 1 - pt * 0.5);
          head.current.rotation.y = THREE.MathUtils.lerp(head.current.rotation.y, -0.15, 0.06);
        }
        if (rightArm.current) {
          rightArm.current.rotation.x = THREE.MathUtils.lerp(rightArm.current.rotation.x, -0.35, 0.07);
          rightArm.current.rotation.z = THREE.MathUtils.lerp(rightArm.current.rotation.z, 0.1, 0.06);
        }
        if (pt > 2.2 && !advancedRef.current) {
          advancedRef.current = true;
          state.advanceRound();
        }
        break;
      }

      case "complete": {
        // Stand slightly — lean back satisfied or forward depending on score
        const great = state.score >= 80;
        if (torso.current) torso.current.rotation.x = THREE.MathUtils.lerp(torso.current.rotation.x, great ? 0.05 : -0.05, 0.04);
        if (head.current) {
          head.current.rotation.x = THREE.MathUtils.lerp(head.current.rotation.x, great ? -0.1 : 0.05, 0.04);
          head.current.rotation.y = Math.sin(t * 0.4) * 0.08;
        }
        if (rightArm.current) rightArm.current.rotation.x = THREE.MathUtils.lerp(rightArm.current.rotation.x, great ? -0.5 : -0.1, 0.05);
        break;
      }
    }
  });

  return (
    // Seated: root at desk level, torso starts at chair-seat height
    <group ref={root} position={[0, 0, -0.8]}>
      {/* Torso group — pivots for lean animations */}
      <group ref={torso} position={[0, 1.15, 0]}>
        {/* Suit jacket body */}
        <mesh castShadow>
          <boxGeometry args={[0.46, 0.55, 0.24]} />
          <meshStandardMaterial color={SUIT} roughness={0.6} />
        </mesh>
        {/* Shirt / tie strip */}
        <mesh position={[0, 0.05, 0.122]}>
          <boxGeometry args={[0.12, 0.42, 0.005]} />
          <meshStandardMaterial color={SHIRT} />
        </mesh>
        {/* Tie */}
        <mesh position={[0, -0.02, 0.128]}>
          <boxGeometry args={[0.05, 0.32, 0.005]} />
          <meshStandardMaterial color={TIE} roughness={0.5} />
        </mesh>
        {/* Collar */}
        <mesh position={[0, 0.26, 0.122]}>
          <boxGeometry args={[0.18, 0.07, 0.005]} />
          <meshStandardMaterial color={SHIRT} />
        </mesh>
        {/* Lapels */}
        <mesh position={[-0.11, 0.18, 0.121]} rotation={[0, 0, 0.5]}>
          <boxGeometry args={[0.1, 0.16, 0.005]} />
          <meshStandardMaterial color={SUIT} roughness={0.5} />
        </mesh>
        <mesh position={[0.11, 0.18, 0.121]} rotation={[0, 0, -0.5]}>
          <boxGeometry args={[0.1, 0.16, 0.005]} />
          <meshStandardMaterial color={SUIT} roughness={0.5} />
        </mesh>

        {/* Neck */}
        <mesh position={[0, 0.33, 0]} castShadow>
          <cylinderGeometry args={[0.065, 0.07, 0.1, 12]} />
          <meshStandardMaterial color={SKIN} roughness={0.5} />
        </mesh>

        {/* Head */}
        <group ref={head} position={[0, 0.52, 0]}>
          {/* Face */}
          <mesh castShadow>
            <boxGeometry args={[0.3, 0.36, 0.28]} />
            <meshStandardMaterial color={SKIN} roughness={0.5} />
          </mesh>
          {/* Hair */}
          <mesh position={[0, 0.16, -0.02]} castShadow>
            <boxGeometry args={[0.31, 0.1, 0.29]} />
            <meshStandardMaterial color={HAIR} roughness={0.8} />
          </mesh>
          {/* Side hair */}
          <mesh position={[-0.155, 0.06, -0.01]} castShadow>
            <boxGeometry args={[0.01, 0.2, 0.27]} />
            <meshStandardMaterial color={HAIR} roughness={0.8} />
          </mesh>
          <mesh position={[0.155, 0.06, -0.01]} castShadow>
            <boxGeometry args={[0.01, 0.2, 0.27]} />
            <meshStandardMaterial color={HAIR} roughness={0.8} />
          </mesh>
          {/* Eyes */}
          <mesh position={[-0.08, 0.04, 0.142]}>
            <boxGeometry args={[0.06, 0.025, 0.005]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          <mesh position={[0.08, 0.04, 0.142]}>
            <boxGeometry args={[0.06, 0.025, 0.005]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          {/* Glasses */}
          <mesh position={[-0.08, 0.04, 0.145]} rotation={[0, 0, 0]}>
            <torusGeometry args={[0.042, 0.006, 6, 20]} />
            <meshStandardMaterial color="#2a2a2a" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0.08, 0.04, 0.145]}>
            <torusGeometry args={[0.042, 0.006, 6, 20]} />
            <meshStandardMaterial color="#2a2a2a" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Glasses bridge */}
          <mesh position={[0, 0.04, 0.145]}>
            <boxGeometry args={[0.04, 0.006, 0.005]} />
            <meshStandardMaterial color="#2a2a2a" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Nose */}
          <mesh position={[0, -0.02, 0.15]}>
            <boxGeometry args={[0.04, 0.06, 0.04]} />
            <meshStandardMaterial color={SKIN} roughness={0.5} />
          </mesh>
          {/* Mouth */}
          <mesh position={[0, -0.1, 0.143]}>
            <boxGeometry args={[0.07, 0.012, 0.005]} />
            <meshStandardMaterial color="#8a4040" />
          </mesh>
          {/* Ear left */}
          <mesh position={[-0.155, 0.02, 0]}>
            <boxGeometry args={[0.018, 0.06, 0.05]} />
            <meshStandardMaterial color={SKIN} roughness={0.6} />
          </mesh>
          <mesh position={[0.155, 0.02, 0]}>
            <boxGeometry args={[0.018, 0.06, 0.05]} />
            <meshStandardMaterial color={SKIN} roughness={0.6} />
          </mesh>
        </group>

        {/* Left arm (interviewer's left = our right in scene) */}
        <group ref={leftArm} position={[-0.28, 0.15, 0]}>
          <mesh position={[0, -0.18, 0]} castShadow>
            <cylinderGeometry args={[0.068, 0.062, 0.36, 10]} />
            <meshStandardMaterial color={SUIT} roughness={0.6} />
          </mesh>
          {/* Shirt cuff */}
          <mesh position={[0, -0.37, 0]} castShadow>
            <cylinderGeometry args={[0.063, 0.06, 0.06, 10]} />
            <meshStandardMaterial color={SHIRT} />
          </mesh>
          {/* Hand */}
          <mesh position={[0, -0.46, 0.02]} castShadow>
            <boxGeometry args={[0.09, 0.1, 0.05]} />
            <meshStandardMaterial color={SKIN} roughness={0.5} />
          </mesh>
        </group>

        {/* Right arm */}
        <group ref={rightArm} position={[0.28, 0.15, 0]}>
          <mesh position={[0, -0.18, 0]} castShadow>
            <cylinderGeometry args={[0.068, 0.062, 0.36, 10]} />
            <meshStandardMaterial color={SUIT} roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.37, 0]} castShadow>
            <cylinderGeometry args={[0.063, 0.06, 0.06, 10]} />
            <meshStandardMaterial color={SHIRT} />
          </mesh>
          <mesh position={[0, -0.46, 0.02]} castShadow>
            <boxGeometry args={[0.09, 0.1, 0.05]} />
            <meshStandardMaterial color={SKIN} roughness={0.5} />
          </mesh>
        </group>
      </group>

      {/* Hidden lower body (behind desk) */}
      <group position={[0, 0.75, 0.1]}>
        {/* Hips */}
        <mesh>
          <boxGeometry args={[0.44, 0.18, 0.26]} />
          <meshStandardMaterial color={SUIT} roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
}
