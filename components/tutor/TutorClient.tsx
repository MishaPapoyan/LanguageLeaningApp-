"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { t, getLocale } from "@/lib/i18n";
import { getLanguageConfig } from "@/data/language-config";
import { ChatMessage, TutorScenario, TutorFeedback, LEVEL_MILESTONES } from "@/types";
import { SCENARIO_INFO } from "@/lib/scenarios";
import Link from "next/link";
import { Zap, MessageSquare, BookOpen, Lightbulb, BarChart2, ChevronRight } from "lucide-react";

const SCENARIOS = Object.entries(SCENARIO_INFO).map(([key, val]) => ({
  id: key as TutorScenario,
  ...val,
}));

const TUTOR_UNLOCK_LEVEL = 3;

const SCENARIO_COLORS: Record<string, { accent: string; dim: string; gradient: string }> = {
  waiter:   { accent: "#f59e0b", dim: "rgba(245,158,11,0.15)",  gradient: "linear-gradient(135deg, #f59e0b, #ef4444)" },
  traveler: { accent: "#60a5fa", dim: "rgba(96,165,250,0.15)",  gradient: "linear-gradient(135deg, #60a5fa, #06b6d4)" },
  teacher:  { accent: "#a78bfa", dim: "rgba(167,139,250,0.15)", gradient: "linear-gradient(135deg, #a78bfa, #7c6aff)" },
  free:     { accent: "#34d399", dim: "rgba(52,211,153,0.15)",  gradient: "linear-gradient(135deg, #34d399, #10b981)" },
};

// LOW-3/LOW-4: Avatar names are language-specific — match the AI persona in lib/claude.ts
const AVATAR_NAMES: Record<string, Record<string, string>> = {
  fr: { waiter: "Pierre",  traveler: "Sophie",  teacher: "Mme Dubois", free: "Alex"          },
  es: { waiter: "Carlos",  traveler: "Elena",   teacher: "Sra. García", free: "Diego"         },
};

// LOW-5: Grammar tips are language-specific
const GRAMMAR_TIPS: Record<string, Record<string, string[]>> = {
  fr: {
    waiter: [
      "Use «je voudrais» (I would like) to order politely.",
      "«L'addition, s'il vous plaît» means «The bill, please».",
      "Try «Est-ce que vous avez…?» to ask what's available.",
    ],
    traveler: [
      "«Où se trouve…?» means «Where is…?» — great for directions.",
      "Use «combien coûte» to ask how much something costs.",
      "«Pouvez-vous m'aider?» = «Can you help me?»",
    ],
    teacher: [
      "Pay attention to adjective agreement — it changes with gender.",
      "«Depuis» + present tense expresses ongoing duration.",
      "Subjunctive follows «il faut que» and «je veux que».",
    ],
    free: [
      "Mirror the AI's sentence structures to sound natural.",
      "Use filler words like «eh bien», «donc», «alors» for fluency.",
      "Don't translate word-for-word; think in the language instead.",
    ],
  },
  es: {
    waiter: [
      "Use «me gustaría» (I would like) to order politely.",
      "«La cuenta, por favor» means «The bill, please».",
      "Try «¿Tienen…?» to ask what's available.",
    ],
    traveler: [
      "«¿Dónde está…?» means «Where is…?» — great for directions.",
      "Use «¿Cuánto cuesta?» to ask how much something costs.",
      "«¿Puede ayudarme?» = «Can you help me?»",
    ],
    teacher: [
      "Pay attention to ser vs estar — both mean 'to be' but differ in use.",
      "«Hace» + time + «que» expresses ongoing duration.",
      "Subjunctive follows «es importante que» and «quiero que».",
    ],
    free: [
      "Mirror the AI's sentence structures to sound natural.",
      "Use filler words like «pues», «entonces», «bueno» for fluency.",
      "Don't translate word-for-word; think in the language instead.",
    ],
  },
};

interface Props { userLevel: number; }

