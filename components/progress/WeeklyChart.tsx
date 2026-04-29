"use client";

import { SimpleBarChart } from "@/components/charts/LightCharts";

interface Props {
  weeklyXp: Record<string, number>;
}

export function WeeklyChart({ weeklyXp }: Props) {
  const now = new Date();
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const year = d.getFullYear();
    const week = getWeekNumber(d);
    const key = `${year}-W${String(week).padStart(2, "0")}`;
    const label = i === 0 ? "This week" : `W${week}`;
    return { key, label, xp: weeklyXp[key] ?? 0 };
  }).reverse();

  if (weeks.every((w) => w.xp === 0)) {
    return (
      <div className="text-center py-8" style={{ color: "var(--text-3)" }}>
        <p className="text-2xl mb-2">◈</p>
        <p className="text-sm">No XP data yet — start learning to see your weekly progress!</p>
      </div>
    );
  }

  return (
    <SimpleBarChart
      data={weeks.map((w) => ({ label: w.label, value: w.xp }))}
      height={200}
      barColor="#6366F1"
      highlightMax
      formatValue={(v) => `${v} XP`}
    />
  );
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
