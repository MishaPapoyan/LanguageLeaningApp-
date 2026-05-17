"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { getLanguageConfig } from "@/data/language-config";
import { t, getLocale } from "@/lib/i18n";
import Link from "next/link";
import { RefreshCw, Loader2, ChevronRight, ChevronDown } from "lucide-react";

interface TenseQuestion {
  sourceSentence: string;
  targetTense: string;
  correctAnswer: string;
  conjugationExplanation: string;
  stepByStep: string[];
}

type AnswerState = "idle" | "correct" | "near" | "wrong";

// Accent chars by language
const ACCENT_CHARS: Record<string, string[]> = {
  fr: ["é","è","ê","ë","à","â","ù","û","ü","ô","î","ï","ç","œ","æ","É","È","Ê","À","Â","Ç"],
  es: ["á","é","í","ó","ú","ñ","ü","¿","¡","Á","É","Í","Ó","Ú","Ñ"],
  en: [],
};

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, " ").replace(/['']/g, "'");
}

function isNearMatch(input: string, correct: string): boolean {
  const a = normalize(input);
  const b = normalize(correct);
  if (a === b) return false;
  // Check if difference is only accent marks
  const aNoAccent = a.normalize("NFD").replace(/[̀-ͯ]/g, "");
  const bNoAccent = b.normalize("NFD").replace(/[̀-ͯ]/g, "");
  return aNoAccent === bNoAccent;
}

interface Props { language?: string; level?: string; }

