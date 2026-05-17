"use client";

import { useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { getLanguageConfig } from "@/data/language-config";
import { t, getLocale } from "@/lib/i18n";
import Link from "next/link";
import { Play, RefreshCw, Loader2, ChevronRight, Zap } from "lucide-react";

interface Question { question: string; options: string[]; correctIndex: number; }
interface GameData { transcript: string; contentType: string; questions: Question[]; locked?: boolean; message?: string; }

type Phase = "intro" | "listening" | "questions" | "done";

interface Props { language?: string; level?: string; }

export function SpeedListening({ language, level }: Props) {
  const { data: session } = useSession();
  const langConfig = getLanguageConfig(session?.user?.targetLanguage ?? language ?? "fr");
  const locale = getLocale((session?.user as { nativeLanguage?: string })?.nativeLanguage);
  const userLevel = (session?.user as any)?.cefrLevel ?? level ?? "B1";

  const [data, setData]           = useState<GameData | null>(null);
  const [loading, setLoading]     = useState(false);
  const [phase, setPhase]         = useState<Phase>("intro");
  const [playing, setPlaying]     = useState(false);
  const [lifeline, setLifeline]   = useState(true);
  const [qIdx, setQIdx]           = useState(0);
  const [selected, setSelected]   = useState<number | null>(null);
  const [answered, setAnswered]   = useState(false);
  const [score, setScore]         = useState(0);
  const [xpEarned, setXpEarned]   = useState(0);
  const [saving, setSaving]       = useState(false);
  const blobRef = useRef<string | null>(null);

  const loadGame = useCallback(async () => {
    setLoading(true);
    setPhase("intro"); setPlaying(false); setLifeline(true);
    setQIdx(0); setSelected(null); setAnswered(false); setScore(0);
    if (blobRef.current) { URL.revokeObjectURL(blobRef.current); blobRef.current = null; }
    try {
      const res = await fetch(`/api/games/speed-listening?language=${langConfig.code}&level=${userLevel}`);
      const d: GameData = await res.json();
      setData(d);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [langConfig.code, userLevel]);

  const playAudio = async (rate: number = 1.5) => {
    if (!data) return;
    setPlaying(true);
    try {
      let url = blobRef.current;
      if (!url) {
        const res = await fetch("/api/pronunciation/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: data.transcript, lang: langConfig.code }),
        });
        if (!res.ok) throw new Error("TTS failed");
        const blob = await res.blob();
        url = URL.createObjectURL(blob);
        blobRef.current = url;
      }
      const audio = new Audio(url);
      audio.playbackRate = rate;
      audio.onended = () => { setPlaying(false); if (rate === 1.5) setPhase("questions"); };
      audio.onerror = () => setPlaying(false);
      await audio.play();
    } catch {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(data.transcript);
        utt.lang = langConfig.ttsLocale ?? "fr-FR";
        utt.rate = rate;
        utt.onend = () => { setPlaying(false); if (rate === 1.5) setPhase("questions"); };
        window.speechSynthesis.speak(utt);
      } else { setPlaying(false); }
    }
  };

  const useLifeline = () => {
    if (!lifeline) return;
    setLifeline(false);
    // Re-play at normal speed (1.0) — revoke cache so it re-fetches at normal rate
    if (blobRef.current) { URL.revokeObjectURL(blobRef.current); blobRef.current = null; }
    playAudio(1.0);
  };

  const handleAnswer = (i: number) => {
    if (answered || !data) return;
    setSelected(i);
    setAnswered(true);
    if (i === data.questions[qIdx].correctIndex) setScore((s) => s + 1);
  };

  const handleNext = async () => {
    if (!data) return;
    const next = qIdx + 1;
    if (next >= data.questions.length) {
      const pct = Math.round((score / data.questions.length) * 100);
      setSaving(true);
      try {
        const res = await fetch("/api/games/speed-listening", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ score: pct }),
        });
        const d = await res.json();
        setXpEarned(d.xpEarned ?? 10);
        window.dispatchEvent(new CustomEvent("xp-updated"));
      } catch (e) { console.error(e); }
      finally { setSaving(false); }
      setPhase("done");
    } else {
      setQIdx(next);
      setSelected(null);
      setAnswered(false);
    }
  };

  // Locked for A1/A2
  if (data?.locked) return (
    <div className="max-w-md mx-auto text-center py-16 space-y-4">
      <div className="text-5xl">🔒</div>
      <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>B1 Required</p>
      <p style={{ color: "var(--text-2)", fontSize: 13 }}>{data.message}</p>
      <Link href="/games" className="btn-secondary">{t(locale, "game_backToGames")}</Link>
    </div>
  );

  // Intro screen (load on demand)
  if (phase === "intro" && !data) return (
    <div className="max-w-md mx-auto text-center py-10 space-y-6 animate-fade-up">
      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 14px", borderRadius: 999, background: "rgba(239,68,68,0.15)", border: "1px solid var(--red)" }}>
        <Zap size={12} style={{ color: "var(--red)" }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--red)" }}>1.5× SPEED</span>
      </div>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)" }}>{t(locale, "game_speedListening")}</h2>
        <p style={{ fontSize: 13, color: "var(--text-2)", marginTop: 6 }}>Audio plays at 1.5× — train your ear for real-world speech speed</p>
      </div>
      <div className="rounded-2xl p-4 text-left space-y-2" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
        {["⚡ Audio at 1.5× normal speed", "🚫 No replay (except 1 lifeline)", "❓ 5 comprehension questions after", "🔁 Normal speed replay available after questions"].map((t) => (
          <p key={t} style={{ fontSize: 12, color: "var(--text-2)" }}>{t}</p>
        ))}
      </div>
      {loading ? <Loader2 size={24} className="animate-spin mx-auto" style={{ color: "var(--accent)" }} /> : (
        <button onClick={loadGame} className="btn-primary w-full py-3">Load & Start</button>
      )}
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 size={32} className="animate-spin" style={{ color: "var(--accent)" }} />
    </div>
  );

  if (phase === "intro" && data) return (
    <div className="max-w-md mx-auto text-center py-10 space-y-6 animate-fade-up">
      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 14px", borderRadius: 999, background: "rgba(239,68,68,0.15)", border: "1px solid var(--red)" }}>
        <Zap size={12} style={{ color: "var(--red)" }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--red)" }}>1.5× SPEED — {data.contentType}</span>
      </div>
      <p style={{ fontSize: 14, color: "var(--text-2)" }}>Ready? The audio will play at 1.5× speed. Listen carefully.</p>
      <button onClick={() => { setPhase("listening"); playAudio(1.5); }} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
        <Play size={16} fill="currentColor" /> Play Audio
      </button>
    </div>
  );

  if (phase === "listening") return (
    <div className="max-w-md mx-auto text-center py-16 space-y-6 animate-fade-up">
      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 14px", borderRadius: 999, background: "rgba(239,68,68,0.15)", border: "1px solid var(--red)" }}>
        <Zap size={12} style={{ color: "var(--red)" }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--red)" }}>PLAYING AT 1.5×</span>
      </div>
      <div className="flex items-center justify-center gap-1">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} style={{ width: 4, borderRadius: 4, background: "var(--accent)",
            height: `${16 + Math.sin(i * 0.9) * 12}px`,
            animation: "pulse 0.6s ease-in-out infinite alternate",
            animationDelay: `${i * 0.05}s` }} />
        ))}
      </div>
      <p style={{ color: "var(--text-3)", fontSize: 13 }}>{playing ? "Listening…" : "Finished. Moving to questions…"}</p>
    </div>
  );

  if (phase === "questions" && data) {
    const q = data.questions[qIdx];
    return (
      <div className="max-w-lg mx-auto space-y-5 animate-fade-up">
        <div style={{ height: 4, background: "var(--surface-2)", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(qIdx / data.questions.length) * 100}%`, background: "var(--accent)", transition: "width 0.3s" }} />
        </div>
        <div className="flex items-center justify-between">
          <p style={{ fontSize: 12, color: "var(--text-3)" }}>Question {qIdx + 1} of {data.questions.length}</p>
          <button onClick={useLifeline} disabled={!lifeline || playing}
            style={{ fontSize: 11, padding: "3px 10px", borderRadius: 8, background: lifeline ? "rgba(245,158,11,0.15)" : "var(--surface-2)", border: `1px solid ${lifeline ? "var(--gold)" : "var(--border)"}`, color: lifeline ? "var(--gold)" : "var(--text-3)", cursor: lifeline ? "pointer" : "default" }}>
            🔄 Replay lifeline ({lifeline ? "1" : "0"} left)
          </button>
        </div>
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
            {qIdx + 1 >= data.questions.length ? "See Results" : "Next"} <ChevronRight size={14} />
          </button>
        )}
      </div>
    );
  }

  // Done
  const pct = data ? Math.round((score / data.questions.length) * 100) : 0;
  return (
    <div className="max-w-md mx-auto text-center py-10 space-y-5 animate-fade-up">
      <div className="text-5xl">{pct >= 80 ? "⚡" : pct >= 60 ? "👂" : "📻"}</div>
      <p style={{ fontSize: 44, fontWeight: 900, color: "var(--text)" }}>{pct}%</p>
      <p style={{ color: "var(--text-3)", fontSize: 13 }}>{score} / {data?.questions.length} questions correct at 1.5× speed</p>
      {saving ? <p style={{ color: "var(--text-3)", fontSize: 12 }}>Saving…</p> : (
        <div className="flex items-center justify-center gap-2">
          <span>⚡</span><span style={{ fontWeight: 700, color: "var(--gold)" }}>+{xpEarned} XP</span>
        </div>
      )}
      {/* Normal speed replay */}
      {data && (
        <button onClick={() => { if (blobRef.current) { URL.revokeObjectURL(blobRef.current); blobRef.current = null; } playAudio(1.0); }}
          className="btn-secondary flex items-center gap-2 mx-auto" disabled={playing}>
          <Play size={14} fill="currentColor" /> Listen again at normal speed
        </button>
      )}
      <div className="flex gap-3 justify-center">
        <button onClick={loadGame} className="btn-primary flex items-center gap-2"><RefreshCw size={14} /> Play Again</button>
        <Link href="/games" className="btn-secondary">{t(locale, "game_allGames")}</Link>
      </div>
    </div>
  );
}
