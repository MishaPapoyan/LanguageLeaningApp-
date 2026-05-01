"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { getLanguageConfig } from "@/data/language-config";
import Link from "next/link";
import { RefreshCw, Loader2, ChevronRight } from "lucide-react";

interface Choice {
  text: string;
  hint: string;
  correct: boolean;
  feedback: string;
}

interface DialogNode {
  id: string;
  npc: string;
  npcLine: string;
  npcTranslation: string;
  choices: Choice[];
}

interface VenueData {
  venue: string;
  title: string;
  emoji: string;
  setting: string;
  nodes: DialogNode[];
}

type Phase = "loading" | "intro" | "conversation" | "done";

interface Props {
  venue: string;   // e.g. "airport" | "doctor-office" | "market-bazaar"
  language?: string;
  level?: string;
}

export function VenueConversation({ venue, language, level }: Props) {
  const { data: session } = useSession();
  const langConfig = getLanguageConfig(session?.user?.targetLanguage ?? language ?? "fr");
  const userLevel = (session?.user as any)?.cefrLevel ?? level ?? "B1";

  const [data, setData]           = useState<VenueData | null>(null);
  const [phase, setPhase]         = useState<Phase>("loading");
  const [nodeIdx, setNodeIdx]     = useState(0);
  const [selected, setSelected]   = useState<number | null>(null);
  const [answered, setAnswered]   = useState(false);
  const [score, setScore]         = useState(0);
  const [xpEarned, setXpEarned]   = useState(0);
  const [saving, setSaving]       = useState(false);
  const [showHints, setShowHints] = useState(false);

  const loadGame = useCallback(async () => {
    setPhase("loading");
    setNodeIdx(0); setSelected(null); setAnswered(false);
    setScore(0); setShowHints(false);
    try {
      const res = await fetch(`/api/games/${venue}?language=${langConfig.code}&level=${userLevel}`);
      const d: VenueData = await res.json();
      setData(d);
      setPhase("intro");
    } catch (e) {
      console.error(e);
    }
  }, [venue, langConfig.code, userLevel]);

  useEffect(() => { loadGame(); }, [loadGame]);

  const currentNode = data?.nodes[nodeIdx];

  const handleChoice = (i: number) => {
    if (answered || !currentNode) return;
    setSelected(i);
    setAnswered(true);
    if (currentNode.choices[i].correct) setScore((s) => s + 1);
  };

  const handleNext = async () => {
    if (!data) return;
    const nextIdx = nodeIdx + 1;
    if (nextIdx >= data.nodes.length) {
      const total = data.nodes.length;
      const pct = Math.round((score / total) * 100);
      setSaving(true);
      try {
        const res = await fetch(`/api/games/${venue}`, {
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
      setNodeIdx(nextIdx);
      setSelected(null);
      setAnswered(false);
      setShowHints(false);
    }
  };

  // ── Loading ─────────────────────────────────────────────────────
  if (phase === "loading") return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Loader2 size={32} className="animate-spin" style={{ color: "var(--accent)" }} />
      <p style={{ color: "var(--text-3)", fontSize: 13 }}>Generating scenario…</p>
    </div>
  );

  if (!data) return null;

  // ── Intro ───────────────────────────────────────────────────────
  if (phase === "intro") return (
    <div className="max-w-md mx-auto text-center py-10 space-y-6 animate-fade-up">
      <div className="text-5xl">{data.emoji}</div>
      <div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--text)" }}>{data.title}</h2>
        <p style={{ fontSize: 14, color: "var(--text-2)", marginTop: 8, lineHeight: 1.6 }}>{data.setting}</p>
      </div>
      <div className="rounded-2xl p-4 text-left space-y-2"
        style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
        {[
          "💬 Read what the NPC says carefully",
          "🎯 Pick the most appropriate response in " + langConfig.label,
          "💡 Tap 'show hints' if you need English help",
          "⚡ One point per correct exchange",
        ].map((t) => <p key={t} style={{ fontSize: 12, color: "var(--text-2)" }}>{t}</p>)}
      </div>
      <button onClick={() => setPhase("conversation")} className="btn-primary w-full py-3 text-base">
        Start Conversation
      </button>
    </div>
  );

  // ── Conversation ────────────────────────────────────────────────
  if (phase === "conversation" && currentNode) {
    return (
      <div className="max-w-lg mx-auto space-y-5 animate-fade-up">
        {/* Progress bar */}
        <div style={{ height: 4, background: "var(--surface-2)", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(nodeIdx / data.nodes.length) * 100}%`, background: "var(--accent)", transition: "width 0.3s" }} />
        </div>
        <div className="flex justify-between items-center">
          <p style={{ fontSize: 12, color: "var(--text-3)" }}>
            Exchange {nodeIdx + 1} of {data.nodes.length}
          </p>
          <p style={{ fontSize: 12, color: "var(--text-3)" }}>
            {score} correct
          </p>
        </div>

        {/* NPC speech bubble */}
        <div className="rounded-2xl p-4 space-y-2"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)",
            textTransform: "uppercase", letterSpacing: 1 }}>
            {currentNode.npc}
          </p>
          <p style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", lineHeight: 1.4 }}>
            {currentNode.npcLine}
          </p>
          {(answered || showHints) && (
            <p style={{ fontSize: 13, color: "var(--text-3)", fontStyle: "italic" }}>
              {currentNode.npcTranslation}
            </p>
          )}
        </div>

        {/* Hint toggle */}
        {!answered && (
          <button
            onClick={() => setShowHints((s) => !s)}
            style={{ fontSize: 12, color: "var(--accent)", background: "none", border: "none", cursor: "pointer" }}>
            {showHints ? "Hide hints" : "💡 Show English hints"}
          </button>
        )}

        {/* Choices */}
        <div className="space-y-2">
          {currentNode.choices.map((choice, i) => {
            let bg = "var(--surface-2)", border = "var(--border)", color = "var(--text)";
            if (answered) {
              if (choice.correct)         { bg = "rgba(16,185,129,0.15)"; border = "var(--green)"; color = "var(--green)"; }
              else if (i === selected)    { bg = "rgba(239,68,68,0.15)";  border = "var(--red)";   color = "var(--red)"; }
            }
            const isSelected = i === selected;
            return (
              <button
                key={i}
                onClick={() => handleChoice(i)}
                className="w-full text-left rounded-xl p-3 space-y-1 transition-all"
                style={{ background: bg, border: `1px solid ${border}`, color,
                  cursor: answered ? "default" : "pointer" }}>
                <p style={{ fontSize: 15, fontWeight: 600 }}>{choice.text}</p>
                {showHints && !answered && (
                  <p style={{ fontSize: 12, opacity: 0.65 }}>{choice.hint}</p>
                )}
                {answered && (
                  <p style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>
                    {choice.hint}
                  </p>
                )}
                {answered && isSelected && !choice.correct && (
                  <p style={{ fontSize: 12, color: "var(--red)", marginTop: 4 }}>
                    ❌ {choice.feedback}
                  </p>
                )}
                {answered && choice.correct && isSelected && (
                  <p style={{ fontSize: 12, color: "var(--green)", marginTop: 4 }}>
                    ✅ {choice.feedback}
                  </p>
                )}
                {answered && choice.correct && !isSelected && (
                  <p style={{ fontSize: 12, color: "var(--green)", marginTop: 4 }}>
                    ✅ {choice.feedback}
                  </p>
                )}
              </button>
            );
          })}
        </div>

        {answered && (
          <button onClick={handleNext} className="btn-primary flex items-center gap-2">
            {nodeIdx + 1 >= data.nodes.length ? "See Results" : "Continue"}
            <ChevronRight size={14} />
          </button>
        )}
      </div>
    );
  }

  // ── Done ────────────────────────────────────────────────────────
  const total = data.nodes.length;
  const pct = Math.round((score / total) * 100);
  return (
    <div className="max-w-md mx-auto text-center py-10 space-y-5 animate-fade-up">
      <div className="text-5xl">{pct >= 80 ? "🏆" : pct >= 60 ? "👍" : "💪"}</div>
      <p style={{ fontSize: 44, fontWeight: 900, color: "var(--text)" }}>{pct}%</p>
      <p style={{ color: "var(--text-3)", fontSize: 13 }}>
        {score} / {total} exchanges handled correctly
      </p>
      {saving ? (
        <p style={{ color: "var(--text-3)", fontSize: 12 }}>Saving…</p>
      ) : (
        <div className="flex items-center justify-center gap-2">
          <span style={{ fontSize: 20 }}>⚡</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: "var(--gold)" }}>+{xpEarned} XP</span>
        </div>
      )}
      <div className="flex gap-3 justify-center">
        <button onClick={loadGame} className="btn-primary flex items-center gap-2">
          <RefreshCw size={14} /> Play Again
        </button>
        <Link href="/games" className="btn-secondary">All Games</Link>
      </div>
    </div>
  );
}
