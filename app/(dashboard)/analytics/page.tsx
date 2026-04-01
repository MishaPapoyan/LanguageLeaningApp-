"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, LineChart, Line, AreaChart, Area, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";

interface AnalyticsData {
  overview: {
    totalXp: number;
    level: number;
    streak: number;
    daysActive: number;
    daysSinceJoin: number;
    consistencyPct: number;
    avgWeeklyXp: number;
    memberSince: string;
    badges: string[];
    skillTree: Record<string, number>;
    weeklyXp: Record<string, number>;
  };
  xpBreakdown: {
    games: number;
    stories: number;
    tutor: number;
    words: number;
    streaks: number;
    total: number;
  };
  vocabulary: {
    total: number;
    totalAvailable: number;
    byCategory: Record<string, number>;
    byDifficulty: Record<string, number>;
    byMastery: Record<number, number>;
    perWeek: { week: string; count: number }[];
    recentWords: { word: string; category: string; mastery: number; addedAt: string }[];
  };
  stories: {
    completed: number;
    total: number;
    avgScore: number;
    byDifficulty: Record<string, { total: number; completed: number }>;
    totalXpEarned: number;
    recent: { title: string; score: number; completed: boolean; date: string }[];
  };
  games: {
    totalPlayed: number;
    byType: Record<string, { played: number; totalScore: number; totalXp: number; bestScore: number }>;
    totalXpEarned: number;
    scoreTrend: { date: string; score: number; type: string; xp: number }[];
    avgScore: number;
    bestScore: number;
  };
  tutor: {
    totalSessions: number;
    byScenario: Record<string, { count: number; totalXp: number }>;
    avgGrammarScore: number | null;
    avgAccuracy: number | null;
    totalXpEarned: number;
  };
  activity: {
    daily: { date: string; xp: number; games: number; stories: number; words: number; tutor: number }[];
    heatmap: { date: string; total: number; xp: number }[];
  };
}

type TabId = "overview" | "vocabulary" | "games" | "tutor" | "activity";

const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: "overview", label: "Overview", emoji: "📊" },
  { id: "activity", label: "Activity", emoji: "📅" },
  { id: "vocabulary", label: "Vocabulary", emoji: "📚" },
  { id: "games", label: "Games", emoji: "🎮" },
  { id: "tutor", label: "AI Tutor", emoji: "🤖" },
];

const COLORS = ["#7c3aed", "#3b82f6", "#f43f5e", "#f59e0b", "#0ea5e9", "#06b6d4", "#ec4899", "#6366f1"];

const MASTERY_LABELS: Record<number, string> = {
  0: "New",
  1: "Learning",
  2: "Familiar",
  3: "Practiced",
  4: "Known",
  5: "Mastered",
};

const GAME_LABELS: Record<string, string> = {
  FLASHCARDS: "Flashcards",
  MATCHING: "Matching",
  MEMORY_PALACE: "Memory Palace",
};

const GAME_EMOJI: Record<string, string> = {
  FLASHCARDS: "🃏",
  MATCHING: "🎯",
  MEMORY_PALACE: "🏠",
};

const SCENARIO_LABELS: Record<string, string> = {
  waiter: "Cafe Waiter",
  traveler: "Parisian Guide",
  teacher: "French Teacher",
  free: "Free Chat",
};

const SCENARIO_EMOJI: Record<string, string> = {
  waiter: "🍽️",
  traveler: "🗼",
  teacher: "👩‍🏫",
  free: "💬",
};

