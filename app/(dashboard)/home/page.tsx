export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { t, getLocale } from "@/lib/i18n";
import { getLanguageConfig } from "@/data/language-config";
import Link from "next/link";
import { getXpProgress } from "@/types";
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
  Zap,
  ArrowRight,
  Volume2,
} from "lucide-react";

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

  let progress = null, recentWord = null, lastStory = null;

  if (userId) {
    try {
      [progress, recentWord, lastStory] = await Promise.all([
        prisma.progress.findUnique({ where: { userId } }),
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
    } catch (err) {
      console.error("[home] DB error:", err);
    }
  } else {
    try {
      recentWord = await prisma.word.findFirst({
        skip: dayIndex,
        orderBy: { id: "asc" },
        select: { id: true, word: true, translation: true, exampleFr: true, imageEmoji: true },
      });
    } catch (err) {
      console.error("[home] DB error:", err);
    }
  }

  const xpInfo = progress ? getXpProgress(progress.xp) : { level: 1, current: 0, needed: 100, pct: 0 };
  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  const quickActions = [
    {
      href: "/stories",
      icon: <BookOpen size={22} />,
      label: t(locale, "home_continueStory"),
      sub: t(locale, "home_immersiveNarratives", { lang: langConfig.label }),
      bg: "var(--gc-teal-bg)", border: "var(--gc-teal-border)",
      text: "var(--gc-teal-text)", muted: "var(--gc-teal-muted)",
    },
    {
      href: "/games",
      icon: <Gamepad2 size={22} />,
      label: t(locale, "games_title"),
      sub: t(locale, "home_playToLearn"),
      bg: "var(--gc-violet-bg)", border: "var(--gc-violet-border)",
      text: "var(--gc-violet-text)", muted: "var(--gc-violet-muted)",
    },
    {
      href: "/tutor",
      icon: <MessageSquare size={22} />,
      label: t(locale, "tutor_title"),
      sub: t(locale, "home_conversationalPractice"),
      bg: "var(--gc-blue-bg)", border: "var(--gc-blue-border)",
      text: "var(--gc-blue-text)", muted: "var(--gc-blue-muted)",
    },
    {
      href: "/dictionary",
      icon: <BookMarked size={22} />,
      label: t(locale, "nav_dictionary"),
      sub: t(locale, "home_browseAllWords"),
      bg: "var(--gc-blue-bg)", border: "var(--gc-blue-border)",
      text: "var(--gc-blue-text)", muted: "var(--gc-blue-muted)",
    },
    {
      href: "/review",
      icon: <Brain size={22} />,
      label: t(locale, "review_title"),
      sub: t(locale, "home_spacedRepetition"),
      bg: "var(--gc-green-bg)", border: "var(--gc-green-border)",
      text: "var(--gc-green-text)", muted: "var(--gc-green-muted)",
    },
    {
      href: "/my-words",
      icon: <PenLine size={22} />,
      label: t(locale, "nav_myWords"),
      sub: t(locale, "home_savedVocabulary"),
      bg: "var(--gc-orange-bg)", border: "var(--gc-orange-border)",
      text: "var(--gc-orange-text)", muted: "var(--gc-orange-muted)",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-fade-up">

      {/* ── Top strip: greeting + streak + XP ── */}
      <div
        className="bento"
        style={{
          padding: "16px 20px",
          border: "1px solid var(--border-md)",
          background: "radial-gradient(ellipse 80% 150% at 0% 50%, rgba(99,102,241,0.15) 0%, transparent 55%), var(--surface)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>

          {/* Greeting */}
          <div style={{ flex: 1, minWidth: 140 }}>
            <h1 style={{
              fontSize: 20, fontWeight: 800, color: "var(--text)",
              fontFamily: "var(--font-display)", letterSpacing: "-0.02em", lineHeight: 1.2,
            }}>
              {langConfig.greeting}, {firstName}! {langConfig.flag}
            </h1>
            <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 3 }}>
              {langConfig.label}
            </p>
          </div>

          {/* Streak pill */}
          {progress?.streak && progress.streak > 0 ? (
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "rgba(249,115,22,0.10)", border: "1px solid rgba(249,115,22,0.25)",
              borderRadius: 999, padding: "6px 14px",
            }}>
              <Flame size={15} style={{ color: "#f97316" }} />
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 800,
                color: "#f97316", fontVariantNumeric: "tabular-nums",
              }}>
                {progress.streak}
              </span>
            </div>
          ) : null}

          {/* XP level + bar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 130 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                fontSize: 11, fontWeight: 700,
                background: "var(--accent-dim)", color: "var(--accent-2)",
                border: "1px solid rgba(99,102,241,0.3)",
                borderRadius: 999, padding: "2px 8px",
              }}>
                <Zap size={10} /> {t(locale, "home_statLevel")} {xpInfo.level}
              </span>
              <span style={{
                fontSize: 10, color: "var(--text-3)",
                fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums",
              }}>
                {xpInfo.current} XP
              </span>
            </div>
            <div className="xp-bar">
              <div className="xp-bar-fill" style={{ width: `${xpInfo.pct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Today's Plan (hero) ── */}
      <DailyGoals />

      {/* ── Continue Learning ── */}
      <Link
        href={lastStory ? `/stories/${lastStory.storyId}` : "/stories"}
        className="bento group transition-all duration-200"
        style={{
          padding: "16px 20px",
          border: "1px solid var(--border)",
          display: "flex", alignItems: "center", gap: 16,
          textDecoration: "none",
        }}
      >
        <div style={{ flexShrink: 0 }}>
          {lastStory ? (
            <span style={{ fontSize: 40, lineHeight: 1 }}>{lastStory.story.imageEmoji}</span>
          ) : (
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: "var(--accent-dim)", border: "1px solid rgba(99,102,241,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <BookOpen size={20} style={{ color: "var(--accent-2)" }} />
            </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: 10, color: "var(--text-3)",
            textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 3,
          }}>
            {t(locale, "home_continueLearning")}
          </p>
          {lastStory ? (
            <>
              <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", lineHeight: 1.3 }}>
                {lastStory.story.title}
              </p>
              <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>
                {t(locale, "home_chapterN", { n: lastStory.story.chapter.toString() })}
                {" · "}
                {lastStory.completed ? t(locale, "home_completedReadAgain") : t(locale, "home_pickUpWhere")}
              </p>
            </>
          ) : (
            <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>
              {t(locale, "home_startFirstLesson")}
            </p>
          )}
        </div>

        <ArrowRight
          size={18}
          className="group-hover:translate-x-1 transition-transform"
          style={{ color: "var(--accent)", flexShrink: 0 }}
        />
      </Link>

      {/* ── Explore grid ── */}
      <div>
        <p className="section-label mb-3">{t(locale, "home_quickActions")}</p>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="game-card group"
              style={{
                background: action.bg,
                borderColor: action.border,
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: 108,
                textDecoration: "none",
              }}
            >
              <span style={{ color: action.text, opacity: 0.9 }}>{action.icon}</span>
              <div>
                <p style={{ fontWeight: 700, fontSize: 13, color: action.text, lineHeight: 1.3 }}>
                  {action.label}
                </p>
                <p style={{ fontSize: 11, color: action.muted, marginTop: 2, lineHeight: 1.3 }}>
                  {action.sub}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Word of the Day ── */}
      {recentWord && (
        <div
          className="bento"
          style={{ padding: "16px 20px", border: "1px solid var(--border)" }}
        >
          <p className="section-label mb-3">{t(locale, "home_wordOfDay")}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16, flexShrink: 0,
              background: "var(--accent-dim)", border: "1px solid rgba(99,102,241,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
            }}>
              {recentWord.imageEmoji}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <p style={{
                  fontSize: 18, fontWeight: 800, color: "var(--text)",
                  fontFamily: "var(--font-display)", letterSpacing: "-0.01em",
                }}>
                  {recentWord.word}
                </p>
                <button
                  aria-label="Listen"
                  style={{ color: "var(--text-3)", background: "transparent", border: "none", cursor: "pointer", padding: 4, display: "flex" }}
                >
                  <Volume2 size={13} />
                </button>
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--accent-2)", marginTop: 2 }}>
                {recentWord.translation}
              </p>
              <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 3, fontStyle: "italic" }}>
                &ldquo;{recentWord.exampleFr}&rdquo;
              </p>
            </div>
            <Link
              href={`/dictionary/${recentWord.id}`}
              style={{
                flexShrink: 0, fontSize: 12, fontWeight: 600, color: "var(--accent-2)",
                display: "flex", alignItems: "center", gap: 4, textDecoration: "none",
              }}
            >
              {t(locale, "home_learnThisWord")} <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
