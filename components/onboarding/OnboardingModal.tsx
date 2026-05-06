"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Gamepad2, BookOpen, Brain, ArrowRight, CheckCircle2, X } from "lucide-react";

const LEVELS = [
  { id: "A1", label: "A1 — Beginner",      desc: "I know almost nothing" },
  { id: "A2", label: "A2 — Elementary",    desc: "I know a few basics" },
  { id: "B1", label: "B1 — Intermediate",  desc: "I can hold simple conversations" },
  { id: "B2", label: "B2 — Upper-Inter",   desc: "I'm fairly comfortable" },
  { id: "C1", label: "C1 — Advanced",      desc: "I'm nearly fluent" },
  { id: "C2", label: "C2 — Mastery",       desc: "I'm fully fluent" },
];

const DAILY_GOALS = [
  { minutes: 5,  label: "5 min",  desc: "Casual" },
  { minutes: 10, label: "10 min", desc: "Regular" },
  { minutes: 20, label: "20 min", desc: "Serious" },
  { minutes: 30, label: "30 min", desc: "Intense" },
];

const FEATURES = [
  {
    icon: <Gamepad2 size={22} style={{ color: "#a78bfa" }} />,
    bg: "rgba(139,92,246,0.12)",
    title: "12+ Games",
    desc: "Flashcards, dictation, city explorer, job interview — learn by doing.",
  },
  {
    icon: <BookOpen size={22} style={{ color: "#2dd4bf" }} />,
    bg: "rgba(45,212,191,0.12)",
    title: "Interactive Stories",
    desc: "Read branching narratives, answer quizzes, unlock new chapters.",
  },
  {
    icon: <Brain size={22} style={{ color: "#60a5fa" }} />,
    bg: "rgba(96,165,250,0.12)",
    title: "Spaced Repetition",
    desc: "Save words in any game and review them at the perfect moment.",
  },
];

interface Props {
  targetLang: string;
  langLabel: string;
  langFlag: string;
}

