"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

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

  const maxXp = Math.max(...weeks.map((w) => w.xp), 1);

  if (weeks.every((w) => w.xp === 0)) {
    return (
      <div className="text-center py-8 text-zinc-400">
        <p className="text-2xl mb-2">◈</p>
        <p className="text-sm">No XP data yet — start learning to see your weekly progress!</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={weeks} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#a1a1aa" }} />
        <YAxis tick={{ fontSize: 11, fill: "#a1a1aa" }} />
        <Tooltip
          formatter={(val) => [`${val} XP`, "XP Earned"]}
          contentStyle={{ borderRadius: "12px", border: "1px solid #e4e4e7", background: "white" }}
        />
        <Bar dataKey="xp" radius={[6, 6, 0, 0]}>
          {weeks.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.xp === maxXp ? "#7c3aed" : "#ede9fe"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
