"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { SpeakButton } from "@/components/ui/SpeakButton";

// в”Ђв”Ђ Map constants в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
const TILE    = 40;
const COLS    = 20;
const ROWS    = 14;
const CW      = COLS * TILE; // 800
const CH      = ROWS * TILE; // 560
const PSPEED  = 2.5;
const PSIZE   = 20;
const NPC_R   = 14;
const TALK_D  = TILE * 1.5;

// Tile IDs
const W  = 1; // Wall        вЂ“ not walkable
const R  = 2; // Road        вЂ“ walkable
const C  = 3; // CafГ© floor  вЂ“ walkable
const M  = 4; // Market floorвЂ“ walkable
const S  = 5; // Station     вЂ“ walkable
const G  = 6; // Grass/park  вЂ“ walkable
const FN = 7; // Fountain    вЂ“ not walkable

const WALKABLE = new Set([R, C, M, S, G]);

// 20Г—14 city map
const MAP: number[][] = [
  [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],
  [W,C,C,C,C,W,R,R,R,R,R,R,R,R,W,M,M,M,M,W],
  [W,C,C,C,C,W,R,G,G,G,G,G,G,R,W,M,M,M,M,W],
  [W,C,C,C,C,R,R,G,G,FN,FN,G,G,R,R,M,M,M,W],
  [W,C,C,C,C,W,R,G,G,FN,FN,G,G,R,W,M,M,M,W],
  [W,W,R,W,W,W,R,G,G,G,G,G,G,R,W,W,R,W,W,W],
  [W,W,R,W,W,W,R,R,R,R,R,R,R,R,W,W,R,W,W,W],
  [R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,R],
  [W,W,R,W,W,W,R,G,G,G,G,G,G,R,W,W,R,W,W,W],
  [W,S,S,S,S,W,R,G,G,G,G,G,G,R,W,G,G,G,G,W],
  [W,S,S,S,S,W,R,G,G,G,G,G,G,R,W,G,G,G,G,W],
  [W,S,S,S,S,R,R,G,G,G,G,G,G,R,R,G,G,G,G,W],
  [W,S,S,S,S,W,R,R,R,R,R,R,R,R,W,G,G,G,G,W],
  [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],
];

// Tile visuals: [fill, stroke]
const TC: Record<number, [string, string]> = {
  [W]:  ["#1e293b", "#0f172a"],
  [R]:  ["#94a3b8", "#64748b"],
  [C]:  ["#fef08a", "#fde047"],
  [M]:  ["#fca5a5", "#f87171"],
  [S]:  ["#bae6fd", "#7dd3fc"],
  [G]:  ["#bbf7d0", "#86efac"],
  [FN]: ["#93c5fd", "#60a5fa"],
};

// в”Ђв”Ђ NPC data в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
interface Chal { word: string; right: string; wrong: [string, string] }
interface NPC {
  id: string; name: string; emoji: string
  tx: number; ty: number; color: string; greeting: string
  fr: Chal[]; es: Chal[]; en: Chal[]
}

