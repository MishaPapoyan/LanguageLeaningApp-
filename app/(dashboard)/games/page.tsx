import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Games — LinguaFlow",
  description: "Practice French vocabulary with fun games",
};

const GAMES = [
  {
    href: "/games/flashcards",
    gameType: "FLASHCARDS" as const,
    emoji: "🃏",
    title: "Flashcards",
    desc: "Test your memory with spaced repetition",
    gradient: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
    border: "rgba(124,106,255,0.28)",
    labelColor: "#c4b5fd",
    labelDim: "rgba(196,181,253,0.12)",
    difficulty: "Easy",
    difficultyColor: "#22c55e",
    xp: "+20 XP",
    xpColor: "#a5b4fc",
    xpDim: "rgba(165,180,252,0.14)",
  },
  {
    href: "/games/matching",
    gameType: "MATCHING" as const,
    emoji: "🔗",
    title: "Word Matching",
    desc: "Match French words to English translations",
    gradient: "linear-gradient(135deg, #064e3b 0%, #065f46 100%)",
    border: "rgba(34,197,94,0.28)",
    labelColor: "#86efac",
    labelDim: "rgba(134,239,172,0.12)",
    difficulty: "Medium",
    difficultyColor: "#f59e0b",
    xp: "+30 XP",
    xpColor: "#6ee7b7",
    xpDim: "rgba(110,231,183,0.14)",
  },
  {
    href: "/games/memory-palace",
    gameType: "MEMORY_PALACE" as const,
    emoji: "🧩",
    title: "Memory Palace",
    desc: "Place words in a virtual space to build spatial memory",
    gradient: "linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)",
    border: "rgba(96,165,250,0.28)",
    labelColor: "#93c5fd",
    labelDim: "rgba(147,197,253,0.12)",
    difficulty: "Hard",
    difficultyColor: "#ef4444",
    xp: "+50 XP",
    xpColor: "#7dd3fc",
    xpDim: "rgba(125,211,252,0.14)",
  },
] as const;

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
      <div className="flex items-start justify-between gap-4">
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
          style={{ background: "rgba(245,158,11,0.14)", border: "1px solid rgba(245,158,11,0.3)", color: "#fcd34d" }}
        >
          <span>⚡</span> 2× XP Multiplier
        </div>
      </div>

      {/* ── Daily Challenge banner ── */}
      <div
        className="bento flex items-center gap-4 px-6 py-4"
        style={{
          background: "linear-gradient(135deg, #431407 0%, #7c2d12 50%, #9a3412 100%)",
          border: "1px solid rgba(249,115,22,0.3)",
        }}
      >
        <span style={{ fontSize: 32 }}>🎯</span>
        <div className="flex-1">
          <p className="font-bold text-base" style={{ color: "#fdba74" }}>Daily Challenge</p>
          <p className="text-sm" style={{ color: "rgba(253,186,116,0.7)" }}>
            Complete any game today for double XP — limited time!
          </p>
        </div>
        <div
          className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold"
          style={{ background: "rgba(249,115,22,0.2)", border: "1px solid rgba(249,115,22,0.4)", color: "#fb923c" }}
        >
          2× XP today
        </div>
      </div>

      {/* ── Game Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {GAMES.map((game) => {
          const best = bestScores[game.gameType];
          return (
            <div
              key={game.href}
              className="game-card flex flex-col"
              style={{
                background: game.gradient,
                border: `1px solid ${game.border}`,
                padding: "1.75rem 1.5rem",
                gap: "1rem",
              }}
            >
              {/* Emoji */}
              <span style={{ fontSize: 80, lineHeight: 1, display: "block" }}>{game.emoji}</span>

              {/* Title + desc */}
              <div>
                <h2 className="font-bold" style={{ fontSize: "1.5rem", color: game.labelColor, marginBottom: "0.375rem" }}>
                  {game.title}
                </h2>
                <p className="text-sm" style={{ color: `${game.labelColor}99` }}>
                  {game.desc}
                </p>
              </div>

              {/* Badges row */}
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(0,0,0,0.25)", color: game.difficultyColor, border: `1px solid ${game.difficultyColor}44` }}
                >
                  {game.difficulty}
                </span>
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: game.xpDim, color: game.xpColor, border: `1px solid ${game.xpColor}44` }}
                >
                  {game.xp}
                </span>
              </div>

              {/* Best score */}
              {best && (
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                  style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <span>🏆</span>
                  <span style={{ color: game.labelColor }}>
                    Best: <strong>{best.score}</strong> pts · {best.xpEarned} XP earned
                  </span>
                </div>
              )}

              {/* Play button */}
              <Link
                href={game.href}
                className="btn-primary mt-auto text-center text-sm font-bold py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95"
                style={{ background: `${game.labelColor}22`, border: `1px solid ${game.border}`, color: game.labelColor, textDecoration: "none", display: "block" }}
              >
                Play now →
              </Link>
            </div>
          );
        })}
      </div>

      {/* ── Best Scores Summary row ── */}
      {Object.keys(bestScores).length > 0 && (
        <div className="bento p-5" style={{ border: "1px solid var(--border)" }}>
          <p className="section-label mb-4">Your best scores</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {GAMES.map((game) => {
              const best = bestScores[game.gameType];
              return (
                <div
                  key={game.gameType}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                >
                  <span style={{ fontSize: 28 }}>{game.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: "var(--text)" }}>{game.title}</p>
                    {best ? (
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-2)" }}>
                        Best: <span style={{ color: game.labelColor, fontWeight: 700 }}>{best.score} pts</span>
                      </p>
                    ) : (
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>Not played yet</p>
                    )}
                  </div>
                  {best && (
                    <span
                      className="text-xs font-bold px-2 py-1 rounded-full flex-shrink-0"
                      style={{ background: game.xpDim, color: game.xpColor }}
                    >
                      {best.xpEarned} XP
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Overall stats */}
          <div className="flex gap-4 mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
            <div>
              <p className="text-xl font-extrabold" style={{ color: "var(--accent-2)" }}>{totalGamesPlayed}</p>
              <p className="text-xs" style={{ color: "var(--text-3)" }}>Total games played</p>
            </div>
            <div style={{ width: 1, background: "var(--border)" }} />
            <div>
              <p className="text-xl font-extrabold" style={{ color: "#f59e0b" }}>{totalXpFromGames}</p>
              <p className="text-xs" style={{ color: "var(--text-3)" }}>XP earned from games</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
