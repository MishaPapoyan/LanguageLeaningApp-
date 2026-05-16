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

  const greetHour = new Date().getHours();
  const greetWord = greetHour < 12 ? "Good morning" : greetHour < 19 ? "Good afternoon" : "Good evening";

  return (
    <div className="lv-fade-up">

      {/* Onboarding modal (fires once for new users) */}
      {!onboardingCompleted && (
        <OnboardingModal
          targetLang={targetLang}
          langLabel={langConfig.label}
          langFlag={langConfig.flag}
        />
      )}

      {/* ─── PageHead ─── */}
      <header style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: 40 }}>
        <div className="mono-sm" style={{ color: "var(--ink-3)" }}>
          § Day {streakDays} · {greetWord} {langConfig.flag}
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div style={{ maxWidth: 720 }}>
            <h1 style={{ fontFamily: "var(--display)", fontSize: 56, lineHeight: 1, margin: 0 }}>
              {langConfig.greeting},{" "}
              <em style={{ fontStyle: "italic", color: "var(--terracotta)" }}>{firstName}.</em>
            </h1>
            <p style={{ marginTop: 14, fontSize: 16, color: "var(--ink-3)", lineHeight: 1.5 }}>
              {streakDays > 0
                ? t(locale, "home_streakMessage", { streak: String(streakDays) })
                : t(locale, "home_readyMessage", { lang: langConfig.label })}
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/dictionary" className="lv-btn lv-btn--ghost" style={{ textDecoration: "none" }}>
              <Search size={16} /> Search
            </Link>
            <Link
              href={lastStory ? `/stories/${lastStory.storyId}` : "/learn"}
              className="lv-btn lv-btn--primary"
              style={{ textDecoration: "none" }}
            >
              {t(locale, "home_resume")} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Today's path ─── */}
      <section className="lv-fade-up" style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 16 }}>
          <span className="mono-sm" style={{ color: "var(--ink-3)" }}>Today&apos;s path</span>
          <span className="mono-sm" style={{ color: "var(--ink-3)" }}>Level {xpInfo.level} · {(progress?.xp ?? 0).toLocaleString()} xp earned</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 16 }}>
          {[
            { num: "01", title: t(locale, "home_quickActions"), sub: t(locale, "home_learningPath"), meta: `${xpInfo.current} / ${xpInfo.needed} XP`, status: "done", href: "/learn" },
            { num: "02", title: lastStory ? lastStory.story.title : "Stories", sub: lastStory ? t(locale, "home_pickUpWhere") : t(locale, "home_startFirstLesson"), meta: `${unitPct}%`, status: "now", href: lastStory ? `/stories/${lastStory.storyId}` : "/stories" },
            { num: "03", title: t(locale, "tutor_title"), sub: "AI tutor · speaking practice", meta: `+${xpInfo.needed - xpInfo.current} xp`, status: "next", href: "/tutor" },
          ].map((task) => {
            const done = task.status === "done";
            const now = task.status === "now";
            return (
              <Link
                key={task.num}
                href={task.href}
                className={`lv-card lv-card--hover${now ? " lv-card--ink" : ""}`}
                style={{ textDecoration: "none", position: "relative", overflow: "hidden" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                  <span className="mono-sm" style={{ color: now ? "var(--paper-3)" : "var(--ink-3)" }}>{task.num}</span>
                  {done && (
                    <span style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--lime)", color: "var(--ink)", display: "grid", placeItems: "center" }}>
                      <Zap size={14} />
                    </span>
                  )}
                  {now && <span className="lv-sticker" style={{ color: "var(--lime)", transform: "rotate(3deg)" }}>In progress</span>}
                  {!done && !now && <span className="mono-sm" style={{ color: "var(--ink-3)" }}>Up next</span>}
                </div>
                <div style={{ fontFamily: "var(--display)", fontSize: 26, lineHeight: 1.1, marginBottom: 6 }}>{task.title}</div>
                <div style={{ fontSize: 13.5, opacity: 0.7, marginBottom: 16 }}>{task.sub}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="mono-sm" style={{ color: now ? "var(--paper-3)" : "var(--ink-3)" }}>· {task.meta}</span>
                  <ArrowRight size={16} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─── Stats row ─── */}
      <section className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 16, marginBottom: 40 }}>
        {/* Level */}
        <div className="lv-card" style={{ padding: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <div>
              <span className="mono-sm" style={{ color: "var(--ink-3)" }}>{t(locale, "home_statLevel")}</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 6 }}>
                <span style={{ fontFamily: "var(--display)", fontSize: 72, lineHeight: 1 }}>{xpInfo.level}</span>
              </div>
            </div>
            <span className="lv-sticker" style={{ color: "var(--terracotta)", transform: "rotate(-3deg)" }}>
              {savedWordCount} {t(locale, "home_wordsSaved")}
            </span>
          </div>
          <div className="lv-progress lv-progress--terra">
            <span style={{ width: `${xpProgressPct}%` }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
            <span className="mono-sm" style={{ color: "var(--ink-3)" }}>{(progress?.xp ?? 0).toLocaleString()} xp</span>
            <span className="mono-sm" style={{ color: "var(--ink-3)" }}>{xpInfo.needed - xpInfo.current} to level {xpInfo.level + 1}</span>
          </div>
        </div>

        {/* Streak */}
        <div className="lv-card" style={{ background: "var(--terracotta)", color: "var(--paper)", borderColor: "var(--terracotta)", padding: 28 }}>
          <span className="mono-sm" style={{ color: "var(--paper)", opacity: 0.8 }}>{t(locale, "home_statDayStreak")}</span>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6, marginBottom: 12 }}>
            <Flame size={36} />
            <span style={{ fontFamily: "var(--display)", fontSize: 72, lineHeight: 1 }}>{streakDays}</span>
          </div>
          <span className="mono-sm" style={{ color: "var(--paper)", opacity: 0.8 }}>days streak</span>
          <div style={{ display: "flex", gap: 4, marginTop: 18 }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < (streakDays % 7 || (streakDays > 0 ? 7 : 0)) ? "var(--paper)" : "rgba(255,255,255,0.3)" }} />
            ))}
          </div>
        </div>

        {/* Word of the day */}
        {recentWord ? (
          <div className="lv-card" style={{ padding: 28, position: "relative", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span className="mono-sm" style={{ color: "var(--ink-3)" }}>{t(locale, "home_wordOfDay")}</span>
              <WordOfDayPlayer word={recentWord.word} ttsLocale={langConfig.ttsLocale ?? targetLang} />
            </div>
            <div style={{ fontFamily: "var(--display)", fontSize: 40, lineHeight: 1, marginTop: 10, marginBottom: 8 }}>
              {recentWord.word}
            </div>
            <div style={{ fontSize: 14, color: "var(--ink-2)", marginBottom: 6 }}>
              &ldquo;{recentWord.translation}&rdquo;
            </div>
            {recentWord.exampleFr && (
              <div style={{ fontSize: 13, fontStyle: "italic", color: "var(--ink-3)", marginBottom: 14 }}>
                {recentWord.exampleFr}
              </div>
            )}
            <Link href={`/dictionary/${recentWord.id}`} className="lv-btn lv-btn--ghost lv-btn--sm" style={{ textDecoration: "none", marginTop: 8 }}>
              {t(locale, "home_learnThisWord")}
            </Link>
          </div>
        ) : (
          <div className="lv-card" style={{ padding: 28 }}>
            <span className="mono-sm" style={{ color: "var(--ink-3)" }}>{t(locale, "home_wordOfDay")}</span>
          </div>
        )}
      </section>

      {/* ─── Skill compass + Quick actions ─── */}
      <section className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: 16, marginBottom: 40 }}>
        <Link href="/progress" className="lv-card lv-card--hover lg:col-span-2" style={{ padding: 28, textDecoration: "none", display: "block" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 }}>
            <div>
              <span className="mono-sm" style={{ color: "var(--ink-3)" }}>Skill compass</span>
              <div style={{ fontFamily: "var(--display)", fontSize: 28, marginTop: 4 }}>This week&apos;s tuning</div>
            </div>
            <span className="lv-btn lv-btn--ghost lv-btn--sm">See progress <ArrowRight size={14} /></span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 16 }}>
            {rings.map((s) => {
              const colorMap: Record<string, string> = {
                emerald: "var(--terracotta)",
                blue: "var(--marine)",
                purple: "var(--lime)",
                rose: "var(--gold)",
              };
              const stroke = colorMap[s.color] ?? "var(--terracotta)";
              const r = 34;
              const dash = 2 * Math.PI * r;
              const offset = dash - (dash * Math.max(s.val, 0)) / 100;
              return (
                <div key={s.skill} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                  <div style={{ position: "relative", width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg className="-rotate-90" style={{ width: "100%", height: "100%" }}>
                      <circle cx="40" cy="40" r={r} stroke="var(--line)" strokeWidth="6" fill="transparent" />
                      <circle
                        cx="40"
                        cy="40"
                        r={r}
                        stroke={stroke}
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray={dash}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 1s ease" }}
                      />
                    </svg>
                    <span className="mono-sm" style={{ position: "absolute", fontSize: 14, color: "var(--ink)" }}>
                      {s.val}%
                    </span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, textAlign: "center" }}>{s.skill}</span>
                </div>
              );
            })}
          </div>
        </Link>

        <div className="lv-card" style={{ padding: 28 }}>
          <span className="mono-sm" style={{ color: "var(--ink-3)" }}>Jump in</span>
          <div style={{ fontFamily: "var(--display)", fontSize: 28, marginTop: 4, marginBottom: 18 }}>
            {t(locale, "home_quickActions")}
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "12px 14px",
                    borderRadius: 12,
                    textDecoration: "none",
                    color: "var(--ink)",
                    border: "1px solid var(--line)",
                  }}
                >
                  <span style={{ width: 36, height: 36, borderRadius: 10, background: "var(--paper-2)", display: "grid", placeItems: "center" }}>
                    <Icon size={16} />
                  </span>
                  <span style={{ flex: 1 }}>
                    <span style={{ display: "block", fontWeight: 500, fontSize: 14 }}>{action.label}</span>
                    <span className="mono-sm" style={{ color: "var(--ink-3)" }}>{action.desc}</span>
                  </span>
                  <ArrowRight size={14} />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Daily curriculum ─── */}
      <section style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <span className="mono-sm" style={{ color: "var(--ink-3)" }}>Today&apos;s plan</span>
            <div style={{ fontFamily: "var(--display)", fontSize: 36, marginTop: 4 }}>Daily curriculum</div>
          </div>
          <DailyGoals />
        </div>
        <Suspense fallback={null}>
          <TodayPlan targetLang={targetLang} />
        </Suspense>
      </section>

      {/* ─── Recommended games + leaderboard ─── */}
      <section className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: 16, marginBottom: 40 }}>
        <div className="lv-card lg:col-span-2" style={{ padding: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 }}>
            <div>
              <span className="mono-sm" style={{ color: "var(--ink-3)" }}>Recommended for you</span>
              <div style={{ fontFamily: "var(--display)", fontSize: 28, marginTop: 4 }}>Games we picked</div>
            </div>
            <Link href="/games" className="lv-btn lv-btn--ghost lv-btn--sm" style={{ textDecoration: "none" }}>
              Games Hub <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 12 }}>
            {recommended.map((game) => {
              const toneMap: Record<string, { bg: string; fg: string }> = {
                blue: { bg: "var(--marine-soft)", fg: "var(--marine)" },
                purple: { bg: "var(--lime)", fg: "var(--ink)" },
                emerald: { bg: "var(--terracotta-soft)", fg: "var(--terracotta)" },
                amber: { bg: "var(--paper-2)", fg: "var(--gold)" },
              };
              const tone = toneMap[game.color] ?? toneMap.emerald;
              return (
                <Link
                  key={game.title}
                  href={game.href}
                  style={{ textDecoration: "none", color: "var(--ink)", border: "1px solid var(--line)", borderRadius: 14, padding: 16, display: "block" }}
                >
                  <span style={{ width: 44, height: 44, borderRadius: 11, background: tone.bg, color: tone.fg, display: "grid", placeItems: "center", marginBottom: 12 }}>
                    <Gamepad2 size={20} />
                  </span>
                  <div className="mono-sm" style={{ color: "var(--ink-3)" }}>{game.category} · {game.mode}</div>
                  <div style={{ fontFamily: "var(--display)", fontSize: 22, lineHeight: 1.1, margin: "4px 0 8px" }}>{game.title}</div>
                  <div className="mono-sm" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--ink-3)" }}>
                    <Play size={12} fill="currentColor" /> Play
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="lv-card" style={{ padding: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
            <div>
              <span className="mono-sm" style={{ color: "var(--ink-3)" }}>Weekly pulse</span>
              <div style={{ fontFamily: "var(--display)", fontSize: 24, marginTop: 4 }}>Top this week</div>
            </div>
            <Link href="/leaderboard" className="lv-btn lv-btn--ghost lv-btn--sm" style={{ textDecoration: "none" }}>
              Full
            </Link>
          </div>
          {topLeaders.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {topLeaders.slice(0, 4).map((p, idx) => {
                const isYou = p.name === session?.user?.name;
                return (
                  <div
                    key={`${p.name}-${idx}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 12px",
                      borderRadius: 10,
                      background: isYou ? "var(--paper-2)" : "transparent",
                    }}
                  >
                    <span className="mono-sm" style={{ width: 22, color: idx === 0 ? "var(--gold)" : "var(--ink-3)" }}>{idx + 1}</span>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--paper-3)", border: "1px solid var(--line)", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 600 }}>
                      {(p.name ?? "?")[0]}
                    </div>
                    <span style={{ flex: 1, fontWeight: isYou ? 600 : 400, fontSize: 13.5 }}>
                      {isYou ? "You" : p.name}
                    </span>
                    <span className="mono-sm" style={{ color: "var(--ink-3)", fontVariantNumeric: "tabular-nums" }}>{p.xp.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mono-sm" style={{ color: "var(--ink-3)" }}>No leaders yet</p>
          )}
        </div>
      </section>

      {/* ─── Passport / badges ─── */}
      {earnedBadges.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
            <div>
              <span className="mono-sm" style={{ color: "var(--ink-3)" }}>Stamps · {earnedBadges.length} {t(locale, "home_badgesEarned")}</span>
              <div style={{ fontFamily: "var(--display)", fontSize: 36, marginTop: 4 }}>Your passport</div>
            </div>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8" style={{ gap: 12 }}>
            {earnedBadges.slice(0, 8).map((b) => (
              <div
                key={b.id}
                className="lv-card"
                style={{ aspectRatio: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, padding: 8 }}
              >
                <span style={{ fontSize: 28 }}>{b.emoji}</span>
                <span className="mono-sm" style={{ fontSize: 9, textAlign: "center", color: "var(--ink-3)" }}>{b.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Stories summary (kept) */}
      {completedStories > 0 && (
        <div className="lv-card" style={{ padding: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <BookOpen size={20} style={{ color: "var(--terracotta)" }} />
            <p style={{ fontSize: 14, color: "var(--ink-2)" }}>
              {completedStories} {t(locale, "home_storiesDone")}
            </p>
          </div>
          <Link href="/stories" className="mono-sm" style={{ color: "var(--terracotta)" }}>
            {t(locale, "home_viewAll")}
          </Link>
        </div>
      )}
    </div>
  );
}
