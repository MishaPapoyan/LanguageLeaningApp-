"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { getLanguageConfig } from "@/data/language-config";
import Link from "next/link";
import { Play, RefreshCw, Loader2, Volume2 } from "lucide-react";

interface AccentVoice { region: string; label: string; flag: string; voiceId: string; }
interface Round { word: string; options: string[]; }
interface GameData { voices: AccentVoice[]; rounds: Round[]; }

interface Props { language?: string; level?: string; }

export function AccentChallenge({ language, level }: Props) {
  const { data: session } = useSession();
  const langConfig = getLanguageConfig(session?.user?.targetLanguage ?? language ?? "fr");
  const userLevel = (session?.user as any)?.cefrLevel ?? level ?? "B1";

  const [gameData, setGameData]     = useState<GameData | null>(null);
  const [loading, setLoading]       = useState(true);
  const [roundIdx, setRoundIdx]     = useState(0);
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const [selected, setSelected]     = useState<number | null>(null);
  const [answered, setAnswered]     = useState(false);
  const [score, setScore]           = useState(0);
  const [xpEarned, setXpEarned]     = useState(0);
  const [saving, setSaving]         = useState(false);
  const [done, setDone]             = useState(false);
  // Cache blob URLs per voice per word: key = `${roundIdx}-${voiceIdx}`
  const blobCache = useRef<Map<string, string>>(new Map());

  const loadGame = useCallback(async () => {
    setLoading(true);
    setRoundIdx(0); setSelected(null); setAnswered(false);
    setScore(0); setDone(false); setPlayingIdx(null);
    blobCache.current.forEach((url) => URL.revokeObjectURL(url));
    blobCache.current.clear();
    try {
      const res = await fetch(`/api/games/accent-challenge?language=${langConfig.code}&level=${userLevel}`);
      const data: GameData = await res.json();
      setGameData(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [langConfig.code, userLevel]);

  // Load on mount
  useEffect(() => { loadGame(); }, [loadGame]);

  const playAccent = async (voiceIdx: number) => {
    if (!gameData || playingIdx !== null) return;
    const round = gameData.rounds[roundIdx];
    const cacheKey = `${roundIdx}-${voiceIdx}`;
    setPlayingIdx(voiceIdx);

    try {
      let url = blobCache.current.get(cacheKey);
      if (!url) {
        const res = await fetch("/api/pronunciation/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: round.word, lang: langConfig.code }),
        });
        if (!res.ok) throw new Error("TTS failed");
        const blob = await res.blob();
        url = URL.createObjectURL(blob);
        blobCache.current.set(cacheKey, url);
      }
      const audio = new Audio(url);
      audio.onended = () => setPlayingIdx(null);
      audio.onerror = () => setPlayingIdx(null);
      await audio.play();
    } catch {
      // Web Speech fallback
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(gameData.rounds[roundIdx].word);
        utt.lang = langConfig.ttsLocale ?? "fr-FR";
        utt.rate = 0.85;
        utt.onend = () => setPlayingIdx(null);
        window.speechSynthesis.speak(utt);
      } else { setPlayingIdx(null); }
    }
  };

  const handleAnswer = (optionIdx: number) => {
    if (answered || !gameData) return;
    setSelected(optionIdx);
    setAnswered(true);
    if (gameData.rounds[roundIdx].options[optionIdx] === gameData.rounds[roundIdx].word) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = async () => {
    if (!gameData) return;
    const next = roundIdx + 1;
    if (next >= gameData.rounds.length) {
      const pct = Math.round((score / gameData.rounds.length) * 100);
      setSaving(true);
      try {
        const res = await fetch("/api/games/accent-challenge", {
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
      setRoundIdx(next);
      setSelected(null);
      setAnswered(false);
      setPlayingIdx(null);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Loader2 size={32} className="animate-spin" style={{ color: "var(--accent)" }} />
      <p style={{ color: "var(--text-3)", fontSize: 13 }}>Loading accent challenge…</p>
    </div>
  );

  if (done || !gameData) {
    const pct = gameData ? Math.round((score / gameData.rounds.length) * 100) : 0;
    return (
      <div className="max-w-md mx-auto text-center py-10 space-y-5 animate-fade-up">
        <div className="text-5xl">{pct >= 80 ? "🎤" : pct >= 60 ? "👂" : "🌍"}</div>
        <p style={{ fontSize: 44, fontWeight: 900, color: "var(--text)" }}>{pct}%</p>
        <p style={{ color: "var(--text-3)", fontSize: 13 }}>{score} / {gameData?.rounds.length} accents correctly identified</p>
        {saving ? <p style={{ color: "var(--text-3)", fontSize: 12 }}>Saving…</p> : (
          <div className="flex items-center justify-center gap-2">
            <span>⚡</span><span style={{ fontWeight: 700, color: "var(--gold)" }}>+{xpEarned} XP</span>
          </div>
        )}
        <div className="flex gap-3 justify-center">
          <button onClick={loadGame} className="btn-primary flex items-center gap-2"><RefreshCw size={14} /> Play Again</button>
          <Link href="/games" className="btn-secondary">All Games</Link>
        </div>
      </div>
    );
  }

  const round = gameData.rounds[roundIdx];
  const voices = gameData.voices;

  return (
    <div className="max-w-lg mx-auto space-y-5 animate-fade-up">
      {/* Progress */}
      <div style={{ height: 4, background: "var(--surface-2)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(roundIdx / gameData.rounds.length) * 100}%`, background: "var(--accent)", transition: "width 0.3s" }} />
      </div>
      <div className="flex justify-between">
        <p style={{ fontSize: 12, color: "var(--text-3)" }}>Round {roundIdx + 1} of {gameData.rounds.length}</p>
        <p style={{ fontSize: 12, color: "var(--text-3)" }}>Score: {score}</p>
      </div>

      <div className="rounded-2xl p-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
        <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 12 }}>
          Listen to the same word spoken in {voices.length} different accents. What word do you hear?
        </p>

        {/* Accent audio buttons */}
        <div className="flex gap-3 justify-center">
          {voices.map((v, i) => (
            <button key={i} onClick={() => playAccent(i)}
              disabled={playingIdx !== null}
              className="flex flex-col items-center gap-2 rounded-xl p-4 transition-all"
              style={{
                background: playingIdx === i ? "var(--accent)" : "var(--surface)",
                border: `1px solid ${answered ? "var(--accent)" : "var(--border)"}`,
                minWidth: 72, cursor: playingIdx !== null ? "default" : "pointer",
                opacity: playingIdx !== null && playingIdx !== i ? 0.6 : 1,
              }}>
              <span style={{ fontSize: 20 }}>{answered ? v.flag : "🔊"}</span>
              {playingIdx === i
                ? <Volume2 size={16} style={{ color: "#fff" }} className="animate-pulse" />
                : <Play size={14} fill={playingIdx === i ? "#fff" : "var(--text-3)"} style={{ color: playingIdx === i ? "#fff" : "var(--text-3)" }} />
              }
              {answered && <span style={{ fontSize: 9, color: "var(--text-3)", textAlign: "center", lineHeight: 1.2 }}>{v.label}</span>}
              <span style={{ fontSize: 10, color: playingIdx === i ? "#fff" : "var(--text-3)" }}>Audio {i + 1}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Answer options */}
      <div className="grid grid-cols-2 gap-2">
        {round.options.map((opt, i) => {
          const isCorrect = opt === round.word;
          let bg = "var(--surface-2)", border = "var(--border)", color = "var(--text)";
          if (answered) {
            if (isCorrect) { bg = "rgba(16,185,129,0.15)"; border = "var(--green)"; color = "var(--green)"; }
            else if (i === selected && !isCorrect) { bg = "rgba(239,68,68,0.15)"; border = "var(--red)"; color = "var(--red)"; }
          }
          return (
            <button key={i} onClick={() => handleAnswer(i)}
              className="rounded-xl p-4 text-center font-semibold transition-all"
              style={{ background: bg, border: `1px solid ${border}`, color, fontSize: 15, cursor: answered ? "default" : "pointer" }}>
              {opt}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="rounded-xl p-3 animate-fade-up" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: selected !== null && round.options[selected] === round.word ? "var(--green)" : "var(--red)" }}>
            {selected !== null && round.options[selected] === round.word ? `✅ Correct! The word was "${round.word}"` : `❌ The word was "${round.word}"`}
          </p>
          <div className="flex gap-3 mt-2">
            {voices.map((v, i) => (
              <span key={i} style={{ fontSize: 11, color: "var(--text-3)" }}>{v.flag} {v.label}</span>
            ))}
          </div>
          <button onClick={handleNext} className="btn-primary mt-3 flex items-center gap-2 text-sm">
            {roundIdx + 1 >= gameData.rounds.length ? "See Results" : "Next Round"}
          </button>
        </div>
      )}
    </div>
  );
}
