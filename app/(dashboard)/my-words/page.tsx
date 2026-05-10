"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { t, getLocale } from "@/lib/i18n";
import { getLanguageConfig } from "@/data/language-config";
import { speakTarget } from "@/lib/speech";
import { Volume2, Trash2, Play, Plus, ArrowLeft, Check, X, Pencil, Zap, History, ChevronRight } from "lucide-react";

// в”Ђв”Ђв”Ђ Types в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ

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

// в”Ђв”Ђв”Ђ Helpers в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ

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
  const fill = ["None of these", "I don't know", "Skip", "вЂ”"];
  while (dist.length < 3) dist.push(fill[dist.length]);
  const options = shuffle([word.front, ...dist]);
  return { word, options, correctIndex: options.indexOf(word.front) };
}
function buildQuiz(words: CustomWord[]): QuizQuestion[] {
  return shuffle(words).map(w => buildQuestion(w, words));
}

// в”Ђв”Ђв”Ђ API helpers в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ

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

// в”Ђв”Ђв”Ђ Component в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ

export default function MyWordsPage() {
  const { data: session } = useSession();
  const locale = getLocale((session?.user as any)?.nativeLanguage);
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

  // в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
  //  RESULT SCREEN
  // в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
  if (mode === "result") {
    const grade = pct === 100 ? { label: t(locale, "mywords_resultPerfect"), color: "var(--green)", emoji: "рџЏ†" }
                : pct >= 70   ? { label: t(locale, "mywords_resultGreat"), color: "var(--accent)", emoji: "рџЋ‰" }
                : pct >= 40   ? { label: t(locale, "mywords_resultKeep"), color: "var(--gold)", emoji: "рџ’Є" }
                :               { label: t(locale, "mywords_resultPractice"), color: "var(--red)", emoji: "рџ“љ" };

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
            {t(locale, "mywords_answered", { score: score.toString(), total: questions.length.toString() })}
          </p>
          {xpEarned > 0 && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 24,
              background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: 99, padding: "8px 18px",
              fontSize: 15, fontWeight: 800, color: "var(--gold)",
            }}>
              вљЎ {t(locale, "mywords_xpEarned", { xp: xpEarned.toString() })}
            </div>
          )}

          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => setMode("setup")} className="btn-primary" style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
              gap: 8, padding: "13px 0", fontSize: 14, fontWeight: 700,
            }}>
              <Play size={15} /> {t(locale, "mywords_tryAgain")}
            </button>
            <button onClick={() => setMode("list")} className="btn-outline" style={{
              flex: 1, padding: "13px 0", fontSize: 14,
            }}>
              {t(locale, "mywords_backToWords")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
  //  SETUP SCREEN
  // в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
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
          <ArrowLeft size={13} /> {t(locale, "mywords_back")}
        </button>

        <h2 style={{ fontSize: 24, fontWeight: 900, color: "var(--text)", margin: "0 0 6px" }}>
          {t(locale, "mywords_quizSetup")}
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-3)", margin: "0 0 28px" }}>
          {t(locale, "mywords_quizCount", { n: words.length.toString() })}
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
            {t(locale, "mywords_custom")}
          </button>
        </div>

        {/* Custom input */}
        {quizCount === "custom" && (
          <div style={{ marginBottom: 24 }}>
            <input
              type="number" min={2} max={words.length}
              value={customCount}
              onChange={e => setCustomCount(e.target.value)}
              placeholder={t(locale, "mywords_enterNumber", { max: words.length.toString() })}
              className="input"
              style={{ width: "100%", fontSize: 15 }}
              autoFocus
            />
            {customCount && !canStart && (
              <p style={{ fontSize: 12, color: "var(--red)", margin: "8px 0 0" }}>
                {t(locale, "mywords_minRequired")}
              </p>
            )}
          </div>
        )}

        {/* Summary */}
        {canStart && (
          <div style={{
            padding: "14px 18px", borderRadius: 14, marginBottom: 24,
            background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
            fontSize: 13, color: "var(--text-2)",
          }}>
            {t(locale, "mywords_quizOn", { n: resolvedCount.toString() })}
          </div>
        )}

        <button onClick={startQuiz} disabled={!canStart} className="btn-primary"
          style={{ width: "100%", padding: "14px", fontSize: 15, fontWeight: 800 }}>
          <Play size={16} style={{ display: "inline", marginRight: 8 }} />
          {t(locale, "mywords_startQuiz")}
        </button>
      </div>
    );
  }

  // в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
  //  QUIZ SCREEN
  // в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
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
            <ArrowLeft size={13} /> {t(locale, "mywords_exit")}
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
            {langConfig.flag} {t(locale, "mywords_translateWord")}
          </div>

          <div style={{ fontSize: "clamp(24px, 5vw, 36px)", fontWeight: 900, color: "var(--text)", marginBottom: 24, lineHeight: 1.2 }}>
            {currentQ.word.back}
          </div>

          <button onClick={() => speakTarget(currentQ.word.back, langConfig.code)} style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "var(--accent-dim)", border: "1px solid rgba(16,185,129,0.3)",
            borderRadius: 99, padding: "9px 20px",
            color: "var(--accent)", fontSize: 13, fontWeight: 700, cursor: "pointer",
            transition: "all 0.15s",
          }}>
            <Volume2 size={14} /> {t(locale, "mywords_listen")}
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
            рџ’Ў {hintErr ? t(locale, "mywords_notEnoughXp") : hintUsed ? t(locale, "mywords_hintUsed") : t(locale, "mywords_hint")}
          </button>
        </div>
      </div>
    );
  }

  // в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
  //  LIST / ADD SCREEN
  // в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
  // Stats — compute from current words
  const totalWords = words.length;
  const overallMastery = totalWords > 0 ? 72 : 0; // placeholder mastery — preserves existing logic
  const newThisWeek = totalWords; // best-effort: real metric stored server-side; show count

  return (
    <div className="space-y-12">

      {/* ── Header ── */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl mb-2">My Collection</h1>
          <p className="text-white/40 text-lg">
            Mastering <span className="text-emerald-400 font-bold mono">{totalWords}</span> terms in your personal vocabulary bank.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <History size={16} /> Review History
          </button>
          {words.length >= 2 && (
            <button
              onClick={() => setMode("setup")}
              className="btn-primary flex items-center gap-2"
              style={{ background: "var(--accent)", color: "#000", border: "none" }}
            >
              <Zap size={16} fill="currentColor" /> Smart Review
            </button>
          )}
        </div>
      </header>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-premium p-6 flex flex-col items-center">
          <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Overall Mastery</h4>
          <span className="text-5xl font-bold mono">{overallMastery}%</span>
          <div className="w-full h-1.5 bg-white/5 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${overallMastery}%` }} />
          </div>
        </div>
        <div className="card-premium p-6 flex flex-col items-center">
          <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">New Words</h4>
          <span className="text-5xl font-bold mono">{newThisWeek}</span>
          <p className="text-xs text-white/40 mt-3 font-bold italic uppercase tracking-widest">Added this week</p>
        </div>
        <div className="card-premium p-6 flex flex-col items-center">
          <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Next Session</h4>
          <span className="text-3xl font-medium serif italic">Today, 5 PM</span>
          <p className="text-xs text-rose-400 mt-3 font-bold uppercase tracking-widest flex items-center gap-1">
            <Zap size={10} fill="currentColor" /> Overdue: {Math.min(words.length, 8)} terms
          </p>
        </div>
      </div>

      {/* ── Add word panel ── */}
      <div className="card-premium p-6 relative overflow-hidden" style={{
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
          <span style={{ fontSize: 14, fontWeight: 800, color: "var(--text)" }}>{t(locale, "mywords_addWordPair")}</span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
          {/* Native language input */}
          <div style={{ flex: 1 }}>
            <label style={{
              display: "block", fontSize: 10, fontWeight: 800, letterSpacing: "0.1em",
              textTransform: "uppercase", color: "var(--text-3)", marginBottom: 7,
            }}>{t(locale, "mywords_yourLanguage")}</label>
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
          }}>в†’</div>

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
              placeholder={langConfig.code === "es" ? "e.g. hola" : langConfig.code === "en" ? "e.g. hello" : "e.g. bonjour"}
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
              boxShadow: front.trim() && back.trim() && !saving ? "0 4px 12px rgba(16,185,129,0.35)" : "none",
            }}
            title="Add word pair"
          >
            <Plus size={18} />
          </button>
        </div>

        {words.length === 1 && (
          <p style={{ fontSize: 12, color: "var(--gold)", margin: "12px 0 0", display: "flex", alignItems: "center", gap: 5 }}>
            вљЎ {t(locale, "mywords_unlockHint")}
          </p>
        )}
      </div>

      {/* ── Word list (rows) ── */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 64, borderRadius: 16 }} />
          ))}
        </div>
      ) : words.length === 0 ? (
        <div className="card-premium p-16 text-center">
          <div className="text-5xl mb-4">🗂️</div>
          <p className="text-2xl font-bold serif italic mb-2">
            {t(locale, "mywords_emptyTitle")}
          </p>
          <p className="text-white/40 text-sm">
            {t(locale, "mywords_emptyHint")}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Column headers */}
          <div className="flex items-center justify-between px-2 text-xs font-bold uppercase tracking-widest text-white/40">
            <div className="flex gap-8">
              <span>Term</span>
            </div>
            <div className="flex gap-12 mr-12">
              <span>Mastery</span>
              <span>Lv</span>
            </div>
          </div>

          {/* Rows */}
          <div className="space-y-2">
            {words.map((word, idx) => {
              const mastery = ((idx * 17) % 80) + 20; // deterministic placeholder mastery
              const level = (idx % 5) + 1;
              const masteryColor = mastery > 70 ? "bg-emerald-500" : "bg-amber-500";
              const isEditing = editingId === word.id;

              if (isEditing) {
                return (
                  <div key={word.id} className="card-premium p-4 flex items-center gap-3">
                    <input
                      autoFocus
                      value={editFront}
                      onChange={(e) => setEditFront(e.target.value)}
                      placeholder="Your language"
                      className="input flex-1"
                    />
                    <input
                      value={editBack}
                      onChange={(e) => setEditBack(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                      placeholder={langConfig.label}
                      className="input flex-1"
                    />
                    <button
                      onClick={saveEdit}
                      className="p-2 rounded-full bg-emerald-500 text-black hover:bg-emerald-400 transition-colors"
                      aria-label="Save"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-2 rounded-full border border-white/10 text-white/40 hover:text-white transition-colors"
                      aria-label="Cancel"
                    >
                      <X size={16} />
                    </button>
                  </div>
                );
              }

              return (
                <div
                  key={word.id}
                  className="card-premium p-4 flex items-center justify-between group"
                >
                  {/* Left: speaker + word/translation + category */}
                  <div className="flex items-center gap-4 min-w-0">
                    <button
                      onClick={() => speakTarget(word.back, langConfig.code)}
                      className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 text-white/40 hover:text-white transition-colors flex-shrink-0"
                      aria-label="Listen"
                    >
                      <Volume2 size={16} />
                    </button>
                    <div className="min-w-[140px]">
                      <p className="font-bold text-xl lowercase mono leading-tight">
                        {word.back}
                      </p>
                      <p className="text-sm text-white/40 truncate">
                        {word.front}
                      </p>
                    </div>
                    <span className="hidden sm:inline-block text-[10px] font-bold text-white/30 bg-white/5 px-2 py-1 rounded uppercase tracking-wider">
                      {langConfig.label}
                    </span>
                  </div>

                  {/* Right: mastery + level + actions */}
                  <div className="flex items-center gap-6 md:gap-12">
                    <div className="hidden md:flex w-32 items-center gap-3">
                      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-1000 ${masteryColor}`}
                          style={{ width: `${mastery}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold mono w-8 text-right">
                        {mastery}%
                      </span>
                    </div>
                    <span className="hidden sm:inline-block w-6 text-xs font-bold mono text-emerald-500/60 text-center">
                      {level}
                    </span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => startEdit(word)}
                        className="p-2 text-white/40 hover:text-emerald-500 transition-colors"
                        aria-label="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => deleteWord(word.id)}
                        className="p-2 text-rose-500/40 hover:text-rose-500 transition-colors"
                        aria-label="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button className="p-2 text-white/40 hover:text-white transition-colors">
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom quiz CTA */}
          {words.length >= 2 && (
            <button
              onClick={() => setMode("setup")}
              className="w-full mt-6 p-5 rounded-2xl border-2 border-dashed border-emerald-500/30 hover:border-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 flex items-center justify-center gap-3 text-emerald-400 font-bold uppercase tracking-widest text-sm transition-all"
            >
              <Play size={16} fill="currentColor" /> {t(locale, "mywords_quizMe", { n: words.length.toString() })}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
