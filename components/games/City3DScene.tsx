"use client";

import { useRef, useState, useEffect, useCallback, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sky, Text } from "@react-three/drei";
import * as THREE from "three";
import Link from "next/link";

// ── Constants ──────────────────────────────────────────────────────────────────
const PLAYER_SPEED = 6;
const COLLECT_DIST = 2.4;

// ── Data ───────────────────────────────────────────────────────────────────────
interface OrbData {
  id: string;
  pos: [number, number, number];
  color: string;
  fr: { word: string; right: string; wrong: [string, string, string] };
  es: { word: string; right: string; wrong: [string, string, string] };
}

const ORBS: OrbData[] = [
  { id:"o1", pos:[ 6,0.5, 4], color:"#818cf8",
    fr:{word:"bonjour", right:"hello",   wrong:["goodbye","thanks","sorry"]},
    es:{word:"hola",    right:"hello",   wrong:["goodbye","thanks","sorry"]} },
  { id:"o2", pos:[-5,0.5, 7], color:"#fb923c",
    fr:{word:"maison",  right:"house",   wrong:["car","road","tree"]},
    es:{word:"casa",    right:"house",   wrong:["car","road","tree"]} },
  { id:"o3", pos:[ 9,0.5,-4], color:"#34d399",
    fr:{word:"ville",   right:"city",    wrong:["town","village","country"]},
    es:{word:"ciudad",  right:"city",    wrong:["town","village","country"]} },
  { id:"o4", pos:[-8,0.5,-5], color:"#f472b6",
    fr:{word:"arbre",   right:"tree",    wrong:["flower","bush","grass"]},
    es:{word:"árbol",   right:"tree",    wrong:["flower","bush","grass"]} },
  { id:"o5", pos:[ 2,0.5,-10],color:"#60a5fa",
    fr:{word:"ciel",    right:"sky",     wrong:["sun","cloud","rain"]},
    es:{word:"cielo",   right:"sky",     wrong:["sun","cloud","rain"]} },
  { id:"o6", pos:[-3,0.5,11], color:"#a78bfa",
    fr:{word:"route",   right:"road",    wrong:["path","bridge","street"]},
    es:{word:"camino",  right:"road",    wrong:["path","bridge","street"]} },
  { id:"o7", pos:[11,0.5, 9], color:"#fbbf24",
    fr:{word:"fleur",   right:"flower",  wrong:["leaf","fruit","seed"]},
    es:{word:"flor",    right:"flower",  wrong:["leaf","fruit","seed"]} },
  { id:"o8", pos:[-10,0.5,-9],color:"#f87171",
    fr:{word:"chat",    right:"cat",     wrong:["dog","bird","fish"]},
    es:{word:"gato",    right:"cat",     wrong:["dog","bird","fish"]} },
];

interface BuildingDef { x:number; z:number; w:number; d:number; h:number; color:string }
const BUILDINGS: BuildingDef[] = [
  { x:-8,  z:-8,  w:3, d:3, h:4, color:"#f97316" },
  { x: 9,  z:-7,  w:4, d:3, h:6, color:"#3b82f6" },
  { x:-9,  z: 8,  w:3, d:4, h:3, color:"#ec4899" },
  { x: 9,  z: 9,  w:3, d:3, h:5, color:"#eab308" },
  { x: 0,  z:-11, w:5, d:2, h:4, color:"#8b5cf6" },
  { x: 0,  z: 12, w:4, d:2, h:3, color:"#06b6d4" },
  { x:-13, z: 0,  w:2, d:6, h:5, color:"#f43f5e" },
  { x: 13, z: 0,  w:2, d:5, h:4, color:"#84cc16" },
  { x:-11, z: 11, w:3, d:3, h:2, color:"#f59e0b" },
  { x: 11, z:-10, w:3, d:3, h:3, color:"#10b981" },
];

const TREE_POS: [number, number][] = [
  [-3,3],[3,-3],[-5,0],[5,2],[-2,-5],[4,7],[-6,-7],[7,-5],[-7,5],[6,-8],
];

