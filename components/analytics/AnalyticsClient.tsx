"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { getLanguageConfig } from "@/data/language-config";
import Link from "next/link";
import {
  SimpleBarChart,
  SimpleAreaChart,
  SimpleLineChart,
  SimplePieChart,
  SimpleRadarChart,
  StackedBarChart,
} from "@/components/charts/LightCharts";

export interface AnalyticsData {
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
  0: "New", 1: "Learning", 2: "Familiar", 3: "Practiced", 4: "Known", 5: "Mastered",
};

const GAME_LABELS: Record<string, string> = {
  FLASHCARDS: "Flashcards", MATCHING: "Matching", MEMORY_PALACE: "Memory Palace",
};

const GAME_EMOJI: Record<string, string> = {
  FLASHCARDS: "🃏", MATCHING: "🎯", MEMORY_PALACE: "🏠",
};

const SCENARIO_LABELS: Record<string, string> = {
  waiter: "Café Waiter", traveler: "City Explorer", teacher: "Language Teacher", free: "Free Chat",
};

const SCENARIO_EMOJI: Record<string, string> = {
  waiter: "🍽️", traveler: "🗼", teacher: "👩‍🏫", free: "💬",
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
            <div key={day.date} title={`${dayLabel}: ${day.total} activities, ${day.xp} XP`}
              className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-medium cursor-default transition-all hover:scale-110"
              style={{
                backgroundColor: day.total === 0 ? "#f4f4f5" : `rgba(124, 58, 237, ${0.2 + intensity * 0.8})`,
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
          <div key={i} className="w-4 h-4 rounded-sm"
            style={{ backgroundColor: intensity === 0 ? "#f4f4f5" : `rgba(124, 58, 237, ${0.2 + intensity * 0.8})` }}
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
      {action && <Link href={action.href} className="btn-primary text-sm mt-3 inline-flex">{action.label}</Link>}
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

export default function AnalyticsClient({ data }: { data: AnalyticsData }) {
  const { data: session } = useSession();
  const langConfig = getLanguageConfig(session?.user?.targetLanguage ?? "fr");
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const chartData = useMemo(() => {
    const { overview, xpBreakdown, vocabulary } = data;

    const xpPieData = [
      { name: "Games", value: xpBreakdown.games, color: "#ec4899" },
      { name: "Stories", value: xpBreakdown.stories, color: "#3b82f6" },
      { name: "AI Tutor", value: xpBreakdown.tutor, color: "#8b5cf6" },
      { name: "Words", value: xpBreakdown.words, color: "#10b981" },
      { name: "Streaks & Other", value: xpBreakdown.streaks, color: "#f59e0b" },
    ].filter((d) => d.value > 0);

    const skillRadar = [
      { label: "Vocabulary", value: overview.skillTree.vocabulary ?? 0, max: 100 },
      { label: "Grammar", value: overview.skillTree.grammar ?? 0, max: 100 },
      { label: "Speaking", value: overview.skillTree.speaking ?? 0, max: 100 },
    ];

    const now = new Date();
    const weeklyXpData = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      const year = d.getFullYear();
      const week = getWeekNumber(d);
      const key = `${year}-W${String(week).padStart(2, "0")}`;
      return { label: i === 0 ? "Now" : `${i}w`, value: overview.weeklyXp[key] ?? 0 };
    }).reverse();

    const masteryData = Object.entries(vocabulary.byMastery).map(([level, count]) => ({
      label: MASTERY_LABELS[Number(level)] ?? `L${level}`,
      value: count,
      level: Number(level),
    }));

    const categoryData = Object.entries(vocabulary.byCategory)
      .map(([name, count]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), count }))
      .sort((a, b) => b.count - a.count);

    return { xpPieData, skillRadar, weeklyXpData, masteryData, categoryData };
  }, [data]);

  const { overview, vocabulary, stories, games, tutor, activity } = data;
  const { xpPieData, skillRadar, weeklyXpData, masteryData, categoryData } = chartData;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-zinc-900 tracking-tight">Analytics Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-1">Deep insights into your {langConfig.label} learning journey</p>
        </div>
        <div className="text-right text-sm text-zinc-400">
          <p>Member since {new Date(overview.memberSince).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</p>
          <p>{overview.daysSinceJoin} days on LangCraft</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-white p-1 rounded-xl overflow-x-auto border border-zinc-100">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id ? "bg-violet-50 text-violet-700" : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            <span>{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══ OVERVIEW ═══ */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
            <StatCard emoji="⚡" label="Total XP" value={overview.totalXp.toLocaleString()} gradient="from-blue-500 to-indigo-600" subtext={`Level ${overview.level}`} />
            <StatCard emoji="🔥" label="Current Streak" value={`${overview.streak}d`} gradient="from-orange-500 to-rose-500" subtext={overview.streak > 0 ? "Keep it up!" : "Start today!"} />
            <StatCard emoji="📅" label="Days Active" value={overview.daysActive} gradient="from-emerald-500 to-teal-500" subtext={`${overview.consistencyPct}% consistency`} />
            <StatCard emoji="📈" label="Avg Weekly XP" value={overview.avgWeeklyXp} gradient="from-violet-500 to-purple-500" subtext="Last 4 weeks" />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="card">
              <h3 className="font-serif font-semibold text-zinc-800 mb-4">XP Over Time</h3>
              {weeklyXpData.some((w) => w.value > 0) ? (
                <SimpleAreaChart data={weeklyXpData} height={200} color="#3b82f6" formatValue={(v) => `${v} XP`} />
              ) : (
                <EmptyState emoji="📈" message="Start learning to see your XP trend!" action={{ label: "Start Learning", href: "/learn" }} />
              )}
            </div>

            <div className="card">
              <h3 className="font-serif font-semibold text-zinc-800 mb-4">XP Sources</h3>
              {xpPieData.length > 0 ? (
                <div className="flex items-center gap-4">
                  <SimplePieChart data={xpPieData} size={160} innerRadius={50} />
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

          <div className="grid md:grid-cols-2 gap-4">
            <div className="card">
              <h3 className="font-serif font-semibold text-zinc-800 mb-4">Skill Balance</h3>
              <SimpleRadarChart data={skillRadar} size={220} color="#3b82f6" />
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

      {/* ═══ ACTIVITY ═══ */}
      {activeTab === "activity" && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-serif font-semibold text-zinc-800 mb-1">Activity Heatmap</h3>
            <p className="text-sm text-zinc-400 mb-4">Last 30 days</p>
            <HeatmapGrid data={activity.heatmap} />
          </div>

          <div className="card">
            <h3 className="font-serif font-semibold text-zinc-800 mb-4">Daily XP Earned</h3>
            {activity.daily.some((d) => d.xp > 0) ? (
              <SimpleBarChart
                data={activity.daily.map((d) => ({
                  label: String(new Date(d.date).getDate()),
                  value: d.xp,
                  color: d.xp > 0 ? "#3b82f6" : "#e2e8f0",
                }))}
                height={220}
                formatValue={(v) => `${v} XP`}
              />
            ) : (
              <EmptyState emoji="📅" message="No activity in the last 30 days" action={{ label: "Start Learning", href: "/learn" }} />
            )}
          </div>

          <div className="card">
            <h3 className="font-serif font-semibold text-zinc-800 mb-4">Activity Breakdown (30 Days)</h3>
            {activity.daily.some((d) => d.games + d.stories + d.words + d.tutor > 0) ? (
              <StackedBarChart
                data={activity.daily.map((d) => ({
                  label: String(new Date(d.date).getDate()),
                  values: [
                    { key: "stories", value: d.stories, color: "#3b82f6" },
                    { key: "games", value: d.games, color: "#ec4899" },
                    { key: "words", value: d.words, color: "#10b981" },
                    { key: "tutor", value: d.tutor, color: "#8b5cf6" },
                  ],
                }))}
                height={220}
                legend={[
                  { key: "stories", label: "Stories", color: "#3b82f6" },
                  { key: "games", label: "Games", color: "#ec4899" },
                  { key: "words", label: "Words", color: "#10b981" },
                  { key: "tutor", label: "Tutor", color: "#8b5cf6" },
                ]}
              />
            ) : (
              <EmptyState emoji="📊" message="Activity data will appear as you learn" />
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
            <StatCard emoji="📅" label="Total Days Active" value={overview.daysActive} gradient="from-blue-500 to-indigo-600" />
            <StatCard emoji="🎯" label="Consistency" value={`${overview.consistencyPct}%`} gradient="from-emerald-500 to-teal-500" subtext={`of ${overview.daysSinceJoin} days`} />
            <StatCard emoji="🔥" label="Current Streak" value={`${overview.streak}d`} gradient="from-orange-500 to-rose-500" />
            <StatCard emoji="📈" label="Avg XP/Week" value={overview.avgWeeklyXp} gradient="from-violet-500 to-purple-500" />
          </div>
        </div>
      )}

      {/* ═══ VOCABULARY ═══ */}
      {activeTab === "vocabulary" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
            <StatCard emoji="📚" label="Words Saved" value={vocabulary.total} gradient="from-violet-500 to-purple-500" subtext={`of ${vocabulary.totalAvailable} available`} />
            <StatCard emoji="🎯" label="Mastered" value={vocabulary.byMastery[5] ?? 0} gradient="from-emerald-500 to-teal-500" subtext="Level 5 words" />
            <StatCard emoji="📖" label="Categories" value={Object.keys(vocabulary.byCategory).length} gradient="from-blue-500 to-indigo-600" />
            <StatCard emoji="📈" label="Collection" value={`${vocabulary.totalAvailable > 0 ? Math.round((vocabulary.total / vocabulary.totalAvailable) * 100) : 0}%`} gradient="from-rose-500 to-pink-500" subtext="of all words" />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="card">
              <h3 className="font-serif font-semibold text-zinc-800 mb-4">Mastery Distribution</h3>
              {vocabulary.total > 0 ? (
                <SimpleBarChart
                  data={masteryData.map((d) => {
                    const colors = ["#ef4444", "#f59e0b", "#eab308", "#22c55e", "#10b981", "#059669"];
                    return { label: d.label, value: d.value, color: colors[d.level] ?? "#94a3b8" };
                  })}
                  height={200}
                  formatValue={(v) => `${v} words`}
                />
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

          <div className="card">
            <h3 className="font-serif font-semibold text-zinc-800 mb-4">Words Added Per Week</h3>
            {vocabulary.perWeek.some((w) => w.count > 0) ? (
              <SimpleBarChart
                data={vocabulary.perWeek.map((w) => ({ label: w.week, value: w.count }))}
                height={180}
                barColor="#8b5cf6"
                formatValue={(v) => `${v} words`}
              />
            ) : (
              <EmptyState emoji="📈" message="Save words to track your progress over time" />
            )}
          </div>

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

      {/* ═══ GAMES ═══ */}
      {activeTab === "games" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
            <StatCard emoji="🎮" label="Total Games" value={games.totalPlayed} gradient="from-rose-500 to-pink-500" />
            <StatCard emoji="🏆" label="Best Score" value={`${games.bestScore}%`} gradient="from-amber-500 to-orange-500" />
            <StatCard emoji="📊" label="Avg Score" value={`${games.avgScore}%`} gradient="from-blue-500 to-indigo-600" />
            <StatCard emoji="⚡" label="XP from Games" value={games.totalXpEarned} gradient="from-violet-500 to-purple-500" />
          </div>

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
                      {[
                        { label: "Played", value: stats.played },
                        { label: "Avg Score", value: `${Math.round(stats.totalScore / stats.played)}%` },
                        { label: "Best Score", value: `${stats.bestScore}%`, cls: "text-emerald-600" },
                        { label: "XP Earned", value: `${stats.totalXp} XP`, cls: "text-violet-600" },
                      ].map((row) => (
                        <div key={row.label} className="flex justify-between text-sm">
                          <span className="text-zinc-500">{row.label}</span>
                          <span className={`font-medium ${row.cls ?? "text-zinc-800"}`}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-400">Not played yet</p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="card">
            <h3 className="font-serif font-semibold text-zinc-800 mb-4">Score Trend (Last 20 Games)</h3>
            {games.scoreTrend.length > 0 ? (
              <SimpleLineChart
                data={games.scoreTrend.map((g) => ({
                  label: new Date(g.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                  value: g.score,
                }))}
                height={220}
                color="#ec4899"
                domain={[0, 100]}
              />
            ) : (
              <EmptyState emoji="🎮" message="Play games to track your score trend" action={{ label: "Play a Game", href: "/games" }} />
            )}
          </div>
        </div>
      )}

      {/* ═══ AI TUTOR ═══ */}
      {activeTab === "tutor" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
            <StatCard emoji="🤖" label="Total Sessions" value={tutor.totalSessions} gradient="from-violet-500 to-purple-500" />
            <StatCard emoji="✏️" label="Avg Grammar" value={tutor.avgGrammarScore !== null ? `${tutor.avgGrammarScore}%` : "N/A"} gradient="from-blue-500 to-indigo-600" />
            <StatCard emoji="🎯" label="Avg Accuracy" value={tutor.avgAccuracy !== null ? `${tutor.avgAccuracy}%` : "N/A"} gradient="from-emerald-500 to-teal-500" />
            <StatCard emoji="⚡" label="XP Earned" value={tutor.totalXpEarned} gradient="from-amber-500 to-orange-500" />
          </div>

          <div className="card">
            <h3 className="font-serif font-semibold text-zinc-800 mb-4">Sessions by Scenario</h3>
            {Object.keys(tutor.byScenario).length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
                {Object.entries(tutor.byScenario).map(([scenario, stats]) => (
                  <div key={scenario} className="bg-zinc-50 rounded-xl p-4 text-center">
                    <span className="text-3xl">{SCENARIO_EMOJI[scenario] ?? "💬"}</span>
                    <p className="text-sm font-medium text-zinc-800 mt-2">{SCENARIO_LABELS[scenario] ?? scenario}</p>
                    <p className="text-2xl font-bold text-zinc-800 mt-1">{stats.count}</p>
                    <p className="text-xs text-zinc-500">{stats.totalXp} XP earned</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState emoji="🤖" message="Start a conversation with the AI tutor!" action={{ label: "Chat with Tutor", href: "/tutor" }} />
            )}
          </div>

          {tutor.totalSessions > 0 && (
            <div className="card bg-violet-50 border-violet-100">
              <h3 className="font-serif font-semibold text-violet-700 mb-2">Tutor Insights</h3>
              <div className="space-y-2 text-sm text-zinc-500">
                {tutor.avgGrammarScore !== null && tutor.avgGrammarScore < 60 && (
                  <p>Your grammar score is below 60% — try the <strong>Language Teacher</strong> scenario for structured practice.</p>
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

      <div className="text-center pt-4 pb-8">
        <Link href="/progress" className="text-sm text-violet-600 hover:underline">
          View badges & skill tree on Progress page
        </Link>
      </div>
    </div>
  );
}