function StatCard({ label, value, subtext, emoji, gradient }: {
  label: string; value: string | number; subtext?: string; emoji: string; gradient: string;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-zinc-800 text-lg`}>
          {emoji}
        </div>
        <span className="text-2xl font-bold text-zinc-800">{value}</span>
      </div>
      <p className="text-sm font-medium text-zinc-500">{label}</p>
      {subtext && <p className="text-xs text-zinc-400 mt-0.5">{subtext}</p>}
    </div>
  );
}

function CircularProgress({ value, max, label, size = 100, color = "#3b82f6" }: {
  value: number; max: number; label: string; size?: number; color?: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" className="text-zinc-200" strokeWidth="8" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset} className="transition-all duration-1000" />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-xl font-bold text-zinc-800">{pct}%</span>
      </div>
      <p className="text-xs text-zinc-500 mt-1 text-center">{label}</p>
    </div>
  );
}

function HeatmapGrid({ data }: { data: { date: string; total: number; xp: number }[] }) {
  const maxTotal = Math.max(...data.map((d) => d.total), 1);

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {data.map((day) => {
          const intensity = day.total / maxTotal;
          const date = new Date(day.date);
          const dayLabel = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
          return (
            <div
              key={day.date}
              title={`${dayLabel}: ${day.total} activities, ${day.xp} XP`}
              className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-medium cursor-default transition-all hover:scale-110"
              style={{
                backgroundColor: day.total === 0
                  ? "#f4f4f5"
                  : `rgba(124, 58, 237, ${0.2 + intensity * 0.8})`,
                color: intensity > 0.5 ? "white" : day.total > 0 ? "#4c1d95" : "#94a3b8",
              }}
            >
              {date.getDate()}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-zinc-500">
        <span>Less</span>
        {[0, 0.25, 0.5, 0.75, 1].map((intensity, i) => (
          <div
            key={i}
            className="w-4 h-4 rounded-sm"
            style={{
              backgroundColor: intensity === 0
                ? "#f4f4f5"
                : `rgba(124, 58, 237, ${0.2 + intensity * 0.8})`,
            }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

function EmptyState({ emoji, message, action }: { emoji: string; message: string; action?: { label: string; href: string } }) {
  return (
    <div className="text-center py-8">
      <p className="text-4xl mb-2">{emoji}</p>
      <p className="text-zinc-400 text-sm">{message}</p>
      {action && (
        <Link href={action.href} className="btn-primary text-sm mt-3 inline-flex">{action.label}</Link>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // MUST be before any early returns — Rules of Hooks
  const chartData = useMemo(() => {
    if (!data) return null;
    const { overview, xpBreakdown, vocabulary } = data;

    const xpPieData = [
      { name: "Games", value: xpBreakdown.games, color: "#ec4899" },
      { name: "Stories", value: xpBreakdown.stories, color: "#3b82f6" },
      { name: "AI Tutor", value: xpBreakdown.tutor, color: "#8b5cf6" },
      { name: "Words", value: xpBreakdown.words, color: "#10b981" },
      { name: "Streaks & Other", value: xpBreakdown.streaks, color: "#f59e0b" },
    ].filter((d) => d.value > 0);

    const skillRadar = [
      { skill: "Vocabulary", value: overview.skillTree.vocabulary ?? 0, fullMark: 100 },
      { skill: "Grammar", value: overview.skillTree.grammar ?? 0, fullMark: 100 },
      { skill: "Speaking", value: overview.skillTree.speaking ?? 0, fullMark: 100 },
    ];

    const now = new Date();
    const weeklyXpData = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      const year = d.getFullYear();
      const week = getWeekNumber(d);
      const key = `${year}-W${String(week).padStart(2, "0")}`;
      return { week: i === 0 ? "Now" : `${i}w`, xp: overview.weeklyXp[key] ?? 0 };
    }).reverse();

    const masteryData = Object.entries(vocabulary.byMastery).map(([level, count]) => ({
      name: MASTERY_LABELS[Number(level)] ?? `Level ${level}`,
      count,
      level: Number(level),
    }));

    const categoryData = Object.entries(vocabulary.byCategory)
      .map(([name, count]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), count }))
      .sort((a, b) => b.count - a.count);

    return { xpPieData, skillRadar, weeklyXpData, masteryData, categoryData };
  }, [data]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 rounded-lg" style={{ background: "var(--surface-3)" }} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[0,1,2,3].map((i) => <div key={i} className="h-24 rounded-xl" style={{ background: "var(--surface-3)" }} />)}
        </div>
        <div className="h-64 rounded-xl" style={{ background: "var(--surface-3)" }} />
      </div>
    );
  }

  if (!data || !chartData) {
    return (
      <div className="text-center py-20">
        <p className="text-4xl mb-3">📊</p>
        <p style={{ color: "var(--text-2)" }}>Failed to load analytics. Please try again.</p>
      </div>
    );
  }

  const { overview, xpBreakdown, vocabulary, stories, games, tutor, activity } = data;
  const { xpPieData, skillRadar, weeklyXpData, masteryData, categoryData } = chartData;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-zinc-900 tracking-tight">Analytics Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Deep insights into your French learning journey
          </p>
        </div>
        <div className="text-right text-sm text-zinc-400">
          <p>Member since {new Date(overview.memberSince).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</p>
          <p>{overview.daysSinceJoin} days on LinguaFlow</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-white p-1 rounded-xl overflow-x-auto border border-zinc-100">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-violet-50 text-violet-700"
                : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            <span>{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══════════════ OVERVIEW TAB ═══════════════ */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
            <StatCard emoji="⚡" label="Total XP" value={overview.totalXp.toLocaleString()} gradient="from-blue-500 to-indigo-600" subtext={`Level ${overview.level}`} />
            <StatCard emoji="🔥" label="Current Streak" value={`${overview.streak}d`} gradient="from-orange-500 to-rose-500" subtext={overview.streak > 0 ? "Keep it up!" : "Start today!"} />
            <StatCard emoji="📅" label="Days Active" value={overview.daysActive} gradient="from-emerald-500 to-teal-500" subtext={`${overview.consistencyPct}% consistency`} />
            <StatCard emoji="📈" label="Avg Weekly XP" value={overview.avgWeeklyXp} gradient="from-violet-500 to-purple-500" subtext="Last 4 weeks" />
          </div>

          {/* XP Over Time + XP Sources */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Weekly XP Trend */}
            <div className="card">
              <h3 className="font-serif font-semibold text-zinc-800 mb-4">XP Over Time</h3>
              {weeklyXpData.some((w) => w.xp > 0) ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={weeklyXpData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <Tooltip formatter={(val) => [`${val} XP`, "Weekly XP"]} contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                    <Area type="monotone" dataKey="xp" stroke="#3b82f6" strokeWidth={2} fill="url(#xpGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState emoji="📈" message="Start learning to see your XP trend!" action={{ label: "Start Learning", href: "/learn" }} />
              )}
            </div>

            {/* XP Sources Pie */}
            <div className="card">
              <h3 className="font-serif font-semibold text-zinc-800 mb-4">XP Sources</h3>
              {xpPieData.length > 0 ? (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="50%" height={180}>
                    <PieChart>
                      <Pie data={xpPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                        {xpPieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val) => [`${val} XP`]} contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {xpPieData.map((d) => (
                      <div key={d.name} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="text-zinc-500">{d.name}</span>
                        <span className="font-medium text-zinc-800 ml-auto">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyState emoji="🎯" message="No XP earned yet!" action={{ label: "Start Earning", href: "/learn" }} />
              )}
            </div>
          </div>

          {/* Skill Radar + Summary Stats */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="card">
              <h3 className="font-serif font-semibold text-zinc-800 mb-4">Skill Balance</h3>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={skillRadar} cx="50%" cy="50%">
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12, fill: "#64748b" }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <Radar name="Skills" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 className="font-serif font-semibold text-zinc-800 mb-4">Learning Summary</h3>
              <div className="space-y-3">
                {[
                  { label: "Words Saved", value: vocabulary.total, total: vocabulary.totalAvailable, emoji: "📚", color: "#8b5cf6" },
                  { label: "Stories Completed", value: stories.completed, total: stories.total, emoji: "📖", color: "#3b82f6" },
                  { label: "Games Played", value: games.totalPlayed, total: null, emoji: "🎮", color: "#ec4899" },
                  { label: "Tutor Sessions", value: tutor.totalSessions, total: null, emoji: "🤖", color: "#10b981" },
                  { label: "Badges Earned", value: overview.badges.length, total: 10, emoji: "🏅", color: "#f59e0b" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-xl">{item.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-zinc-500">{item.label}</span>
                        <span className="text-sm font-bold text-zinc-800">
                          {item.value}{item.total !== null ? ` / ${item.total}` : ""}
                        </span>
                      </div>
                      {item.total !== null && (
                        <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${Math.min(100, (item.value / item.total) * 100)}%`, backgroundColor: item.color }} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ ACTIVITY TAB ═══════════════ */}
      {activeTab === "activity" && (
        <div className="space-y-6">
          {/* Activity Heatmap */}
          <div className="card">
            <h3 className="font-serif font-semibold text-zinc-800 mb-1">Activity Heatmap</h3>
            <p className="text-sm text-zinc-400 mb-4">Last 30 days</p>
            <HeatmapGrid data={activity.heatmap} />
          </div>

          {/* Daily XP Chart */}
          <div className="card">
            <h3 className="font-serif font-semibold text-zinc-800 mb-4">Daily XP Earned</h3>
            {activity.daily.some((d) => d.xp > 0) ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={activity.daily} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#94a3b8" }} tickFormatter={(v) => new Date(v).getDate().toString()} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <Tooltip
                    labelFormatter={(v) => new Date(v).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    formatter={(val) => [`${val} XP`]}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}
                  />
                  <Bar dataKey="xp" radius={[4, 4, 0, 0]}>
                    {activity.daily.map((entry, i) => (
                      <Cell key={i} fill={entry.xp > 0 ? "#3b82f6" : "#e2e8f0"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState emoji="📅" message="No activity in the last 30 days" action={{ label: "Start Learning", href: "/learn" }} />
            )}
          </div>

          {/* Activity Breakdown */}
          <div className="card">
            <h3 className="font-serif font-semibold text-zinc-800 mb-4">Activity Breakdown (30 Days)</h3>
            {activity.daily.some((d) => d.games + d.stories + d.words + d.tutor > 0) ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={activity.daily} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#94a3b8" }} tickFormatter={(v) => new Date(v).getDate().toString()} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <Tooltip
                    labelFormatter={(v) => new Date(v).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}
                  />
                  <Bar dataKey="stories" stackId="a" fill="#3b82f6" name="Stories" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="games" stackId="a" fill="#ec4899" name="Games" />
                  <Bar dataKey="words" stackId="a" fill="#10b981" name="Words" />
                  <Bar dataKey="tutor" stackId="a" fill="#8b5cf6" name="Tutor" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState emoji="📊" message="Activity data will appear as you learn" />
            )}
          </div>

          {/* Consistency Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
            <StatCard emoji="📅" label="Total Days Active" value={overview.daysActive} gradient="from-blue-500 to-indigo-600" />
            <StatCard emoji="🎯" label="Consistency" value={`${overview.consistencyPct}%`} gradient="from-emerald-500 to-teal-500" subtext={`of ${overview.daysSinceJoin} days`} />
            <StatCard emoji="🔥" label="Current Streak" value={`${overview.streak}d`} gradient="from-orange-500 to-rose-500" />
            <StatCard emoji="📈" label="Avg XP/Week" value={overview.avgWeeklyXp} gradient="from-violet-500 to-purple-500" />
          </div>
        </div>
      )}

      {/* ═══════════════ VOCABULARY TAB ═══════════════ */}
      {activeTab === "vocabulary" && (
        <div className="space-y-6">
          {/* Vocab Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
            <StatCard emoji="📚" label="Words Saved" value={vocabulary.total} gradient="from-violet-500 to-purple-500" subtext={`of ${vocabulary.totalAvailable} available`} />
            <StatCard emoji="🎯" label="Mastered" value={vocabulary.byMastery[5] ?? 0} gradient="from-emerald-500 to-teal-500" subtext="Level 5 words" />
            <StatCard emoji="📖" label="Categories" value={Object.keys(vocabulary.byCategory).length} gradient="from-blue-500 to-indigo-600" />
            <StatCard emoji="📈" label="Collection" value={`${vocabulary.totalAvailable > 0 ? Math.round((vocabulary.total / vocabulary.totalAvailable) * 100) : 0}%`} gradient="from-rose-500 to-pink-500" subtext="of all words" />
          </div>

          {/* Mastery Distribution + Category Breakdown */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="card">
              <h3 className="font-serif font-semibold text-zinc-800 mb-4">Mastery Distribution</h3>
              {vocabulary.total > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={masteryData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                    <Bar dataKey="count" name="Words" radius={[6, 6, 0, 0]}>
                      {masteryData.map((entry, i) => {
                        const colors = ["#ef4444", "#f59e0b", "#eab308", "#22c55e", "#10b981", "#059669"];
                        return <Cell key={i} fill={colors[entry.level] ?? "#94a3b8"} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState emoji="📝" message="Save words to see mastery stats" action={{ label: "Browse Dictionary", href: "/dictionary" }} />
              )}
            </div>

            <div className="card">
              <h3 className="font-serif font-semibold text-zinc-800 mb-4">Words by Category</h3>
              {categoryData.length > 0 ? (
                <div className="space-y-2.5">
                  {categoryData.map((cat, i) => {
                    const maxCount = categoryData[0]?.count ?? 1;
                    return (
                      <div key={cat.name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-zinc-500">{cat.name}</span>
                          <span className="text-sm font-medium text-zinc-800">{cat.count}</span>
                        </div>
                        <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${(cat.count / maxCount) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState emoji="📂" message="No categories yet" />
              )}
            </div>
          </div>

          {/* Words Per Week Trend */}
          <div className="card">
            <h3 className="font-serif font-semibold text-zinc-800 mb-4">Words Added Per Week</h3>
            {vocabulary.perWeek.some((w) => w.count > 0) ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={vocabulary.perWeek} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                  <Bar dataKey="count" name="Words" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState emoji="📈" message="Save words to track your progress over time" />
            )}
          </div>

          {/* Difficulty Distribution + Recent Words */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="card">
              <h3 className="font-serif font-semibold text-zinc-800 mb-4">By Difficulty</h3>
              {Object.keys(vocabulary.byDifficulty).length > 0 ? (
                <div className="space-y-3">
                  {[
                    { key: "BEGINNER", label: "Beginner", color: "#22c55e", emoji: "🟢" },
                    { key: "INTERMEDIATE", label: "Intermediate", color: "#f59e0b", emoji: "🟡" },
                    { key: "ADVANCED", label: "Advanced", color: "#ef4444", emoji: "🔴" },
                  ].map((diff) => {
                    const count = vocabulary.byDifficulty[diff.key] ?? 0;
                    return (
                      <div key={diff.key} className="flex items-center gap-3">
                        <span>{diff.emoji}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-zinc-500">{diff.label}</span>
                            <span className="text-sm font-bold text-zinc-800">{count}</span>
                          </div>
                          <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{
                              width: `${vocabulary.total > 0 ? (count / vocabulary.total) * 100 : 0}%`,
                              backgroundColor: diff.color,
                            }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState emoji="📊" message="No words saved yet" />
              )}
            </div>

            <div className="card">
              <h3 className="font-serif font-semibold text-zinc-800 mb-4">Recently Added</h3>
              {vocabulary.recentWords.length > 0 ? (
                <div className="space-y-2">
                  {vocabulary.recentWords.slice(0, 6).map((w) => (
                    <div key={w.word} className="flex items-center justify-between py-1.5 border-b border-zinc-100 last:border-0">
                      <div>
                        <span className="text-sm font-medium text-zinc-800">{w.word}</span>
                        <span className="text-xs text-zinc-500 ml-2">{w.category}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < w.mastery ? "bg-emerald-500" : "bg-zinc-200"}`} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState emoji="📝" message="No words saved yet" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ GAMES TAB ═══════════════ */}
      {activeTab === "games" && (
        <div className="space-y-6">
          {/* Game Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
            <StatCard emoji="🎮" label="Total Games" value={games.totalPlayed} gradient="from-rose-500 to-pink-500" />
            <StatCard emoji="🏆" label="Best Score" value={`${games.bestScore}%`} gradient="from-amber-500 to-orange-500" />
            <StatCard emoji="📊" label="Avg Score" value={`${games.avgScore}%`} gradient="from-blue-500 to-indigo-600" />
            <StatCard emoji="⚡" label="XP from Games" value={games.totalXpEarned} gradient="from-violet-500 to-purple-500" />
          </div>

          {/* Game Type Breakdown */}
          <div className="grid md:grid-cols-3 gap-3 stagger-children">
            {(["FLASHCARDS", "MATCHING", "MEMORY_PALACE"] as const).map((type) => {
              const stats = games.byType[type];
              return (
                <div key={type} className="card">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{GAME_EMOJI[type]}</span>
                    <h3 className="font-serif font-semibold text-zinc-800">{GAME_LABELS[type]}</h3>
                  </div>
                  {stats ? (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Played</span>
                        <span className="font-medium text-zinc-800">{stats.played}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Avg Score</span>
                        <span className="font-medium text-zinc-800">{Math.round(stats.totalScore / stats.played)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Best Score</span>
                        <span className="font-medium text-emerald-600">{stats.bestScore}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">XP Earned</span>
                        <span className="font-medium text-violet-600">{stats.totalXp} XP</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-400">Not played yet</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Score Trend */}
          <div className="card">
            <h3 className="font-serif font-semibold text-zinc-800 mb-4">Score Trend (Last 20 Games)</h3>
            {games.scoreTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={games.scoreTrend} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <Tooltip
                    labelFormatter={(v) => new Date(v).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    formatter={(val, name) => [`${val}%`, name === "score" ? "Score" : name]}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#ec4899" strokeWidth={2} dot={{ fill: "#ec4899", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState emoji="🎮" message="Play games to track your score trend" action={{ label: "Play a Game", href: "/games" }} />
            )}
          </div>
        </div>
      )}

      {/* ═══════════════ AI TUTOR TAB ═══════════════ */}
      {activeTab === "tutor" && (
        <div className="space-y-6">
          {/* Tutor Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
            <StatCard emoji="🤖" label="Total Sessions" value={tutor.totalSessions} gradient="from-violet-500 to-purple-500" />
            <StatCard emoji="✏️" label="Avg Grammar" value={tutor.avgGrammarScore !== null ? `${tutor.avgGrammarScore}%` : "N/A"} gradient="from-blue-500 to-indigo-600" />
            <StatCard emoji="🎯" label="Avg Accuracy" value={tutor.avgAccuracy !== null ? `${tutor.avgAccuracy}%` : "N/A"} gradient="from-emerald-500 to-teal-500" />
            <StatCard emoji="⚡" label="XP Earned" value={tutor.totalXpEarned} gradient="from-amber-500 to-orange-500" />
          </div>

          {/* Scenario Breakdown */}
          <div className="card">
            <h3 className="font-serif font-semibold text-zinc-800 mb-4">Sessions by Scenario</h3>
            {Object.keys(tutor.byScenario).length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
                {Object.entries(tutor.byScenario).map(([scenario, stats]) => (
                  <div key={scenario} className="bg-zinc-50 rounded-xl p-4 text-center">
                    <span className="text-3xl">{SCENARIO_EMOJI[scenario] ?? "💬"}</span>
                    <p className="text-sm font-medium text-zinc-800 mt-2">
                      {SCENARIO_LABELS[scenario] ?? scenario}
                    </p>
                    <p className="text-2xl font-bold text-zinc-800 mt-1">{stats.count}</p>
                    <p className="text-xs text-zinc-500">{stats.totalXp} XP earned</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState emoji="🤖" message="Start a conversation with the AI tutor!" action={{ label: "Chat with Tutor", href: "/tutor" }} />
            )}
          </div>

          {/* Tutor Tips */}
          {tutor.totalSessions > 0 && (
            <div className="card bg-violet-50 border-violet-100">
              <h3 className="font-serif font-semibold text-violet-700 mb-2">Tutor Insights</h3>
              <div className="space-y-2 text-sm text-zinc-500">
                {tutor.avgGrammarScore !== null && tutor.avgGrammarScore < 60 && (
                  <p>Your grammar score is below 60% — try the <strong>French Teacher</strong> scenario for structured practice.</p>
                )}
                {tutor.avgAccuracy !== null && tutor.avgAccuracy >= 80 && (
                  <p>Great accuracy at {tutor.avgAccuracy}%! Try more advanced scenarios to keep improving.</p>
                )}
                {Object.keys(tutor.byScenario).length < 3 && (
                  <p>You&apos;ve only tried {Object.keys(tutor.byScenario).length} scenario(s) — explore others for broader practice!</p>
                )}
                {tutor.totalSessions >= 5 && (
                  <p>With {tutor.totalSessions} sessions, you&apos;re building great conversational habits!</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer Link */}
      <div className="text-center pt-4 pb-8">
        <Link href="/progress" className="text-sm text-violet-600 hover:underline">
          View badges & skill tree on Progress page
        </Link>
      </div>
    </div>
  );
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
