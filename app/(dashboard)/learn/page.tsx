"use client";

import { LEARNING_PATH_META } from "@/data/learning-path-meta";
import { LEARNING_PATH_META_ES } from "@/data/learning-path-es-meta";
import { LEARNING_PATH_META_EN } from "@/data/learning-path-en-meta";
import Link from "next/link";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { t, getLocale, type Locale, type TranslationKey } from "@/lib/i18n";
import { Lock, Check, ChevronRight, Star } from "lucide-react";

// ── phases ───────────────────────────────────────────────────────────────
const FR_PHASES: { labelKey: TranslationKey; emoji: string; ids: string[] }[] = [
  { labelKey: "learn_phase1",   emoji: "🌱", ids: ["alphabet","pronunciation","greetings","numbers","essentials"] },
  { labelKey: "learn_phase2",   emoji: "⚙️", ids: ["articles-gender","subject-pronouns","avoir-verb","present-tense","adjectives","negation","questions"] },
  { labelKey: "learn_phase3Fr", emoji: "🌍", ids: ["food-drinks","directions-places","time-days","past-tense","future-plans"] },
];
const ES_PHASES: { labelKey: TranslationKey; emoji: string; ids: string[] }[] = [
  { labelKey: "learn_phase1",   emoji: "🌱", ids: ["alphabet","pronunciation","greetings","numbers","essentials"] },
  { labelKey: "learn_phase2",   emoji: "⚙️", ids: ["articles-gender","subject-pronouns","tener-verb","present-tense","adjectives","negation","questions"] },
  { labelKey: "learn_phase3Es", emoji: "🌍", ids: ["food-drinks","directions-places","time-days","past-tense","future-plans"] },
];
const EN_PHASES: { labelKey: TranslationKey; emoji: string; ids: string[] }[] = [
  { labelKey: "learn_phase1",   emoji: "🌱", ids: ["alphabet","pronunciation","greetings","numbers","essentials"] },
  { labelKey: "learn_phase2",   emoji: "⚙️", ids: ["articles","pronouns-be","have-do","present-simple","adjectives","negation","questions"] },
  { labelKey: "learn_phase3En", emoji: "🌍", ids: ["food-drinks","directions","time-days","past-simple","future"] },
];

// ── prize definitions ────────────────────────────────────────────────────
const CHAPTER_PRIZES = [10, 15, 20, 25];
const PHASE_PRIZES   = [150, 250, 400];
const COURSE_PRIZE   = 1000;

type ModalKind = "chapter" | "phase" | "course";
interface CelebModal {
  kind: ModalKind;
  title: string;
  subtitle: string;
  emoji: string;
  xp: number;
  phaseLabel?: string;
}

