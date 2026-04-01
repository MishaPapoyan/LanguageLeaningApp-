import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getXpProgress } from "@/types";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaderboard — LinguaFlow",
  description: "See how you rank among other French learners",
};

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions);
  const currentUserId = session!.user.id;

  const users = await prisma.user.findMany({
    where: { progress: { isNot: null } },
    select: {
      id: true,
      name: true,
      progress: {
        select: { xp: true, level: true, streak: true },
      },
    },
    orderBy: { progress: { xp: "desc" } },
    take: 50,
  });

  const leaderboard = users.map((u, i) => ({
    rank: i + 1,
    id: u.id,
    name: u.name ?? "Anonymous",
    xp: u.progress?.xp ?? 0,
    level: u.progress?.level ?? 1,
    streak: u.progress?.streak ?? 0,
    isCurrentUser: u.id === currentUserId,
  }));

  const myRank = leaderboard.find((u) => u.isCurrentUser);

  const podiumOrder = leaderboard.length >= 3 ? [leaderboard[1], leaderboard[0], leaderboard[2]] : [];

  return (
    <div className="max-w-2xl animate-fade-up">
      {/* Your rank banner */}
      {myRank && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 p-5 mb-6 text-white">
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10 blur-xl" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
                #{myRank.rank}
              </div>
              <div>
                <p className="font-semibold text-lg">Your Rank</p>
                <p className="text-violet-200 text-sm">Level {myRank.level} · {myRank.xp} XP</p>
              </div>
            </div>
            {myRank.streak > 0 && (
              <div className="bg-amber-400/20 text-amber-200 px-3 py-1 rounded-full text-sm font-semibold">
                {myRank.streak} day streak
              </div>
            )}
          </div>
        </div>
      )}

      {/* Podium */}
      {podiumOrder.length === 3 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {podiumOrder.map((user, i) => {
            const medals = ["2nd", "1st", "3rd"];
            const heights = ["pt-8", "pt-0", "pt-10"];
            const ringColors = ["ring-zinc-200", "ring-amber-300", "ring-zinc-200"];
            const bgColors = ["bg-zinc-50", "bg-amber-50", "bg-zinc-50"];
            const avatarBgs = ["bg-zinc-400", "bg-amber-500", "bg-zinc-400"];
            return (
              <div key={user.id} className={`${heights[i]} transition-all`}>
                <div className={`rounded-2xl p-4 text-center ring-1 ${ringColors[i]} ${bgColors[i]} ${
                  user.isCurrentUser ? "ring-2 ring-violet-400" : ""
                }`}>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">{medals[i]}</p>
                  <div className={`w-11 h-11 ${avatarBgs[i]} rounded-full flex items-center justify-center text-white font-bold text-sm mx-auto mb-2`}>
                    {user.name[0]?.toUpperCase() ?? "?"}
                  </div>
                  <p className="font-medium text-zinc-800 text-sm truncate">{user.name}</p>
                  <p className="text-xs font-semibold text-violet-600 mt-0.5">{user.xp} XP</p>
                  <p className="text-[10px] text-zinc-400">Lv.{user.level}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full table */}
      <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
        <div className="divide-y divide-zinc-50">
          {leaderboard.map((user) => (
            <div
              key={user.id}
              className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                user.isCurrentUser ? "bg-violet-50/50" : "hover:bg-zinc-50"
              }`}
            >
              <span className={`w-8 text-center text-sm font-bold ${
                user.rank <= 3 ? "text-amber-500" : "text-zinc-300"
              }`}>
                {user.rank}
              </span>
              <div className="w-8 h-8 bg-gradient-to-br from-violet-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {user.name[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-800 truncate">
                  {user.name}
                  {user.isCurrentUser && <span className="text-violet-500 text-xs ml-1">(you)</span>}
                </p>
                <p className="text-[11px] text-zinc-400">Level {user.level}</p>
              </div>
              <div className="text-right flex-shrink-0 flex items-center gap-3">
                {user.streak > 0 && (
                  <span className="text-[11px] text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full font-medium">{user.streak}d</span>
                )}
                <span className="font-semibold text-sm text-violet-600">{user.xp} XP</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {leaderboard.length === 0 && (
        <div className="bg-white rounded-2xl border border-zinc-100 text-center py-16">
          <p className="text-4xl mb-3">◈</p>
          <p className="font-serif text-lg text-zinc-800">No learners yet</p>
          <p className="text-sm text-zinc-500 mt-1">Start learning to claim the #1 spot!</p>
        </div>
      )}
    </div>
  );
}
