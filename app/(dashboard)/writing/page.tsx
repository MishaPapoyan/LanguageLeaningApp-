"use client";

import { useState } from "react";

interface WritingPrompt {
  id: string;
  emoji: string;
  title: string;
  prompt: string;
  level: "beginner" | "intermediate";
  hints: string[];
  sampleWords: string[];
}

const PROMPTS: WritingPrompt[] = [
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
    prompt: "Describe a typical day. What do you do in the morning, afternoon, and evening?",
    level: "intermediate",
    hints: ["Le matin, je...", "L'après-midi, je...", "Le soir, je..."],
    sampleWords: ["manger", "travailler", "regarder", "dormir", "puis"],
  },
  {
    id: "w5",
    emoji: "🌍",
    title: "My Last Trip",
    prompt: "Write about a trip you took (real or imaginary). Use the past tense (passé composé)!",
    level: "intermediate",
    hints: ["Je suis allé(e) à...", "J'ai visité...", "C'était magnifique !"],
    sampleWords: ["voyager", "visiter", "manger", "voir", "aimer"],
  },
  {
    id: "w6",
    emoji: "🛒",
    title: "Shopping List",
    prompt: "You need to go shopping. Write a list of what you need to buy and how you'll ask for each item at the market.",
    level: "beginner",
    hints: ["J'ai besoin de...", "Je voudrais du / de la / des...", "C'est combien ?"],
    sampleWords: ["pain", "fromage", "fruits", "légumes", "combien"],
  },
];

export default function WritingPage() {
  const [selectedPrompt, setSelectedPrompt] = useState<WritingPrompt | null>(null);
  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showHints, setShowHints] = useState(false);

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

  // Prompt selection view
  if (!selectedPrompt) {
    return (
      <div className="max-w-3xl">
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
          placeholder="Write in French here..."
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
