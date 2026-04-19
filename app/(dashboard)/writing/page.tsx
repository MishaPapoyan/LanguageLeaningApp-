"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface WritingHistoryItem {
  id: string;
  prompt: string;
  text: string;
  feedback: string;
  level: string;
  createdAt: string;
}

interface WritingPrompt {
  id: string;
  emoji: string;
  title: string;
  prompt: string;
  level: "beginner" | "intermediate";
  hints: string[];
  sampleWords: string[];
}

const PROMPTS_FR: WritingPrompt[] = [
  {
    id: "w1",
    emoji: "👋",
    title: "Introduce Yourself",
    prompt: "Write 3-5 sentences introducing yourself in French. Include your name, where you live, and one thing you like.",
    level: "beginner",
    hints: ["Je m'appelle...", "J'habite à...", "J'aime..."],
    sampleWords: ["bonjour", "je", "suis", "aimer", "habiter"],
  },
  {
    id: "w2",
    emoji: "🍽️",
    title: "At the Restaurant",
    prompt: "You're at a French restaurant. Write a short conversation ordering food and drinks.",
    level: "beginner",
    hints: ["Bonjour, je voudrais...", "L'addition, s'il vous plaît", "C'est délicieux !"],
    sampleWords: ["voudrais", "s'il vous plaît", "merci", "eau", "café"],
  },
  {
    id: "w3",
    emoji: "🏠",
    title: "Describe Your Family",
    prompt: "Write about your family. Who are they? What do they look like? Use adjectives!",
    level: "beginner",
    hints: ["Ma mère est...", "Mon père est...", "J'ai un frère / une soeur"],
    sampleWords: ["famille", "grand", "petit", "gentil", "avoir"],
  },
  {
    id: "w4",
    emoji: "📅",
    title: "My Daily Routine",
    prompt: "Describe a typical day in French. What do you do in the morning, afternoon, and evening?",
    level: "intermediate",
    hints: ["Le matin, je...", "L'après-midi, je...", "Le soir, je..."],
    sampleWords: ["manger", "travailler", "regarder", "dormir", "puis"],
  },
  {
    id: "w5",
    emoji: "🌍",
    title: "My Last Trip",
    prompt: "Write in French about a trip you took (real or imaginary). Use the past tense (passé composé)!",
    level: "intermediate",
    hints: ["Je suis allé(e) à...", "J'ai visité...", "C'était magnifique !"],
    sampleWords: ["voyager", "visiter", "manger", "voir", "aimer"],
  },
  {
    id: "w6",
    emoji: "🛒",
    title: "Shopping List",
    prompt: "In French, write a list of what you need to buy and how you'll ask for each item at the market.",
    level: "beginner",
    hints: ["J'ai besoin de...", "Je voudrais du / de la / des...", "C'est combien ?"],
    sampleWords: ["pain", "fromage", "fruits", "légumes", "combien"],
  },
];

const PROMPTS_ES: WritingPrompt[] = [
  {
    id: "w1",
    emoji: "👋",
    title: "Introduce Yourself",
    prompt: "Write 3-5 sentences introducing yourself in Spanish. Include your name, where you live, and one thing you like.",
    level: "beginner",
    hints: ["Me llamo...", "Vivo en...", "Me gusta..."],
    sampleWords: ["hola", "yo", "soy", "gustar", "vivir"],
  },
  {
    id: "w2",
    emoji: "🍽️",
    title: "At the Restaurant",
    prompt: "You're at a Spanish tapas bar. Write a short conversation ordering food and drinks.",
    level: "beginner",
    hints: ["Hola, quiero...", "La cuenta, por favor", "¡Está delicioso!"],
    sampleWords: ["quiero", "por favor", "gracias", "agua", "café"],
  },
  {
    id: "w3",
    emoji: "🏠",
    title: "Describe Your Family",
    prompt: "Write about your family in Spanish. Who are they? What do they look like? Use adjectives!",
    level: "beginner",
    hints: ["Mi madre es...", "Mi padre es...", "Tengo un hermano / una hermana"],
    sampleWords: ["familia", "grande", "pequeño", "simpático", "tener"],
  },
  {
    id: "w4",
    emoji: "📅",
    title: "My Daily Routine",
    prompt: "Describe a typical day in Spanish. What do you do in the morning, afternoon, and evening?",
    level: "intermediate",
    hints: ["Por la mañana, yo...", "Por la tarde, yo...", "Por la noche, yo..."],
    sampleWords: ["comer", "trabajar", "ver", "dormir", "después"],
  },
  {
    id: "w5",
    emoji: "🌍",
    title: "My Last Trip",
    prompt: "Write in Spanish about a trip you took (real or imaginary). Use the preterite tense!",
    level: "intermediate",
    hints: ["Fui a...", "Visité...", "¡Fue increíble!"],
    sampleWords: ["viajar", "visitar", "comer", "ver", "gustar"],
  },
  {
    id: "w6",
    emoji: "🛒",
    title: "Shopping List",
    prompt: "In Spanish, write a list of what you need to buy and how you'll ask for each item at the market.",
    level: "beginner",
    hints: ["Necesito...", "Quisiera...", "¿Cuánto cuesta?"],
    sampleWords: ["pan", "queso", "frutas", "verduras", "cuánto"],
  },
];

