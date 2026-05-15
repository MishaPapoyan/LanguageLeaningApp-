"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Sparkles, History, BrainCircuit, Type, CheckCircle2, AlertCircle, ChevronRight,
} from "lucide-react";
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
  { id: "w1", emoji: "👋", title: "Introduce Yourself", prompt: "Write 3-5 sentences introducing yourself in French. Include your name, where you live, and one thing you like.", level: "beginner", hints: ["Je m'appelle...", "J'habite à...", "J'aime..."], sampleWords: ["bonjour", "je", "suis", "aimer", "habiter"] },
  { id: "w2", emoji: "🍽️", title: "At the Restaurant", prompt: "You're at a French restaurant. Write a short conversation ordering food and drinks.", level: "beginner", hints: ["Bonjour, je voudrais...", "L'addition, s'il vous plaît", "C'est délicieux !"], sampleWords: ["voudrais", "s'il vous plaît", "merci", "eau", "café"] },
  { id: "w3", emoji: "🏠", title: "Describe Your Family", prompt: "Write about your family. Who are they? What do they look like? Use adjectives!", level: "beginner", hints: ["Ma mère est...", "Mon père est...", "J'ai un frère / une soeur"], sampleWords: ["famille", "grand", "petit", "gentil", "avoir"] },
  { id: "w4", emoji: "📅", title: "My Daily Routine", prompt: "Describe a typical day in French. What do you do in the morning, afternoon, and evening?", level: "intermediate", hints: ["Le matin, je...", "L'après-midi, je...", "Le soir, je..."], sampleWords: ["manger", "travailler", "regarder", "dormir", "puis"] },
  { id: "w5", emoji: "🌍", title: "My Last Trip", prompt: "Write in French about a trip you took (real or imaginary). Use the past tense (passé composé)!", level: "intermediate", hints: ["Je suis allé(e) à...", "J'ai visité...", "C'était magnifique !"], sampleWords: ["voyager", "visiter", "manger", "voir", "aimer"] },
  { id: "w6", emoji: "🛒", title: "Shopping List", prompt: "In French, write a list of what you need to buy and how you'll ask for each item at the market.", level: "beginner", hints: ["J'ai besoin de...", "Je voudrais du / de la / des...", "C'est combien ?"], sampleWords: ["pain", "fromage", "fruits", "légumes", "combien"] },
];

const PROMPTS_ES: WritingPrompt[] = [
  { id: "w1", emoji: "👋", title: "Introduce Yourself", prompt: "Write 3-5 sentences introducing yourself in Spanish. Include your name, where you live, and one thing you like.", level: "beginner", hints: ["Me llamo...", "Vivo en...", "Me gusta..."], sampleWords: ["hola", "yo", "soy", "gustar", "vivir"] },
  { id: "w2", emoji: "🍽️", title: "At the Restaurant", prompt: "You're at a Spanish tapas bar. Write a short conversation ordering food and drinks.", level: "beginner", hints: ["Hola, quiero...", "La cuenta, por favor", "¡Está delicioso!"], sampleWords: ["quiero", "por favor", "gracias", "agua", "café"] },
  { id: "w3", emoji: "🏠", title: "Describe Your Family", prompt: "Write about your family in Spanish. Who are they? What do they look like? Use adjectives!", level: "beginner", hints: ["Mi madre es...", "Mi padre es...", "Tengo un hermano / una hermana"], sampleWords: ["familia", "grande", "pequeño", "simpático", "tener"] },
  { id: "w4", emoji: "📅", title: "My Daily Routine", prompt: "Describe a typical day in Spanish. What do you do in the morning, afternoon, and evening?", level: "intermediate", hints: ["Por la mañana, yo...", "Por la tarde, yo...", "Por la noche, yo..."], sampleWords: ["comer", "trabajar", "ver", "dormir", "después"] },
  { id: "w5", emoji: "🌍", title: "My Last Trip", prompt: "Write in Spanish about a trip you took (real or imaginary). Use the preterite tense!", level: "intermediate", hints: ["Fui a...", "Visité...", "¡Fue increíble!"], sampleWords: ["viajar", "visitar", "comer", "ver", "gustar"] },
  { id: "w6", emoji: "🛒", title: "Shopping List", prompt: "In Spanish, write a list of what you need to buy and how you'll ask for each item at the market.", level: "beginner", hints: ["Necesito...", "Quisiera...", "¿Cuánto cuesta?"], sampleWords: ["pan", "queso", "frutas", "verduras", "cuánto"] },
];

