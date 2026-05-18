"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { t, getLocale } from "@/lib/i18n";
import { getLanguageConfig } from "@/data/language-config";
import { ChatMessage, TutorScenario, TutorFeedback } from "@/types";
import { SCENARIO_INFO } from "@/lib/scenarios";
import Link from "next/link";
import {
  Send, User, Mic, Sparkles, ShieldCheck, BrainCircuit, Play,
  X, Award, TrendingUp, BookMarked, RotateCcw, ArrowRight, CheckCircle2, AlertCircle, Lightbulb,
} from "lucide-react";

const SCENARIOS = Object.entries(SCENARIO_INFO).map(([key, val]) => ({
  id: key as TutorScenario,
  ...val,
}));

const TUTOR_UNLOCK_LEVEL = 3;

// Persona presets — color-coded UI personas mapped onto our scenarios
const PERSONAS = [
  { id: "sofia",  name: "Sofia",  role: "Language Coach",   description: "Patient, encouraging, focuses on fluency over perfection.", color: "emerald" },
  { id: "marcus", name: "Marcus", role: "Street Expert",    description: "Cool, casual, teaches real-world slang and idioms.",        color: "blue"    },
  { id: "elara",  name: "Elara",  role: "Academic Scholar", description: "Rigorous, focuses on grammar and advanced vocabulary.",     color: "purple"  },
];

const AVATAR_NAMES: Record<string, Record<string, string>> = {
  fr: { waiter: "Pierre",  traveler: "Sophie",  teacher: "Mme Dubois",  free: "Alex" },
  es: { waiter: "Carlos",  traveler: "Elena",   teacher: "Sra. García", free: "Diego" },
  en: { waiter: "Tom",     traveler: "Emma",    teacher: "Ms. Johnson", free: "James" },
};

const GRAMMAR_TIPS: Record<string, Record<string, string[]>> = {
  fr: {
    waiter:  ["Use «je voudrais» (I would like) to order politely.", "«L'addition, s'il vous plaît» means «The bill, please».", "Try «Est-ce que vous avez…?» to ask what's available."],
    traveler:["«Où se trouve…?» means «Where is…?» — great for directions.", "Use «combien coûte» to ask how much something costs.", "«Pouvez-vous m'aider?» = «Can you help me?»"],
    teacher: ["Pay attention to adjective agreement — it changes with gender.", "«Depuis» + present tense expresses ongoing duration.", "Subjunctive follows «il faut que» and «je veux que»."],
    free:    ["Mirror the AI's sentence structures to sound natural.", "Use filler words like «eh bien», «donc», «alors» for fluency.", "Don't translate word-for-word; think in the language instead."],
  },
  es: {
    waiter:  ["Use «me gustaría» (I would like) to order politely.", "«La cuenta, por favor» means «The bill, please».", "Try «¿Tienen…?» to ask what's available."],
    traveler:["«¿Dónde está…?» means «Where is…?» — great for directions.", "Use «¿Cuánto cuesta?» to ask how much something costs.", "«¿Puede ayudarme?» = «Can you help me?»"],
    teacher: ["Pay attention to ser vs estar — both mean 'to be' but differ in use.", "«Hace» + time + «que» expresses ongoing duration.", "Subjunctive follows «es importante que» and «quiero que»."],
    free:    ["Mirror the AI's sentence structures to sound natural.", "Use filler words like «pues», «entonces», «bueno» for fluency.", "Don't translate word-for-word; think in the language instead."],
  },
  en: {
    waiter:  ["Use 'I'd like…' or 'Could I have…' to order politely.", "'Could I get the bill, please?' is the natural way to ask to pay.", "Try 'What do you recommend?' to sound like a native speaker."],
    traveler:["'Excuse me, how do I get to…?' is the standard way to ask directions.", "Use 'Is it far?' or 'How long does it take?' when asking about distance.", "'Could you say that again, please?' is polite when you didn't understand."],
    teacher: ["Articles (a, an, the) are essential — 'a' before consonant sounds, 'an' before vowel sounds.", "Use present perfect ('I have done') for recent actions, simple past ('I did') for finished ones.", "Word order matters: Subject + Verb + Object."],
    free:    ["Use contractions (I'm, you're, it's) to sound more natural in conversation.", "Filler words like 'well', 'you know', 'actually' help you sound fluent.", "Don't be afraid to ask: 'What does … mean?' — native speakers love explaining."],
  },
};

