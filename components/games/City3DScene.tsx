"use client";

import { useRef, useState, useEffect, useCallback, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Text } from "@react-three/drei";
import * as THREE from "three";
import Link from "next/link";
import { SpeakButton } from "@/components/ui/SpeakButton";

// ── Word bank ─────────────────────────────────────────────────────────────────
interface WordEntry {
  word: string;
  correct: string;
  wrong: [string, string, string];
}

type Lang = "fr" | "es" | "en";

const WORD_BANK: Record<Lang, WordEntry[]> = {
  fr: [
    { word: "bonjour",  correct: "hello",    wrong: ["goodbye",  "thanks",   "please"]    },
    { word: "maison",   correct: "house",    wrong: ["car",      "tree",     "road"]      },
    { word: "chien",    correct: "dog",      wrong: ["cat",      "bird",     "fish"]      },
    { word: "rouge",    correct: "red",      wrong: ["blue",     "green",    "black"]     },
    { word: "manger",   correct: "to eat",   wrong: ["to run",   "to sleep", "to read"]  },
    { word: "eau",      correct: "water",    wrong: ["fire",     "air",      "earth"]     },
    { word: "livre",    correct: "book",     wrong: ["pen",      "desk",     "chair"]     },
    { word: "rapide",   correct: "fast",     wrong: ["slow",     "tall",     "short"]     },
    { word: "nuit",     correct: "night",    wrong: ["day",      "morning",  "noon"]      },
    { word: "ville",    correct: "city",     wrong: ["village",  "forest",   "beach"]     },
    { word: "ami",      correct: "friend",   wrong: ["enemy",    "stranger", "teacher"]  },
    { word: "soleil",   correct: "sun",      wrong: ["moon",     "star",     "cloud"]     },
    { word: "voiture",  correct: "car",      wrong: ["bus",      "train",    "plane"]     },
    { word: "beau",     correct: "beautiful",wrong: ["ugly",     "small",    "empty"]     },
  ],
  es: [
    { word: "hola",     correct: "hello",    wrong: ["goodbye",  "thanks",   "please"]    },
    { word: "casa",     correct: "house",    wrong: ["car",      "tree",     "road"]      },
    { word: "perro",    correct: "dog",      wrong: ["cat",      "bird",     "fish"]      },
    { word: "rojo",     correct: "red",      wrong: ["blue",     "green",    "black"]     },
    { word: "comer",    correct: "to eat",   wrong: ["to run",   "to sleep", "to read"]  },
    { word: "agua",     correct: "water",    wrong: ["fire",     "air",      "earth"]     },
    { word: "libro",    correct: "book",     wrong: ["pen",      "desk",     "chair"]     },
    { word: "rápido",   correct: "fast",     wrong: ["slow",     "tall",     "short"]     },
    { word: "noche",    correct: "night",    wrong: ["day",      "morning",  "noon"]      },
    { word: "ciudad",   correct: "city",     wrong: ["village",  "forest",   "beach"]     },
    { word: "amigo",    correct: "friend",   wrong: ["enemy",    "stranger", "teacher"]  },
    { word: "sol",      correct: "sun",      wrong: ["moon",     "star",     "cloud"]     },
    { word: "coche",    correct: "car",      wrong: ["bus",      "train",    "plane"]     },
    { word: "bonito",   correct: "beautiful",wrong: ["ugly",     "small",    "empty"]     },
  ],
  // English: word = hint shown in 3D space, correct = English word to shoot
  en: [
    { word: "👋 a greeting",          correct: "hello",     wrong: ["goodbye",   "thanks",    "please"]   },
    { word: "🏠 you live here",        correct: "house",     wrong: ["car",       "school",    "park"]     },
    { word: "🐶 a pet that barks",     correct: "dog",       wrong: ["cat",       "bird",      "fish"]     },
    { word: "🔴 the color of fire",    correct: "red",       wrong: ["blue",      "green",     "black"]    },
    { word: "🍽️ what you do at dinner",correct: "eat",       wrong: ["run",       "sleep",     "read"]     },
    { word: "💧 you drink this",       correct: "water",     wrong: ["fire",      "sand",      "stone"]    },
    { word: "📖 you read this",        correct: "book",      wrong: ["pen",       "desk",      "chair"]    },
    { word: "⚡ opposite of slow",     correct: "fast",      wrong: ["tall",      "short",     "heavy"]    },
    { word: "🌙 opposite of day",      correct: "night",     wrong: ["morning",   "noon",      "evening"]  },
    { word: "🏙️ a big place of people",correct: "city",      wrong: ["village",   "forest",    "beach"]    },
    { word: "🤝 a close companion",    correct: "friend",    wrong: ["enemy",     "stranger",  "boss"]     },
    { word: "☀️ shines in the sky",    correct: "sun",       wrong: ["moon",      "star",      "cloud"]    },
    { word: "🚗 a road vehicle",       correct: "car",       wrong: ["bus",       "train",     "plane"]    },
    { word: "😍 very nice to look at", correct: "beautiful", wrong: ["ugly",      "small",     "empty"]    },
  ],
};

