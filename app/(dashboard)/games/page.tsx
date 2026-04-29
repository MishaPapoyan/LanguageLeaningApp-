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
} from "lucide-react";

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
    theme: "#6366F1",
    difficulty: "Easy",
    tag: "Recall",
    xp: 20,
  },
  {
    href: "/games/matching",
    gameType: "MATCHING",
    icon: Link2,
    title: "Word Match",
    desc: "Match target language words to English translations against the clock",
    theme: "#10B981",
    difficulty: "Medium",
    tag: "Speed",
    xp: 30,
  },
  {
    href: "/games/memory-palace",
    gameType: "MEMORY_PALACE",
    icon: Puzzle,
    title: "Memory Palace",
    desc: "Place words in virtual rooms — spatial memory that never fades",
    theme: "#8B5CF6",
    difficulty: "Hard",
    tag: "Structure",
    xp: 50,
  },
  {
    href: "/games/word-scramble",
    gameType: "WORD_SCRAMBLE",
    icon: Shuffle,
    title: "Word Scramble",
    desc: "Unscramble jumbled vocabulary words — race against your brain",
    theme: "#F43F5E",
    difficulty: "Medium",
    tag: "Speed",
    xp: 25,
  },
  {
    href: "/games/fill-blank",
    gameType: "FILL_BLANK",
    icon: PenLine,
    title: "Fill the Blank",
    desc: "Complete sentences — context makes vocabulary stick",
    theme: "#14B8A6",
    difficulty: "Medium",
    tag: "Grammar",
    xp: 25,
  },
  {
    href: "/games/true-false",
    gameType: "TRUE_FALSE",
    icon: CheckSquare,
    title: "True or False",
    desc: "Is the translation correct? Quick-fire judgement rounds",
    theme: "#F59E0B",
    difficulty: "Easy",
    tag: "Recall",
    xp: 20,
  },
  {
    href: "/games/speed-typing",
    gameType: "SPEED_TYPING",
    icon: Keyboard,
    title: "Speed Typing",
    desc: "See the meaning, type the word — train muscle memory fast",
    theme: "#EC4899",
    difficulty: "Medium",
    tag: "Recall",
    xp: 30,
  },
  {
    href: "/games/listen-quiz",
    gameType: "LISTEN_QUIZ",
    icon: Headphones,
    title: "Listen & Choose",
    desc: "Hear the word spoken — pick the right translation from 4",
    theme: "#06B6D4",
    difficulty: "Hard",
    tag: "Listening",
    xp: 35,
  },
  {
    href: "/games/sentence-builder",
    gameType: "SENTENCE_BUILDER",
    icon: AlignJustify,
    title: "Sentence Builder",
    desc: "Tap word tiles to assemble correct sentences — master grammar fast",
    theme: "#0EA5E9",
    difficulty: "Medium",
    tag: "Grammar",
    xp: 30,
  },
  {
    href: "/games/dialog-adventure",
    gameType: "DIALOG_ADVENTURE",
    icon: MessagesSquare,
    title: "Dialog Adventure",
    desc: "Real scenarios, real conversations — café, train station, getting lost",
    theme: "#F97316",
    difficulty: "Hard",
    tag: "Scenario",
    xp: 40,
  },
  {
    href: "/games/city-explorer",
    gameType: "CITY_EXPLORER",
    icon: Map,
    title: "City Explorer",
    desc: "Walk a 2D city, find NPCs, answer their challenges — the full RPG experience",
    theme: "#84CC16",
    difficulty: "Hard",
    tag: "Culture",
    xp: 50,
  },
  {
    href: "/games/immersion",
    gameType: "IMMERSION",
    icon: Home,
    title: "Immersion Room",
    desc: "Find objects in a 3D room by listening to voice commands",
    theme: "#D946EF",
    difficulty: "Easy",
    tag: "Listening",
    xp: 40,
  },
  {
    href: "/games/city-3d",
    gameType: "CITY_EXPLORER",
    icon: Box,
    title: "Word Blaster 3D",
    desc: "Shoot the correct translation in a neon 3D arena — grow, shrink, speed up each round",
    theme: "#6366F1",
    difficulty: "Hard",
    tag: "Speed",
    xp: 60,
  },
  {
    href: "/games/interview",
    gameType: "INTERVIEW",
    icon: Briefcase,
    title: "Job Interview",
    desc: "Sit across a 3D interviewer — answer their questions in French or Spanish to get hired",
    theme: "#3B82F6",
    difficulty: "Medium",
    tag: "Scenario",
    xp: 40,
  },
];

const DIFF_COLOR: Record<string, string> = {
  Easy: "#10B981",
  Medium: "#F59E0B",
  Hard: "#EF4444",
};

