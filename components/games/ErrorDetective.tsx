"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { getLanguageConfig } from "@/data/language-config";
import { t, getLocale } from "@/lib/i18n";
import Link from "next/link";
import { Heart, RefreshCw, Loader2, ChevronRight } from "lucide-react";

interface SentenceData {
  sentence: string;
  segments: string[];
  errorIndex: number;
  correction: string;
  explanation: string;
  grammarRule: string;
  options?: string[];
}

type Phase = "detect" | "fix" | "result" | "done";

interface Props { language?: string; level?: string; }

export function ErrorDetective({ language, level }: Props) {
  const { data: session } = useSession();
  const langConfig = getLanguageConfig(session?.user?.targetLanguage ?? language ?? "fr");
  const locale = getLocale((session?.user as { nativeLanguage?: string })?.nativeLanguage);
  const userLevel = (session?.user as any)?.cefrLevel ?? level ?? "B1";

  const [sentences, setSentences]     = useState<SentenceData[]>([]);
  const [loading, setLoading]         = useState(true);
  const [idx, setIdx]                 = useState(0);
  const [phase, setPhase]             = useState<Phase>("detect");
  const [selectedSeg, setSelectedSeg] = useState<number | null>(null);
  const [selectedFix, setSelectedFix] = useState<string | null>(null);
  const [hearts, setHearts]           = useState(3);
  const [score, setScore]             = useState(0);
  const [showExplain, setShowExplain] = useState(false);
  const [xpEarned, setXpEarned]       = useState(0);
  const [saving, setSaving]           = useState(false);

  const TOTAL = 10;

  const loadGame = useCallback(async () => {
    setLoading(true);
    setIdx(0); setPhase("detect"); setSelectedSeg(null); setSelectedFix(null);
    setHearts(3); setScore(0); setShowExplain(false);
    try {
      const res = await fetch(`/api/games/error-detective?language=${langConfig.code}&level=${userLevel}`);
      const data = await res.json();
      setSentences(data.sentences ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [langConfig.code, userLevel]);

  useEffect(() => { loadGame(); }, [loadGame]);

  const currentQ = sentences[idx];

  const handleSegmentClick = (i: number) => {
    if (phase !== "detect" || selectedSeg !== null) return;
    setSelectedSeg(i);
  };

  const confirmDetect = () => {
    if (selectedSeg === null || !currentQ) return;
    if (selectedSeg === currentQ.errorIndex) {
      setPhase("fix");
    } else {
      setHearts((h) => Math.max(0, h - 1));
      setShowExplain(true);
    }
  };

  const handleFix = (option: string) => {
    if (phase !== "fix") return;
    setSelectedFix(option);
    if (option === currentQ.correction) {
      setScore((s) => s + 1);
    } else {
      setHearts((h) => Math.max(0, h - 1));
    }
    setPhase("result");
    setShowExplain(true);
  };

  const nextQuestion = async () => {
    const nextIdx = idx + 1;
    if (nextIdx >= Math.min(TOTAL, sentences.length)) {
      // Done — save score
      const pct = Math.round((score / Math.min(TOTAL, sentences.length)) * 100);
      setSaving(true);
      try {
        const res = await fetch("/api/games/error-detective", {
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
      setIdx(nextIdx);
      setPhase("detect");
      setSelectedSeg(null);
      setSelectedFix(null);
      setShowExplain(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Loader2 size={32} className="animate-spin" style={{ color: "var(--accent)" }} />
      <p style={{ color: "var(--text-3)", fontSize: 13 }}>Generating sentences…</p>
    </div>
  );

  // ─── Done screen ───────────────────────────────────────────────
  if (phase === "done") {
    const total = Math.min(TOTAL, sentences.length);
    const pct = Math.round((score / total) * 100);
    return (
      <div className="max-w-md mx-auto text-center py-10 space-y-5 animate-fade-up">
        <div className="text-5xl">{pct >= 80 ? "🕵️" : pct >= 60 ? "🔍" : "📚"}</div>
        <p style={{ fontSize: 44, fontWeight: 900, color: "var(--text)" }}>{pct}%</p>
        <p style={{ color: "var(--text-3)", fontSize: 13 }}>{score} / {total} errors correctly detected and fixed</p>
        {saving ? <p style={{ color: "var(--text-3)", fontSize: 12 }}>Saving…</p> : (
          <div className="flex items-center justify-center gap-2">
            <span style={{ fontSize: 20 }}>⚡</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: "var(--gold)" }}>+{xpEarned} XP</span>
          </div>
        )}
        <div className="flex gap-3 justify-center">
          <button onClick={loadGame} className="btn-primary flex items-center gap-2">
            <RefreshCw size={14} /> Play Again
          </button>
          <Link href="/games" className="btn-secondary">{t(locale, "game_allGames")}</Link>
        </div>
      </div>
    );
  }

  if (!currentQ) return null;

  const options = currentQ.options ?? [currentQ.correction, "option2", "option3", "option4"];
  const shuffledOptions = [...options].sort(() => Math.random() - 0.5);
  const progressPct = (idx / Math.min(TOTAL, sentences.length)) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-up">
      {/* Progress bar */}
      <div style={{ height: 4, background: "var(--surface-2)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${progressPct}%`, background: "var(--accent)", transition: "width 0.3s" }} />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <p style={{ fontSize: 12, color: "var(--text-3)" }}>Question {idx + 1} of {Math.min(TOTAL, sentences.length)}</p>
        <div className="flex gap-1">
          {[0,1,2].map((i) => (
            <Heart key={i} size={18} fill={i < hearts ? "var(--red)" : "none"} stroke="var(--red)" />
          ))}
        </div>
      </div>

      {/* Instruction */}
      <div className="rounded-2xl p-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
        <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 8 }}>
          {phase === "detect" ? "🔍 One word in this sentence is grammatically wrong. Tap it." : "✏️ Now correct the error — select the right form."}
        </p>

        {/* Sentence segments */}
        <div className="flex flex-wrap gap-2 mt-3">
          {currentQ.segments.map((seg, i) => {
            let bg = "var(--surface)";
            let borderColor = "var(--border)";
            let textColor = "var(--text)";

            if (phase === "detect") {
              if (selectedSeg === i) { bg = "rgba(239,68,68,0.15)"; borderColor = "var(--red)"; textColor = "var(--red)"; }
            } else {
              if (i === currentQ.errorIndex) { bg = "rgba(239,68,68,0.15)"; borderColor = "var(--red)"; textColor = "var(--red)"; }
            }

            return (
              <button key={i} onClick={() => handleSegmentClick(i)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: `1px solid ${borderColor}`,
                  background: bg,
                  color: textColor,
                  fontSize: 15,
                  cursor: phase === "detect" && selectedSeg === null ? "pointer" : "default",
                  transition: "all 0.15s",
                }}>
                {seg}
              </button>
            );
          })}
        </div>

        {/* Detect confirm button */}
        {phase === "detect" && selectedSeg !== null && !showExplain && (
          <button onClick={confirmDetect} className="btn-primary mt-4 flex items-center gap-2">
            Confirm Selection <ChevronRight size={14} />
          </button>
        )}

        {/* Wrong detection feedback */}
        {phase === "detect" && showExplain && (
          <div className="mt-4 rounded-xl p-3" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid var(--red)" }}>
            <p style={{ fontSize: 12, color: "var(--red)", fontWeight: 600 }}>
              That's not the error — the mistake is in segment {currentQ.errorIndex + 1}: "{currentQ.segments[currentQ.errorIndex]}"
            </p>
            <button onClick={() => { setPhase("fix"); setShowExplain(false); }} className="btn-primary mt-2 text-xs py-1 px-3">
              Try to fix it →
            </button>
          </div>
        )}
      </div>

      {/* Fix options */}
      {phase === "fix" && (
        <div className="space-y-2">
          <p style={{ fontSize: 12, color: "var(--text-3)" }}>Replace "{currentQ.segments[currentQ.errorIndex]}" with:</p>
          <div className="grid grid-cols-2 gap-2">
            {shuffledOptions.map((opt, i) => (
              <button key={i} onClick={() => handleFix(opt)}
                className="rounded-xl p-3 text-center text-sm font-semibold transition-all"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                  cursor: "pointer",
                }}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Explanation card */}
      {phase === "result" && showExplain && (
        <div className="rounded-2xl p-4 space-y-2 animate-fade-up"
          style={{
            background: selectedFix === currentQ.correction ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
            border: `1px solid ${selectedFix === currentQ.correction ? "var(--green)" : "var(--red)"}`,
          }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: selectedFix === currentQ.correction ? "var(--green)" : "var(--red)" }}>
            {selectedFix === currentQ.correction ? "✅ Correct!" : `❌ The correct form is: "${currentQ.correction}"`}
          </p>
          <p style={{ fontSize: 12, color: "var(--text-3)", fontStyle: "italic" }}>
            📌 Rule: {currentQ.grammarRule}
          </p>
          <p style={{ fontSize: 13, color: "var(--text-2)" }}>{currentQ.explanation}</p>
          <button onClick={nextQuestion} className="btn-primary mt-2 flex items-center gap-2">
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
