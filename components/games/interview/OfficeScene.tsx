"use client";
import * as THREE from "three";
import Interviewer from "./Interviewer";
import type { InterviewState } from "./useInterviewState";

const CARPET    = "#3a3a4a";
const WALL      = "#E8E4DC";
const WALL_SIDE = "#DDD9D0";
const CEILING   = "#F0EDE8";
const DARK_WOOD = "#1a0f08";
const MED_WOOD  = "#3d2510";

function OfficeRoom() {
  return (
    <group>
      {/* Carpet floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color={CARPET} roughness={0.95} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 2.5, -4]} receiveShadow>
        <planeGeometry args={[12, 5]} />
        <meshStandardMaterial color={WALL} roughness={0.9} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-6, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[12, 5]} />
        <meshStandardMaterial color={WALL_SIDE} roughness={0.9} />
      </mesh>

      {/* Right wall */}
      <mesh position={[6, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[12, 5]} />
        <meshStandardMaterial color={WALL_SIDE} roughness={0.9} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color={CEILING} roughness={0.95} />
      </mesh>

      {/* Wainscoting on back wall */}
      <mesh position={[0, 0.5, -3.95]}>
        <boxGeometry args={[12, 1.0, 0.04]} />
        <meshStandardMaterial color="#C8C4BC" roughness={0.8} />
      </mesh>

      {/* Window on back wall — city view (glowing) */}
      <mesh position={[0, 2.8, -3.92]}>
        <planeGeometry args={[2.8, 1.8]} />
        <meshStandardMaterial
          color="#B8D4E8"
          emissive="#8EC6E6"
          emissiveIntensity={0.6}
          transparent opacity={0.95}
        />
      </mesh>
      {/* Window frame */}
      <mesh position={[0, 2.8, -3.94]}>
        <planeGeometry args={[3.0, 2.0]} />
        <meshStandardMaterial color={MED_WOOD} roughness={0.6} />
      </mesh>
      {/* Window grid */}
      <mesh position={[0, 2.8, -3.9]}>
        <planeGeometry args={[2.8, 0.03]} />
        <meshStandardMaterial color={MED_WOOD} />
      </mesh>
      <mesh position={[0, 2.8, -3.9]}>
        <planeGeometry args={[0.03, 1.8]} />
        <meshStandardMaterial color={MED_WOOD} />
      </mesh>
      {/* Window light */}
      <pointLight position={[0, 2.8, -3.0]} intensity={0.8} color="#C8E0F0" distance={6} />

      {/* Curtains left/right */}
      <mesh position={[-1.65, 2.8, -3.93]} castShadow>
        <boxGeometry args={[0.2, 2.2, 0.08]} />
        <meshStandardMaterial color="#6a5a4a" roughness={0.9} />
      </mesh>
      <mesh position={[1.65, 2.8, -3.93]} castShadow>
        <boxGeometry args={[0.2, 2.2, 0.08]} />
        <meshStandardMaterial color="#6a5a4a" roughness={0.9} />
      </mesh>

      {/* Bookshelf on left wall */}
      <Bookshelf position={[-5.7, 0, -1.5]} />

      {/* Framed certificate/painting on right wall */}
      <mesh position={[5.85, 2.8, 0.5]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[1.2, 0.9, 0.04]} />
        <meshStandardMaterial color="#F5F0E8" roughness={0.3} />
      </mesh>
      <mesh position={[5.84, 2.8, 0.5]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[1.35, 1.05, 0.02]} />
        <meshStandardMaterial color={DARK_WOOD} roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Overhead ceiling lights (recessed) */}
      {[[-2, 0], [2, 0], [0, -2]].map(([x, z], i) => (
        <group key={i} position={[x, 4.95, z]}>
          <mesh>
            <cylinderGeometry args={[0.12, 0.12, 0.05, 12]} />
            <meshStandardMaterial color="#F5F5F5" emissive="#FFE8C0" emissiveIntensity={1.5} />
          </mesh>
          <pointLight intensity={1.2} color="#FFF5E8" distance={7} castShadow />
        </group>
      ))}

      {/* Corner plant */}
      <CornerPlant position={[4.5, 0, 3.5]} />
    </group>
  );
}

