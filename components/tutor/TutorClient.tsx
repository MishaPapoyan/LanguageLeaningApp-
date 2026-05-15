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
        <div className="w-24 h-24 rounded-3xl mx-auto mb-6 flex items-center justify-center text-4xl bg-white/5 border border-white/10">
          🔒
        </div>
        <h1 className="text-3xl italic mb-2">{t(locale, "tutor_locked")}</h1>
        <p className="text-sm mb-2 text-white/60">
          {t(locale, "tutor_reachLevel", { level: TUTOR_UNLOCK_LEVEL.toString() })}
        </p>
        <p className="text-xs mb-8 text-white/40">
          {t(locale, "tutor_xpNeeded", { xp: Math.floor(100 * Math.pow(TUTOR_UNLOCK_LEVEL - 1, 1.5)).toString(), level: userLevel.toString() })}
        </p>

        <div className="card-premium p-5 mb-8 text-left">
          <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">
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
                  <span className="text-sm text-white/70">{item.label}</span>
                </div>
                <span className="text-xs font-bold text-emerald-500 mono">{item.xp}</span>
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
    if (!feedback?.corrections.length || savingCorrections) return;
    setSavingCorrections(true);
    try {
      // Each correction becomes a custom card: front = corrected phrase, back = rule + original
      await Promise.all(
        feedback.corrections.map((c) =>
          fetch("/api/my-words", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              front: c.corrected,
              back: `${c.rule}${c.original ? ` (was: "${c.original}")` : ""}`,
            }),
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
          <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-purple-500/10 text-purple-400 mb-4 animate-pulse">
            <BrainCircuit size={48} />
          </div>
          <h1 className="text-5xl md:text-6xl italic">{t(locale, "tutor_title")}</h1>
          <p className="text-white/40 text-xl max-w-2xl mx-auto">
            {t(locale, "tutor_chooseScenario", { lang: langConfig.label })}
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs uppercase tracking-widest font-bold text-white/50">
            <span className="text-base">{langConfig.flag}</span>
            <span>{langConfig.label} only mode</span>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PERSONAS.map((p) => {
            const isActive = persona.id === p.id;
            const colorClasses: Record<string, string> = {
              emerald: "bg-emerald-500/20 text-emerald-400",
              blue:    "bg-blue-500/20 text-blue-400",
              purple:  "bg-purple-500/20 text-purple-400",
            };
            return (
              <button
                key={p.id}
                onClick={() => setPersona(p)}
                className={`card-premium p-6 text-left border-2 transition-all ${
                  isActive ? "border-emerald-500 ring-4 ring-emerald-500/10" : "border-white/5"
                }`}
              >
                <div className={`w-10 h-10 rounded-full mb-4 flex items-center justify-center ${colorClasses[p.color]}`}>
                  <User size={20} />
                </div>
                <h3 className="text-xl font-bold italic serif">{p.name}</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">{p.role}</p>
                <p className="text-sm text-white/60 leading-relaxed">{p.description}</p>
              </button>
            );
          })}
        </section>

        <section className="space-y-6">
          <h3 className="text-2xl text-center italic serif">Pick a Scenario</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SCENARIOS.map((s) => {
              const isActive = pickedScenario === s.id;
              const avatarName = avatarNames[s.id] ?? "AI";
              return (
                <button
                  key={s.id}
                  onClick={() => setPickedScenario(s.id)}
                  className={`card-premium p-4 flex flex-col items-center gap-2 text-center transition-all ${
                    isActive ? "bg-white/5 border-white/20" : "opacity-50 hover:opacity-100"
                  }`}
                >
                  <span className="text-3xl">{s.emoji}</span>
                  <span className="text-xs font-bold uppercase tracking-tight">{s.label}</span>
                  <span className="text-[10px] text-white/40">with {avatarName}</span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="flex justify-center">
          <button
            onClick={() => startScenario(pickedScenario)}
            className="btn-primary py-4 px-12 text-lg flex items-center gap-3"
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
      <header className="flex items-center justify-between pb-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold serif italic">
            {currentAvatarName[0]}
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              {currentAvatarName}
              <span className={`w-2 h-2 rounded-full ${sessionEnded ? "bg-white/20" : "bg-emerald-500 animate-pulse"}`} />
            </h2>
            <p className="text-xs text-white/40 uppercase font-bold tracking-widest">
              {scenarioInfo.label}{sessionEnded ? " · ended" : ""}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {sessionEnded && feedback ? (
            <button
              onClick={() => setFeedbackOpen(true)}
              className="px-4 py-3 bg-emerald-500/10 rounded-full hover:bg-emerald-500/20 transition-colors text-emerald-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2"
            >
              <Award size={14} /> View feedback
            </button>
          ) : (
            <>
              <button
                className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                title="Safe practice"
              >
                <ShieldCheck size={20} />
              </button>
              <button
                onClick={endSession}
                disabled={messages.length < 2 || loadingFeedback}
                className="px-4 py-3 bg-white/5 rounded-full hover:bg-rose-500/10 transition-colors text-rose-400 text-xs font-bold uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
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
              className={`max-w-[80%] p-4 rounded-2xl ${
                msg.role === "user"
                  ? "bg-emerald-500 text-black font-medium"
                  : "bg-white/5 border border-white/5"
              }`}
            >
              {msg.content ? (
                <p className="text-lg leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse" />
                  <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                  <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <footer className="pt-6 border-t border-white/10">
        {sessionEnded ? (
          <div className="flex items-center justify-between gap-4 px-2 py-3">
            <p className="text-sm text-white/40 italic">
              Session ended. Read the conversation or start a new session.
            </p>
            <button
              onClick={startNewSession}
              className="btn-primary px-6 py-3 flex items-center gap-2"
            >
              <RotateCcw size={16} /> New session
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <button className="p-4 bg-white/5 rounded-2xl text-white/40 hover:text-white transition-colors">
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
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-emerald-500/50 text-lg disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={streaming || !input.trim()}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
                    input.trim() && !streaming
                      ? "bg-emerald-500 text-black"
                      : "text-white/20 cursor-not-allowed"
                  }`}
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-white/20 px-2">
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
          style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card-premium w-full max-w-2xl max-h-[90vh] flex flex-col"
            style={{ animation: "bounce-in 0.32s var(--ease-spring) both" }}
          >
            {loadingFeedback || !feedback ? (
              <div className="flex flex-col items-center justify-center gap-5 px-8 py-16">
                <div className="w-20 h-20 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-3xl animate-pulse">
                  <BrainCircuit size={36} className="text-purple-400" />
                </div>
                <div className="text-center">
                  <p className="text-2xl italic serif mb-1">Analysing your session…</p>
                  <p className="text-xs text-white/40 uppercase tracking-widest font-bold">
                    Preparing personalised feedback
                  </p>
                </div>
                <div className="flex gap-1.5">
                  {[0, 0.2, 0.4].map((d) => (
                    <div
                      key={d}
                      className="w-2 h-2 rounded-full bg-emerald-500"
                      style={{ animation: "typing-dot 1.2s ease infinite", animationDelay: `${d}s` }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* HERO — XP + scores */}
                <div className="relative p-6 md:p-8 border-b border-white/5">
                  <button
                    onClick={() => setFeedbackOpen(false)}
                    aria-label="Close"
                    className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={14} className="text-emerald-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                      Session feedback
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl serif italic font-bold mb-5">
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
                    <div className="rounded-2xl p-4 bg-gradient-to-br from-amber-500/15 to-transparent border border-amber-500/30">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Award size={14} className="text-amber-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">XP</span>
                      </div>
                      <p className="text-3xl font-bold mono text-amber-400 tracking-tight">+{xpEarned}</p>
                    </div>
                    {/* Grammar */}
                    <div className="rounded-2xl p-4 bg-gradient-to-br from-emerald-500/15 to-transparent border border-emerald-500/30">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <CheckCircle2 size={14} className="text-emerald-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Grammar</span>
                      </div>
                      <p className="text-3xl font-bold mono text-emerald-400 tracking-tight">{feedback.grammarScore}%</p>
                    </div>
                    {/* Accuracy */}
                    <div className="rounded-2xl p-4 bg-gradient-to-br from-blue-500/15 to-transparent border border-blue-500/30">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <TrendingUp size={14} className="text-blue-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Accuracy</span>
                      </div>
                      <p className="text-3xl font-bold mono text-blue-400 tracking-tight">{feedback.accuracyPct}%</p>
                    </div>
                  </div>
                </div>

                {/* TABS */}
                <div className="flex items-center gap-1 px-4 md:px-6 pt-4 border-b border-white/5">
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
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                          active
                            ? "border-emerald-500 text-white"
                            : "border-transparent text-white/40 hover:text-white/70"
                        }`}
                      >
                        <tab.Icon size={14} />
                        <span>{tab.label}</span>
                        {tab.count > 0 && (
                          <span className={`text-[10px] font-bold mono px-1.5 py-0.5 rounded-full ${
                            active ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-white/40"
                          }`}>
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
                      <div className="text-center py-12 text-white/40">
                        <CheckCircle2 size={32} className="mx-auto mb-3 text-emerald-500/40" />
                        <p className="italic serif text-lg">No corrections — clean work.</p>
                      </div>
                    ) : (
                      <ul className="space-y-3">
                        {feedback.corrections.map((c, i) => (
                          <li
                            key={i}
                            className="rounded-2xl p-4 bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                          >
                            <div className="flex flex-col gap-2.5">
                              <div className="flex items-start gap-2">
                                <span className="text-[10px] font-bold mono uppercase tracking-widest text-rose-400 mt-1 shrink-0">
                                  Was
                                </span>
                                <p className="text-rose-300/80 line-through decoration-rose-500/40">
                                  {c.original}
                                </p>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="text-[10px] font-bold mono uppercase tracking-widest text-emerald-400 mt-1 shrink-0">
                                  Should be
                                </span>
                                <p className="text-emerald-300 font-medium">
                                  {c.corrected}
                                </p>
                              </div>
                              <p className="text-xs text-white/50 italic pl-1 pt-1.5 border-t border-white/5">
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
                      <div className="text-center py-12 text-white/40">
                        <Lightbulb size={32} className="mx-auto mb-3 text-amber-500/40" />
                        <p className="italic serif text-lg">More wins next session.</p>
                      </div>
                    ) : (
                      <ul className="space-y-2">
                        {feedback.strengths.map((s, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-3 rounded-xl p-3.5 bg-emerald-500/5 border border-emerald-500/20"
                          >
                            <CheckCircle2 size={18} className="text-emerald-400 mt-0.5 shrink-0" />
                            <p className="text-sm text-emerald-100/90 leading-relaxed">{s}</p>
                          </li>
                        ))}
                      </ul>
                    )
                  )}

                  {feedbackTab === "next" && (
                    <div className="rounded-2xl p-5 bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb size={16} className="text-purple-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">
                          Recommended next step
                        </span>
                      </div>
                      <p className="text-base leading-relaxed text-white/85">
                        {feedback.recommendation}
                      </p>
                    </div>
                  )}
                </div>

                {/* FOOTER actions */}
                <div className="flex flex-col sm:flex-row gap-2 p-4 md:p-6 border-t border-white/5 bg-black/20">
                  {feedback.corrections.length > 0 && (
                    <button
                      onClick={saveCorrectionsAsCards}
                      disabled={savingCorrections || correctionsSaved}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full text-sm font-medium border border-white/10 hover:border-white/20 hover:bg-white/5 transition-colors disabled:opacity-60"
                    >
                      <BookMarked size={15} />
                      {correctionsSaved
                        ? "Saved to My Words ✓"
                        : savingCorrections
                        ? "Saving…"
                        : `Save ${feedback.corrections.length} correction${feedback.corrections.length === 1 ? "" : "s"} to My Words`}
                    </button>
                  )}
                  <button
                    onClick={() => setFeedbackOpen(false)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Continue reading
                  </button>
                  <button
                    onClick={startNewSession}
                    className="btn-primary inline-flex items-center justify-center gap-2 px-5 py-3"
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