export default function WritingPage() {
  const { data: session } = useSession();
  const targetLanguage = session?.user?.targetLanguage ?? "fr";
  const PROMPTS = targetLanguage === "es" ? PROMPTS_ES : PROMPTS_FR;

  const [selectedPrompt, setSelectedPrompt] = useState<WritingPrompt | null>(null);
  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [view, setView] = useState<"check" | "prompts" | "history">("check");
  const [history, setHistory] = useState<WritingHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // Quick sentence check state
  const [checkText, setCheckText] = useState("");
  const [checkFeedback, setCheckFeedback] = useState<string | null>(null);
  const [checkLoading, setCheckLoading] = useState(false);

  const handleQuickCheck = async () => {
    if (!checkText.trim()) return;
    setCheckLoading(true);
    setCheckFeedback(null);
    const langName = targetLanguage === "es" ? "Spanish" : "French";
    try {
      const res = await fetch("/api/writing/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: checkText.trim(),
          prompt: `The user wrote a sentence in ${langName}. Check grammar, spelling, and naturalness. Be concise and direct — just point out what's wrong and give the corrected version. If it's perfect, say so.`,
          level: "beginner",
        }),
      });
      if (!res.ok || !res.body) throw new Error("Failed");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let result = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
        setCheckFeedback(result);
      }
    } catch {
      setCheckFeedback("Could not check right now. Please try again.");
    } finally {
      setCheckLoading(false);
    }
  };

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch("/api/writing/history");
      if (res.ok) setHistory(await res.json());
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (view === "history") loadHistory();
  }, [view]);

  const handleSubmit = async () => {
    if (!selectedPrompt || !text.trim()) return;
    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/writing/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), prompt: selectedPrompt.prompt, level: selectedPrompt.level }),
      });

      if (!res.ok || !res.body) throw new Error("Failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
        setFeedback(result);
      }
    } catch {
      setFeedback("Could not get feedback right now. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Prompt selection / history view
  if (!selectedPrompt) {
    return (
      <div className="max-w-3xl">
        {/* Tab bar */}
        <div className="flex gap-1 mb-5 p-1 rounded-xl w-fit" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
          {(["check", "prompts", "history"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setView(tab)}
              style={{
                padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                background: view === tab ? "var(--accent)" : "transparent",
                color: view === tab ? "#fff" : "var(--text-3)",
                border: "none", cursor: "pointer", transition: "all 0.15s",
              }}
            >
              {tab === "check" ? "⚡ Check Sentence" : tab === "history" ? "📜 History" : "✍️ Prompts"}
            </button>
          ))}
        </div>

        {/* Quick Sentence Check */}
        {view === "check" && (
          <div style={{ maxWidth: 680 }}>
            <div style={{ padding: "16px 18px", borderRadius: 16, marginBottom: 16, background: "var(--accent-dim)", border: "1px solid rgba(99,102,241,0.2)" }}>
              <p style={{ fontSize: 13, color: "var(--text-2)", margin: 0 }}>
                Type any sentence in <strong style={{ color: "var(--accent)" }}>{targetLanguage === "es" ? "Spanish" : "French"}</strong> and AI will check your grammar, spelling, and naturalness instantly.
              </p>
            </div>

            <div style={{ background: "var(--surface-2)", borderRadius: 16, border: "1px solid var(--border)", padding: 20, marginBottom: 14 }}>
              <textarea
                value={checkText}
                onChange={(e) => setCheckText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleQuickCheck(); }}
                placeholder={targetLanguage === "es" ? "Escribe tu frase aquí…" : "Écris ta phrase ici…"}
                rows={4}
                style={{
                  width: "100%", boxSizing: "border-box", resize: "none",
                  background: "transparent", border: "none", outline: "none",
                  fontSize: 16, color: "var(--text)", lineHeight: 1.6,
                  fontFamily: "inherit",
                }}
              />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                <span style={{ fontSize: 12, color: "var(--text-3)" }}>
                  {checkText.trim().split(/\s+/).filter(Boolean).length} words · Ctrl+Enter to check
                </span>
                <button
                  onClick={handleQuickCheck}
                  disabled={!checkText.trim() || checkLoading}
                  className="btn-primary"
                  style={{ fontSize: 13, padding: "8px 18px" }}
                >
                  {checkLoading ? "Checking…" : "Check Grammar ⚡"}
                </button>
              </div>
            </div>

            {checkFeedback && (
              <div style={{ borderRadius: 16, padding: 20, background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)" }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--green)", marginBottom: 10, marginTop: 0 }}>
                  AI Feedback
                </p>
                <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0 }}>
                  {checkFeedback}
                </p>
              </div>
            )}
          </div>
        )}

        {view === "prompts" && (
          <div className="space-y-3">
            {PROMPTS.map((p) => (
              <button
                key={p.id}
                onClick={() => { setSelectedPrompt(p); setText(""); setFeedback(null); }}
                className="w-full text-left flex items-center gap-4 bg-white rounded-2xl p-5 border border-zinc-100 hover:border-zinc-200 hover:shadow-sm transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform">
                  {p.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h2 className="font-serif text-lg text-zinc-900">{p.title}</h2>
                    <span className={p.level === "beginner" ? "badge-green" : "badge-blue"}>{p.level}</span>
                  </div>
                  <p className="text-sm text-zinc-500">{p.prompt}</p>
                </div>
                <svg className="w-5 h-5 text-zinc-300 group-hover:text-violet-400 group-hover:translate-x-1 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        )}

        {view === "history" && (
          <div>
            {historyLoading && (
              <p className="text-sm text-zinc-400 py-8 text-center">Loading history…</p>
            )}
            {!historyLoading && history.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">📝</div>
                <p className="text-zinc-500 text-sm">No writing sessions yet.</p>
                <button onClick={() => setView("prompts")} className="mt-3 text-violet-600 text-sm font-medium hover:underline">
                  Start writing →
                </button>
              </div>
            )}
            <div className="space-y-3">
              {history.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
                  <button
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    className="w-full text-left p-4 flex items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={item.level === "beginner" ? "badge-green" : "badge-blue"}>{item.level}</span>
                        <span className="text-xs text-zinc-400">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-600 truncate">{item.prompt}</p>
                    </div>
                    <svg className={`w-4 h-4 text-zinc-400 flex-shrink-0 transition-transform ${expandedId === item.id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedId === item.id && (
                    <div className="border-t border-zinc-50 px-4 pb-4 space-y-3">
                      <div>
                        <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 mt-3">Your Writing</p>
                        <p className="text-sm text-zinc-700 whitespace-pre-wrap bg-zinc-50 rounded-xl p-3">{item.text}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">AI Feedback</p>
                        <p className="text-sm text-zinc-700 whitespace-pre-wrap bg-emerald-50 rounded-xl p-3">{item.feedback}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Writing view
  return (
    <div className="max-w-3xl">
      {/* Back + title */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setSelectedPrompt(null)}
          className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <p className="text-[11px] text-zinc-400 uppercase tracking-wider font-medium">Writing Practice</p>
          <h1 className="font-serif text-xl text-zinc-900">{selectedPrompt.emoji} {selectedPrompt.title}</h1>
        </div>
      </div>

      {/* Prompt card */}
      <div className="rounded-2xl p-4 bg-violet-50 ring-1 ring-violet-100 mb-4">
        <p className="text-sm text-violet-800">{selectedPrompt.prompt}</p>
      </div>

      {/* Hints toggle */}
      <button
        onClick={() => setShowHints(!showHints)}
        className="text-sm text-violet-600 hover:text-violet-700 mb-3 flex items-center gap-1 font-medium"
      >
        {showHints ? "Hide hints" : "Show hints"}
        <svg className={`w-3 h-3 transition-transform ${showHints ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showHints && (
        <div className="rounded-2xl p-4 mb-4 bg-amber-50 ring-1 ring-amber-100">
          <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider mb-2">Helpful phrases</p>
          <div className="flex flex-wrap gap-2">
            {selectedPrompt.hints.map((h, i) => (
              <span key={i} className="text-sm bg-white ring-1 ring-amber-200 rounded-lg px-2.5 py-1 text-amber-800">
                {h}
              </span>
            ))}
          </div>
          <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider mb-2 mt-3">Useful words</p>
          <div className="flex flex-wrap gap-2">
            {selectedPrompt.sampleWords.map((w, i) => (
              <span key={i} className="text-sm bg-white ring-1 ring-amber-200 rounded-lg px-2.5 py-1 text-zinc-700">
                {w}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Writing area */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-5 mb-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Write in ${targetLanguage === "es" ? "Spanish" : "French"} here...`}
          rows={8}
          className="w-full resize-none bg-transparent border-none outline-none text-zinc-800 placeholder:text-zinc-300 text-sm leading-relaxed"
        />
        <div className="flex items-center justify-between pt-3 border-t border-zinc-50 mt-2">
          <span className="text-xs text-zinc-400">{text.split(/\s+/).filter(Boolean).length} words</span>
          <button
            onClick={handleSubmit}
            disabled={!text.trim() || loading}
            className="btn-primary text-sm px-5"
          >
            {loading ? "Analyzing..." : "Get AI Feedback"}
          </button>
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className="rounded-2xl p-5 bg-emerald-50 ring-1 ring-emerald-100">
          <h3 className="font-serif text-emerald-800 mb-3">AI Feedback</h3>
          <div className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">
            {feedback}
          </div>
        </div>
      )}
    </div>
  );
}