const PROMPTS_EN: WritingPrompt[] = [
  { id: "w1", emoji: "👋", title: "Introduce Yourself", prompt: "Write 3-5 sentences introducing yourself in English. Include your name, where you're from, and one thing you enjoy.", level: "beginner", hints: ["My name is...", "I'm from...", "I really enjoy..."], sampleWords: ["hello", "my", "name", "enjoy", "live"] },
  { id: "w2", emoji: "🍽️", title: "At the Restaurant", prompt: "You're at a British café. Write a short conversation ordering food and drinks politely.", level: "beginner", hints: ["Could I have..., please?", "I'd like...", "Could I get the bill, please?"], sampleWords: ["could", "would", "please", "lovely", "actually"] },
  { id: "w3", emoji: "🏠", title: "Describe Your Family", prompt: "Write about your family in English. Who are they? What are they like? Use adjectives and the verb 'to be'.", level: "beginner", hints: ["My mother is...", "My father works as...", "I have a brother / sister"], sampleWords: ["tall", "kind", "funny", "hardworking", "both"] },
  { id: "w4", emoji: "📅", title: "My Daily Routine", prompt: "Describe a typical day in English. Use the present simple tense and time expressions.", level: "intermediate", hints: ["In the morning, I...", "After that, I...", "In the evening, I usually..."], sampleWords: ["wake", "usually", "then", "afterwards", "before"] },
  { id: "w5", emoji: "🌍", title: "My Last Trip", prompt: "Write about a trip you took (real or imaginary) in English. Use the past simple tense.", level: "intermediate", hints: ["I went to...", "I visited...", "It was amazing!"], sampleWords: ["visited", "stayed", "tried", "enjoyed", "beautiful"] },
  { id: "w6", emoji: "🛒", title: "Shopping List", prompt: "Write a shopping list in English and describe how you'd ask for each item politely in a shop.", level: "beginner", hints: ["I need to get...", "Do you have any...?", "How much is...?"], sampleWords: ["need", "some", "few", "fresh", "please"] },
];

