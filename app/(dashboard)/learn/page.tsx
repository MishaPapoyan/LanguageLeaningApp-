"use client";

import { LEARNING_PATH_META } from "@/data/learning-path-meta";
import { LEARNING_PATH_META_ES } from "@/data/learning-path-es-meta";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { t, getLocale } from "@/lib/i18n";

const typeColors: Record<string, string> = {
  alphabet:     "var(--gold)",
  pronunciation:"var(--coral)",
  vocabulary:   "var(--blue)",
  grammar:      "var(--accent-2)",
  conversation: "var(--green)",
  culture:      "var(--teal)",
};

const difficultyMap: Record<string, string> = {
  alphabet:     "beginner",
  pronunciation:"beginner",
  vocabulary:   "intermediate",
  grammar:      "intermediate",
  conversation: "advanced",
  culture:      "advanced",
};

// Label keys map to i18n learn_* keys
const LABEL_KEY_MAP: Record<string, string> = {
  chapter: "learn_chapter",
  lessonsComplete: "learn_lessonsComplete",
  chapters: "learn_chapters",
  done: "learn_done",
  completed: "learn_completed",
  upNext: "learn_upNext",
  locked: "learn_locked",
  beginner: "learn_beginner",
  intermediate: "learn_intermediate",
  advanced: "learn_advanced",
  alphabet: "learn_alphabet",
  pronunciation: "learn_pronunciation",
  vocabulary: "learn_vocabulary",
  grammar: "learn_grammar",
  conversation: "learn_conversation",
  culture: "learn_culture",
};

