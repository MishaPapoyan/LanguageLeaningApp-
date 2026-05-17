"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { t, getClientLocale, type Locale, type TranslationKey } from "@/lib/i18n";

// ─── Step data ────────────────────────────────────────────────────────────────
// label/desc are i18n keys (TranslationKey-typed) so the compiler rejects raw
// English literals here — this is the permanent fix for the recurring problem.

const AGE_GROUPS: { value: string; labelKey: TranslationKey; emoji: string }[] = [
  { value: "under_18", labelKey: "onb_age_under18", emoji: "🧒" },
  { value: "18_24",    labelKey: "onb_age_18_24",   emoji: "🎓" },
  { value: "25_34",    labelKey: "onb_age_25_34",   emoji: "💼" },
  { value: "35_49",    labelKey: "onb_age_35_49",   emoji: "🌿" },
  { value: "50_plus",  labelKey: "onb_age_50_plus", emoji: "🌟" },
];

// Language endonyms stay as-is (proper nouns shown in a native-language picker);
// only the "Other" UI word is localized.
const NATIVE_LANGUAGES: { value: string; label: string; flag: string }[] = [
  { value: "en", label: "English",    flag: "🇬🇧" },
  { value: "ru", label: "Русский",    flag: "🇷🇺" },
  { value: "ar", label: "العربية",     flag: "🇸🇦" },
  { value: "zh", label: "中文",         flag: "🇨🇳" },
  { value: "de", label: "Deutsch",    flag: "🇩🇪" },
  { value: "pt", label: "Português",  flag: "🇧🇷" },
  { value: "it", label: "Italiano",   flag: "🇮🇹" },
  { value: "hi", label: "हिन्दी",       flag: "🇮🇳" },
  { value: "tr", label: "Türkçe",     flag: "🇹🇷" },
  { value: "ja", label: "日本語",       flag: "🇯🇵" },
  { value: "ko", label: "한국어",       flag: "🇰🇷" },
  { value: "hy", label: "Հայերեն",     flag: "🇦🇲" },
  { value: "other", label: "",        flag: "🌍" },
];

const LEARNING_GOALS: { value: string; labelKey: TranslationKey; emoji: string; descKey: TranslationKey }[] = [
  { value: "travel",   labelKey: "onb_goal_travel_l",   emoji: "✈️", descKey: "onb_goal_travel_d" },
  { value: "work",     labelKey: "onb_goal_work_l",     emoji: "💼", descKey: "onb_goal_work_d" },
  { value: "casual",   labelKey: "onb_goal_casual_l",   emoji: "😊", descKey: "onb_goal_casual_d" },
  { value: "heritage", labelKey: "onb_goal_heritage_l", emoji: "🌳", descKey: "onb_goal_heritage_d" },
  { value: "fluency",  labelKey: "onb_goal_fluency_l",  emoji: "🏆", descKey: "onb_goal_fluency_d" },
  { value: "academic", labelKey: "onb_goal_academic_l", emoji: "📚", descKey: "onb_goal_academic_d" },
];

const PROFICIENCY_LEVELS: { value: string; labelKey: TranslationKey; emoji: string; descKey: TranslationKey }[] = [
  { value: "beginner",     labelKey: "onb_prof_beginner_l",     emoji: "🌱", descKey: "onb_prof_beginner_d" },
  { value: "elementary",   labelKey: "onb_prof_elementary_l",   emoji: "📖", descKey: "onb_prof_elementary_d" },
  { value: "intermediate", labelKey: "onb_prof_intermediate_l", emoji: "🚀", descKey: "onb_prof_intermediate_d" },
];

const DAILY_GOALS: { value: number; labelKey: TranslationKey; subKey: TranslationKey }[] = [
  { value: 5,  labelKey: "onb_daily_5_l",  subKey: "onb_daily_5_s" },
  { value: 10, labelKey: "onb_daily_10_l", subKey: "onb_daily_10_s" },
  { value: 20, labelKey: "onb_daily_20_l", subKey: "onb_daily_20_s" },
  { value: 30, labelKey: "onb_daily_30_l", subKey: "onb_daily_30_s" },
];

