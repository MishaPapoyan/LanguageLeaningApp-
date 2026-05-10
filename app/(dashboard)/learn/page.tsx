"use client";

import { LEARNING_PATH_META } from "@/data/learning-path-meta";
import { LEARNING_PATH_META_ES } from "@/data/learning-path-es-meta";
import { LEARNING_PATH_META_EN } from "@/data/learning-path-en-meta";
import Link from "next/link";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { t, getLocale } from "@/lib/i18n";
import { Lock, Check, ChevronRight, Star, GraduationCap } from "lucide-react";

// ── phases ───────────────────────────────────────────────────────────────
const FR_PHASES = [
  { label: "Phase 1 — The Basics",         emoji: "🌱", ids: ["alphabet","pronunciation","greetings","numbers","essentials"] },
  { label: "Phase 2 — Core Grammar",       emoji: "⚙️", ids: ["articles-gender","subject-pronouns","avoir-verb","present-tense","adjectives","negation","questions"] },
  { label: "Phase 3 — Real World French",  emoji: "🌍", ids: ["food-drinks","directions-places","time-days","past-tense","future-plans"] },
];
const ES_PHASES = [
  { label: "Phase 1 — The Basics",         emoji: "🌱", ids: ["alphabet","pronunciation","greetings","numbers","essentials"] },
  { label: "Phase 2 — Core Grammar",       emoji: "⚙️", ids: ["articles-gender","subject-pronouns","tener-verb","present-tense","adjectives","negation","questions"] },
  { label: "Phase 3 — Real World Spanish", emoji: "🌍", ids: ["food-drinks","directions-places","time-days","past-tense","future-plans"] },
];
const EN_PHASES = [
  { label: "Phase 1 — The Basics",         emoji: "🌱", ids: ["alphabet","pronunciation","greetings","numbers","essentials"] },
  { label: "Phase 2 — Core Grammar",       emoji: "⚙️", ids: ["articles","pronouns-be","have-do","present-simple","adjectives","negation","questions"] },
  { label: "Phase 3 — Real World English", emoji: "🌍", ids: ["food-drinks","directions","time-days","past-simple","future"] },
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

function CelebrationModal({ modal, onClose }: { modal: CelebModal; onClose: () => void }) {
  const ringColor = modal.kind === "course" ? "#fbbf24" : modal.kind === "phase" ? "#a78bfa" : "#10b981";
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 999,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)",
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="card-premium"
        style={{
          padding: "40px 32px",
          maxWidth: 400,
          width: "90%",
          textAlign: "center",
          boxShadow: `0 0 60px ${ringColor}33`,
          animation: "scaleIn 0.3s cubic-bezier(.34,1.56,.64,1)",
          border: `1px solid ${ringColor}55`,
        }}
      >
        <div style={{ fontSize: 72, marginBottom: 8, lineHeight: 1 }}>{modal.emoji}</div>
        {modal.kind === "course" && (
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: "#fbbf24", marginBottom: 8 }}>
            🎓 Course Complete
          </div>
        )}
        {modal.kind === "phase" && (
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: "#a78bfa", marginBottom: 8 }}>
            ✨ {modal.phaseLabel} Complete
          </div>
        )}
        <h2 className="serif italic" style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px" }}>{modal.title}</h2>
        <p style={{ fontSize: 14, color: "var(--text-2)", margin: "0 0 24px", lineHeight: 1.5 }}>{modal.subtitle}</p>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.4)",
          borderRadius: 99, padding: "10px 24px", marginBottom: 28,
        }}>
          <span style={{ fontSize: 22 }}>⚡</span>
          <span className="mono" style={{ fontSize: 24, fontWeight: 800, color: "#fbbf24" }}>+{modal.xp} XP</span>
          <span style={{ fontSize: 12, color: "var(--text-3)" }}>reward</span>
        </div>
        <button onClick={onClose} className="btn-primary" style={{ width: "100%", padding: "14px", fontSize: 15 }}>
          {modal.kind === "course" ? "🎓 View My Certificate" : "Continue →"}
        </button>
      </div>
      <style>{`
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes scaleIn { from{opacity:0;transform:scale(0.7)} to{opacity:1;transform:scale(1)} }
      `}</style>
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

  const node = (
    <div
      className={`w-24 h-24 rounded-full border-4 flex items-center justify-center transition-all duration-300 relative z-10 ${
        isLocked
          ? "border-white/10 bg-black"
          : isCompleted
          ? "border-emerald-500 bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          : "border-amber-500 bg-black text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
      } ${!isLocked ? "cursor-pointer hover:scale-110 active:scale-95" : "cursor-not-allowed"}`}
    >
      {isLocked ? (
        <Lock size={28} className="text-white/20" />
      ) : isCompleted ? (
        <Check size={32} strokeWidth={3} />
      ) : isInProgress ? (
        <Star size={32} strokeWidth={2} fill="currentColor" />
      ) : (
        <span className="text-3xl">{topic.emoji}</span>
      )}

      {/* Hover tooltip */}
      <div className="absolute left-32 w-64 text-left invisible group-hover:visible group-hover:opacity-100 opacity-0 transition-all hidden md:block pointer-events-none">
        <div className="card-premium p-4 -translate-y-1/2">
          <p className="text-xs uppercase tracking-widest font-bold text-white/40 mb-1">Topic {topicIndex + 1}</p>
          <h4 className="text-xl font-bold mb-1 italic serif">{topic.title}</h4>
          {topic.description && <p className="text-sm text-white/60 mb-3">{topic.description}</p>}
          <div className="flex gap-2 text-[10px] font-bold uppercase tracking-wider">
            <span className="px-2 py-0.5 rounded bg-white/5">{topic.lessonsCount} Lessons</span>
            <span className="px-2 py-0.5 rounded bg-white/5">
              {isCompleted ? "Done" : isInProgress ? `${topic.doneCount}/${topic.lessonsCount}` : "Locked"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative flex flex-col items-center group">
      {/* Connector line above this node */}
      {topicIndex !== 0 && (
        <div className={`absolute -top-16 w-0.5 h-16 ${isCompleted ? "bg-emerald-500" : "bg-white/10"}`} />
      )}

      {isLocked || !topic.firstLessonId ? (
        node
      ) : (
        <Link href={`/learn/${topic.firstLessonId}`} aria-label={topic.title}>
          {node}
        </Link>
      )}

      <div className="mt-4 text-center max-w-[140px]">
        <p className={`text-sm font-bold tracking-tight ${isLocked ? "text-white/20" : "text-white"}`}>{topic.title}</p>
        {!isLocked && topic.lessonsCount > 0 && (
          <p className="text-[10px] mono uppercase tracking-widest text-white/30 mt-1">
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
            title: `"${topic.title}" Complete!`,
            subtitle: "Great work finishing this chapter. Your XP has been added.",
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
            title: `${phase.label} Complete!`,
            subtitle: `You've mastered all ${phaseTopics.length} topics in this phase. Incredible!`,
            xp: PHASE_PRIZES[pi] ?? 200,
            phaseLabel: phase.label,
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
          title: "Course Complete!",
          subtitle: "You've completed the entire learning path! Collect your reward and keep growing.",
          xp: COURSE_PRIZE,
        });
      }
    }
  }, [LEARNING_PATH, PHASES, shownCelebrations, targetLang]);

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
    <div className="max-w-3xl mx-auto pb-32">

      {modal && <CelebrationModal modal={modal} onClose={() => setModal(null)} />}

      {/* ── Header ── */}
      <header className="text-center space-y-4 mb-20 relative">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 mb-2">
          <GraduationCap size={40} />
        </div>
        <h1 className="text-5xl md:text-6xl italic serif">The Path to Mastery</h1>
        <p className="text-white/40 text-lg md:text-xl max-w-xl mx-auto">
          From zero to fluent. Work through lessons at your own pace and unlock new chapters as you go.
        </p>

        {completedLessons.length > 0 && (
          <button
            onClick={() => {
              if (!confirm("Reset all progress? This cannot be undone.")) return;
              localStorage.removeItem(`completedLessons_${targetLang}`);
              setCompletedLessons([]);
            }}
            className="absolute top-0 right-0 text-[11px] font-bold uppercase tracking-widest text-white/30 hover:text-rose-400 border border-white/10 hover:border-rose-500/40 rounded-full px-3 py-1.5 transition-colors"
          >
            Reset progress
          </button>
        )}
      </header>

      {/* ── Phases ── */}
      <div className="space-y-20">
        {PHASES.map((phase, phaseIdx) => {
          const phaseTopics = LEARNING_PATH.filter(topic => phase.ids.includes(topic.id));

          return (
            <section key={phaseIdx} className="space-y-16">
              <div className="flex items-center gap-6">
                <div className="h-px flex-1 bg-white/10" />
                <h2 className="text-xl md:text-2xl font-bold mono tracking-widest text-white/40 uppercase whitespace-nowrap">
                  {phase.label}
                </h2>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <div className="flex flex-col items-center gap-16">
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
                  <div className="flex flex-col items-center gap-4 text-white/20 border-2 border-dashed border-white/5 rounded-3xl p-12 w-full">
                    <Lock size={32} />
                    <p className="font-medium">Complete previous phase to unlock</p>
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
            className="btn-primary py-4 px-12 text-lg flex items-center gap-3 shadow-2xl shadow-emerald-500/20"
          >
            Continue Learning <ChevronRight size={20} />
          </Link>
        </div>
      )}
    </div>
  );
}
