import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BADGES, getXpProgress } from "@/types";
import { DailyGoals } from "@/components/DailyGoals";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — LinguaFlow",
};

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const dayIndex = Math.floor(Date.now() / 86_400_000) % 100;

  const [progress, savedWordCount, completedStories, recentWord, lastStory] = await Promise.all([
    prisma.progress.findUnique({ where: { userId } }),
    prisma.savedWord.count({ where: { userId } }),
    prisma.storyProgress.count({ where: { userId, completed: true } }),
    prisma.word.findFirst({
      skip: dayIndex,
      orderBy: { id: "asc" },
      select: { id: true, word: true, translation: true, exampleFr: true, imageEmoji: true },
    }),
    prisma.storyProgress.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: { story: { select: { title: true, imageEmoji: true, chapter: true } } },
    }),
  ]);

  const xpInfo = progress ? getXpProgress(progress.xp) : { level: 1, current: 0, needed: 100, pct: 0 };
  const skillTree = (progress?.skillTree as Record<string, number>) ?? {};
  const earnedBadges = BADGES.filter((b) => (progress?.badges ?? []).includes(b.id));
  const firstName = session!.user.name?.split(" ")[0] ?? "there";

  const skills = [
    { key: "vocabulary", label: "Vocab",   emoji: "📖", color: "#60a5fa" },
    { key: "grammar",    label: "Grammar", emoji: "✏️", color: "var(--accent)" },
    { key: "speaking",   label: "Speaking", emoji: "🎙️", color: "#2dd4bf" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-4 animate-fade-up">

      {/* ── Hero bento ── */}
      <section
        className="bento relative overflow-hidden"
        style={{
          minHeight: 180,
          background: "radial-gradient(ellipse 80% 120% at 10% 50%, rgba(99,102,241,0.28) 0%, transparent 60%), radial-gradient(ellipse 60% 100% at 90% 40%, rgba(45,212,191,0.18) 0%, transparent 55%), var(--surface)",
          border: "1px solid var(--border-md)",
        }}
      >
        {/* decorative blobs */}
        <div style={{ position: "absolute", top: -40, left: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(99,102,241,0.12)", filter: "blur(40px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -30, right: 60, width: 160, height: 160, borderRadius: "50%", background: "rgba(45,212,191,0.10)", filter: "blur(36px)", pointerEvents: "none" }} />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5 p-6 md:p-8">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-extrabold mb-1" style={{ color: "var(--text)" }}>
              Bonjour, {firstName}! 👋
            </h1>
            <p className="text-sm mb-4" style={{ color: "var(--text-2)" }}>
              {progress?.streak && progress.streak > 0
                ? `You're on a ${progress.streak}-day streak — keep it up!`
                : "Ready to continue your French journey?"}
            </p>

            {/* XP bar */}
            <div style={{ maxWidth: 320 }}>
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "var(--accent-dim)", color: "var(--accent-2)", border: "1px solid rgba(99,102,241,0.3)" }}
                >
                  Level {xpInfo.level}
                </span>
                <span className="text-xs" style={{ color: "var(--text-3)" }}>
                  {xpInfo.current} / {xpInfo.needed} XP
                </span>
              </div>
              <div className="xp-bar">
                <div className="xp-bar-fill" style={{ width: `${xpInfo.pct}%` }} />
              </div>
            </div>
          </div>

          {/* Stat pills */}
          <div className="flex md:flex-col gap-2.5">
            {progress?.streak ? (
              <div
                className="stat-pill"
                style={{ background: "rgba(245,158,11,0.14)", border: "1px solid rgba(245,158,11,0.28)" }}
              >
                <span className="text-xl animate-streak-flame inline-block">🔥</span>
                <div>
                  <p className="text-base font-black leading-none" style={{ color: "#f59e0b" }}>{progress.streak}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-3)" }}>day streak</p>
                </div>
              </div>
            ) : null}
            <div
              className="stat-pill"
              style={{ background: "rgba(99,102,241,0.14)", border: "1px solid rgba(99,102,241,0.28)" }}
            >
              <span className="text-xl">⭐</span>
              <div>
                <p className="text-base font-black leading-none" style={{ color: "var(--accent)" }}>{progress?.xp ?? 0}</p>
                <p className="text-[10px]" style={{ color: "var(--text-3)" }}>total XP</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bento row: Stats / Daily Goals / Continue Learning ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Stats 2x2 */}
        <div className="bento p-5" style={{ border: "1px solid var(--border)" }}>
          <p className="section-label mb-3">Your progress</p>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: "Words saved",   value: savedWordCount,        emoji: "📖", color: "#60a5fa",        dim: "rgba(96,165,250,0.12)" },
              { label: "Stories done",  value: completedStories,      emoji: "✅", color: "#22c55e",        dim: "rgba(34,197,94,0.12)" },
              { label: "Level",         value: `Lv ${xpInfo.level}`,  emoji: "🏅", color: "var(--accent-2)", dim: "var(--accent-dim)" },
              { label: "Day streak",    value: progress?.streak ?? 0, emoji: "🔥", color: "#f59e0b",        dim: "rgba(245,158,11,0.12)" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center justify-center text-center p-3 rounded-xl"
                style={{ background: stat.dim, border: "1px solid rgba(255,255,255,0.05)" }}
              >
                <span className="text-xl mb-1">{stat.emoji}</span>
                <p className="text-lg font-extrabold leading-none" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-[10px] mt-0.5 font-medium" style={{ color: "var(--text-3)" }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Goals */}
        <div className="bento p-5" style={{ border: "1px solid var(--border)" }}>
          <DailyGoals />
        </div>

        {/* Continue Learning */}
        <Link
          href={lastStory ? `/stories/${lastStory.storyId}` : "/learn"}
          className="bento p-5 flex flex-col justify-between group transition-all duration-200"
          style={{ border: "1px solid var(--border)", minHeight: 160, textDecoration: "none" }}
        >
          <div>
            <p className="section-label mb-2">Continue learning</p>
            {lastStory ? (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{lastStory.story.imageEmoji}</span>
                  <div>
                    <p className="font-bold text-sm leading-snug" style={{ color: "var(--text)" }}>{lastStory.story.title}</p>
                    <p className="text-[11px]" style={{ color: "var(--text-3)" }}>Chapter {lastStory.story.chapter}</p>
                  </div>
                </div>
                <p className="text-xs" style={{ color: "var(--text-2)" }}>
                  {lastStory.completed ? "Completed — read again" : "Pick up where you left off"}
                </p>
              </>
            ) : (
              <>
                <p className="text-xl font-bold mb-1" style={{ color: "var(--text)" }}>Learning Path</p>
                <p className="text-sm" style={{ color: "var(--text-2)" }}>Start your first lesson</p>
              </>
            )}
          </div>
          <div
            className="self-start mt-3 flex items-center gap-1.5 text-sm font-semibold"
            style={{ color: "var(--accent)" }}
          >
            {lastStory?.completed ? "Read again" : "Resume"} <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
          </div>
        </Link>
      </div>

      {/* ── Quick Actions bento (asymmetric) ── */}
      <div>
        <p className="section-label mb-3">Quick actions</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3" style={{ gridAutoRows: "auto" }}>

          {/* Large card: Continue Story (col-span-2) */}
          <Link
            href="/stories"
            className="game-card col-span-2 group"
            style={{
              background: "linear-gradient(135deg, #0d3d3a 0%, #0f4c45 50%, #134e48 100%)",
              border: "1px solid rgba(45,212,191,0.2)",
              padding: "1.5rem",
              minHeight: 140,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              textDecoration: "none",
            }}
          >
            <div className="flex items-start justify-between">
              <span style={{ fontSize: 48, lineHeight: 1 }}>📖</span>
              <span style={{ color: "rgba(45,212,191,0.6)", fontSize: "1.2rem" }}>→</span>
            </div>
            <div>
              <p className="font-bold text-base" style={{ color: "#99f6e4" }}>Continue Story</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(153,246,228,0.6)" }}>Immersive French narratives</p>
            </div>
          </Link>

          {/* Games */}
          <Link
            href="/games"
            className="game-card group"
            style={{
              background: "linear-gradient(135deg, #1e1b4b 0%, #2d2a6e 100%)",
              border: "1px solid rgba(124,106,255,0.25)",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: 120,
              textDecoration: "none",
            }}
          >
            <span style={{ fontSize: 36, lineHeight: 1 }}>🎮</span>
            <div>
              <p className="font-bold text-sm" style={{ color: "#c4b5fd" }}>Games</p>
              <p className="text-[11px]" style={{ color: "rgba(196,181,253,0.55)" }}>Play to learn</p>
            </div>
          </Link>

          {/* AI Tutor */}
          <Link
            href="/tutor"
            className="game-card group"
            style={{
              background: "linear-gradient(135deg, #1e1f4b 0%, #252760 100%)",
              border: "1px solid rgba(99,102,241,0.25)",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: 120,
              textDecoration: "none",
            }}
          >
            <span style={{ fontSize: 36, lineHeight: 1 }}>🗣️</span>
            <div>
              <p className="font-bold text-sm" style={{ color: "#a5b4fc" }}>AI Tutor</p>
              <p className="text-[11px]" style={{ color: "rgba(165,180,252,0.55)" }}>Conversational practice</p>
            </div>
          </Link>

          {/* Dictionary */}
          <Link
            href="/dictionary"
            className="game-card group"
            style={{
              background: "linear-gradient(135deg, #0c2340 0%, #0f3460 100%)",
              border: "1px solid rgba(96,165,250,0.22)",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: 120,
              textDecoration: "none",
            }}
          >
            <span style={{ fontSize: 36, lineHeight: 1 }}>📚</span>
            <div>
              <p className="font-bold text-sm" style={{ color: "#93c5fd" }}>Dictionary</p>
              <p className="text-[11px]" style={{ color: "rgba(147,197,253,0.55)" }}>Browse all words</p>
            </div>
          </Link>

          {/* Review */}
          <Link
            href="/review"
            className="game-card group"
            style={{
              background: "linear-gradient(135deg, #052e16 0%, #064e2e 100%)",
              border: "1px solid rgba(34,197,94,0.22)",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: 120,
              textDecoration: "none",
            }}
          >
            <span style={{ fontSize: 36, lineHeight: 1 }}>🧠</span>
            <div>
              <p className="font-bold text-sm" style={{ color: "#86efac" }}>Review</p>
              <p className="text-[11px]" style={{ color: "rgba(134,239,172,0.55)" }}>Spaced repetition</p>
            </div>
          </Link>

          {/* My Words */}
          <Link
            href="/my-words"
            className="game-card group"
            style={{
              background: "linear-gradient(135deg, #431407 0%, #6c2010 100%)",
              border: "1px solid rgba(249,115,22,0.22)",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: 120,
              textDecoration: "none",
            }}
          >
            <span style={{ fontSize: 36, lineHeight: 1 }}>✍️</span>
            <div>
              <p className="font-bold text-sm" style={{ color: "#fdba74" }}>My Words</p>
              <p className="text-[11px]" style={{ color: "rgba(253,186,116,0.55)" }}>Saved vocabulary</p>
            </div>
          </Link>
        </div>
      </div>

      {/* ── Bottom row: Word of the Day + Skill Rings ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Word of the Day */}
        {recentWord ? (
          <div className="bento p-5" style={{ border: "1px solid var(--border)" }}>
            <p className="section-label mb-3">Word of the day</p>
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ background: "var(--accent-dim)", border: "1px solid rgba(99,102,241,0.25)" }}
              >
                {recentWord.imageEmoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xl font-bold" style={{ color: "var(--text)" }}>{recentWord.word}</p>
                <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--accent-2)" }}>{recentWord.translation}</p>
                <p className="text-xs mt-1 italic truncate" style={{ color: "var(--text-3)" }}>
                  &ldquo;{recentWord.exampleFr}&rdquo;
                </p>
              </div>
            </div>
            <Link
              href={`/dictionary/${recentWord.id}`}
              className="btn-secondary mt-4 inline-flex text-xs px-4 py-2"
            >
              Learn this word →
            </Link>
          </div>
        ) : (
          <div className="bento p-5 flex items-center justify-center" style={{ border: "1px solid var(--border)" }}>
            <p className="text-sm" style={{ color: "var(--text-3)" }}>No word available today</p>
          </div>
        )}

        {/* Skill Rings */}
        <div className="bento p-5" style={{ border: "1px solid var(--border)" }}>
          <p className="section-label mb-4">Skill rings</p>
          <div className="flex justify-around items-center">
            {skills.map((skill) => {
              const pct = Math.max(skillTree[skill.key] ?? 0, 2);
              const r = 26;
              const circ = 2 * Math.PI * r;
              const offset = circ - (pct / 100) * circ;
              return (
                <div key={skill.key} className="flex flex-col items-center gap-2">
                  <div className="relative" style={{ width: 64, height: 64 }}>
                    <svg width="64" height="64" style={{ transform: "rotate(-90deg)", position: "absolute", inset: 0 }}>
                      <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                      <circle
                        cx="32" cy="32" r={r}
                        fill="none"
                        stroke={skill.color}
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray={circ}
                        strokeDashoffset={offset}
                        style={{ transition: "stroke-dashoffset 1s ease", filter: `drop-shadow(0 0 5px ${skill.color})` }}
                      />
                    </svg>
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem" }}>
                      {skill.emoji}
                    </div>
                  </div>
                  <p className="text-[11px] font-bold" style={{ color: "var(--text-2)" }}>{skill.label}</p>
                  <p className="text-xs font-extrabold" style={{ color: skill.color }}>{skillTree[skill.key] ?? 0}%</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Badges scroll ── */}
      {earnedBadges.length > 0 && (
        <div className="bento p-5" style={{ border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <p className="section-label">Badges earned</p>
            <Link href="/progress" className="text-xs font-semibold" style={{ color: "var(--accent)" }}>
              View all →
            </Link>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {earnedBadges.slice(0, 12).map((badge) => (
              <div
                key={badge.id}
                className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-full"
                style={{ background: "rgba(245,158,11,0.10)", border: "1px solid rgba(245,158,11,0.22)" }}
              >
                <span className="text-base">{badge.emoji}</span>
                <span className="text-xs font-semibold whitespace-nowrap" style={{ color: "#fcd34d" }}>{badge.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