// ── Constants ─────────────────────────────────────────────────────────────────
const ROUNDS = 10;
const TARGET_COLORS = ["#818cf8", "#34d399", "#fb923c", "#f472b6"] as const;

// 2×2 grid of targets facing the camera
const BASE_POS: [number, number, number][] = [
  [-3.0,  1.7, -10],
  [ 3.0,  1.7, -10],
  [-3.0, -1.5, -10],
  [ 3.0, -1.5, -10],
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Explosion particles ────────────────────────────────────────────────────────
function Explosion({
  position, color, onDone,
}: {
  position: [number, number, number];
  color: string;
  onDone: () => void;
}) {
  const COUNT = 18;
  const refs = useRef<(THREE.Mesh | null)[]>(Array(COUNT).fill(null));
  const vels = useRef(
    Array.from({ length: COUNT }, () =>
      new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
      ).normalize().multiplyScalar(3 + Math.random() * 5)
    )
  );
  const t = useRef(0);
  const done = useRef(false);

  useFrame((_, delta) => {
    if (done.current) return;
    t.current += delta;
    if (t.current > 0.7) { done.current = true; onDone(); return; }

    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const v = vels.current[i];
      mesh.position.x = position[0] + v.x * t.current;
      mesh.position.y = position[1] + v.y * t.current - 4 * t.current * t.current;
      mesh.position.z = position[2] + v.z * t.current;
      const alpha = Math.max(0, 1 - t.current / 0.7);
      (mesh.material as THREE.MeshBasicMaterial).opacity = alpha;
      mesh.scale.setScalar(alpha * 0.9 + 0.1);
    });
  });

  return (
    <>
      {Array.from({ length: COUNT }).map((_, i) => (
        <mesh
          key={i}
          ref={el => { refs.current[i] = el; }}
          position={[...position] as [number, number, number]}
        >
          <sphereGeometry args={[0.1, 5, 4]} />
          <meshBasicMaterial color={color} transparent opacity={1} />
        </mesh>
      ))}
    </>
  );
}

