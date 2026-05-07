"use client";

import { LEARNING_PATH_META } from "@/data/learning-path-meta";
import { LEARNING_PATH_META_ES } from "@/data/learning-path-es-meta";
import { LEARNING_PATH_META_EN } from "@/data/learning-path-en-meta";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { t, getLocale } from "@/lib/i18n";

/* ── colour / difficulty maps ─────────────────────────────────── */
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
const LABEL_KEY_MAP: Record<string, string> = {
  chapter: "learn_chapter", lessonsComplete: "learn_lessonsComplete",
  chapters: "learn_chapters", done: "learn_done", completed: "learn_completed",
  upNext: "learn_upNext", locked: "learn_locked",
  beginner: "learn_beginner", intermediate: "learn_intermediate", advanced: "learn_advanced",
  alphabet: "learn_alphabet", pronunciation: "learn_pronunciation",
  vocabulary: "learn_vocabulary", grammar: "learn_grammar",
  conversation: "learn_conversation", culture: "learn_culture",
};

/* ── phases ────────────────────────────────────────────────────── */
const FR_PHASES = [
  { label: "Phase 1 — The Basics",       emoji: "🌱", ids: ["alphabet","pronunciation","greetings","numbers","essentials"] },
  { label: "Phase 2 — Core Grammar",     emoji: "⚙️", ids: ["articles-gender","subject-pronouns","avoir-verb","present-tense","adjectives","negation","questions"] },
  { label: "Phase 3 — Real World French",emoji: "🌍", ids: ["food-drinks","directions-places","time-days","past-tense","future-plans"] },
];
const ES_PHASES = [
  { label: "Phase 1 — The Basics",       emoji: "🌱", ids: ["alphabet","pronunciation","greetings","numbers","essentials"] },
  { label: "Phase 2 — Core Grammar",     emoji: "⚙️", ids: ["articles-gender","subject-pronouns","tener-verb","present-tense","adjectives","negation","questions"] },
  { label: "Phase 3 — Real World Spanish",emoji:"🌍", ids: ["food-drinks","directions-places","time-days","past-tense","future-plans"] },
];
const EN_PHASES = [
  { label: "Phase 1 — The Basics",       emoji: "🌱", ids: ["alphabet","pronunciation","greetings","numbers","essentials"] },
  { label: "Phase 2 — Core Grammar",     emoji: "⚙️", ids: ["articles","pronouns-be","have-do","present-simple","adjectives","negation","questions"] },
  { label: "Phase 3 — Real World English",emoji:"🌍", ids: ["food-drinks","directions","time-days","past-simple","future"] },
];

/* ── prize definitions ────────────────────────────────────────── */
const CHAPTER_PRIZES = [10, 15, 20, 25];   // XP per chapter (cycles)
const PHASE_PRIZES   = [150, 250, 400];     // XP per phase
const COURSE_PRIZE   = 1000;               // XP for full completion