function CelebrationModal({ modal, onClose, locale }: { modal: CelebModal; onClose: () => void; locale: Locale }) {
  const tone =
    modal.kind === "course" ? "var(--lime-2)" :
    modal.kind === "phase"  ? "var(--marine)" :
    "var(--terracotta)";
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 999,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "oklch(0.17 0.018 60 / 0.55)", backdropFilter: "blur(6px)",
        animation: "lv-fade-up 0.24s ease",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="lv-card lv-pop"
        style={{
          padding: "40px 32px",
          maxWidth: 420,
          width: "90%",
          textAlign: "center",
          boxShadow: "var(--sh-3)",
          borderColor: tone,
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <span className="lv-stamp" style={{ color: tone, transform: "rotate(-3deg)" }}>
            {modal.kind === "course" ? t(locale, "learn_stampCourse") : modal.kind === "phase" ? t(locale, "learn_stampPhase", { phase: modal.phaseLabel ?? "" }) : t(locale, "learn_stampChapter")}
          </span>
        </div>
        <div style={{ fontSize: 64, marginBottom: 12, lineHeight: 1 }}>{modal.emoji}</div>
        <h2 className="serif-i" style={{ fontFamily: "var(--display)", fontSize: 38, lineHeight: 1.05, letterSpacing: "-0.02em", margin: "0 0 10px" }}>
          {modal.title}
        </h2>
        <p style={{ fontSize: 15, color: "var(--ink-3)", margin: "0 0 28px", lineHeight: 1.55 }}>{modal.subtitle}</p>
        <div
          className="lv-sticker"
          style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "12px 24px", marginBottom: 28, color: "var(--terracotta)",
          }}
        >
          <span style={{ fontSize: 18 }}>⚡</span>
          <span className="mono" style={{ fontSize: 22, fontWeight: 700, color: "var(--terracotta)", letterSpacing: 0 }}>+{modal.xp} XP</span>
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{t(locale, "learn_reward")}</span>
        </div>
        <button onClick={onClose} className="lv-btn lv-btn--primary lv-btn--lg" style={{ width: "100%", justifyContent: "center" }}>
          {modal.kind === "course" ? t(locale, "learn_viewCertificate") : t(locale, "onb_continue")}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ── topic node ───────────────────────────────────────────────────────────
type TopicNodeData = {
  id: string;
  title: string;
  emoji: string;
  description?: string;
  lessonsCount: number;
  firstLessonId?: string;
  isUnlocked: boolean;
  isCompleted: boolean;
  doneCount: number;
};

function TopicNode({ topic, topicIndex }: { topic: TopicNodeData; topicIndex: number }) {
  const isLocked = !topic.isUnlocked;
  const isCompleted = topic.isCompleted;
  const isInProgress = !isLocked && !isCompleted && topic.doneCount > 0;

  const ring =
    isLocked      ? { bg: "var(--paper-2)", fg: "var(--ink-4)", border: "var(--line-2)", glow: "none" } :
    isCompleted   ? { bg: "var(--ink)", fg: "var(--paper)", border: "var(--ink)", glow: "0 0 0 6px var(--success-soft)" } :
    isInProgress  ? { bg: "var(--terracotta)", fg: "white", border: "var(--terracotta)", glow: "0 0 0 6px oklch(0.66 0.17 42 / 0.15)" } :
                    { bg: "var(--paper)", fg: "var(--ink)", border: "var(--line-2)", glow: "none" };

  const node = (
    <div
      className="lv-card"
      style={{
        width: 96, height: 96, borderRadius: "50%", padding: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", zIndex: 10,
        background: ring.bg, color: ring.fg,
        border: `2px solid ${ring.border}`,
        boxShadow: ring.glow,
        transition: "transform 200ms var(--ease-spring)",
        cursor: isLocked ? "not-allowed" : "pointer",
      }}
      onMouseEnter={e => !isLocked && (e.currentTarget.style.transform = "scale(1.08)")}
      onMouseLeave={e => (e.currentTarget.style.transform = "")}
    >
      {isLocked ? (
        <Lock size={26} style={{ color: "var(--ink-4)" }} />
      ) : isCompleted ? (
        <Check size={32} strokeWidth={3} />
      ) : isInProgress ? (
        <Star size={30} strokeWidth={2} fill="currentColor" />
      ) : (
        <span style={{ fontSize: 30 }}>{topic.emoji}</span>
      )}

      {/* Hover tooltip */}
      <div
        className="lv-card"
        style={{
          position: "absolute", left: 128, width: 256, top: "50%",
          transform: "translateY(-50%)", textAlign: "left",
          visibility: "hidden", opacity: 0, transition: "opacity 160ms",
          pointerEvents: "none", padding: 16, zIndex: 20,
        }}
        data-tooltip
      >
        <p className="mono" style={{ fontSize: 10, color: "var(--ink-3)", marginBottom: 4 }}>Topic {topicIndex + 1}</p>
        <h4 className="serif-i" style={{ fontFamily: "var(--display)", fontSize: 20, marginBottom: 6 }}>{topic.title}</h4>
        {topic.description && <p style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 12, lineHeight: 1.5 }}>{topic.description}</p>}
        <div style={{ display: "flex", gap: 8 }}>
          <span className="lv-chip">{topic.lessonsCount} Lessons</span>
          <span className="lv-chip">
            {isCompleted ? "Done" : isInProgress ? `${topic.doneCount}/${topic.lessonsCount}` : "Locked"}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="relative flex flex-col items-center"
      style={{ position: "relative" }}
      onMouseEnter={e => {
        const tt = e.currentTarget.querySelector<HTMLElement>("[data-tooltip]");
        if (tt) { tt.style.visibility = "visible"; tt.style.opacity = "1"; }
      }}
      onMouseLeave={e => {
        const tt = e.currentTarget.querySelector<HTMLElement>("[data-tooltip]");
        if (tt) { tt.style.visibility = "hidden"; tt.style.opacity = "0"; }
      }}
    >
      {/* Dotted journey connector above this node */}
      {topicIndex !== 0 && (
        <div
          className="lv-dashed-v"
          style={{
            position: "absolute", top: -64, height: 64,
            background: isCompleted
              ? "linear-gradient(0deg, var(--ink) 50%, transparent 50%)"
              : undefined,
            backgroundSize: isCompleted ? "1.5px 12px" : undefined,
            backgroundRepeat: isCompleted ? "repeat-y" : undefined,
          }}
        />
      )}

      {isLocked || !topic.firstLessonId ? (
        node
      ) : (
        <Link href={`/learn/${topic.firstLessonId}`} aria-label={topic.title}>
          {node}
        </Link>
      )}

      <div style={{ marginTop: 16, textAlign: "center", maxWidth: 150 }}>
        <p
          style={{
            fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em",
            color: isLocked ? "var(--ink-4)" : isInProgress ? "var(--terracotta)" : "var(--ink)",
          }}
        >
          {topic.title}
        </p>
        {!isLocked && topic.lessonsCount > 0 && (
          <p className="mono" style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 4 }}>
            {topic.doneCount}/{topic.lessonsCount}
          </p>
        )}
      </div>
    </div>
  );
}

