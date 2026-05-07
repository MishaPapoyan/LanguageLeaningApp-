"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { t, getLocale } from "@/lib/i18n";

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

const PROMPTS_EN: WritingPrompt[] = [
  {
    id: "w1",
    emoji: "👋",
    title: "Introduce Yourself",
    prompt: "Write 3-5 sentences introducing yourself in English. Include your name, where you're from, and one thing you enjoy.",
    level: "beginner",
    hints: ["My name is...", "I'm from...", "I really enjoy..."],
    sampleWords: ["hello", "my", "name", "enjoy", "live"],
  },
  {
    id: "w2",
    emoji: "🍽️",
    title: "At the Restaurant",
    prompt: "You're at a British café. Write a short conversation ordering food and drinks politely.",
    level: "beginner",
    hints: ["Could I have..., please?", "I'd like...", "Could I get the bill, please?"],
    sampleWords: ["could", "would", "please", "lovely", "actually"],
  },
  {
    id: "w3",
    emoji: "🏠",
    title: "Describe Your Family",
    prompt: "Write about your family in English. Who are they? What are they like? Use adjectives and the verb 'to be'.",
    level: "beginner",
    hints: ["My mother is...", "My father works as...", "I have a brother / sister"],
    sampleWords: ["tall", "kind", "funny", "hardworking", "both"],
  },
  {
    id: "w4",
    emoji: "📅",
    title: "My Daily Routine",
    prompt: "Describe a typical day in English. Use the present simple tense and time expressions.",
    level: "intermediate",
    hints: ["In the morning, I...", "After that, I...", "In the evening, I usually..."],
    sampleWords: ["wake", "usually", "then", "afterwards", "before"],
  },
  {
    id: "w5",
    emoji: "🌍",
    title: "My Last Trip",
    prompt: "Write about a trip you took (real or imaginary) in English. Use the past simple tense.",
    level: "intermediate",
    hints: ["I went to...", "I visited...", "It was amazing!"],
    sampleWords: ["visited", "stayed", "tried", "enjoyed", "beautiful"],
  },
  {
    id: "w6",
    emoji: "🛒",
    title: "Shopping List",
    prompt: "Write a shopping list in English and describe how you'd ask for each item politely in a shop.",
    level: "beginner",
    hints: ["I need to get...", "Do you have any...?", "How much is...?"],
    sampleWords: ["need", "some", "few", "fresh", "please"],
  },
];

