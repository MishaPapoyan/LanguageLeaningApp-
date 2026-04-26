"use client";
import { useMemo } from "react";
import * as THREE from "three";
import Waiter from "./Waiter";
import TableObjects from "./TableObjects";
import type { GameState } from "./useGameState";

const WOOD_FLOOR = "#8B6914";
const WALL_CREAM = "#F5E6D3";
const WALL_CREAM_DARK = "#E8D4B8";
const CEILING = "#F0DCC8";
const DARK_WOOD = "#3a2418";

function CafeRoom() {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color={WOOD_FLOOR} roughness={0.85} />
      </mesh>

      {/* Floor planks lines (subtle visual interest) */}
      {[-5, -3, -1, 1, 3, 5].map((x) => (
        <mesh key={`plank-${x}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.001, 0]}>
          <planeGeometry args={[0.02, 14]} />
          <meshStandardMaterial color="#5e4708" />
        </mesh>
      ))}

      {/* Back wall */}
      <mesh position={[0, 3, -7]} receiveShadow>
        <planeGeometry args={[14, 6]} />
        <meshStandardMaterial color={WALL_CREAM} roughness={0.95} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-7, 3, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[14, 6]} />
        <meshStandardMaterial color={WALL_CREAM_DARK} roughness={0.95} />
      </mesh>

      {/* Right wall */}
      <mesh position={[7, 3, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[14, 6]} />
        <meshStandardMaterial color={WALL_CREAM_DARK} roughness={0.95} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color={CEILING} roughness={0.95} />
      </mesh>

      {/* Window on left wall (glowing rectangle) */}
      <mesh position={[-6.95, 3.2, -2]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[2.6, 1.8]} />
        <meshStandardMaterial color="#FFF5E0" emissive="#FFE4B0" emissiveIntensity={1.2} transparent opacity={0.95} />
      </mesh>
      {/* Window frame */}
      <mesh position={[-6.93, 3.2, -2]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[2.8, 2.0]} />
        <meshStandardMaterial color="#5a3a20" roughness={0.7} />
      </mesh>
      {/* Window cross bars */}
      <mesh position={[-6.92, 3.2, -2]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[2.6, 0.04]} />
        <meshStandardMaterial color="#5a3a20" />
      </mesh>
      <mesh position={[-6.92, 3.2, -2]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.04, 1.8]} />
        <meshStandardMaterial color="#5a3a20" />
      </mesh>

      {/* Bar counter at back */}
      <mesh position={[0, 0.55, -6.2]} castShadow receiveShadow>
        <boxGeometry args={[5, 1.1, 0.7]} />
        <meshStandardMaterial color={DARK_WOOD} roughness={0.5} metalness={0.1} />
      </mesh>
      {/* Bar top */}
      <mesh position={[0, 1.12, -6.2]} castShadow>
        <boxGeometry args={[5.1, 0.05, 0.8]} />
        <meshStandardMaterial color="#1a1008" roughness={0.3} metalness={0.3} />
      </mesh>
      {/* Bottles on bar shelf */}
      {[-1.2, -0.6, 0, 0.6, 1.2].map((x, i) => (
        <mesh key={`bottle-${i}`} position={[x, 1.45, -6.4]} castShadow>
          <cylinderGeometry args={[0.06, 0.07, 0.45, 8]} />
          <meshStandardMaterial color={i % 2 ? "#3a5e2a" : "#5e2a2a"} roughness={0.3} />
        </mesh>
      ))}
      {/* Shelf */}
      <mesh position={[0, 1.2, -6.55]} castShadow>
        <boxGeometry args={[4.5, 0.03, 0.3]} />
        <meshStandardMaterial color={DARK_WOOD} />
      </mesh>

      {/* 2 background tables */}
      {[
        { pos: [-3.5, 0.8, -2.5] as [number, number, number] },
        { pos: [3.5, 0.8, -2.5] as [number, number, number] },
      ].map((t, i) => (
        <group key={`bgtable-${i}`} position={t.pos}>
          <mesh receiveShadow castShadow>
            <cylinderGeometry args={[0.7, 0.72, 0.06, 24]} />
            <meshStandardMaterial color="#5e3a1a" roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.4, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.8, 8]} />
            <meshStandardMaterial color={DARK_WOOD} />
          </mesh>
          {/* small candle */}
          <mesh position={[0, 0.07, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.1, 8]} />
            <meshStandardMaterial color="#fff5e0" emissive="#ffaa44" emissiveIntensity={1.5} />
          </mesh>
          <pointLight position={[0, 0.2, 0]} intensity={0.4} color="#ffaa44" distance={1.5} />
        </group>
      ))}

      {/* Pendant lights */}
      {[-3, 0, 3].map((x, i) => (
        <group key={`pendant-${i}`} position={[x, 5.5, -1]}>
          {/* cord */}
          <mesh position={[0, -0.5, 0]}>
            <cylinderGeometry args={[0.01, 0.01, 1.0, 6]} />
            <meshStandardMaterial color="#1a1008" />
          </mesh>
          {/* bulb shade */}
          <mesh position={[0, -1.05, 0]} castShadow>
            <coneGeometry args={[0.18, 0.25, 12, 1, true]} />
            <meshStandardMaterial color="#3a2418" side={THREE.DoubleSide} />
          </mesh>
          {/* bulb glow */}
          <mesh position={[0, -1.15, 0]}>
            <sphereGeometry args={[0.1, 12, 8]} />
            <meshStandardMaterial color="#FFE082" emissive="#FFD580" emissiveIntensity={2.5} />
          </mesh>
          <pointLight position={[0, -1.15, 0]} intensity={1.0} color="#FFD580" castShadow distance={8} decay={1.5} />
        </group>
      ))}
    </group>
  );
}

function CafeTable() {
  return (
    <group position={[0, 0, 1.7]}>
      {/* Tabletop */}
      <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.9, 0.95, 0.08, 32]} />
        <meshStandardMaterial color="#6e4a24" roughness={0.5} />
      </mesh>
      {/* Tablecloth */}
      <mesh position={[0, 0.895, 0]} receiveShadow>
        <cylinderGeometry args={[0.92, 0.92, 0.005, 32]} />
        <meshStandardMaterial color="#FFFEF5" roughness={0.7} />
      </mesh>
      {/* Table leg */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 0.85, 12]} />
        <meshStandardMaterial color={DARK_WOOD} />
      </mesh>
      {/* Base */}
      <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.32, 0.05, 16]} />
        <meshStandardMaterial color={DARK_WOOD} />
      </mesh>

      {/* Chair to the right */}
      <Chair position={[1.2, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />
      {/* Chair to the left */}
      <Chair position={[-1.2, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
    </group>
  );
}

function Chair({
  position,
  rotation,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* seat */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.45, 0.08, 0.45]} />
        <meshStandardMaterial color="#4a2c14" roughness={0.5} />
      </mesh>
      {/* back */}
      <mesh position={[0, 0.85, -0.2]} castShadow>
        <boxGeometry args={[0.45, 0.7, 0.06]} />
        <meshStandardMaterial color="#4a2c14" roughness={0.5} />
      </mesh>
      {/* legs */}
      {[
        [-0.18, 0.25, -0.18],
        [0.18, 0.25, -0.18],
        [-0.18, 0.25, 0.18],
        [0.18, 0.25, 0.18],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} castShadow>
          <boxGeometry args={[0.05, 0.5, 0.05]} />
          <meshStandardMaterial color={DARK_WOOD} />
        </mesh>
      ))}
    </group>
  );
}

interface CafeSceneProps {
  state: GameState;
  onObjectClick: (id: string) => void;
  onWaiterArrive: () => void;
}

export default function CafeScene({ state, onObjectClick, onWaiterArrive }: CafeSceneProps) {
  // Player table objects sit at table at z=1.7, top y=0.89
  // Adjust TableObjects positions to match table location
  const tableGroupPos = useMemo<[number, number, number]>(() => [0, 0, 1.7], []);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.45} color="#FFF0DC" />
      <directionalLight
        position={[-5, 4, -2]}
        intensity={0.8}
        color="#FFF5E0"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={20}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />

      <CafeRoom />
      <CafeTable />

      {/* Move table objects to the player's table location */}
      <group position={tableGroupPos}>
        <TableObjects state={state} onObjectClick={onObjectClick} />
      </group>

      {/* Waiter walks toward camera, stops in front of table at z=2.2... but table is at z=1.7.
          The waiter target should be slightly behind the table (toward camera = +z).
          Actually we want him standing on the FAR side of the table from the camera.
          Camera is at z=5.5, table at z=1.7. So waiter should be at z < 1.7 (behind table from camera POV).
          Let's keep TABLE_Z in Waiter at around 0.8 (behind table) for proper composition. */}
      <Waiter state={state} onArrive={onWaiterArrive} />
    </>
  );
}
