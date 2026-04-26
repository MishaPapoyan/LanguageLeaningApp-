"use client";
import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { GameState } from "./useGameState";

const SKIN = "#FDBCB4";
const HAIR = "#3A2418";
const VEST = "#1a1a2e";
const SHIRT = "#FFFFFF";
const TROUSERS = "#0a0a14";
const SHOE = "#1a0f08";

const START_Z = -6;
const WAITER_X = 1.8;      // stands to the right side of the table
const TABLE_Z = 1.4;       // behind/beside the table, not in front of it
const STEP_BACK_Z = -2.0;

interface WaiterProps {
  state: GameState;
  onArrive: () => void;
}

export default function Waiter({ state, onArrive }: WaiterProps) {
  const root = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const leftLeg = useRef<THREE.Group>(null);
  const rightLeg = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);

  // Animation state
  const walkPhase = useRef(0);
  const arrivedRef = useRef(false);
  const phaseTimer = useRef(0);
  const correctSubPhase = useRef<"nod" | "stepback" | "stepforward" | "idle">("idle");

  // Reset on round change / phase change
  useEffect(() => {
    phaseTimer.current = 0;
    if (state.phase === "intro") {
      arrivedRef.current = false;
      if (root.current) {
        root.current.position.z = START_Z;
        root.current.position.x = WAITER_X;
      }
    }
    if (state.phase === "correct") {
      correctSubPhase.current = "nod";
    }
  }, [state.phase, state.round]);

  useFrame((_, delta) => {
    if (!root.current) return;
    const t = performance.now() / 1000;
    phaseTimer.current += delta;

    const phase = state.phase;
    const r = root.current;

    // Face slightly toward the camera/center — angled inward since waiter is offset to right
    r.rotation.y = Math.PI + 0.5;

    // ------- WALKING / POSITION LOGIC -------
    let isWalking = false;
    let targetZ = r.position.z;

    if (phase === "intro") {
      targetZ = TABLE_Z;
      r.position.x = THREE.MathUtils.lerp(r.position.x, WAITER_X, Math.min(delta * 1.4, 1));
      const dist = Math.abs(r.position.z - targetZ);
      if (dist > 0.05) {
        isWalking = true;
        r.position.z = THREE.MathUtils.lerp(r.position.z, targetZ, Math.min(delta * 1.4, 1));
      } else if (!arrivedRef.current) {
        arrivedRef.current = true;
        r.position.z = targetZ;
        setTimeout(() => onArrive(), 500);
      }
    } else if (phase === "correct") {
      if (phaseTimer.current < 0.8) {
        correctSubPhase.current = "nod";
        targetZ = TABLE_Z;
      } else if (phaseTimer.current < 1.6) {
        correctSubPhase.current = "stepback";
        targetZ = STEP_BACK_Z;
        isWalking = true;
        r.position.z = THREE.MathUtils.lerp(r.position.z, targetZ, Math.min(delta * 2, 1));
      } else if (phaseTimer.current < 2.4) {
        correctSubPhase.current = "stepforward";
        targetZ = TABLE_Z;
        isWalking = true;
        r.position.z = THREE.MathUtils.lerp(r.position.z, targetZ, Math.min(delta * 2, 1));
      } else {
        // Advance to next round
        if (correctSubPhase.current !== "idle") {
          correctSubPhase.current = "idle";
          state.advanceFromCorrect();
        }
      }
    } else if (phase === "wrong") {
      // Stay in place, do head shake; after 1.5s return to asking
      if (phaseTimer.current > 1.5) {
        state.advanceFromWrong();
      }
    } else if (phase === "complete") {
      // Bow deeply
      targetZ = TABLE_Z;
    }

    // ------- ANIMATIONS -------
    if (isWalking) {
      walkPhase.current += delta * 7;
      const swing = Math.sin(walkPhase.current) * 0.6;
      if (leftLeg.current) leftLeg.current.rotation.x = swing;
      if (rightLeg.current) rightLeg.current.rotation.x = -swing;
      if (leftArm.current) leftArm.current.rotation.x = -swing * 0.7;
      if (rightArm.current) rightArm.current.rotation.x = swing * 0.7;
      // body bob
      r.position.y = Math.abs(Math.sin(walkPhase.current * 2)) * 0.04;
      if (head.current) head.current.rotation.y = 0;
    } else {
      // Idle / breathing
      r.position.y = THREE.MathUtils.lerp(r.position.y, 0, 0.2);
      const breathe = 1 + Math.sin(t * 2) * 0.02;
      if (torso.current) torso.current.scale.y = breathe;

      // Reset legs
      if (leftLeg.current) leftLeg.current.rotation.x = THREE.MathUtils.lerp(leftLeg.current.rotation.x, 0, 0.2);
      if (rightLeg.current) rightLeg.current.rotation.x = THREE.MathUtils.lerp(rightLeg.current.rotation.x, 0, 0.2);

      // Phase-specific idle behaviors
      if (phase === "asking") {
        // Talking gesture: right arm raises, head turns toward table
        const gesture = Math.sin(t * 3) * 0.2;
        if (rightArm.current) rightArm.current.rotation.x = -0.5 + gesture * 0.3;
        if (rightArm.current) rightArm.current.rotation.z = -0.3;
        if (leftArm.current) leftArm.current.rotation.x = THREE.MathUtils.lerp(leftArm.current.rotation.x, 0, 0.1);
        if (leftArm.current) leftArm.current.rotation.z = THREE.MathUtils.lerp(leftArm.current.rotation.z, 0, 0.1);
        if (head.current) {
          head.current.rotation.y = Math.sin(t * 1.2) * 0.2;
          head.current.rotation.x = Math.sin(t * 2) * 0.05 + 0.1; // looking down slightly at table
        }
      } else if (phase === "correct" && correctSubPhase.current === "nod") {
        // Nod: head bobs forward and back twice
        const nodT = phaseTimer.current / 0.8;
        if (head.current) {
          head.current.rotation.x = Math.sin(nodT * Math.PI * 4) * 0.4;
          head.current.rotation.y = 0;
        }
        // Slight bow
        if (torso.current) torso.current.rotation.x = Math.sin(nodT * Math.PI) * 0.15;
        // Reset arms
        if (rightArm.current) rightArm.current.rotation.x = THREE.MathUtils.lerp(rightArm.current.rotation.x, 0, 0.2);
        if (rightArm.current) rightArm.current.rotation.z = THREE.MathUtils.lerp(rightArm.current.rotation.z, 0, 0.2);
      } else if (phase === "wrong") {
        // Head shake
        if (head.current) {
          head.current.rotation.y = Math.sin(phaseTimer.current * 10) * 0.4;
          head.current.rotation.x = 0;
        }
        if (rightArm.current) rightArm.current.rotation.x = -0.4;
        if (rightArm.current) rightArm.current.rotation.z = -0.5;
      } else if (phase === "complete") {
        // Deep bow
        if (torso.current) torso.current.rotation.x = THREE.MathUtils.lerp(torso.current.rotation.x, 0.7, 0.05);
        if (head.current) head.current.rotation.x = 0.3;
        if (leftArm.current) leftArm.current.rotation.x = -0.3;
        if (rightArm.current) rightArm.current.rotation.x = -0.3;
      } else {
        // Default idle
        if (torso.current) torso.current.rotation.x = THREE.MathUtils.lerp(torso.current.rotation.x, 0, 0.1);
        if (head.current) {
          head.current.rotation.y = Math.sin(t * 0.7) * 0.15;
          head.current.rotation.x = Math.sin(t * 1.3) * 0.05;
        }
        if (rightArm.current) rightArm.current.rotation.x = THREE.MathUtils.lerp(rightArm.current.rotation.x, 0, 0.1);
        if (rightArm.current) rightArm.current.rotation.z = THREE.MathUtils.lerp(rightArm.current.rotation.z, 0, 0.1);
      }
    }
  });

  return (
    <group ref={root} position={[WAITER_X, 0, START_Z]}>
      {/* Hips at y=0.95, top of legs */}
      <group ref={torso} position={[0, 0.95, 0]}>
        {/* Hips */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.4, 0.15, 0.2]} />
          <meshStandardMaterial color={TROUSERS} roughness={0.7} />
        </mesh>
        {/* Torso (vest) */}
        <mesh position={[0, 0.34, 0]} castShadow>
          <boxGeometry args={[0.42, 0.52, 0.22]} />
          <meshStandardMaterial color={VEST} roughness={0.6} />
        </mesh>
        {/* Shirt collar - white strip top of torso */}
        <mesh position={[0, 0.58, 0.111]} castShadow>
          <boxGeometry args={[0.42, 0.06, 0.005]} />
          <meshStandardMaterial color={SHIRT} />
        </mesh>
        {/* Bow tie */}
        <mesh position={[0, 0.58, 0.118]} castShadow>
          <boxGeometry args={[0.1, 0.04, 0.04]} />
          <meshStandardMaterial color="#000000" roughness={0.5} />
        </mesh>
        {/* Neck */}
        <mesh position={[0, 0.66, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.07, 0.1, 12]} />
          <meshStandardMaterial color={SKIN} roughness={0.6} />
        </mesh>

        {/* Head group */}
        <group ref={head} position={[0, 0.86, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.18, 20, 16]} />
            <meshStandardMaterial color={SKIN} roughness={0.5} />
          </mesh>
          {/* Hair (top half) */}
          <mesh position={[0, 0.04, -0.02]} castShadow>
            <sphereGeometry args={[0.19, 20, 12, 0, Math.PI * 2, 0, Math.PI / 1.6]} />
            <meshStandardMaterial color={HAIR} roughness={0.8} />
          </mesh>
          {/* Eyes */}
          <mesh position={[-0.06, 0.02, 0.155]}>
            <sphereGeometry args={[0.018, 8, 6]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          <mesh position={[0.06, 0.02, 0.155]}>
            <sphereGeometry args={[0.018, 8, 6]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          {/* Mouth - small smile */}
          <mesh position={[0, -0.06, 0.16]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.05, 0.008, 0.005]} />
            <meshStandardMaterial color="#7a3a3a" />
          </mesh>
          {/* Nose */}
          <mesh position={[0, -0.01, 0.17]}>
            <sphereGeometry args={[0.022, 8, 6]} />
            <meshStandardMaterial color={SKIN} roughness={0.6} />
          </mesh>
        </group>

        {/* Left Arm (player's left = +X side from waiter's facing-camera view, so -X actually since waiter rotated PI) */}
        <group ref={leftArm} position={[-0.26, 0.55, 0]}>
          {/* upper arm */}
          <mesh position={[0, -0.16, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.065, 0.32, 12]} />
            <meshStandardMaterial color={SHIRT} roughness={0.6} />
          </mesh>
          {/* forearm */}
          <mesh position={[0, -0.46, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.055, 0.28, 12]} />
            <meshStandardMaterial color={SHIRT} roughness={0.6} />
          </mesh>
          {/* hand */}
          <mesh position={[0, -0.62, 0]} castShadow>
            <sphereGeometry args={[0.07, 10, 8]} />
            <meshStandardMaterial color={SKIN} roughness={0.6} />
          </mesh>
        </group>

        {/* Right Arm */}
        <group ref={rightArm} position={[0.26, 0.55, 0]}>
          <mesh position={[0, -0.16, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.065, 0.32, 12]} />
            <meshStandardMaterial color={SHIRT} roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.46, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.055, 0.28, 12]} />
            <meshStandardMaterial color={SHIRT} roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.62, 0]} castShadow>
            <sphereGeometry args={[0.07, 10, 8]} />
            <meshStandardMaterial color={SKIN} roughness={0.6} />
          </mesh>
        </group>
      </group>

      {/* Legs - children of root, anchored at hip pivot */}
      <group ref={leftLeg} position={[-0.12, 0.88, 0]}>
        {/* upper leg */}
        <mesh position={[0, -0.21, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.08, 0.38, 12]} />
          <meshStandardMaterial color={TROUSERS} roughness={0.7} />
        </mesh>
        {/* lower leg */}
        <mesh position={[0, -0.575, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.075, 0.35, 12]} />
          <meshStandardMaterial color={TROUSERS} roughness={0.7} />
        </mesh>
        {/* foot */}
        <mesh position={[0, -0.79, 0.04]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 0.08, 0.2]} />
          <meshStandardMaterial color={SHOE} roughness={0.4} metalness={0.1} />
        </mesh>
      </group>

      <group ref={rightLeg} position={[0.12, 0.88, 0]}>
        <mesh position={[0, -0.21, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.08, 0.38, 12]} />
          <meshStandardMaterial color={TROUSERS} roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.575, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.075, 0.35, 12]} />
          <meshStandardMaterial color={TROUSERS} roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.79, 0.04]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 0.08, 0.2]} />
          <meshStandardMaterial color={SHOE} roughness={0.4} metalness={0.1} />
        </mesh>
      </group>
    </group>
  );
}
