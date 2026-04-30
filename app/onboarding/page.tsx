"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";

// ─── Step data ────────────────────────────────────────────────────────────────

const AGE_GROUPS = [
  { value: "under_18", label: "Under 18", emoji: "🧒" },
  { value: "18_24",    label: "18 – 24",  emoji: "🎓" },
  { value: "25_34",    label: "25 – 34",  emoji: "💼" },
  { value: "35_49",    label: "35 – 49",  emoji: "🌿" },
  { value: "50_plus",  label: "50+",      emoji: "🌟" },
];

const NATIVE_LANGUAGES = [
  { value: "en", label: "English",    flag: "🇬🇧" },
  { value: "ru", label: "Russian",    flag: "🇷🇺" },
  { value: "ar", label: "Arabic",     flag: "🇸🇦" },
  { value: "zh", label: "Chinese",    flag: "🇨🇳" },
  { value: "de", label: "German",     flag: "🇩🇪" },
  { value: "pt", label: "Portuguese", flag: "🇧🇷" },
  { value: "it", label: "Italian",    flag: "🇮🇹" },
  { value: "hi", label: "Hindi",      flag: "🇮🇳" },
  { value: "tr", label: "Turkish",    flag: "🇹🇷" },
  { value: "ja", label: "Japanese",   flag: "🇯🇵" },
  { value: "ko", label: "Korean",     flag: "🇰🇷" },
  { value: "hy", label: "Armenian",  flag: "🇦🇲" },
  { value: "other", label: "Other",   flag: "🌍" },
];

const LEARNING_GOALS = [
  { value: "travel",    label: "Travel",            emoji: "✈️",  desc: "Get by on trips and holidays" },
  { value: "work",      label: "Career",             emoji: "💼",  desc: "Use it professionally or in meetings" },
  { value: "casual",    label: "Casual",             emoji: "😊",  desc: "Chat with friends, watch shows" },
  { value: "heritage",  label: "Heritage",           emoji: "🌳",  desc: "Connect with family roots" },
  { value: "fluency",   label: "Full fluency",       emoji: "🏆",  desc: "Become truly fluent long-term" },
  { value: "academic",  label: "Academic",           emoji: "📚",  desc: "Study, exams, or university" },
];

const PROFICIENCY_LEVELS = [
  {
    value: "beginner",
    label: "Absolute beginner",
    emoji: "🌱",
    desc: "I know almost nothing yet",
  },
  {
    value: "elementary",
    label: "Some basics",
    emoji: "📖",
    desc: "I know a few words and phrases",
  },
  {
    value: "intermediate",
    label: "Intermediate",
    emoji: "🚀",
    desc: "I can hold simple conversations",
  },
];

const DAILY_GOALS = [
  { value: 5,  label: "5 min",  sub: "Casual — just keep it up" },
  { value: 10, label: "10 min", sub: "Steady — great for beginners" },
  { value: 20, label: "20 min", sub: "Committed — you'll see results fast" },
  { value: 30, label: "30 min", sub: "Serious — fluency within a year" },
];

const TOTAL_STEPS = 5;

// ─── Option card ──────────────────────────────────────────────────────────────

