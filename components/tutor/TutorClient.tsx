"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage, TutorScenario, TutorFeedback, LEVEL_MILESTONES } from "@/types";
import { SCENARIO_INFO } from "@/lib/scenarios";
import Link from "next/link";

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

const avatarNames: Record<string, string> = {
  waiter: "Pierre", traveler: "Sophie", teacher: "Mme Dubois", free: "Alex",
};

interface Props { userLevel: number; }

export function TutorClient({ userLevel }: Props) {
  const [scenario, setScenario] = useState<TutorScenario | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [feedback, setFeedback] = useState<TutorFeedback | null>(null);
  const [xpEarned, setXpEarned] = useState(0);
  const [sessionEnded, setSessionEnded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isLocked = userLevel < TUTOR_UNLOCK_LEVEL;
  const milestone = LEVEL_MILESTONES.find((m) => m.level === TUTOR_UNLOCK_LEVEL);
  const xpNeeded = Math.floor(100 * Math.pow(TUTOR_UNLOCK_LEVEL - 1, 1.5));

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
          AI Tutor Locked
        </h1>
        <p className="text-sm mb-2" style={{ color: "var(--text-2)" }}>
          Reach <span className="font-bold" style={{ color: "var(--accent)" }}>Level {TUTOR_UNLOCK_LEVEL}</span> to
          unlock AI conversation practice.
        </p>
        <p className="text-xs mb-8" style={{ color: "var(--text-3)" }}>
          You need <span style={{ color: "var(--gold)" }}>{xpNeeded} XP</span> total to unlock this feature.
          Keep learning — you&apos;re at Level {userLevel}!
        </p>

        <div
          className="rounded-2xl p-5 mb-8 text-left"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
        >
          <p className="text-xs font-bold mb-3" style={{ color: "var(--text-3)" }}>HOW TO EARN XP FAST</p>
          <div className="space-y-2">
            {[
              { emoji: "📖", label: "Complete a story chapter", xp: "+50 XP" },
              { emoji: "✅", label: "Pass a quiz",              xp: "+30 XP" },
              { emoji: "🎮", label: "Play a game",              xp: "+20 XP" },
              { emoji: "💾", label: "Save vocabulary words",   xp: "+2 XP each" },
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
          <Link href="/learn" className="btn-primary px-6">Start Learning</Link>
          <Link href="/games" className="btn-secondary px-6">Play Games</Link>
        </div>
      </div>
    );
  }

  const startScenario = async (s: TutorScenario) => {
    setScenario(s);
    setMessages([]);
    setFeedback(null);
    setSessionEnded(false);
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
        { role: "assistant", content: "Désolé, une erreur s'est produite. Please try again." },
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
        recommendation: "Continuez à pratiquer le français!",
      });
    }
  };

  // ===== SCENARIO PICKER =====
  if (!scenario) {
    return (
      <div className="space-y-5 animate-fade-up">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>AI Tutor</h1>
          <p className="text-sm" style={{ color: "var(--text-2)" }}>
            Choose a scenario. The AI will speak mostly French — you must respond in French too.
          </p>
        </div>

        <div
          className="flex items-center gap-2 px-4 py-3 rounded-2xl mb-2"
          style={{ background: "rgba(124,106,255,0.1)", border: "1px solid rgba(124,106,255,0.2)" }}
        >
          <span>🇫🇷</span>
          <p className="text-xs" style={{ color: "var(--accent)" }}>
            <strong>French only mode.</strong> The AI will correct your grammar and insist on French responses.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SCENARIOS.map((s) => {
            const colors = SCENARIO_COLORS[s.id];
            return (
              <button
                key={s.id}
                onClick={() => startScenario(s.id)}
                className="text-left p-5 rounded-2xl transition-all group"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.border = `1px solid ${colors.accent}40`;
                  e.currentTarget.style.background = colors.dim;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.border = "1px solid var(--border)";
                  e.currentTarget.style.background = "var(--surface-2)";
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 transition-transform group-hover:scale-105"
                    style={{ background: colors.dim, border: `1px solid ${colors.accent}30` }}
                  >
                    {s.emoji}
                  </div>
                  <div>
                    <p className="font-semibold text-base" style={{ color: "var(--text)" }}>{s.label}</p>
                    <p className="text-xs" style={{ color: "var(--text-3)" }}>{s.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white flex-shrink-0"
                    style={{ background: colors.gradient }}
                  >
                    {avatarNames[s.id]?.[0]}
                  </div>
                  <span className="text-xs" style={{ color: "var(--text-3)" }}>Practice with {avatarNames[s.id]}</span>
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

  // ===== FEEDBACK PANEL =====
  if (sessionEnded && feedback) {
    return (
      <div className="space-y-4 animate-fade-up">
        {xpEarned > 0 && (
          <div
            className="text-center py-6 rounded-2xl"
            style={{ background: "linear-gradient(135deg, rgba(124,106,255,0.3), rgba(67,56,202,0.3))", border: "1px solid rgba(124,106,255,0.3)" }}
          >
            <p className="text-5xl font-black" style={{ color: "var(--accent)" }}>+{xpEarned} XP</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>Session complète !</p>
          </div>
        )}

        <div className="card p-5">
          <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text)" }}>Session Feedback</h2>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { label: "Grammar",  value: feedback.grammarScore, color: "var(--accent)" },
              { label: "Accuracy", value: feedback.accuracyPct,  color: "var(--green)" },
            ].map((score) => (
              <div
                key={score.label}
                className="text-center p-4 rounded-xl"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
              >
                <p className="text-4xl font-black" style={{ color: score.color }}>{score.value}%</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>{score.label}</p>
              </div>
            ))}
          </div>

          {feedback.strengths.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: "var(--text-3)" }}>Strengths</p>
              <div className="space-y-1.5">
                {feedback.strengths.map((s, i) => (
                  <div
                    key={i}
                    className="text-sm px-3 py-2 rounded-xl"
                    style={{ background: "rgba(52,211,153,0.1)", color: "var(--green)", border: "1px solid rgba(52,211,153,0.2)" }}
                  >
                    ✓ {s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {feedback.corrections.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: "var(--text-3)" }}>Corrections</p>
              <div className="space-y-1.5">
                {feedback.corrections.map((c, i) => (
                  <div
                    key={i}
                    className="text-sm px-3 py-2.5 rounded-xl"
                    style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }}
                  >
                    <p>
                      <span style={{ color: "var(--red)", textDecoration: "line-through" }}>{c.original}</span>
                      <span style={{ color: "var(--text-3)" }}> → </span>
                      <span style={{ color: "var(--green)", fontWeight: 600 }}>{c.corrected}</span>
                    </p>
                    <p className="text-[11px] mt-1" style={{ color: "var(--text-3)" }}>{c.rule}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div
            className="px-3 py-2.5 rounded-xl text-sm"
            style={{ background: "rgba(124,106,255,0.1)", color: "var(--text-2)", border: "1px solid rgba(124,106,255,0.2)" }}
          >
            <span className="font-bold" style={{ color: "var(--accent)" }}>Recommendation: </span>
            {feedback.recommendation}
          </div>
        </div>

        <button
          onClick={() => { setScenario(null); setMessages([]); setFeedback(null); setSessionEnded(false); }}
          className="btn-primary w-full"
        >
          Start new session
        </button>
      </div>
    );
  }

  // ===== CHAT INTERFACE =====
  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 rounded-2xl mb-4 flex-shrink-0"
        style={{ background: colors.dim, border: `1px solid ${colors.accent}30` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: colors.gradient }}
          >
            {scenarioInfo.emoji}
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>{scenarioInfo.label}</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <p className="text-xs" style={{ color: "var(--text-3)" }}>with {avatarNames[scenario]}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={endSession}
            disabled={messages.length < 2}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-30"
            style={{ background: "rgba(52,211,153,0.15)", color: "var(--green)", border: "1px solid rgba(52,211,153,0.2)" }}
          >
            End & Review
          </button>
          <button
            onClick={() => setScenario(null)}
            className="btn-ghost text-xs px-3 py-1.5"
          >
            Change
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 px-1">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-up`}
            style={{ animationDelay: `${i * 30}ms` }}
          >
            {msg.role === "assistant" && (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white mr-2 flex-shrink-0 mt-1"
                style={{ background: colors.gradient }}
              >
                {avatarNames[scenario]?.[0]}
              </div>
            )}
            <div
              className="max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
              style={
                msg.role === "user"
                  ? { background: "linear-gradient(135deg, #7c6aff, #4338ca)", color: "#fff", borderBottomRightRadius: "4px" }
                  : { background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)", borderBottomLeftRadius: "4px" }
              }
            >
              {msg.content || (
                <div className="flex gap-1.5 py-1">
                  <div className="w-2 h-2 rounded-full animate-typing-dot" style={{ background: "var(--text-3)" }} />
                  <div className="w-2 h-2 rounded-full animate-typing-dot" style={{ background: "var(--text-3)", animationDelay: "0.2s" }} />
                  <div className="w-2 h-2 rounded-full animate-typing-dot" style={{ background: "var(--text-3)", animationDelay: "0.4s" }} />
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* French reminder pill */}
      <div
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs mb-2 self-center"
        style={{ background: "rgba(124,106,255,0.1)", color: "var(--accent)", border: "1px solid rgba(124,106,255,0.15)" }}
      >
        🇫🇷 Répondez en français
      </div>

      {/* Input */}
      <div className="flex gap-3 flex-shrink-0">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Écrivez en français..."
          className="input flex-1"
          disabled={streaming}
        />
        <button
          onClick={handleSend}
          disabled={streaming || !input.trim()}
          className="btn-primary px-5 flex-shrink-0"
        >
          {streaming ? (
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-typing-dot" />
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-typing-dot" style={{ animationDelay: "0.2s" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-typing-dot" style={{ animationDelay: "0.4s" }} />
            </div>
          ) : "Envoyer"}
        </button>
      </div>
    </div>
  );
}