function Bookshelf({ position }: { position: [number, number, number] }) {
  const bookColors = ["#8B0000", "#00468B", "#2D5A27", "#6B4C11", "#4A1C6B", "#8B6914", "#2A4A6B"];
  return (
    <group position={position} rotation={[0, Math.PI / 2, 0]}>
      {/* Frame */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.0, 3.2, 0.35]} />
        <meshStandardMaterial color={MED_WOOD} roughness={0.6} />
      </mesh>
      {/* Back panel */}
      <mesh position={[0, 0, -0.15]}>
        <boxGeometry args={[1.9, 3.1, 0.02]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.8} />
      </mesh>
      {/* Shelves + books */}
      {[0.6, 0, -0.65, -1.28].map((y, si) => (
        <group key={si} position={[0, y, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.85, 0.04, 0.3]} />
            <meshStandardMaterial color={MED_WOOD} roughness={0.5} />
          </mesh>
          {bookColors.slice(0, 5 + si).map((c, bi) => {
            const bw = 0.08 + Math.random() * 0.06;
            const bh = 0.22 + Math.random() * 0.1;
            const bx = -0.7 + bi * 0.28;
            return (
              <mesh key={bi} position={[bx, bh / 2 + 0.02, 0]} castShadow>
                <boxGeometry args={[bw, bh, 0.22]} />
                <meshStandardMaterial color={c} roughness={0.7} />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  );
}

function CornerPlant({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Pot */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.18, 0.14, 0.32, 16]} />
        <meshStandardMaterial color="#6B4226" roughness={0.7} />
      </mesh>
      {/* Soil */}
      <mesh position={[0, 0.165, 0]}>
        <cylinderGeometry args={[0.17, 0.17, 0.02, 16]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.9} />
      </mesh>
      {/* Plant leaves */}
      {[0, 0.8, 1.6, 2.4, 3.2].map((angle, i) => (
        <mesh
          key={i}
          position={[
            Math.cos(angle) * 0.2,
            0.3 + i * 0.15,
            Math.sin(angle) * 0.2,
          ]}
          rotation={[0.4, angle, 0.3]}
          castShadow
        >
          <boxGeometry args={[0.04, 0.45, 0.22]} />
          <meshStandardMaterial color={`hsl(${115 + i * 8}, 55%, ${28 + i * 3}%)`} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function Desk() {
  return (
    <group position={[0, 0, -0.3]}>
      {/* Desk surface */}
      <mesh position={[0, 0.78, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.07, 1.1]} />
        <meshStandardMaterial color={DARK_WOOD} roughness={0.3} metalness={0.05} />
      </mesh>
      {/* Desk front panel */}
      <mesh position={[0, 0.42, 0.52]} castShadow>
        <boxGeometry args={[2.4, 0.72, 0.04]} />
        <meshStandardMaterial color={DARK_WOOD} roughness={0.4} />
      </mesh>
      {/* Left leg panel */}
      <mesh position={[-1.12, 0.38, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.18, 0.76, 1.0]} />
        <meshStandardMaterial color={DARK_WOOD} roughness={0.4} />
      </mesh>
      {/* Right leg panel */}
      <mesh position={[1.12, 0.38, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.18, 0.76, 1.0]} />
        <meshStandardMaterial color={DARK_WOOD} roughness={0.4} />
      </mesh>

      {/* Computer monitor */}
      <group position={[0.55, 0.82, -0.22]}>
        {/* Screen */}
        <mesh castShadow>
          <boxGeometry args={[0.7, 0.45, 0.04]} />
          <meshStandardMaterial color="#0a0e18" roughness={0.2} metalness={0.4} />
        </mesh>
        {/* Screen glow (blue) */}
        <mesh position={[0, 0, 0.022]}>
          <planeGeometry args={[0.65, 0.4]} />
          <meshStandardMaterial color="#1a3a6a" emissive="#1a3a6a" emissiveIntensity={0.8} />
        </mesh>
        <pointLight position={[0, 0, 0.1]} intensity={0.3} color="#4488ff" distance={1.5} />
        {/* Stand */}
        <mesh position={[0, -0.26, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.08, 8]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.31, 0]}>
          <boxGeometry args={[0.22, 0.02, 0.14]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* Papers / portfolio */}
      <mesh position={[-0.4, 0.815, 0.1]} rotation={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[0.35, 0.005, 0.48]} />
        <meshStandardMaterial color="#F5F0E8" roughness={0.7} />
      </mesh>
      <mesh position={[-0.38, 0.82, 0.12]} rotation={[0, -0.05, 0]} castShadow>
        <boxGeometry args={[0.35, 0.005, 0.48]} />
        <meshStandardMaterial color="#F0EBE0" roughness={0.7} />
      </mesh>

      {/* Pen */}
      <mesh position={[-0.25, 0.818, 0.32]} rotation={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.006, 0.005, 0.18, 8]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Name plate */}
      <group position={[0, 0.815, 0.38]}>
        <mesh castShadow>
          <boxGeometry args={[0.3, 0.04, 0.08]} />
          <meshStandardMaterial color={DARK_WOOD} roughness={0.4} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0.025, 0]}>
          <boxGeometry args={[0.28, 0.006, 0.005]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Desk lamp */}
      <group position={[-0.85, 0.82, -0.1]}>
        {/* Base */}
        <mesh castShadow>
          <cylinderGeometry args={[0.1, 0.12, 0.03, 16]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Arm */}
        <mesh position={[0, 0.2, 0]} rotation={[0.3, 0, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.4, 8]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Shade */}
        <mesh position={[0, 0.42, -0.1]} rotation={[0.9, 0, 0]} castShadow>
          <coneGeometry args={[0.12, 0.18, 12, 1, true]} />
          <meshStandardMaterial color="#2a1a0a" side={THREE.DoubleSide} roughness={0.6} />
        </mesh>
        <pointLight position={[0, 0.3, -0.08]} intensity={1.0} color="#FFD080" distance={3} castShadow />
      </group>
    </group>
  );
}

function InterviewerChair() {
  return (
    <group position={[0, 0, -1.1]}>
      {/* Seat */}
      <mesh position={[0, 0.52, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.58, 0.08, 0.55]} />
        <meshStandardMaterial color="#1a1a2a" roughness={0.6} />
      </mesh>
      {/* Back */}
      <mesh position={[0, 1.02, -0.24]} castShadow>
        <boxGeometry args={[0.56, 0.9, 0.08]} />
        <meshStandardMaterial color="#1a1a2a" roughness={0.6} />
      </mesh>
      {/* Armrests */}
      <mesh position={[-0.31, 0.72, 0]} castShadow>
        <boxGeometry args={[0.05, 0.06, 0.4]} />
        <meshStandardMaterial color="#2a2a3a" roughness={0.6} />
      </mesh>
      <mesh position={[0.31, 0.72, 0]} castShadow>
        <boxGeometry args={[0.05, 0.06, 0.4]} />
        <meshStandardMaterial color="#2a2a3a" roughness={0.6} />
      </mesh>
      {/* Pedestal */}
      <mesh position={[0, 0.28, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.48, 8]} />
        <meshStandardMaterial color="#3a3a3a" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.04, 20]} />
        <meshStandardMaterial color="#3a3a3a" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

interface OfficeSceneProps {
  state: InterviewState;
}

export default function OfficeScene({ state }: OfficeSceneProps) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} color="#F0ECFF" />
      <directionalLight
        position={[3, 5, 2]}
        intensity={0.6}
        color="#FFF8F0"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={18}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
      />

      <OfficeRoom />
      <Desk />
      <InterviewerChair />
      <Interviewer state={state} />
    </>
  );
}