// ── Ground ─────────────────────────────────────────────────────────────────────
function Ground() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 34]} />
        <meshLambertMaterial color="#4ade80" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[40, 3]} />
        <meshLambertMaterial color="#94a3b8" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[3, 34]} />
        <meshLambertMaterial color="#94a3b8" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <circleGeometry args={[3.5, 20]} />
        <meshLambertMaterial color="#e2e8f0" />
      </mesh>
    </>
  );
}

// ── Building ───────────────────────────────────────────────────────────────────
function Building({ b }: { b: BuildingDef }) {
  const winRows = Math.max(1, Math.floor(b.h / 1.6));
  return (
    <group position={[b.x, b.h / 2, b.z]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[b.w, b.h, b.d]} />
        <meshLambertMaterial color={b.color} />
      </mesh>
      <mesh position={[0, b.h / 2 + 0.12, 0]}>
        <boxGeometry args={[b.w + 0.2, 0.22, b.d + 0.2]} />
        <meshLambertMaterial color="#0f172a" />
      </mesh>
      {Array.from({ length: winRows }).map((_, i) => (
        <mesh key={i} position={[0, -b.h / 2 + 0.9 + i * 1.5, b.d / 2 + 0.02]}>
          <boxGeometry args={[b.w * 0.55, 0.65, 0.05]} />
          <meshLambertMaterial color="#fef9c3" emissive="#fde047" emissiveIntensity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

// ── Tree ───────────────────────────────────────────────────────────────────────
function Tree({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 1.2, 6]} />
        <meshLambertMaterial color="#78350f" />
      </mesh>
      <mesh position={[0, 1.85, 0]} castShadow>
        <sphereGeometry args={[0.85, 7, 5]} />
        <meshLambertMaterial color="#15803d" />
      </mesh>
    </group>
  );
}

// ── Word Orb ───────────────────────────────────────────────────────────────────
function WordOrb({
  orb, lang, playerPosRef, collected,
}: {
  orb: OrbData;
  lang: "fr" | "es";
  playerPosRef: React.MutableRefObject<THREE.Vector3>;
  collected: boolean;
}) {
  const meshRef  = useRef<THREE.Mesh>(null!);
  const phase    = useRef(Math.random() * Math.PI * 2);
  const [near, setNear] = useState(false);
  const nearRef  = useRef(false);

  useFrame((_, delta) => {
    phase.current += delta;
    if (meshRef.current) {
      meshRef.current.position.y = 0.5 + Math.sin(phase.current * 1.4) * 0.28;
      meshRef.current.rotation.y += delta * 1.3;
    }
    const p = playerPosRef.current;
    const dist = Math.sqrt((p.x - orb.pos[0]) ** 2 + (p.z - orb.pos[2]) ** 2);
    const isNear = dist < COLLECT_DIST;
    if (isNear !== nearRef.current) {
      nearRef.current = isNear;
      setNear(isNear);
    }
  });

  if (collected) return null;

  return (
    <group position={[orb.pos[0], 0, orb.pos[2]]}>
      <mesh ref={meshRef} castShadow>
        <sphereGeometry args={[0.5, 12, 10]} />
        <meshLambertMaterial
          color={orb.color}
          emissive={orb.color}
          emissiveIntensity={near ? 0.9 : 0.35}
        />
      </mesh>
      <Text
        position={[0, 2.3, 0]}
        fontSize={0.42}
        color="white"
        outlineWidth={0.05}
        outlineColor="#000000"
        anchorX="center"
        anchorY="middle"
      >
        {orb[lang].word}
      </Text>
      {near && (
        <>
          <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.78, 1.0, 24]} />
            <meshBasicMaterial
              color={orb.color}
              transparent
              opacity={0.5}
              side={THREE.DoubleSide}
            />
          </mesh>
          <Text
            position={[0, 1.65, 0]}
            fontSize={0.27}
            color="#fbbf24"
            outlineWidth={0.04}
            outlineColor="#000000"
            anchorX="center"
            anchorY="middle"
          >
            Press E
          </Text>
        </>
      )}
    </group>
  );
}

// ── Player ─────────────────────────────────────────────────────────────────────
function Player({
  keysRef,
  playerPosRef,
  collectedRef,
  onCollect,
}: {
  keysRef: React.MutableRefObject<Set<string>>;
  playerPosRef: React.MutableRefObject<THREE.Vector3>;
  collectedRef: React.MutableRefObject<Set<string>>;
  onCollect: (id: string) => void;
}) {
  const groupRef    = useRef<THREE.Group>(null!);
  const camTarget   = useRef(new THREE.Vector3(0, 9, 12));
  const onCollectRef = useRef(onCollect);
  useEffect(() => { onCollectRef.current = onCollect; }, [onCollect]);

  const wouldCollide = (x: number, z: number) =>
    BUILDINGS.some(b => {
      const m = 0.8;
      return x > b.x - b.w/2 - m && x < b.x + b.w/2 + m &&
             z > b.z - b.d/2 - m && z < b.z + b.d/2 + m;
    });

  useFrame((state, delta) => {
    const keys = keysRef.current;
    const pos  = playerPosRef.current;

    let dx = 0, dz = 0;
    if (keys.has("ArrowUp")    || keys.has("w") || keys.has("W")) dz -= 1;
    if (keys.has("ArrowDown")  || keys.has("s") || keys.has("S")) dz += 1;
    if (keys.has("ArrowLeft")  || keys.has("a") || keys.has("A")) dx -= 1;
    if (keys.has("ArrowRight") || keys.has("d") || keys.has("D")) dx += 1;

    const len = Math.sqrt(dx * dx + dz * dz);
    if (len > 0) {
      dx /= len; dz /= len;
      const nx = pos.x + dx * PLAYER_SPEED * delta;
      const nz = pos.z + dz * PLAYER_SPEED * delta;
      if (!wouldCollide(nx, pos.z)) pos.x = nx;
      if (!wouldCollide(pos.x, nz)) pos.z = nz;
      pos.x = Math.max(-16, Math.min(16, pos.x));
      pos.z = Math.max(-14, Math.min(14, pos.z));
    }

    if (groupRef.current) {
      groupRef.current.position.x = pos.x;
      groupRef.current.position.z = pos.z;
      if (len > 0) {
        const target = Math.atan2(dx, dz);
        const curr   = groupRef.current.rotation.y;
        const diff   = ((target - curr + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        groupRef.current.rotation.y += diff * 0.22;
      }
    }

    // Smooth camera follow
    camTarget.current.set(pos.x, pos.y + 9, pos.z + 12);
    state.camera.position.lerp(camTarget.current, 0.07);
    state.camera.lookAt(pos.x, pos.y + 1, pos.z);

    // E key → collect nearest orb
    if (keys.has("e") || keys.has("E")) {
      let nearestId: string | null = null;
      let nearestDist = COLLECT_DIST;
      ORBS.forEach(orb => {
        if (collectedRef.current.has(orb.id)) return;
        const d = Math.sqrt((pos.x - orb.pos[0]) ** 2 + (pos.z - orb.pos[2]) ** 2);
        if (d < nearestDist) { nearestDist = d; nearestId = orb.id; }
      });
      if (nearestId) {
        keys.delete("e"); keys.delete("E");
        onCollectRef.current(nearestId);
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh position={[0, 0.65, 0]} castShadow>
        <capsuleGeometry args={[0.28, 0.7, 4, 8]} />
        <meshLambertMaterial color="#6366f1" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.48, 0]} castShadow>
        <sphereGeometry args={[0.27, 8, 7]} />
        <meshLambertMaterial color="#fed7aa" />
      </mesh>
      {/* Eyes */}
      {([-0.1, 0.1] as number[]).map((ox, i) => (
        <mesh key={i} position={[ox, 1.52, 0.24]}>
          <sphereGeometry args={[0.045, 5, 5]} />
          <meshBasicMaterial color="#1e293b" />
        </mesh>
      ))}
      {/* Shadow disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.38, 12]} />
        <meshBasicMaterial color="black" transparent opacity={0.18} />
      </mesh>
    </group>
  );
}

// ── Scene ──────────────────────────────────────────────────────────────────────
function GameScene({
  lang, keysRef, playerPosRef, collectedRef, collected, onCollect,
}: {
  lang: "fr" | "es";
  keysRef: React.MutableRefObject<Set<string>>;
  playerPosRef: React.MutableRefObject<THREE.Vector3>;
  collectedRef: React.MutableRefObject<Set<string>>;
  collected: Set<string>;
  onCollect: (id: string) => void;
}) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[10, 20, 10]} intensity={1.1} castShadow
        shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <Sky sunPosition={[100, 50, 100]} />
      <fog attach="fog" args={["#bfdbfe", 20, 60]} />
      <Ground />
      {BUILDINGS.map((b, i) => <Building key={i} b={b} />)}
      {TREE_POS.map(([x, z], i) => <Tree key={i} x={x} z={z} />)}
      {ORBS.map(orb => (
        <WordOrb
          key={orb.id}
          orb={orb}
          lang={lang}
          playerPosRef={playerPosRef}
          collected={collected.has(orb.id)}
        />
      ))}
      <Player
        keysRef={keysRef}
        playerPosRef={playerPosRef}
        collectedRef={collectedRef}
        onCollect={onCollect}
      />
    </>
  );
}

// ── Quiz types ─────────────────────────────────────────────────────────────────
interface Quiz {
  orbId: string; word: string;
  choices: string[]; correct: string;
  chosen: number | null;
}

// ── D-pad button ───────────────────────────────────────────────────────────────
function DPad({ label, onPress, onRelease, center }: {
  label: string; onPress: () => void; onRelease: () => void; center?: boolean
}) {
  return (
    <button
      onPointerDown={e => { e.preventDefault(); onPress(); }}
      onPointerUp={e   => { e.preventDefault(); onRelease(); }}
      onPointerLeave={() => onRelease()}
      style={{
        width: 48, height: 48, borderRadius: 10,
        border: `1.5px solid ${center ? "var(--accent)" : "var(--border-md)"}`,
        background: center ? "var(--accent-dim)" : "var(--surface-2)",
        color: center ? "var(--accent)" : "var(--text-2)",
        fontSize: center ? 11 : 16, fontWeight: 700,
        cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        userSelect: "none",
        WebkitUserSelect: "none" as const,
        touchAction: "none",
      }}
    >
      {label}
    </button>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────
export default function City3DGame({ targetLang }: { targetLang: string }) {
  const lang = (targetLang === "es" ? "es" : "fr") as "fr" | "es";

  const keysRef       = useRef(new Set<string>());
  const playerPosRef  = useRef(new THREE.Vector3(0, 0, 0));
  const collectedRef  = useRef(new Set<string>());
  const quizActiveRef = useRef(false);

  const [collected, setCollected] = useState(new Set<string>());
  const [quiz,      setQuiz]      = useState<Quiz | null>(null);
  const [score,     setScore]     = useState(0);
  const [finished,  setFinished]  = useState(false);
  const [xpEarned,  setXpEarned]  = useState(0);
  const [started,   setStarted]   = useState(false);

  useEffect(() => { collectedRef.current  = collected; }, [collected]);
  useEffect(() => { quizActiveRef.current = !!quiz;    }, [quiz]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) e.preventDefault();
    };
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup",   up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  const handleCollect = useCallback((orbId: string) => {
    if (quizActiveRef.current) return;
    const orb = ORBS.find(o => o.id === orbId);
    if (!orb) return;
    const data = orb[lang];
    const choices = [data.right, ...data.wrong].sort(() => Math.random() - 0.5);
    setQuiz({ orbId, word: data.word, choices, correct: data.right, chosen: null });
  }, [lang]);

  const handleAnswer = (idx: number) => {
    if (!quiz || quiz.chosen !== null) return;
    const isCorrect = quiz.choices[idx] === quiz.correct;
    setQuiz(q => q ? { ...q, chosen: idx } : null);

    setTimeout(() => {
      if (isCorrect) {
        const newScore = score + 1;
        setScore(newScore);
        setCollected(prev => {
          const next = new Set(prev);
          next.add(quiz.orbId);
          if (next.size >= ORBS.length) {
            fetch("/api/games/score", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ gameType: "CITY_EXPLORER", score: newScore, wordsUsed: [] }),
            }).then(r => r.json()).then(d => {
              setXpEarned(d.xpEarned ?? 30);
              window.dispatchEvent(new CustomEvent("xp-updated"));
            }).catch(() => {});
            setTimeout(() => setFinished(true), 500);
          }
          return next;
        });
      }
      setQuiz(null);
    }, 800);
  };

  const dp = (k: string, on: boolean) => on ? keysRef.current.add(k) : keysRef.current.delete(k);
  const tapE = () => { keysRef.current.add("e"); setTimeout(() => keysRef.current.delete("e"), 150); };

  // ── Start screen ─────────────────────────────────────────────────────────────
  if (!started) {
    return (
      <div style={{ maxWidth: 480, textAlign: "center" }}>
        <div className="card" style={{ padding: "44px 28px" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🌆</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", margin: "0 0 10px" }}>
            3D City Explorer
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 24 }}>
            Walk through a real 3D city and collect 8 glowing vocabulary orbs.
            Answer each word correctly to keep it.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28, textAlign: "left" }}>
            {[
              ["🕹️", "WASD or Arrow keys to walk"],
              ["✨", "Find glowing word orbs around the city"],
              ["💬", "Walk up and press E to collect an orb"],
              ["🏆", "Collect all 8 words to win"],
            ].map(([icon, txt]) => (
              <div key={txt as string} style={{ display:"flex", alignItems:"center", gap:12, padding:"9px 14px", borderRadius:10, background:"var(--surface-2)", border:"1px solid var(--border)" }}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                <span style={{ fontSize: 13, color: "var(--text-2)" }}>{txt}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setStarted(true)} className="btn-primary" style={{ width:"100%", fontSize:16, padding:"14px" }}>
            Enter City 🌆
          </button>
        </div>
      </div>
    );
  }

  // ── End screen ────────────────────────────────────────────────────────────────
  if (finished) {
    const pct = Math.round((score / ORBS.length) * 100);
    return (
      <div style={{ maxWidth: 480, textAlign: "center" }}>
        <div className="card" style={{ padding: "44px 28px" }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>{pct >= 80 ? "🏆" : "🎉"}</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", margin: "0 0 8px" }}>City Complete!</h2>
          <p style={{ fontSize: 14, color: "var(--text-2)", margin: "0 0 20px" }}>
            <strong style={{ color: "var(--accent)" }}>{score}/{ORBS.length}</strong> correct · {pct}%
          </p>
          {xpEarned > 0 && (
            <div style={{ padding:"10px 16px", borderRadius:12, background:"var(--accent-dim)", marginBottom:20, fontSize:14, fontWeight:700, color:"var(--accent)" }}>
              +{xpEarned} XP earned!
            </div>
          )}
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={() => window.location.reload()} className="btn-primary" style={{ flex:1 }}>Play again</button>
            <Link href="/games" className="btn-outline" style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none" }}>All games</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Game view ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
      <div style={{ position:"relative", width:"100%", maxWidth:900 }}>
        <Canvas
          style={{ width:"100%", height:560, borderRadius:12, border:"2px solid var(--border)", display:"block" }}
          shadows
          gl={{ antialias: true }}
          camera={{ position: [0, 9, 12], fov: 60 }}
        >
          <Suspense fallback={null}>
            <GameScene
              lang={lang}
              keysRef={keysRef}
              playerPosRef={playerPosRef}
              collectedRef={collectedRef}
              collected={collected}
              onCollect={handleCollect}
            />
          </Suspense>
        </Canvas>

        {/* HUD */}
        <div style={{
          position:"absolute", top:12, left:12,
          padding:"8px 16px", borderRadius:10,
          background:"rgba(0,0,0,0.55)",
          backdropFilter:"blur(6px)",
          display:"flex", alignItems:"center", gap:16,
          pointerEvents:"none",
        }}>
          <span style={{ fontSize:13, fontWeight:700, color:"#fbbf24" }}>
            ✨ {collected.size}/{ORBS.length} orbs
          </span>
          <span style={{ fontSize:13, fontWeight:700, color:"#4ade80" }}>
            ⭐ {score} pts
          </span>
        </div>

        {/* Controls hint */}
        <div style={{
          position:"absolute", bottom:12, right:12,
          fontSize:11, color:"rgba(255,255,255,0.5)",
          pointerEvents:"none",
        }}>
          WASD to move · E to collect
        </div>

        {/* Quiz overlay */}
        {quiz && (
          <div style={{
            position:"absolute", inset:0, borderRadius:12,
            background:"rgba(0,0,0,0.65)",
            display:"flex", alignItems:"center", justifyContent:"center",
            padding:24,
          }}>
            <div style={{
              background:"var(--surface)",
              border:"1px solid var(--border)",
              borderRadius:18,
              padding:"26px 24px",
              maxWidth:360, width:"100%",
            }}>
              <p style={{ fontSize:11, color:"var(--text-3)", margin:"0 0 14px", textTransform:"uppercase", letterSpacing:"0.1em" }}>
                ✨ Orb found — what does this mean?
              </p>
              <div style={{ padding:"16px", borderRadius:12, background:"var(--surface-2)", border:"1px solid var(--border)", textAlign:"center", marginBottom:16 }}>
                <p style={{ fontSize:34, fontWeight:900, color:"var(--accent)", margin:0 }}>
                  {quiz.word}
                </p>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {quiz.choices.map((choice, i) => {
                  const isChosen  = quiz.chosen === i;
                  const isCorrect = choice === quiz.correct;
                  let border = "var(--border-md)";
                  let bg     = "var(--surface-2)";
                  let color  = "var(--text)";
                  if (quiz.chosen !== null) {
                    if (isCorrect)     { border="var(--green)"; bg="rgba(34,197,94,0.1)";  color="var(--green)"; }
                    else if (isChosen) { border="var(--red)";   bg="rgba(239,68,68,0.1)";  color="var(--red)"; }
                  }
                  return (
                    <button key={i}
                      onClick={() => handleAnswer(i)}
                      disabled={quiz.chosen !== null}
                      style={{ padding:"12px 16px", borderRadius:10, border:`1.5px solid ${border}`, background:bg, color, fontSize:14, fontWeight:700, cursor:quiz.chosen !== null ? "default" : "pointer", textAlign:"left", transition:"all 0.15s" }}
                    >
                      {choice}
                    </button>
                  );
                })}
              </div>
              {quiz.chosen !== null && quiz.choices[quiz.chosen] !== quiz.correct && (
                <p style={{ fontSize:13, color:"var(--text-2)", margin:"12px 0 0", textAlign:"center" }}>
                  Correct answer: <strong style={{ color:"var(--green)" }}>{quiz.correct}</strong>
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile D-pad */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 48px)", gridTemplateRows:"repeat(3, 48px)", gap:5 }}>
        <div />
        <DPad label="▲" onPress={() => dp("ArrowUp",true)}    onRelease={() => dp("ArrowUp",false)} />
        <div />
        <DPad label="◀" onPress={() => dp("ArrowLeft",true)}  onRelease={() => dp("ArrowLeft",false)} />
        <DPad label="E"  onPress={tapE}                        onRelease={() => {}} center />
        <DPad label="▶" onPress={() => dp("ArrowRight",true)} onRelease={() => dp("ArrowRight",false)} />
        <div />
        <DPad label="▼" onPress={() => dp("ArrowDown",true)}  onRelease={() => dp("ArrowDown",false)} />
        <div />
      </div>
    </div>
  );
}
