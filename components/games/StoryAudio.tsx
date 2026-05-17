"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { getLanguageConfig } from "@/data/language-config";
import { t, getLocale } from "@/lib/i18n";
import { wordTranslation, wordDefinition } from "@/lib/wordI18n";
import Link from "next/link";
import { Play, Pause, RefreshCw, Loader2, ChevronRight, BookOpen } from "lucide-react";

interface Question { question: string; options: string[]; correctIndex: number; }
interface VocabItem { word: string; definition: string; }
interface StoryData {
  title: string; genre: string; transcript: string;
  questions: Question[]; vocabulary: VocabItem[];
}

type Phase = "prelisten" | "listening" | "questions" | "reveal";

interface Props { language?: string; level?: string; }

export function StoryAudio({ language, level }: Props) {
  const { data: session } = useSession();
  const langConfig = getLanguageConfig(session?.user?.targetLanguage ?? language ?? "fr");
  const locale = getLocale((session?.user as { nativeLanguage?: string })?.nativeLanguage);
  const userLevel = (session?.user as any)?.cefrLevel ?? level ?? "B1";

  const [story, setStory]           = useState<StoryData | null>(null);
  const [loading, setLoading]       = useState(true);
  const [phase, setPhase]           = useState<Phase>("prelisten");
  const [playing, setPlaying]       = useState(false);
  const [progress, setProgress]     = useState(0);
  const [duration, setDuration]     = useState(0);
  const [qIdx, setQIdx]             = useState(0);
  const [answers, setAnswers]       = useState<number[]>([]);
  const [selected, setSelected]     = useState<number | null>(null);
  const [answered, setAnswered]     = useState(false);
  const [score, setScore]           = useState(0);
  const [xpEarned, setXpEarned]     = useState(0);
  const [saving, setSaving]         = useState(false);
  const [done, setDone]             = useState(false);
  const [showText, setShowText]     = useState(false);

  const audioRef  = useRef<HTMLAudioElement | null>(null);
  const blobRef   = useRef<string | null>(null);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadGame = useCallback(async () => {
    setLoading(true);
    setPhase("prelisten"); setPlaying(false); setProgress(0); setDuration(0);
    setQIdx(0); setAnswers([]); setSelected(null); setAnswered(false);
    setScore(0); setDone(false); setShowText(false);
    if (blobRef.current) { URL.revokeObjectURL(blobRef.current); blobRef.current = null; }
    try {
      const res = await fetch(`/api/games/story-audio?language=${langConfig.code}&level=${userLevel}`);
      const data: StoryData = await res.json();
      setStory(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [langConfig.code, userLevel]);

  useEffect(() => { loadGame(); }, [loadGame]);
  useEffect(() => () => { if (blobRef.current) URL.revokeObjectURL(blobRef.current); }, []);

  const fetchAudio = async (text: string): Promise<string | null> => {
    if (blobRef.current) return blobRef.current;
    try {
      const res = await fetch("/api/pronunciation/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, lang: langConfig.code }),
      });
      if (!res.ok) return null;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      blobRef.current = url;
      return url;
    } catch { return null; }
  };

  const startListening = async () => {
    if (!story) return;
    setPhase("listening");
    const url = await fetchAudio(story.transcript);
    if (!url) {
      // Web Speech fallback
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(story.transcript);
        utt.lang = langConfig.ttsLocale ?? "fr-FR";
        utt.rate = 0.9;
        utt.onend = () => { setPlaying(false); setPhase("questions"); };
        window.speechSynthesis.speak(utt);
        setPlaying(true);
      }
      return;
    }
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onloadedmetadata = () => setDuration(audio.duration);
    audio.ontimeupdate = () => setProgress(audio.currentTime);
    audio.onended = () => { setPlaying(false); if (timerRef.current) clearInterval(timerRef.current); setPhase("questions"); };
    audio.onerror = () => setPlaying(false);
    await audio.play();
    setPlaying(true);
  };

  const togglePause = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); } else { a.play(); setPlaying(true); }
  };

  const handleAnswer = (i: number) => {
    if (answered || !story) return;
    setSelected(i);
    setAnswered(true);
    const correct = story.questions[qIdx].correctIndex;
    if (i === correct) setScore((s) => s + 1);
    setAnswers((prev) => [...prev, i]);
  };

  const handleNext = async () => {
    if (!story) return;
    const nextQ = qIdx + 1;
    if (nextQ >= story.questions.length) {
      const pct = Math.round((score / story.questions.length) * 100);
      setSaving(true);
      try {
        const res = await fetch("/api/games/story-audio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ score: pct, newWords: story.vocabulary.map((v) => v.word) }),
        });
        const d = await res.json();
        setXpEarned(d.xpEarned ?? 10);
        window.dispatchEvent(new CustomEvent("xp-updated"));
      } catch (e) { console.error(e); }
      finally { setSaving(false); }
      setPhase("reveal");
      setDone(true);
    } else {
      setQIdx(nextQ);
      setSelected(null);
      setAnswered(false);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Loader2 size={32} className="animate-spin" style={{ color: "var(--accent)" }} />
      <p style={{ color: "var(--text-3)", fontSize: 13 }}>Generating story…</p>
    </div>
  );
  if (!story) return null;

  // ── Pre-listen ──────────────────────────────────────────────────
  if (phase === "prelisten") return (
    <div className="max-w-md mx-auto text-center py-10 space-y-6 animate-fade-up">
      <div className="text-5xl">📻</div>
      <div>
        <p style={{ fontSize: 11, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 6 }}>{story.genre}</p>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--text)" }}>{story.title}</h2>
      </div>
      <div className="flex justify-center gap-4">
        <span className="rounded-full px-3 py-1 text-xs" style={{ background: "var(--surface-2)", color: "var(--text-3)", border: "1px solid var(--border)" }}>
          {story.questions.length} questions
        </span>
        <span className="rounded-full px-3 py-1 text-xs" style={{ background: "var(--surface-2)", color: "var(--text-3)", border: "1px solid var(--border)" }}>
          {story.vocabulary.length} vocab words
        </span>
      </div>
      <div className="rounded-2xl p-4 text-left space-y-2" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
        {["🎧 Listen carefully — no text shown during audio", "❓ Answer 5 comprehension questions after", "📖 Story text revealed at the end", "💾 New vocabulary auto-saved to your dictionary"].map((t) => (
          <p key={t} style={{ fontSize: 12, color: "var(--text-2)" }}>{t}</p>
        ))}
      </div>
      <button onClick={startListening} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
        <Play size={16} fill="currentColor" /> Start Listening
      </button>
    </div>
  );

  // ── Listening phase ─────────────────────────────────────────────
  if (phase === "listening") return (
    <div className="max-w-md mx-auto text-center py-10 space-y-6 animate-fade-up">
      <p style={{ fontSize: 13, color: "var(--accent)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2 }}>{story.title}</p>
      {/* Waveform animation */}
      <div className="flex items-center justify-center gap-1 py-8">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} style={{
            width: 4, borderRadius: 4,
            background: playing ? "var(--accent)" : "var(--surface-2)",
            height: playing ? `${20 + Math.sin(i * 0.8) * 16}px` : "8px",
            animation: playing ? `pulse ${0.5 + (i % 5) * 0.1}s ease-in-out infinite alternate` : "none",
            transition: "height 0.3s",
          }} />
        ))}
      </div>
      {duration > 0 && (
        <div className="space-y-1">
          <div style={{ height: 4, background: "var(--surface-2)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${duration ? (progress / duration) * 100 : 0}%`, background: "var(--accent)", transition: "width 0.5s linear" }} />
          </div>
          <div className="flex justify-between text-xs" style={{ color: "var(--text-3)" }}>
            <span>{formatTime(progress)}</span><span>{formatTime(duration)}</span>
          </div>
        </div>
      )}
      <button onClick={togglePause} className="btn-secondary flex items-center gap-2 mx-auto">
        {playing ? <><Pause size={14} /> Pause</> : <><Play size={14} fill="currentColor" /> Resume</>}
      </button>
    </div>
  );

  // ── Questions phase ─────────────────────────────────────────────
  if (phase === "questions") {
    const q = story.questions[qIdx];
    return (
      <div className="max-w-lg mx-auto space-y-5 animate-fade-up">
        <div style={{ height: 4, background: "var(--surface-2)", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(qIdx / story.questions.length) * 100}%`, background: "var(--accent)", transition: "width 0.3s" }} />
        </div>
        <p style={{ fontSize: 12, color: "var(--text-3)" }}>Question {qIdx + 1} of {story.questions.length}</p>
        <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>{q.question}</p>
        <div className="space-y-2">
          {q.options.map((opt, i) => {
            let bg = "var(--surface-2)", border = "var(--border)", color = "var(--text)";
            if (answered) {
              if (i === q.correctIndex) { bg = "rgba(16,185,129,0.15)"; border = "var(--green)"; color = "var(--green)"; }
              else if (i === selected && i !== q.correctIndex) { bg = "rgba(239,68,68,0.15)"; border = "var(--red)"; color = "var(--red)"; }
            }
            return (
              <button key={i} onClick={() => handleAnswer(i)}
                className="w-full text-left rounded-xl p-3 transition-all"
                style={{ background: bg, border: `1px solid ${border}`, color, cursor: answered ? "default" : "pointer", fontSize: 14 }}>
                {opt}
              </button>
            );
          })}
        </div>
        {answered && (
          <button onClick={handleNext} className="btn-primary flex items-center gap-2">
            {qIdx + 1 >= story.questions.length ? "See Results" : "Next"} <ChevronRight size={14} />
          </button>
        )}
      </div>
    );
  }

  // ── Reveal phase ────────────────────────────────────────────────
  const pct = Math.round((score / story.questions.length) * 100);
  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-up py-4">
      <div className="text-center space-y-2">
        <div className="text-5xl">{pct >= 80 ? "🎉" : pct >= 60 ? "👏" : "📚"}</div>
        <p style={{ fontSize: 44, fontWeight: 900, color: "var(--text)" }}>{pct}%</p>
        {saving ? <p style={{ color: "var(--text-3)", fontSize: 12 }}>Saving…</p> : (
          <div className="flex items-center justify-center gap-2">
            <span>⚡</span><span style={{ fontWeight: 700, color: "var(--gold)" }}>+{xpEarned} XP</span>
          </div>
        )}
      </div>
      {/* Vocabulary */}
      {story.vocabulary.length > 0 && (
        <div className="rounded-2xl p-4 space-y-3" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1 }}>{t(locale, "game_vocabFromStory")}</p>
          {story.vocabulary.map((v) => (
            <div key={v.word} className="flex items-center justify-between">
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--accent)" }}>{v.word}</span>
              <span style={{ fontSize: 13, color: "var(--text-2)" }}>{wordDefinition(v, locale)}</span>
            </div>
          ))}
        </div>
      )}
      {/* Story text */}
      <div>
        <button onClick={() => setShowText((s) => !s)} className="flex items-center gap-2 text-sm mb-3" style={{ color: "var(--accent)", background: "none", border: "none", cursor: "pointer" }}>
          <BookOpen size={14} /> {showText ? "Hide" : "Read"} story text
        </button>
        {showText && (
          <div className="rounded-2xl p-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
            <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7 }}>{story.transcript}</p>
          </div>
        )}
      </div>
      <div className="flex gap-3">
        <button onClick={loadGame} className="btn-primary flex items-center gap-2"><RefreshCw size={14} /> New Story</button>
        <Link href="/games" className="btn-secondary">{t(locale, "game_allGames")}</Link>
      </div>
    </div>
  );
}