export default function LearnPage() {
  const { data: session } = useSession();
  const targetLang = session?.user?.targetLanguage ?? "fr";
  const locale = getLocale((session?.user as any)?.nativeLanguage);
  const lbl = (key: string) => t(locale, LABEL_KEY_MAP[key] as any);
  const LEARNING_PATH = targetLang === "es" ? LEARNING_PATH_META_ES : LEARNING_PATH_META;
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(`completedLessons_${targetLang}`);
    if (saved) setCompletedLessons(JSON.parse(saved));
  }, [targetLang]);

  const isTopicUnlocked = (topic: (typeof LEARNING_PATH)[number]) => {
    if (!topic.requiredTopicId) return true;
    const requiredTopic = LEARNING_PATH.find((t) => t.id === topic.requiredTopicId);
    if (!requiredTopic) return true;
    return requiredTopic.lessons.every((l) => completedLessons.includes(l.id));
  };

  const getTopicProgress = (topic: (typeof LEARNING_PATH)[number]) => {
    const done = topic.lessons.filter((l) => completedLessons.includes(l.id)).length;
    return { done, total: topic.lessons.length, pct: Math.round((done / topic.lessons.length) * 100) };
  };

  const totalLessons = LEARNING_PATH.reduce((sum, t) => sum + t.lessons.length, 0);
  const overallPct = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;
  const circumference = 2 * Math.PI * 20;

  return (
    <div style={{ maxWidth: 720 }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.5px", marginBottom: 4 }}>
          Learn
        </h1>
        <p style={{ color: "var(--text-2)", fontSize: 14 }}>
          Work through lessons at your own pace. Complete a chapter to unlock the next.
        </p>
      </div>

      {/* ── Progress Overview ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16,
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 16, padding: "16px 20px", marginBottom: 28,
      }}>
        {/* Ring */}
        <div style={{ position: "relative", width: 52, height: 52, flexShrink: 0 }}>
          <svg width="52" height="52" viewBox="0 0 52 52" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="26" cy="26" r="20" fill="none" stroke="var(--surface-3)" strokeWidth="4" />
            <circle
              cx="26" cy="26" r="20" fill="none"
              stroke="var(--accent)" strokeWidth="4" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (overallPct / 100) * circumference}
              style={{ transition: "stroke-dashoffset 0.8s ease" }}
            />
          </svg>
          <span style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 11, fontWeight: 700, color: "var(--accent-2)",
          }}>
            {overallPct}%
          </span>
        </div>
        {/* Text */}
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
            {completedLessons.length} / {totalLessons} {lbl("lessonsComplete")}
          </p>
          <div style={{ height: 6, background: "var(--surface-3)", borderRadius: 99, overflow: "hidden" }}>
            <div className="xp-bar-fill" style={{
              height: "100%", borderRadius: 99,
              width: `${Math.max(overallPct, 1)}%`,
              transition: "width 0.8s ease",
            }} />
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <span className="badge-accent" style={{ fontSize: 11 }}>
            {LEARNING_PATH.length} {lbl("chapters")}
          </span>
        </div>
      </div>

      {/* ── Chapter Groups ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {LEARNING_PATH.map((topic, chapterIndex) => {
          const unlocked = isTopicUnlocked(topic);
          const progress = getTopicProgress(topic);
          const isComplete = progress.pct === 100;

          return (
            <div key={topic.id}>
              {/* Chapter Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {lbl("chapter")} {chapterIndex + 1}
                  </span>
                  <span style={{ fontSize: 18 }}>{topic.emoji}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: isComplete ? "var(--green)" : unlocked ? "var(--text)" : "var(--text-3)" }}>
                    {topic.title}
                  </span>
                  {isComplete && (
                    <span className="badge-green" style={{ fontSize: 10 }}>{lbl("done")}</span>
                  )}
                  {!unlocked && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: "var(--text-3)",
                      background: "var(--surface-3)", borderRadius: 99,
                      padding: "2px 8px", letterSpacing: "0.06em", textTransform: "uppercase",
                    }}>{lbl("locked")}</span>
                  )}
                </div>
                <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                <span style={{ fontSize: 11, color: "var(--text-3)", flexShrink: 0, fontWeight: 600 }}>
                  {progress.done}/{progress.total}
                </span>
              </div>

              {/* Chapter topic progress bar */}
              {unlocked && progress.done > 0 && progress.pct < 100 && (
                <div style={{ height: 3, background: "var(--surface-3)", borderRadius: 99, marginBottom: 10, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", background: "var(--accent)", borderRadius: 99,
                    width: `${progress.pct}%`, transition: "width 0.6s ease",
                  }} />
                </div>
              )}

              {/* Lesson Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {topic.lessons.map((lesson, lessonIndex) => {
                  const done = completedLessons.includes(lesson.id);
                  const isLocked = !unlocked;
                  const lessonColor = typeColors[lesson.type] || "var(--accent)";
                  const diffKey = difficultyMap[lesson.type] || "beginner";
                  const isStarted = !done && !isLocked && lessonIndex === topic.lessons.findIndex((l) => !completedLessons.includes(l.id));

                  return (
                    <Link
                      key={lesson.id}
                      href={isLocked ? "#" : `/learn/${lesson.id}`}
                      onClick={isLocked ? (e) => e.preventDefault() : undefined}
                      style={{
                        display: "flex", alignItems: "center", gap: 14,
                        background: isStarted ? "var(--accent-dim)" : "var(--surface)",
                        border: `1px solid ${isStarted ? "rgba(99,102,241,0.25)" : "var(--border)"}`,
                        borderRadius: 14, padding: "12px 16px",
                        textDecoration: "none",
                        opacity: isLocked ? 0.4 : 1,
                        transition: "border-color 0.15s, background 0.15s",
                        cursor: isLocked ? "not-allowed" : "pointer",
                      }}
                      className={isLocked ? "" : "card-hover"}
                    >
                      {/* Icon */}
                      <div style={{
                        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: done ? "var(--green-dim)" : `${lessonColor}18`,
                        fontSize: 18,
                      }}>
                        {isLocked
                          ? <svg width="16" height="16" fill="none" stroke="var(--text-3)" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                          : done
                            ? <svg width="16" height="16" fill="none" stroke="var(--green)" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                            : lesson.emoji
                        }
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2, flexWrap: "wrap" }}>
                          <span style={{
                            fontSize: 14, fontWeight: 600,
                            color: done ? "var(--text-3)" : "var(--text)",
                            textDecoration: done ? "line-through" : "none",
                          }}>
                            {lesson.title}
                          </span>
                          {done && (
                            <span className="badge-green" style={{ fontSize: 10 }}>{lbl("completed")}</span>
                          )}
                          {isStarted && !done && (
                            <span className="badge-accent" style={{ fontSize: 10 }}>{lbl("upNext")}</span>
                          )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span className={`diff-${diffKey}`} style={{ fontSize: 10 }}>
                            {lbl(diffKey)}
                          </span>
                          <span style={{ fontSize: 11, color: "var(--text-3)" }}>·</span>
                          <span style={{ fontSize: 11, color: "var(--text-3)" }}>{lbl(lesson.type)}</span>
                        </div>
                      </div>

                      {/* XP badge */}
                      <div style={{
                        display: "flex", flexDirection: "column", alignItems: "flex-end",
                        gap: 4, flexShrink: 0,
                      }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700,
                          color: done ? "var(--text-3)" : "var(--gold)",
                          background: done ? "var(--surface-3)" : "var(--gold-dim)",
                          borderRadius: 99, padding: "2px 8px",
                        }}>
                          +10 XP
                        </span>
                        {!isLocked && !done && (
                          <svg width="14" height="14" fill="none" stroke="var(--text-3)" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
