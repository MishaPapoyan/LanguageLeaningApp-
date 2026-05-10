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
    setLoadingFeedback(true);
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

  // ===== LOADING FEEDBACK SCREEN =====
  if (sessionEnded && loadingFeedback) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] gap-5 max-w-md mx-auto">
        <div className="w-20 h-20 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-3xl animate-pulse">
          ✨
        </div>
        <div className="text-center">
          <p className="text-xl italic mb-1">Analysing your session…</p>
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
    );
  }

  // ===== FEEDBACK PANEL =====
  if (sessionEnded && feedback) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        {xpEarned > 0 && (
          <div className="text-center p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/30">
            <p className="text-6xl font-bold text-emerald-500 mono tracking-tight">
              +{xpEarned} XP
            </p>
            <p className="text-sm text-white/60 mt-2 uppercase tracking-widest font-bold">
              {t(locale, "tutor_sessionComplete")}
            </p>
          </div>
        )}

        <div className="card-premium p-6">
          <h2 className="text-2xl serif italic font-bold mb-6">Session Feedback</h2>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { label: "Grammar",  value: feedback.grammarScore, color: "text-emerald-500" },
              { label: "Accuracy", value: feedback.accuracyPct,  color: "text-emerald-500" },
            ].map((score) => (
              <div key={score.label} className="text-center p-5 rounded-2xl bg-white/5 border border-white/10">
                <p className={`text-5xl font-bold mono ${score.color} tracking-tight`}>
                  {score.value}%
                </p>
                <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest font-bold">
                  {score.label}
                </p>
              </div>
            ))}
          </div>

          {feedback.strengths.length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">
                Strengths
              </p>
              <div className="space-y-1.5">
                {feedback.strengths.map((s, i) => (
                  <div key={i} className="text-sm py-2 px-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    ✓ {s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {feedback.corrections.length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">
                Corrections
              </p>
              <div className="space-y-1.5">
                {feedback.corrections.map((c, i) => (
                  <div key={i} className="text-sm py-2.5 px-3.5 rounded-xl bg-rose-500/5 border border-rose-500/20">
                    <p>
                      <span className="text-rose-400 line-through">{c.original}</span>
                      <span className="text-white/40"> → </span>
                      <span className="text-emerald-400 font-semibold">{c.corrected}</span>
                    </p>
                    <p className="text-xs text-white/40 mt-1">{c.rule}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 rounded-xl text-sm bg-purple-500/10 text-white/70 border border-purple-500/20">
            <span className="font-bold text-purple-400">Recommendation: </span>
            {feedback.recommendation}
          </div>
        </div>

        <button
          onClick={() => { setScenario(null); setMessages([]); setFeedback(null); setSessionEnded(false); }}
          className="btn-primary w-full py-4"
        >
          Start new session
        </button>
      </div>
    );
  }

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
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h2>
            <p className="text-xs text-white/40 uppercase font-bold tracking-widest">
              {scenarioInfo.label}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
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
      </footer>
    </div>
  );
}