export function TenseChallenge({ language, level }: Props) {
  const { data: session } = useSession();
  const langConfig = getLanguageConfig(session?.user?.targetLanguage ?? language ?? "fr");
  const locale = getLocale((session?.user as { nativeLanguage?: string })?.nativeLanguage);
  const userLevel = (session?.user as any)?.cefrLevel ?? level ?? "B1";

  const [sentences, setSentences]   = useState<TenseQuestion[]>([]);
  const [targetTense, setTargetTense] = useState("");
  const [loading, setLoading]       = useState(true);
  const [idx, setIdx]               = useState(0);
  const [input, setInput]           = useState("");
  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [score, setScore]           = useState(0);
  const [xpEarned, setXpEarned]     = useState(0);
  const [saving, setSaving]         = useState(false);
  const [done, setDone]             = useState(false);
  const [showSteps, setShowSteps]   = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const accentChars = ACCENT_CHARS[langConfig.code] ?? [];
  const TOTAL = 8;

  const loadGame = useCallback(async () => {
    setLoading(true);
    setIdx(0); setInput(""); setAnswerState("idle");
    setScore(0); setDone(false); setShowSteps(false);
    try {
      const res = await fetch(`/api/games/tense-challenge?language=${langConfig.code}&level=${userLevel}`);
      const data = await res.json();
      setSentences(data.sentences ?? []);
      setTargetTense(data.targetTense ?? "");
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [langConfig.code, userLevel]);

  useEffect(() => { loadGame(); }, [loadGame]);

  const currentQ = sentences[idx];

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
    if (!currentQ || answerState !== "idle" || !input.trim()) return;
    const norm = normalize(input);
    const correct = normalize(currentQ.correctAnswer);
    if (norm === correct) {
      setAnswerState("correct");
      setScore((s) => s + 1);
    } else if (isNearMatch(input, currentQ.correctAnswer)) {
      setAnswerState("near");
      setScore((s) => s + 0.5);
    } else {
      setAnswerState("wrong");
    }
    setShowSteps(false);
  };

  const handleNext = async () => {
    const nextIdx = idx + 1;
    const total = Math.min(TOTAL, sentences.length);
    if (nextIdx >= total) {
      const pct = Math.round((score / total) * 100);
      setSaving(true);
      try {
        const res = await fetch("/api/games/tense-challenge", {
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
      setAnswerState("idle");
      setShowSteps(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const borderColor = answerState === "correct" ? "var(--green)" : answerState === "near" ? "var(--gold)" : answerState === "wrong" ? "var(--red)" : "var(--border)";

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Loader2 size={32} className="animate-spin" style={{ color: "var(--accent)" }} />
      <p style={{ color: "var(--text-3)", fontSize: 13 }}>Generating sentences…</p>
    </div>
  );

  // Done screen
  if (done) {
    const total = Math.min(TOTAL, sentences.length);
    const pct = Math.round((score / total) * 100);
    return (
      <div className="max-w-md mx-auto text-center py-10 space-y-5 animate-fade-up">
        <div className="text-5xl">{pct >= 80 ? "🏆" : pct >= 60 ? "📝" : "💪"}</div>
        <p style={{ fontSize: 44, fontWeight: 900, color: "var(--text)" }}>{pct}%</p>
        <p style={{ color: "var(--text-3)", fontSize: 13 }}>{score} / {total} sentences correctly transformed to <strong style={{ color: "var(--accent)" }}>{targetTense}</strong></p>
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

  if (!currentQ) return null;
  const total = Math.min(TOTAL, sentences.length);

  return (
    <div className="max-w-xl mx-auto space-y-5 animate-fade-up">
      {/* Progress */}
      <div style={{ height: 4, background: "var(--surface-2)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(idx / total) * 100}%`, background: "var(--accent)", transition: "width 0.3s" }} />
      </div>
      <div className="flex justify-between items-center">
        <p style={{ fontSize: 12, color: "var(--text-3)" }}>Sentence {idx + 1} of {total}</p>
        <p style={{ fontSize: 12, color: "var(--text-3)" }}>Score: {score}</p>
      </div>

      {/* Tense instruction banner */}
      <div className="rounded-xl px-4 py-3 text-center" style={{ background: "var(--accent)", color: "#fff" }}>
        <p style={{ fontSize: 11, opacity: 0.85 }}>{t(locale, "game_rewriteIn")}</p>
        <p style={{ fontSize: 18, fontWeight: 800 }}>{currentQ.targetTense}</p>
      </div>

      {/* Source sentence */}
      <div className="rounded-2xl p-4 text-center" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
        <p style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 6 }}>ORIGINAL (PRESENT TENSE)</p>
        <p style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}>{currentQ.sourceSentence}</p>
      </div>

      {/* Input */}
      <div>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => { if (answerState === "idle") setInput(e.target.value); }}
          onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
          placeholder={`Type in ${targetTense}…`}
          autoFocus
          style={{
            width: "100%",
            height: 52,
            fontSize: 18,
            padding: "0 16px",
            borderRadius: 14,
            border: `2px solid ${borderColor}`,
            background: "var(--surface-2)",
            color: "var(--text)",
            outline: "none",
            transition: "border-color 0.2s",
          }}
        />

        {/* Accent helper bar */}
        <div className="flex flex-wrap gap-1 mt-2">
          {accentChars.map((ch) => (
            <button key={ch} onClick={() => insertAccent(ch)}
              style={{
                width: 34, height: 34, borderRadius: 8, fontSize: 13, fontWeight: 600,
                background: "var(--surface-2)", border: "1px solid var(--border)",
                color: "var(--text-2)", cursor: "pointer",
              }}>
              {ch}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      {answerState === "idle" && (
        <button onClick={handleSubmit} disabled={!input.trim()} className="btn-primary w-full py-3 text-base"
          style={{ opacity: input.trim() ? 1 : 0.5 }}>
          Check Answer
        </button>
      )}

      {/* Feedback */}
      {answerState !== "idle" && (
        <div className="rounded-2xl p-4 space-y-3 animate-fade-up"
          style={{
            background: answerState === "correct" ? "rgba(16,185,129,0.1)" : answerState === "near" ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)",
            border: `1px solid ${borderColor}`,
          }}>
          {answerState === "correct" && <p style={{ fontSize: 14, fontWeight: 700, color: "var(--green)" }}>✅ Perfect!</p>}
          {answerState === "near" && (
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--gold)" }}>⚠️ Almost! Watch your accent marks.</p>
              <p style={{ fontSize: 13, color: "var(--text-2)", marginTop: 4 }}>Correct: <span style={{ color: "var(--green)", fontWeight: 700 }}>{currentQ.correctAnswer}</span></p>
            </div>
          )}
          {answerState === "wrong" && (
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--red)" }}>❌ Not quite.</p>
              <p style={{ fontSize: 13, color: "var(--text-2)", marginTop: 4 }}>Correct: <span style={{ color: "var(--green)", fontWeight: 700 }}>{currentQ.correctAnswer}</span></p>
            </div>
          )}

          <p style={{ fontSize: 13, color: "var(--text-2)" }}>{currentQ.conjugationExplanation}</p>

          {/* Step-by-step toggle */}
          <button onClick={() => setShowSteps((s) => !s)}
            className="flex items-center gap-1 text-xs"
            style={{ color: "var(--accent)", cursor: "pointer", background: "none", border: "none" }}>
            {showSteps ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            Step-by-step explanation
          </button>

          {showSteps && (
            <div className="space-y-1 pl-3 border-l-2" style={{ borderColor: "var(--accent)" }}>
              {currentQ.stepByStep.map((step, i) => (
                <p key={i} style={{ fontSize: 12, color: "var(--text-2)" }}>
                  <span style={{ color: "var(--accent)", fontWeight: 700 }}>{i + 1}.</span> {step}
                </p>
              ))}
            </div>
          )}

          <button onClick={handleNext} className="btn-primary flex items-center gap-2 mt-2">
            {idx + 1 >= total ? "See Results" : "Next"} <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
