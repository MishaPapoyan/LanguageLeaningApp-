import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BADGES, getXpProgress } from "@/types";
import { WeeklyChart } from "@/components/progress/WeeklyChart";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Progress — LinguaFlow",
  description: "Track your French learning progress and achievements",
};

export default async function ProgressPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const [progress, stats] = await Promise.all([
    prisma.progress.findUnique({ where: { userId } }),
    Promise.all([
      prisma.savedWord.count({ where: { userId } }),
      prisma.storyProgress.count({ where: { userId, completed: true } }),
      prisma.gameScore.count({ where: { userId } }),
      prisma.aiInteraction.count({ where: { userId } }),
      prisma.gameScore.findMany({ where: { userId }, orderBy: { playedAt: "desc" }, take: 5 }),
    ]),
  ]);

  const [savedWords, completedStories, gamePlays, tutorSessions, recentGames] = stats;

  const xpInfo = getXpProgress(progress?.xp ?? 0);
  const badges = progress?.badges ?? [];
  const skillTree = (progress?.skillTree as Record<string, number>) ?? { vocabulary: 0, grammar: 0, speaking: 0 };
  const weeklyXp = (progress?.weeklyXp as Record<string, number>) ?? {};

  const earnedBadges = BADGES.filter((b) => badges.includes(b.id));
  const lockedBadges = BADGES.filter((b) => !badges.includes(b.id));

  return (
    <div className="animate-fade-up space-y-6">
      {/* Hero level card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 p-6 text-white">
        <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-violet-400/20 blur-xl" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-violet-200 text-sm font-medium uppercase tracking-wider">Current Level</p>
            <p className="text-5xl font-serif mt-1">Level {xpInfo.level}</p>
            <p className="text-violet-200 text-sm mt-2">
              {xpInfo.current} / {xpInfo.needed} XP to next level
            </p>
            <div className="h-2 w-48 bg-white/20 rounded-full mt-3 overflow-hidden">
              <div className="h-full rounded-full bg-white transition-all duration-700" style={{ width: `${xpInfo.pct}%` }} />
            </div>
          </div>
          <div className="text-right">
            <p className="text-6xl font-bold opacity-90">{progress?.xp ?? 0}</p>
            <p className="text-violet-200 text-sm">Total XP</p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Day Streak", value: progress?.streak ?? 0, icon: "◈", bg: "bg-amber-50", accent: "text-amber-600", ring: "ring-amber-100" },
          { label: "Words Saved", value: savedWords, icon: "▤", bg: "bg-violet-50", accent: "text-violet-600", ring: "ring-violet-100" },
          { label: "Stories Done", value: completedStories, icon: "◉", bg: "bg-sky-50", accent: "text-sky-600", ring: "ring-sky-100" },
          { label: "Games Played", value: gamePlays, icon: "△", bg: "bg-rose-50", accent: "text-rose-600", ring: "ring-rose-100" },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-2xl p-5 ring-1 ${stat.ring}`}>
            <span className={`text-lg ${stat.accent}`}>{stat.icon}</span>
            <p className={`text-3xl font-bold mt-2 ${stat.accent}`}>{stat.value}</p>
            <p className="text-xs text-zinc-500 mt-1 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Weekly XP */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-6">
        <h2 className="font-serif text-lg text-zinc-900 mb-4">Weekly Activity</h2>
        <WeeklyChart weeklyXp={weeklyXp} />
      </div>

      {/* Skills */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-6">
        <h2 className="font-serif text-lg text-zinc-900 mb-5">Skills</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { key: "vocabulary", label: "Vocabulary", icon: "▤", color: "text-sky-600", track: "bg-sky-100", fill: "bg-sky-500", tip: "Save words & play flashcards" },
            { key: "grammar", label: "Grammar", icon: "◈", color: "text-violet-600", track: "bg-violet-100", fill: "bg-violet-500", tip: "Complete story quizzes" },
            { key: "speaking", label: "Speaking", icon: "♪", color: "text-emerald-600", track: "bg-emerald-100", fill: "bg-emerald-500", tip: "Chat with the AI tutor" },
          ].map((skill) => {
            const val = skillTree[skill.key] ?? 0;
            const circumference = 2 * Math.PI * 36;
            const dashOffset = circumference - (val / 100) * circumference;
            return (
              <div key={skill.key} className="flex flex-col items-center text-center">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="36" fill="none" strokeWidth="6" className={`stroke-zinc-100`} />
                    <circle cx="40" cy="40" r="36" fill="none" strokeWidth="6" strokeLinecap="round"
                      className={skill.fill.replace("bg-", "stroke-")}
                      strokeDasharray={circumference} strokeDashoffset={dashOffset}
                      style={{ transition: "stroke-dashoffset 1s ease" }} />
                  </svg>
                  <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${skill.color}`}>
                    {val}%
                  </span>
                </div>
                <p className="font-medium text-zinc-800 mt-2">{skill.label}</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">{skill.tip}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-6">
        <h2 className="font-serif text-lg text-zinc-900 mb-4">Badges</h2>

        {earnedBadges.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3">Earned ({earnedBadges.length})</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {earnedBadges.map((badge) => (
                <div key={badge.id} className="flex items-center gap-3 bg-amber-50 ring-1 ring-amber-100 rounded-xl p-3">
                  <span className="text-2xl">{badge.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold text-zinc-800">{badge.name}</p>
                    <p className="text-[11px] text-zinc-500">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {lockedBadges.length > 0 && (
          <div>
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3">Locked ({lockedBadges.length})</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {lockedBadges.map((badge) => (
                <div key={badge.id} className="flex items-center gap-3 bg-zinc-50 ring-1 ring-zinc-100 rounded-xl p-3 opacity-50">
                  <span className="text-2xl grayscale">{badge.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold text-zinc-500">{badge.name}</p>
                    <p className="text-[11px] text-zinc-400">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent games */}
      {recentGames.length > 0 && (
        <div className="bg-white rounded-2xl border border-zinc-100 p-6">
          <h2 className="font-serif text-lg text-zinc-900 mb-4">Recent Games</h2>
          <div className="divide-y divide-zinc-50">
            {recentGames.map((game) => (
              <div key={game.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-zinc-50 flex items-center justify-center text-lg">
                    {game.gameType === "FLASHCARDS" ? "◈" : game.gameType === "MATCHING" ? "△" : "⊞"}
                  </div>
                  <span className="text-sm text-zinc-700 capitalize">{game.gameType.toLowerCase().replace("_", " ")}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-zinc-400">{game.score}%</span>
                  <span className="font-semibold text-violet-600">+{game.xpEarned} XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
