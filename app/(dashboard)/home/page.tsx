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

const QUICK_ACTIONS = [
  { href: "/learn",        label: "Lessons",    emoji: "📖", color: "rgba(124,106,255,0.15)", border: "rgba(124,106,255,0.3)",  text: "#a78bfa" },
  { href: "/stories",      label: "Stories",    emoji: "📚", color: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.3)",   text: "#fbbf24" },
  { href: "/tutor",        label: "AI Tutor",   emoji: "🤖", color: "rgba(96,165,250,0.12)",  border: "rgba(96,165,250,0.3)",   text: "#60a5fa" },
  { href: "/games",        label: "Games",      emoji: "🎮", color: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.3)",  text: "#f87171" },
  { href: "/review",       label: "Review",     emoji: "🔄", color: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.3)",   text: "#34d399" },
  { href: "/my-words",     label: "My Words",   emoji: "✍️", color: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.3)",   text: "#fbbf24" },
] as const;

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const dayIndex = Math.floor(Date.now() / 86_400_000) % 100;

  const [progress, savedWordCount, completedStories, recentWord] = await Promise.all([
    prisma.progress.findUnique({ where: { userId } }),
    prisma.savedWord.count({ where: { userId } }),
    prisma.storyProgress.count({ where: { userId, completed: true } }),
    prisma.word.findFirst({
      skip: dayIndex,
      orderBy: { id: "asc" },
      select: { id: true, word: true, translation: true, exampleFr: true, imageEmoji: true },
    }),
  ]);

  const xpInfo = progress ? getXpProgress(progress.xp) : { level: 1, current: 0, needed: 100, pct: 0 };
  const skillTree = (progress?.skillTree as Record<string, number>) ?? {};
  const earnedBadges = BADGES.filter((b) => (progress?.badges ?? []).includes(b.id));
  const firstName = session!.user.name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-5 animate-fade-up">

      {/* ── Hero banner ── */}
      <section className="hero-bg rounded-3xl p-7 md:p-10 relative">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--accent)" }}>
              Welcome back
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-1" style={{ color: "var(--text)" }}>
              Bonjour, {firstName} 👋
            </h1>
            <p className="text-sm" style={{ color: "var(--text-2)" }}>
              {progress?.streak && progress.streak > 0
                ? `You're on a ${progress.streak}-day streak — keep it up!`
                : "Let's start your French journey today."}
            </p>

            {/* XP bar */}
            <div className="mt-5 max-w-xs">
              <div className="flex justify-between text-xs mb-1.5" style={{ color: "var(--text-3)" }}>
                <span>Level {xpInfo.level}</span>
                <span>{xpInfo.current} / {xpInfo.needed} XP</span>
              </div>
              <div className="xp-bar">
                <div className="xp-bar-fill" style={{ width: `${xpInfo.pct}%` }} />
              </div>
            </div>
          </div>

          {/* Stat bubbles */}
          <div className="flex md:flex-col gap-3">
            {progress?.streak ? (
              <div
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl"
                style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.25)" }}
              >
                <span className="text-2xl animate-streak-flame inline-block">🔥</span>
                <div>
                  <p className="text-lg font-black leading-none" style={{ color: "#f59e0b" }}>{progress.streak}</p>
                  <p className="text-[10px] font-medium" style={{ color: "var(--text-3)" }}>day streak</p>
                </div>
              </div>
            ) : null}
            <div
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl"
              style={{ background: "rgba(124,106,255,0.15)", border: "1px solid rgba(124,106,255,0.25)" }}
            >
              <span className="text-2xl">⭐</span>
              <div>
                <p className="text-lg font-black leading-none" style={{ color: "var(--accent)" }}>{progress?.xp ?? 0}</p>
                <p className="text-[10px] font-medium" style={{ color: "var(--text-3)" }}>total XP</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Words saved",    value: savedWordCount,    emoji: "📖", color: "#60a5fa" },
          { label: "Stories done",   value: completedStories,  emoji: "✅", color: "#34d399" },
          { label: "Current level",  value: `Lv ${xpInfo.level}`, emoji: "🏅", color: "#a78bfa" },
        ].map((stat) => (
          <div key={stat.label} className="card p-4 text-center">
            <p className="text-2xl mb-1">{stat.emoji}</p>
            <p className="text-xl font-extrabold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--text-3)" }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Quick actions ── */}
      <div>
        <p className="section-label mb-3">Quick actions</p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5">
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200 active:scale-95 hover:scale-105"
              style={{ background: a.color, border: `1px solid ${a.border}` }}
            >
              <span className="text-2xl">{a.emoji}</span>
              <span className="text-xs font-bold" style={{ color: a.text }}>{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Main content grid ── */}
      <div className="grid md:grid-cols-2 gap-4">

        {/* Daily Goals */}
        <DailyGoals />

        {/* Continue learning */}
        <Link href="/learn" className="card-hover p-6 flex flex-col justify-between min-h-[160px]">
          <div>
            <p className="section-label mb-1">Continue learning</p>
            <h3 className="text-xl font-bold mt-2" style={{ color: "var(--text)" }}>
              Learning Path
            </h3>
            <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>
              Pick up where you left off
            </p>
          </div>
          <div
            className="self-start mt-4 flex items-center gap-2 text-sm font-semibold transition-all"
            style={{ color: "var(--accent)" }}
          >
            Resume lessons
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </div>
        </Link>
      </div>

      {/* ── Word of the day ── */}
      {recentWord && (
        <div className="card p-5 flex items-center gap-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
            style={{ background: "rgba(124,106,255,0.15)", border: "1px solid rgba(124,106,255,0.25)" }}
          >
            {recentWord.imageEmoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="section-label mb-1">Word of the day</p>
            <p className="text-xl font-bold" style={{ color: "var(--text)" }}>{recentWord.word}</p>
            <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--accent)" }}>{recentWord.translation}</p>
            <p className="text-xs mt-1 italic truncate" style={{ color: "var(--text-3)" }}>
              &ldquo;{recentWord.exampleFr}&rdquo;
            </p>
          </div>
          <Link
            href={`/dictionary/${recentWord.id}`}
            className="flex-shrink-0 btn-outline text-xs px-3 py-2"
          >
            Learn →
          </Link>
        </div>
      )}

      {/* ── Skills ── */}
      <div className="card p-6">
        <p className="section-label mb-5">Skills</p>
        <div className="grid grid-cols-3 gap-6">
          {[
            { key: "vocabulary", label: "Vocabulary", emoji: "📖", color: "#60a5fa" },
            { key: "grammar",    label: "Grammar",    emoji: "✏️", color: "var(--accent)" },
            { key: "speaking",   label: "Speaking",   emoji: "🎙️", color: "#34d399" },
          ].map((skill) => {
            const pct = Math.max(skillTree[skill.key] ?? 0, 2);
            const r = 22;
            const circ = 2 * Math.PI * r;
            const offset = circ - (pct / 100) * circ;
            return (
              <div key={skill.key} className="flex flex-col items-center gap-2">
                <div className="relative w-14 h-14">
                  <svg width="56" height="56" className="-rotate-90 absolute inset-0">
                    <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="5" />
                    <circle cx="28" cy="28" r={r} fill="none" stroke={skill.color} strokeWidth="5"
                      strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
                      style={{ transition: "stroke-dashoffset 1s ease", filter: `drop-shadow(0 0 4px ${skill.color})` }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-lg">
                    {skill.emoji}
                  </div>
                </div>
                <p className="text-xs font-bold" style={{ color: "var(--text-2)" }}>{skill.label}</p>
                <p className="text-xs font-extrabold" style={{ color: skill.color }}>{skillTree[skill.key] ?? 0}%</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Badges ── */}
      {earnedBadges.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="section-label">Badges earned</p>
            <Link href="/progress" className="text-xs font-semibold" style={{ color: "var(--accent)" }}>
              All →
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            {earnedBadges.slice(0, 10).map((badge) => (
              <div key={badge.id} className="flex-shrink-0 flex flex-col items-center gap-1.5 w-14">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
                  style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)" }}
                >
                  {badge.emoji}
                </div>
                <p className="text-[10px] text-center leading-tight font-medium" style={{ color: "var(--text-3)" }}>
                  {badge.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
