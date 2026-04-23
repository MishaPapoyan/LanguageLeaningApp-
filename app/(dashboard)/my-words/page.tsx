"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { getLanguageConfig } from "@/data/language-config";
import { speakTarget } from "@/lib/speech";
import { Volume2, Trash2, Play, Plus, ArrowLeft, Check, X, Pencil } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CustomWord {
  id: string;
  front: string;
  back: string;
  createdAt: string;
}

type Mode = "list" | "setup" | "quiz" | "result";

interface QuizQuestion {
  word: CustomWord;
  options: string[];
  correctIndex: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const OPTION_LABELS = ["A", "B", "C", "D"];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function buildQuestion(word: CustomWord, pool: CustomWord[]): QuizQuestion {
  const dist = shuffle(pool.filter(w => w.id !== word.id)).slice(0, 3).map(w => w.front);
  const fill = ["None of these", "I don't know", "Skip", "—"];
  while (dist.length < 3) dist.push(fill[dist.length]);
  const options = shuffle([word.front, ...dist]);
  return { word, options, correctIndex: options.indexOf(word.front) };
}
function buildQuiz(words: CustomWord[]): QuizQuestion[] {
  return shuffle(words).map(w => buildQuestion(w, words));
}

// ─── API helpers ──────────────────────────────────────────────────────────────

async function apiGet(): Promise<CustomWord[]> {
  const r = await fetch("/api/my-words", { cache: "no-store" });
  if (!r.ok) return [];
  return r.json();
}
async function apiAdd(front: string, back: string): Promise<CustomWord | null> {
  const r = await fetch("/api/my-words", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ front, back }),
  });
  if (!r.ok) return null;
  return r.json();
}
async function apiDelete(id: string): Promise<boolean> {
  const r = await fetch(`/api/my-words/${id}`, { method: "DELETE" });
  return r.ok;
}
async function apiPatch(id: string, front: string, back: string): Promise<CustomWord | null> {
  const r = await fetch(`/api/my-words/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ front, back }),
  });
  if (!r.ok) return null;
  return r.json();
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MyWordsPage() {
  const { data: session } = useSession();
  const langConfig = getLanguageConfig(session?.user?.targetLanguage ?? "fr");
  const [words, setWords]           = useState<CustomWord[]>([]);
  const [loading, setLoading]       = useState(true);
  const [front, setFront]           = useState("");
  const [back, setBack]             = useState("");
  const [mode, setMode]             = useState<Mode>("list");
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [editFront, setEditFront]   = useState("");
  const [editBack, setEditBack]     = useState("");
  const [saving, setSaving]         = useState(false);
  const [quizCount, setQuizCount]   = useState<number | "custom">(10);
  const [customCount, setCustomCount] = useState("");
  const [questions, setQuestions]   = useState<QuizQuestion[]>([]);
  const [qIndex, setQIndex]         = useState(0);
  const [selected, setSelected]     = useState<number | null>(null);
  const [score, setScore]           = useState(0);
  const [eliminated, setEliminated] = useState<number[]>([]);
  const [hintUsed, setHintUsed]     = useState(false);
  const [hintErr, setHintErr]       = useState(false);
  const [xpEarned, setXpEarned]     = useState(0);

  useEffect(() => {
    apiGet().then(w => { setWords(w); setLoading(false); });
  }, []);

  const addWord = useCallback(async () => {
    const f = front.trim(), b = back.trim();
    if (!f || !b || saving) return;
    setSaving(true);
    const created = await apiAdd(f, b);
    if (created) setWords(prev => [created, ...prev]);
    setFront(""); setBack("");
    setSaving(false);
  }, [front, back, saving]);

  const deleteWord = useCallback(async (id: string) => {
    setWords(prev => prev.filter(w => w.id !== id));
    await apiDelete(id);
  }, []);

  const startEdit = (word: CustomWord) => {
    setEditingId(word.id); setEditFront(word.front); setEditBack(word.back);
  };
  const saveEdit = async () => {
    const f = editFront.trim(), b = editBack.trim();
    if (!f || !b) return;
    const updated = await apiPatch(editingId!, f, b);
    if (updated) setWords(prev => prev.map(w => w.id === editingId ? updated : w));
    setEditingId(null);
  };

  const startQuiz = () => {
    if (words.length < 2) return;
    const count = quizCount === "custom"
      ? Math.min(Math.max(parseInt(customCount) || 10, 2), words.length)
      : Math.min(quizCount, words.length);
    setQuestions(buildQuiz(words).slice(0, count));
    setQIndex(0); setSelected(null); setScore(0); setXpEarned(0); setMode("quiz");
  };

  // Reset hint state on each new question
  useEffect(() => { setHintUsed(false); setEliminated([]); setHintErr(false); }, [qIndex]);

  const useHint = async () => {
    if (hintUsed || selected !== null || !currentQ) return;
    const r = await fetch("/api/user/spend-xp", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 5 }),
    });
    if (!r.ok) { setHintErr(true); setTimeout(() => setHintErr(false), 2000); return; }
    window.dispatchEvent(new CustomEvent("xp-updated"));
    setHintUsed(true);
    const wrongs = currentQ.options.map((_, i) => i).filter(i => i !== currentQ.correctIndex);
    const toElim = wrongs.sort(() => Math.random() - 0.5).slice(0, 2);
    setEliminated(toElim);
  };

  const handleAnswer = (i: number) => {
    if (selected !== null || eliminated.includes(i)) return;
    setSelected(i);
    if (questions[qIndex].correctIndex === i) setScore(s => s + 1);
    setTimeout(() => {
      if (qIndex + 1 >= questions.length) {
        const finalScore = questions[qIndex].correctIndex === i ? score + 1 : score;
        fetch("/api/my-words/quiz-complete", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ correct: finalScore, total: questions.length }),
        }).then(r => r.json()).then(d => {
          if (d.xp) { setXpEarned(d.xp); window.dispatchEvent(new CustomEvent("xp-updated")); }
        });
        setMode("result");
      } else { setQIndex(idx => idx + 1); setSelected(null); }
    }, 900);
  };

  const currentQ = questions[qIndex];
  const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  // ══════════════════════════════════════════════════════════════════════════
  //  RESULT SCREEN
  // ══════════════════════════════════════════════════════════════════════════
  if (mode === "result") {
    const grade = pct === 100 ? { label: "Perfect!", color: "var(--green)", emoji: "🏆" }
                : pct >= 70   ? { label: "Great job!", color: "var(--accent)", emoji: "🎉" }
                : pct >= 40   ? { label: "Keep going!", color: "var(--gold)", emoji: "💪" }
                :               { label: "Keep practicing", color: "var(--red)", emoji: "📚" };

    return (
      <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 16px" }}>
        <div style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>

          {/* Giant score */}
          <div style={{
            width: 160, height: 160, borderRadius: "50%", margin: "0 auto 24px",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            background: "var(--surface-2)", border: `4px solid ${grade.color}`,
            boxShadow: `0 0 40px ${grade.color}33`,
            position: "relative",
          }}>
            <svg style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }} viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="72" fill="none" stroke="var(--surface-3)" strokeWidth="6" />
              <circle cx="80" cy="80" r="72" fill="none" stroke={grade.color} strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 72}`}
                strokeDashoffset={`${2 * Math.PI * 72 * (1 - pct / 100)}`}
                style={{ transition: "stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)" }}
              />
            </svg>
            <span style={{ fontSize: 36, fontWeight: 900, color: grade.color, lineHeight: 1, position: "relative" }}>{pct}%</span>
            <span style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4, position: "relative" }}>{score}/{questions.length} correct</span>
          </div>

          <div style={{ fontSize: 40, marginBottom: 8 }}>{grade.emoji}</div>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: grade.color, margin: "0 0 6px" }}>{grade.label}</h2>
          <p style={{ fontSize: 14, color: "var(--text-3)", margin: "0 0 16px" }}>
            You answered {score} out of {questions.length} questions correctly
          </p>
          {xpEarned > 0 && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 24,
              background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: 99, padding: "8px 18px",
              fontSize: 15, fontWeight: 800, color: "var(--gold)",
            }}>
              ⚡ +{xpEarned} XP earned
            </div>
          )}

          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => setMode("setup")} className="btn-primary" style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
              gap: 8, padding: "13px 0", fontSize: 14, fontWeight: 700,
            }}>
              <Play size={15} /> Try again
            </button>
            <button onClick={() => setMode("list")} className="btn-outline" style={{
              flex: 1, padding: "13px 0", fontSize: 14,
            }}>
              Back to words
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  SETUP SCREEN
  // ══════════════════════════════════════════════════════════════════════════
  if (mode === "setup") {
    const PRESETS = [10, 20, 40, 50, 100];
    const resolvedCount = quizCount === "custom"
      ? Math.min(Math.max(parseInt(customCount) || 0, 2), words.length)
      : Math.min(quizCount, words.length);
    const canStart = resolvedCount >= 2;

    return (
      <div style={{ maxWidth: 480, margin: "0 auto", paddingTop: 24 }}>
        <button onClick={() => setMode("list")} style={{
          display: "flex", alignItems: "center", gap: 5, marginBottom: 28,
          background: "var(--surface-2)", border: "1px solid var(--border)",
          borderRadius: 10, padding: "6px 12px", fontSize: 12, fontWeight: 600,
          color: "var(--text-2)", cursor: "pointer",
        }}>
          <ArrowLeft size={13} /> Back
        </button>

        <h2 style={{ fontSize: 24, fontWeight: 900, color: "var(--text)", margin: "0 0 6px" }}>
          Quiz setup
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-3)", margin: "0 0 28px" }}>
          You have <strong style={{ color: "var(--accent)" }}>{words.length}</strong> words. How many do you want to quiz on?
        </p>

        {/* Preset pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
          {PRESETS.map(n => {
            const disabled = n > words.length;
            const active = quizCount === n;
            return (
              <button key={n} onClick={() => !disabled && setQuizCount(n)} disabled={disabled}
                style={{
                  padding: "10px 22px", borderRadius: 12, fontWeight: 700, fontSize: 15,
                  border: `2px solid ${active ? "var(--accent)" : "var(--border-md)"}`,
                  background: active ? "var(--accent-dim)" : "var(--surface-2)",
                  color: active ? "var(--accent)" : disabled ? "var(--text-3)" : "var(--text)",
                  cursor: disabled ? "not-allowed" : "pointer",
                  opacity: disabled ? 0.4 : 1,
                  transition: "all 0.15s",
                }}>
                {n}
              </button>
            );
          })}
          {/* Custom */}
          <button onClick={() => setQuizCount("custom")}
            style={{
              padding: "10px 22px", borderRadius: 12, fontWeight: 700, fontSize: 15,
              border: `2px solid ${quizCount === "custom" ? "var(--accent)" : "var(--border-md)"}`,
              background: quizCount === "custom" ? "var(--accent-dim)" : "var(--surface-2)",
              color: quizCount === "custom" ? "var(--accent)" : "var(--text)",
              cursor: "pointer", transition: "all 0.15s",
            }}>
            Custom
          </button>
        </div>

        {/* Custom input */}
        {quizCount === "custom" && (
          <div style={{ marginBottom: 24 }}>
            <input
              type="number" min={2} max={words.length}
              value={customCount}
              onChange={e => setCustomCount(e.target.value)}
              placeholder={`Enter number (2–${words.length})`}
              className="input"
              style={{ width: "100%", fontSize: 15 }}
              autoFocus
            />
            {customCount && !canStart && (
              <p style={{ fontSize: 12, color: "var(--red)", margin: "8px 0 0" }}>
                Min 2 words required
              </p>
            )}
          </div>
        )}

        {/* Summary */}
        {canStart && (
          <div style={{
            padding: "14px 18px", borderRadius: 14, marginBottom: 24,
            background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)",
            fontSize: 13, color: "var(--text-2)",
          }}>
            You'll be quizzed on <strong style={{ color: "var(--accent)" }}>{resolvedCount}</strong> words
          </div>
        )}

        <button onClick={startQuiz} disabled={!canStart} className="btn-primary"
          style={{ width: "100%", padding: "14px", fontSize: 15, fontWeight: 800 }}>
          <Play size={16} style={{ display: "inline", marginRight: 8 }} />
          Start Quiz
        </button>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  QUIZ SCREEN
  // ══════════════════════════════════════════════════════════════════════════
  if (mode === "quiz" && currentQ) {
    const progress = ((qIndex + 1) / questions.length) * 100;

    return (
      <div style={{ maxWidth: 580, margin: "0 auto", paddingTop: 12 }}>

        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <button onClick={() => setMode("list")} style={{
            display: "flex", alignItems: "center", gap: 5,
            background: "var(--surface-2)", border: "1px solid var(--border)",
            borderRadius: 10, padding: "6px 12px", fontSize: 12, fontWeight: 600,
            color: "var(--text-2)", cursor: "pointer",
          }}>
            <ArrowLeft size={13} /> Exit
          </button>

          {/* Progress bar */}
          <div style={{ flex: 1, height: 8, background: "var(--surface-3)", borderRadius: 999, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${progress}%`,
              background: "linear-gradient(90deg, var(--accent), var(--accent-2))",
              borderRadius: 999, transition: "width 0.4s ease",
            }} />
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-2)", whiteSpace: "nowrap" }}>
            {qIndex + 1}<span style={{ color: "var(--text-3)", fontWeight: 400 }}>/{questions.length}</span>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 4,
            background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)",
            borderRadius: 99, padding: "4px 10px", fontSize: 12, fontWeight: 700, color: "var(--green)",
          }}>
            <Check size={11} /> {score}
          </div>
        </div>

        {/* Question card */}
        <div style={{
          borderRadius: 22, padding: "44px 28px 36px",
          background: "linear-gradient(145deg, var(--surface-2), var(--surface))",
          border: "1px solid var(--border-md)",
          textAlign: "center", marginBottom: 16,
          boxShadow: "0 8px 40px rgba(0,0,0,0.25)",
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20,
            background: "var(--surface-3)", borderRadius: 99, padding: "5px 14px",
            fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em",
            color: "var(--text-3)",
          }}>
            {langConfig.flag} Translate this word
          </div>

          <div style={{ fontSize: "clamp(24px, 5vw, 36px)", fontWeight: 900, color: "var(--text)", marginBottom: 24, lineHeight: 1.2 }}>
            {currentQ.word.back}
          </div>

          <button onClick={() => speakTarget(currentQ.word.back, langConfig.code)} style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "var(--accent-dim)", border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: 99, padding: "9px 20px",
            color: "var(--accent)", fontSize: 13, fontWeight: 700, cursor: "pointer",
            transition: "all 0.15s",
          }}>
            <Volume2 size={14} /> Listen
          </button>
        </div>

        {/* A B C D Options */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {currentQ.options.map((option, i) => {
            const label = OPTION_LABELS[i];
            const isCorrect = i === currentQ.correctIndex;
            const isSelected = i === selected;
            const revealed = selected !== null;

            let bg = "var(--surface-2)";
            let border = "var(--border-md)";
            let labelBg = "var(--surface-3)";
            let labelColor = "var(--text-3)";
            let textColor = "var(--text)";
            let opacity = 1;
            let shadow = "none";

            if (eliminated.includes(i)) {
              opacity = 0.1;
            } else if (revealed) {
              if (isCorrect) {
                bg = "rgba(34,197,94,0.1)"; border = "rgba(34,197,94,0.45)";
                labelBg = "rgba(34,197,94,0.2)"; labelColor = "var(--green)"; textColor = "var(--green)";
                shadow = "0 0 0 2px rgba(34,197,94,0.15)";
              } else if (isSelected) {
                bg = "rgba(239,68,68,0.1)"; border = "rgba(239,68,68,0.4)";
                labelBg = "rgba(239,68,68,0.15)"; labelColor = "var(--red)"; textColor = "var(--red)";
              } else {
                opacity = 0.3;
              }
            }

            return (
              <button key={i} onClick={() => handleAnswer(i)} disabled={revealed || eliminated.includes(i)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 16px", borderRadius: 14,
                  background: bg, border: `1.5px solid ${border}`,
                  cursor: revealed ? "default" : "pointer",
                  transition: "all 0.15s", opacity,
                  boxShadow: shadow, textAlign: "left",
                }}
              >
                <span style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: labelBg, color: labelColor,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 800,
                }}>
                  {label}
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: textColor, lineHeight: 1.3 }}>
                  {option}
                </span>
              </button>
            );
          })}
        </div>

        {/* Hint button */}
        <div style={{ marginTop: 14 }}>
          <button onClick={useHint} disabled={hintUsed || selected !== null}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "9px 16px", borderRadius: 11,
              border: `1px solid ${hintErr ? "rgba(239,68,68,0.4)" : "rgba(245,158,11,0.35)"}`,
              background: hintErr ? "rgba(239,68,68,0.08)" : "rgba(245,158,11,0.08)",
              color: hintErr ? "var(--red)" : "var(--gold)",
              cursor: hintUsed || selected !== null ? "not-allowed" : "pointer",
              fontSize: 13, fontWeight: 700,
              opacity: hintUsed || selected !== null ? 0.5 : 1,
            }}>
            💡 {hintErr ? "Not enough XP!" : hintUsed ? "Hint used (2 eliminated)" : "Hint — eliminate 2 wrong answers (5 XP)"}
          </button>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  LIST / ADD SCREEN
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ maxWidth: 780 }}>

      {/* ── Page header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <h1 style={{ fontSize: 30, fontWeight: 900, color: "var(--text)", margin: 0, letterSpacing: "-0.5px" }}>
              My Words
            </h1>
            {words.length > 0 && (
              <span style={{
                fontSize: 13, fontWeight: 800, color: "var(--accent)",
                background: "var(--accent-dim)", border: "1px solid rgba(99,102,241,0.25)",
                borderRadius: 99, padding: "3px 12px",
              }}>
                {words.length}
              </span>
            )}
          </div>
          <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>
            Build your personal vocabulary deck and quiz yourself
          </p>
        </div>

        {words.length >= 2 && (
          <button onClick={() => setMode("setup")} className="btn-primary" style={{
            display: "flex", alignItems: "center", gap: 9,
            padding: "11px 22px", fontSize: 14, fontWeight: 800,
            boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
          }}>
            <Play size={15} /> Start Quiz
          </button>
        )}
      </div>

      {/* ── Add word panel ── */}
      <div style={{
        borderRadius: 20, padding: "24px 24px 20px",
        background: "var(--surface-2)",
        border: "1px solid var(--border-md)",
        marginBottom: 28,
        position: "relative", overflow: "hidden",
      }}>
        {/* accent stripe */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 3,
          background: "linear-gradient(90deg, var(--accent), var(--accent-2))",
          borderRadius: "20px 20px 0 0",
        }} />

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9,
            background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Plus size={15} color="#fff" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 800, color: "var(--text)" }}>Add a new word pair</span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
          {/* Native language input */}
          <div style={{ flex: 1 }}>
            <label style={{
              display: "block", fontSize: 10, fontWeight: 800, letterSpacing: "0.1em",
              textTransform: "uppercase", color: "var(--text-3)", marginBottom: 7,
            }}>Your language</label>
            <input
              type="text" value={front}
              onChange={e => setFront(e.target.value)}
              onKeyDown={e => e.key === "Enter" && back.trim() && addWord()}
              placeholder="e.g. hello"
              className="input"
              style={{ width: "100%", fontSize: 15 }}
            />
          </div>

          {/* Arrow */}
          <div style={{
            flexShrink: 0, paddingBottom: 10,
            width: 36, height: 38,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, color: "var(--text-3)",
          }}>→</div>

          {/* Target language input */}
          <div style={{ flex: 1 }}>
            <label style={{
              display: "block", fontSize: 10, fontWeight: 800, letterSpacing: "0.1em",
              textTransform: "uppercase", color: "var(--accent)", marginBottom: 7,
            }}>{langConfig.flag} {langConfig.label}</label>
            <input
              type="text" value={back}
              onChange={e => setBack(e.target.value)}
              onKeyDown={e => e.key === "Enter" && front.trim() && addWord()}
              placeholder={langConfig.code === "es" ? "e.g. hola" : "e.g. bonjour"}
              className="input"
              style={{ width: "100%", fontSize: 15 }}
            />
          </div>

          {/* Add button */}
          <button onClick={addWord} disabled={!front.trim() || !back.trim() || saving}
            style={{
              flexShrink: 0, height: 42, width: 42, borderRadius: 12,
              background: front.trim() && back.trim() && !saving
                ? "linear-gradient(135deg, var(--accent), var(--accent-2))"
                : "var(--surface-3)",
              border: "none",
              color: front.trim() && back.trim() && !saving ? "#fff" : "var(--text-3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: front.trim() && back.trim() && !saving ? "pointer" : "not-allowed",
              transition: "all 0.2s",
              boxShadow: front.trim() && back.trim() && !saving ? "0 4px 12px rgba(99,102,241,0.35)" : "none",
            }}
            title="Add word pair"
          >
            <Plus size={18} />
          </button>
        </div>

        {words.length === 1 && (
          <p style={{ fontSize: 12, color: "var(--gold)", margin: "12px 0 0", display: "flex", alignItems: "center", gap: 5 }}>
            ⚡ Add 1 more word to unlock the quiz
          </p>
        )}
      </div>

      {/* ── Word tile grid ── */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-3)", fontSize: 14 }}>
          Loading your words…
        </div>
      ) : words.length === 0 ? (
        <div style={{
          borderRadius: 20, padding: "64px 24px",
          border: "2px dashed var(--border-md)",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>🗂️</div>
          <p style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", margin: "0 0 8px" }}>
            Your deck is empty
          </p>
          <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>
            Add your first word pair above to start building your deck
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <p className="section-label" style={{ margin: 0 }}>Word deck</p>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{ fontSize: 11, color: "var(--text-3)" }}>{words.length} pairs</span>
          </div>

          {/* Grid of flashcard tiles */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 12,
            alignItems: "start",
          }}>
            {words.map((word, idx) => {
              const hues = ["var(--accent)", "var(--teal, #14b8a6)", "var(--gold)", "#f472b6", "var(--green)"];
              const accentColor = hues[idx % hues.length];

              return (
                <div key={word.id} style={{
                  borderRadius: 16,
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  overflow: "hidden",
                  display: "flex", flexDirection: "column",
                  transition: "transform 0.15s, box-shadow 0.15s",
                  position: "relative",
                }}>
                  {/* Colored top strip */}
                  <div style={{ height: 4, background: accentColor }} />

                  {editingId === word.id ? (
                    /* ── Edit mode ── */
                    <div style={{ padding: "14px 14px 10px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                      <input
                        autoFocus value={editFront} onChange={e => setEditFront(e.target.value)}
                        placeholder="Your language"
                        className="input" style={{ width: "100%", fontSize: 13 }}
                      />
                      <input
                        value={editBack} onChange={e => setEditBack(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && saveEdit()}
                        placeholder={langConfig.label}
                        className="input" style={{ width: "100%", fontSize: 13 }}
                      />
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={saveEdit} style={{
                          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                          padding: "7px 0", borderRadius: 9, border: "none",
                          background: "var(--accent)", color: "#fff",
                          fontSize: 12, fontWeight: 700, cursor: "pointer",
                        }}>
                          <Check size={12} /> Save
                        </button>
                        <button onClick={() => setEditingId(null)} style={{
                          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                          padding: "7px 0", borderRadius: 9,
                          border: "1px solid var(--border)", background: "none",
                          color: "var(--text-3)", fontSize: 12, fontWeight: 600, cursor: "pointer",
                        }}>
                          <X size={12} /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Native word */}
                      <div style={{ padding: "14px 16px 10px" }}>
                        <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", margin: "0 0 4px" }}>
                          Your language
                        </p>
                        <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text-2)", margin: 0, wordBreak: "break-word" }}>
                          {word.front}
                        </p>
                      </div>
                      <div style={{ height: 1, background: "var(--border)", margin: "0 16px" }} />
                      {/* Target language word */}
                      <div style={{ padding: "10px 16px 14px", flex: 1 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: accentColor, margin: "0 0 4px" }}>
                          {langConfig.flag} {langConfig.label}
                        </p>
                        <p style={{ fontSize: 18, fontWeight: 800, color: accentColor, margin: 0, wordBreak: "break-word" }}>
                          {word.back}
                        </p>
                      </div>
                      {/* Action row */}
                      <div style={{ display: "flex", alignItems: "center", borderTop: "1px solid var(--border)", padding: "0 6px" }}>
                        <button onClick={() => speakTarget(word.back, langConfig.code)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "8px 0", background: "none", border: "none", color: "var(--text-3)", cursor: "pointer", fontSize: 11, fontWeight: 600 }}
                          onMouseEnter={e => e.currentTarget.style.color = accentColor}
                          onMouseLeave={e => e.currentTarget.style.color = "var(--text-3)"}
                        ><Volume2 size={12} /> Listen</button>
                        <div style={{ width: 1, height: 18, background: "var(--border)" }} />
                        <button onClick={() => startEdit(word)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "8px 0", background: "none", border: "none", color: "var(--text-3)", cursor: "pointer", fontSize: 11, fontWeight: 600 }}
                          onMouseEnter={e => e.currentTarget.style.color = "var(--accent)"}
                          onMouseLeave={e => e.currentTarget.style.color = "var(--text-3)"}
                        ><Pencil size={12} /> Edit</button>
                        <div style={{ width: 1, height: 18, background: "var(--border)" }} />
                        <button onClick={() => deleteWord(word.id)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "8px 0", background: "none", border: "none", color: "var(--text-3)", cursor: "pointer", fontSize: 11, fontWeight: 600 }}
                          onMouseEnter={e => e.currentTarget.style.color = "var(--red)"}
                          onMouseLeave={e => e.currentTarget.style.color = "var(--text-3)"}
                        ><Trash2 size={12} /> Delete</button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom quiz CTA */}
          {words.length >= 2 && (
            <button onClick={() => setMode("setup")} style={{
              width: "100%", marginTop: 20, padding: "18px",
              borderRadius: 16, cursor: "pointer",
              background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(99,102,241,0.06))",
              border: "2px dashed rgba(99,102,241,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              color: "var(--accent)", fontSize: 15, fontWeight: 800,
              transition: "all 0.18s",
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.15)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(99,102,241,0.06))";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(99,102,241,0.35)";
              }}
            >
              <Play size={17} /> Quiz me on {words.length} words
            </button>
          )}
        </>
      )}
    </div>
  );
}
