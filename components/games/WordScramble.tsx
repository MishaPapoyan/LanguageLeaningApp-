"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { getLanguageConfig } from "@/data/language-config";
import { t, getLocale } from "@/lib/i18n";
import { wordTranslation } from "@/lib/wordI18n";
import Link from "next/link";
import { Lightbulb, RotateCcw } from "lucide-react";
import { SpeakButton } from "@/components/ui/SpeakButton";

interface Word { id: string; word: string; translation: string; imageEmoji: string; }

function scramble(str: string): string[] {
  const arr = str.toUpperCase().split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // Ensure scrambled ≠ original
  if (arr.join("") === str.toUpperCase() && arr.length > 1) {
    [arr[0], arr[1]] = [arr[1], arr[0]];
  }
  return arr;
}

async function spendXp(amount: number): Promise<boolean> {
  const r = await fetch("/api/user/spend-xp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount }),
  });
  return r.ok;
}

export function WordScramble({ words }: { words: Word[] }) {
  const { data: session } = useSession();
  const langConfig = getLanguageConfig(session?.user?.targetLanguage ?? "fr");
  const locale = getLocale((session?.user as { nativeLanguage?: string })?.nativeLanguage);
  // Multi-word vocab (e.g. "la madre") can't be scrambled letter-by-letter meaningfully
  const singleWords = words.filter(w => !w.word.includes(" "));
  words = singleWords.length >= 5 ? singleWords : words;
  const ROUNDS = Math.min(words.length, 10);

  const [round, setRound]       = useState(0);
  const [pool, setPool]         = useState<string[]>([]);     // clickable letter tiles
  const [typed, setTyped]       = useState<string[]>([]);     // user's built answer
  const [status, setStatus]     = useState<"idle"|"correct"|"wrong">("idle");
  const [score, setScore]       = useState(0);
  const [finished, setFinished] = useState(false);
  const [elapsed, setElapsed]   = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [hintErr, setHintErr]   = useState(false);
  const [revealed, setRevealed] = useState(0); // how many letters revealed by hint
  const [savePrompt, setSavePrompt] = useState<Word | null>(null);

  // always mirrors score so handleSaveWord reads the post-increment value
  const scoreRef = useRef(0);
  scoreRef.current = score;

  const word = words[round];

  // init / reset on round change
  useEffect(() => {
    if (!word) return;
    setPool(scramble(word.word));
    setTyped([]);
    setStatus("idle");
    setHintUsed(false);
    setRevealed(0);
    setHintErr(false);
  }, [round, word]);

  // timer
  useEffect(() => {
    if (finished) return;
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, [finished]);

  const addLetter = useCallback((idx: number) => {
    if (status !== "idle") return;
    const letter = pool[idx];
    const newTyped = [...typed, letter];
    const newPool  = pool.filter((_, i) => i !== idx);
    setTyped(newTyped);
    setPool(newPool);

    // auto-check when all letters placed
    if (newTyped.length === word.word.length) {
      const attempt = newTyped.join("").toLowerCase();
      if (attempt === word.word.toLowerCase()) {
        setStatus("correct");
        setScore(s => s + 1);
        try {
          const seen: string[] = JSON.parse(localStorage.getItem("langcraft_seen_words") ?? "[]");
          if (!seen.includes(word.id)) {
            setTimeout(() => setSavePrompt(word), 700);
          } else {
            setTimeout(advance, 700);
          }
        } catch { setTimeout(advance, 700); }
      } else {
        setStatus("wrong");
        setTimeout(() => {
          // reset
          setPool(scramble(word.word));
          setTyped([]);
          setStatus("idle");
        }, 800);
      }
    }
  }, [pool, typed, status, word]);

  const removeLetter = useCallback((idx: number) => {
    if (status !== "idle") return;
    const letter = typed[idx];
    setTyped(t => t.filter((_, i) => i !== idx));
    setPool(p => [...p, letter]);
  }, [typed, status]);

  const advance = () => {
    if (round + 1 >= ROUNDS) {
      setFinished(true);
      fetch("/api/games/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameType: "WORD_SCRAMBLE", score: score + 1, wordsUsed: words.slice(0, ROUNDS).map(w => w.id) }),
      }).then(r => r.json()).then(d => {
        setXpEarned(d.xpEarned ?? 10);
        window.dispatchEvent(new CustomEvent("xp-updated"));
      }).catch(() => {});
    } else {
      setRound(r => r + 1);
    }
  };

  const useHint = async () => {
    if (hintUsed || status !== "idle") return;
    const ok = await spendXp(5);
    if (!ok) { setHintErr(true); setTimeout(() => setHintErr(false), 2000); return; }
    window.dispatchEvent(new CustomEvent("xp-updated"));
    setHintUsed(true);

    // Reveal the next correct letter into typed
    const target = word.word.toUpperCase();
    const nextPos = revealed;
    const nextLetter = target[nextPos];

    // Find that letter in pool
    const poolIdx = pool.findIndex(l => l === nextLetter);
    if (poolIdx !== -1) {
      const newTyped = [...typed, nextLetter];
      const newPool  = pool.filter((_, i) => i !== poolIdx);
      setTyped(newTyped);
      setPool(newPool);
      setRevealed(r => r + 1);

      // Check if complete
      if (newTyped.length === word.word.length) {
        if (newTyped.join("").toLowerCase() === word.word.toLowerCase()) {
          setStatus("correct");
          setScore(s => s + 1);
          try {
            const seen: string[] = JSON.parse(localStorage.getItem("langcraft_seen_words") ?? "[]");
            if (!seen.includes(word.id)) {
              setTimeout(() => setSavePrompt(word), 700);
            } else {
              setTimeout(advance, 700);
            }
          } catch { setTimeout(advance, 700); }
        }
      }
    }
  };

  const handleSaveWord = (wordId: string, doSave: boolean) => {
    // Mark as seen so prompt only fires once ever
    try {
      const seen: string[] = JSON.parse(localStorage.getItem("langcraft_seen_words") ?? "[]");
      if (!seen.includes(wordId)) {
        localStorage.setItem("langcraft_seen_words", JSON.stringify([...seen, wordId]));
      }
    } catch {}
    setSavePrompt(null);
    if (doSave) {
      fetch("/api/dictionary/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordId }),
      }).catch(() => {});
    }
    // Advance — use scoreRef.current (post-increment value)
    const next = round + 1;
    if (next >= ROUNDS) {
      setFinished(true);
      fetch("/api/games/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameType: "WORD_SCRAMBLE", score: scoreRef.current, wordsUsed: words.slice(0, ROUNDS).map(w => w.id) }),
      }).then(r => r.json()).then(d => {
        setXpEarned(d.xpEarned ?? 10);
        window.dispatchEvent(new CustomEvent("xp-updated"));
      }).catch(() => {});
    } else {
      setRound(r => r + 1);
    }
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (finished) {
    const pct = Math.round((score / ROUNDS) * 100);
    return (
      <div style={{ maxWidth: 440, textAlign: "center" }}>
        <div className="card" style={{ padding: "40px 28px" }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>{pct === 100 ? "🏆" : pct >= 60 ? "🎉" : "💪"}</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", margin: "0 0 8px" }}>{t(locale, "game_done")}</h2>
          <p style={{ fontSize: 14, color: "var(--text-2)", margin: "0 0 20px" }}>
            <strong style={{ color: "var(--accent)" }}>{score}/{ROUNDS}</strong> words · {fmt(elapsed)} · {pct}%
          </p>
          {xpEarned > 0 && (
            <div style={{ padding: "10px 16px", borderRadius: 12, background: "var(--accent-dim)", marginBottom: 20, fontSize: 14, fontWeight: 700, color: "var(--accent)" }}>
              +{xpEarned} XP earned!
            </div>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => { setRound(0); setScore(0); setElapsed(0); setFinished(false); }} className="btn-primary" style={{ flex: 1 }}>
              {t(locale, "game_playAgain")}
            </button>
            <Link href="/games" className="btn-outline" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
              Back
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!word) return null;
  const target = word.word.toUpperCase();
  const pctDone = ((round) / ROUNDS) * 100;

  return (
    <div style={{ maxWidth: 540 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <p style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", margin: 0 }}>{t(locale, "games_wordScramble")}</p>
          <p style={{ fontSize: 12, color: "var(--text-3)", margin: 0 }}>{round + 1} of {ROUNDS}</p>
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-3)" }}>⏱ {fmt(elapsed)}</span>
      </div>

      {/* Progress */}
      <div style={{ height: 5, background: "var(--surface-3)", borderRadius: 999, overflow: "hidden", marginBottom: 24 }}>
        <div style={{ height: "100%", width: `${pctDone}%`, background: "linear-gradient(90deg,var(--accent),var(--accent-2))", borderRadius: 999, transition: "width 0.4s ease" }} />
      </div>

      {/* Word card */}
      <div className="card" style={{ padding: "28px 24px", textAlign: "center", marginBottom: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", margin: "0 0 4px" }}>
          Unscramble the {langConfig.label} word for:
        </p>
        <p style={{ fontSize: 28, fontWeight: 900, color: "var(--text)", margin: "0 0 10px" }}>{wordTranslation(word, locale)}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <SpeakButton text={word.word} lang={session?.user?.targetLanguage ?? "fr"} size={14} />
          <span style={{ fontSize: 12, color: "var(--text-3)" }}>hear pronunciation</span>
        </div>
      </div>

      {/* Answer slots */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {Array.from({ length: target.length }).map((_, i) => {
          const letter = typed[i];
          const isRevealed = i < revealed;
          return (
            <button key={i} onClick={() => letter && !isRevealed && removeLetter(i)}
              style={{
                width: 44, height: 52, borderRadius: 11, border: "2px solid",
                borderColor: status === "correct" ? "var(--green)" : status === "wrong" ? "var(--red)" : letter ? "var(--accent)" : "var(--border-md)",
                background: status === "correct" ? "rgba(34,197,94,0.12)" : status === "wrong" ? "rgba(239,68,68,0.1)" : letter ? "var(--accent-dim)" : "var(--surface-2)",
                fontSize: 18, fontWeight: 900,
                color: status === "correct" ? "var(--green)" : status === "wrong" ? "var(--red)" : "var(--accent)",
                cursor: letter && !isRevealed ? "pointer" : "default",
                transition: "all 0.15s",
              }}>
              {letter || ""}
            </button>
          );
        })}
      </div>

      {/* Pool letters */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {pool.map((letter, i) => (
          <button key={i} onClick={() => addLetter(i)}
            style={{
              width: 44, height: 52, borderRadius: 11,
              border: "1.5px solid var(--border-md)",
              background: "var(--surface-2)",
              fontSize: 18, fontWeight: 800, color: "var(--text)",
              cursor: "pointer", transition: "all 0.12s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--accent-dim)"; e.currentTarget.style.color = "var(--accent)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--surface-2)"; e.currentTarget.style.color = "var(--text)"; }}
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => { setPool(scramble(word.word)); setTyped([]); setStatus("idle"); }}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 11, border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text-2)", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
          <RotateCcw size={13} /> Reshuffle
        </button>
        <button onClick={useHint} disabled={hintUsed}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 11,
            border: "1px solid rgba(245,158,11,0.35)", background: hintErr ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)",
            color: hintErr ? "var(--red)" : "var(--gold)", cursor: hintUsed ? "not-allowed" : "pointer",
            fontSize: 13, fontWeight: 700, opacity: hintUsed ? 0.5 : 1, transition: "all 0.15s",
          }}>
          <Lightbulb size={13} />
          {hintErr ? "Not enough XP!" : hintUsed ? "Hint used" : "Hint (5 XP)"}
        </button>
        <button onClick={() => { setScore(s => s); advance(); }}
          style={{ marginLeft: "auto", padding: "9px 16px", borderRadius: 11, border: "1px solid var(--border)", background: "transparent", color: "var(--text-3)", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
          Skip →
        </button>
      </div>

      {/* Save-word prompt overlay */}
      {savePrompt && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 50,
          background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        }}>
          <div className="animate-fade-up" style={{
            background: "var(--surface-2)", borderRadius: 24,
            border: "1px solid rgba(16,185,129,0.35)",
            padding: "32px 28px", maxWidth: 320, width: "100%",
            textAlign: "center",
            boxShadow: "0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(16,185,129,0.12)",
          }}>
            <div style={{ fontSize: 44, marginBottom: 6 }}>{savePrompt.imageEmoji || "⭐"}</div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent-2)", marginBottom: 10 }}>
              First time!
            </p>
            <p style={{ fontSize: 26, fontWeight: 900, color: "var(--text)", marginBottom: 4, fontFamily: "var(--font-display)" }}>
              {savePrompt.word}
            </p>
            <p style={{ fontSize: 14, color: "var(--text-3)", marginBottom: 20 }}>
              {wordTranslation(savePrompt, locale)}
            </p>
            <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 20 }}>
              Save this word to your dictionary?
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => handleSaveWord(savePrompt.id, true)} className="btn-primary" style={{ flex: 1 }}>
                ✓ Save
              </button>
              <button
                onClick={() => handleSaveWord(savePrompt.id, false)}
                style={{
                  flex: 1, padding: "10px 16px", borderRadius: 12,
                  background: "var(--surface-3)", border: "1px solid var(--border)",
                  color: "var(--text-3)", cursor: "pointer", fontSize: 14, fontWeight: 600,
                }}
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
