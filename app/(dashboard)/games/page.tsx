export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { t, getLocale } from "@/lib/i18n";
import { Metadata } from "next";
import {
  Layers, Link2, Puzzle, Trophy, Zap, Target, Shuffle, PenLine,
  CheckSquare, Keyboard, Headphones, MessagesSquare, AlignJustify,
  Map, Box, Home, Briefcase, Flame, Gamepad2,
  Network, Search, Clock, Mic, BookOpen, Radio, Mic2,
  Plane, Stethoscope, ShoppingBag, Hotel,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Games — Lingova",
  description: "Practice vocabulary with fun games",
};

const GAMES = [
  // ── Vocabulary ──────────────────────────────────────────────────
  {
    href: "/games/flashcards",
    gameType: "FLASHCARDS",
    icon: Layers,
    title: "Flashcards",
    desc: "Flip cards, test recall, build memory through spaced repetition",
    theme: "#6366F1",
    difficulty: "A1",
    category: "vocabulary",
    xp: 20,
  },
  {
    href: "/games/true-false",
    gameType: "TRUE_FALSE",
    icon: CheckSquare,
    title: "True or False",
    desc: "Is the translation correct? Quick-fire judgement rounds",
    theme: "#F59E0B",
    difficulty: "A1",
    category: "vocabulary",
    xp: 20,
  },
  {
    href: "/games/matching",
    gameType: "MATCHING",
    icon: Link2,
    title: "Word Match",
    desc: "Match target language words to English translations against the clock",
    theme: "#10B981",
    difficulty: "A2",
    category: "vocabulary",
    xp: 30,
  },
  {
    href: "/games/word-scramble",
    gameType: "WORD_SCRAMBLE",
    icon: Shuffle,
    title: "Word Scramble",
    desc: "Unscramble jumbled vocabulary words — race against your brain",
    theme: "#F43F5E",
    difficulty: "A2",
    category: "vocabulary",
    xp: 25,
  },
  {
    href: "/games/speed-typing",
    gameType: "SPEED_TYPING",
    icon: Keyboard,
    title: "Speed Typing",
    desc: "See the meaning, type the word — train muscle memory fast",
    theme: "#EC4899",
    difficulty: "B1",
    category: "vocabulary",
    xp: 30,
  },
  {
    href: "/games/memory-palace",
    gameType: "MEMORY_PALACE",
    icon: Puzzle,
    title: "Memory Palace",
    desc: "Place words in virtual rooms — spatial memory that never fades",
    theme: "#8B5CF6",
    difficulty: "B2",
    category: "vocabulary",
    xp: 50,
  },
  // ── Grammar ─────────────────────────────────────────────────────
  {
    href: "/games/fill-blank",
    gameType: "FILL_BLANK",
    icon: PenLine,
    title: "Fill the Blank",
    desc: "Complete sentences — context makes vocabulary stick",
    theme: "#14B8A6",
    difficulty: "A2",
    category: "grammar",
    xp: 25,
  },
  {
    href: "/games/sentence-builder",
    gameType: "SENTENCE_BUILDER",
    icon: AlignJustify,
    title: "Sentence Builder",
    desc: "Tap word tiles to assemble correct sentences — master grammar fast",
    theme: "#0EA5E9",
    difficulty: "B1",
    category: "grammar",
    xp: 30,
  },
  // ── Listening ───────────────────────────────────────────────────
  {
    href: "/games/immersion",
    gameType: "IMMERSION",
    icon: Home,
    title: "Immersion Room",
    desc: "Find objects in a 3D room by listening to voice commands",
    theme: "#D946EF",
    difficulty: "A2",
    category: "listening",
    xp: 40,
  },
  {
    href: "/games/listen-quiz",
    gameType: "LISTEN_QUIZ",
    icon: Headphones,
    title: "Listen & Choose",
    desc: "Hear the word spoken — pick the right translation from 4",
    theme: "#06B6D4",
    difficulty: "B1",
    category: "listening",
    xp: 35,
  },
  // ── Immersive ───────────────────────────────────────────────────
  {
    href: "/games/dialog-adventure",
    gameType: "DIALOG_ADVENTURE",
    icon: MessagesSquare,
    title: "Dialog Adventure",
    desc: "Real scenarios, real conversations — café, train station, getting lost",
    theme: "#F97316",
    difficulty: "B1",
    category: "grammar",
    xp: 40,
  },
  {
    href: "/games/interview",
    gameType: "INTERVIEW",
    icon: Briefcase,
    title: "Job Interview",
    desc: "Sit across a 3D interviewer — answer in your target language to get hired",
    theme: "#3B82F6",
    difficulty: "B2",
    category: "immersive",
    xp: 40,
  },
  {
    href: "/games/city-explorer",
    gameType: "CITY_EXPLORER",
    icon: Map,
    title: "City Explorer",
    desc: "Walk a 2D city, find NPCs, answer their challenges — the full RPG experience",
    theme: "#84CC16",
    difficulty: "B2",
    category: "immersive",
    xp: 50,
  },
  {
    href: "/games/city-3d",
    gameType: "CITY_EXPLORER",
    icon: Box,
    title: "Word Blaster 3D",
    desc: "Shoot the correct translation in a neon 3D arena — grow, shrink, speed up each round",
    theme: "#6366F1",
    difficulty: "C1",
    category: "immersive",
    xp: 60,
  },
  {
    href: "/games/airport",
    gameType: "AIRPORT",
    icon: Plane,
    title: "Airport",
    desc: "Check in, pass security and board your flight — real conversations at every step",
    theme: "#0EA5E9",
    difficulty: "B1",
    category: "immersive",
    xp: 40,
  },
  {
    href: "/games/doctor-office",
    gameType: "DOCTOR_OFFICE",
    icon: Stethoscope,
    title: "Doctor's Office",
    desc: "Describe your symptoms, understand the diagnosis and pick up your prescription",
    theme: "#10B981",
    difficulty: "B1",
    category: "immersive",
    xp: 40,
  },
  {
    href: "/games/market-bazaar",
    gameType: "MARKET_BAZAAR",
    icon: ShoppingBag,
    title: "Market Bazaar",
    desc: "Browse stalls, ask prices and haggle with vendors at the local market",
    theme: "#F59E0B",
    difficulty: "A2",
    category: "immersive",
    xp: 35,
  },
  {
    href: "/games/hotel",
    gameType: "HOTEL",
    icon: Hotel,
    title: "Hotel",
    desc: "Check in, order room service, and handle requests at a hotel",
    theme: "#8B5CF6",
    difficulty: "B1",
    category: "immersive",
    xp: 40,
  },
  // ── New Games v2 ──────────────────────────────────────────────
  {
    href: "/games/word-association",
    gameType: "WORD_ASSOCIATION",
    icon: Network,
    title: "Word Association",
    desc: "Tap all words related to the target word before the timer runs out",
    theme: "#14B8A6",
    difficulty: "A2",
    category: "grammar",
    xp: 35,
  },
  {
    href: "/games/error-detective",
    gameType: "ERROR_DETECTIVE",
    icon: Search,
    title: "Error Detective",
    desc: "Find the grammar mistake in each sentence and correct it — trains the editing eye",
    theme: "#F43F5E",
    difficulty: "B1",
    category: "grammar",
    xp: 35,
  },
  {
    href: "/games/tense-challenge",
    gameType: "TENSE_CHALLENGE",
    icon: Clock,
    title: "Tense Challenge",
    desc: "Rewrite sentences in different tenses — the hardest and most important grammar skill",
    theme: "#0EA5E9",
    difficulty: "B1",
    category: "grammar",
    xp: 35,
  },
  {
    href: "/games/dictation",
    gameType: "DICTATION",
    icon: Mic,
    title: "Dictation",
    desc: "Listen and type exactly what you hear — spelling and accents count",
    theme: "#8B5CF6",
    difficulty: "A2",
    category: "listening",
    xp: 35,
  },
  {
    href: "/games/story-audio",
    gameType: "STORY_AUDIO",
    icon: BookOpen,
    title: "Story Audio",
    desc: "Listen to a short story then answer comprehension questions — pure audio understanding",
    theme: "#10B981",
    difficulty: "B1",
    category: "listening",
    xp: 35,
  },
  {
    href: "/games/speed-listening",
    gameType: "SPEED_LISTENING",
    icon: Radio,
    title: "Speed Listening",
    desc: "Audio at 1.5× speed — close the gap between classroom language and real conversation",
    theme: "#F97316",
    difficulty: "B2",
    category: "listening",
    xp: 50,
  },
  {
    href: "/games/accent-challenge",
    gameType: "ACCENT_CHALLENGE",
    icon: Mic2,
    title: "Accent Challenge",
    desc: "Same word, three accents — identify it across regional pronunciation variations",
    theme: "#EC4899",
    difficulty: "B1",
    category: "listening",
    xp: 35,
  },
];

