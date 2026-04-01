"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface DailyGoal {
  id: string;
  label: string;
  emoji: string;
  target: number;
  current: number;
  href: string;
}

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

export function DailyGoals() {
  const [goals, setGoals] = useState<DailyGoal[]>([]);

  useEffect(() => {
    const key = `dailyGoals_${getTodayKey()}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      setGoals(JSON.parse(saved));
    } else {
      const fresh: DailyGoal[] = [
        { id: "lesson",  label: "Complete a lesson",    emoji: "🎓", target: 1, current: 0, href: "/learn" },
        { id: "review",  label: "Review words",          emoji: "🔄", target: 1, current: 0, href: "/review" },
        { id: "practice",label: "AI tutor or writing",  emoji: "✍️", target: 1, current: 0, href: "/tutor" },
      ];
      setGoals(fresh);
      localStorage.setItem(key, JSON.stringify(fresh));
    }
  }, []);

  const completedCount = goals.filter((g) => g.current >= g.target).length;
  const allDone = completedCount === goals.length && goals.length > 0;
  const pct = goals.length > 0 ? (completedCount / goals.length) * 100 : 0;

  return (
    <div className="card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="section-label mb-0.5">Today&apos;s goals</p>
          <p className="text-sm font-semibold" style={{ color: "var(--text-2)" }}>
            {completedCount}/{goals.length} complete
          </p>
        </div>

        {/* Mini ring */}
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
              {completedCount}
            </span>
          </div>
        </div>
      </div>

      {allDone && (
        <div
          className="rounded-xl px-3 py-2 mb-3 text-center text-xs font-bold"
          style={{ background: "var(--green-dim)", color: "var(--green)" }}
        >
          All done for today! 🎉
        </div>
      )}

      <div className="space-y-1.5">
        {goals.map((goal) => {
          const done = goal.current >= goal.target;
          return (
            <Link
              key={goal.id}
              href={goal.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all active:scale-[0.98]"
              style={{
                background: done ? "var(--green-dim)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${done ? "rgba(52,211,153,0.2)" : "transparent"}`,
              }}
            >
              <div
                className="w-5 h-5 rounded-md border-2 flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                style={{
                  background: done ? "var(--green)" : "transparent",
                  borderColor: done ? "var(--green)" : "var(--border-md)",
                  color: "white",
                }}
              >
                {done && "✓"}
              </div>
              <span
                className="text-sm flex-1"
                style={{
                  color: done ? "var(--text-3)" : "var(--text-2)",
                  textDecoration: done ? "line-through" : "none",
                }}
              >
                {goal.label}
              </span>
              <span className="text-base">{goal.emoji}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
