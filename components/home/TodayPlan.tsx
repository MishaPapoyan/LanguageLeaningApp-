import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Brain, BookOpen, Gamepad2, ArrowRight, CheckCircle2 } from "lucide-react";

// One suggested game per category that rotates daily
const GAME_SUGGESTIONS = [
  { label: "Flashcards",      href: "/games/flashcards",       emoji: "рџЋґ", category: "Vocabulary" },
  { label: "Word Scramble",   href: "/games/word-scramble",    emoji: "рџ”Ђ", category: "Vocabulary" },
  { label: "Speed Typing",    href: "/games/speed-typing",     emoji: "вЊЁпёЏ", category: "Vocabulary" },
  { label: "Tense Challenge", href: "/games/tense-challenge",  emoji: "вЏ±пёЏ", category: "Grammar"    },
  { label: "Error Detective", href: "/games/error-detective",  emoji: "рџ”Ќ", category: "Grammar"    },
  { label: "Dictation",       href: "/games/dictation",        emoji: "рџ–ЉпёЏ", category: "Listening"  },
  { label: "Story Audio",     href: "/games/story-audio",      emoji: "рџЋ§", category: "Listening"  },
  { label: "City Explorer",   href: "/games/city-explorer",    emoji: "рџЏ™пёЏ", category: "Conversation"},
  { label: "Job Interview",   href: "/games/interview",        emoji: "рџ’ј", category: "Conversation"},
  { label: "Hotel",           href: "/games/hotel",            emoji: "рџЏЁ", category: "Immersive"   },
];

export async function TodayPlan({ targetLang }: { targetLang: string }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return null;

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  // Run all three queries in parallel
  const [dueCount, todayScores, savedWordCount] = await Promise.all([
    // 1. Words due for spaced-repetition review
    prisma.savedWord.count({
      where: { userId, nextReviewAt: { lte: now } },
    }),
    // 2. Games played today (to suggest something fresh)
    prisma.gameScore.findMany({
      where: { userId, playedAt: { gte: todayStart } },
      select: { gameType: true },
    }),
    // 3. Total saved words (to check if review is even possible)
    prisma.savedWord.count({ where: { userId } }),
  ]);

  const playedToday = new Set(todayScores.map((s) => s.gameType));

  // Pick today's suggested game вЂ” rotate daily, skip already-played ones
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  let suggestion = GAME_SUGGESTIONS[dayIndex % GAME_SUGGESTIONS.length];
  // If already played today, find next unplayed
  const alreadyPlayedLabel = Array.from(playedToday).map(String);
  for (let i = 0; i < GAME_SUGGESTIONS.length; i++) {
    const candidate = GAME_SUGGESTIONS[(dayIndex + i) % GAME_SUGGESTIONS.length];
    if (!alreadyPlayedLabel.some((g) => g.toLowerCase().includes(candidate.label.toLowerCase().replace(" ", "_")))) {
      suggestion = candidate;
      break;
    }
  }

  const allDone = playedToday.size >= 3 && dueCount === 0;

  return (
    <div
      className="bento p-5"
      style={{ border: "1px solid var(--border)", gridColumn: "1 / -1" }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <p className="section-label">Today's Plan</p>
        {allDone && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            fontSize: 11, fontWeight: 700, color: "var(--green)",
            background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)",
            borderRadius: 999, padding: "3px 10px",
          }}>
            <CheckCircle2 size={11} /> All done!
          </span>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>

        {/* Review card */}
        <Link
          href="/review"
          style={{ textDecoration: "none" }}
        >
          <div style={{
            borderRadius: 14, padding: "14px 16px",
            background: dueCount > 0 ? "rgba(16,185,129,0.08)" : "var(--surface-2)",
            border: `1px solid ${dueCount > 0 ? "rgba(16,185,129,0.35)" : "var(--border)"}`,
            display: "flex", alignItems: "center", gap: 12,
            transition: "opacity 0.15s",
            opacity: savedWordCount === 0 ? 0.5 : 1,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 11, flexShrink: 0,
              background: dueCount > 0 ? "var(--accent-dim)" : "var(--surface-3)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Brain size={18} style={{ color: dueCount > 0 ? "var(--accent-2)" : "var(--text-3)" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", margin: 0 }}>Review words</p>
              <p style={{ fontSize: 11, color: dueCount > 0 ? "var(--accent-2)" : "var(--text-3)", margin: 0, marginTop: 2 }}>
                {savedWordCount === 0
                  ? "Save words in games first"
                  : dueCount > 0
                  ? `${dueCount} word${dueCount === 1 ? "" : "s"} due now`
                  : "All caught up вњ“"}
              </p>
            </div>
            {dueCount > 0 && (
              <span style={{
                flexShrink: 0, minWidth: 24, height: 24,
                background: "var(--accent)", borderRadius: 999,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 800, color: "#fff",
              }}>
                {dueCount > 99 ? "99+" : dueCount}
              </span>
            )}
          </div>
        </Link>

        {/* Lesson card */}
        <Link
          href="/learn"
          style={{ textDecoration: "none" }}
        >
          <div style={{
            borderRadius: 14, padding: "14px 16px",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 11, flexShrink: 0,
              background: "rgba(45,212,191,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <BookOpen size={18} style={{ color: "#2dd4bf" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", margin: 0 }}>Continue lesson</p>
              <p style={{ fontSize: 11, color: "var(--text-3)", margin: 0, marginTop: 2 }}>
                Pick up your learning path
              </p>
            </div>
            <ArrowRight size={14} style={{ color: "var(--text-3)", flexShrink: 0 }} />
          </div>
        </Link>

        {/* Game suggestion card */}
        <Link
          href={suggestion.href}
          style={{ textDecoration: "none" }}
        >
          <div style={{
            borderRadius: 14, padding: "14px 16px",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 11, flexShrink: 0,
              background: "rgba(251,146,60,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20,
            }}>
              {suggestion.emoji}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", margin: 0 }}>
                {suggestion.label}
              </p>
              <p style={{ fontSize: 11, color: "var(--text-3)", margin: 0, marginTop: 2 }}>
                {suggestion.category} В· today's pick
              </p>
            </div>
            <ArrowRight size={14} style={{ color: "var(--text-3)", flexShrink: 0 }} />
          </div>
        </Link>

      </div>
    </div>
  );
}