// ── Floating target panel ──────────────────────────────────────────────────────
function ShootTarget({
  label, isCorrect, basePos, color, driftSpeed, baseScale, isWrong, active, onShoot,
}: {
  label: string;
  isCorrect: boolean;
  basePos: [number, number, number];
  color: string;
  driftSpeed: number;
  baseScale: number;
  isWrong: boolean;
  active: boolean;
  onShoot: (isCorrect: boolean, pos: [number, number, number]) => void;
}) {
  const groupRef  = useRef<THREE.Group>(null!);
  const fillRef   = useRef<THREE.Mesh>(null!);
  const frameRef  = useRef<THREE.Mesh>(null!);
  const phase     = useRef(Math.random() * Math.PI * 2);
  const growScale = useRef(baseScale);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    phase.current += delta * driftSpeed;

    if (groupRef.current) {
      // Drift: sinusoidal float
      groupRef.current.position.x = basePos[0] + Math.sin(phase.current * 0.55) * 0.22;
      groupRef.current.position.y = basePos[1] + Math.sin(phase.current * 0.8)  * 0.28;
      groupRef.current.position.z = basePos[2];
      groupRef.current.rotation.y = Math.sin(phase.current * 0.3) * 0.07;

      // Grow over time (urgency mechanic)
      growScale.current = Math.min(baseScale * 1.55, growScale.current + delta * 0.035 * driftSpeed);
      groupRef.current.scale.setScalar(growScale.current);
    }

    // Wrong-shot flash: pulse emissive red
    if (fillRef.current) {
      const mat = fillRef.current.material as THREE.MeshStandardMaterial;
      if (isWrong) {
        mat.emissive.setStyle("#ff1a1a");
        mat.emissiveIntensity = 0.9 + Math.sin(phase.current * 18) * 0.4;
      } else {
        mat.emissive.setStyle(color);
        mat.emissiveIntensity = hovered ? 0.45 : 0.12;
      }
    }
    if (frameRef.current) {
      const mat = frameRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = isWrong ? 0.0 : (hovered ? 1.2 : 0.55);
    }
  });

  const handleClick = () => {
    if (!active) return;
    const g = groupRef.current;
    onShoot(isCorrect, [g.position.x, g.position.y, g.position.z]);
  };

  return (
    <group
      ref={groupRef}
      position={basePos}
      onClick={handleClick}
      onPointerOver={() => active && setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Neon border frame */}
      <mesh ref={frameRef}>
        <boxGeometry args={[2.7, 1.78, 0.1]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.55}
          roughness={0.25}
          metalness={0.7}
        />
      </mesh>

      {/* Dark fill (slightly smaller + in front) */}
      <mesh ref={fillRef} position={[0, 0, 0.07]}>
        <boxGeometry args={[2.46, 1.48, 0.08]} />
        <meshStandardMaterial
          color="#05040f"
          emissive={color}
          emissiveIntensity={0.12}
          roughness={0.5}
          metalness={0.15}
        />
      </mesh>

      {/* Corner accent — top-left */}
      <mesh position={[-1.2, 0.76, 0.14]}>
        <boxGeometry args={[0.3, 0.07, 0.04]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={[-1.2, 0.76, 0.14]}>
        <boxGeometry args={[0.07, 0.3, 0.04]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {/* Corner — bottom-right */}
      <mesh position={[1.2, -0.76, 0.14]}>
        <boxGeometry args={[0.3, 0.07, 0.04]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={[1.2, -0.76, 0.14]}>
        <boxGeometry args={[0.07, 0.3, 0.04]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* Label text */}
      <Text
        position={[0, 0, 0.18]}
        fontSize={hovered ? 0.42 : 0.38}
        color={hovered ? "#ffffff" : color}
        outlineWidth={0.045}
        outlineColor="#000000"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.2}
      >
        {label}
      </Text>

      {/* Hover point-light */}
      {hovered && <pointLight color={color} intensity={1.5} distance={4} decay={2} />}
    </group>
  );
}

// ── Spinning decorative gems ───────────────────────────────────────────────────
function Gem({ pos, color, speed }: { pos: [number,number,number]; color: string; speed: number }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((s) => {
    const t = s.clock.getElapsedTime() * speed;
    ref.current.rotation.x = t * 0.7;
    ref.current.rotation.y = t;
    ref.current.position.y = pos[1] + Math.sin(t * 0.5) * 0.4;
  });
  return (
    <mesh ref={ref} position={pos} castShadow>
      <octahedronGeometry args={[0.55, 0]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} roughness={0.15} metalness={0.9} />
    </mesh>
  );
}

// ── Arena (background / scene dressing) ───────────────────────────────────────
function Arena({ currentWord, wordLabel }: { currentWord: string; wordLabel: string }) {
  return (
    <>
      <Stars radius={90} depth={50} count={4000} factor={3} saturation={0.6} fade />

      {/* Grid floor receding into distance */}
      <gridHelper args={[80, 50, "#3b1d8a", "#1a0f40"]} position={[0, -6, -20]} />
      <gridHelper args={[80, 50, "#3b1d8a", "#1a0f40"]} position={[0, -6, -60]} />

      {/* Decorative gems at sides */}
      <Gem pos={[-9,  1, -12]} color="#818cf8" speed={0.8} />
      <Gem pos={[ 9,  1, -12]} color="#34d399" speed={0.65} />
      <Gem pos={[-11, -2, -16]} color="#f472b6" speed={0.9} />
      <Gem pos={[ 11, -2, -16]} color="#fb923c" speed={0.7} />

      {/* Word to translate — glowing 3D text floating above targets */}
      <Text
        position={[0, 4.8, -10]}
        fontSize={1.15}
        color="#ffffff"
        outlineWidth={0.06}
        outlineColor="#000000"
        anchorX="center"
        anchorY="middle"
      >
        {currentWord}
      </Text>
      <Text
        position={[0, 6.2, -10]}
        fontSize={0.32}
        color="#94a3b8"
        outlineWidth={0.03}
        outlineColor="#000000"
        anchorX="center"
        anchorY="middle"
      >
        {wordLabel}
      </Text>

      {/* Lighting */}
      <ambientLight intensity={0.22} />
      <pointLight position={[0, 6, -4]}  color="#818cf8" intensity={2.5} distance={22} decay={2} />
      <pointLight position={[0, -4, -8]} color="#1e1060" intensity={1.5} distance={18} decay={2} />
      <pointLight position={[-8, 2, -8]} color="#0f4a3a" intensity={1.0} distance={14} decay={2} />
      <pointLight position={[ 8, 2, -8]} color="#4a1030" intensity={1.0} distance={14} decay={2} />
    </>
  );
}

// ── Choice type ────────────────────────────────────────────────────────────────
interface Choice { label: string; isCorrect: boolean; color: string }

// ── Explosion state ────────────────────────────────────────────────────────────
interface ExplState { pos: [number,number,number]; color: string }

// ── Main game export ───────────────────────────────────────────────────────────
export default function City3DGame({ targetLang }: { targetLang: string }) {
  const lang = (targetLang === "es" ? "es" : targetLang === "en" ? "en" : "fr") as Lang;

  // Shuffled word list fixed at game start
  const [words]   = useState<WordEntry[]>(() => shuffle(WORD_BANK[lang]).slice(0, ROUNDS));

  const [started,    setStarted]    = useState(false);
  const [gameOver,   setGameOver]   = useState(false);
  const [finished,   setFinished]   = useState(false);
  const [round,      setRound]      = useState(0);
  const [lives,      setLives]      = useState(3);
  const [score,      setScore]      = useState(0);
  const [timeLeft,   setTimeLeft]   = useState(10);
  const [roundActive,setRoundActive]= useState(false);
  const [choices,    setChoices]    = useState<Choice[]>([]);
  const [wrongIdx,   setWrongIdx]   = useState<number | null>(null);
  const [explosion,  setExplosion]  = useState<ExplState | null>(null);
  const [xpEarned,   setXpEarned]   = useState(0);
  const [streak,     setStreak]     = useState(0); // correct-in-a-row

  // Round duration: gets shorter in later rounds
  const roundTime = useCallback((r: number) => (r < 4 ? 10 : r < 7 ? 8 : 6), []);
  // Drift speed: faster in later rounds
  const driftSpeed = useCallback((r: number) => 1 + r * 0.2, []);
  // Base scale: shrinks in final rounds (harder to click)
  const baseScale  = useCallback((r: number) => (r >= 7 ? 0.82 : r >= 4 ? 0.92 : 1.0), []);

  // Build choices for a round
  const setupRound = useCallback((r: number) => {
    if (r >= ROUNDS) { setFinished(true); return; }
    const w = words[r];
    const options = shuffle([
      { label: w.correct,   isCorrect: true  },
      { label: w.wrong[0],  isCorrect: false },
      { label: w.wrong[1],  isCorrect: false },
      { label: w.wrong[2],  isCorrect: false },
    ]);
    setChoices(options.map((o, i) => ({ ...o, color: TARGET_COLORS[i] })));
    setTimeLeft(roundTime(r));
    setRoundActive(true);
  }, [words, roundTime]);

  // Start first round when game starts
  useEffect(() => {
    if (started && !gameOver && !finished) setupRound(round);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, round]);

  // Countdown timer
  useEffect(() => {
    if (!roundActive || gameOver || finished) return;
    if (timeLeft <= 0) {
      setRoundActive(false);
      setStreak(0);
      setLives(prev => {
        const nl = prev - 1;
        if (nl <= 0) setTimeout(() => setGameOver(true), 600);
        return Math.max(0, nl);
      });
      setTimeout(() => setRound(r => r + 1), 900);
      return;
    }
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, roundActive, gameOver, finished]);

  // Handle shooting a target
  const handleShoot = useCallback((
    isCorrect: boolean,
    pos: [number, number, number],
    idx: number,
  ) => {
    if (!roundActive) return;

    if (isCorrect) {
      setRoundActive(false);
      const newStreak = streak + 1;
      setStreak(newStreak);
      // Points: base 100 + speed bonus + streak bonus
      const speedBonus  = timeLeft >= 8 ? 60 : timeLeft >= 5 ? 30 : 0;
      const streakBonus = newStreak >= 3 ? 50 : newStreak === 2 ? 20 : 0;
      setScore(s => s + 100 + speedBonus + streakBonus);
      setExplosion({ pos, color: choices[idx]?.color ?? "#ffffff" });
      setTimeout(() => setRound(r => r + 1), 950);
    } else {
      setStreak(0);
      setWrongIdx(idx);
      setLives(prev => {
        const nl = prev - 1;
        if (nl <= 0) setTimeout(() => setGameOver(true), 750);
        return Math.max(0, nl);
      });
      setTimeout(() => setWrongIdx(null), 700);
    }
  }, [roundActive, timeLeft, streak, choices]);

  // Save score when finished
  useEffect(() => {
    if (!finished) return;
    fetch("/api/games/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameType: "CITY_EXPLORER", score, wordsUsed: [] }),
    })
      .then(r => r.json())
      .then(d => { setXpEarned(d.xpEarned ?? 0); window.dispatchEvent(new CustomEvent("xp-updated")); })
      .catch(() => {});
  }, [finished]);

  // ── Start screen ──────────────────────────────────────────────────────────────
  if (!started) {
    return (
      <div style={{ maxWidth: 480, textAlign: "center" }}>
        <div className="card" style={{ padding: "44px 28px" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎯</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", margin: "0 0 10px" }}>
            Word Blaster 3D
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 24 }}>
            A word appears in the arena. Four targets float toward you with possible translations.
            Shoot the correct one before time runs out!
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28, textAlign: "left" }}>
            {[
              ["🎯", "Click the correct translation to blast it"],
              ["💥", "Wrong shot = −1 life · Timeout = −1 life"],
              ["⚡", "Shoot fast for speed bonus points"],
              ["🔥", "Chain correct answers for a streak bonus"],
              ["📈", "Rounds get harder — targets grow, shrink & speed up"],
            ].map(([icon, txt]) => (
              <div key={txt as string} style={{ display:"flex", alignItems:"center", gap:12, padding:"9px 14px", borderRadius:10, background:"var(--surface-2)", border:"1px solid var(--border)" }}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                <span style={{ fontSize: 13, color: "var(--text-2)" }}>{txt}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setStarted(true)} className="btn-primary" style={{ width:"100%", fontSize:16, padding:"14px" }}>
            Start Blasting 🎯
          </button>
        </div>
      </div>
    );
  }

  // ── End screen ────────────────────────────────────────────────────────────────
  if (gameOver || finished) {
    const totalPossible = ROUNDS * (100 + 60 + 50); // rough max
    const pct = Math.min(100, Math.round((score / (ROUNDS * 100)) * 100));
    const emoji = score >= ROUNDS * 130 ? "🏆" : score >= ROUNDS * 80 ? "🎉" : "😤";
    return (
      <div style={{ maxWidth: 480, textAlign: "center" }}>
        <div className="card" style={{ padding: "44px 28px" }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>{emoji}</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", margin: "0 0 8px" }}>
            {gameOver ? "Game Over!" : "All Rounds Clear!"}
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-2)", margin: "0 0 20px" }}>
            Final score: <strong style={{ color: "var(--accent)", fontSize: 18 }}>{score}</strong>
            &nbsp;· Round {Math.min(round + 1, ROUNDS)}/{ROUNDS}
          </p>
          {xpEarned > 0 && (
            <div style={{ padding:"10px 16px", borderRadius:12, background:"var(--accent-dim)", marginBottom:20, fontSize:14, fontWeight:700, color:"var(--accent)" }}>
              +{xpEarned} XP earned!
            </div>
          )}
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={() => window.location.reload()} className="btn-primary" style={{ flex:1 }}>
              Play again
            </button>
            <Link href="/games" className="btn-outline" style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none" }}>
              All games
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Active game ───────────────────────────────────────────────────────────────
  const currentWord = words[round]?.word ?? "";
  const maxTime     = roundTime(round);
  const timerPct    = (timeLeft / maxTime) * 100;
  const timerColor  = timeLeft <= 2 ? "#ef4444" : timeLeft <= 4 ? "#f97316" : "#818cf8";
  const ds          = driftSpeed(round);
  const bs          = baseScale(round);
  const phase       = round < 4 ? "Warm up" : round < 7 ? "Heating up 🔥" : "Danger zone ⚡";

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12, alignItems:"center" }}>
      <div style={{ width:"100%", maxWidth:900 }}>

        {/* ── Top HUD bar ── */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8, flexWrap:"wrap" }}>
          {/* Lives */}
          <div style={{ display:"flex", gap:4 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} style={{ fontSize: 20, opacity: i < lives ? 1 : 0.2, transition:"opacity 0.3s" }}>❤️</span>
            ))}
          </div>

          {/* Round */}
          <span style={{ fontSize:13, fontWeight:700, color:"var(--text-2)", marginLeft:"auto" }}>
            {phase} · Round {round + 1}/{ROUNDS}
          </span>

          {/* Streak */}
          {streak >= 2 && (
            <span style={{ fontSize:13, fontWeight:800, color:"#fbbf24" }}>
              🔥 ×{streak} streak
            </span>
          )}

          {/* Score */}
          <span style={{ fontSize:14, fontWeight:800, color:"var(--accent)" }}>
            {score} pts
          </span>
        </div>

        {/* ── Timer bar ── */}
        <div style={{ width:"100%", height:6, borderRadius:4, background:"var(--surface-2)", marginBottom:10, overflow:"hidden" }}>
          <div style={{
            height:"100%",
            width:`${timerPct}%`,
            borderRadius:4,
            background: timerColor,
            transition:"width 1s linear, background 0.4s",
            boxShadow:`0 0 8px ${timerColor}`,
          }} />
        </div>

        {/* ── Canvas ── */}
        <div style={{ position:"relative", borderRadius:14, overflow:"hidden", border:"2px solid var(--border)" }}>
          <Canvas
            style={{ width:"100%", height:520, display:"block", cursor:"crosshair", background:"#05040f" }}
            gl={{ antialias:true, toneMapping:THREE.ACESFilmicToneMapping, toneMappingExposure:1.05 }}
            camera={{ position:[0, 0, 5], fov:68 }}
          >
            <Suspense fallback={null}>
              <Arena
                currentWord={currentWord}
                wordLabel={lang === "fr" ? "French → English" : lang === "es" ? "Spanish → English" : "Hint → English word"}
              />

              {choices.map((c, i) => (
                <ShootTarget
                  key={`r${round}-t${i}`}
                  label={c.label}
                  isCorrect={c.isCorrect}
                  basePos={BASE_POS[i]}
                  color={c.color}
                  driftSpeed={ds}
                  baseScale={bs}
                  isWrong={wrongIdx === i}
                  active={roundActive}
                  onShoot={(correct, pos) => handleShoot(correct, pos, i)}
                />
              ))}

              {explosion && (
                <Explosion
                  position={explosion.pos}
                  color={explosion.color}
                  onDone={() => setExplosion(null)}
                />
              )}
            </Suspense>
          </Canvas>

          {/* Speak current word */}
          {currentWord && (
            <div style={{ position:"absolute", top:12, left:"50%", transform:"translateX(-50%)" }}>
              <SpeakButton text={currentWord} lang={lang} size={15}
                style={{ background:"rgba(0,0,0,0.55)", borderColor:"rgba(129,140,248,0.55)" }} />
            </div>
          )}

          {/* Timer digit overlay */}
          <div style={{
            position:"absolute", top:12, right:14,
            fontSize:28, fontWeight:900,
            color: timerColor,
            textShadow:`0 0 12px ${timerColor}`,
            pointerEvents:"none",
            fontVariantNumeric:"tabular-nums",
            lineHeight:1,
          }}>
            {timeLeft}s
          </div>

          {/* Hint when nearly out of time */}
          {timeLeft <= 3 && (
            <div style={{
              position:"absolute", bottom:16, left:"50%", transform:"translateX(-50%)",
              fontSize:13, fontWeight:800, color:"#ef4444",
              textShadow:"0 0 10px #ef4444",
              animation:"pulse 0.5s ease-in-out infinite alternate",
              pointerEvents:"none",
            }}>
              ⚠️ HURRY!
            </div>
          )}
        </div>

        {/* ── Scoring legend ── */}
        <div style={{ display:"flex", gap:10, marginTop:8, flexWrap:"wrap" }}>
          {[
            ["🎯", "Correct", "+100 pts"],
            ["⚡", "Fast shot (≥8s left)", "+60 pts"],
            ["🔥", "3× streak", "+50 pts"],
          ].map(([icon, label, pts]) => (
            <div key={label as string} style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 10px", borderRadius:8, background:"var(--surface-2)", border:"1px solid var(--border)", fontSize:12 }}>
              <span>{icon}</span>
              <span style={{ color:"var(--text-3)" }}>{label}</span>
              <span style={{ fontWeight:700, color:"var(--accent)" }}>{pts}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          from { opacity: 0.7; }
          to   { opacity: 1;   }
        }
      `}</style>
    </div>
  );
}
