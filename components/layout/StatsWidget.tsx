"use client";

import { useEffect, useState } from "react";
import { getXpProgress } from "@/types";

interface Props {
  initialXp: number;
  initialLevel: number;
  initialStreak: number;
  initialRank: number | null;
  initialSkillTree: Record<string, number>;
}

export function StatsWidget({ initialXp, initialLevel, initialStreak, initialRank, initialSkillTree }: Props) {
  const [xp, setXp] = useState(initialXp);
  const [level, setLevel] = useState(initialLevel);
  const [streak, setStreak] = useState(initialStreak);
  const [rank, setRank] = useState(initialRank);
  const [skillTree, setSkillTree] = useState(initialSkillTree);

  useEffect(() => {
    async function refresh() {
      try {
        const r = await fetch("/api/progress", { cache: "no-store" });
        if (!r.ok) return;
        const { progress } = await r.json();
        if (!progress) return;
        setXp(progress.xp ?? 0);
        setLevel(progress.level ?? 1);
        setStreak(progress.streak ?? 0);
        const st = (progress.skillTree as Record<string, number>) ?? {};
        setSkillTree(st);
      } catch {}
    }

    function onXpUpdated() {
      setTimeout(refresh, 800);
    }

    window.addEventListener("xp-updated", onXpUpdated);
    return () => window.removeEventListener("xp-updated", onXpUpdated);
  }, []);

  const xpInfo = getXpProgress(xp);

  const stats = [
    { label: "Streak", value: `${streak}d`,        emoji: "🔥", color: "var(--gold)" },
    { label: "Level",  value: `Lv ${xpInfo.level}`, emoji: "⭐", color: "var(--accent)" },
    { label: "XP",     value: xp.toLocaleString(),  emoji: "💎", color: "#60a5fa" },
    { label: "Rank",   value: rank != null ? `#${rank}` : "—", emoji: "🏅", color: "var(--green)" },
  ];

  const skills = [
    { key: "vocabulary", label: "Vocab",   color: "#60a5fa" },
    { key: "grammar",    label: "Grammar", color: "var(--accent)" },
    { key: "speaking",   label: "Speaking",color: "var(--green)" },
  ];

  return (
    <div className="card p-4">
      <p className="section-label mb-3">My stats</p>

      <div className="grid grid-cols-2 gap-2 mb-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-2 px-2.5 py-2 rounded-xl"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}
          >
            <span className="text-base">{s.emoji}</span>
            <div>
              <p className="text-sm font-extrabold leading-none" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--text-3)" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* XP bar */}
      <div>
        <div className="flex justify-between text-[10px] mb-1" style={{ color: "var(--text-3)" }}>
          <span>{xpInfo.current} XP</span>
          <span>{xpInfo.needed} to Lv {xpInfo.level + 1}</span>
        </div>
        <div className="xp-bar">
          <div className="xp-bar-fill" style={{ width: `${xpInfo.pct}%`, transition: "width 0.6s ease" }} />
        </div>
      </div>

      {/* Skills mini */}
      <div className="flex gap-3 mt-3">
        {skills.map((sk) => {
          const pct = skillTree[sk.key] ?? 0;
          return (
            <div key={sk.key} className="flex-1 text-center">
              <div className="text-[11px] font-bold mb-1" style={{ color: sk.color }}>{pct}%</div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: sk.color }} />
              </div>
              <div className="text-[9px] mt-1" style={{ color: "var(--text-3)" }}>{sk.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