function OptionCard({
  selected, onClick, children,
}: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "14px 16px",
        borderRadius: "14px",
        border: selected ? "2px solid var(--accent)" : "2px solid var(--border)",
        background: selected ? "var(--accent-dim)" : "var(--surface)",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.15s",
        position: "relative",
        width: "100%",
      }}
    >
      {selected && (
        <div style={{
          position: "absolute", top: "8px", right: "8px",
          width: "18px", height: "18px", borderRadius: "50%",
          background: "var(--accent)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Check size={10} style={{ color: "white" }} />
        </div>
      )}
      {children}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [ageGroup, setAgeGroup]             = useState("");
  const [nativeLanguage, setNativeLanguage] = useState("");
  const [learningGoal, setLearningGoal]     = useState("");
  const [proficiencyLevel, setProficiency]  = useState("");
  const [dailyGoalMinutes, setDailyGoal]    = useState<number | null>(null);

  const canProceed = () => {
    if (step === 1) return ageGroup !== "";
    if (step === 2) return nativeLanguage !== "";
    if (step === 3) return learningGoal !== "";
    if (step === 4) return proficiencyLevel !== "";
    if (step === 5) return dailyGoalMinutes !== null;
    return false;
  };

  const handleNext = async () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      return;
    }
    // Final step — submit
    setSubmitting(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ageGroup, nativeLanguage, learningGoal, proficiencyLevel, dailyGoalMinutes }),
      });
      // MED-11: surface API errors instead of silently proceeding
      if (!res.ok) {
        console.error("[onboarding] save failed:", res.status);
      }
      router.push("/home");
      router.refresh();
    } catch (err) {
      console.error("[onboarding] network error:", err);
      setSubmitting(false);
    }
  };

  const progress = (step / TOTAL_STEPS) * 100;

  const stepTitles = [
    "How old are you?",
    "What's your native language?",
    "Why are you learning?",
    "What's your current level?",
    "How much time daily?",
  ];
  const stepSubs = [
    "We use this to tailor difficulty and content.",
    "Your first language helps us personalise explanations.",
    "Your goal shapes the vocabulary and scenarios we show you.",
    "No judgement — just helps us start at the right point.",
    "Even 5 minutes a day makes a real difference.",
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      color: "var(--text)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
    }}>
      <div style={{ width: "100%", maxWidth: "520px" }}>

        {/* Logo + step counter */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "36px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "7px",
              background: "linear-gradient(135deg, #7c6aff 0%, #5b4fcf 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontWeight: 700, fontSize: "10px",
            }}>LG</div>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "16px", color: "var(--text)", fontWeight: 800, letterSpacing: "-0.02em" }}>
              Lingova
            </span>
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-3)", fontWeight: 600 }}>
            {step} / {TOTAL_STEPS}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{
          width: "100%", height: "4px", background: "var(--border)",
          borderRadius: "999px", marginBottom: "40px", overflow: "hidden",
        }}>
          <div style={{
            height: "100%", borderRadius: "999px",
            background: "linear-gradient(90deg, #7c6aff, #14b8a6)",
            width: `${progress}%`,
            transition: "width 0.4s ease",
          }} />
        </div>

        {/* Step heading */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(24px, 4vw, 32px)",
            color: "var(--text)",
            margin: "0 0 8px",
            letterSpacing: "-0.01em",
          }}>
            {stepTitles[step - 1]}
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-2)", margin: 0, lineHeight: 1.55 }}>
            {stepSubs[step - 1]}
          </p>
        </div>

        {/* Step content */}
        <div style={{ marginBottom: "32px" }}>

          {/* Step 1 — Age */}
          {step === 1 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "10px" }}>
              {AGE_GROUPS.map((a) => (
                <OptionCard key={a.value} selected={ageGroup === a.value} onClick={() => setAgeGroup(a.value)}>
                  <div style={{ fontSize: "26px", marginBottom: "6px" }}>{a.emoji}</div>
                  <div style={{
                    fontSize: "14px", fontWeight: 600,
                    color: ageGroup === a.value ? "var(--accent-2)" : "var(--text)",
                  }}>{a.label}</div>
                </OptionCard>
              ))}
            </div>
          )}

          {/* Step 2 — Native language */}
          {step === 2 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "10px" }}>
              {NATIVE_LANGUAGES.map((l) => (
                <OptionCard key={l.value} selected={nativeLanguage === l.value} onClick={() => setNativeLanguage(l.value)}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "22px" }}>{l.flag}</span>
                    <span style={{
                      fontSize: "14px", fontWeight: 500,
                      color: nativeLanguage === l.value ? "var(--accent-2)" : "var(--text)",
                    }}>{l.label}</span>
                  </div>
                </OptionCard>
              ))}
            </div>
          )}

          {/* Step 3 — Learning goal */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {LEARNING_GOALS.map((g) => (
                <OptionCard key={g.value} selected={learningGoal === g.value} onClick={() => setLearningGoal(g.value)}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <span style={{ fontSize: "28px", flexShrink: 0 }}>{g.emoji}</span>
                    <div>
                      <div style={{
                        fontSize: "14px", fontWeight: 600, marginBottom: "2px",
                        color: learningGoal === g.value ? "var(--accent-2)" : "var(--text)",
                      }}>{g.label}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-3)" }}>{g.desc}</div>
                    </div>
                  </div>
                </OptionCard>
              ))}
            </div>
          )}

          {/* Step 4 — Proficiency */}
          {step === 4 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {PROFICIENCY_LEVELS.map((p) => (
                <OptionCard key={p.value} selected={proficiencyLevel === p.value} onClick={() => setProficiency(p.value)}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <span style={{ fontSize: "32px", flexShrink: 0 }}>{p.emoji}</span>
                    <div>
                      <div style={{
                        fontSize: "15px", fontWeight: 600, marginBottom: "3px",
                        color: proficiencyLevel === p.value ? "var(--accent-2)" : "var(--text)",
                      }}>{p.label}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-3)" }}>{p.desc}</div>
                    </div>
                  </div>
                </OptionCard>
              ))}
            </div>
          )}

          {/* Step 5 — Daily goal */}
          {step === 5 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {DAILY_GOALS.map((d) => (
                <OptionCard key={d.value} selected={dailyGoalMinutes === d.value} onClick={() => setDailyGoal(d.value)}>
                  <div style={{
                    fontSize: "22px", fontWeight: 800, fontFamily: "var(--font-display)",
                    color: dailyGoalMinutes === d.value ? "var(--accent-2)" : "var(--text)",
                    marginBottom: "4px",
                  }}>{d.label}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-3)", lineHeight: 1.4 }}>{d.sub}</div>
                </OptionCard>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="btn-ghost"
              style={{
                padding: "12px 16px",
                display: "flex", alignItems: "center", gap: "6px",
                fontSize: "14px", flexShrink: 0,
              }}
            >
              <ArrowLeft size={15} /> Back
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed() || submitting}
            className="btn-primary"
            style={{
              flex: 1, padding: "14px",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              fontSize: "15px", fontWeight: 600,
              opacity: !canProceed() || submitting ? 0.5 : 1,
              cursor: !canProceed() || submitting ? "not-allowed" : "pointer",
              transition: "opacity 0.15s",
            }}
          >
            {submitting ? "Saving…" : step === TOTAL_STEPS ? (
              <>Let's start! <Check size={15} /></>
            ) : (
              <>Continue <ArrowRight size={15} /></>
            )}
          </button>
        </div>

        {/* Skip link */}
        <p style={{ textAlign: "center", marginTop: "20px" }}>
          <button
            type="button"
            onClick={() => { router.push("/home"); router.refresh(); }}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: "12px", color: "var(--text-3)", textDecoration: "underline",
            }}
          >
            Skip for now
          </button>
        </p>

      </div>
    </div>
  );
}
