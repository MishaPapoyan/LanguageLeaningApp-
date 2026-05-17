"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getLanguageConfig } from "@/data/language-config";
import { t, getLocale } from "@/lib/i18n";
import { wordTranslation } from "@/lib/wordI18n";
import Link from "next/link";
import { Lightbulb, Check, X } from "lucide-react";
import { SpeakButton } from "@/components/ui/SpeakButton";

interface Word { id: string; word: string; translation: string; imageEmoji: string; exampleFr?: string; exampleEn?: string; }

interface Question {
  word: Word;
  sentence: string;   // French sentence with blank
  context: string;    // English context shown to user
  options: string[];  // 4 French word choices
  correctIdx: number;
}

const LABELS = ["A","B","C","D"];

function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}

function buildQuestions(words: Word[], locale: string): Question[] {
  const pool = shuffle(words).slice(0, 10);
  return pool.map(w => {
    // Build sentence with blank
    const sentence = w.exampleFr
      ? w.exampleFr.replace(new RegExp(`\\b${w.word}\\b`, "i"), "___")
      : `___ (${wordTranslation(w, locale)})`;
    const context = w.exampleEn || `Translation: "${wordTranslation(w, locale)}"`;

    // 3 distractors
    const distractors = shuffle(words.filter(x => x.id !== w.id)).slice(0, 3).map(x => x.word);
    const options = shuffle([w.word, ...distractors]);
    return { word: w, sentence, context, options, correctIdx: options.indexOf(w.word) };
  });
}

