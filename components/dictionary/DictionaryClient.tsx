"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { t, getLocale } from "@/lib/i18n";
import { wordTranslation, wordDefinition } from "@/lib/wordI18n";
import { getLanguageConfig } from "@/data/language-config";
import { speak } from "@/lib/speech";
import Link from "next/link";
import { Search, Volume2, Plus, Check, Library } from "lucide-react";

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

export function DictionaryClient({ initialWords }: Props) {
  const { data: session } = useSession();
  const locale = getLocale((session?.user as { nativeLanguage?: string })?.nativeLanguage);
  const langConfig = getLanguageConfig(session?.user?.targetLanguage ?? "fr");
  const [query, setQuery] = useState("");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);

  const matches = useMemo(() => {
    if (!query.trim()) return [] as Word[];
    const q = query.trim().toLowerCase();
    return initialWords
      .filter(
        (w) =>
          w.word.toLowerCase().includes(q) ||
          wordTranslation(w, locale).toLowerCase().includes(q) ||
          wordDefinition(w, locale).toLowerCase().includes(q),
      )
      .slice(0, 6);
  }, [query, initialWords]);

  const isEmpty = initialWords.length === 0;
  const primary = matches[0];
  const others = matches.slice(1);

  const handleSpeak = (text: string) => {
    speak(text, { lang: `${langConfig.code}-${langConfig.code.toUpperCase()}` });
  };

  const handleSave = async (id: string) => {
    if (savingId || savedIds.has(id)) return;
    setSavingId(id);
    try {
      await fetch("/api/dictionary/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordId: id }),
      });
      setSavedIds((prev) => new Set(prev).add(id));
    } catch (err) {
      console.error("[dictionary] save error:", err);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      {/* ── Header ── */}
      <header>
        <h1 className="text-5xl mb-2">{t(locale, "dict_title")}</h1>
        <p className="text-white/40 text-lg">
          Search {langConfig.label} vocabulary. Add words to your collection to master them.
        </p>
      </header>

      {/* ── Search bar ── */}
      <div className="relative">
        <Search
          className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20"
          size={24}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search any ${langConfig.label} word or phrase…`}
          className="w-full bg-white/5 border border-white/10 rounded-3xl py-6 px-16 text-2xl focus:outline-none focus:border-white/20 transition-all font-light tracking-tight text-white placeholder:text-white/20"
        />
      </div>

      {/* ── Empty DB warning ── */}
      {isEmpty && (
        <div className="card-premium p-6 flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-amber-400">
              No vocabulary loaded
            </p>
            <p className="text-xs text-white/40 mt-1">
              The dictionary is empty. Run the database seed to populate vocabulary words.
            </p>
          </div>
        </div>
      )}

      {/* ── Results ── */}
      <div className="space-y-8">
        {primary ? (
          <>
            <div className="card-premium p-8 space-y-6">
              {/* Header row */}
              <div className="flex items-start justify-between gap-6 flex-wrap">
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <h2 className="text-5xl md:text-6xl font-bold mono lowercase tracking-tighter">
                      {primary.word}
                    </h2>
                    <button
                      onClick={() => handleSpeak(primary.word)}
                      className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 text-emerald-500 transition-colors"
                      aria-label={t(locale, "dict_pronounce")}
                    >
                      <Volume2 size={20} />
                    </button>
                  </div>
                  <p className="text-xl italic serif text-white/40">
                    {primary.imageEmoji} · {primary.category}
                  </p>
                </div>
                <button
                  onClick={() => handleSave(primary.id)}
                  disabled={savingId === primary.id || savedIds.has(primary.id)}
                  className="btn-primary flex items-center gap-2 py-3 px-6"
                  style={{ background: "var(--accent)", color: "#000" }}
                >
                  {savedIds.has(primary.id) ? (
                    <>
                      <Check size={18} /> Saved
                    </>
                  ) : (
                    <>
                      <Plus size={18} /> Add to Collection
                    </>
                  )}
                </button>
              </div>

              <div className="h-px bg-white/10" />

              {/* 2-col grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/40">
                    Translation
                  </p>
                  <p className="text-3xl font-medium">{wordTranslation(primary, locale)}</p>
                  {wordDefinition(primary, locale) && (
                    <p className="text-sm text-white/50 leading-relaxed">
                      {wordDefinition(primary, locale)}
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/40">
                    Usage Example
                  </p>
                  <p className="text-lg italic text-white/60 leading-relaxed">
                    “{primary.exampleFr}”
                  </p>
                  <Link
                    href={`/dictionary/${primary.id}`}
                    className="text-xs font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
                  >
                    Open full entry →
                  </Link>
                </div>
              </div>
            </div>

            {/* Related results */}
            {others.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-white/40">
                  Related Matches
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {others.map((w) => (
                    <Link
                      key={w.id}
                      href={`/dictionary/${w.id}`}
                      className="card-premium p-4 flex items-center gap-3 group no-underline"
                    >
                      <span className="text-2xl">{w.imageEmoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold mono lowercase">{w.word}</p>
                        <p className="text-sm text-white/40 truncate">
                          {wordTranslation(w, locale)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-white/10 gap-4">
            <Library size={64} strokeWidth={1} />
            <p className="text-lg font-medium">
              {query.trim()
                ? "No words match — try a different term"
                : "Type something to search the global database"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
