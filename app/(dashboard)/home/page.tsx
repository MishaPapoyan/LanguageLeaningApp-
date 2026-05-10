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
  BookMarked,
  Brain,
  PenLine,
  Flame,
  Star,
  Medal,
  TrendingUp,
  Zap,
  ArrowRight,
  Mic,
  CheckCircle2,
} from "lucide-react";
import { WordOfDayPlayer } from "@/components/home/WordOfDayPlayer";
import { TodayPlan } from "@/components/home/TodayPlan";
import { StreakShields } from "@/components/home/StreakShields";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Dashboard вЂ” Lingova",
};

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const targetLang = (session?.user as { targetLanguage?: string })?.targetLanguage ?? "fr";
  const langConfig = getLanguageConfig(targetLang);
  const locale = getLocale((session?.user as any)?.nativeLanguage ?? "en");

  const dayIndex = Math.floor(Date.now() / 86_400_000) % 100;

  let progress = null, savedWordCount = 0, completedStories = 0, recentWord = null, lastStory = null;
  let onboardingCompleted = true; // default true so returning users see nothing

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

  const skills = [
    { key: "vocabulary", label: t(locale, "home_vocabSkill"),    icon: <BookOpen size={16} />, color: "#60a5fa" },
    { key: "grammar",    label: t(locale, "home_grammarSkill"),  icon: <PenLine size={16} />,  color: "var(--accent)" },
    { key: "speaking",   label: t(locale, "home_speakingSkill"), icon: <Mic size={16} />,      color: "#2dd4bf" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-4 animate-fade-up">

      {/* в”Ђв”Ђ Onboarding modal (fires once for new users) в”Ђв”Ђ */}
      {!onboardingCompleted && (
        <OnboardingModal
          targetLang={targetLang}
          langLabel={langConfig.label}
          langFlag={langConfig.flag}
        />
      )}

      {/* в”Ђв”Ђ Hero bento в”Ђв”Ђ */}
      <section
        className="bento relative overflow-hidden"
        style={{
          minHeight: 200,
          background: "radial-gradient(ellipse 80% 120% at 10% 50%, rgba(16,185,129,0.28) 0%, transparent 60%), radial-gradient(ellipse 60% 100% at 90% 40%, rgba(45,212,191,0.18) 0%, transparent 55%), var(--surface)",
          border: "1px solid var(--border-md)",
          padding: 0,
        }}
      >
        {/* decorative blobs */}
        <div style={{ position: "absolute", top: -40, left: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(16,185,129,0.12)", filter: "blur(40px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -30, right: 60, width: 160, height: 160, borderRadius: "50%", background: "rgba(45,212,191,0.10)", filter: "blur(36px)", pointerEvents: "none" }} />

        <div className="relative z-10 flex flex-col md:flex-row md:items-stretch gap-0" style={{ minHeight: 200 }}>

          {/* в”Ђв”Ђ Left: Streak hero block в”Ђв”Ђ */}
          {progress?.streak && progress.streak > 0 ? (
            <div
              style={{
                flexShrink: 0, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                padding: "24px 32px",
                borderRight: "1px solid var(--border)",
                minWidth: 148,
                background: "rgba(249,115,22,0.06)",
              }}
            >
              {/* Animated SVG flame */}
              <div className="animate-flame-dance" style={{ marginBottom: 6 }}>
                <svg width="44" height="54" viewBox="0 0 44 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 2C22 2 32 14 32 24C32 29.523 27.523 34 22 34C16.477 34 12 29.523 12 24C12 19 15 16 15 16C15 16 14 22 18 24C18 24 17 18 22 12C22 12 20 20 25 22C25 22 28 18 26 12C30 16 34 20 34 28C34 36.837 28.837 44 22 44C15.163 44 10 36.837 10 28C10 20 14 14 14 14C14 14 8 22 8 30C8 30 4 26 4 20C4 12 12 4 22 2Z" fill="url(#flame-grad)" filter="url(#flame-glow)"/>
                  <defs>
                    <linearGradient id="flame-grad" x1="22" y1="2" x2="22" y2="44" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#FBBF24"/>
                      <stop offset="50%" stopColor="#F97316"/>
                      <stop offset="100%" stopColor="#EF4444"/>
                    </linearGradient>
                    <filter id="flame-glow">
                      <feGaussianBlur stdDeviation="1.5" result="blur"/>
                      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                  </defs>
                </svg>
              </div>
              <p
                style={{
                  fontFamily: "var(--font-mono)", fontSize: 52, fontWeight: 800,
                  color: "var(--xp)", lineHeight: 1, letterSpacing: "-0.04em",
                  fontVariantNumeric: "tabular-nums",
                  textShadow: "0 0 32px rgba(245,158,11,0.5)",
                }}
              >
                {progress.streak}
              </p>
              <p style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginTop: 4 }}>
                {t(locale, "home_dayStreak")}
              </p>
              <StreakShields shields={progress.streakShields ?? 0} />
            </div>
          ) : null}

          {/* в”Ђв”Ђ Right: Greeting + XP в”Ђв”Ђ */}
          <div style={{ flex: 1, padding: "24px 28px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <h1 className="serif" style={{ fontSize: "clamp(36px,5vw,56px)", fontWeight: 800, fontStyle: "italic", color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 8, lineHeight: 1.05 }}>
              {langConfig.greeting}, {firstName}. {langConfig.flag}
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 20 }}>
              {progress?.streak && progress.streak > 0
                ? t(locale, "home_streakMessage", { streak: progress.streak.toString() })
                : t(locale, "home_readyMessage", { lang: langConfig.label })}
            </p>

            {/* XP bar */}
            <div style={{ maxWidth: 340 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    fontSize: 11, fontWeight: 700,
                    background: "var(--accent-dim)", color: "var(--accent-2)",
                    border: "1px solid rgba(16,185,129,0.3)",
                    borderRadius: 999, padding: "3px 10px",
                  }}
                >
                  <Zap size={11} />
                  {t(locale, "home_statLevel")} {xpInfo.level}
                </span>
                <span style={{ fontSize: 11, color: "var(--text-3)" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>{xpInfo.current}</span>
                  {" / "}
                  <span style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>{xpInfo.needed}</span>
                  {" XP"}
                </span>
              </div>
              <div className="xp-bar">
                <div className="xp-bar-fill" style={{ width: `${xpInfo.pct}%` }} />
              </div>
            </div>

            {/* Bottom row: total XP pill */}
            <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "var(--accent-dim)", border: "1px solid rgba(16,185,129,0.22)",
                  borderRadius: 999, padding: "5px 12px",
                }}
              >
                <Zap size={13} style={{ color: "var(--accent)" }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "var(--accent-2)", letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
                  {(progress?.xp ?? 0).toLocaleString()}
                </span>
                <span style={{ fontSize: 10, color: "var(--text-3)" }}>{t(locale, "home_totalXp")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* в”Ђв”Ђ Today's Plan в”Ђв”Ђ */}
      <Suspense fallback={null}>
        <TodayPlan targetLang={targetLang} />
      </Suspense>

      {/* в”Ђв”Ђ Bento row: Stats / Daily Goals / Continue Learning в”Ђв”Ђ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Stats 2x2 */}
        <div className="bento p-5" style={{ border: "1px solid var(--border)" }}>
          <p className="section-label mb-3">{t(locale, "home_yourProgress")}</p>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              {
                label: t(locale, "home_wordsSaved"),
                value: savedWordCount,
                icon: <BookMarked size={16} />,
                color: "#60a5fa",
                dim: "rgba(96,165,250,0.12)",
              },
              {
                label: t(locale, "home_storiesDone"),
                value: completedStories,
                icon: <CheckCircle2 size={16} />,
                color: "#22c55e",
                dim: "rgba(34,197,94,0.12)",
              },
              {
                label: t(locale, "home_statLevel"),
                value: `Lv ${xpInfo.level}`,
                icon: <Medal size={16} />,
                color: "var(--accent-2)",
                dim: "var(--accent-dim)",
              },
              {
                label: t(locale, "home_statDayStreak"),
                value: progress?.streak ?? 0,
                icon: <Flame size={16} />,
                color: "#f59e0b",
                dim: "rgba(245,158,11,0.12)",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center justify-center text-center p-3 rounded-xl"
                style={{ background: stat.dim, border: "1px solid rgba(255,255,255,0.05)" }}
              >
                <span
                  className="flex items-center justify-center w-7 h-7 rounded-lg mb-1.5"
                  style={{ background: "rgba(0,0,0,0.18)", color: stat.color }}
                >
                  {stat.icon}
                </span>
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
            <p className="section-label mb-2">{t(locale, "home_continueLearning")}</p>
            {lastStory ? (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{lastStory.story.imageEmoji}</span>
                  <div>
                    <p className="font-bold text-sm leading-snug" style={{ color: "var(--text)" }}>{lastStory.story.title}</p>
                    <p className="text-[11px]" style={{ color: "var(--text-3)" }}>{t(locale, "home_chapterN", { n: lastStory.story.chapter.toString() })}</p>
                  </div>
                </div>
                <p className="text-xs" style={{ color: "var(--text-2)" }}>
                  {lastStory.completed ? t(locale, "home_completedReadAgain") : t(locale, "home_pickUpWhere")}
                </p>
              </>
            ) : (
              <>
                <p className="text-xl font-bold mb-1" style={{ color: "var(--text)" }}>{t(locale, "home_learningPath")}</p>
                <p className="text-sm" style={{ color: "var(--text-2)" }}>{t(locale, "home_startFirstLesson")}</p>
              </>
            )}
          </div>
          <div
            className="self-start mt-3 flex items-center gap-1.5 text-sm font-semibold"
            style={{ color: "var(--accent)" }}
          >
            {lastStory?.completed ? t(locale, "home_readAgain") : t(locale, "home_resume")}
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* в”Ђв”Ђ Quick Actions bento (asymmetric) в”Ђв”Ђ */}
      <div>
        <p className="section-label mb-3">{t(locale, "home_quickActions")}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3" style={{ gridAutoRows: "auto" }}>

          {/* Large card: Continue Story (col-span-2) */}
          <Link
            href="/stories"
            className="game-card col-span-2 group"
            style={{
              background: "var(--gc-teal-bg)",
              borderColor: "var(--gc-teal-border)",
              padding: "1.5rem",
              minHeight: 140,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              textDecoration: "none",
            }}
          >
            <div className="flex items-start justify-between">
              <span style={{ color: "var(--gc-teal-text)", opacity: 0.9 }}>
                <BookOpen size={32} />
              </span>
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
                style={{ color: "var(--gc-teal-muted)" }}
              />
            </div>
            <div>
              <p className="font-bold text-base" style={{ color: "var(--gc-teal-text)" }}>{t(locale, "home_continueStory")}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--gc-teal-muted)" }}>{t(locale, "home_immersiveNarratives", { lang: langConfig.label })}</p>
            </div>
          </Link>

          {/* Games */}
          <Link
            href="/games"
            className="game-card group"
            style={{
              background: "var(--gc-violet-bg)",
              borderColor: "var(--gc-violet-border)",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: 120,
              textDecoration: "none",
            }}
          >
            <span style={{ color: "var(--gc-violet-text)", opacity: 0.9 }}>
              <Gamepad2 size={28} />
            </span>
            <div>
              <p className="font-bold text-sm" style={{ color: "var(--gc-violet-text)" }}>{t(locale, "games_title")}</p>
              <p className="text-[11px]" style={{ color: "var(--gc-violet-muted)" }}>{t(locale, "home_playToLearn")}</p>
            </div>
          </Link>

          {/* AI Tutor */}
          <Link
            href="/tutor"
            className="game-card group"
            style={{
              background: "var(--gc-blue-bg)",
              borderColor: "var(--gc-blue-border)",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: 120,
              textDecoration: "none",
            }}
          >
            <span style={{ color: "var(--gc-blue-text)", opacity: 0.9 }}>
              <MessageSquare size={28} />
            </span>
            <div>
              <p className="font-bold text-sm" style={{ color: "var(--gc-blue-text)" }}>{t(locale, "tutor_title")}</p>
              <p className="text-[11px]" style={{ color: "var(--gc-blue-muted)" }}>{t(locale, "home_conversationalPractice")}</p>
            </div>
          </Link>

          {/* Dictionary */}
          <Link
            href="/dictionary"
            className="game-card group"
            style={{
              background: "var(--gc-blue-bg)",
              borderColor: "var(--gc-blue-border)",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: 120,
              textDecoration: "none",
            }}
          >
            <span style={{ color: "var(--gc-blue-text)", opacity: 0.9 }}>
              <BookMarked size={28} />
            </span>
            <div>
              <p className="font-bold text-sm" style={{ color: "var(--gc-blue-text)" }}>{t(locale, "nav_dictionary")}</p>
              <p className="text-[11px]" style={{ color: "var(--gc-blue-muted)" }}>{t(locale, "home_browseAllWords")}</p>
            </div>
          </Link>

          {/* Review */}
          <Link
            href="/review"
            className="game-card group"
            style={{
              background: "var(--gc-green-bg)",
              borderColor: "var(--gc-green-border)",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: 120,
              textDecoration: "none",
            }}
          >
            <span style={{ color: "var(--gc-green-text)", opacity: 0.9 }}>
              <Brain size={28} />
            </span>
            <div>
              <p className="font-bold text-sm" style={{ color: "var(--gc-green-text)" }}>{t(locale, "review_title")}</p>
              <p className="text-[11px]" style={{ color: "var(--gc-green-muted)" }}>{t(locale, "home_spacedRepetition")}</p>
            </div>
          </Link>

          {/* My Words */}
          <Link
            href="/my-words"
            className="game-card group"
            style={{
              background: "var(--gc-orange-bg)",
              borderColor: "var(--gc-orange-border)",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: 120,
              textDecoration: "none",
            }}
          >
            <span style={{ color: "var(--gc-orange-text)", opacity: 0.9 }}>
              <PenLine size={28} />
            </span>
            <div>
              <p className="font-bold text-sm" style={{ color: "var(--gc-orange-text)" }}>{t(locale, "nav_myWords")}</p>
              <p className="text-[11px]" style={{ color: "var(--gc-orange-muted)" }}>{t(locale, "home_savedVocabulary")}</p>
            </div>
          </Link>
        </div>
      </div>

      {/* в”Ђв”Ђ Bottom row: Word of the Day + Skill Rings в”Ђв”Ђ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Word of the Day */}
        {recentWord ? (
          <div className="bento p-5" style={{ border: "1px solid var(--border)" }}>
            <p className="section-label mb-3">{t(locale, "home_wordOfDay")}</p>
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ background: "var(--accent-dim)", border: "1px solid rgba(16,185,129,0.25)" }}
              >
                {recentWord.imageEmoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold" style={{ color: "var(--text)" }}>{recentWord.word}</p>
                  {/* MED-5: wired up to speak() via client component */}
                  <WordOfDayPlayer word={recentWord.word} ttsLocale={langConfig.ttsLocale ?? targetLang} />
                </div>
                <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--accent-2)" }}>{recentWord.translation}</p>
                <p className="text-xs mt-1 italic truncate" style={{ color: "var(--text-3)" }}>
                  &ldquo;{recentWord.exampleFr}&rdquo;
                </p>
              </div>
            </div>
            <Link
              href={`/dictionary/${recentWord.id}`}
              className="btn-secondary mt-4 inline-flex items-center gap-1.5 text-xs px-4 py-2"
            >
              {t(locale, "home_learnThisWord")} <ArrowRight size={12} />
            </Link>
          </div>
        ) : (
          <div className="bento p-5 flex items-center justify-center" style={{ border: "1px solid var(--border)" }}>
            <p className="text-sm" style={{ color: "var(--text-3)" }}>{t(locale, "home_noWordToday")}</p>
          </div>
        )}

        {/* Skill Rings */}
        <div className="bento p-5" style={{ border: "1px solid var(--border)" }}>
          <p className="section-label mb-4">{t(locale, "home_skillRings")}</p>
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
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: skill.color,
                      }}
                    >
                      {skill.icon}
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

      {/* в”Ђв”Ђ Badges scroll в”Ђв”Ђ */}
      {earnedBadges.length > 0 && (
        <div className="bento p-5" style={{ border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <p className="section-label">{t(locale, "home_badgesEarned")}</p>
            <Link href="/progress" className="text-xs font-semibold flex items-center gap-1" style={{ color: "var(--accent)" }}>
              {t(locale, "home_viewAll")} <ArrowRight size={12} />
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
