import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Metadata } from "next";
import { Layers, Link2, Puzzle, Trophy, Zap, Target, ArrowRight, Star, Gamepad2, Shuffle, PenLine, CheckSquare, Keyboard, Headphones, MessagesSquare, AlignJustify, Map, Box } from "lucide-react";

export const metadata: Metadata = {
  title: "Games — LangCraft",
  description: "Practice vocabulary with fun games",
};

const GAMES = [
  {
    href: "/games/flashcards",
    gameType: "FLASHCARDS",
    icon: Layers,
    title: "Flashcards",
    desc: "Flip cards, test recall, build memory through spaced repetition",
    colorClass: "gc-violet",
    textVar: "--gc-violet-text",
    mutedVar: "--gc-violet-muted",
    borderVar: "--gc-violet-border",
    difficulty: "Beginner",
    diffColor: "#10b981",
    xpLabel: "+20 XP",
  },
  {
    href: "/games/matching",
    gameType: "MATCHING",
    icon: Link2,
    title: "Word Match",
    desc: "Match target language words to English translations against the clock",
    colorClass: "gc-green",
    textVar: "--gc-green-text",
    mutedVar: "--gc-green-muted",
    borderVar: "--gc-green-border",
    difficulty: "Intermediate",
    diffColor: "#f59e0b",
    xpLabel: "+30 XP",
  },
  {
    href: "/games/memory-palace",
    gameType: "MEMORY_PALACE",
    icon: Puzzle,
    title: "Memory Palace",
    desc: "Place words in virtual rooms — spatial memory that never fades",
    colorClass: "gc-blue",
    textVar: "--gc-blue-text",
    mutedVar: "--gc-blue-muted",
    borderVar: "--gc-blue-border",
    difficulty: "Advanced",
    diffColor: "#ef4444",
    xpLabel: "+50 XP",
  },
  {
    href: "/games/word-scramble",
    gameType: "WORD_SCRAMBLE",
    icon: Shuffle,
    title: "Word Scramble",
    desc: "Unscramble jumbled vocabulary words — race against your brain",
    colorClass: "gc-rose",
    textVar: "--gc-rose-text",
    mutedVar: "--gc-rose-muted",
    borderVar: "--gc-rose-border",
    difficulty: "Intermediate",
    diffColor: "#f59e0b",
    xpLabel: "+25 XP",
  },
  {
    href: "/games/fill-blank",
    gameType: "FILL_BLANK",
    icon: PenLine,
    title: "Fill the Blank",
    desc: "Complete sentences — context makes vocabulary stick",
    colorClass: "gc-teal",
    textVar: "--gc-teal-text",
    mutedVar: "--gc-teal-muted",
    borderVar: "--gc-teal-border",
    difficulty: "Intermediate",
    diffColor: "#f59e0b",
    xpLabel: "+25 XP",
  },
  {
    href: "/games/true-false",
    gameType: "TRUE_FALSE",
    icon: CheckSquare,
    title: "True or False",
    desc: "Is the translation correct? Quick-fire judgement rounds",
    colorClass: "gc-orange",
    textVar: "--gc-orange-text",
    mutedVar: "--gc-orange-muted",
    borderVar: "--gc-orange-border",
    difficulty: "Beginner",
    diffColor: "#10b981",
    xpLabel: "+20 XP",
  },
  {
    href: "/games/speed-typing",
    gameType: "SPEED_TYPING",
    icon: Keyboard,
    title: "Speed Typing",
    desc: "See the meaning, type the word — train muscle memory fast",
    colorClass: "gc-violet",
    textVar: "--gc-violet-text",
    mutedVar: "--gc-violet-muted",
    borderVar: "--gc-violet-border",
    difficulty: "Intermediate",
    diffColor: "#f59e0b",
    xpLabel: "+30 XP",
  },
  {
    href: "/games/listen-quiz",
    gameType: "LISTEN_QUIZ",
    icon: Headphones,
    title: "Listen & Choose",
    desc: "Hear the word spoken — pick the right translation from 4",
    colorClass: "gc-blue",
    textVar: "--gc-blue-text",
    mutedVar: "--gc-blue-muted",
    borderVar: "--gc-blue-border",
    difficulty: "Advanced",
    diffColor: "#ef4444",
    xpLabel: "+35 XP",
  },
  {
    href: "/games/sentence-builder",
    gameType: "SENTENCE_BUILDER",
    icon: AlignJustify,
    title: "Sentence Builder",
    desc: "Tap word tiles to assemble correct sentences — master grammar fast",
    colorClass: "gc-teal",
    textVar: "--gc-teal-text",
    mutedVar: "--gc-teal-muted",
    borderVar: "--gc-teal-border",
    difficulty: "Intermediate",
    diffColor: "#f59e0b",
    xpLabel: "+30 XP",
  },
  {
    href: "/games/dialog-adventure",
    gameType: "DIALOG_ADVENTURE",
    icon: MessagesSquare,
    title: "Dialog Adventure",
    desc: "Real scenarios, real conversations — café, train station, getting lost",
    colorClass: "gc-rose",
    textVar: "--gc-rose-text",
    mutedVar: "--gc-rose-muted",
    borderVar: "--gc-rose-border",
    difficulty: "Advanced",
    diffColor: "#ef4444",
    xpLabel: "+40 XP",
  },
  {
    href: "/games/city-explorer",
    gameType: "CITY_EXPLORER",
    icon: Map,
    title: "City Explorer",
    desc: "Walk a 2D city, find NPCs, answer their challenges — the full RPG experience",
    colorClass: "gc-green",
    textVar: "--gc-green-text",
    mutedVar: "--gc-green-muted",
    borderVar: "--gc-green-border",
    difficulty: "Advanced",
    diffColor: "#ef4444",
    xpLabel: "+50 XP",
  },
  {
    href: "/games/city-3d",
    gameType: "CITY_EXPLORER",
    icon: Box,
    title: "Word Blaster 3D",
    desc: "Shoot the correct translation in a neon 3D arena — grow, shrink, speed up each round",
    colorClass: "gc-violet",
    textVar: "--gc-violet-text",
    mutedVar: "--gc-violet-muted",
    borderVar: "--gc-violet-border",
    difficulty: "Advanced",
    diffColor: "#ef4444",
    xpLabel: "+60 XP",
  },
];

