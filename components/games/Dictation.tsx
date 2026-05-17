"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { getLanguageConfig } from "@/data/language-config";
import { t, getLocale } from "@/lib/i18n";
import Link from "next/link";
import { Play, RefreshCw, Loader2, Volume2, Snail, ChevronRight } from "lucide-react";

const ACCENT_CHARS: Record<string, string[]> = {
  fr: ["é","è","ê","ë","à","â","ù","û","ü","ô","î","ï","ç","œ","É","È","Ê","À","Â","Ç"],
  es: ["á","é","í","ó","ú","ñ","ü","¿","¡","Á","É","Í","Ó","Ú","Ñ"],
  en: [],
};

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, " ").replace(/['']/g, "'").replace(/[.,!?;:]/g, "");
}

function accentOnly(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

type WordResult = "correct" | "wrong" | "accent";

interface Props { language?: string; level?: string; }

export function Dictation({ language, level }: Props) {
  const { data: session } = useSession();
  const langConfig = getLanguageConfig(session?.user?.targetLanguage ?? language ?? "fr");
  const locale = getLocale((session?.user as { nativeLanguage?: string })?.nativeLanguage);
  const userLevel = (session?.user as any)?.cefrLevel ?? level ?? "B1";

  const [sentences, setSentences]   = useState<string[]>([]);
  const [loading, setLoading]       = useState(true);
  const [idx, setIdx]               = useState(0);
  const [input, setInput]           = useState("");
  const [replaysLeft, setReplaysLeft] = useState(3);
  const [playing, setPlaying]       = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [wordResults, setWordResults] = useState<WordResult[]>([]);
  const [score, setScore]           = useState(0);
  const [xpEarned, setXpEarned]     = useState(0);
  const [saving, setSaving]         = useState(false);
  const [done, setDone]             = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const blobUrlRef = useRef<string | null>(null);
  const accentChars = ACCENT_CHARS[langConfig.code] ?? [];
  const TOTAL = 8;

  const loadGame = useCallback(async () => {
    setLoading(true);
    setIdx(0); setInput(""); setReplaysLeft(3); setPlaying(false);
    setSubmitted(false); setScore(0); setDone(false);
    try {
      const res = await fetch(`/api/games/dictation?language=${langConfig.code}&level=${userLevel}`);
      const data = await res.json();
      setSentences(data.sentences ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [langConfig.code, userLevel]);

  useEffect(() => { loadGame(); }, [loadGame]);

  // Revoke blob URL on unmount / sentence change
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) { URL.revokeObjectURL(blobUrlRef.current); blobUrlRef.current = null; }
    };
  }, [idx]);

  const playAudio = useCallback(async (rate: number = 1.0) => {
    if (playing || !sentences[idx]) return;
    setPlaying(true);

    try {
      // Use cached blob if available, otherwise fetch
      let blobUrl = blobUrlRef.current;
      if (!blobUrl) {
        const res = await fetch("/api/pronunciation/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: sentences[idx], lang: langConfig.ttsLocale ?? `${langConfig.code}-FR` }),
        });
        if (!res.ok) throw new Error("TTS failed");
        const blob = await res.blob();
        blobUrl = URL.createObjectURL(blob);
        blobUrlRef.current = blobUrl;
      }

      const audio = new Audio(blobUrl);
      audio.playbackRate = rate;
      audioRef.current = audio;
      audio.onended = () => setPlaying(false);
      audio.onerror = () => setPlaying(false);
      await audio.play();
    } catch {
      // Fallback to Web Speech
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(sentences[idx]);
        utt.lang = langConfig.ttsLocale ?? "fr-FR";
        utt.rate = rate * 0.85;
        utt.onend = () => setPlaying(false);
        window.speechSynthesis.speak(utt);
      } else {
        setPlaying(false);
      }
    }
  }, [playing, sentences, idx, langConfig]);

  const handleReplay = (slow = false) => {
    if (replaysLeft <= 0) return;
    setReplaysLeft((r) => r - 1);
    // Revoke cached URL so we can re-fetch fresh (slow mode may differ)
    if (slow && blobUrlRef.current) { URL.revokeObjectURL(blobUrlRef.current); blobUrlRef.current = null; }
    playAudio(slow ? 0.75 : 1.0);
  };

  const insertAccent = (char: string) => {
    const el = inputRef.current;
    if (!el) return;
    const start = el.selectionStart ?? input.length;
    const end   = el.selectionEnd   ?? input.length;
    const next  = input.slice(0, start) + char + input.slice(end);
    setInput(next);
    setTimeout(() => { el.setSelectionRange(start + 1, start + 1); el.focus(); }, 0);
  };

  const handleSubmit = () => {
    if (submitted || !input.trim() || !sentences[idx]) return;
    setSubmitted(true);

    const userWords    = normalize(input).split(" ");
    const correctWords = normalize(sentences[idx]).split(" ");
    const results: WordResult[] = correctWords.map((cw, i) => {
      const uw = userWords[i] ?? "";
      if (uw === cw) return "correct";
      if (accentOnly(uw) === accentOnly(cw)) return "accent";
      return "wrong";
    });

    setWordResults(results);
    const correct = results.filter((r) => r === "correct").length;
    const near    = results.filter((r) => r === "accent").length;
    const qScore  = (correct + near * 0.7) / correctWords.length;
    setScore((s) => s + qScore);
  };

  const handleNext = async () => {
    const nextIdx = idx + 1;
    const total = Math.min(TOTAL, sentences.length);

    // Revoke cached audio blob
    if (blobUrlRef.current) { URL.revokeObjectURL(blobUrlRef.current); blobUrlRef.current = null; }

    if (nextIdx >= total) {
      const pct = Math.round((score / total) * 100);
      setSaving(true);
      try {
        const res = await fetch("/api/games/dictation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ score: pct }),
        });
        const d = await res.json();
        setXpEarned(d.xpEarned ?? 10);
        window.dispatchEvent(new CustomEvent("xp-updated"));
      } catch (e) { console.error(e); }
      finally { setSaving(false); }
      setDone(true);
    } else {
      setIdx(nextIdx);
      setInput("");
      setReplaysLeft(3);
      setSubmitted(false);
      setWordResults([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Loader2 size={32} className="animate-spin" style={{ color: "var(--accent)" }} />
      <p style={{ color: "var(--text-3)", fontSize: 13 }}>Loading dictation…</p>
    </div>
  );

  if (done) {
    const total = Math.min(TOTAL, sentences.length);
    const pct = Math.round((score / total) * 100);
    return (
      <div className="max-w-md mx-auto text-center py-10 space-y-5 animate-fade-up">
        <div className="text-5xl">{pct >= 80 ? "✍️" : pct >= 60 ? "📝" : "💪"}</div>
        <p style={{ fontSize: 44, fontWeight: 900, color: "var(--text)" }}>{pct}%</p>
        <p style={{ color: "var(--text-3)", fontSize: 13 }}>Dictation complete — {total} sentences</p>
        {saving ? <p style={{ color: "var(--text-3)", fontSize: 12 }}>Saving…</p> : (
          <div className="flex items-center justify-center gap-2">
            <span style={{ fontSize: 20 }}>⚡</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: "var(--gold)" }}>+{xpEarned} XP</span>
          </div>
        )}
        <div className="flex gap-3 justify-center">
          <button onClick={loadGame} className="btn-primary flex items-center gap-2"><RefreshCw size={14} /> Play Again</button>
          <Link href="/games" className="btn-secondary">{t(locale, "game_allGames")}</Link>
        </div>
      </div>
    );
  }

  const total = Math.min(TOTAL, sentences.length);

  return (
    <div className="max-w-xl mx-auto space-y-5 animate-fade-up">
      {/* Progress */}
      <div style={{ height: 4, background: "var(--surface-2)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(idx / total) * 100}%`, background: "var(--accent)", transition: "width 0.3s" }} />
      </div>
      <p style={{ fontSize: 12, color: "var(--text-3)" }}>Sentence {idx + 1} of {total}</p>

      {/* Audio player */}
      <div className="flex flex-col items-center gap-4 py-6 rounded-2xl"
        style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
        <button onClick={() => !submitted ? playAudio(1.0) : handleReplay()}
          disabled={playing}
          className="flex items-center justify-center rounded-full transition-all"
          style={{
            width: 80, height: 80,
            background: playing ? "var(--surface)" : "var(--accent)",
            border: `2px solid ${playing ? "var(--border)" : "var(--accent)"}`,
            cursor: playing ? "default" : "pointer",
          }}>
          {playing
            ? <Volume2 size={32} style={{ color: "var(--accent)" }} className="animate-pulse" />
            : <Play size={32} fill="#fff" style={{ color: "#fff" }} />
          }
        </button>

        {!submitted && (
          <div className="flex items-center gap-3">
            <button onClick={() => handleReplay()} disabled={replaysLeft <= 0 || playing}
              className="flex items-center gap-1 text-xs px-3 py-2 rounded-lg"
              style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                color: replaysLeft > 0 ? "var(--text-2)" : "var(--text-3)",
                opacity: replaysLeft > 0 ? 1 : 0.5, cursor: replaysLeft > 0 ? "pointer" : "default",
              }}>
              <Volume2 size={12} /> Replay ({replaysLeft} left)
            </button>
            <button onClick={() => handleReplay(true)} disabled={replaysLeft <= 0 || playing}
              className="flex items-center gap-1 text-xs px-3 py-2 rounded-lg"
              style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                color: replaysLeft > 0 ? "var(--text-2)" : "var(--text-3)",
                opacity: replaysLeft > 0 ? 1 : 0.5, cursor: replaysLeft > 0 ? "pointer" : "default",
              }}>
              <Snail size={12} /> Slow
            </button>
          </div>
        )}
      </div>

      {/* Input */}
      {!submitted && (
        <div className="space-y-2">
          <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
            placeholder={t(locale, "game_typeWhatHeard")}
            disabled={!sentences[idx]}
            style={{
              width: "100%", height: 52, fontSize: 18, padding: "0 16px",
              borderRadius: 14, border: "2px solid var(--border)",
              background: "var(--surface-2)", color: "var(--text)", outline: "none",
            }} />
          <div className="flex flex-wrap gap-1">
            {accentChars.map((ch) => (
              <button key={ch} onClick={() => insertAccent(ch)}
                style={{ width: 32, height: 32, borderRadius: 8, fontSize: 12, fontWeight: 600,
                  background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-2)", cursor: "pointer" }}>
                {ch}
              </button>
            ))}
          </div>
          <button onClick={handleSubmit} disabled={!input.trim()}
            className="btn-primary w-full py-3" style={{ opacity: input.trim() ? 1 : 0.5 }}>
            Submit
          </button>
        </div>
      )}

      {/* Result */}
      {submitted && sentences[idx] && (
        <div className="rounded-2xl p-4 space-y-3 animate-fade-up"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
          <p style={{ fontSize: 12, color: "var(--text-3)" }}>Correct sentence:</p>
          <div className="flex flex-wrap gap-2">
            {normalize(sentences[idx]).split(" ").map((word, i) => {
              const r = wordResults[i];
              const color = r === "correct" ? "var(--green)" : r === "accent" ? "var(--gold)" : "var(--red)";
              const bg = r === "correct" ? "rgba(16,185,129,0.15)" : r === "accent" ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)";
              return (
                <span key={i} style={{ padding: "3px 10px", borderRadius: 8, fontSize: 15, fontWeight: 600, background: bg, color }}>
                  {word}
                </span>
              );
            })}
          </div>
          <div className="flex items-center gap-4 text-xs" style={{ color: "var(--text-3)" }}>
            <span style={{ color: "var(--green)" }}>✓ correct</span>
            <span style={{ color: "var(--gold)" }}>~ accent error</span>
            <span style={{ color: "var(--red)" }}>✗ wrong</span>
          </div>
          <button onClick={handleNext} className="btn-primary flex items-center gap-2">
            {idx + 1 >= total ? "See Results" : "Next"} <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