/* ── celebration modal ────────────────────────────────────────── */
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
  const ringColor = modal.kind === "course" ? "#fbbf24" : modal.kind === "phase" ? "#a78bfa" : "#34d399";
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)",
      animation: "fadeIn 0.2s ease",
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--surface)",
          border: `1px solid ${ringColor}44`,
          borderRadius: 24,
          padding: "40px 32px",
          maxWidth: 400,
          width: "90%",
          textAlign: "center",
          boxShadow: `0 0 60px ${ringColor}33`,
          animation: "scaleIn 0.3s cubic-bezier(.34,1.56,.64,1)",
        }}
      >
        {/* emoji burst */}
        <div style={{ fontSize: 72, marginBottom: 8, lineHeight: 1 }}>{modal.emoji}</div>

        {modal.kind === "course" && (
          <div style={{ fontSize: 11, fontWeight: 800, color: "#fbbf24", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>
            🎓 Course Complete
          </div>
        )}
        {modal.kind === "phase" && (
          <div style={{ fontSize: 11, fontWeight: 800, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>
            ✨ {modal.phaseLabel} Complete
          </div>
        )}

        <h2 style={{ fontSize: 26, fontWeight: 900, color: "var(--text)", margin: "0 0 8px" }}>{modal.title}</h2>
        <p style={{ fontSize: 14, color: "var(--text-2)", margin: "0 0 24px", lineHeight: 1.5 }}>{modal.subtitle}</p>

        {/* XP reward */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "var(--gold-dim)", border: "1px solid var(--gold)",
          borderRadius: 99, padding: "10px 24px", marginBottom: 28,
        }}>
          <span style={{ fontSize: 22 }}>⚡</span>
          <span style={{ fontSize: 24, fontWeight: 900, color: "var(--gold)" }}>+{modal.xp} XP</span>
          <span style={{ fontSize: 12, color: "var(--text-3)" }}>reward</span>
        </div>

        {/* progress stars */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 28 }}>
          {["⭐","⭐","⭐"].map((s,i) => (
            <span key={i} style={{
              fontSize: 22,
              animation: `starPop 0.4s ${i * 0.12}s cubic-bezier(.34,1.56,.64,1) both`,
            }}>{s}</span>
          ))}
        </div>

        <button
          onClick={onClose}
          style={{
            width: "100%", padding: "14px", borderRadius: 14,
            background: `linear-gradient(135deg, ${ringColor}, ${ringColor}cc)`,
            border: "none", color: "#000", fontWeight: 800, fontSize: 15, cursor: "pointer",
          }}
        >
          {modal.kind === "course" ? "🎓 View My Certificate" : "Continue →"}
        </button>
      </div>

      <style>{`
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes scaleIn { from{opacity:0;transform:scale(0.7)} to{opacity:1;transform:scale(1)} }
        @keyframes starPop { from{opacity:0;transform:scale(0)} to{opacity:1;transform:scale(1)} }
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════════════ */
export default function LearnPage() {
  const { data: session } = useSession();
  const targetLang = session?.user?.targetLanguage ?? "fr";
  const locale = getLocale((session?.user as any)?.nativeLanguage);
  const lbl = (key: string) => t(locale, LABEL_KEY_MAP[key] as any);

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
  // track which chapters/phases have shown congrats this session
  const [shownCelebrations, setShownCelebrations] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem(`completedLessons_${targetLang}`);
    if (saved) setCompletedLessons(JSON.parse(saved));
  }, [targetLang]);

  /* Check for newly-completed chapters or phases */
  const checkCelebrations = useCallback((completed: string[]) => {
    // Chapter completion
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
            kind: "chapter",
            emoji: topic.emoji,
            title: `"${topic.title}" Complete!`,
            subtitle: "Great work finishing this chapter. Your XP has been added.",
            xp,
          });
          return; // show one at a time
        }
      }
    }

    // Phase completion
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
            kind: "phase",
            emoji: phase.emoji,
            title: `${phase.label} Complete!`,
            subtitle: `You've mastered all ${phaseTopics.length} topics in this phase. Incredible!`,
            xp: PHASE_PRIZES[pi] ?? 200,
            phaseLabel: phase.label,
          });
          return;
        }
      }
    }

    // Full course completion
    const totalLessons = LEARNING_PATH.reduce((s, t) => s + t.lessons.length, 0);
    if (completed.length >= totalLessons && !shownCelebrations.has("course")) {
      const storedKey = `cele_${targetLang}_course`;
      if (!localStorage.getItem(storedKey)) {
        localStorage.setItem(storedKey, "1");
        setShownCelebrations(prev => new Set(prev).add("course"));
        setModal({
          kind: "course",
          emoji: "🎓",
          title: "Course Complete!",
          subtitle: "You've completed the entire learning path! You're truly dedicated — collect your reward and keep growing.",
          xp: COURSE_PRIZE,
        });
      }
    }
  }, [LEARNING_PATH, PHASES, shownCelebrations, targetLang]);

  // listen for lesson completions + re-sync when tab regains focus (e.g. navigating back from lesson)
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

  const isTopicUnlocked = (topic: (typeof LEARNING_PATH)[number]) => {
    if (!topic.requiredTopicId) return true;
    const required = LEARNING_PATH.find(t => t.id === topic.requiredTopicId);
    if (!required) return true;
    return required.lessons.every(l => completedLessons.includes(l.id));
  };

  const getTopicProgress = (topic: (typeof LEARNING_PATH)[number]) => {
    const done = topic.lessons.filter(l => completedLessons.includes(l.id)).length;
    return { done, total: topic.lessons.length, pct: Math.round((done / topic.lessons.length) * 100) };
  };

  const totalLessons = LEARNING_PATH.reduce((s, t) => s + t.lessons.length, 0);
  const overallPct   = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;
  const courseComplete = completedLessons.length >= totalLessons && totalLessons > 0;
  const circumference = 2 * Math.PI * 20;

  /* Build flat chapter index across phases */
  let chapterCounter = 0;

  return (
    <div style={{ maxWidth: 720 }}>

      {/* ── Celebration Modal ── */}
      {modal && <CelebrationModal modal={modal} onClose={() => setModal(null)} />}

      {/* ── Header ── */}
      <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.5px", marginBottom: 4 }}>
            Learn
          </h1>
          <p style={{ color: "var(--text-2)", fontSize: 14 }}>
            Work through lessons at your own pace. Complete a chapter to unlock the next.
          </p>
        </div>
        {completedLessons.length > 0 && (
          <button
            onClick={() => {
              if (!confirm("Reset all progress? This cannot be undone.")) return;
              localStorage.removeItem(`completedLessons_${targetLang}`);
              setCompletedLessons([]);
            }}
            style={{
              fontSize: 11, fontWeight: 600, padding: "6px 12px", borderRadius: 8, flexShrink: 0,
              background: "transparent", border: "1px solid var(--border)",
              color: "var(--text-3)", cursor: "pointer", transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--red)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-3)"; e.currentTarget.style.borderColor = "var(--border)"; }}
          >
            Reset progress
          </button>
        )}
      </div>

      {/* ── Progress Overview ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16,
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 16, padding: "16px 20px", marginBottom: 28,
      }}>
        <div style={{ position: "relative", width: 52, height: 52, flexShrink: 0 }}>
          <svg width="52" height="52" viewBox="0 0 52 52" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="26" cy="26" r="20" fill="none" stroke="var(--surface-3)" strokeWidth="4" />
            <circle
              cx="26" cy="26" r="20" fill="none"
              stroke={courseComplete ? "var(--gold)" : "var(--accent)"} strokeWidth="4" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (overallPct / 100) * circumference}
              style={{ transition: "stroke-dashoffset 0.8s ease" }}
            />
          </svg>
          <span style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: courseComplete ? 18 : 11,
            fontWeight: 700, color: courseComplete ? "var(--gold)" : "var(--accent-2)",
          }}>
            {courseComplete ? "🎓" : `${overallPct}%`}
          </span>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
            {completedLessons.length} / {totalLessons} {lbl("lessonsComplete")}
          </p>
          <div style={{ height: 6, background: "var(--surface-3)", borderRadius: 99, overflow: "hidden" }}>
            <div className="xp-bar-fill" style={{
              height: "100%", borderRadius: 99,
              width: `${Math.max(overallPct, 1)}%`,
              background: courseComplete ? "var(--gold)" : undefined,
              transition: "width 0.8s ease",
            }} />
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <span className={courseComplete ? "badge-green" : "badge-accent"} style={{ fontSize: 11 }}>
            {courseComplete ? "🎓 Complete!" : `${LEARNING_PATH.length} ${lbl("chapters")}`}
          </span>
        </div>
      </div>

      {/* ── Course Complete Hero ── */}
      {courseComplete && (
        <div style={{
          borderRadius: 20, padding: "28px 24px", marginBottom: 28, textAlign: "center",
          background: "linear-gradient(135deg, rgba(251,191,36,0.15), rgba(251,191,36,0.05))",
          border: "1px solid rgba(251,191,36,0.4)",
        }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🎓</div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: "var(--gold)", margin: "0 0 8px" }}>
            You've completed the full course!
          </h2>
          <p style={{ color: "var(--text-2)", fontSize: 14, margin: "0 0 16px" }}>
            Every chapter mastered. You're officially ready to hold real conversations. Keep practicing with games, stories, and the AI tutor to stay sharp.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/games" style={{
              padding: "10px 20px", borderRadius: 12, fontWeight: 700, fontSize: 13,
              background: "var(--gold)", color: "#000", textDecoration: "none",
            }}>Play Games →</Link>
            <Link href="/tutor" style={{
              padding: "10px 20px", borderRadius: 12, fontWeight: 700, fontSize: 13,
              background: "var(--accent-dim)", color: "var(--accent)", textDecoration: "none",
              border: "1px solid rgba(124,106,255,0.3)",
            }}>AI Tutor →</Link>
          </div>
        </div>
      )}

      {/* ── Phases ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
        {PHASES.map((phase, phaseIdx) => {
          const phaseTopics = LEARNING_PATH.filter(t => phase.ids.includes(t.id));
          const phaseLessons = phaseTopics.flatMap(t => t.lessons);
          const phaseDone = phaseLessons.filter(l => completedLessons.includes(l.id)).length;
          const phasePct  = phaseLessons.length > 0 ? Math.round((phaseDone / phaseLessons.length) * 100) : 0;
          const phaseComplete = phasePct === 100;

          return (
            <div key={phaseIdx}>
              {/* Phase header */}
              <div style={{
                borderRadius: 16,
                background: phaseComplete
                  ? "linear-gradient(135deg,rgba(52,211,153,0.12),rgba(52,211,153,0.04))"
                  : "linear-gradient(135deg,rgba(124,106,255,0.1),rgba(96,165,250,0.06))",
                border: `1px solid ${phaseComplete ? "rgba(52,211,153,0.3)" : "rgba(124,106,255,0.2)"}`,
                padding: "16px 20px",
                marginBottom: 16,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 22 }}>{phase.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: phaseComplete ? "var(--green)" : "var(--text)" }}>
                        {phase.label}
                      </span>
                      {phaseComplete && <span className="badge-green" style={{ fontSize: 10 }}>Complete ✓</span>}
                    </div>
                    <p style={{ fontSize: 12, color: "var(--text-3)", margin: "2px 0 0" }}>
                      {phaseDone} / {phaseLessons.length} lessons · {PHASE_PRIZES[phaseIdx]} XP reward
                    </p>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: phaseComplete ? "var(--green)" : "var(--accent)" }}>
                    {phasePct}%
                  </span>
                </div>
                <div style={{ height: 5, background: "var(--surface-3)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 99,
                    width: `${phasePct}%`,
                    background: phaseComplete
                      ? "var(--green)"
                      : "linear-gradient(90deg,var(--accent),var(--accent-2))",
                    transition: "width 0.8s ease",
                  }} />
                </div>
              </div>

              {/* Topics in this phase */}
              <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingLeft: 12, borderLeft: "2px solid var(--border)" }}>
                {phaseTopics.map((topic) => {
                  chapterCounter++;
                  const ci = chapterCounter;
                  const unlocked  = isTopicUnlocked(topic);
                  const progress  = getTopicProgress(topic);
                  const isComplete = progress.pct === 100;

                  return (
                    <div key={topic.id}>
                      {/* Chapter header */}
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            {lbl("chapter")} {ci}
                          </span>
                          <span style={{ fontSize: 18 }}>{topic.emoji}</span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: isComplete ? "var(--green)" : unlocked ? "var(--text)" : "var(--text-3)" }}>
                            {topic.title}
                          </span>
                          {isComplete && <span className="badge-green" style={{ fontSize: 10 }}>{lbl("done")} ✓</span>}
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

                      {unlocked && progress.done > 0 && progress.pct < 100 && (
                        <div style={{ height: 3, background: "var(--surface-3)", borderRadius: 99, marginBottom: 8, overflow: "hidden" }}>
                          <div style={{ height: "100%", background: "var(--accent)", borderRadius: 99, width: `${progress.pct}%`, transition: "width 0.6s ease" }} />
                        </div>
                      )}

                      {/* Lesson cards */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {topic.lessons.map((lesson, lessonIndex) => {
                          const done      = completedLessons.includes(lesson.id);
                          const isLocked  = !unlocked;
                          const lessonColor = typeColors[lesson.type] || "var(--accent)";
                          const diffKey   = difficultyMap[lesson.type] || "beginner";
                          const isStarted = !done && !isLocked && lessonIndex === topic.lessons.findIndex(l => !completedLessons.includes(l.id));

                          return (
                            <Link
                              key={lesson.id}
                              href={isLocked ? "#" : `/learn/${lesson.id}`}
                              onClick={isLocked ? e => e.preventDefault() : undefined}
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

                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2, flexWrap: "wrap" }}>
                                  <span style={{ fontSize: 14, fontWeight: 600, color: done ? "var(--text-3)" : "var(--text)", textDecoration: done ? "line-through" : "none" }}>
                                    {lesson.title}
                                  </span>
                                  {done       && <span className="badge-green"  style={{ fontSize: 10 }}>{lbl("completed")}</span>}
                                  {isStarted  && <span className="badge-accent" style={{ fontSize: 10 }}>{lbl("upNext")}</span>}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <span className={`diff-${diffKey}`} style={{ fontSize: 10 }}>{lbl(diffKey)}</span>
                                  <span style={{ fontSize: 11, color: "var(--text-3)" }}>·</span>
                                  <span style={{ fontSize: 11, color: "var(--text-3)" }}>{lbl(lesson.type)}</span>
                                </div>
                              </div>

                              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                                <span style={{
                                  fontSize: 11, fontWeight: 700,
                                  color: done ? "var(--text-3)" : "var(--gold)",
                                  background: done ? "var(--surface-3)" : "var(--gold-dim)",
                                  borderRadius: 99, padding: "2px 8px",
                                }}>+10 XP</span>
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
        })}
      </div>
    </div>
  );
}