export default async function GamesPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? "";

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

  // Reduce to best score per game type
  const bestScores = allScores.reduce<Record<string, { score: number; xpEarned: number; playedAt: Date }>>((acc, row) => {
    if (!acc[row.gameType] || row.score > acc[row.gameType].score) {
      acc[row.gameType] = { score: row.score, xpEarned: row.xpEarned, playedAt: row.playedAt };
    }
    return acc;
  }, {});

  const totalGamesPlayed = allScores.length;
  const totalXpFromGames = allScores.reduce((sum, s) => sum + s.xpEarned, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-5 animate-fade-up">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1
            className="text-3xl md:text-4xl font-extrabold"
            style={{ color: "var(--text)" }}
          >
            Games
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>
            Play &amp; learn — earn XP for every game you finish
          </p>
        </div>
        <div
          className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
          style={{
            background: "var(--gc-orange-bg, rgba(245,158,11,0.12))",
            border: "1px solid var(--gc-orange-border, rgba(245,158,11,0.3))",
            color: "var(--gc-orange-text, #fcd34d)",
          }}
        >
          <Target size={15} style={{ color: "var(--gc-orange-text, #fcd34d)" }} />
          2× XP today
        </div>
      </div>

      {/* ── Daily Challenge banner ── */}
      <div
        className="bento flex items-center gap-4 px-6 py-4"
        style={{
          background: "var(--gc-orange-bg, rgba(120,53,15,0.35))",
          border: "1px solid var(--gc-orange-border, rgba(249,115,22,0.3))",
        }}
      >
        <Target size={28} style={{ color: "var(--gc-orange-text, #fdba74)", flexShrink: 0 }} />
        <div className="flex-1">
          <p className="font-bold text-base" style={{ color: "var(--gc-orange-text, #fdba74)" }}>
            Daily Challenge
          </p>
          <p className="text-sm" style={{ color: "var(--gc-orange-muted, rgba(253,186,116,0.7))" }}>
            Complete any game today for double XP — limited time!
          </p>
        </div>
        <div
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
          style={{
            background: "rgba(249,115,22,0.18)",
            border: "1px solid var(--gc-orange-border, rgba(249,115,22,0.4))",
            color: "var(--gc-orange-text, #fb923c)",
          }}
        >
          <Star size={11} />
          2× XP today
        </div>
      </div>

      {/* ── Game Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {GAMES.map((game) => {
          const best = bestScores[game.gameType];
          const GameIcon = game.icon;
          return (
            <Link
              href={game.href}
              key={game.href}
              className={`game-card ${game.colorClass} flex flex-col`}
              style={{ padding: "1.75rem 1.5rem", gap: "1rem", textDecoration: "none" }}
            >
              {/* Icon box */}
              <div className="icon-box-lg" style={{ background: "rgba(255,255,255,0.08)" }}>
                <GameIcon size={28} style={{ color: `var(${game.textVar})` }} />
              </div>

              {/* Title + desc */}
              <div>
                <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: `var(${game.textVar})`, marginBottom: "0.375rem" }}>
                  {game.title}
                </h2>
                <p style={{ fontSize: 13, color: `var(${game.mutedVar})`, lineHeight: 1.5 }}>
                  {game.desc}
                </p>
              </div>

              {/* Badges */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 99,
                    background: "rgba(0,0,0,0.15)",
                    color: game.diffColor,
                    border: `1px solid ${game.diffColor}33`,
                  }}
                >
                  {game.difficulty}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 99,
                    background: `var(${game.textVar})15`,
                    color: `var(${game.textVar})`,
                    border: `1px solid var(${game.borderVar})`,
                  }}
                >
                  {game.xpLabel}
                </span>
              </div>

              {/* Best score if exists */}
              {best && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 12px",
                    borderRadius: 10,
                    background: "rgba(0,0,0,0.2)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    fontSize: 12,
                  }}
                >
                  <Trophy size={13} style={{ color: `var(${game.textVar})`, flexShrink: 0 }} />
                  <span style={{ color: `var(${game.textVar})` }}>
                    Best: <strong>{best.score}</strong> pts · {best.xpEarned} XP earned
                  </span>
                </div>
              )}

              {/* Play button */}
              <div
                style={{
                  marginTop: "auto",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "rgba(0,0,0,0.18)",
                  border: `1px solid var(${game.borderVar})`,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 700, color: `var(${game.textVar})` }}>
                  Play now
                </span>
                <ArrowRight size={16} style={{ color: `var(${game.textVar})` }} />
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── Best Scores Summary ── */}
      {Object.keys(bestScores).length > 0 && (
        <div className="bento p-5" style={{ border: "1px solid var(--border)" }}>
          <p className="section-label mb-4">Your best scores</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {GAMES.map((game) => {
              const best = bestScores[game.gameType];
              const GameIcon = game.icon;
              return (
                <div
                  key={game.gameType}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                >
                  {/* Small icon box */}
                  <div
                    className="icon-box"
                    style={{
                      background: `var(${game.textVar})14`,
                      border: `1px solid var(${game.borderVar})`,
                      flexShrink: 0,
                    }}
                  >
                    <GameIcon size={16} style={{ color: `var(${game.textVar})` }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: "var(--text)" }}>
                      {game.title}
                    </p>
                    {best ? (
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-2)" }}>
                        Best:{" "}
                        <span style={{ color: `var(${game.textVar})`, fontWeight: 700 }}>
                          {best.score} pts
                        </span>
                      </p>
                    ) : (
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
                        Not played yet
                      </p>
                    )}
                  </div>

                  {best && (
                    <div
                      className="flex items-center gap-1 flex-shrink-0 text-xs font-bold px-2 py-1 rounded-full"
                      style={{
                        background: `var(${game.textVar})14`,
                        color: `var(${game.textVar})`,
                        border: `1px solid var(${game.borderVar})`,
                      }}
                    >
                      <Trophy size={10} />
                      {best.xpEarned} XP
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Stats footer */}
          <div className="flex gap-4 mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2">
              <Zap size={16} style={{ color: "#f59e0b" }} />
              <div>
                <p className="text-xl font-extrabold" style={{ color: "#f59e0b" }}>
                  {totalXpFromGames}
                </p>
                <p className="text-xs" style={{ color: "var(--text-3)" }}>XP from games</p>
              </div>
            </div>
            <div style={{ width: 1, background: "var(--border)" }} />
            <div className="flex items-center gap-2">
              <Gamepad2 size={16} style={{ color: "var(--accent-2)" }} />
              <div>
                <p className="text-xl font-extrabold" style={{ color: "var(--accent-2)" }}>
                  {totalGamesPlayed}
                </p>
                <p className="text-xs" style={{ color: "var(--text-3)" }}>Games played</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
