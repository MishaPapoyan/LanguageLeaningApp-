"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { speakTarget } from "@/lib/speech";
import { getLanguageConfig } from "@/data/language-config";
import { SCENARIO_INFO } from "@/lib/scenarios";
import { TutorScenario, ChatMessage, TutorFeedback } from "@/types";
import { VideoTutorAvatar, AvatarState } from "./VideoTutorAvatar";
import {
  Mic, MicOff, PhoneOff, Send, ChevronDown, ChevronUp,
  RotateCcw, Play, Volume2, VolumeX, Repeat2,
  Award, BrainCircuit, CheckCircle2, AlertCircle,
  Lightbulb, TrendingUp, BookMarked, X, ArrowRight,
} from "lucide-react";

const AVATAR_NAMES: Record<string, Record<string, string>> = {
  fr: { waiter: "Pierre", traveler: "Sophie", teacher: "Mme Dubois", free: "Alex" },
  es: { waiter: "Carlos", traveler: "Elena",  teacher: "Sra. García", free: "Diego" },
  en: { waiter: "Tom",    traveler: "Emma",   teacher: "Ms. Johnson", free: "James" },
};

const LANG_LOCALE: Record<string, string> = {
  fr: "fr-FR", es: "es-ES", en: "en-US", hy: "hy-AM",
};

const SCENARIOS = Object.entries(SCENARIO_INFO).map(([key, val]) => ({
  id: key as TutorScenario, ...val,
}));

interface Props { userLevel: number; }