const STEP_TITLE_KEYS: TranslationKey[] = ["onb_step1Title", "onb_step2Title", "onb_step3Title", "onb_step4Title", "onb_step5Title"];
const STEP_SUB_KEYS: TranslationKey[] = ["onb_step1Sub", "onb_step2Sub", "onb_step3Sub", "onb_step4Sub", "onb_step5Sub"];

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
        borderRadius: "var(--r-md)",
        border: selected ? "2px solid var(--terracotta)" : "2px solid var(--line-2)",
        background: selected ? "var(--terracotta-soft)" : "var(--paper)",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.15s var(--ease-out)",
        position: "relative",
        width: "100%",
      }}
    >
      {selected && (
        <div style={{
          position: "absolute", top: "8px", right: "8px",
          width: "18px", height: "18px", borderRadius: "50%",
          background: "var(--terracotta)",
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
  const [locale, setLocale] = useState<Locale>("en");
  useEffect(() => { setLocale(getClientLocale()); }, []);
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
    setSubmitting(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ageGroup, nativeLanguage, learningGoal, proficiencyLevel, dailyGoalMinutes }),
      });
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

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--paper)",
      color: "var(--ink)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
    }}>
      <div style={{ width: "100%", maxWidth: "520px" }}>

        {/* Logo + step counter */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "36px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg viewBox="0 0 40 40" width={26} height={26} aria-hidden>
              <circle cx="20" cy="20" r="18" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
              <path d="M12 27 V13 H15 V24 H22" fill="none" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="27" cy="13" r="2.5" fill="var(--terracotta)" />
            </svg>
            <span style={{ fontFamily: "var(--display)", fontSize: "22px", color: "var(--ink)", letterSpacing: "-0.02em" }}>
              Ling<em style={{ fontStyle: "italic", color: "var(--terracotta)" }}>o</em>va
            </span>
          </div>
          <span style={{ fontFamily: "var(--mono)", fontSize: "11px", letterSpacing: "0.1em", color: "var(--ink-3)" }}>
            {step} / {TOTAL_STEPS}
          </span>
        </div>

        {/* Progress bar */}
        <div className="lv-progress lv-progress--terra" style={{ marginBottom: "40px" }}>
          <span style={{ width: `${progress}%` }} />
        </div>

        {/* Step heading */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{
            fontFamily: "var(--display)",
            fontSize: "clamp(28px, 5vw, 44px)",
            color: "var(--ink)",
            margin: "0 0 10px",
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
          }}>
            {t(locale, STEP_TITLE_KEYS[step - 1])}
          </h1>
          <p style={{ fontSize: "15px", color: "var(--ink-3)", margin: 0, lineHeight: 1.55 }}>
            {t(locale, STEP_SUB_KEYS[step - 1])}
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
                    color: ageGroup === a.value ? "var(--terracotta)" : "var(--ink)",
                  }}>{t(locale, a.labelKey)}</div>
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
                      color: nativeLanguage === l.value ? "var(--terracotta)" : "var(--ink)",
                    }}>{l.value === "other" ? t(locale, "onb_langOther") : l.label}</span>
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
                        color: learningGoal === g.value ? "var(--terracotta)" : "var(--ink)",
                      }}>{t(locale, g.labelKey)}</div>
                      <div style={{ fontSize: "12px", color: "var(--ink-3)" }}>{t(locale, g.descKey)}</div>
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
                        color: proficiencyLevel === p.value ? "var(--terracotta)" : "var(--ink)",
                      }}>{t(locale, p.labelKey)}</div>
                      <div style={{ fontSize: "12px", color: "var(--ink-3)" }}>{t(locale, p.descKey)}</div>
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
                    fontSize: "22px", fontWeight: 800, fontFamily: "var(--display)",
                    color: dailyGoalMinutes === d.value ? "var(--terracotta)" : "var(--ink)",
                    marginBottom: "4px",
                  }}>{t(locale, d.labelKey)}</div>
                  <div style={{ fontSize: "12px", color: "var(--ink-3)", lineHeight: 1.4 }}>{t(locale, d.subKey)}</div>
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
              className="lv-btn lv-btn--ghost"
              style={{ flexShrink: 0 }}
            >
              <ArrowLeft size={15} /> {t(locale, "onb_back")}
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed() || submitting}
            className="lv-btn lv-btn--primary"
            style={{
              flex: 1,
              opacity: !canProceed() || submitting ? 0.5 : 1,
              cursor: !canProceed() || submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? t(locale, "onb_saving") : step === TOTAL_STEPS ? (
              <>{t(locale, "onb_letsStart")} <Check size={15} /></>
            ) : (
              <>{t(locale, "onb_continue")} <ArrowRight size={15} /></>
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
              fontFamily: "var(--mono)", fontSize: "11px", letterSpacing: "0.08em",
              textTransform: "uppercase", color: "var(--ink-3)", textDecoration: "underline",
            }}
          >
            {t(locale, "onb_skip")}
          </button>
        </p>

      </div>
    </div>
  );
}