export function TutorClient({ userLevel }: Props) {
  const { data: session } = useSession();
  const locale = getLocale((session?.user as any)?.nativeLanguage);
  const langConfig = getLanguageConfig(session?.user?.targetLanguage ?? "fr");
  const [scenario, setScenario] = useState<TutorScenario | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [feedback, setFeedback] = useState<TutorFeedback | null>(null);
  const [xpEarned, setXpEarned] = useState(0);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cycle grammar tip every 30s
  useEffect(() => {
    if (!scenario) return;
    const interval = setInterval(() => {
      const langTips = GRAMMAR_TIPS[langConfig.code] ?? GRAMMAR_TIPS.fr;
      const tips = langTips[scenario] ?? langTips.free;
      setTipIndex((i) => (i + 1) % tips.length);
    }, 30_000);
    return () => clearInterval(interval);
  }, [scenario]);

  const isLocked = userLevel < TUTOR_UNLOCK_LEVEL;
  const userMessages = messages.filter((m) => m.role === "user");
  const assistantMessages = messages.filter((m) => m.role === "assistant");
  const estimatedXp = userMessages.length * 3;

  // ===== LOCKED SCREEN =====
  if (isLocked) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 animate-fade-up">
        <div
          className="w-24 h-24 rounded-3xl mx-auto mb-6 flex items-center justify-center text-4xl"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border-md)" }}
        >
          🔒
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text)" }}>
          {t(locale, "tutor_locked")}
        </h1>
        <p className="text-sm mb-2" style={{ color: "var(--text-2)" }}>
          {t(locale, "tutor_reachLevel", { level: TUTOR_UNLOCK_LEVEL.toString() })}
        </p>
        <p className="text-xs mb-8" style={{ color: "var(--text-3)" }}>
          {t(locale, "tutor_xpNeeded", { xp: Math.floor(100 * Math.pow(TUTOR_UNLOCK_LEVEL - 1, 1.5)).toString(), level: userLevel.toString() })}
        </p>

        <div
          className="rounded-2xl p-5 mb-8 text-left"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
        >
          <p className="text-xs font-bold mb-3" style={{ color: "var(--text-3)" }}>{t(locale, "tutor_earnXpFast")}</p>
          <div className="space-y-2">
            {[
              { emoji: "📖", label: t(locale, "tutor_completeChapter"), xp: "+50 XP" },
              { emoji: "✅", label: t(locale, "tutor_passQuiz"),         xp: "+30 XP" },
              { emoji: "🎮", label: t(locale, "tutor_playAGame"),        xp: "+20 XP" },
              { emoji: "💾", label: t(locale, "tutor_saveWords"),        xp: "+2 XP each" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">{item.emoji}</span>
                  <span className="text-sm" style={{ color: "var(--text-2)" }}>{item.label}</span>
                </div>
                <span className="text-xs font-bold" style={{ color: "var(--green)" }}>{item.xp}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <Link href="/learn" className="btn-primary px-6">{t(locale, "tutor_startLearning")}</Link>
          <Link href="/games" className="btn-secondary px-6">{t(locale, "tutor_playGames")}</Link>
        </div>
      </div>
    );
  }

  const startScenario = async (s: TutorScenario) => {
    setScenario(s);
    setMessages([]);
    setFeedback(null);
    setSessionEnded(false);
    setTipIndex(0);
    await sendMessage([], s, "");
  };

  const sendMessage = async (
    currentMessages: ChatMessage[],
    currentScenario: TutorScenario,
    userText: string
  ) => {
    const newMessages: ChatMessage[] = userText
      ? [...currentMessages, { role: "user", content: userText }]
      : currentMessages;

    setMessages(newMessages);
    setStreaming(true);

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, scenario: currentScenario }),
      });

      if (!res.ok || !res.body) throw new Error("Stream failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: assistantText };
          return updated;
        });
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: t(locale, "tutor_error") },
      ]);
    } finally {
      setStreaming(false);
      inputRef.current?.focus();
    }
  };

  const handleSend = async () => {
    if (!input.trim() || streaming || !scenario) return;
    const text = input.trim();
    setInput("");
    await sendMessage(messages, scenario, text);
  };

  const endSession = async () => {
    if (!scenario || messages.length < 2) return;
    setSessionEnded(true);
    try {
      const res = await fetch("/api/tutor/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, scenario }),
      });
      const data = await res.json();
      setFeedback(data.feedback);
      setXpEarned(data.xpEarned);
    } catch {
      setFeedback({
        grammarScore: 75, accuracyPct: 75,
        strengths: ["Great effort!"], corrections: [],
        recommendation: "Keep practicing!",
      });
    }
  };

  // ===== SCENARIO PICKER =====
  if (!scenario) {
    return (
      <div className="space-y-5 animate-fade-up" style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", fontFamily: "var(--font-display)", letterSpacing: "-0.02em", marginBottom: 6 }}>
            {t(locale, "tutor_title")}
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-2)" }}>
            {t(locale, "tutor_chooseScenario", { lang: langConfig.label })}
          </p>
        </div>

        {/* Lang mode notice */}
        <div
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 16px", borderRadius: 12, marginBottom: 4,
            background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)",
          }}
        >
          <span style={{ fontSize: 18 }}>{langConfig.flag}</span>
          <p style={{ fontSize: 13, color: "var(--accent-2)" }}>
            {t(locale, "tutor_langOnlyMode", { lang: langConfig.label })}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SCENARIOS.map((s) => {
            const colors = SCENARIO_COLORS[s.id];
            return (
              <button
                key={s.id}
                onClick={() => startScenario(s.id)}
                style={{
                  textAlign: "left", padding: "20px", borderRadius: 18,
                  background: "var(--surface-2)", border: "1px solid var(--border)",
                  cursor: "pointer", transition: "all 0.2s",
                  position: "relative", overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${colors.accent}50`;
                  e.currentTarget.style.background = colors.dim;
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.background = "var(--surface-2)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* Top accent line */}
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 2,
                  background: colors.gradient, borderRadius: "18px 18px 0 0",
                }} />

                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: colors.dim, border: `1px solid ${colors.accent}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 26,
                  }}>
                    {s.emoji}
                  </div>
                  <ChevronRight size={16} style={{ color: "var(--text-3)", marginTop: 4 }} />
                </div>

                <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 4, fontFamily: "var(--font-display)" }}>
                  {s.label}
                </p>
                <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 12, lineHeight: 1.5 }}>
                  {s.description}
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {(() => {
                    const avatarName = (AVATAR_NAMES[langConfig.code] ?? AVATAR_NAMES.fr)[s.id] ?? "AI";
                    return (
                      <>
                        <div style={{
                          width: 24, height: 24, borderRadius: "50%",
                          background: colors.gradient,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 10, fontWeight: 900, color: "#fff",
                        }}>
                          {avatarName[0]}
                        </div>
                        <span style={{ fontSize: 12, color: "var(--text-3)" }}>
                          Practice with {avatarName}
                        </span>
                      </>
                    );
                  })()}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const scenarioInfo = SCENARIO_INFO[scenario];
  const colors = SCENARIO_COLORS[scenario];
  const langTips = GRAMMAR_TIPS[langConfig.code] ?? GRAMMAR_TIPS.fr;
  const tips = langTips[scenario] ?? langTips.free;
  const currentTip = tips[tipIndex % tips.length];

  // ===== FEEDBACK PANEL =====
  if (sessionEnded && feedback) {
    return (
      <div className="space-y-4 animate-fade-up" style={{ maxWidth: 640, margin: "0 auto" }}>
        {xpEarned > 0 && (
          <div
            style={{
              textAlign: "center", padding: "32px 24px", borderRadius: 20,
              background: "linear-gradient(135deg, rgba(99,102,241,0.18), rgba(67,56,202,0.18))",
              border: "1px solid rgba(99,102,241,0.3)",
            }}
          >
            <p style={{ fontSize: 52, fontWeight: 900, color: "var(--accent-2)", fontFamily: "var(--font-mono)", letterSpacing: "-0.03em" }}>
              +{xpEarned} XP
            </p>
            <p style={{ fontSize: 14, color: "var(--text-2)", marginTop: 4 }}>{t(locale, "tutor_sessionComplete")}</p>
          </div>
        )}

        <div className="card p-5">
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", marginBottom: 20 }}>Session Feedback</h2>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { label: "Grammar",  value: feedback.grammarScore, color: "var(--accent)" },
              { label: "Accuracy", value: feedback.accuracyPct,  color: "var(--green)" },
            ].map((score) => (
              <div
                key={score.label}
                style={{
                  textAlign: "center", padding: "20px 16px",
                  background: "var(--surface-2)", border: "1px solid var(--border)",
                  borderRadius: 16,
                }}
              >
                <p style={{ fontSize: 42, fontWeight: 900, color: score.color, fontFamily: "var(--font-mono)", letterSpacing: "-0.03em" }}>
                  {score.value}%
                </p>
                <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {score.label}
                </p>
              </div>
            ))}
          </div>

          {feedback.strengths.length > 0 && (
            <div className="mb-4">
              <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
                Strengths
              </p>
              <div className="space-y-1.5">
                {feedback.strengths.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: 13, padding: "8px 12px", borderRadius: 10,
                      background: "rgba(16,185,129,0.08)", color: "var(--green)",
                      border: "1px solid rgba(16,185,129,0.18)",
                    }}
                  >
                    ✓ {s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {feedback.corrections.length > 0 && (
            <div className="mb-4">
              <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
                Corrections
              </p>
              <div className="space-y-1.5">
                {feedback.corrections.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: 13, padding: "10px 14px", borderRadius: 10,
                      background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.16)",
                    }}
                  >
                    <p>
                      <span style={{ color: "var(--red)", textDecoration: "line-through" }}>{c.original}</span>
                      <span style={{ color: "var(--text-3)" }}> → </span>
                      <span style={{ color: "var(--green)", fontWeight: 600 }}>{c.corrected}</span>
                    </p>
                    <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>{c.rule}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{
            padding: "12px 14px", borderRadius: 12, fontSize: 13,
            background: "var(--accent-dim)", color: "var(--text-2)",
            border: "1px solid rgba(99,102,241,0.2)",
          }}>
            <span style={{ fontWeight: 700, color: "var(--accent-2)" }}>Recommendation: </span>
            {feedback.recommendation}
          </div>
        </div>

        <button
          onClick={() => { setScenario(null); setMessages([]); setFeedback(null); setSessionEnded(false); }}
          className="btn-primary w-full"
          style={{ padding: "13px" }}
        >
          Start new session
        </button>
      </div>
    );
  }

  // ===== CHAT INTERFACE — 2-col on desktop =====
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: 16,
        height: "calc(100vh - 120px)",
        maxWidth: "100%",
      }}
      className="tutor-chat-layout"
    >
      <style>{`
        @media (min-width: 1024px) {
          .tutor-chat-layout {
            grid-template-columns: 1fr 296px !important;
          }
          .tutor-sidebar { display: flex !important; }
        }
        .tutor-sidebar { display: none; }
      `}</style>

      {/* ── Main chat column ── */}
      <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>

        {/* Chat header */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px", borderRadius: 16, marginBottom: 12, flexShrink: 0,
            background: colors.dim, border: `1px solid ${colors.accent}30`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: colors.gradient,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20,
            }}>
              {scenarioInfo.emoji}
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-display)" }}>
                {scenarioInfo.label}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 6px var(--green)" }} />
                <p style={{ fontSize: 11, color: "var(--text-3)" }}>with {avatarNames[scenario]}</p>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={endSession}
              disabled={messages.length < 2}
              style={{
                fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 9,
                background: "rgba(16,185,129,0.12)", color: "var(--green)",
                border: "1px solid rgba(16,185,129,0.22)", cursor: "pointer",
                opacity: messages.length < 2 ? 0.35 : 1, transition: "opacity 0.15s",
              }}
            >
              End & Review
            </button>
            <button onClick={() => setScenario(null)} className="btn-ghost" style={{ fontSize: 12, padding: "6px 12px" }}>
              Change
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 2px", marginBottom: 12, minHeight: 0 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  animation: "fade-up 0.2s ease both",
                  animationDelay: `${Math.min(i * 20, 200)}ms`,
                }}
              >
                {msg.role === "assistant" && (
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                    background: colors.gradient,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 900, color: "#fff",
                    marginRight: 8, marginTop: 4,
                  }}>
                    {avatarNames[scenario]?.[0]}
                  </div>
                )}
                <div
                  style={{
                    maxWidth: "76%", padding: "11px 15px",
                    borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    fontSize: 14, lineHeight: 1.55,
                    ...(msg.role === "user"
                      ? { background: "linear-gradient(135deg, var(--accent), #4338ca)", color: "#fff" }
                      : { background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" }
                    ),
                  }}
                >
                  {msg.content || (
                    <div style={{ display: "flex", gap: 5, padding: "2px 0" }}>
                      {[0, 0.18, 0.36].map((d) => (
                        <div
                          key={d}
                          style={{
                            width: 7, height: 7, borderRadius: "50%",
                            background: "var(--text-3)",
                            animation: "typing-dot 1.2s ease infinite",
                            animationDelay: `${d}s`,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Lang reminder */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          padding: "6px 14px", borderRadius: 999, marginBottom: 10,
          alignSelf: "center",
          background: "rgba(99,102,241,0.08)", color: "var(--accent-2)",
          border: "1px solid rgba(99,102,241,0.15)", fontSize: 12,
        }}>
          {langConfig.flag} Respond in {langConfig.label}
        </div>

        {/* Input */}
        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={`Write in ${langConfig.label}…`}
            className="input"
            style={{ flex: 1, fontSize: 14, padding: "12px 16px" }}
            disabled={streaming}
          />
          <button
            onClick={handleSend}
            disabled={streaming || !input.trim()}
            className="btn-primary"
            style={{ padding: "0 20px", flexShrink: 0 }}
          >
            {streaming ? (
              <div style={{ display: "flex", gap: 4 }}>
                {[0, 0.18, 0.36].map((d) => (
                  <div key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.7)", animation: "typing-dot 1.2s ease infinite", animationDelay: `${d}s` }} />
                ))}
              </div>
            ) : "Send"}
          </button>
        </div>
      </div>

      {/* ── Sidebar (desktop only) ── */}
      <div
        className="tutor-sidebar"
        style={{ flexDirection: "column", gap: 12, overflowY: "auto" }}
      >
        {/* Scenario card */}
        <div style={{
          borderRadius: 16, overflow: "hidden",
          background: "var(--surface-2)", border: "1px solid var(--border)",
        }}>
          <div style={{ height: 3, background: colors.gradient }} />
          <div style={{ padding: "14px 16px" }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
              Active Scenario
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 11, fontSize: 20,
                background: colors.dim, border: `1px solid ${colors.accent}25`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                {scenarioInfo.emoji}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-display)" }}>
                  {scenarioInfo.label}
                </p>
                <p style={{ fontSize: 11, color: "var(--text-3)" }}>with {avatarNames[scenario]}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Session Stats */}
        <div style={{
          borderRadius: 16, padding: "14px 16px",
          background: "var(--surface-2)", border: "1px solid var(--border)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <BarChart2 size={13} style={{ color: "var(--accent-2)" }} />
            <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Session Stats
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[
              { label: "Sent", value: userMessages.length, color: "var(--accent-2)" },
              { label: "Replies", value: assistantMessages.length, color: "var(--teal)" },
              { label: "Est. XP", value: estimatedXp, color: "var(--xp)" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center", padding: "10px 6px", borderRadius: 10, background: "var(--surface-3)" }}>
                <p style={{ fontSize: 20, fontWeight: 800, color: s.color, fontFamily: "var(--font-mono)", letterSpacing: "-0.02em", lineHeight: 1 }}>
                  {s.value}
                </p>
                <p style={{ fontSize: 9, color: "var(--text-3)", marginTop: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Grammar tip */}
        <div style={{
          borderRadius: 16, padding: "14px 16px",
          background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.18)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <Lightbulb size={13} style={{ color: "var(--xp)" }} />
            <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(245,158,11,0.7)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Tip
            </p>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.55 }}>
            {currentTip}
          </p>
        </div>

        {/* End session CTA */}
        <button
          onClick={endSession}
          disabled={messages.length < 2}
          style={{
            width: "100%", padding: "12px", borderRadius: 12, cursor: "pointer",
            background: messages.length >= 2 ? "rgba(16,185,129,0.1)" : "var(--surface-3)",
            border: `1px solid ${messages.length >= 2 ? "rgba(16,185,129,0.3)" : "var(--border)"}`,
            color: messages.length >= 2 ? "var(--green)" : "var(--text-3)",
            fontSize: 13, fontWeight: 700,
            opacity: messages.length < 2 ? 0.5 : 1,
            transition: "all 0.15s",
          }}
        >
          End Session & Get Feedback
        </button>

        {/* Quick link */}
        <button
          onClick={() => setScenario(null)}
          style={{
            width: "100%", padding: "10px", borderRadius: 12, cursor: "pointer",
            background: "transparent", border: "1px solid var(--border)",
            color: "var(--text-3)", fontSize: 12, fontWeight: 600,
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.borderColor = "var(--border-md)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-3)"; e.currentTarget.style.borderColor = "var(--border)"; }}
        >
          ← Change scenario
        </button>
      </div>
    </div>
  );
}