export function OnboardingModal({ targetLang, langLabel, langFlag }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState("B1");
  const [goal, setGoal] = useState(10);
  const [saving, setSaving] = useState(false);
  const [closed, setClosed] = useState(false);

  if (closed) return null;

  async function finish() {
    setSaving(true);
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ageGroup: "adult",
          nativeLanguage: "en",
          learningGoal: "general",
          proficiencyLevel: level,
          dailyGoalMinutes: goal,
        }),
      });
    } catch (_) {
      // non-blocking — don't block the user on a network hiccup
    }
    setClosed(true);
    router.refresh();
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border-md)",
          borderRadius: 20,
          width: "100%", maxWidth: 480,
          padding: "2rem",
          position: "relative",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
        }}
      >
        {/* Close */}
        <button
          onClick={() => setClosed(true)}
          style={{
            position: "absolute", top: 14, right: 14,
            background: "var(--surface-2)", border: "1px solid var(--border)",
            borderRadius: 8, padding: "4px 6px",
            color: "var(--text-3)", cursor: "pointer",
            display: "flex", alignItems: "center",
          }}
        >
          <X size={14} />
        </button>

        {/* Step dots */}
        <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                height: 4, flex: 1, borderRadius: 99,
                background: i <= step ? "var(--accent)" : "var(--border)",
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>

        {/* ── Step 0: Welcome ── */}
        {step === 0 && (
          <div>
            <div style={{ fontSize: 48, marginBottom: 12 }}>{langFlag}</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", marginBottom: 8, letterSpacing: "-0.02em" }}>
              Welcome to Lingova!
            </h2>
            <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7, marginBottom: 24 }}>
              You're learning <strong style={{ color: "var(--text)" }}>{langLabel}</strong>.
              Let's take 30 seconds to personalise your experience — then you're good to go.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    background: f.bg, border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 12, padding: "12px 14px",
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: "rgba(0,0,0,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {f.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", margin: 0 }}>{f.title}</p>
                    <p style={{ fontSize: 11, color: "var(--text-3)", margin: 0, marginTop: 2 }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep(1)}
              style={{
                width: "100%", padding: "12px 0", borderRadius: 12,
                background: "var(--accent)", color: "#fff",
                fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              Get started <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ── Step 1: Level + Daily Goal ── */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", marginBottom: 4, letterSpacing: "-0.02em" }}>
              Quick setup
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 20 }}>
              This helps us pick the right content difficulty for you.
            </p>

            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
              Your {langLabel} level
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24 }}>
              {LEVELS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLevel(l.id)}
                  style={{
                    padding: "10px 12px", borderRadius: 10, textAlign: "left",
                    background: level === l.id ? "var(--accent-dim)" : "var(--surface-2)",
                    border: `1px solid ${level === l.id ? "rgba(99,102,241,0.5)" : "var(--border)"}`,
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                >
                  <p style={{ fontSize: 12, fontWeight: 700, color: level === l.id ? "var(--accent-2)" : "var(--text)", margin: 0 }}>{l.id}</p>
                  <p style={{ fontSize: 10, color: "var(--text-3)", margin: 0, marginTop: 2 }}>{l.desc}</p>
                </button>
              ))}
            </div>

            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
              Daily goal
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 28 }}>
              {DAILY_GOALS.map((g) => (
                <button
                  key={g.minutes}
                  onClick={() => setGoal(g.minutes)}
                  style={{
                    padding: "10px 8px", borderRadius: 10, textAlign: "center",
                    background: goal === g.minutes ? "var(--accent-dim)" : "var(--surface-2)",
                    border: `1px solid ${goal === g.minutes ? "rgba(99,102,241,0.5)" : "var(--border)"}`,
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                >
                  <p style={{ fontSize: 13, fontWeight: 800, color: goal === g.minutes ? "var(--accent-2)" : "var(--text)", margin: 0 }}>{g.label}</p>
                  <p style={{ fontSize: 10, color: "var(--text-3)", margin: 0, marginTop: 2 }}>{g.desc}</p>
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setStep(0)}
                style={{
                  flex: 1, padding: "12px 0", borderRadius: 12,
                  background: "var(--surface-2)", color: "var(--text-2)",
                  fontSize: 14, fontWeight: 600, border: "1px solid var(--border)", cursor: "pointer",
                }}
              >
                Back
              </button>
              <button
                onClick={() => setStep(2)}
                style={{
                  flex: 2, padding: "12px 0", borderRadius: 12,
                  background: "var(--accent)", color: "#fff",
                  fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                Next <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Tips ── */}
        {step === 2 && (
          <div>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🚀</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", marginBottom: 8, letterSpacing: "-0.02em" }}>
              You're all set!
            </h2>
            <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7, marginBottom: 20 }}>
              A few tips to get the most out of Lingova:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              {[
                { emoji: "🛡️", tip: "Earn streak shields by playing 7 days in a row — they protect your streak if you miss a day." },
                { emoji: "💾", tip: "Tap any word during a game to save it. It'll appear in your daily review with spaced repetition." },
                { emoji: "🎯", tip: "Check Today's Plan on your home screen — it always shows the next best thing to study." },
              ].map((t) => (
                <div
                  key={t.emoji}
                  style={{
                    display: "flex", gap: 12, alignItems: "flex-start",
                    background: "var(--surface-2)", border: "1px solid var(--border)",
                    borderRadius: 12, padding: "12px 14px",
                  }}
                >
                  <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{t.emoji}</span>
                  <p style={{ fontSize: 13, color: "var(--text-2)", margin: 0, lineHeight: 1.6 }}>{t.tip}</p>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  flex: 1, padding: "12px 0", borderRadius: 12,
                  background: "var(--surface-2)", color: "var(--text-2)",
                  fontSize: 14, fontWeight: 600, border: "1px solid var(--border)", cursor: "pointer",
                }}
              >
                Back
              </button>
              <button
                onClick={finish}
                disabled={saving}
                style={{
                  flex: 2, padding: "12px 0", borderRadius: 12,
                  background: "var(--accent)", color: "#fff",
                  fontSize: 14, fontWeight: 700, border: "none",
                  cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                <CheckCircle2 size={16} />
                {saving ? "Saving…" : "Let's go!"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
