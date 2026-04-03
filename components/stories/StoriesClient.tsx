"use client";

import Link from "next/link";
import { useState } from "react";

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

const diffGradient: Record<string, string> = {
  BEGINNER:     "linear-gradient(135deg, rgba(45,212,191,0.18) 0%, rgba(45,212,191,0.06) 100%)",
  INTERMEDIATE: "linear-gradient(135deg, rgba(99,102,241,0.22) 0%, rgba(99,102,241,0.07) 100%)",
  ADVANCED:     "linear-gradient(135deg, rgba(249,115,22,0.20) 0%, rgba(249,115,22,0.06) 100%)",
};

const diffBorderColor: Record<string, string> = {
  BEGINNER:     "rgba(45,212,191,0.22)",
  INTERMEDIATE: "rgba(99,102,241,0.28)",
  ADVANCED:     "rgba(249,115,22,0.24)",
};

const diffColor: Record<string, string> = {
  BEGINNER:     "var(--teal)",
  INTERMEDIATE: "var(--accent-2)",
  ADVANCED:     "var(--coral)",
};

const diffClass: Record<string, string> = {
  BEGINNER:     "diff-beginner",
  INTERMEDIATE: "diff-intermediate",
  ADVANCED:     "diff-advanced",
};

const FILTERS = ["All", "Beginner", "Intermediate", "Advanced"] as const;
type Filter = (typeof FILTERS)[number];

export function StoriesClient({ stories }: { stories: StoryItem[] }) {
  const [active, setActive] = useState<Filter>("All");

  const visible = active === "All"
    ? stories
    : stories.filter((s) => s.difficulty === active.toUpperCase());

  return (
    <>
      {/* ── Filter Tab Switcher ── */}
      <div style={{
        display: "flex", gap: 6, marginBottom: 24,
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 99, padding: 4, width: "fit-content",
      }}>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActive(f)}
            style={{
              padding: "6px 16px", borderRadius: 99, fontSize: 13, fontWeight: 600,
              border: "none", cursor: "pointer", transition: "all 0.18s ease",
              background: active === f ? "var(--accent)" : "transparent",
              color: active === f ? "#fff" : "var(--text-2)",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ── Story Cards Grid ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {visible.map((story) => {
          const accentColor = diffColor[story.difficulty] || "var(--accent)";
          const ctaLabel = story.isCompleted ? "Review" : story.isStarted ? "Continue" : "Start";

          return (
            <Link
              key={story.id}
              href={`/stories/${story.id}`}
              style={{
                display: "flex", alignItems: "center", gap: 20,
                background: diffGradient[story.difficulty] || "var(--surface)",
                border: `1px solid ${diffBorderColor[story.difficulty] || "var(--border)"}`,
                borderRadius: 18, padding: "18px 20px",
                textDecoration: "none", position: "relative", overflow: "hidden",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
              }}
              className="card-hover"
            >
              {/* Completed overlay badge */}
              {story.isCompleted && (
                <div style={{
                  position: "absolute", top: 12, right: 14,
                  display: "flex", alignItems: "center", gap: 5,
                  background: "var(--green-dim)", border: "1px solid rgba(34,197,94,0.25)",
                  borderRadius: 99, padding: "3px 10px",
                }}>
                  <svg width="11" height="11" fill="none" stroke="var(--green)" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--green)" }}>Completed</span>
                  {story.score > 0 && (
                    <span style={{ fontSize: 11, color: "var(--green)", opacity: 0.8 }}>{story.score}%</span>
                  )}
                </div>
              )}

              {/* Large emoji */}
              <div style={{
                fontSize: 48, lineHeight: 1, flexShrink: 0,
                filter: story.isCompleted ? "none" : undefined,
              }}>
                {story.imageEmoji}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Metadata row */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Ch. {story.chapter}
                  </span>
                  <span className={diffClass[story.difficulty]} style={{ fontSize: 10 }}>
                    {story.difficulty.charAt(0) + story.difficulty.slice(1).toLowerCase()}
                  </span>
                </div>

                {/* Title */}
                <h3 style={{
                  fontSize: 17, fontWeight: 700, color: "var(--text)",
                  marginBottom: 6, lineHeight: 1.3,
                  textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap",
                }}>
                  {story.title}
                </h3>

                {/* Stats */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, color: "var(--text-2)", fontWeight: 500 }}>
                    {story.wordCount} words
                  </span>
                  <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--text-3)", display: "inline-block" }} />
                  <span style={{ fontSize: 11, color: "var(--text-2)", fontWeight: 500 }}>
                    {story.quizCount} questions
                  </span>
                  <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--text-3)", display: "inline-block" }} />
                  {/* XP badge */}
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: "var(--gold)",
                    background: "var(--gold-dim)", borderRadius: 99, padding: "2px 8px",
                  }}>
                    +50 XP
                  </span>
                </div>
              </div>

              {/* CTA button */}
              <div style={{
                flexShrink: 0,
                background: story.isCompleted ? "var(--surface-3)" : accentColor,
                color: story.isCompleted ? "var(--text-2)" : "#fff",
                borderRadius: 99, padding: "8px 18px",
                fontSize: 13, fontWeight: 700,
                border: story.isCompleted ? "1px solid var(--border)" : "none",
                whiteSpace: "nowrap",
              }}>
                {ctaLabel}
              </div>
            </Link>
          );
        })}

        {visible.length === 0 && (
          <div style={{
            textAlign: "center", padding: "48px 24px",
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 18,
          }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>📭</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
              No stories found
            </p>
            <p style={{ fontSize: 13, color: "var(--text-2)" }}>
              Try a different difficulty filter.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
