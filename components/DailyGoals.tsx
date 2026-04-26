"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { t, getLocale } from "@/lib/i18n";

interface DailyGoal {
  id: string;
  label: string;
  emoji: string;
  done: boolean;
  href: string;
}

export function DailyGoals() {
  const { data: session } = useSession();
  const locale = getLocale((session?.user as any)?.nativeLanguage);
  const [goals, setGoals] = useState<DailyGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/daily-goals")
      .then((r) => r.json())
      .then((d) => {
        setGoals([
          {
            id: "stories",
            label: t(locale, "goals_readStory"),
            emoji: "📖",
            done: (d.storiesRead ?? 0) >= 1,
            href: "/stories",
          },
          {
            id: "games",
            label: t(locale, "goals_playGame"),
            emoji: "🎮",
            done: (d.gamesPlayed ?? 0) >= 1,
            href: "/games",
          },
          {
            id: "practice",
            label: t(locale, "goals_aiOrWriting"),
            emoji: "✍️",
            done: (d.practiceCount ?? 0) >= 1,
            href: "/tutor",
          },
        ]);
        setLoading(false);
      })
      .catch(() => {
        setGoals([
          { id: "stories",  label: t(locale, "goals_readStory"),   emoji: "📖", done: false, href: "/stories" },
          { id: "games",    label: t(locale, "goals_playGame"),     emoji: "🎮", done: false, href: "/games" },
          { id: "practice", label: t(locale, "goals_aiOrWriting"), emoji: "✍️", done: false, href: "/tutor" },
        ]);
        setLoading(false);
      });
  }, [locale]);

  const completedCount = goals.filter((g) => g.done).length;
  const allDone = completedCount === goals.length && goals.length > 0;
  const pct = goals.length > 0 ? (completedCount / goals.length) * 100 : 0;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="section-label mb-0.5">{t(locale, "goals_today")}</p>
          <p className="text-sm font-semibold" style={{ color: "var(--text-2)" }}>
            {loading ? "—" : t(locale, "goals_progress", { n: completedCount.toString(), total: goals.length.toString() })}
          </p>
        </div>

        <div className="relative w-12 h-12">
          <svg width="48" height="48" className="-rotate-90 absolute inset-0">
            <circle cx="24" cy="24" r="19" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
            <circle cx="24" cy="24" r="19" fill="none"
              stroke={allDone ? "var(--green)" : "var(--accent)"} strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 19}`}
              strokeDashoffset={`${2 * Math.PI * 19 * (1 - pct / 100)}`}
              style={{ transition: "stroke-dashoffset 0.6s ease", filter: allDone ? "drop-shadow(0 0 4px var(--green))" : "drop-shadow(0 0 4px var(--accent))" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-black" style={{ color: allDone ? "var(--green)" : "var(--accent)" }}>
              {loading ? "·" : completedCount}
            </span>
          </div>
        </div>
      </div>

      {allDone && (
        <div className="rounded-xl px-3 py-2 mb-3 text-center text-xs font-bold"
          style={{ background: "var(--green-dim)", color: "var(--green)" }}>
          {t(locale, "goals_allDone")}
        </div>
      )}

      <div className="space-y-1.5">
        {loading
          ? [1, 2, 3].map((i) => (
              <div key={i} className="px-3 py-2.5 rounded-xl"
                style={{ background: "rgba(255,255,255,0.03)", height: 40, animation: "pulse 1.5s infinite" }} />
            ))
          : goals.map((goal) => (
              <Link key={goal.id} href={goal.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all active:scale-[0.98]"
                style={{
                  background: goal.done ? "var(--green-dim)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${goal.done ? "rgba(52,211,153,0.2)" : "transparent"}`,
                }}>
                <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                  style={{
                    background: goal.done ? "var(--green)" : "transparent",
                    borderColor: goal.done ? "var(--green)" : "var(--border-md)",
                    color: "white",
                  }}>
                  {goal.done && "✓"}
                </div>
                <span className="text-sm flex-1"
                  style={{ color: goal.done ? "var(--text-3)" : "var(--text-2)", textDecoration: goal.done ? "line-through" : "none" }}>
                  {goal.label}
                </span>
                <span className="text-base">{goal.emoji}</span>
              </Link>
            ))}
      </div>
    </div>
  );
}