export default function WritingPage() {
  const { data: session } = useSession();
  const locale = getLocale((session?.user as any)?.nativeLanguage);
  const targetLanguage = session?.user?.targetLanguage ?? "fr";
  const PROMPTS = targetLanguage === "es" ? PROMPTS_ES : targetLanguage === "en" ? PROMPTS_EN : PROMPTS_FR;
  const langName = targetLanguage === "es" ? "Spanish" : targetLanguage === "en" ? "English" : "French";

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
              {tab === "check" ? t(locale, "writing_tabCheck") : tab === "history" ? t(locale, "writing_tabHistory") : t(locale, "writing_tabPrompts")}
            </button>
          ))}
        </div>

        {/* Quick Sentence Check */}
        {view === "check" && (
          <div style={{ maxWidth: 680 }}>
            <div style={{ padding: "16px 18px", borderRadius: 16, marginBottom: 16, background: "var(--accent-dim)", border: "1px solid rgba(99,102,241,0.2)" }}>
              <p style={{ fontSize: 13, color: "var(--text-2)", margin: 0 }}>
                {t(locale, "writing_checkDesc", { lang: langName })}
              </p>
            </div>

            <div style={{ background: "var(--surface-2)", borderRadius: 16, border: "1px solid var(--border)", padding: 20, marginBottom: 14 }}>
              <textarea
                value={checkText}
                onChange={(e) => setCheckText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleQuickCheck(); }}
                placeholder={targetLanguage === "es" ? "Escribe tu frase aquí…" : targetLanguage === "en" ? "Write your sentence here…" : "Écris ta phrase ici…"}
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
                  {t(locale, "writing_wordCountCtrl", { n: checkText.trim().split(/\s+/).filter(Boolean).length.toString() })}
                </span>
                <button
                  onClick={handleQuickCheck}
                  disabled={!checkText.trim() || checkLoading}
                  className="btn-primary"
                  style={{ fontSize: 13, padding: "8px 18px" }}
                >
                  {checkLoading ? t(locale, "writing_checking") : t(locale, "writing_checkGrammar")}
                </button>
              </div>
            </div>

            {checkFeedback && (
              <div style={{ borderRadius: 16, padding: 20, background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)" }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--green)", marginBottom: 10, marginTop: 0 }}>
                  {t(locale, "writing_aiFeedback")}
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
                style={{
                  width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 16,
                  background: "var(--surface-2)", borderRadius: 16, padding: "18px 20px",
                  border: "1px solid var(--border-md)", cursor: "pointer", transition: "all 0.15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(99,102,241,0.4)"; (e.currentTarget as HTMLElement).style.background = "var(--surface-3)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-md)"; (e.currentTarget as HTMLElement).style.background = "var(--surface-2)"; }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                  background: "var(--accent-dim)", border: "1px solid rgba(99,102,241,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
                }}>
                  {p.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-display)" }}>{p.title}</h2>
                    <span className={p.level === "beginner" ? "badge-green" : "badge-blue"}>{p.level}</span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-3)", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{p.prompt}</p>
                </div>
                <svg style={{ width: 18, height: 18, color: "var(--text-3)", flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        )}

        {view === "history" && (
          <div>
            {historyLoading && (
              <p style={{ fontSize: 13, color: "var(--text-3)", padding: "32px 0", textAlign: "center" }}>{t(locale, "writing_loadingHistory")}</p>
            )}
            {!historyLoading && history.length === 0 && (
              <div style={{ textAlign: "center", padding: "48px 0" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
                <p style={{ fontSize: 13, color: "var(--text-3)" }}>{t(locale, "writing_noHistory")}</p>
                <button onClick={() => setView("prompts")} style={{ marginTop: 12, fontSize: 13, fontWeight: 600, color: "var(--accent-2)", background: "none", border: "none", cursor: "pointer" }}>
                  {t(locale, "writing_startWriting")}
                </button>
              </div>
            )}
            <div className="space-y-3">
              {history.map((item) => (
                <div key={item.id} style={{ background: "var(--surface-2)", borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden" }}>
                  <button
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    style={{ width: "100%", textAlign: "left", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: "none", border: "none", cursor: "pointer" }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span className={item.level === "beginner" ? "badge-green" : "badge-blue"}>{item.level}</span>
                        <span style={{ fontSize: 12, color: "var(--text-3)" }}>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: "var(--text-2)", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{item.prompt}</p>
                    </div>
                    <svg style={{ width: 16, height: 16, color: "var(--text-3)", flexShrink: 0, transform: expandedId === item.id ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedId === item.id && (
                    <div style={{ borderTop: "1px solid var(--border)", padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
                      <div>
                        <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, marginTop: 14 }}>{t(locale, "writing_yourWriting")}</p>
                        <p style={{ fontSize: 13, color: "var(--text-2)", whiteSpace: "pre-wrap", background: "var(--surface-3)", borderRadius: 12, padding: "12px 14px" }}>{item.text}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{t(locale, "writing_aiFeedback")}</p>
                        <p style={{ fontSize: 13, color: "var(--text-2)", whiteSpace: "pre-wrap", background: "rgba(16,185,129,0.07)", borderRadius: 12, padding: "12px 14px", border: "1px solid rgba(16,185,129,0.18)" }}>{item.feedback}</p>
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
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => setSelectedPrompt(null)}
          style={{
            width: 32, height: 32, borderRadius: 10, flexShrink: 0,
            background: "var(--surface-2)", border: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--text-2)", cursor: "pointer",
          }}
        >
          <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <p style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>{t(locale, "writing_writingPractice")}</p>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>{selectedPrompt.emoji} {selectedPrompt.title}</h1>
        </div>
      </div>

      {/* Prompt card */}
      <div style={{ borderRadius: 14, padding: "14px 16px", background: "var(--accent-dim)", border: "1px solid rgba(99,102,241,0.25)", marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>{selectedPrompt.prompt}</p>
      </div>

      {/* Hints toggle */}
      <button
        onClick={() => setShowHints(!showHints)}
        style={{ fontSize: 13, color: "var(--accent-2)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", marginBottom: 12 }}
      >
        {showHints ? t(locale, "writing_hideHints") : t(locale, "writing_showHints")}
        <svg style={{ width: 12, height: 12, transform: showHints ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showHints && (
        <div style={{ borderRadius: 14, padding: "14px 16px", marginBottom: 16, background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)" }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(245,158,11,0.9)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{t(locale, "writing_helpfulPhrases")}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {selectedPrompt.hints.map((h, i) => (
              <span key={i} style={{ fontSize: 12, background: "var(--surface-2)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 8, padding: "4px 10px", color: "var(--text-2)" }}>
                {h}
              </span>
            ))}
          </div>
          <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(245,158,11,0.9)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, marginTop: 12 }}>{t(locale, "writing_usefulWords")}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {selectedPrompt.sampleWords.map((w, i) => (
              <span key={i} style={{ fontSize: 12, background: "var(--surface-2)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 8, padding: "4px 10px", color: "var(--text-2)" }}>
                {w}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Writing area */}
      <div style={{ background: "var(--surface-2)", borderRadius: 16, border: "1px solid var(--border-md)", padding: "18px 20px", marginBottom: 16 }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Write in ${langName} here...`}
          rows={8}
          style={{
            width: "100%", boxSizing: "border-box", resize: "none",
            background: "transparent", border: "none", outline: "none",
            fontSize: 15, color: "var(--text)", lineHeight: 1.7, fontFamily: "inherit",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid var(--border)", marginTop: 8 }}>
          <span style={{ fontSize: 12, color: "var(--text-3)" }}>{t(locale, "writing_wordCount", { n: text.split(/\s+/).filter(Boolean).length.toString() })}</span>
          <button
            onClick={handleSubmit}
            disabled={!text.trim() || loading}
            className="btn-primary"
            style={{ fontSize: 13, padding: "8px 20px" }}
          >
            {loading ? t(locale, "writing_analyzing") : t(locale, "writing_getAiFeedback")}
          </button>
        </div>
      </div>

      {/* Feedback */}
      {feedback && (() => {
        const gradeMatch = feedback.match(/^GRADE:\s*(\d+)\/10/);
        const grade = gradeMatch ? parseInt(gradeMatch[1]) : null;
        const bodyText = feedback.replace(/^GRADE:\s*\d+\/10\n?/, "").trimStart();
        const gradeColor = grade === null ? "var(--text-3)" : grade >= 8 ? "var(--green)" : grade >= 5 ? "var(--xp)" : "var(--red)";
        return (
          <div style={{ borderRadius: 16, padding: "20px", background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.22)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--green)", fontFamily: "var(--font-display)" }}>{t(locale, "writing_aiFeedback")}</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {grade !== null && (
                  <div style={{
                    display: "flex", alignItems: "baseline", gap: 2,
                    background: "var(--surface-2)", borderRadius: 10, padding: "4px 12px",
                    border: `2px solid ${gradeColor}`,
                  }}>
                    <span style={{ fontSize: 20, fontWeight: 800, color: gradeColor, fontFamily: "var(--font-mono)", letterSpacing: "-0.02em" }}>{grade}</span>
                    <span style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 600 }}>/10</span>
                  </div>
                )}
                {/* Rewrite button — clears feedback so the user can revise */}
                <button
                  onClick={() => { setFeedback(null); setText(""); setShowHints(false); }}
                  style={{
                    fontSize: 12, fontWeight: 700, padding: "6px 14px", borderRadius: 9,
                    background: "var(--surface-2)", border: "1px solid var(--border-md)",
                    color: "var(--text-2)", cursor: "pointer", transition: "border-color 0.12s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent-2)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-md)"; e.currentTarget.style.color = "var(--text-2)"; }}
                >
                  ↺ Rewrite
                </button>
              </div>
            </div>
            <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
              {bodyText}
            </p>
          </div>
        );
      })()}
    </div>
  );
}