async function spendXp(amount: number): Promise<boolean> {
  const r = await fetch("/api/user/spend-xp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount }) });
  return r.ok;
}

export function FillBlank({ words }: { words: Word[] }) {
  const { data: session } = useSession();
  const langConfig = getLanguageConfig(session?.user?.targetLanguage ?? "fr");
  const locale = getLocale((session?.user as { nativeLanguage?: string })?.nativeLanguage);
  const [questions]             = useState<Question[]>(() => buildQuestions(words, locale));
  const [idx, setIdx]           = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [eliminated, setEliminated] = useState<number[]>([]);
  const [score, setScore]       = useState(0);
  const [finished, setFinished] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [hintErr, setHintErr]   = useState(false);

  const q = questions[idx];

  // reset hint per question
  useEffect(() => { setHintUsed(false); setEliminated([]); }, [idx]);

  const answer = (i: number) => {
    if (selected !== null || eliminated.includes(i)) return;
    setSelected(i);
    if (i === q.correctIdx) setScore(s => s + 1);
    setTimeout(() => {
      if (idx + 1 >= questions.length) {
        setFinished(true);
        fetch("/api/games/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameType: "FILL_BLANK", score: score + (i === q.correctIdx ? 1 : 0), wordsUsed: questions.map(q => q.word.id) }),
        }).then(r => r.json()).then(d => {
          setXpEarned(d.xpEarned ?? 10);
          window.dispatchEvent(new CustomEvent("xp-updated"));
        }).catch(() => {});
      } else {
        setIdx(i => i + 1);
        setSelected(null);
      }
    }, 900);
  };

  const useHint = async () => {
    if (hintUsed || selected !== null) return;
    const ok = await spendXp(5);
    if (!ok) { setHintErr(true); setTimeout(() => setHintErr(false), 2000); return; }
    window.dispatchEvent(new CustomEvent("xp-updated"));
    setHintUsed(true);
    // Eliminate 2 wrong options
    const wrongs = q.options.map((_, i) => i).filter(i => i !== q.correctIdx);
    setEliminated(shuffle(wrongs).slice(0, 2));
  };

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div style={{ maxWidth: 440, textAlign: "center" }}>
        <div className="card" style={{ padding: "40px 28px" }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>{pct >= 80 ? "🏆" : pct >= 50 ? "🎉" : "💪"}</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", margin: "0 0 8px" }}>{t(locale, "game_complete")}</h2>
          <p style={{ fontSize: 14, color: "var(--text-2)", margin: "0 0 20px" }}>
            <strong style={{ color: "var(--accent)" }}>{score}/{questions.length}</strong> correct · {pct}%
          </p>
          {xpEarned > 0 && (
            <div style={{ padding: "10px 16px", borderRadius: 12, background: "var(--accent-dim)", marginBottom: 20, fontSize: 14, fontWeight: 700, color: "var(--accent)" }}>
              +{xpEarned} XP earned!
            </div>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/games" className="btn-primary" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
              More games
            </Link>
            <Link href="/games" className="btn-outline" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
              Back
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!q) return null;
  const pctDone = (idx / questions.length) * 100;

  return (
    <div style={{ maxWidth: 560 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <p style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", margin: 0 }}>{t(locale, "games_fillBlank")}</p>
          <p style={{ fontSize: 12, color: "var(--text-3)", margin: 0 }}>{idx + 1} of {questions.length}</p>
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--green)" }}>✓ {score}</span>
      </div>

      {/* Progress */}
      <div style={{ height: 5, background: "var(--surface-3)", borderRadius: 999, overflow: "hidden", marginBottom: 22 }}>
        <div style={{ height: "100%", width: `${pctDone}%`, background: "linear-gradient(90deg,var(--accent),var(--accent-2))", borderRadius: 999, transition: "width 0.4s ease" }} />
      </div>

      {/* Sentence card */}
      <div className="card" style={{ padding: "28px 24px", marginBottom: 16, textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 14 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", margin: 0 }}>
            {langConfig.flag} Complete the {langConfig.label} sentence
          </p>
          <SpeakButton text={q.word.word} lang={session?.user?.targetLanguage ?? "fr"} size={13} />
        </div>
        <p style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", lineHeight: 1.4, margin: "0 0 10px" }}>
          {q.sentence.split("___").map((part, i, arr) => (
            <span key={i}>
              {part}
              {i < arr.length - 1 && (
                <span style={{
                  display: "inline-block", minWidth: 80, borderBottom: "2px solid var(--accent)",
                  color: selected !== null ? "var(--accent)" : "transparent",
                  fontWeight: 900,
                }}>
                  {selected !== null ? q.word.word : "___"}
                </span>
              )}
            </span>
          ))}
        </p>
        <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0, fontStyle: "italic" }}>💡 {q.context}</p>
      </div>

      {/* Options */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {q.options.map((opt, i) => {
          const isElim = eliminated.includes(i);
          const isCorrect = i === q.correctIdx;
          const isSelected = i === selected;
          const revealed = selected !== null;

          let bg = "var(--surface-2)", border = "var(--border-md)", color = "var(--text)", opacity = 1;
          if (isElim) { opacity = 0.15; }
          else if (revealed) {
            if (isCorrect) { bg = "rgba(34,197,94,0.12)"; border = "rgba(34,197,94,0.45)"; color = "var(--green)"; }
            else if (isSelected) { bg = "rgba(239,68,68,0.1)"; border = "rgba(239,68,68,0.4)"; color = "var(--red)"; }
            else { opacity = 0.35; }
          }

          return (
            <button key={i} onClick={() => answer(i)} disabled={isElim || selected !== null}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "13px 14px", borderRadius: 13,
                background: bg, border: `1.5px solid ${border}`, color, fontSize: 14, fontWeight: 600,
                cursor: isElim || selected !== null ? "default" : "pointer", opacity, transition: "all 0.15s", textAlign: "left",
              }}>
              <span style={{
                width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                background: revealed && isCorrect ? "rgba(34,197,94,0.2)" : revealed && isSelected ? "rgba(239,68,68,0.15)" : "var(--surface-3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 800, color: revealed && isCorrect ? "var(--green)" : revealed && isSelected ? "var(--red)" : "var(--text-3)",
              }}>
                {revealed && isCorrect ? <Check size={12}/> : revealed && isSelected ? <X size={12}/> : LABELS[i]}
              </span>
              {opt}
            </button>
          );
        })}
      </div>

      {/* Hint */}
      <button onClick={useHint} disabled={hintUsed || selected !== null}
        style={{
          display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 11,
          border: `1px solid ${hintErr ? "rgba(239,68,68,0.4)" : "rgba(245,158,11,0.35)"}`,
          background: hintErr ? "rgba(239,68,68,0.08)" : "rgba(245,158,11,0.08)",
          color: hintErr ? "var(--red)" : "var(--gold)",
          cursor: hintUsed || selected !== null ? "not-allowed" : "pointer",
          fontSize: 13, fontWeight: 700, opacity: hintUsed || selected !== null ? 0.5 : 1,
        }}>
        <Lightbulb size={13} />
        {hintErr ? "Not enough XP!" : hintUsed ? "Hint used (2 eliminated)" : "Hint — eliminate 2 wrong (5 XP)"}
      </button>
    </div>
  );
}