export function VideoTutorClient({ userLevel }: Props) {
  const { data: session } = useSession();
  const langConfig = getLanguageConfig(
    (session?.user as { targetLanguage?: string })?.targetLanguage ?? "fr"
  );
  const avatarNames  = AVATAR_NAMES[langConfig.code] ?? AVATAR_NAMES.fr;
  const recognitionLocale = LANG_LOCALE[langConfig.code] ?? "fr-FR";

  // ── session state ──────────────────────────────────────────────────────────
  const [scenario,       setScenario]       = useState<TutorScenario | null>(null);
  const [pickedScenario, setPickedScenario] = useState<TutorScenario>("free");
  const [messages,       setMessages]       = useState<ChatMessage[]>([]);
  const [input,          setInput]          = useState("");
  const [streaming,      setStreaming]       = useState(false);
  const [sessionEnded,   setSessionEnded]   = useState(false);

  // ── avatar / voice state ───────────────────────────────────────────────────
  const [avatarState,   setAvatarState]   = useState<AvatarState>("idle");
  const [isListening,   setIsListening]   = useState(false);
  const [micSupported,  setMicSupported]  = useState(false);
  const [liveTranscript,setLiveTranscript]= useState("");
  const [muted,         setMuted]         = useState(false);
  const [autoListen,    setAutoListen]    = useState(true);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [showTranscript, setShowTranscript] = useState(true);

  // ── feedback state ─────────────────────────────────────────────────────────
  const [feedback,          setFeedback]          = useState<TutorFeedback | null>(null);
  const [xpEarned,          setXpEarned]          = useState(0);
  const [feedbackOpen,      setFeedbackOpen]       = useState(false);
  const [loadingFeedback,   setLoadingFeedback]    = useState(false);
  const [feedbackTab,       setFeedbackTab]        = useState<"corrections"|"strengths"|"next">("corrections");
  const [savingWords,       setSavingWords]        = useState(false);
  const [wordsSaved,        setWordsSaved]         = useState(false);

  // ── refs ───────────────────────────────────────────────────────────────────
  const recognitionRef   = useRef<any>(null);
  const pendingRef       = useRef("");
  const bottomRef        = useRef<HTMLDivElement>(null);
  const inputRef         = useRef<HTMLInputElement>(null);
  // stable refs so callbacks don't go stale
  const mutedRef         = useRef(false);
  const autoListenRef    = useRef(true);
  const sessionEndedRef  = useRef(false);
  const streamingRef     = useRef(false);
  const startListeningFn = useRef<(() => void) | null>(null);

  mutedRef.current       = muted;
  autoListenRef.current  = autoListen;
  sessionEndedRef.current= sessionEnded;
  streamingRef.current   = streaming;

  const currentAvatarName = scenario ? (avatarNames[scenario] ?? "AI") : "AI";
  const userName = (session?.user as { name?: string })?.name ?? "You";

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setMicSupported(!!SR);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, liveTranscript]);

  useEffect(() => {
    if (!feedbackOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setFeedbackOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [feedbackOpen]);

  // ── start listening ────────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR || sessionEndedRef.current || streamingRef.current) return;

    const recognition = new SR();
    recognition.lang = recognitionLocale;
    recognition.continuous = false;   // auto-stops after silence → natural feel
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      let interim = "";
      let finalChunk = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) finalChunk += r[0].transcript;
        else interim += r[0].transcript;
      }
      if (finalChunk) pendingRef.current += finalChunk + " ";
      setLiveTranscript((pendingRef.current + interim).trim());
    };

    recognition.onend = () => {
      setIsListening(false);
      // auto-stops after silence — submit whatever was captured
      const text = pendingRef.current.trim();
      pendingRef.current = "";
      setLiveTranscript("");
      if (text && !sessionEndedRef.current) {
        submitText(text);
      } else {
        setAvatarState("idle");
      }
    };

    recognition.onerror = (e: any) => {
      // "no-speech" is fine — just go idle
      if (e.error !== "no-speech") console.warn("Speech recognition error:", e.error);
      setIsListening(false);
      setAvatarState("idle");
      pendingRef.current = "";
      setLiveTranscript("");
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setAvatarState("listening");
    pendingRef.current = "";
    setLiveTranscript("");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recognitionLocale]);

  // keep ref in sync so speakResponse can call it without stale closure
  startListeningFn.current = startListening;

  // ── stop listening manually ────────────────────────────────────────────────
  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    // onend will handle submission
  }, []);

  // ── submit text to AI ──────────────────────────────────────────────────────
  // kept as a plain function (not useCallback) so it always reads latest messages
  function submitText(text: string) {
    if (!text.trim() || sessionEndedRef.current) return;
    // sendMessage reads current messages via closure captured at call time
    sendMessageFn.current?.(text.trim());
  }

  const sendMessageFn = useRef<((text: string) => void) | null>(null);

  // ── speak response + auto-listen loop ─────────────────────────────────────
  const afterSpeak = useCallback(() => {
    setAvatarState("idle");
    if (autoListenRef.current && !sessionEndedRef.current && !streamingRef.current) {
      setTimeout(() => {
        if (!sessionEndedRef.current && !streamingRef.current) {
          startListeningFn.current?.();
        }
      }, 700);
    }
  }, []);

  const speakResponse = useCallback(async (text: string) => {
    if (mutedRef.current) { afterSpeak(); return; }
    setAvatarState("speaking");
    await speakTarget(text, langConfig.code, 0.88, {
      onPlaying: () => setAvatarState("speaking"),
      onEnd:     () => afterSpeak(),
      onError:   () => afterSpeak(),
    });
  }, [langConfig.code, afterSpeak]);

  // ── send message ───────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (
    currentMessages: ChatMessage[],
    currentScenario: TutorScenario,
    userText: string,
  ) => {
    const newMessages: ChatMessage[] = userText
      ? [...currentMessages, { role: "user", content: userText }]
      : currentMessages;

    setMessages(newMessages);
    setStreaming(true);
    setAvatarState("thinking");

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, scenario: currentScenario }),
      });
      if (!res.ok || !res.body) throw new Error("Stream failed");

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      setMessages(prev => [...prev, { role: "assistant", content: "" }]);
      setAvatarState("idle"); // stop thinking once stream starts

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: assistantText };
          return updated;
        });
      }

      if (assistantText) await speakResponse(assistantText);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
      setAvatarState("idle");
    } finally {
      setStreaming(false);
      inputRef.current?.focus();
    }
  }, [speakResponse]);

  // wire stable ref so submitText can call latest sendMessage
  const messagesRef = useRef<ChatMessage[]>([]);
  const scenarioRef = useRef<TutorScenario | null>(null);
  messagesRef.current = messages;
  scenarioRef.current = scenario;

  sendMessageFn.current = (text: string) => {
    if (!scenarioRef.current) return;
    sendMessage(messagesRef.current, scenarioRef.current, text);
  };

  // ── start scenario ─────────────────────────────────────────────────────────
  const startScenario = async (s: TutorScenario) => {
    setScenario(s);
    setMessages([]);
    setSessionEnded(false);
    setLiveTranscript("");
    setFeedback(null);
    setWordsSaved(false);
    pendingRef.current = "";
    await sendMessage([], s, "");
  };

  const handleTextSend = async () => {
    if (!input.trim() || streaming || !scenario) return;
    const text = input.trim();
    setInput("");
    await sendMessage(messages, scenario, text);
  };

  // ── end session → feedback ─────────────────────────────────────────────────
  const endSession = async () => {
    recognitionRef.current?.abort();
    setIsListening(false);
    setAvatarState("idle");
    setSessionEnded(true);
    sessionEndedRef.current = true;

    if (!scenario || messages.length < 2) return;
    setFeedbackOpen(true);
    setLoadingFeedback(true);
    setWordsSaved(false);
    try {
      const res  = await fetch("/api/tutor/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, scenario }),
      });
      const data = await res.json();
      setFeedback(data.feedback);
      setXpEarned(data.xpEarned);
    } catch {
      setFeedback({ grammarScore: 75, accuracyPct: 75, strengths: ["Great effort!"], corrections: [], newVocabulary: [], recommendation: "Keep practicing!" });
    } finally {
      setLoadingFeedback(false);
    }
  };

  const resetSession = () => {
    setScenario(null);
    setMessages([]);
    setSessionEnded(false);
    setFeedbackOpen(false);
    setLiveTranscript("");
    setFeedback(null);
    setWordsSaved(false);
    pendingRef.current = "";
    setAvatarState("idle");
  };

  const saveVocab = async () => {
    const vocab = feedback?.newVocabulary ?? [];
    if (!vocab.length || savingWords) return;
    setSavingWords(true);
    try {
      await Promise.all(vocab.map(v =>
        fetch("/api/my-words", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ front: v.word, back: v.translation }) })
      ));
      setWordsSaved(true);
    } finally {
      setSavingWords(false);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SCENARIO PICKER
  // ══════════════════════════════════════════════════════════════════════════
  if (!scenario) {
    return (
      <div className="max-w-2xl mx-auto space-y-10 animate-fade-up">
        <header className="text-center space-y-3">
          <div className="mono-sm" style={{ color: "var(--ink-3)" }}>§ Video · AI Tutor</div>
          <h1 className="serif" style={{ fontSize: 48, lineHeight: 1, letterSpacing: "-0.02em" }}>Video Tutor</h1>
          <p style={{ color: "var(--ink-3)", fontSize: 18, maxWidth: 480, margin: "0 auto" }}>
            Talk face-to-face with your AI language tutor. Speaks back, listens automatically.
          </p>
        </header>

        <div style={{ maxWidth: 380, margin: "0 auto" }}>
          <VideoTutorAvatar state="idle" name="Your Tutor" />
        </div>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          {[{ icon: "🎙️", label: "Auto-listens" }, { icon: "🔊", label: "Speaks back" }, { icon: "💬", label: "Live transcript" }, { icon: "🆓", label: "100% free" }].map(b => (
            <div key={b.label} className="lv-chip flex items-center gap-1.5">
              <span>{b.icon}</span><span className="mono-sm">{b.label}</span>
            </div>
          ))}
        </div>

        <section className="space-y-4">
          <h3 className="serif text-center" style={{ fontSize: 24 }}>Choose a scenario</h3>
          <div className="grid grid-cols-2 gap-3">
            {SCENARIOS.map(s => {
              const isActive = pickedScenario === s.id;
              return (
                <button key={s.id} onClick={() => setPickedScenario(s.id)}
                  className={`lv-card lv-card--hover p-4 flex items-center gap-3 text-left${isActive ? " lv-card--paper2" : ""}`}
                  style={{ borderColor: isActive ? "var(--ink)" : undefined, borderWidth: isActive ? 1.5 : undefined, opacity: isActive ? 1 : 0.65 }}
                >
                  <span className="text-2xl">{s.emoji}</span>
                  <div>
                    <div className="text-sm font-bold" style={{ color: "var(--ink)" }}>{s.label}</div>
                    <div className="mono-sm" style={{ color: "var(--ink-3)" }}>with {avatarNames[s.id] ?? "AI"}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <div className="flex justify-center">
          <button onClick={() => startScenario(pickedScenario)} className="lv-btn lv-btn--primary lv-btn--lg flex items-center gap-3">
            <Play size={20} /> Start Video Session
          </button>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // VIDEO CALL
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-4" style={{ height: "calc(100vh - 140px)" }}>

      {/* Main area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">

        {/* Avatar feed */}
        <div className="lg:col-span-2 relative" style={{ minHeight: 280 }}>
          <VideoTutorAvatar state={avatarState} name={currentAvatarName} />

          {/* User PIP */}
          <div style={{ position: "absolute", bottom: 16, right: 16, width: 110, height: 82, borderRadius: 12, background: "linear-gradient(135deg,#1f2937,#374151)", border: "2px solid rgba(255,255,255,0.12)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, overflow: "hidden" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--terracotta)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--display)", fontSize: 18, fontWeight: 600 }}>
              {userName[0]?.toUpperCase() ?? "U"}
            </div>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", fontFamily: "var(--mono)", letterSpacing: "0.06em" }}>You</span>
            {isListening && <div style={{ position: "absolute", bottom: 6, right: 6, width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981", animation: "vt-pip-blink 0.8s ease-in-out infinite" }} />}
          </div>
        </div>

        {/* Side panel */}
        <div className="flex flex-col gap-3 min-h-0">
          {/* Info */}
          <div className="lv-card p-4 space-y-2 shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{SCENARIO_INFO[scenario]?.emoji}</span>
              <div>
                <div className="text-sm font-bold" style={{ color: "var(--ink)" }}>{SCENARIO_INFO[scenario]?.label}</div>
                <div className="mono-sm" style={{ color: "var(--ink-3)" }}>with {currentAvatarName}</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mono-sm" style={{ color: "var(--ink-3)" }}>
              <span>{langConfig.flag}</span><span>{langConfig.label} session</span>
            </div>
            {/* Auto-listen toggle */}
            {micSupported && (
              <button onClick={() => setAutoListen(v => !v)}
                className="flex items-center gap-2 mono-sm w-full"
                style={{ color: autoListen ? "var(--fg-success)" : "var(--ink-4)", paddingTop: 8, borderTop: "1px solid var(--line)", marginTop: 4 }}
              >
                <Repeat2 size={12} />
                <span>Auto-listen: {autoListen ? "ON" : "OFF"}</span>
              </button>
            )}
          </div>

          {/* Transcript */}
          <div className="lv-card flex flex-col overflow-hidden flex-1" style={{ minHeight: 0 }}>
            <button onClick={() => setShowTranscript(v => !v)}
              className="flex items-center justify-between p-3 w-full mono-sm shrink-0"
              style={{ color: "var(--ink-2)", borderBottom: showTranscript ? "1px solid var(--line)" : "none" }}
            >
              <span>Transcript</span>
              {showTranscript ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showTranscript && (
              <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ minHeight: 0 }}>
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className="text-sm leading-relaxed max-w-[92%]" style={{ padding: "7px 11px", borderRadius: 11, background: msg.role === "user" ? "var(--terracotta)" : "var(--paper-2)", color: msg.role === "user" ? "#fff" : "var(--ink)", borderTopRightRadius: msg.role === "user" ? 2 : 11, borderTopLeftRadius: msg.role === "assistant" ? 2 : 11 }}>
                      {msg.content || <span style={{ opacity: 0.4 }}>…</span>}
                    </div>
                  </div>
                ))}
                {liveTranscript && (
                  <div className="flex justify-end">
                    <div className="text-sm max-w-[92%]" style={{ padding: "7px 11px", borderRadius: 11, borderTopRightRadius: 2, background: "rgba(192,57,43,0.18)", color: "var(--ink-2)", border: "1px dashed var(--terracotta)" }}>
                      {liveTranscript}
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="lv-card p-4 shrink-0">
        {sessionEnded ? (
          <div className="flex items-center justify-between gap-4">
            <p className="serif-i text-sm" style={{ color: "var(--ink-3)" }}>Session ended — great work!</p>
            <div className="flex gap-2">
              {feedback && (
                <button onClick={() => setFeedbackOpen(true)} className="lv-btn lv-btn--marine lv-btn--sm flex items-center gap-2">
                  <Award size={14} /> View feedback
                </button>
              )}
              <button onClick={resetSession} className="lv-btn lv-btn--primary flex items-center gap-2">
                <RotateCcw size={16} /> New session
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {/* Mute */}
            <button onClick={() => setMuted(v => !v)} className="lv-btn lv-btn--ghost lv-btn--icon lv-btn--sm" title={muted ? "Unmute tutor" : "Mute tutor"}>
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            {/* Mic */}
            {micSupported && (
              <button onClick={isListening ? stopListening : startListening} disabled={streaming}
                title={isListening ? "Stop listening" : "Tap to speak"}
                className="lv-btn lv-btn--icon disabled:opacity-40"
                style={isListening ? { background: "#10b981", color: "#fff", animation: "vt-pulse-btn 1.4s ease-in-out infinite" } : { background: "var(--paper-2)", color: "var(--ink-2)" }}
              >
                {isListening ? <Mic size={22} /> : <MicOff size={22} />}
              </button>
            )}
            {/* Text input */}
            <div className="flex-1 relative">
              <input ref={inputRef} type="text" value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleTextSend(); } }}
                placeholder={isListening ? "Speaking… auto-submits on silence" : `Reply to ${currentAvatarName}…`}
                disabled={streaming || isListening}
                className="lv-input w-full disabled:opacity-50"
                style={{ paddingRight: 50 }}
              />
              <button onClick={handleTextSend} disabled={streaming || !input.trim() || isListening}
                className={`absolute right-2 top-1/2 -translate-y-1/2 lv-btn lv-btn--icon lv-btn--sm ${input.trim() && !streaming && !isListening ? "lv-btn--primary" : ""}`}
                style={input.trim() && !streaming && !isListening ? undefined : { background: "transparent", color: "var(--ink-4)", cursor: "not-allowed" }}
              >
                <Send size={16} />
              </button>
            </div>
            {/* End call */}
            <button onClick={endSession} className="lv-btn lv-btn--icon" style={{ background: "#ef4444", color: "white" }} title="End session">
              <PhoneOff size={20} />
            </button>
          </div>
        )}
      </div>

      {/* ══════════ FEEDBACK MODAL ══════════ */}
      {feedbackOpen && (
        <div onClick={() => !loadingFeedback && setFeedbackOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
          style={{ background: "rgba(28,25,23,0.55)", backdropFilter: "blur(8px)" }}
          role="dialog" aria-modal="true"
        >
          <div onClick={e => e.stopPropagation()}
            className="lv-card w-full max-w-2xl max-h-[90vh] flex flex-col"
            style={{ animation: "lv-pop 0.32s var(--ease-spring) both", padding: 0 }}
          >
            {loadingFeedback || !feedback ? (
              <div className="flex flex-col items-center justify-center gap-5 px-8 py-16">
                <div className="w-20 h-20 rounded-full flex items-center justify-center animate-pulse" style={{ background: "var(--marine-soft)", color: "var(--marine)" }}>
                  <BrainCircuit size={36} />
                </div>
                <div className="text-center">
                  <p className="serif" style={{ fontSize: 26, marginBottom: 4 }}>Analysing your session…</p>
                  <p className="mono-sm" style={{ color: "var(--ink-3)" }}>Preparing personalised feedback</p>
                </div>
                <div className="flex gap-1.5">
                  {[0, 0.2, 0.4].map(d => (
                    <div key={d} style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--terracotta)", animation: "lv-fade-in 1.2s ease infinite alternate", animationDelay: `${d}s` }} />
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Hero */}
                <div className="relative p-6 md:p-8" style={{ borderBottom: "1px solid var(--line)" }}>
                  <button onClick={() => setFeedbackOpen(false)} aria-label="Close" className="absolute top-4 right-4 lv-btn lv-btn--ghost lv-btn--icon lv-btn--sm"><X size={16} /></button>
                  <p className="mono-sm mb-2" style={{ color: "var(--terracotta)" }}>Session feedback</p>
                  <h2 className="serif" style={{ fontSize: 34, marginBottom: 20 }}>
                    {feedback.grammarScore >= 85 ? "Outstanding work." : feedback.grammarScore >= 70 ? "Solid progress." : feedback.grammarScore >= 50 ? "Good effort — keep going." : "Every attempt builds you up."}
                  </h2>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="lv-card lv-card--paper2" style={{ padding: 16 }}>
                      <div className="flex items-center gap-1.5 mb-1.5"><Award size={14} style={{ color: "var(--terracotta)" }} /><span className="mono-sm" style={{ color: "var(--ink-3)" }}>XP</span></div>
                      <p className="serif" style={{ fontSize: 40, lineHeight: 1, color: "var(--terracotta)" }}>+{xpEarned}</p>
                    </div>
                    <div className="lv-card lv-card--paper2" style={{ padding: 16 }}>
                      <div className="flex items-center gap-1.5 mb-1.5"><CheckCircle2 size={14} style={{ color: "var(--fg-success)" }} /><span className="mono-sm" style={{ color: "var(--ink-3)" }}>Grammar</span></div>
                      <p className="serif" style={{ fontSize: 40, lineHeight: 1, color: "var(--fg-success)" }}>{feedback.grammarScore}%</p>
                      <div className="lv-progress lv-progress--lime" style={{ marginTop: 8 }}><span style={{ width: `${feedback.grammarScore}%` }} /></div>
                    </div>
                    <div className="lv-card lv-card--paper2" style={{ padding: 16 }}>
                      <div className="flex items-center gap-1.5 mb-1.5"><TrendingUp size={14} style={{ color: "var(--marine)" }} /><span className="mono-sm" style={{ color: "var(--ink-3)" }}>Accuracy</span></div>
                      <p className="serif" style={{ fontSize: 40, lineHeight: 1, color: "var(--marine)" }}>{feedback.accuracyPct}%</p>
                      <div className="lv-progress lv-progress--marine" style={{ marginTop: 8 }}><span style={{ width: `${feedback.accuracyPct}%` }} /></div>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 px-4 md:px-6 pt-4" style={{ borderBottom: "1px solid var(--line)" }}>
                  {([
                    { id: "corrections", label: "Corrections", count: feedback.corrections.length,  Icon: AlertCircle },
                    { id: "strengths",   label: "Wins",        count: feedback.strengths.length,    Icon: CheckCircle2 },
                    { id: "next",        label: "Next steps",  count: 0,                             Icon: Lightbulb },
                  ] as const).map(tab => {
                    const active = feedbackTab === tab.id;
                    return (
                      <button key={tab.id} onClick={() => setFeedbackTab(tab.id)}
                        className="flex items-center gap-2 px-4 py-3 mono-sm"
                        style={{ borderBottom: `2px solid ${active ? "var(--terracotta)" : "transparent"}`, color: active ? "var(--ink)" : "var(--ink-3)" }}
                      >
                        <tab.Icon size={14} /><span>{tab.label}</span>
                        {tab.count > 0 && <span className={`lv-chip${active ? " lv-chip--terra" : ""}`} style={{ fontSize: 10, padding: "2px 8px" }}>{tab.count}</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Tab content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                  {feedbackTab === "corrections" && (
                    feedback.corrections.length === 0
                      ? <div className="text-center py-12" style={{ color: "var(--ink-3)" }}><CheckCircle2 size={32} className="mx-auto mb-3" style={{ color: "var(--fg-success)" }} /><p className="serif" style={{ fontSize: 19 }}>No corrections — clean work.</p></div>
                      : <ul className="space-y-3">{feedback.corrections.map((c, i) => (
                          <li key={i} className="lv-card lv-card--paper2" style={{ padding: 16 }}>
                            <div className="flex flex-col gap-2.5">
                              <div className="flex items-start gap-2"><span className="mono-sm shrink-0" style={{ color: "var(--rose)", marginTop: 2 }}>Was</span><p style={{ color: "var(--ink-3)", textDecoration: "line-through" }}>{c.original}</p></div>
                              <div className="flex items-start gap-2"><span className="mono-sm shrink-0" style={{ color: "var(--fg-success)", marginTop: 2 }}>Should be</span><p style={{ color: "var(--fg-success)", fontWeight: 500 }}>{c.corrected}</p></div>
                              <p className="text-xs serif-i pl-1 pt-1.5" style={{ color: "var(--ink-3)", borderTop: "1px solid var(--line)" }}>{c.rule}</p>
                            </div>
                          </li>
                        ))}</ul>
                  )}
                  {feedbackTab === "strengths" && (
                    feedback.strengths.length === 0
                      ? <div className="text-center py-12" style={{ color: "var(--ink-3)" }}><Lightbulb size={32} className="mx-auto mb-3" style={{ color: "var(--terracotta)" }} /><p className="serif" style={{ fontSize: 19 }}>More wins next session.</p></div>
                      : <ul className="space-y-2">{feedback.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-3" style={{ padding: 14, borderRadius: "var(--r-md)", background: "var(--success-soft)" }}>
                            <CheckCircle2 size={18} className="mt-0.5 shrink-0" style={{ color: "var(--fg-success)" }} />
                            <p className="text-sm leading-relaxed" style={{ color: "var(--ink-2)" }}>{s}</p>
                          </li>
                        ))}</ul>
                  )}
                  {feedbackTab === "next" && (
                    <div className="lv-card lv-card--paper2" style={{ padding: 20 }}>
                      <div className="flex items-center gap-2 mb-3"><Lightbulb size={16} style={{ color: "var(--marine)" }} /><span className="mono-sm" style={{ color: "var(--marine)" }}>Recommended next step</span></div>
                      <p className="text-base leading-relaxed" style={{ color: "var(--ink-2)" }}>{feedback.recommendation}</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex flex-col sm:flex-row gap-2 p-4 md:p-6" style={{ borderTop: "1px solid var(--line)", background: "var(--paper-2)" }}>
                  {(feedback.newVocabulary?.length ?? 0) > 0 && (
                    <button onClick={saveVocab} disabled={savingWords || wordsSaved} className="flex-1 lv-btn lv-btn--ghost flex items-center justify-center gap-2 disabled:opacity-60">
                      <BookMarked size={15} />
                      {wordsSaved ? "Saved to My Words ✓" : savingWords ? "Saving…" : `Save ${feedback.newVocabulary.length} word${feedback.newVocabulary.length === 1 ? "" : "s"} to My Words`}
                    </button>
                  )}
                  <button onClick={() => setFeedbackOpen(false)} className="lv-btn lv-btn--ghost flex items-center justify-center gap-2" style={{ border: 0 }}>Continue reading</button>
                  <button onClick={resetSession} className="lv-btn lv-btn--primary flex items-center justify-center gap-2">New session <ArrowRight size={15} /></button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes vt-pulse-btn { 0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,.55);} 50%{box-shadow:0 0 0 10px rgba(16,185,129,0);} }
        @keyframes vt-pip-blink { 0%,100%{opacity:1;} 50%{opacity:.2;} }
      `}</style>
    </div>
  );
}
