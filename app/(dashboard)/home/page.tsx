export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { t, getLocale } from "@/lib/i18n";
import { getLanguageConfig } from "@/data/language-config";
import Link from "next/link";
import { BADGES, getXpProgress } from "@/types";
import { DailyGoals } from "@/components/DailyGoals";
import { Metadata } from "next";
import {
  BookOpen,
  Gamepad2,
  MessageSquare,
  Search,
  Flame,
  Zap,
  Trophy,
  ArrowRight,
  Play,
  GraduationCap,
  ChevronRight,
  TrendingUp,
  BookMarked,
  Volume2,
} from "lucide-react";
import { WordOfDayPlayer } from "@/components/home/WordOfDayPlayer";
import { TodayPlan } from "@/components/home/TodayPlan";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Dashboard — Lingova",
};

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const targetLang = (session?.user as { targetLanguage?: string })?.targetLanguage ?? "fr";
  const langConfig = getLanguageConfig(targetLang);
  const locale = getLocale((session?.user as any)?.nativeLanguage ?? "en");

  const dayIndex = Math.floor(Date.now() / 86_400_000) % 100;

  let progress = null, savedWordCount = 0, completedStories = 0, recentWord = null, lastStory = null;
  let onboardingCompleted = true;
  let topLeaders: { name: string | null; xp: number }[] = [];

  if (userId) {
    try {
      const userRow = await prisma.user.findUnique({
        where: { id: userId },
        select: { onboardingCompleted: true },
      });
      onboardingCompleted = userRow?.onboardingCompleted ?? true;

      [progress, savedWordCount, completedStories, recentWord, lastStory] = await Promise.all([
        prisma.progress.findUnique({ where: { userId } }),
        prisma.savedWord.count({ where: { userId } }),
        prisma.storyProgress.count({ where: { userId, completed: true } }),
        prisma.word.findFirst({
          where: { language: targetLang },
          skip: dayIndex % 100,
          orderBy: { id: "asc" },
          select: { id: true, word: true, translation: true, exampleFr: true, imageEmoji: true },
        }),
        prisma.storyProgress.findFirst({
          where: { userId },
          orderBy: { updatedAt: "desc" },
          include: { story: { select: { title: true, imageEmoji: true, chapter: true } } },
        }),
      ]);

      try {
        const leaderRows = await prisma.progress.findMany({
          orderBy: { xp: "desc" },
          take: 4,
          include: { user: { select: { name: true } } },
        });
        topLeaders = leaderRows.map((r) => ({ name: r.user?.name ?? "Anon", xp: r.xp }));
      } catch {
        topLeaders = [];
      }
    } catch (err) {
      console.error("[home] DB error:", err);
    }
  } else {
    try {
      recentWord = await prisma.word.findFirst({
        where: { language: targetLang },
        skip: dayIndex % 100,
        orderBy: { id: "asc" },
        select: { id: true, word: true, translation: true, exampleFr: true, imageEmoji: true },
      });
    } catch (err) {
      console.error("[home] DB error:", err);
    }
  }

  const xpInfo = progress ? getXpProgress(progress.xp) : { level: 1, current: 0, needed: 100, pct: 0 };
  const skillTree = (progress?.skillTree as Record<string, number>) ?? {};
  const earnedBadges = BADGES.filter((b) => (progress?.badges ?? []).includes(b.id));
  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  // Skill rings (4) — vocabulary, listening, grammar, writing
  const rings = [
    { skill: t(locale, "home_vocabSkill"),    val: skillTree.vocabulary ?? 0, color: "emerald" },
    { skill: "Listening",                     val: skillTree.listening  ?? 0, color: "blue" },
    { skill: t(locale, "home_grammarSkill"),  val: skillTree.grammar    ?? 0, color: "purple" },
    { skill: "Writing",                       val: skillTree.writing    ?? 0, color: "rose" },
  ];

  // Quick action buttons
  const quickActions = [
    { label: t(locale, "tutor_title"),    icon: MessageSquare, desc: "Practice speaking",  color: "purple",  href: "/tutor" },
    { label: t(locale, "games_title"),    icon: Gamepad2,      desc: "Fun practice",       color: "amber",   href: "/games" },
    { label: t(locale, "nav_dictionary"), icon: Search,        desc: "Explore words",      color: "blue",    href: "/dictionary" },
    { label: "Stories",                   icon: BookOpen,      desc: "Immersive reading",  color: "emerald", href: "/stories" },
  ];

  // Recommended games preview (4 cards)
  const recommended = [
    { title: "Word Match",       category: "Vocabulary",     mode: "Timed",   color: "blue",    href: "/games/matching" },
    { title: "Sentence Builder", category: "Grammar",        mode: "Build",   color: "purple",  href: "/games/sentence-builder" },
    { title: "Listen & Choose",  category: "Pronunciation",  mode: "Audio",   color: "emerald", href: "/games/listen-quiz" },
    { title: "City Explorer",    category: "Immersive",      mode: "Story",   color: "amber",   href: "/games/city-explorer" },
  ];

  // XP progress
  const xpProgressPct = xpInfo.pct;
  const streakDays = progress?.streak ?? 0;

  // Active unit progress (rough heuristic from skillTree avg)
  const skillVals = Object.values(skillTree).filter((v): v is number => typeof v === "number");
  const unitPct = skillVals.length ? Math.min(100, Math.round(skillVals.reduce((a, b) => a + b, 0) / skillVals.length)) : 0;

  return (
    <div className="space-y-12 animate-fade-up">

      {/* Onboarding modal (fires once for new users) */}
      {!onboardingCompleted && (
        <OnboardingModal
          targetLang={targetLang}
          langLabel={langConfig.label}
          langFlag={langConfig.flag}
        />
      )}

      {/* ─── Header ─── */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl md:text-6xl mb-2 font-black italic serif" style={{ letterSpacing: "-0.02em", lineHeight: 1.05 }}>
            {langConfig.greeting}, {firstName}.
          </h1>
          <p className="text-white/40 text-lg" style={{ color: "var(--text-2)" }}>
            {streakDays > 0
              ? t(locale, "home_streakMessage", { streak: String(streakDays) })
              : t(locale, "home_readyMessage", { lang: langConfig.label })}
            {" "}{langConfig.flag}
          </p>
        </div>
        {earnedBadges.length > 0 && (
          <div className="flex items-center gap-4 p-2 rounded-2xl" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
            <div className="flex -space-x-3">
              {earnedBadges.slice(0, 3).map((b) => (
                <div key={b.id} className="w-8 h-8 rounded-full flex items-center justify-center text-base" style={{ background: "var(--surface-3)", border: "2px solid var(--bg)" }}>
                  {b.emoji}
                </div>
              ))}
            </div>
            <p className="text-xs font-bold uppercase tracking-widest pr-2" style={{ color: "var(--text-3)" }}>
              {earnedBadges.length} {t(locale, "home_badgesEarned")}
            </p>
          </div>
        )}
      </header>

      {/* ─── 4 stat cards ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Today's XP w/ progress */}
        <div className="card-premium p-6 flex flex-col gap-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl" style={{ background: "rgba(16,185,129,0.10)", color: "var(--accent)" }}>
              <Zap size={24} />
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
              Lv {xpInfo.level}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium uppercase tracking-wider" style={{ color: "var(--text-3)" }}>
              {t(locale, "home_totalXp")}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold mono tracking-tight" style={{ color: "var(--text)" }}>
                {(progress?.xp ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="space-y-2 mt-2">
              <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="h-full transition-all duration-1000" style={{ width: `${xpProgressPct}%`, background: "var(--accent)" }} />
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
                {xpInfo.current} / {xpInfo.needed} XP
              </p>
            </div>
          </div>
        </div>

        {/* Streak */}
        <div className="card-premium p-6 flex flex-col gap-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl" style={{ background: "rgba(245,158,11,0.10)", color: "#f59e0b" }}>
              <Flame size={24} />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium uppercase tracking-wider" style={{ color: "var(--text-3)" }}>
              {t(locale, "home_statDayStreak")}
            </p>
            <p className="text-3xl font-bold mono tracking-tight" style={{ color: "var(--text)" }}>
              {streakDays} <span className="text-sm font-normal" style={{ color: "var(--text-3)" }}>days</span>
            </p>
          </div>
        </div>

        {/* Level */}
        <div className="card-premium p-6 flex flex-col gap-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl" style={{ background: "rgba(96,165,250,0.10)", color: "#60a5fa" }}>
              <Trophy size={24} />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium uppercase tracking-wider" style={{ color: "var(--text-3)" }}>
              {t(locale, "home_statLevel")}
            </p>
            <p className="text-3xl font-bold mono tracking-tight" style={{ color: "var(--text)" }}>
              {xpInfo.level}
            </p>
          </div>
        </div>

        {/* Words saved */}
        <div className="card-premium p-6 flex flex-col gap-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl" style={{ background: "rgba(168,85,247,0.10)", color: "#a78bfa" }}>
              <BookMarked size={24} />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium uppercase tracking-wider" style={{ color: "var(--text-3)" }}>
              {t(locale, "home_wordsSaved")}
            </p>
            <p className="text-3xl font-bold mono tracking-tight" style={{ color: "var(--text)" }}>
              {savedWordCount}
            </p>
          </div>
        </div>
      </div>

      {/* ─── Two-column grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left col: 8 */}
        <div className="lg:col-span-8 space-y-12">

          {/* Quick Actions */}
          <section>
            <h2 className="font-bold uppercase tracking-widest mb-6" style={{ fontSize: 10, color: "var(--text-3)", letterSpacing: "0.2em" }}>
              {t(locale, "home_quickActions")}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                const colorMap: Record<string, string> = {
                  purple: "rgba(168,85,247,0.10)",
                  amber: "rgba(245,158,11,0.10)",
                  blue: "rgba(96,165,250,0.10)",
                  emerald: "rgba(16,185,129,0.10)",
                };
                const fgMap: Record<string, string> = {
                  purple: "#a78bfa",
                  amber: "#f59e0b",
                  blue: "#60a5fa",
                  emerald: "var(--accent)",
                };
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="card-premium p-6 group transition-all"
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                      style={{ background: colorMap[action.color], color: fgMap[action.color] }}
                    >
                      <Icon size={20} />
                    </div>
                    <h4 className="font-bold text-sm" style={{ color: "var(--text)" }}>{action.label}</h4>
                    <p className="text-[10px] font-bold uppercase tracking-tight mt-1" style={{ color: "var(--text-3)" }}>
                      {action.desc}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Daily Curriculum */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl italic serif" style={{ color: "var(--text)" }}>Daily Curriculum</h2>
              <DailyGoals />
            </div>
            <Suspense fallback={null}>
              <TodayPlan targetLang={targetLang} />
            </Suspense>
          </section>

          {/* Recommended Games */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl italic serif" style={{ color: "var(--text)" }}>Recommended Games</h2>
              <Link
                href="/games"
                className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors"
                style={{ color: "var(--text-3)" }}
              >
                Games Hub <ChevronRight size={12} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommended.map((game) => {
                const dimMap: Record<string, string> = {
                  blue: "rgba(96,165,250,0.10)",
                  purple: "rgba(168,85,247,0.10)",
                  emerald: "rgba(16,185,129,0.10)",
                  amber: "rgba(245,158,11,0.10)",
                };
                const fgMap: Record<string, string> = {
                  blue: "#60a5fa",
                  purple: "#a78bfa",
                  emerald: "var(--accent)",
                  amber: "#f59e0b",
                };
                return (
                  <Link
                    key={game.title}
                    href={game.href}
                    className="card-premium p-6 group transition-all"
                    style={{ textDecoration: "none" }}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"
                        style={{ background: dimMap[game.color], color: fgMap[game.color] }}
                      >
                        <Gamepad2 size={24} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xl font-bold italic serif tracking-tight" style={{ color: "var(--text)" }}>
                        {game.title}
                      </h4>
                      <div className="flex items-center justify-between pt-4">
                        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
                          {game.category} · {game.mode}
                        </span>
                        <span
                          className="p-2 rounded-full transition-all"
                          style={{ border: "1px solid var(--border)" }}
                        >
                          <Play size={14} fill="currentColor" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right col: 4 */}
        <div className="lg:col-span-4 space-y-8">

          {/* Active Unit */}
          <section className="card-premium p-8 group" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black uppercase tracking-widest" style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.2em" }}>
                Active Unit
              </h3>
              <GraduationCap size={18} style={{ color: "var(--accent)" }} />
            </div>
            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <h4 className="text-2xl font-bold italic serif" style={{ color: "var(--text)" }}>
                  {lastStory ? lastStory.story.title : t(locale, "home_learningPath")}
                </h4>
                <span className="text-xs font-bold mono" style={{ color: "var(--accent)" }}>
                  {unitPct}%
                </span>
              </div>
              <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="h-full transition-all duration-1000" style={{ width: `${unitPct}%`, background: "var(--accent)" }} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
                {lastStory ? t(locale, "home_pickUpWhere") : t(locale, "home_startFirstLesson")}
              </p>
              <Link
                href={lastStory ? `/stories/${lastStory.storyId}` : "/learn"}
                className="btn-secondary w-full text-[10px]"
                style={{ padding: "10px", display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}
              >
                {lastStory?.completed ? t(locale, "home_readAgain") : t(locale, "home_resume")}
                <ArrowRight size={12} className="ml-1.5" />
              </Link>
            </div>
          </section>

          {/* Word of the Day */}
          {recentWord && (
            <section
              className="card-premium p-8 relative overflow-hidden group"
              style={{
                background: "linear-gradient(135deg, rgba(16,185,129,0.18), transparent 60%)",
                borderColor: "rgba(16,185,129,0.22)",
              }}
            >
              <div
                className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full"
                style={{ background: "rgba(16,185,129,0.10)", filter: "blur(60px)" }}
              />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-black uppercase tracking-widest" style={{ fontSize: 11, color: "var(--accent)", letterSpacing: "0.3em" }}>
                    {t(locale, "home_wordOfDay")}
                  </h3>
                  <WordOfDayPlayer word={recentWord.word} ttsLocale={langConfig.ttsLocale ?? targetLang} />
                </div>
                <div className="space-y-4">
                  <p
                    className="font-black italic serif tracking-tighter"
                    style={{ fontSize: "clamp(40px, 5vw, 56px)", color: "var(--text)", lineHeight: 1, letterSpacing: "-0.04em" }}
                  >
                    {recentWord.word}
                  </p>
                  <p className="text-base font-light" style={{ color: "var(--text-2)" }}>
                    &ldquo;{recentWord.translation}&rdquo;
                  </p>
                  {recentWord.exampleFr && (
                    <p className="text-sm italic" style={{ color: "var(--text-3)" }}>
                      {recentWord.exampleFr}
                    </p>
                  )}
                  <div className="pt-4 grid grid-cols-1 gap-2">
                    <Link href={`/dictionary/${recentWord.id}`} className="btn-primary py-3 text-xs" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
                      {t(locale, "home_learnThisWord")}
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Progress Rings */}
          <Link
            href="/progress"
            className="card-premium p-8 space-y-8 cursor-pointer transition-all group block"
            style={{ textDecoration: "none" }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-2xl italic serif" style={{ color: "var(--text)" }}>Progress Rings</h3>
              <ChevronRight size={18} style={{ color: "var(--text-3)" }} className="group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="grid grid-cols-2 gap-8">
              {rings.map((s) => {
                const colorMap: Record<string, string> = {
                  emerald: "var(--accent)",
                  blue: "#60a5fa",
                  purple: "#a78bfa",
                  rose: "#fb7185",
                };
                const stroke = colorMap[s.color] ?? "var(--accent)";
                const r = 34;
                const dash = 2 * Math.PI * r;
                const offset = dash - (dash * Math.max(s.val, 0)) / 100;
                return (
                  <div key={s.skill} className="flex flex-col items-center gap-3">
                    <div className="relative w-20 h-20 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90">
                        <circle cx="40" cy="40" r={r} stroke="currentColor" strokeWidth="4" fill="transparent" style={{ color: "rgba(255,255,255,0.06)" }} />
                        <circle
                          cx="40"
                          cy="40"
                          r={r}
                          stroke={stroke}
                          strokeWidth="4"
                          fill="transparent"
                          strokeDasharray={dash}
                          strokeDashoffset={offset}
                          strokeLinecap="round"
                          style={{ transition: "stroke-dashoffset 1s ease" }}
                        />
                      </svg>
                      <span className="absolute text-lg font-black mono italic" style={{ color: "var(--text)" }}>
                        {s.val}%
                      </span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-center" style={{ color: "var(--text-3)" }}>
                      {s.skill}
                    </span>
                  </div>
                );
              })}
            </div>
          </Link>

          {/* Weekly Pulse */}
          {topLeaders.length > 0 && (
            <section className="card-premium p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl italic serif" style={{ color: "var(--text)" }}>Weekly Pulse</h3>
                <TrendingUp size={18} style={{ color: "var(--accent)" }} />
              </div>
              <div className="space-y-4">
                {topLeaders.slice(0, 4).map((p, idx) => {
                  const isYou = p.name === session?.user?.name;
                  return (
                    <div
                      key={`${p.name}-${idx}`}
                      className="flex items-center gap-4 p-3 rounded-2xl transition-all"
                      style={{
                        background: isYou ? "rgba(16,185,129,0.10)" : "transparent",
                        border: isYou ? "1px solid rgba(16,185,129,0.22)" : "1px solid transparent",
                      }}
                    >
                      <span
                        className="w-6 text-sm font-black mono italic"
                        style={{ color: idx === 0 ? "#fbbf24" : "var(--text-3)" }}
                      >
                        {idx + 1}
                      </span>
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs"
                        style={{ background: "var(--surface-3)", border: "1px solid var(--border)" }}
                      >
                        {(p.name ?? "?")[0]}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <span className="text-sm font-bold block truncate" style={{ color: "var(--text)" }}>
                          {isYou ? "You" : p.name}
                        </span>
                        <span className="text-[10px] font-bold uppercase italic" style={{ color: "var(--text-3)" }}>
                          {p.xp.toLocaleString()} XP
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Stats summary at bottom (stories etc, kept) */}
      {completedStories > 0 && (
        <div className="card-premium p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen size={20} style={{ color: "var(--accent)" }} />
            <p className="text-sm font-medium" style={{ color: "var(--text-2)" }}>
              {completedStories} {t(locale, "home_storiesDone")}
            </p>
          </div>
          <Link href="/stories" className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
            {t(locale, "home_viewAll")}
          </Link>
        </div>
      )}
    </div>
  );
}
