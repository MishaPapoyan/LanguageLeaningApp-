"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface Word {
  id: string;
  word: string;
  translation: string;
  definition: string;
  exampleFr: string;
  category: string;
  difficulty: string;
  imageEmoji: string;
}

interface Props {
  initialWords: Word[];
  categories: string[];
}

const DIFFICULTY_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  BEGINNER:     { label: "beginner",     color: "var(--green)",  bg: "rgba(52,211,153,0.12)" },
  INTERMEDIATE: { label: "intermediate", color: "var(--blue)",   bg: "rgba(96,165,250,0.12)" },
  ADVANCED:     { label: "advanced",     color: "var(--red)",    bg: "rgba(248,113,113,0.12)" },
};

// Seeded shuffle so word order rotates daily but stays stable within a session
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Computed once per module load — stable for the entire session (same calendar day)
const DAY_SEED = Math.floor(Date.now() / 86_400_000);

export function DictionaryClient({ initialWords, categories }: Props) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");

  // Rotate order daily (no query = shuffled; searching = sort by relevance)
  const shuffled = useMemo(() => seededShuffle(initialWords, DAY_SEED), [initialWords]);

  const filtered = useMemo(() => {
    const base = query ? initialWords : shuffled;
    return base.filter((w) => {
      const matchesQuery =
        !query ||
        w.word.toLowerCase().includes(query.toLowerCase()) ||
        w.translation.toLowerCase().includes(query.toLowerCase()) ||
        w.definition.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = !selectedCategory || w.category === selectedCategory;
      const matchesDifficulty = !selectedDifficulty || w.difficulty === selectedDifficulty;
      return matchesQuery && matchesCategory && matchesDifficulty;
    });
  }, [query, selectedCategory, selectedDifficulty, initialWords, shuffled]);

  const isEmpty = initialWords.length === 0;

  return (
    <>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>Dictionary</h1>
        <p className="text-sm" style={{ color: "var(--text-2)" }}>Browse all French vocabulary. Save words to practice them later.</p>
      </div>

      {/* Yellow warning if DB is empty */}
      {isEmpty && (
        <div
          className="flex items-start gap-3 px-4 py-3 rounded-2xl mb-5"
          style={{
            background: "rgba(245,158,11,0.12)",
            border: "1px solid rgba(245,158,11,0.35)",
          }}
        >
          <span className="text-xl flex-shrink-0 mt-0.5">⚠️</span>
          <div>
            <p className="text-sm font-semibold" style={{ color: "#f59e0b" }}>No vocabulary loaded</p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(245,158,11,0.7)" }}>
              The dictionary is empty. Run the database seed to populate French vocabulary words.
            </p>
          </div>
        </div>
      )}

      {/* Search + filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--text-3)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search French or English..."
            className="input pl-10 w-full"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="input w-36"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="input w-36"
        >
          <option value="">All levels</option>
          <option value="BEGINNER">Beginner</option>
          <option value="INTERMEDIATE">Intermediate</option>
          <option value="ADVANCED">Advanced</option>
        </select>
      </div>

      <p className="text-xs font-semibold mb-4" style={{ color: "var(--text-3)" }}>
        {filtered.length} word{filtered.length !== 1 ? "s" : ""}
        {(selectedCategory || selectedDifficulty || query) && " found"}
      </p>

      {/* Word grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((word) => {
          const diff = DIFFICULTY_LABEL[word.difficulty] ?? DIFFICULTY_LABEL.BEGINNER;
          return (
            <Link
              key={word.id}
              href={`/dictionary/${word.id}`}
              className="flex items-center gap-3 p-4 rounded-2xl transition-all group"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
              onMouseEnter={(e) => { e.currentTarget.style.border = "1px solid var(--border-md)"; e.currentTarget.style.background = "var(--surface-3)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.border = "1px solid var(--border)"; e.currentTarget.style.background = "var(--surface-2)"; }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-transform group-hover:scale-105"
                style={{ background: "var(--accent-dim)" }}
              >
                {word.imageEmoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-sm" style={{ color: "var(--text)" }}>{word.word}</span>
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{ background: diff.bg, color: diff.color }}
                  >
                    {diff.label}
                  </span>
                </div>
                <p className="text-sm font-medium" style={{ color: "var(--accent)" }}>{word.translation}</p>
                <p className="text-[11px] truncate mt-0.5" style={{ color: "var(--text-3)" }}>{word.exampleFr}</p>
              </div>
              <svg
                className="w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-1"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                style={{ color: "var(--text-3)" }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          );
        })}
      </div>

      {/* No results from search */}
      {!isEmpty && filtered.length === 0 && (
        <div
          className="text-center py-14 rounded-2xl"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
        >
          <p className="text-3xl mb-3">🔍</p>
          <p className="font-semibold mb-1" style={{ color: "var(--text)" }}>No words found</p>
          <p className="text-sm" style={{ color: "var(--text-3)" }}>Try a different search or clear the filters</p>
          <button
            onClick={() => { setQuery(""); setSelectedCategory(""); setSelectedDifficulty(""); }}
            className="btn-secondary mt-4 text-sm px-4"
          >
            Clear filters
          </button>
        </div>
      )}
    </>
  );
}
