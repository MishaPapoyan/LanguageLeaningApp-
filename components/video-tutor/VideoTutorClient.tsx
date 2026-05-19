"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { speakTarget } from "@/lib/speech";
import { getLanguageConfig } from "@/data/language-config";
import { SCENARIO_INFO } from "@/lib/scenarios";
import { TutorScenario, ChatMessage } from "@/types";
import { VideoTutorAvatar, AvatarState } from "./VideoTutorAvatar";
import {
  Mic,
  MicOff,
  PhoneOff,
  Send,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";

const AVATAR_NAMES: Record<string, Record<string, string>> = {
  fr: { waiter: "Pierre", traveler: "Sophie", teacher: "Mme Dubois", free: "Alex" },
  es: { waiter: "Carlos", traveler: "Elena",  teacher: "Sra. García", free: "Diego" },
  en: { waiter: "Tom",    traveler: "Emma",   teacher: "Ms. Johnson", free: "James" },
};

const LANG_LOCALE: Record<string, string> = {
  fr: "fr-FR",
  es: "es-ES",
  en: "en-US",
  hy: "hy-AM",
};

const SCENARIOS = Object.entries(SCENARIO_INFO).map(([key, val]) => ({
  id: key as TutorScenario,
  ...val,
}));

interface Props {
  userLevel: number;
}

export function VideoTutorClient({ userLevel }: Props) {
  const { data: session } = useSession();
  const langConfig = getLanguageConfig(
    (session?.user as { targetLanguage?: string })?.targetLanguage ?? "fr"
  );
  const avatarNames = AVATAR_NAMES[langConfig.code] ?? AVATAR_NAMES.fr;
  const recognitionLocale = LANG_LOCALE[langConfig.code] ?? "fr-FR";

  const [scenario, setScenario] = useState<TutorScenario | null>(null);
  const [pickedScenario, setPickedScenario] = useState<TutorScenario>("free");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [avatarState, setAvatarState] = useState<AvatarState>("idle");
  const [isListening, setIsListening] = useState(false);
  const [micSupported, setMicSupported] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [showTranscript, setShowTranscript] = useState(true);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [muted, setMuted] = useState(false);

  const recognitionRef = useRef<any>(null);
  const pendingRef = useRef("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mutedRef = useRef(false);

  mutedRef.current = muted;

  const currentAvatarName = scenario ? (avatarNames[scenario] ?? "AI") : "AI";
  const userName =
    (session?.user as { name?: string })?.name ?? "You";

  useEffect(() => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    setMicSupported(!!SR);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, liveTranscript]);

  const speakResponse = useCallback(
    async (text: string) => {
      if (mutedRef.current) return;
      setAvatarState("speaking");
      await speakTarget(text, langConfig.code, 0.88, {
        onPlaying: () => setAvatarState("speaking"),
        onEnd: () => setAvatarState("idle"),
        onError: () => setAvatarState("idle"),
      });
    },
    [langConfig.code]
  );

  const sendMessage = useCallback(
    async (
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
            updated[updated.length - 1] = {
              role: "assistant",
              content: assistantText,
            };
            return updated;
          });
        }

        if (assistantText) {
          await speakResponse(assistantText);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Sorry, something went wrong. Please try again." },
        ]);
        setAvatarState("idle");
      } finally {
        setStreaming(false);
        inputRef.current?.focus();
      }
    },
    [speakResponse]
  );

  const startScenario = async (s: TutorScenario) => {
    setScenario(s);
    setMessages([]);
    setSessionEnded(false);
    setLiveTranscript("");
    pendingRef.current = "";
    await sendMessage([], s, "");
  };

  const handleSend = async () => {
    if (!input.trim() || streaming || !scenario) return;
    const text = input.trim();
    setInput("");
    await sendMessage(messages, scenario, text);
  };

  const submitVoice = useCallback(
    (text: string) => {
      if (!text.trim() || !scenario) return;
      setLiveTranscript("");
      pendingRef.current = "";
      sendMessage(messages, scenario, text.trim());
    },
    [messages, scenario, sendMessage]
  );

  const startListening = useCallback(() => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.lang = recognitionLocale;
    recognition.continuous = true;
    recognition.interimResults = true;

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
      setAvatarState("idle");
      const text = pendingRef.current.trim();
      if (text) submitVoice(text);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setAvatarState("idle");
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setAvatarState("listening");
    pendingRef.current = "";
    setLiveTranscript("");
  }, [recognitionLocale, submitVoice]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setAvatarState("idle");
  }, []);

  const toggleMic = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const endSession = () => {
    recognitionRef.current?.abort();
    setIsListening(false);
    setAvatarState("idle");
    setSessionEnded(true);
  };

  const resetSession = () => {
    setScenario(null);
    setMessages([]);
    setSessionEnded(false);
    setLiveTranscript("");
    pendingRef.current = "";
    setAvatarState("idle");
  };

  // ── Scenario picker ──────────────────────────────────────────────────────────
  if (!scenario) {
    return (
      <div className="max-w-2xl mx-auto space-y-10 animate-fade-up">
        <header className="text-center space-y-3">
          <div className="mono-sm" style={{ color: "var(--ink-3)" }}>
            § Video · AI Tutor
          </div>
          <h1 className="serif" style={{ fontSize: 48, lineHeight: 1, letterSpacing: "-0.02em" }}>
            Video Tutor
          </h1>
          <p style={{ color: "var(--ink-3)", fontSize: 18, maxWidth: 480, margin: "0 auto" }}>
            Talk face-to-face with your AI language tutor. Free, real-time, no account needed.
          </p>
        </header>

        {/* Preview avatar */}
        <div style={{ maxWidth: 380, margin: "0 auto" }}>
          <VideoTutorAvatar state="idle" name="Your Tutor" />
        </div>

        {/* Badges */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {[
            { icon: "🎙️", label: "Voice input" },
            { icon: "🔊", label: "Auto-speak" },
            { icon: "💬", label: "Live transcript" },
            { icon: "🆓", label: "100% free" },
          ].map((b) => (
            <div key={b.label} className="lv-chip flex items-center gap-1.5">
              <span>{b.icon}</span>
              <span className="mono-sm">{b.label}</span>
            </div>
          ))}
        </div>

        {/* Scenario picker */}
        <section className="space-y-4">
          <h3 className="serif text-center" style={{ fontSize: 24 }}>
            Choose a scenario
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {SCENARIOS.map((s) => {
              const isActive = pickedScenario === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setPickedScenario(s.id)}
                  className={`lv-card lv-card--hover p-4 flex items-center gap-3 text-left${
                    isActive ? " lv-card--paper2" : ""
                  }`}
                  style={{
                    borderColor: isActive ? "var(--ink)" : undefined,
                    borderWidth: isActive ? 1.5 : undefined,
                    opacity: isActive ? 1 : 0.65,
                  }}
                >
                  <span className="text-2xl">{s.emoji}</span>
                  <div>
                    <div
                      className="text-sm font-bold"
                      style={{ color: "var(--ink)" }}
                    >
                      {s.label}
                    </div>
                    <div className="mono-sm" style={{ color: "var(--ink-3)" }}>
                      with {avatarNames[s.id] ?? "AI"}
                    </div>
                  </div>
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
            <Play size={20} /> Start Video Session
          </button>
        </div>
      </div>
    );
  }

  // ── Video call layout ────────────────────────────────────────────────────────
  return (
    <div
      className="max-w-5xl mx-auto flex flex-col gap-4"
      style={{ height: "calc(100vh - 140px)" }}
    >
      {/* Main area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        {/* Avatar (takes 2/3 on desktop) */}
        <div className="lg:col-span-2 relative" style={{ minHeight: 280 }}>
          <VideoTutorAvatar state={avatarState} name={currentAvatarName} />

          {/* User PIP (picture-in-picture) */}
          <div
            style={{
              position: "absolute",
              bottom: 16,
              right: 16,
              width: 110,
              height: 82,
              borderRadius: 12,
              background: "linear-gradient(135deg, #1f2937, #374151)",
              border: "2px solid rgba(255,255,255,0.12)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "var(--terracotta)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--display)",
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              {userName[0]?.toUpperCase() ?? "U"}
            </div>
            <span
              style={{
                fontSize: 9,
                color: "rgba(255,255,255,0.6)",
                fontFamily: "var(--mono)",
                letterSpacing: "0.06em",
              }}
            >
              You
            </span>
            {isListening && (
              <div
                style={{
                  position: "absolute",
                  bottom: 6,
                  right: 6,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#10b981",
                  boxShadow: "0 0 6px #10b981",
                  animation: "vt-blink-dot 0.8s ease-in-out infinite",
                }}
              />
            )}
          </div>
        </div>

        {/* Side panel */}
        <div className="flex flex-col gap-3 min-h-0">
          {/* Session info card */}
          <div className="lv-card p-4 space-y-2 shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{SCENARIO_INFO[scenario]?.emoji}</span>
              <div>
                <div
                  className="text-sm font-bold"
                  style={{ color: "var(--ink)" }}
                >
                  {SCENARIO_INFO[scenario]?.label}
                </div>
                <div className="mono-sm" style={{ color: "var(--ink-3)" }}>
                  with {currentAvatarName}
                </div>
              </div>
            </div>
            <div
              className="flex items-center gap-1.5 mono-sm"
              style={{ color: "var(--ink-3)" }}
            >
              <span>{langConfig.flag}</span>
              <span>{langConfig.label} session</span>
            </div>
            {/* Mic hint */}
            {micSupported && (
              <div
                className="flex items-center gap-1.5 mono-sm"
                style={{
                  color: "var(--ink-4)",
                  borderTop: "1px solid var(--line)",
                  paddingTop: 8,
                  marginTop: 4,
                }}
              >
                <Mic size={11} />
                <span>Hold mic to speak, tap to send</span>
              </div>
            )}
          </div>

          {/* Transcript card */}
          <div
            className="lv-card flex flex-col overflow-hidden flex-1"
            style={{ minHeight: 0 }}
          >
            <button
              onClick={() => setShowTranscript((v) => !v)}
              className="flex items-center justify-between p-3 w-full mono-sm shrink-0"
              style={{
                color: "var(--ink-2)",
                borderBottom: showTranscript
                  ? "1px solid var(--line)"
                  : "none",
              }}
            >
              <span>Transcript</span>
              {showTranscript ? (
                <ChevronUp size={14} />
              ) : (
                <ChevronDown size={14} />
              )}
            </button>

            {showTranscript && (
              <div
                className="flex-1 overflow-y-auto p-3 space-y-2"
                style={{ minHeight: 0 }}
              >
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className="text-sm leading-relaxed max-w-[92%]"
                      style={{
                        padding: "7px 11px",
                        borderRadius: 11,
                        background:
                          msg.role === "user"
                            ? "var(--terracotta)"
                            : "var(--paper-2)",
                        color:
                          msg.role === "user" ? "#fff" : "var(--ink)",
                        borderTopRightRadius: msg.role === "user" ? 2 : 11,
                        borderTopLeftRadius:
                          msg.role === "assistant" ? 2 : 11,
                      }}
                    >
                      {msg.content || (
                        <span style={{ opacity: 0.4 }}>…</span>
                      )}
                    </div>
                  </div>
                ))}

                {/* Live voice transcript bubble */}
                {liveTranscript && (
                  <div className="flex justify-end">
                    <div
                      className="text-sm max-w-[92%]"
                      style={{
                        padding: "7px 11px",
                        borderRadius: 11,
                        borderTopRightRadius: 2,
                        background: "rgba(192,57,43,0.18)",
                        color: "var(--ink-2)",
                        border: "1px dashed var(--terracotta)",
                      }}
                    >
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

      {/* Controls bar */}
      <div className="lv-card p-4 shrink-0">
        {sessionEnded ? (
          <div className="flex items-center justify-between gap-4">
            <p className="serif-i text-sm" style={{ color: "var(--ink-3)" }}>
              Session ended — great work!
            </p>
            <button
              onClick={resetSession}
              className="lv-btn lv-btn--primary flex items-center gap-2"
            >
              <RotateCcw size={16} /> New session
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {/* Mute toggle */}
            <button
              onClick={() => setMuted((v) => !v)}
              className="lv-btn lv-btn--ghost lv-btn--icon lv-btn--sm"
              title={muted ? "Unmute tutor" : "Mute tutor"}
            >
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            {/* Mic button */}
            {micSupported && (
              <button
                onClick={toggleMic}
                disabled={streaming}
                title={
                  isListening
                    ? "Stop — tap to submit"
                    : "Tap to speak"
                }
                className="lv-btn lv-btn--icon disabled:opacity-40"
                style={
                  isListening
                    ? {
                        background: "#10b981",
                        color: "#fff",
                        animation: "vt-pulse-btn 1.4s ease-in-out infinite",
                      }
                    : {
                        background: "var(--paper-2)",
                        color: "var(--ink-2)",
                      }
                }
              >
                {isListening ? <Mic size={22} /> : <MicOff size={22} />}
              </button>
            )}

            {/* Text input */}
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
                placeholder={
                  isListening
                    ? "Speaking… tap mic to send"
                    : `Reply to ${currentAvatarName}…`
                }
                disabled={streaming || isListening}
                className="lv-input w-full disabled:opacity-50"
                style={{ paddingRight: 50 }}
              />
              <button
                onClick={handleSend}
                disabled={streaming || !input.trim() || isListening}
                className={`absolute right-2 top-1/2 -translate-y-1/2 lv-btn lv-btn--icon lv-btn--sm ${
                  input.trim() && !streaming && !isListening
                    ? "lv-btn--primary"
                    : ""
                }`}
                style={
                  input.trim() && !streaming && !isListening
                    ? undefined
                    : {
                        background: "transparent",
                        color: "var(--ink-4)",
                        cursor: "not-allowed",
                      }
                }
              >
                <Send size={16} />
              </button>
            </div>

            {/* End call */}
            <button
              onClick={endSession}
              className="lv-btn lv-btn--icon"
              style={{ background: "#ef4444", color: "white" }}
              title="End session"
            >
              <PhoneOff size={20} />
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes vt-pulse-btn {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.55); }
          50%       { box-shadow: 0 0 0 10px rgba(16,185,129,0); }
        }
        @keyframes vt-blink-dot {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}