const CATEGORIES = [
  { key: "vocabulary", label: "Vocabulary", emoji: "📚", color: "#6366F1" },
  { key: "grammar",    label: "Grammar",    emoji: "✏️", color: "#14B8A6" },
  { key: "listening",  label: "Listening",  emoji: "🎧", color: "#06B6D4" },
  { key: "immersive",  label: "Immersive",  emoji: "🌍", color: "#F97316" },
];

const CAT_DESC: Record<string, string> = {
  vocabulary: "Build your word bank — translations, spellings and recall under pressure",
  grammar:    "Conjugations, tenses, sentence structure and conversation patterns",
  listening:  "Train your ear for real speech speed, accents and comprehension",
  immersive:  "Full role-play in airports, markets, clinics and 3D arenas",
};

const DIFF_COLOR: Record<string, string> = {
  A1: "#10B981",
  A2: "#22C55E",
  B1: "#F59E0B",
  B2: "#F97316",
  C1: "#EF4444",
  C2: "#DC2626",
};

export default async function GamesPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? "";
  const locale = getLocale((session?.user as any)?.nativeLanguage ?? "en");

  // MED-4: Compute actual time until next UTC midnight (when daily challenge resets)
  const nowMs = Date.now();
  const nextMidnightMs = new Date(
    Date.UTC(
      new Date().getUTCFullYear(),
      new Date().getUTCMonth(),
      new Date().getUTCDate() + 1
    )
  ).getTime();
  const msLeft = nextMidnightMs - nowMs;
  const resetHH = Math.floor(msLeft / 3_600_000);
  const resetMM = Math.floor((msLeft % 3_600_000) / 60_000);
  const resetSS = Math.floor((msLeft % 60_000) / 1_000);
  const resetIn = `${String(resetHH).padStart(2, "0")}:${String(resetMM).padStart(2, "0")}:${String(resetSS).padStart(2, "0")}`;

  let allScores: { gameType: string; score: number; xpEarned: number; playedAt: Date }[] = [];

  try {
    if (userId) {
      allScores = await prisma.gameScore.findMany({
        where: { userId },
        orderBy: { score: "desc" },
        select: { gameType: true, score: true, xpEarned: true, playedAt: true },
      });
    }
  } catch (err) {
    console.error("[games] DB error:", err);
  }

  const bestScores = allScores.reduce<Record<string, { score: number; xpEarned: number; playedAt: Date }>>((acc, row) => {
    if (!acc[row.gameType] || row.score > acc[row.gameType].score) {
      acc[row.gameType] = { score: row.score, xpEarned: row.xpEarned, playedAt: row.playedAt };
    }
    return acc;
  }, {});

  const totalGamesPlayed = allScores.length;
  const totalXpFromGames = allScores.reduce((sum, s) => sum + s.xpEarned, 0);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 4px" }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: 22, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 999, background: "var(--accent-dim)", border: "1px solid rgba(99,102,241,0.22)", marginBottom: 10 }}>
            <Gamepad2 size={11} style={{ color: "var(--accent)" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.07em", textTransform: "uppercase" }}>24 Games · 4 Categories</span>
          </div>
          <h1 style={{ fontSize: 34, fontWeight: 900, fontFamily: "var(--font-display)", letterSpacing: "-0.025em", color: "var(--text)", lineHeight: 1.08, marginBottom: 6 }}>
            {t(locale, "games_title")}
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-2)" }}>
            {t(locale, "games_subtitle")}
          </p>
        </div>

        {/* Stats pills — only when user has played */}
        {totalGamesPlayed > 0 && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", paddingTop: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 12, background: "var(--xp-dim)", border: "1px solid rgba(245,158,11,0.22)" }}>
              <Zap size={13} style={{ color: "var(--xp)" }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--xp)", fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em" }}>
                {totalXpFromGames.toLocaleString()}
              </span>
              <span style={{ fontSize: 11, color: "var(--text-3)" }}>XP earned</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 12, background: "var(--accent-dim)", border: "1px solid rgba(99,102,241,0.22)" }}>
              <Trophy size={13} style={{ color: "var(--accent)" }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--accent)", fontFamily: "var(--font-mono)", letterSpacing: "-0.01em" }}>
                {totalGamesPlayed}
              </span>
              <span style={{ fontSize: 11, color: "var(--text-3)" }}>played</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Category nav pills ── */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
        {CATEGORIES.map((cat) => {
          const n = GAMES.filter((g) => g.category === cat.key).length;
          const played = GAMES.filter((g) => g.category === cat.key && bestScores[g.gameType]).length;
          return (
            <a key={cat.key} href={`#${cat.key}`} className="cat-pill">
              <span style={{ fontSize: 15 }}>{cat.emoji}</span>
              <span>{cat.label}</span>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 999, background: played > 0 ? `${cat.color}22` : "var(--surface-3)", color: played > 0 ? cat.color : "var(--text-3)" }}>
                {played > 0 ? `${played}/${n}` : n}
              </span>
            </a>
          );
        })}
      </div>

      {/* ── Daily Challenge banner ── */}
      <div className="daily-banner" style={{ marginBottom: 36, display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ width: 54, height: 54, borderRadius: 14, background: "linear-gradient(135deg, #F59E0B, #F97316)", display: "grid", placeItems: "center", flexShrink: 0 }}>
          <Flame size={24} className="animate-flame-dance" style={{ color: "#0B0F1A" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 3, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 999, background: "rgba(245,158,11,0.18)", border: "1px solid rgba(245,158,11,0.35)", color: "#F59E0B" }}>
              Daily Challenge
            </span>
            <span style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
              Resets in {resetIn}
            </span>
          </div>
          <p style={{ fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text)", marginBottom: 1, letterSpacing: "-0.012em" }}>
            Word Blaster 3D — Hard mode
          </p>
          <p style={{ fontSize: 12, color: "var(--text-2)" }}>
            Clear 30 targets, lose no more than 2 lives.
          </p>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--xp)", fontFamily: "var(--font-mono)", letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>+500</div>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)" }}>XP reward</div>
        </div>
        <Link href="/games/city-3d" style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 11, background: "linear-gradient(135deg, #F59E0B, #F97316)", color: "#0B0F1A", fontWeight: 700, fontSize: 13, textDecoration: "none", flexShrink: 0, fontFamily: "var(--font-display)", letterSpacing: "-0.01em", boxShadow: "0 0 20px rgba(245,158,11,0.35)", whiteSpace: "nowrap" }}>
          Play →
        </Link>
      </div>

      {/* ── Category sections ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 44, marginBottom: 40 }}>
        {CATEGORIES.map((cat) => {
          const catGames = GAMES.filter((g) => g.category === cat.key);
          const playedCount = catGames.filter((g) => bestScores[g.gameType]).length;
          return (
            <div key={cat.key} id={cat.key}>

              {/* Category header */}
              <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 18 }}>
                {/* Left accent bar */}
                <div style={{ width: 3, height: 44, borderRadius: 3, background: cat.color, marginRight: 14, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 18, lineHeight: 1 }}>{cat.emoji}</span>
                    <h2 style={{ fontSize: 19, fontWeight: 800, color: "var(--text)", fontFamily: "var(--font-display)", letterSpacing: "-0.018em" }}>
                      {cat.label}
                    </h2>
                    {playedCount > 0 ? (
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 999, background: `${cat.color}1A`, border: `1px solid ${cat.color}33`, color: cat.color }}>
                        {playedCount}/{catGames.length} played
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 999, background: "var(--surface-3)", color: "var(--text-3)" }}>
                        {catGames.length} games
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.45 }}>
                    {CAT_DESC[cat.key]}
                  </p>
                </div>
                {/* Progress bar (right) */}
                {playedCount > 0 && (
                  <div style={{ width: 72, flexShrink: 0, marginLeft: 16 }}>
                    <div style={{ height: 4, borderRadius: 3, background: "var(--surface-3)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(playedCount / catGames.length) * 100}%`, background: cat.color, borderRadius: 3 }} />
                    </div>
                    <p style={{ fontSize: 10, color: "var(--text-3)", marginTop: 3, textAlign: "right", fontFamily: "var(--font-mono)" }}>
                      {Math.round((playedCount / catGames.length) * 100)}%
                    </p>
                  </div>
                )}
              </div>

              {/* 3-column game grid */}
              <div className="games-grid">
                {catGames.map((game) => {
                  const best = bestScores[game.gameType];
                  const GameIcon = game.icon;
                  const diffColor = DIFF_COLOR[game.difficulty] ?? "#F59E0B";
                  return (
                    <Link
                      href={game.href}
                      key={game.href}
                      className="game-card-v2"
                      style={{ "--t": game.theme, textDecoration: "none", minHeight: 196, display: "flex", flexDirection: "column" } as React.CSSProperties}
                    >
                      <div className="gc-aura" />
                      <div className="gc-sheen" />
                      <div className="gc-arrow">↗</div>

                      {/* Icon + difficulty badge */}
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14, position: "relative", zIndex: 1 }}>
                        <div className="gc-icon">
                          <GameIcon size={18} style={{ color: "#fff" }} />
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 999, background: `${diffColor}1A`, border: `1px solid ${diffColor}40`, color: diffColor }}>
                          {game.difficulty}
                        </span>
                      </div>

                      {/* Title + description */}
                      <div style={{ flex: 1, marginBottom: 14, position: "relative", zIndex: 1 }}>
                        <div className="gc-name">{game.title}</div>
                        <div className="gc-desc" style={{ marginTop: 4 }}>{game.desc}</div>
                      </div>

                      {/* XP + best score row */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
                        <span className="gc-xp">+{game.xp} XP</span>
                        {best ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontFamily: "var(--font-mono)" }}>
                            <Trophy size={10} style={{ color: game.theme, flexShrink: 0 }} />
                            <span style={{ color: game.theme, fontWeight: 700 }}>{best.score}%</span>
                            <span style={{ color: "var(--text-3)" }}>best</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: 10, color: "var(--text-3)" }}>Not played</span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Coming soon: Hotel ── */}
      <div style={{ borderRadius: 16, padding: "16px 20px", border: "1px dashed var(--border-md)", background: "var(--surface-2)", display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
        <div style={{ width: 42, height: 42, borderRadius: 11, background: "var(--surface-3)", display: "grid", placeItems: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 22 }}>🏨</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 1 }}>Hotel — Coming in Phase 4</p>
          <p style={{ fontSize: 12, color: "var(--text-3)" }}>Navigate check-in, room service and concierge in your target language</p>
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: "var(--surface-3)", color: "var(--text-3)", letterSpacing: "0.07em", textTransform: "uppercase", flexShrink: 0 }}>
          Soon
        </span>
      </div>

      {/* ── CSS ── */}
      <style>{`
        .games-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }
        @media (max-width: 860px) {
          .games-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 500px) {
          .games-grid { grid-template-columns: 1fr; }
        }
        .cat-pill {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 7px 14px; border-radius: 999px;
          background: var(--surface-2); border: 1px solid var(--border);
          font-size: 13px; font-weight: 600; color: var(--text-2);
          text-decoration: none; transition: all 0.18s var(--ease);
          white-space: nowrap;
        }
        .cat-pill:hover {
          background: var(--surface-3); color: var(--text);
          border-color: var(--border-md); transform: translateY(-1px);
        }
        .daily-banner {
          background: linear-gradient(135deg, rgba(245,158,11,0.10), rgba(249,115,22,0.06));
          border: 1px solid rgba(245,158,11,0.28);
          border-radius: 18px;
          padding: 18px 22px;
          animation: pulse-glow 2.6s cubic-bezier(0.32, 0.72, 0, 1) infinite;
        }
      `}</style>
    </div>
  );
}
