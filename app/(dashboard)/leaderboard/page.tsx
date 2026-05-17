export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import { Trophy, TrendingUp, Flame } from "lucide-react";
import { t, getLocale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Leaderboard — Lingova",
  description: "See how you rank among other learners",
};

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id ?? "";
  const locale = getLocale((session?.user as any)?.nativeLanguage ?? "en");

  let users: { id: string; name: string | null; progress: { xp: number; level: number; streak: number } | null }[] = [];

  try {
    users = await prisma.user.findMany({
      where: { progress: { isNot: null } },
      select: {
        id: true,
        name: true,
        progress: { select: { xp: true, level: true, streak: true } },
      },
      orderBy: { progress: { xp: "desc" } },
      take: 50,
    });
  } catch (err) {
    console.error("[leaderboard] DB error:", err);
  }

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

  // Podium [2nd, 1st, 3rd] order for visual layout
  const top3 = leaderboard.slice(0, 3);
  const podiumPositions = top3.length === 3 ? [2, 1, 3] : [];
  const podiumByPos: Record<number, typeof leaderboard[number]> = {};
  if (top3.length === 3) {
    podiumByPos[1] = top3[0];
    podiumByPos[2] = top3[1];
    podiumByPos[3] = top3[2];
  }

  const rest = leaderboard.slice(3);

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      {/* ── Header ── */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl mb-4">{t(locale, "lb_eliteLeagues")}</h1>
          <div className="flex items-center gap-6">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-4 border-black bg-white/10"
                />
              ))}
            </div>
            <p className="text-white/40 text-lg">
              You're currently in the{" "}
              <span className="text-emerald-400 font-bold italic serif">
                Gold League
              </span>
              . Top 3 advance to Diamond.
            </p>
          </div>
        </div>

        <div className="flex gap-2 p-1 bg-white/5 rounded-full border border-white/10">
          {(["Global", "League", "Friends"] as const).map((f) => (
            <button
              key={f}
              className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                f === "League"
                  ? "bg-white text-black"
                  : "text-white/40 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      {/* ── Podium (top 3) ── */}
      {top3.length === 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
          {podiumPositions.map((pos) => {
            const user = podiumByPos[pos];
            const isFirst = pos === 1;
            const orderClass =
              pos === 2
                ? "order-0 md:order-1"
                : pos === 1
                ? "order-1 md:order-2 md:-translate-y-8"
                : "order-2 md:order-3";
            const borderClass = isFirst
              ? "border-amber-500/50 bg-amber-500/5"
              : "";
            const medalBg =
              pos === 1
                ? "bg-amber-500"
                : pos === 2
                ? "bg-slate-300"
                : "bg-orange-400";
            const youHighlight = user.isCurrentUser
              ? "ring-2 ring-emerald-500/60"
              : "";

            return (
              <div
                key={user.id}
                className={`card-premium p-8 text-center min-h-[320px] relative transition-transform hover:scale-105 ${orderClass} ${borderClass} ${youHighlight}`}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div
                    className={`w-20 h-20 rounded-full border-8 border-black flex items-center justify-center text-black font-black text-2xl ${medalBg}`}
                  >
                    {pos}
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="w-24 h-24 rounded-full bg-white/10 mx-auto border-4 border-white/5 flex items-center justify-center text-3xl font-bold text-white/60">
                    {user.name[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold serif italic truncate">
                      {user.name}
                      {user.isCurrentUser && (
                        <span className="text-emerald-400 text-sm not-italic ml-2">
                          ({t(locale, "lb_you")})
                        </span>
                      )}
                    </h3>
                    <p className="text-xs uppercase tracking-widest font-bold text-white/30 mt-1">
                      Level {user.level}
                      {user.streak > 0 && ` · ${user.streak}d streak`}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Trophy
                      size={16}
                      className={isFirst ? "text-amber-500" : "text-white/20"}
                    />
                    <span className="text-3xl font-bold mono">
                      {user.xp.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Full rankings table ── */}
      {leaderboard.length > 0 ? (
        <div className="card-premium overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-[10px] uppercase tracking-widest font-bold text-white/40">
                <th className="p-6">{t(locale, "lb_rank")}</th>
                <th className="p-6">{t(locale, "lb_learner")}</th>
                <th className="p-6">{t(locale, "lb_level")}</th>
                <th className="p-6">XP</th>
                <th className="p-6 text-right">{t(locale, "lb_status")}</th>
              </tr>
            </thead>
            <tbody>
              {(rest.length > 0 ? rest : leaderboard).map((user) => {
                const isPromotion = user.rank <= 3;
                const isDemotion = user.rank >= 20;
                return (
                  <tr
                    key={user.id}
                    className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                      user.isCurrentUser ? "bg-emerald-500/5" : ""
                    }`}
                  >
                    <td className="p-6 mono text-white/40">{user.rank}</td>
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                            user.isCurrentUser
                              ? "bg-emerald-500 text-black"
                              : "bg-white/5 text-white/60"
                          }`}
                        >
                          {user.name[0]?.toUpperCase() ?? "?"}
                        </div>
                        <div>
                          <p className="font-bold">
                            {user.isCurrentUser
                              ? t(locale, "lb_you")
                              : user.name}
                          </p>
                          <p className="text-xs text-white/40 flex items-center gap-2">
                            {user.streak > 0 ? (
                              <>
                                <Flame
                                  size={11}
                                  className="text-amber-400"
                                />
                                {user.streak}d streak
                              </>
                            ) : (
                              "—"
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="text-xs font-bold mono px-2 py-1 bg-white/5 rounded">
                        Lv {user.level}
                      </span>
                    </td>
                    <td className="p-6 mono font-bold">
                      {user.xp.toLocaleString()}
                    </td>
                    <td className="p-6 text-right">
                      {isPromotion ? (
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center justify-end gap-1">
                          <TrendingUp size={12} /> Promotion
                        </span>
                      ) : isDemotion ? (
                        <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">
                          Demotion
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                          Stable
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card-premium p-16 text-center">
          <p className="text-5xl mb-4">◆</p>
          <p className="text-2xl font-bold serif italic mb-2">
            {t(locale, "lb_noLearners")}
          </p>
          <p className="text-white/40 text-sm">
            {t(locale, "lb_noLearnersHint")}
          </p>
        </div>
      )}

      {/* ── Your rank summary if not in top 3 ── */}
      {myRank && myRank.rank > 3 && (
        <div className="card-premium p-6 flex items-center gap-6">
          <div className="w-12 h-12 rounded-full bg-emerald-500 text-black flex items-center justify-center flex-shrink-0">
            <Trophy size={20} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-1">
              Your Position
            </p>
            <p className="text-2xl font-bold serif italic">
              Rank #{myRank.rank} · {myRank.xp.toLocaleString()} XP
            </p>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-white/40">
            {Math.max(0, myRank.rank - 3)} spots from podium
          </p>
        </div>
      )}
    </div>
  );
}