const NPCS: NPC[] = [
  {
    id: "waiter", name: "Marcel", emoji: "рџ‘ЁвЂЌрџЌі", tx: 2, ty: 2,
    color: "#f59e0b",
    greeting: "Bienvenue! Let me test your cafГ© vocabulary!",
    fr: [
      { word: "cafГ©",    right: "coffee", wrong: ["tea",    "juice"]  },
      { word: "pain",    right: "bread",  wrong: ["cake",   "rice"]   },
      { word: "eau",     right: "water",  wrong: ["milk",   "wine"]   },
    ],
    es: [
      { word: "cafГ©",    right: "coffee", wrong: ["tea",    "juice"]  },
      { word: "pan",     right: "bread",  wrong: ["cake",   "rice"]   },
      { word: "agua",    right: "water",  wrong: ["milk",   "wine"]   },
    ],
    en: [
      { word: "beverage",  right: "a drink",    wrong: ["a food",   "a snack"]  },
      { word: "brew",      right: "to make tea/coffee", wrong: ["to cook", "to bake"] },
      { word: "sip",       right: "to drink slowly", wrong: ["to gulp", "to pour"] },
    ],
  },
  {
    id: "vendor", name: "Sofia", emoji: "рџ§‘вЂЌрџЊѕ", tx: 17, ty: 2,
    color: "#ef4444",
    greeting: "Welcome to my market! Let's practice shopping words!",
    fr: [
      { word: "pomme",   right: "apple",  wrong: ["pear",   "grape"]  },
      { word: "argent",  right: "money",  wrong: ["coin",   "bank"]   },
      { word: "prix",    right: "price",  wrong: ["cost",   "sale"]   },
    ],
    es: [
      { word: "manzana", right: "apple",  wrong: ["pear",   "grape"]  },
      { word: "dinero",  right: "money",  wrong: ["coin",   "bank"]   },
      { word: "precio",  right: "price",  wrong: ["cost",   "sale"]   },
    ],
    en: [
      { word: "bargain",  right: "a good deal",  wrong: ["expensive",  "discount"]  },
      { word: "vendor",   right: "a seller",     wrong: ["a buyer",    "a customer"] },
      { word: "receipt",  right: "proof of purchase", wrong: ["an invoice", "a coupon"] },
    ],
  },
  {
    id: "agent", name: "Pierre", emoji: "рџ§‘вЂЌвњ€пёЏ", tx: 2, ty: 10,
    color: "#3b82f6",
    greeting: "Bon voyage! Test your travel vocabulary!",
    fr: [
      { word: "train",   right: "train",      wrong: ["bus",      "plane"]   },
      { word: "billet",  right: "ticket",     wrong: ["passport", "visa"]    },
      { word: "arriver", right: "to arrive",  wrong: ["to leave", "to wait"] },
    ],
    es: [
      { word: "tren",    right: "train",      wrong: ["bus",      "plane"]   },
      { word: "billete", right: "ticket",     wrong: ["passport", "visa"]    },
      { word: "llegar",  right: "to arrive",  wrong: ["to leave", "to wait"] },
    ],
    en: [
      { word: "itinerary", right: "a travel plan",  wrong: ["a ticket",   "a passport"] },
      { word: "depart",    right: "to leave",       wrong: ["to arrive",  "to board"]   },
      { word: "luggage",   right: "bags/suitcases", wrong: ["cargo",      "freight"]    },
    ],
  },
  {
    id: "ranger", name: "Luna", emoji: "рџЊї", tx: 17, ty: 10,
    color: "#22c55e",
    greeting: "Welcome to the park! Let's learn nature words!",
    fr: [
      { word: "arbre",   right: "tree",    wrong: ["flower",  "bush"]   },
      { word: "fleur",   right: "flower",  wrong: ["grass",   "leaf"]   },
      { word: "courir",  right: "to run",  wrong: ["to walk", "to fly"] },
    ],
    es: [
      { word: "ГЎrbol",   right: "tree",    wrong: ["flower",  "bush"]   },
      { word: "flor",    right: "flower",  wrong: ["grass",   "leaf"]   },
      { word: "correr",  right: "to run",  wrong: ["to walk", "to fly"] },
    ],
    en: [
      { word: "foliage",  right: "leaves of plants", wrong: ["branches", "roots"]    },
      { word: "meadow",   right: "a grassy field",   wrong: ["a forest", "a desert"] },
      { word: "wander",   right: "to walk freely",   wrong: ["to sprint", "to rest"] },
    ],
  },
  {
    id: "musician", name: "Diego", emoji: "рџЋµ", tx: 8, ty: 3,
    color: "#a855f7",
    greeting: "ВЎHola! Let's learn some emotion words!",
    fr: [
      { word: "heureux", right: "happy",    wrong: ["sad",     "angry"]   },
      { word: "musique", right: "music",    wrong: ["dance",   "art"]     },
      { word: "aimer",   right: "to love",  wrong: ["to hate", "to fear"] },
    ],
    es: [
      { word: "feliz",   right: "happy",    wrong: ["sad",     "angry"]   },
      { word: "mГєsica",  right: "music",    wrong: ["dance",   "art"]     },
      { word: "amar",    right: "to love",  wrong: ["to hate", "to fear"] },
    ],
    en: [
      { word: "elated",   right: "very happy",  wrong: ["bored",     "anxious"]   },
      { word: "melody",   right: "a tune",      wrong: ["a rhythm",  "a lyric"]   },
      { word: "cherish",  right: "to treasure", wrong: ["to ignore", "to forget"] },
    ],
  },
];