// ── PAGE ─────────────────────────────────────────────────────────────────
export default function LearnPage() {
  const { data: session } = useSession();
  const targetLang = session?.user?.targetLanguage ?? "fr";
  const locale = getLocale((session?.user as any)?.nativeLanguage);

  const LEARNING_PATH =
    targetLang === "es" ? LEARNING_PATH_META_ES :
    targetLang === "en" ? LEARNING_PATH_META_EN :
    LEARNING_PATH_META;

  const PHASES =
    targetLang === "es" ? ES_PHASES :
    targetLang === "en" ? EN_PHASES :
    FR_PHASES;

  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [modal, setModal] = useState<CelebModal | null>(null);
  const [shownCelebrations, setShownCelebrations] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem(`completedLessons_${targetLang}`);
    if (saved) setCompletedLessons(JSON.parse(saved));
  }, [targetLang]);

  const checkCelebrations = useCallback((completed: string[]) => {
    for (let ci = 0; ci < LEARNING_PATH.length; ci++) {
      const topic = LEARNING_PATH[ci];
      const allDone = topic.lessons.every(l => completed.includes(l.id));
      const key = `chapter_${topic.id}`;
      if (allDone && !shownCelebrations.has(key)) {
        const storedKey = `cele_${targetLang}_${key}`;
        if (!localStorage.getItem(storedKey)) {
          localStorage.setItem(storedKey, "1");
          setShownCelebrations(prev => new Set(prev).add(key));
          const xp = CHAPTER_PRIZES[ci % CHAPTER_PRIZES.length];
          setModal({
            kind: "chapter", emoji: topic.emoji,
            title: t(locale, "learn_chapterCompleteTitle", { name: topic.title }),
            subtitle: t(locale, "learn_chapterCompleteSub"),
            xp,
          });
          return;
        }
      }
    }

    for (let pi = 0; pi < PHASES.length; pi++) {
      const phase = PHASES[pi];
      const phaseTopics = LEARNING_PATH.filter(t => phase.ids.includes(t.id));
      const phaseDone = phaseTopics.every(t => t.lessons.every(l => completed.includes(l.id)));
      const key = `phase_${pi}`;
      if (phaseDone && !shownCelebrations.has(key)) {
        const storedKey = `cele_${targetLang}_${key}`;
        if (!localStorage.getItem(storedKey)) {
          localStorage.setItem(storedKey, "1");
          setShownCelebrations(prev => new Set(prev).add(key));
          setModal({
            kind: "phase", emoji: phase.emoji,
            title: t(locale, "learn_phaseCompleteTitle", { phase: t(locale, phase.labelKey) }),
            subtitle: t(locale, "learn_phaseCompleteSub", { n: String(phaseTopics.length) }),
            xp: PHASE_PRIZES[pi] ?? 200,
            phaseLabel: t(locale, phase.labelKey),
          });
          return;
        }
      }
    }

    const totalLessons = LEARNING_PATH.reduce((s, t) => s + t.lessons.length, 0);
    if (completed.length >= totalLessons && !shownCelebrations.has("course")) {
      const storedKey = `cele_${targetLang}_course`;
      if (!localStorage.getItem(storedKey)) {
        localStorage.setItem(storedKey, "1");
        setShownCelebrations(prev => new Set(prev).add("course"));
        setModal({
          kind: "course", emoji: "🎓",
          title: t(locale, "learn_courseCompleteTitle"),
          subtitle: t(locale, "learn_courseCompleteSub"),
          xp: COURSE_PRIZE,
        });
      }
    }
  }, [LEARNING_PATH, PHASES, shownCelebrations, targetLang, locale]);

  useEffect(() => {
    const sync = () => {
      const saved = localStorage.getItem(`completedLessons_${targetLang}`);
      if (saved) {
        const arr = JSON.parse(saved) as string[];
        setCompletedLessons(arr);
        checkCelebrations(arr);
      }
    };
    window.addEventListener("lesson-completed", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      window.removeEventListener("lesson-completed", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [targetLang, checkCelebrations]);

  const isTopicUnlocked = useCallback((topic: (typeof LEARNING_PATH)[number]) => {
    if (!topic.requiredTopicId) return true;
    const required = LEARNING_PATH.find(t => t.id === topic.requiredTopicId);
    if (!required) return true;
    return required.lessons.every(l => completedLessons.includes(l.id));
  }, [LEARNING_PATH, completedLessons]);

  const totalLessons = LEARNING_PATH.reduce((s, t) => s + t.lessons.length, 0);
  const courseComplete = completedLessons.length >= totalLessons && totalLessons > 0;

  // Find first incomplete lesson for the "Continue Learning" button
  const continueHref = useMemo(() => {
    for (const topic of LEARNING_PATH) {
      if (!isTopicUnlocked(topic)) continue;
      const next = topic.lessons.find(l => !completedLessons.includes(l.id));
      if (next) return `/learn/${next.id}`;
    }
    return null;
  }, [LEARNING_PATH, completedLessons, isTopicUnlocked]);

  return (
    <div className="max-w-3xl mx-auto pb-32 lv-fade-up">

      {modal && <CelebrationModal modal={modal} onClose={() => setModal(null)} locale={locale} />}

      {/* ── Header ── */}
      <header className="text-center mb-20 relative" style={{ position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <span className="lv-stamp" style={{ color: "var(--terracotta)", transform: "rotate(-2deg)" }}>
            § Journey · Field Guide 001
          </span>
        </div>
        <h1
          className="serif-i"
          style={{ fontFamily: "var(--display)", fontSize: 64, lineHeight: 1.05, letterSpacing: "-0.02em", margin: "0 auto" }}
        >
          {t(locale, "learn_roadTo")} <em style={{ color: "var(--terracotta)" }}>{t(locale, "learn_fluency")}</em>
        </h1>
        <p style={{ fontSize: 18, color: "var(--ink-3)", maxWidth: 560, margin: "16px auto 0", lineHeight: 1.55 }}>
          From zero to fluent. Work through lessons at your own pace and unlock new chapters as you go.
        </p>

        {completedLessons.length > 0 && (
          <button
            onClick={() => {
              if (!confirm("Reset all progress? This cannot be undone.")) return;
              localStorage.removeItem(`completedLessons_${targetLang}`);
              setCompletedLessons([]);
            }}
            className="lv-btn lv-btn--ghost lv-btn--sm"
            style={{ position: "absolute", top: 0, right: 0 }}
          >
            Reset progress
          </button>
        )}
      </header>

      {/* ── Phases ── */}
      <div className="space-y-20">
        {PHASES.map((phase, phaseIdx) => {
          const phaseTopics = LEARNING_PATH.filter(topic => phase.ids.includes(topic.id));
          const phaseDone =
            phaseTopics.length > 0 &&
            phaseTopics.every(tp => tp.lessons.every(l => completedLessons.includes(l.id)));
          const phaseUnlocked =
            phaseTopics.length > 0 && phaseTopics.some(tp => isTopicUnlocked(tp));

          return (
            <section key={phaseIdx} className="space-y-16">
              <div
                style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "baseline", borderTop: "1px solid var(--line)",
                  paddingTop: 28,
                }}
              >
                <div>
                  <p className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{phase.emoji}&nbsp;&nbsp;{`Section ${phaseIdx + 1}`}</p>
                  <h2
                    className="serif-i"
                    style={{ fontFamily: "var(--display)", fontSize: 40, marginTop: 4, lineHeight: 1.1 }}
                  >
                    {t(locale, phase.labelKey)}
                  </h2>
                </div>
                {phaseDone ? (
                  <span className="lv-sticker" style={{ color: "oklch(0.55 0.18 130)", transform: "rotate(-2deg)" }}>{t(locale, "learn_phaseComplete")}</span>
                ) : phaseUnlocked ? (
                  <span className="lv-sticker" style={{ color: "var(--terracotta)", transform: "rotate(-2deg)" }}>{t(locale, "learn_youAreHere")}</span>
                ) : (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--ink-3)", fontSize: 13 }}>
                    <Lock size={14} /> Locked
                  </span>
                )}
              </div>

              <div
                className="flex flex-col items-center"
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 64, paddingTop: 8 }}
              >
                {phaseTopics.length > 0 ? (
                  phaseTopics.map((topic, topicIdx) => {
                    const doneCount = topic.lessons.filter(l => completedLessons.includes(l.id)).length;
                    const isCompleted = doneCount === topic.lessons.length && topic.lessons.length > 0;
                    const isUnlocked = isTopicUnlocked(topic);
                    const firstLesson = topic.lessons.find(l => !completedLessons.includes(l.id))?.id ?? topic.lessons[0]?.id;

                    return (
                      <TopicNode
                        key={topic.id}
                        topicIndex={topicIdx}
                        topic={{
                          id: topic.id,
                          title: topic.title,
                          emoji: topic.emoji,
                          description: (topic as any).description,
                          lessonsCount: topic.lessons.length,
                          firstLessonId: firstLesson,
                          isUnlocked,
                          isCompleted,
                          doneCount,
                        }}
                      />
                    );
                  })
                ) : (
                  <div
                    className="lv-card"
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center",
                      gap: 16, padding: 48, width: "100%",
                      borderStyle: "dashed", color: "var(--ink-4)",
                    }}
                  >
                    <Lock size={32} />
                    <p style={{ fontWeight: 500 }}>{t(locale, "learn_completePrevPhase")}</p>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* ── Continue learning CTA ── */}
      {continueHref && !courseComplete && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
          <Link
            href={continueHref}
            className="lv-btn lv-btn--primary lv-btn--lg"
            style={{ boxShadow: "var(--sh-3)" }}
          >
            Continue Learning <ChevronRight size={18} />
          </Link>
        </div>
      )}
    </div>
  );
}
