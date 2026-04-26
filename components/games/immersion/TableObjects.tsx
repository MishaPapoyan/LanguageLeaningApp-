"use client";
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { GameState } from "./useGameState";

interface ItemDef {
  id: string;
  position: [number, number, number];
}

// Map vocab id -> object id (handle fr/es differences)
function normalizeId(id: string): string {
  if (id === "agua") return "eau";
  if (id === "azucar") return "sucre";
  if (id === "cuenta") return "addition";
  return id;
}

const ITEMS: ItemDef[] = [
  { id: "cafe",      position: [-0.50, 0.91,  0.35] },  // front-left
  { id: "eau",       position: [ 0.00, 0.91,  0.55] },  // front-center
  { id: "croissant", position: [ 0.50, 0.91,  0.35] },  // front-right
  { id: "sucre",     position: [-0.45, 0.91, -0.15] },  // back-left
  { id: "addition",  position: [ 0.45, 0.91, -0.15] },  // back-right
];

interface ObjectProps {
  itemId: string;
  position: [number, number, number];
  isTarget: boolean;
  isAsking: boolean;
  phase: GameState["phase"];
  onClick: () => void;
}

function CoffeeCup({ glow }: { glow: number }) {
  return (
    <group>
      {/* saucer */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.13, 0.13, 0.012, 24]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFE082" emissiveIntensity={glow} roughness={0.3} />
      </mesh>
      {/* cup */}
      <mesh position={[0, 0.07, 0]} castShadow>
        <cylinderGeometry args={[0.075, 0.06, 0.1, 24]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFE082" emissiveIntensity={glow} roughness={0.25} />
      </mesh>
      {/* coffee surface */}
      <mesh position={[0, 0.118, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.005, 24]} />
        <meshStandardMaterial color="#3a1f0f" roughness={0.4} />
      </mesh>
      {/* handle */}
      <mesh position={[0.08, 0.07, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.04, 0.012, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFE082" emissiveIntensity={glow} />
      </mesh>
    </group>
  );
}

function WaterGlass({ glow }: { glow: number }) {
  return (
    <group>
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.075, 0.06, 0.2, 20]} />
        <meshStandardMaterial
          color="#a8d8ea"
          transparent
          opacity={0.55}
          roughness={0.05}
          metalness={0.1}
          emissive="#a8d8ea"
          emissiveIntensity={glow * 0.6}
        />
      </mesh>
      {/* water inside */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.065, 0.055, 0.14, 20]} />
        <meshStandardMaterial color="#7fc4dc" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

function Croissant({ glow }: { glow: number }) {
  return (
    <group>
      {/* plate */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.16, 0.16, 0.01, 24]} />
        <meshStandardMaterial color="#F5F5F5" roughness={0.3} />
      </mesh>
      {/* croissant shape */}
      <mesh position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.1, 0.045, 8, 16, Math.PI * 1.1]} />
        <meshStandardMaterial color="#D4A04A" emissive="#FFB347" emissiveIntensity={glow} roughness={0.6} />
      </mesh>
    </group>
  );
}

function SugarBowl({ glow }: { glow: number }) {
  return (
    <group>
      {/* bowl bottom */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <sphereGeometry args={[0.1, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFE082" emissiveIntensity={glow} roughness={0.3} />
      </mesh>
      {/* sugar pile */}
      <mesh position={[0, 0.08, 0]}>
        <sphereGeometry args={[0.085, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#FFFEF5" roughness={0.9} />
      </mesh>
      {/* spoon */}
      <mesh position={[0.06, 0.11, 0.02]} rotation={[0, 0, -0.4]} castShadow>
        <cylinderGeometry args={[0.005, 0.005, 0.16, 8]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0.09, 0.05, 0.02]} rotation={[0, 0, -0.4]} castShadow>
        <sphereGeometry args={[0.022, 8, 6]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}

function Bill({ glow }: { glow: number }) {
  return (
    <group>
      {/* paper */}
      <mesh position={[0, 0.01, 0]} castShadow receiveShadow rotation={[0, 0.2, 0]}>
        <boxGeometry args={[0.18, 0.01, 0.12]} />
        <meshStandardMaterial color="#FFFEF5" emissive="#FFE082" emissiveIntensity={glow} roughness={0.7} />
      </mesh>
      {/* fold line */}
      <mesh position={[0, 0.018, 0]} rotation={[0, 0.2, 0]}>
        <boxGeometry args={[0.18, 0.001, 0.001]} />
        <meshStandardMaterial color="#888" />
      </mesh>
      {/* small coin */}
      <mesh position={[0.06, 0.025, 0.04]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.022, 0.022, 0.005, 16]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

function ItemMesh({ itemId, position, isTarget, isAsking, phase, onClick }: ObjectProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const animProgress = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const g = groupRef.current;

    // hover scale
    const targetScale = hovered && (phase === "asking") ? 1.08 : 1.0;
    g.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15);

    if (isTarget && phase === "correct") {
      animProgress.current += delta;
      const t = Math.min(animProgress.current / 0.8, 1);
      g.position.set(position[0], position[1] + t * 0.6, position[2]);
      g.rotation.y += delta * 4;
      // fade by scale at end
      const s = (1 - t) * targetScale + 0.001;
      g.scale.set(s, s, s);
    } else if (isTarget && phase === "wrong") {
      animProgress.current += delta;
      const shake = Math.sin(animProgress.current * 30) * 0.05;
      g.position.set(position[0] + shake, position[1], position[2]);
      g.rotation.y = shake * 2;
    } else {
      animProgress.current = 0;
      // idle hover for asking
      if (isAsking) {
        const t = performance.now() / 1000;
        g.position.y = position[1] + Math.sin(t * 2 + position[0] * 5) * 0.012;
      } else {
        g.position.set(position[0], position[1], position[2]);
      }
      g.rotation.y = 0;
    }
  });

  const glow = isAsking ? 0.25 + Math.sin(performance.now() / 250) * 0.1 : 0;

  const renderItem = () => {
    switch (itemId) {
      case "cafe":      return <CoffeeCup glow={glow} />;
      case "eau":       return <WaterGlass glow={glow} />;
      case "croissant": return <Croissant glow={glow} />;
      case "sucre":     return <SugarBowl glow={glow} />;
      case "addition":  return <Bill glow={glow} />;
      default:          return null;
    }
  };

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        if (phase === "asking") onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        if (phase === "asking") document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "default";
      }}
    >
      {renderItem()}
    </group>
  );
}

export default function TableObjects({
  state,
  onObjectClick,
}: {
  state: GameState;
  onObjectClick: (id: string) => void;
}) {
  const targetId = state.currentTask ? normalizeId(state.currentTask.id) : null;

  return (
    <group>
      {ITEMS.map((it) => (
        <ItemMesh
          key={it.id}
          itemId={it.id}
          position={it.position}
          isTarget={it.id === targetId}
          isAsking={state.phase === "asking"}
          phase={state.phase}
          onClick={() => onObjectClick(it.id)}
        />
      ))}
    </group>
  );
}
