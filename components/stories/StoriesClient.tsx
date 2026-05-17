"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { t, getLocale } from "@/lib/i18n";
import { BookOpen, Play, ChevronRight } from "lucide-react";

interface StoryItem {
  id: string;
  title: string;
  chapter: number;
  difficulty: string;
  imageEmoji: string;
  quizCount: number;
  wordCount: number;
  isCompleted: boolean;
  isStarted: boolean;
  score: number;
}

const DIFF_LABEL: Record<string, string> = {
  BEGINNER: "A1",
  INTERMEDIATE: "B1",
  ADVANCED: "B2",
};

const DIFF_BADGE_CLASS: Record<string, string> = {
  BEGINNER: "bg-white text-black",
  INTERMEDIATE: "bg-white text-black",
  ADVANCED: "bg-rose-500 text-white",
};

const FILTERS = ["All", "Beginner", "Intermediate", "Advanced"] as const;
type Filter = (typeof FILTERS)[number];

export function StoriesClient({ stories }: { stories: StoryItem[] }) {
  const { data: session } = useSession();
  const locale = getLocale((session?.user as { nativeLanguage?: string })?.nativeLanguage);
  const [active, setActive] = useState<Filter>("All");

  const visible =
    active === "All"
      ? stories
      : stories.filter((s) => s.difficulty === active.toUpperCase());

  return (
    <>
      {/* ── Filter pills ── */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-full border border-white/10 w-fit">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActive(f)}
            className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
              active === f
                ? "bg-white text-black"
                : "text-white/40 hover:text-white"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ── Stories grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {visible.map((story) => {
          const diffLabel = DIFF_LABEL[story.difficulty] ?? story.difficulty.slice(0, 2);
          const badgeClass =
            DIFF_BADGE_CLASS[story.difficulty] ?? "bg-white text-black";

          return (
            <Link
              key={story.id}
              href={`/stories/${story.id}`}
              className="card-premium p-8 text-left h-[450px] flex flex-col justify-between group no-underline"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span
                    className={`px-3 py-1 ${badgeClass} text-[10px] font-bold uppercase rounded`}
                  >
                    {diffLabel}
                  </span>
                  <BookOpen size={20} className="text-white/20" />
                </div>
                <h3 className="text-3xl md:text-4xl font-bold italic serif mb-4 leading-tight">
                  {story.title}
                </h3>
                <p className="text-white/40 leading-relaxed text-sm">
                  Escape into a world of mystery and wonder while naturally expanding your vocabulary.
                </p>
              </div>

              <div className="space-y-6">
                <span className="text-6xl md:text-7xl block transition-transform group-hover:scale-110 group-hover:rotate-6">
                  {story.imageEmoji}
                </span>
                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <span className="text-xs font-bold uppercase tracking-widest text-white/20">
                    Chapter {story.chapter} · {story.wordCount} words
                  </span>
                  <div className="btn-secondary rounded-full p-2 group-hover:bg-white/10 transition-all">
                    {story.isCompleted ? (
                      <ChevronRight size={16} />
                    ) : (
                      <Play size={16} fill="currentColor" />
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}

        {visible.length === 0 && (
          <div className="card-premium p-12 text-center col-span-full">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-2xl font-bold italic serif mb-2">{t(locale, "stories_noneFound")}</p>
            <p className="text-white/40 text-sm">{t(locale, "stories_tryFilter")}</p>
          </div>
        )}
      </div>
    </>
  );
}