export default function WritingPage() {
  const { data: session } = useSession();
  const locale = getLocale((session?.user as any)?.nativeLanguage);
  const targetLanguage = session?.user?.targetLanguage ?? "fr";
  const PROMPTS = targetLanguage === "es" ? PROMPTS_ES : targetLanguage === "en" ? PROMPTS_EN : PROMPTS_FR;
  const langName = targetLanguage === "es" ? "Spanish" : targetLanguage === "en" ? "English" : "French";

  // selectedPrompt = null  → Free Write mode (no constraint, user writes anything)
  // selectedPrompt = prompt → Prompted mode (writing exercise around a topic)
  const [selectedPrompt, setSelectedPrompt] = useState<WritingPrompt | null>(null);
  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"write" | "prompts" | "history">("write");
  const [history, setHistory] = useState<WritingHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Free-write prompt sent to the AI. Reads as a real writing task so the API
  // validation passes and the model knows there's no topic constraint.
  const freeWritePrompt =
    `Free writing — the student is practising ${langName} writing without a fixed topic. ` +
    `Critique grammar, vocabulary, and naturalness regardless of subject.`;

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
    if (!text.trim() || text.length < 20) return;
    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/writing/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          prompt: selectedPrompt?.prompt ?? freeWritePrompt,
          level: selectedPrompt?.level ?? "intermediate",
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
        setFeedback(result);
      }
    } catch {
      setFeedback("Could not get feedback right now. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Parse feedback into structured shape
  const parsedFeedback = (() => {
    if (!feedback) return null;
    const gradeMatch = feedback.match(/^GRADE:\s*(\d+)\/10/);
    const score = gradeMatch ? parseInt(gradeMatch[1]) : null;
    const grade =
      score === null ? "—" : score >= 9 ? "A" : score >= 7 ? "B" : score >= 5 ? "C" : score >= 3 ? "D" : "F";
    const body = feedback.replace(/^GRADE:\s*\d+\/10\n?/, "").trimStart();
    return { grade, body, score };
  })();

  return (
    <div className="space-y-12">
      {/* Header */}
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-5xl mb-2">{t(locale, "nav_writing") || "Writing Lab"}</h1>
          <p className="text-white/40 text-lg">
            Hone your written {langName} with real-time AI critique.
          </p>
        </div>
        <div className="flex gap-2">
          {(["write", "prompts", "history"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setView(tab)}
              className={`btn-secondary flex items-center gap-2 ${
                view === tab ? "border-emerald-500/40 text-emerald-400" : ""
              }`}
            >
              {tab === "history" && <History size={16} />}
              {tab === "write"
                ? "Write"
                : tab === "prompts"
                ? t(locale, "writing_tabPrompts") || "Prompts"
                : t(locale, "writing_tabHistory") || "History"}
            </button>
          ))}
        </div>
      </header>

      {view === "prompts" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PROMPTS.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedPrompt(p);
                setText("");
                setFeedback(null);
                setView("write");
              }}
              className="card-premium p-6 text-left flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl shrink-0">
                {p.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold serif italic mb-1">{p.title}</h3>
                <p className="text-xs text-white/40 truncate">{p.prompt}</p>
                <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-400 mt-2 inline-block">
                  {p.level}
                </span>
              </div>
              <ChevronRight
                size={18}
                className="text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all"
              />
            </button>
          ))}
        </div>
      )}

      {view === "history" && (
        <div className="space-y-4">
          {historyLoading && (
            <p className="text-center text-white/40 py-12">Loading…</p>
          )}
          {!historyLoading && history.length === 0 && (
            <div className="card-premium p-12 text-center text-white/30 border-dashed">
              <Type size={32} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-bold">No history yet</p>
              <p className="text-sm">Submit your first piece to start a journal.</p>
            </div>
          )}
          {history.map((item) => (
            <div key={item.id} className="card-premium overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                className="w-full p-6 flex items-center justify-between text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                      {item.level}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 mono">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-white/60 truncate italic serif">"{item.prompt}"</p>
                </div>
                <ChevronRight
                  size={18}
                  className={`text-white/20 transition-transform ${
                    expandedId === item.id ? "rotate-90" : ""
                  }`}
                />
              </button>
              {expandedId === item.id && (
                <div className="px-6 pb-6 border-t border-white/5 pt-4 space-y-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">
                      Your Writing
                    </p>
                    <p className="text-sm font-light leading-relaxed whitespace-pre-wrap">{item.text}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-2">
                      AI Feedback
                    </p>
                    <p className="text-sm text-white/60 italic leading-relaxed whitespace-pre-wrap">
                      {item.feedback}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {view === "write" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Mode card + Editor */}
          <div className="lg:col-span-2 space-y-6">
            {selectedPrompt ? (
              <section className="card-premium p-6 bg-emerald-500/5 border-emerald-500/20">
                <div className="flex items-center justify-between mb-2 gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                    <span className="text-base">{selectedPrompt.emoji}</span>
                    {selectedPrompt.title}
                  </h3>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                      {selectedPrompt.level}
                    </span>
                    <button
                      onClick={() => { setSelectedPrompt(null); setText(""); setFeedback(null); }}
                      className="text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors"
                    >
                      Switch to free write
                    </button>
                  </div>
                </div>
                <p className="text-xl serif italic font-medium leading-relaxed">
                  "{selectedPrompt.prompt}"
                </p>
              </section>
            ) : (
              <section className="card-premium p-6 bg-white/5 border-white/10">
                <div className="flex items-center justify-between mb-2 gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/50 flex items-center gap-2">
                    <Sparkles size={12} /> Free Write
                  </h3>
                  <button
                    onClick={() => setView("prompts")}
                    className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    Browse prompts
                  </button>
                </div>
                <p className="text-xl serif italic font-medium leading-relaxed text-white/70">
                  Write about anything in {langName} — a story, your day, a memory, a thought.
                  No topic. No limits. Just write and let the AI critique your grammar and word choice.
                </p>
              </section>
            )}

            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={selectedPrompt
                  ? `Start writing in ${langName}…`
                  : `Start writing freely in ${langName} — anything you want…`}
                className="w-full h-96 bg-white/5 border border-white/10 rounded-3xl p-8 text-xl focus:outline-none focus:border-white/20 transition-all resize-none font-light leading-relaxed"
              />
              <div className="absolute bottom-6 right-6 flex items-center gap-4">
                <span className="text-xs font-bold text-white/20 mono">
                  {text.length} characters
                </span>
                <button
                  onClick={handleSubmit}
                  disabled={loading || text.length < 20}
                  className={`btn-primary py-3 px-6 rounded-2xl flex items-center gap-2 ${
                    loading || text.length < 20 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? (
                    <>
                      <BrainCircuit size={18} className="animate-spin" /> Analyzing…
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} /> Submit for Critique
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Hints — only for prompted mode */}
            {selectedPrompt && selectedPrompt.hints.length > 0 && (
              <div className="card-premium p-6 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">
                  Helpful Phrases
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPrompt.hints.map((h, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-white/5 border border-white/10 text-white/70 text-xs rounded-full font-medium"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Feedback */}
          <div className="space-y-6">
            {!parsedFeedback ? (
              <div className="card-premium p-8 h-full flex flex-col items-center justify-center text-center space-y-4 text-white/20 border-dashed">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Type size={32} />
                </div>
                <h4 className="text-lg font-bold">Awaiting Submission</h4>
                <p className="text-sm">
                  Submit your response to see a detailed grade and breakdown.
                </p>
              </div>
            ) : (
              <>
                {/* Grade */}
                <div className="card-premium p-8 text-center bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">
                    Proficiency Grade
                  </p>
                  <span className="text-7xl md:text-8xl font-black italic serif text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    {parsedFeedback.grade}
                  </span>
                  {parsedFeedback.score !== null && (
                    <p className="text-xs text-white/30 font-bold mono mt-2">
                      {parsedFeedback.score}/10
                    </p>
                  )}
                </div>

                {/* Strengths */}
                <section className="card-premium p-6 space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500" /> Key Strengths
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {["Clear vocabulary", "Good flow", "Topic relevance"].map((s) => (
                      <span
                        key={s}
                        className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </section>

                {/* Critical Edits / Overall feedback */}
                <section className="card-premium p-6 space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                    <AlertCircle size={14} className="text-amber-500" /> Critical Edits
                  </h4>
                  <div className="text-sm text-white/60 italic leading-relaxed whitespace-pre-wrap">
                    {parsedFeedback.body}
                  </div>
                </section>

                {/* Overall */}
                <div className="card-premium p-6 text-sm text-white/60 italic leading-relaxed">
                  <Sparkles size={14} className="inline mr-2 text-emerald-400" />
                  Keep practicing — review the corrections above and try writing the prompt again
                  to reinforce what you've learned.
                </div>

                <button
                  onClick={() => {
                    setFeedback(null);
                    setText("");
                  }}
                  className="btn-secondary w-full py-3"
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