export default async function GamesPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? "";
  const locale = getLocale((session?.user as any)?.nativeLanguage ?? "en");

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

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, fontFamily: "var(--font-display)", letterSpacing: "-0.022em", color: "var(--text)", marginBottom: 4 }}>
          {t(locale, "games_title")}
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-2)" }}>
          {t(locale, "games_subtitle")}
        </p>
      </div>

      {/* Daily Challenge banner */}
      <div className="daily-banner" style={{ marginBottom: 28, display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          background: "linear-gradient(135deg, #F59E0B, #F97316)",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
        }}>
          <Flame size={28} style={{ color: "#0B0F1A" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "3px 9px",
              borderRadius: 999,
              background: "rgba(245,158,11,0.18)",
              border: "1px solid rgba(245,158,11,0.35)",
              color: "#F59E0B",
            }}>
              Daily Challenge
            </span>
            <span style={{ fontSize: 12, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
              Resets in 04:12:09
            </span>
          </div>
          <p style={{ fontSize: 17, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text)", marginBottom: 2, letterSpacing: "-0.01em" }}>
            Word Blaster 3D — Hard mode
          </p>
          <p style={{ fontSize: 13, color: "var(--text-2)" }}>
            Clear 30 targets, lose no more than 2 lives.
          </p>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0, marginRight: 4 }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: "var(--xp)", fontFamily: "var(--font-mono)", letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
            +500
          </div>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)" }}>
            XP reward
          </div>
        </div>
        <Link
          href="/games/city-3d"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "10px 20px",
            borderRadius: 12,
            background: "linear-gradient(135deg, #F59E0B, #F97316)",
            color: "#0B0F1A",
            fontWeight: 700,
            fontSize: 14,
            textDecoration: "none",
            flexShrink: 0,
            fontFamily: "var(--font-display)",
            letterSpacing: "-0.01em",
            boxShadow: "0 0 24px rgba(245,158,11,0.35)",
          }}
        >
          Start →
        </Link>
      </div>

      {/* Stats row (if played before) */}
      {totalGamesPlayed > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 24,
        }}>
          <div className="bento" style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(245,158,11,0.15)", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <Zap size={18} style={{ color: "var(--xp)" }} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--xp)", letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
                {totalXpFromGames.toLocaleString()}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-3)" }}>XP from games</div>
            </div>
          </div>
          <div className="bento" style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(99,102,241,0.15)", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <Gamepad2 size={18} style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--accent)", letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
                {totalGamesPlayed}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-3)" }}>Games played</div>
            </div>
          </div>
        </div>
      )}

      {/* Game Cards Grid */}
      <div className="games-grid" style={{ marginBottom: 32 }}>
        {GAMES.map((game) => {
          const best = bestScores[game.gameType];
          const GameIcon = game.icon;
          const diffColor = DIFF_COLOR[game.difficulty] ?? "#F59E0B";
          return (
            <Link
              href={game.href}
              key={game.href}
              className="game-card-v2"
              style={{ "--t": game.theme, textDecoration: "none" } as React.CSSProperties}
            >
              <div className="gc-aura" />
              <div className="gc-sheen" />

              <div className="gc-head">
                <div className="gc-icon">
                  <GameIcon size={20} style={{ color: "#fff" }} />
                </div>
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  padding: "3px 9px",
                  borderRadius: 999,
                  background: `${diffColor}20`,
                  border: `1px solid ${diffColor}40`,
                  color: diffColor,
                }}>
                  {game.difficulty}
                </span>
              </div>

              <div className="gc-foot">
                <div className="gc-name">{game.title}</div>
                <div className="gc-row">
                  <span className="gc-tag">{game.tag}</span>
                  <span className="gc-xp">+{game.xp} XP</span>
                </div>
                {best && (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    marginTop: 8,
                    fontSize: 11,
                    color: "var(--text-3)",
                    fontFamily: "var(--font-mono)",
                  }}>
                    <Trophy size={11} style={{ color: game.theme, flexShrink: 0 }} />
                    <span style={{ color: game.theme, fontWeight: 600 }}>{best.score.toLocaleString()}</span>
                    <span>pts best</span>
                  </div>
                )}
              </div>

              <div className="gc-corner" aria-hidden="true">↗</div>
            </Link>
          );
        })}
      </div>

      {/* Best Scores */}
      {Object.keys(bestScores).length > 0 && (
        <div className="bento" style={{ padding: "20px 24px" }}>
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)" }}>
              Best Scores
            </p>
            <p style={{ fontSize: 13, color: "var(--text-2)", marginTop: 2 }}>Your personal bests · all time</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
            {GAMES.filter(g => bestScores[g.gameType]).map((game) => {
              const best = bestScores[game.gameType];
              const GameIcon = game.icon;
              return (
                <div
                  key={game.gameType}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: `${game.theme}20`,
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                    }}>
                      <GameIcon size={14} style={{ color: game.theme }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", lineHeight: 1.2 }}>
                      {game.title}
                    </span>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-mono)", color: game.theme, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
                    {best!.score.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>
                    {best!.xpEarned} XP earned
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CSS for games grid + daily banner */}
      <style>{`
        .games-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }
        @media (max-width: 1024px) {
          .games-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 768px) {
          .games-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .games-grid { grid-template-columns: 1fr; }
        }
        .daily-banner {
          background: linear-gradient(135deg, rgba(245,158,11,0.12), rgba(99,102,241,0.10));
          border: 1px solid rgba(245,158,11,0.35);
          border-radius: 16px;
          padding: 20px 24px;
          box-shadow: 0 0 0 1px rgba(245,158,11,0.15), 0 0 48px rgba(245,158,11,0.12);
          animation: pulseGlow 2.4s cubic-bezier(0.32, 0.72, 0, 1) infinite;
        }
        @keyframes pulseGlow {
          0%,100% { box-shadow: 0 0 0 1px rgba(245,158,11,0.15), 0 0 48px rgba(245,158,11,0.12); }
          50%      { box-shadow: 0 0 0 1px rgba(245,158,11,0.40), 0 0 72px rgba(245,158,11,0.25); }
        }
      `}</style>
    </div>
  );
}