interface Props { userLevel: number; }

export function TutorClient({ userLevel }: Props) {
  const { data: session } = useSession();
  const locale = getLocale((session?.user as any)?.nativeLanguage);
  const langConfig = getLanguageConfig(session?.user?.targetLanguage ?? "fr");
  const avatarNames = AVATAR_NAMES[langConfig.code] ?? AVATAR_NAMES.fr;

  const [persona, setPersona] = useState(PERSONAS[0]);
  const [scenario, setScenario] = useState<TutorScenario | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [feedback, setFeedback] = useState<TutorFeedback | null>(null);
  const [xpEarned, setXpEarned] = useState(0);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackTab, setFeedbackTab] = useState<"corrections" | "strengths" | "next">("corrections");
  const [savingCorrections, setSavingCorrections] = useState(false);
  const [correctionsSaved, setCorrectionsSaved] = useState(false);
  const [pickedScenario, setPickedScenario] = useState<TutorScenario>("waiter");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!scenario) return;
    const interval = setInterval(() => {
      const langTips = GRAMMAR_TIPS[langConfig.code] ?? GRAMMAR_TIPS.fr;
      const tips = langTips[scenario] ?? langTips.free;
      setTipIndex((i) => (i + 1) % tips.length);
    }, 30_000);
    return () => clearInterval(interval);
  }, [scenario, langConfig.code]);

  const isLocked = userLevel < TUTOR_UNLOCK_LEVEL;

  // ===== LOCKED SCREEN =====
  if (isLocked) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <div
          className="w-24 h-24 rounded-3xl mx-auto mb-6 flex items-center justify-center text-4xl lv-card"
          style={{ borderStyle: "dashed" }}
        >
          🔒
        </div>
        <h1 className="serif" style={{ fontSize: 36, marginBottom: 8 }}>
          {t(locale, "tutor_locked")}
        </h1>
        <p className="text-sm mb-2" style={{ color: "var(--ink-2)" }}>
          {t(locale, "tutor_reachLevel", { level: TUTOR_UNLOCK_LEVEL.toString() })}
        </p>
        <p className="mono-sm" style={{ marginBottom: 32, color: "var(--ink-3)" }}>
          {t(locale, "tutor_xpNeeded", { xp: Math.floor(100 * Math.pow(TUTOR_UNLOCK_LEVEL - 1, 1.5)).toString(), level: userLevel.toString() })}
        </p>

        <div className="lv-card p-5 mb-8 text-left">
          <p className="mono-sm" style={{ marginBottom: 12, color: "var(--ink-3)" }}>
            {t(locale, "tutor_earnXpFast")}
          </p>
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
                  <span className="text-sm" style={{ color: "var(--ink-2)" }}>{item.label}</span>
                </div>
                <span className="mono-sm" style={{ color: "var(--terracotta)" }}>{item.xp}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <Link href="/learn" className="lv-btn lv-btn--primary">{t(locale, "tutor_startLearning")}</Link>
          <Link href="/games" className="lv-btn lv-btn--ghost">{t(locale, "tutor_playGames")}</Link>
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
    if (!scenario || messages.length < 2 || loadingFeedback) return;
    setSessionEnded(true);
    setFeedbackOpen(true);
    setLoadingFeedback(true);
    setCorrectionsSaved(false);
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
        newVocabulary: [],
        recommendation: "Keep practicing!",
      });
    } finally {
      setLoadingFeedback(false);
    }
  };

  const startNewSession = () => {
    setScenario(null);
    setMessages([]);
    setFeedback(null);
    setSessionEnded(false);
    setFeedbackOpen(false);
    setXpEarned(0);
    setCorrectionsSaved(false);
  };

  const saveCorrectionsAsCards = async () => {
    const vocab = feedback?.newVocabulary ?? [];
    if (!vocab.length || savingCorrections) return;
    setSavingCorrections(true);
    try {
      // Save each NEW VOCABULARY item as its own card: front = the word/short
      // phrase (target language), back = its translation (native language).
      // Never a whole sentence — newVocabulary is sentence-filtered server-side.
      await Promise.all(
        vocab.map((v) =>
          fetch("/api/my-words", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ front: v.word, back: v.translation }),
          })
        )
      );
      setCorrectionsSaved(true);
    } catch {
      // ignore — UI just won't show success state
    } finally {
      setSavingCorrections(false);
    }
  };

  // ESC closes the modal
  useEffect(() => {
    if (!feedbackOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setFeedbackOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [feedbackOpen]);

  // ===== SCENARIO PICKER =====
  if (!scenario) {
    return (
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="text-center space-y-4">
          <div className="mono-sm" style={{ color: "var(--ink-3)" }}>
            § Conversation · live tutor
          </div>
          <h1 className="serif" style={{ fontSize: 56, lineHeight: 1, letterSpacing: "-0.02em" }}>
            {t(locale, "tutor_title")}
          </h1>
          <p style={{ color: "var(--ink-3)", fontSize: 19, maxWidth: 560, margin: "0 auto" }}>
            {t(locale, "tutor_chooseScenario", { lang: langConfig.label })}
          </p>
          <div
            className="inline-flex items-center gap-2 lv-chip"
            style={{ marginTop: 4 }}
          >
            <span className="text-base">{langConfig.flag}</span>
            <span className="mono-sm">{langConfig.label} only mode</span>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PERSONAS.map((p) => {
            const isActive = persona.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setPersona(p)}
                className={`lv-card lv-card--hover p-6 text-left${isActive ? " lv-card--paper2" : ""}`}
                style={{
                  borderColor: isActive ? "var(--ink)" : undefined,
                  borderWidth: isActive ? 1.5 : undefined,
                }}
              >
                <div
                  className="lv-sticker"
                  style={{
                    marginBottom: 14,
                    color:
                      p.color === "emerald"
                        ? "var(--lime)"
                        : p.color === "blue"
                        ? "var(--marine)"
                        : "var(--terracotta)",
                  }}
                >
                  <User size={14} /> {p.role}
                </div>
                <h3 className="serif" style={{ fontSize: 26, lineHeight: 1.1 }}>{p.name}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--ink-3)", marginTop: 8 }}>
                  {p.description}
                </p>
              </button>
            );
          })}
        </section>

        <section className="space-y-6">
          <h3 className="serif text-center" style={{ fontSize: 28 }}>Pick a Scenario</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SCENARIOS.map((s) => {
              const isActive = pickedScenario === s.id;
              const avatarName = avatarNames[s.id] ?? "AI";
              return (
                <button
                  key={s.id}
                  onClick={() => setPickedScenario(s.id)}
                  className={`lv-card lv-card--hover p-4 flex flex-col items-center gap-2 text-center${isActive ? " lv-card--paper2" : ""}`}
                  style={{
                    borderColor: isActive ? "var(--ink)" : undefined,
                    opacity: isActive ? 1 : 0.65,
                  }}
                >
                  <span className="text-3xl">{s.emoji}</span>
                  <span className="text-xs font-bold" style={{ color: "var(--ink)" }}>{s.label}</span>
                  <span className="mono-sm" style={{ color: "var(--ink-3)" }}>with {avatarName}</span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="flex justify-center">
          <button
            onClick={() => startScenario(pickedScenario)}
            className="lv-btn lv-btn--primary lv-btn--lg flex items-center gap-3"
          >
            Start Immersion Session <Play size={20} />
          </button>
        </div>
      </div>
    );
  }

  // ===== CHAT INTERFACE =====
  const scenarioInfo = SCENARIO_INFO[scenario];
  const currentAvatarName = avatarNames[scenario] ?? "AI";

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col max-w-4xl mx-auto">
      <header
        className="flex items-center justify-between pb-6"
        style={{ borderBottom: "1px solid var(--line)" }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center serif"
            style={{ background: "var(--terracotta)", color: "#fff", fontSize: 20 }}
          >
            {currentAvatarName[0]}
          </div>
          <div>
            <h2 className="serif flex items-center gap-2" style={{ fontSize: 22 }}>
              {currentAvatarName}
              <span
                className={sessionEnded ? "" : "animate-pulse"}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: sessionEnded ? "var(--ink-4)" : "var(--lime)",
                }}
              />
            </h2>
            <p className="mono-sm" style={{ color: "var(--ink-3)" }}>
              {scenarioInfo.label}{sessionEnded ? " · ended" : ""}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {sessionEnded && feedback ? (
            <button
              onClick={() => setFeedbackOpen(true)}
              className="lv-btn lv-btn--marine lv-btn--sm flex items-center gap-2"
            >
              <Award size={14} /> View feedback
            </button>
          ) : (
            <>
              <button
                className="lv-btn lv-btn--ghost lv-btn--icon"
                title="Safe practice"
              >
                <ShieldCheck size={20} />
              </button>
              <button
                onClick={endSession}
                disabled={messages.length < 2 || loadingFeedback}
                className="lv-btn lv-btn--ghost lv-btn--sm disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ color: "var(--rose)" }}
              >
                End
              </button>
            </>
          )}
        </div>
      </header>

      <div className="flex-1 py-8 space-y-6 overflow-y-auto pr-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={msg.role === "user" ? "max-w-[80%]" : "lv-card lv-card--paper2 max-w-[80%]"}
              style={
                msg.role === "user"
                  ? {
                      background: "var(--terracotta)",
                      color: "#fff",
                      padding: "12px 18px",
                      borderRadius: 16,
                      borderTopRightRadius: 4,
                    }
                  : { padding: "12px 18px", borderTopLeftRadius: 4 }
              }
            >
              {msg.content ? (
                <p className="text-lg leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <span className="flex gap-1">
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--ink-4)", animation: "lv-fade-in 600ms infinite alternate" }} />
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--ink-4)", animation: "lv-fade-in 600ms infinite alternate 150ms" }} />
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--ink-4)", animation: "lv-fade-in 600ms infinite alternate 300ms" }} />
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <footer className="pt-6" style={{ borderTop: "1px solid var(--line)" }}>
        {sessionEnded ? (
          <div className="flex items-center justify-between gap-4 px-2 py-3">
            <p className="text-sm serif-i" style={{ color: "var(--ink-3)" }}>
              Session ended. Read the conversation or start a new session.
            </p>
            <button
              onClick={startNewSession}
              className="lv-btn lv-btn--primary flex items-center gap-2"
            >
              <RotateCcw size={16} /> New session
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <button className="lv-btn lv-btn--ghost lv-btn--icon">
                <Mic size={24} />
              </button>
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={`Respond to ${currentAvatarName}…`}
                  disabled={streaming}
                  className="lv-input w-full disabled:opacity-50"
                  style={{ paddingRight: 56 }}
                />
                <button
                  onClick={handleSend}
                  disabled={streaming || !input.trim()}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 lv-btn lv-btn--icon lv-btn--sm ${
                    input.trim() && !streaming ? "lv-btn--primary" : ""
                  }`}
                  style={
                    input.trim() && !streaming
                      ? undefined
                      : { background: "transparent", color: "var(--ink-4)", cursor: "not-allowed" }
                  }
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between px-2 mono-sm" style={{ color: "var(--ink-3)" }}>
              <span>{langConfig.flag} Respond in {langConfig.label}</span>
              <div className="flex items-center gap-1">
                <Sparkles size={12} /> AI tutor offers grammar corrections in character
              </div>
            </div>
          </>
        )}
      </footer>

      {/* ===== Feedback modal (loading + result) ===== */}
      {feedbackOpen && (
        <div
          onClick={() => !loadingFeedback && setFeedbackOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
          style={{ background: "rgba(28,25,23,0.55)", backdropFilter: "blur(8px)" }}
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="lv-card w-full max-w-2xl max-h-[90vh] flex flex-col"
            style={{ animation: "lv-pop 0.32s var(--ease-spring) both", padding: 0 }}
          >
            {loadingFeedback || !feedback ? (
              <div className="flex flex-col items-center justify-center gap-5 px-8 py-16">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center animate-pulse"
                  style={{ background: "var(--marine-soft)", color: "var(--marine)" }}
                >
                  <BrainCircuit size={36} />
                </div>
                <div className="text-center">
                  <p className="serif" style={{ fontSize: 26, marginBottom: 4 }}>Analysing your session…</p>
                  <p className="mono-sm" style={{ color: "var(--ink-3)" }}>
                    Preparing personalised feedback
                  </p>
                </div>
                <div className="flex gap-1.5">
                  {[0, 0.2, 0.4].map((d) => (
                    <div
                      key={d}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "var(--terracotta)",
                        animation: "lv-fade-in 1.2s ease infinite alternate",
                        animationDelay: `${d}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* HERO — XP + scores */}
                <div className="relative p-6 md:p-8" style={{ borderBottom: "1px solid var(--line)" }}>
                  <button
                    onClick={() => setFeedbackOpen(false)}
                    aria-label="Close"
                    className="absolute top-4 right-4 lv-btn lv-btn--ghost lv-btn--icon lv-btn--sm"
                  >
                    <X size={16} />
                  </button>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={14} style={{ color: "var(--terracotta)" }} />
                    <span className="mono-sm" style={{ color: "var(--terracotta)" }}>
                      Session feedback
                    </span>
                  </div>
                  <h2 className="serif" style={{ fontSize: 36, marginBottom: 20 }}>
                    {feedback.grammarScore >= 85
                      ? "Outstanding work."
                      : feedback.grammarScore >= 70
                      ? "Solid progress."
                      : feedback.grammarScore >= 50
                      ? "Good effort — keep going."
                      : "Every attempt builds you up."}
                  </h2>

                  <div className="grid grid-cols-3 gap-3">
                    {/* XP earned */}
                    <div className="lv-card lv-card--paper2" style={{ padding: 16 }}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Award size={14} style={{ color: "var(--terracotta)" }} />
                        <span className="mono-sm" style={{ color: "var(--ink-3)" }}>XP</span>
                      </div>
                      <p className="serif" style={{ fontSize: 40, lineHeight: 1, color: "var(--terracotta)" }}>+{xpEarned}</p>
                    </div>
                    {/* Grammar */}
                    <div className="lv-card lv-card--paper2" style={{ padding: 16 }}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <CheckCircle2 size={14} style={{ color: "var(--fg-success)" }} />
                        <span className="mono-sm" style={{ color: "var(--ink-3)" }}>Grammar</span>
                      </div>
                      <p className="serif" style={{ fontSize: 40, lineHeight: 1, color: "var(--fg-success)" }}>{feedback.grammarScore}%</p>
                      <div className="lv-progress lv-progress--lime" style={{ marginTop: 8 }}>
                        <span style={{ width: `${feedback.grammarScore}%` }} />
                      </div>
                    </div>
                    {/* Accuracy */}
                    <div className="lv-card lv-card--paper2" style={{ padding: 16 }}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <TrendingUp size={14} style={{ color: "var(--marine)" }} />
                        <span className="mono-sm" style={{ color: "var(--ink-3)" }}>Accuracy</span>
                      </div>
                      <p className="serif" style={{ fontSize: 40, lineHeight: 1, color: "var(--marine)" }}>{feedback.accuracyPct}%</p>
                      <div className="lv-progress lv-progress--marine" style={{ marginTop: 8 }}>
                        <span style={{ width: `${feedback.accuracyPct}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* TABS */}
                <div className="flex items-center gap-1 px-4 md:px-6 pt-4" style={{ borderBottom: "1px solid var(--line)" }}>
                  {([
                    { id: "corrections", label: "Corrections", count: feedback.corrections.length, Icon: AlertCircle },
                    { id: "strengths",   label: "Wins",        count: feedback.strengths.length,   Icon: CheckCircle2 },
                    { id: "next",        label: "Next steps",  count: 0,                            Icon: Lightbulb },
                  ] as const).map((tab) => {
                    const active = feedbackTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setFeedbackTab(tab.id)}
                        className="flex items-center gap-2 px-4 py-3 mono-sm"
                        style={{
                          borderBottom: `2px solid ${active ? "var(--terracotta)" : "transparent"}`,
                          color: active ? "var(--ink)" : "var(--ink-3)",
                        }}
                      >
                        <tab.Icon size={14} />
                        <span>{tab.label}</span>
                        {tab.count > 0 && (
                          <span className={`lv-chip${active ? " lv-chip--terra" : ""}`} style={{ fontSize: 10, padding: "2px 8px" }}>
                            {tab.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* TAB CONTENT (scrollable) */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                  {feedbackTab === "corrections" && (
                    feedback.corrections.length === 0 ? (
                      <div className="text-center py-12" style={{ color: "var(--ink-3)" }}>
                        <CheckCircle2 size={32} className="mx-auto mb-3" style={{ color: "var(--fg-success)" }} />
                        <p className="serif" style={{ fontSize: 19 }}>No corrections — clean work.</p>
                      </div>
                    ) : (
                      <ul className="space-y-3">
                        {feedback.corrections.map((c, i) => (
                          <li
                            key={i}
                            className="lv-card lv-card--paper2"
                            style={{ padding: 16 }}
                          >
                            <div className="flex flex-col gap-2.5">
                              <div className="flex items-start gap-2">
                                <span className="mono-sm shrink-0" style={{ color: "var(--rose)", marginTop: 2 }}>
                                  Was
                                </span>
                                <p style={{ color: "var(--ink-3)", textDecoration: "line-through" }}>
                                  {c.original}
                                </p>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="mono-sm shrink-0" style={{ color: "var(--fg-success)", marginTop: 2 }}>
                                  Should be
                                </span>
                                <p style={{ color: "var(--fg-success)", fontWeight: 500 }}>
                                  {c.corrected}
                                </p>
                              </div>
                              <p
                                className="text-xs serif-i pl-1 pt-1.5"
                                style={{ color: "var(--ink-3)", borderTop: "1px solid var(--line)" }}
                              >
                                {c.rule}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )
                  )}

                  {feedbackTab === "strengths" && (
                    feedback.strengths.length === 0 ? (
                      <div className="text-center py-12" style={{ color: "var(--ink-3)" }}>
                        <Lightbulb size={32} className="mx-auto mb-3" style={{ color: "var(--terracotta)" }} />
                        <p className="serif" style={{ fontSize: 19 }}>More wins next session.</p>
                      </div>
                    ) : (
                      <ul className="space-y-2">
                        {feedback.strengths.map((s, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-3"
                            style={{
                              padding: 14,
                              borderRadius: "var(--r-md)",
                              background: "var(--success-soft)",
                            }}
                          >
                            <CheckCircle2 size={18} className="mt-0.5 shrink-0" style={{ color: "var(--fg-success)" }} />
                            <p className="text-sm leading-relaxed" style={{ color: "var(--ink-2)" }}>{s}</p>
                          </li>
                        ))}
                      </ul>
                    )
                  )}

                  {feedbackTab === "next" && (
                    <div
                      className="lv-card lv-card--paper2"
                      style={{ padding: 20 }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb size={16} style={{ color: "var(--marine)" }} />
                        <span className="mono-sm" style={{ color: "var(--marine)" }}>
                          Recommended next step
                        </span>
                      </div>
                      <p className="text-base leading-relaxed" style={{ color: "var(--ink-2)" }}>
                        {feedback.recommendation}
                      </p>
                    </div>
                  )}
                </div>

                {/* FOOTER actions */}
                <div
                  className="flex flex-col sm:flex-row gap-2 p-4 md:p-6"
                  style={{ borderTop: "1px solid var(--line)", background: "var(--paper-2)" }}
                >
                  {feedback.newVocabulary.length > 0 && (
                    <button
                      onClick={saveCorrectionsAsCards}
                      disabled={savingCorrections || correctionsSaved}
                      className="flex-1 lv-btn lv-btn--ghost flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      <BookMarked size={15} />
                      {correctionsSaved
                        ? "Saved to My Words ✓"
                        : savingCorrections
                        ? "Saving…"
                        : `Save ${feedback.newVocabulary.length} new word${feedback.newVocabulary.length === 1 ? "" : "s"} to My Words`}
                    </button>
                  )}
                  <button
                    onClick={() => setFeedbackOpen(false)}
                    className="lv-btn lv-btn--ghost flex items-center justify-center gap-2"
                    style={{ border: 0 }}
                  >
                    Continue reading
                  </button>
                  <button
                    onClick={startNewSession}
                    className="lv-btn lv-btn--primary flex items-center justify-center gap-2"
                  >
                    New session <ArrowRight size={15} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