// в”Ђв”Ђ Helpers в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
function tileAt(col: number, row: number): number {
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return W;
  return MAP[row][col];
}

function canMoveTo(px: number, py: number): boolean {
  const m = PSIZE / 2 - 2;
  return (
    WALKABLE.has(tileAt(Math.floor((px - m) / TILE), Math.floor((py - m) / TILE))) &&
    WALKABLE.has(tileAt(Math.floor((px + m) / TILE), Math.floor((py - m) / TILE))) &&
    WALKABLE.has(tileAt(Math.floor((px - m) / TILE), Math.floor((py + m) / TILE))) &&
    WALKABLE.has(tileAt(Math.floor((px + m) / TILE), Math.floor((py + m) / TILE)))
  );
}

function mkChoices(c: Chal): string[] {
  return [c.right, ...c.wrong].sort(() => Math.random() - 0.5);
}

// в”Ђв”Ђ Types в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
interface NPCState { npc: NPC; cleared: boolean; px: number; py: number }
interface Quiz {
  npcId: string; npcName: string; greeting: string
  challenges: Chal[]; idx: number; correct: number
  choices: string[]; chosen: number | null
}

// в”Ђв”Ђ Component в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
export function CityExplorer({ targetLang }: { targetLang: string }) {
  const lang = (["fr","es","en"].includes(targetLang) ? targetLang : "fr") as "fr" | "es" | "en";

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysRef   = useRef(new Set<string>());
  const playerRef = useRef({ x: 9.5 * TILE, y: 7.5 * TILE, dir: "down" });
  const frameRef  = useRef(0);
  const rafRef    = useRef(0);
  const quizRef   = useRef<Quiz | null>(null);
  const npcRef    = useRef<NPCState[]>([]);
  const scoreRef  = useRef(0);

  const [npcStates, setNpcStates] = useState<NPCState[]>(() =>
    NPCS.map(n => ({ npc: n, cleared: false, px: (n.tx + 0.5) * TILE, py: (n.ty + 0.5) * TILE }))
  );
  const [quiz,     setQuiz]     = useState<Quiz | null>(null);
  const [score,    setScore]    = useState(0);
  const [finished, setFinished] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [started,  setStarted]  = useState(false);

  // Sync refs
  useEffect(() => { npcRef.current   = npcStates; }, [npcStates]);
  useEffect(() => { quizRef.current  = quiz;       }, [quiz]);
  useEffect(() => { scoreRef.current = score;      }, [score]);

  // в”Ђв”Ђ Draw в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const p   = playerRef.current;
    const f   = frameRef.current;
    const states = npcRef.current;

    ctx.clearRect(0, 0, CW, CH);

    // в”Ђв”Ђ Tiles в”Ђв”Ђ
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const t = MAP[row][col];
        const [bg, border] = TC[t] ?? TC[W];
        ctx.fillStyle = bg;
        ctx.fillRect(col * TILE, row * TILE, TILE, TILE);
        ctx.strokeStyle = border;
        ctx.lineWidth = 0.5;
        ctx.strokeRect(col * TILE + 0.5, row * TILE + 0.5, TILE - 1, TILE - 1);
      }
    }

    // Road dashes on main horizontal road (row 7)
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 14]);
    ctx.beginPath();
    ctx.moveTo(0, 7.5 * TILE);
    ctx.lineTo(CW, 7.5 * TILE);
    ctx.stroke();
    // Vertical connector roads
    ctx.beginPath();
    ctx.moveTo(2.5 * TILE, 0);
    ctx.lineTo(2.5 * TILE, CH);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(16.5 * TILE, 0);
    ctx.lineTo(16.5 * TILE, CH);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // в”Ђв”Ђ Fountain animation в”Ђв”Ђ
    [[9,3],[10,3],[9,4],[10,4]].forEach(([col, row]) => {
      if (MAP[row]?.[col] === FN) {
        const wave = 0.55 + Math.sin(f * 0.07 + col) * 0.25;
        ctx.fillStyle = `rgba(96, 165, 250, ${wave})`;
        ctx.fillRect(col * TILE + 6, row * TILE + 6, TILE - 12, TILE - 12);
        ctx.fillStyle = `rgba(186, 230, 253, ${wave * 0.6})`;
        ctx.beginPath();
        ctx.arc(col * TILE + TILE / 2, row * TILE + TILE / 2, 6 + Math.sin(f * 0.1) * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // в”Ђв”Ђ Zone labels в”Ђв”Ђ
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const labels: [string, number, number][] = [
      ["в• CAFГ‰",     2.5 * TILE,  0.4 * TILE],
      ["рџ›’ MARKET",  17.5 * TILE, 0.4 * TILE],
      ["рџљ‰ STATION",  2.5 * TILE,  8.5 * TILE],
      ["рџЊї PARK",    17.5 * TILE,  8.5 * TILE],
      ["в›І PLAZA",   10.5 * TILE,  1.8 * TILE],
    ];
    labels.forEach(([txt, x, y]) => {
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillText(txt, x, y);
    });

    // в”Ђв”Ђ NPCs в”Ђв”Ђ
    states.forEach(ns => {
      const pulse = ns.cleared ? 0 : Math.sin(f * 0.06) * 2.5;
      const r = NPC_R + pulse;

      // Shadow
      ctx.beginPath();
      ctx.ellipse(ns.px, ns.py + r + 2, r * 0.7, r * 0.25, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fill();

      // Body
      ctx.beginPath();
      ctx.arc(ns.px, ns.py, r, 0, Math.PI * 2);
      ctx.fillStyle = ns.cleared ? "#4ade80" : ns.npc.color;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Emoji / check
      ctx.font = "15px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(ns.cleared ? "вњ…" : ns.npc.emoji, ns.px, ns.py);

      // Name tag
      ctx.font = "bold 9px sans-serif";
      ctx.textBaseline = "alphabetic";
      const tw = ctx.measureText(ns.npc.name).width + 10;
      ctx.fillStyle = "rgba(15,23,42,0.75)";
      ctx.beginPath();
      ctx.roundRect(ns.px - tw / 2, ns.py + r + 2, tw, 14, 3);
      ctx.fill();
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText(ns.npc.name, ns.px, ns.py + r + 13);

      // Exclamation mark
      if (!ns.cleared) {
        ctx.font = "bold 14px sans-serif";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#fbbf24";
        ctx.fillText("!", ns.px + r + 2, ns.py - r - 2);
      }
    });

    // в”Ђв”Ђ Player в”Ђв”Ђ
    const moving = keysRef.current.size > 0 && !quizRef.current;
    const bounce = moving ? Math.sin(f * 0.28) * 2 : 0;

    // Shadow
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + PSIZE * 0.5, PSIZE * 0.45, PSIZE * 0.18, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fill();

    // Body
    ctx.fillStyle = "var(--accent)";
    ctx.beginPath();
    ctx.roundRect(p.x - PSIZE * 0.42, p.y - PSIZE * 0.18 + bounce, PSIZE * 0.84, PSIZE * 0.65, 5);
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.arc(p.x, p.y - PSIZE * 0.32 + bounce, PSIZE * 0.30, 0, Math.PI * 2);
    ctx.fillStyle = "#fed7aa";
    ctx.fill();
    ctx.strokeStyle = "#c2410c";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Eyes (shift based on direction)
    const eyeDX = p.dir === "left" ? -2 : p.dir === "right" ? 2 : 0;
    const eyeDY = p.dir === "up" ? -1 : 0;
    ctx.fillStyle = "#1e293b";
    [-2.5, 2.5].forEach(ox => {
      ctx.beginPath();
      ctx.arc(p.x + ox + eyeDX, p.y - PSIZE * 0.34 + eyeDY + bounce, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // "Press E" hint when near an uncleared NPC
    const nearNPC = states.find(ns =>
      !ns.cleared && Math.hypot(p.x - ns.px, p.y - ns.py) < TALK_D
    );
    if (nearNPC && !quizRef.current) {
      const hint = `Talk to ${nearNPC.npc.name} вЂ” Press E`;
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      const tw = ctx.measureText(hint).width + 14;
      ctx.fillStyle = "rgba(0,0,0,0.65)";
      ctx.beginPath();
      ctx.roundRect(p.x - tw / 2, p.y - PSIZE * 1.6 - 16, tw, 18, 4);
      ctx.fill();
      ctx.fillStyle = "#fbbf24";
      ctx.fillText(hint, p.x, p.y - PSIZE * 1.6);
    }

    // в”Ђв”Ђ HUD в”Ђв”Ђ
    const cleared = states.filter(s => s.cleared).length;
    ctx.fillStyle = "rgba(15,23,42,0.72)";
    ctx.beginPath();
    ctx.roundRect(8, 8, 148, 42, 8);
    ctx.fill();
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#fbbf24";
    ctx.fillText(`в­ђ ${scoreRef.current} pts`, 16, 13);
    ctx.fillStyle = "#4ade80";
    ctx.fillText(`вњ“ ${cleared} / ${NPCS.length} NPCs found`, 16, 29);

    frameRef.current++;
  }, []);

  // в”Ђв”Ђ Game loop в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  const loop = useCallback(() => {
    if (!quizRef.current) {
      const keys = keysRef.current;
      const p    = playerRef.current;
      let nx = p.x, ny = p.y;

      if (keys.has("ArrowUp")    || keys.has("w") || keys.has("W")) { ny -= PSPEED; p.dir = "up"; }
      if (keys.has("ArrowDown")  || keys.has("s") || keys.has("S")) { ny += PSPEED; p.dir = "down"; }
      if (keys.has("ArrowLeft")  || keys.has("a") || keys.has("A")) { nx -= PSPEED; p.dir = "left"; }
      if (keys.has("ArrowRight") || keys.has("d") || keys.has("D")) { nx += PSPEED; p.dir = "right"; }

      // Slide along walls on each axis independently
      if (nx !== p.x && canMoveTo(nx, p.y)) p.x = nx;
      if (ny !== p.y && canMoveTo(p.x, ny)) p.y = ny;
      p.x = Math.max(PSIZE, Math.min(CW - PSIZE, p.x));
      p.y = Math.max(PSIZE, Math.min(CH - PSIZE, p.y));

      // E to interact
      if (keys.has("e") || keys.has("E")) {
        const near = npcRef.current.find(ns =>
          !ns.cleared && Math.hypot(p.x - ns.px, p.y - ns.py) < TALK_D
        );
        if (near) {
          keys.delete("e"); keys.delete("E");
          openQuiz(near.npc);
        }
      }
    }

    draw();
    rafRef.current = requestAnimationFrame(loop);
  }, [draw]); // eslint-disable-line react-hooks/exhaustive-deps

  const openQuiz = useCallback((npc: NPC) => {
    const challenges = [...npc[lang]].sort(() => Math.random() - 0.5);
    setQuiz({
      npcId: npc.id,
      npcName: npc.name,
      greeting: npc.greeting,
      challenges,
      idx: 0,
      correct: 0,
      choices: mkChoices(challenges[0]),
      chosen: null,
    });
  }, [lang]);

  const handleChoice = useCallback((choiceIdx: number) => {
    const q = quizRef.current;
    if (!q || q.chosen !== null) return;

    const chal    = q.challenges[q.idx];
    const correct = q.choices[choiceIdx] === chal.right;
    setQuiz(prev => prev ? { ...prev, chosen: choiceIdx } : null);

    setTimeout(() => {
      const nextIdx   = q.idx + 1;
      const newCorrect = q.correct + (correct ? 1 : 0);

      if (nextIdx >= q.challenges.length) {
        // Quiz done for this NPC
        const newTotal = scoreRef.current + newCorrect;
        setScore(newTotal);

        // Clear this NPC
        setNpcStates(prev =>
          prev.map(ns => ns.npc.id === q.npcId ? { ...ns, cleared: true } : ns)
        );

        // Check if all cleared (count before state update + 1 for current)
        const alreadyCleared = npcRef.current.filter(ns => ns.cleared).length;
        if (alreadyCleared + 1 >= NPCS.length) {
          fetch("/api/games/score", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ gameType: "CITY_EXPLORER", score: newTotal, wordsUsed: [] }),
          })
            .then(r => r.json())
            .then(d => {
              setXpEarned(d.xpEarned ?? 25);
              window.dispatchEvent(new CustomEvent("xp-updated"));
            })
            .catch(() => {});
          setTimeout(() => setFinished(true), 400);
        }

        setQuiz(null);
      } else {
        const next = q.challenges[nextIdx];
        setQuiz({
          ...q,
          idx: nextIdx,
          correct: newCorrect,
          choices: mkChoices(next),
          chosen: null,
        });
      }
    }, 700);
  }, []);

  // в”Ђв”Ђ Keyboard listeners в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) e.preventDefault();
    };
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup",   up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup",   up);
    };
  }, []);

  // в”Ђв”Ђ Start / stop game loop в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  useEffect(() => {
    if (!started) return;
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [started, loop]);

  // в”Ђв”Ђ Mobile D-pad helpers в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  const dpadPress   = (key: string) => keysRef.current.add(key);
  const dpadRelease = (key: string) => keysRef.current.delete(key);
  const tapE = () => { keysRef.current.add("e"); setTimeout(() => keysRef.current.delete("e"), 150); };

  // в”Ђв”Ђ Start screen в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  if (!started) {
    return (
      <div style={{ maxWidth: 480, textAlign: "center" }}>
        <div className="card" style={{ padding: "44px 28px" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>рџЏ™пёЏ</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", margin: "0 0 10px" }}>
            City Explorer
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 24 }}>
            Explore the city, find all 5 NPCs, and answer their vocabulary challenges
            to clear them. Can you complete the whole city?
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28, textAlign: "left" }}>
            {[
              ["рџ•№пёЏ", "WASD or Arrow keys to move"],
              ["рџ’¬", "Press E to talk to an NPC"],
              ["вњ…", "Answer all 3 questions to clear them"],
              ["рџЏ†", "Clear all 5 to win"],
            ].map(([icon, txt]) => (
              <div key={txt as string} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 14px", borderRadius: 10, background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                <span style={{ fontSize: 13, color: "var(--text-2)" }}>{txt}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setStarted(true)} className="btn-primary" style={{ width: "100%", fontSize: 16, padding: "14px" }}>
            Start Exploring рџ—єпёЏ
          </button>
        </div>
      </div>
    );
  }

  // в”Ђв”Ђ End screen в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  if (finished) {
    const total = NPCS.length * 3;
    const pct   = Math.round((score / total) * 100);
    return (
      <div style={{ maxWidth: 480, textAlign: "center" }}>
        <div className="card" style={{ padding: "44px 28px" }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>{pct >= 80 ? "рџЏ†" : pct >= 60 ? "рџЋ‰" : "рџ’Є"}</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", margin: "0 0 8px" }}>City Explored!</h2>
          <p style={{ fontSize: 14, color: "var(--text-2)", margin: "0 0 20px" }}>
            <strong style={{ color: "var(--accent)" }}>{score}/{total}</strong> correct answers В· {pct}%
          </p>
          {xpEarned > 0 && (
            <div style={{ padding: "10px 16px", borderRadius: 12, background: "var(--accent-dim)", marginBottom: 20, fontSize: 14, fontWeight: 700, color: "var(--accent)" }}>
              +{xpEarned} XP earned!
            </div>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => window.location.reload()} className="btn-primary" style={{ flex: 1 }}>
              Play again
            </button>
            <Link href="/games" className="btn-outline" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
              All games
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // в”Ђв”Ђ Game view в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      {/* Canvas wrapper вЂ” horizontally scrollable on small screens */}
      <div style={{ position: "relative", overflowX: "auto", maxWidth: "100%", borderRadius: 12 }}>
        <canvas
          ref={canvasRef}
          width={CW}
          height={CH}
          style={{ display: "block", borderRadius: 12, border: "2px solid var(--border)" }}
        />

        {/* Quiz overlay */}
        {quiz && (
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(0,0,0,0.68)",
            borderRadius: 12,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24,
          }}>
            <div style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 18,
              padding: "26px 24px",
              maxWidth: 360,
              width: "100%",
            }}>
              {/* Greeting вЂ” first question only */}
              {quiz.idx === 0 && (
                <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 14, fontStyle: "italic", lineHeight: 1.4 }}>
                  {quiz.npcName}: "{quiz.greeting}"
                </p>
              )}

              {/* Progress dots */}
              <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                {quiz.challenges.map((_, i) => (
                  <div key={i} style={{
                    height: 4, flex: 1, borderRadius: 2,
                    background: i < quiz.idx ? "var(--green)" : i === quiz.idx ? "var(--accent)" : "var(--border)",
                    transition: "background 0.3s",
                  }} />
                ))}
              </div>

              {/* Word prompt */}
              <div style={{ padding: "16px", borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--border)", textAlign: "center", marginBottom: 16 }}>
                <p style={{ fontSize: 11, color: "var(--text-3)", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  What does this mean in English?
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <p style={{ fontSize: 30, fontWeight: 900, color: "var(--accent)", margin: 0 }}>
                    {quiz.challenges[quiz.idx].word}
                  </p>
                  <SpeakButton text={quiz.challenges[quiz.idx].word} lang={lang} size={16} />
                </div>
              </div>

              {/* Choices */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {quiz.choices.map((choice, i) => {
                  const isChosen  = quiz.chosen === i;
                  const isCorrect = choice === quiz.challenges[quiz.idx].right;
                  let border = "var(--border-md)";
                  let bg     = "var(--surface-2)";
                  let color  = "var(--text)";
                  if (quiz.chosen !== null) {
                    if (isCorrect)      { border = "var(--green)"; bg = "rgba(34,197,94,0.1)";  color = "var(--green)"; }
                    else if (isChosen)  { border = "var(--red)";   bg = "rgba(239,68,68,0.1)";  color = "var(--red)";   }
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => handleChoice(i)}
                      disabled={quiz.chosen !== null}
                      style={{
                        padding: "12px 16px", borderRadius: 10,
                        border: `1.5px solid ${border}`, background: bg, color,
                        fontSize: 14, fontWeight: 700,
                        cursor: quiz.chosen !== null ? "default" : "pointer",
                        textAlign: "left", transition: "all 0.15s",
                      }}
                    >
                      {choice}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile D-pad */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 48px)", gridTemplateRows: "repeat(3, 48px)", gap: 5 }}>
        <div />
        <DBtn label="в–І" onPress={() => dpadPress("ArrowUp")}    onRelease={() => dpadRelease("ArrowUp")} />
        <div />
        <DBtn label="в—Ђ" onPress={() => dpadPress("ArrowLeft")}  onRelease={() => dpadRelease("ArrowLeft")} />
        <DBtn label="E"  onPress={tapE}                          onRelease={() => {}} center />
        <DBtn label="в–¶" onPress={() => dpadPress("ArrowRight")} onRelease={() => dpadRelease("ArrowRight")} />
        <div />
        <DBtn label="в–ј" onPress={() => dpadPress("ArrowDown")}  onRelease={() => dpadRelease("ArrowDown")} />
        <div />
      </div>
    </div>
  );
}

function DBtn({ label, onPress, onRelease, center }: {
  label: string; onPress: () => void; onRelease: () => void; center?: boolean
}) {
  return (
    <button
      onPointerDown={(e) => { e.preventDefault(); onPress(); }}
      onPointerUp={(e)   => { e.preventDefault(); onRelease(); }}
      onPointerLeave={() => onRelease()}
      style={{
        width: 48, height: 48, borderRadius: 10,
        border: `1.5px solid ${center ? "var(--accent)" : "var(--border-md)"}`,
        background: center ? "var(--accent-dim)" : "var(--surface-2)",
        color: center ? "var(--accent)" : "var(--text-2)",
        fontSize: center ? 11 : 16, fontWeight: 700,
        cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        userSelect: "none", WebkitUserSelect: "none" as const,
        touchAction: "none",
      }}
    >
      {label}
    </button>
  );
}
