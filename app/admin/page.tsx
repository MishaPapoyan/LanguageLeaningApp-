import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AdminAutoRefresh } from "@/components/AdminAutoRefresh";

export const dynamic = "force-dynamic";

const LANG_FLAG: Record<string, string> = { fr: "🇫🇷", es: "🇪🇸" };

export default async function AdminOverview() {
  let d = {
    userCount: 0, locationCount: 0, activeToday: 0, activeWeek: 0,
    totalXp: 0, aiCount: 0, gameCount: 0, writeCount: 0,
    groupCount: 0, studentCount: 0, teacherCount: 0, adminCount: 0,
    frCount: 0, esCount: 0,
    recentUsers: [] as any[],
    recentGames: [] as any[],
  };

  try {
    const [uc, lc, at, aw, xpAgg, aiC, gameC, writeC, groupC, sc, tc, ac, frC, esC, ru, rg] = await Promise.all([
      prisma.user.count(),
      prisma.userLocation.count(),
      prisma.progress.count({ where: { lastActive: { gte: new Date(Date.now() - 86400000) } } }),
      prisma.progress.count({ where: { lastActive: { gte: new Date(Date.now() - 7 * 86400000) } } }),
      prisma.progress.aggregate({ _sum: { xp: true } }),
      prisma.aiInteraction.count(),
      prisma.gameScore.count(),
      prisma.writingSession.count(),
      prisma.group.count(),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "TEACHER" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { targetLanguage: "fr" } }),
      prisma.user.count({ where: { targetLanguage: "es" } }),
      prisma.user.findMany({
        take: 6, orderBy: { createdAt: "desc" },
        select: {
          id: true, name: true, email: true, role: true, createdAt: true, targetLanguage: true,
          progress: { select: { xp: true, level: true } },
          location: { select: { city: true, country: true } },
        },
      }),
      prisma.gameScore.findMany({
        take: 6, orderBy: { playedAt: "desc" },
        select: {
          id: true, gameType: true, score: true, xpEarned: true, playedAt: true,
          user: { select: { name: true, email: true } },
        },
      }),
    ]);
    d = {
      userCount: uc, locationCount: lc, activeToday: at, activeWeek: aw,
      totalXp: xpAgg._sum.xp ?? 0, aiCount: aiC, gameCount: gameC, writeCount: writeC,
      groupCount: groupC, studentCount: sc, teacherCount: tc, adminCount: ac,
      frCount: frC, esCount: esC,
      recentUsers: ru, recentGames: rg,
    };
  } catch (err) {
    console.error("[admin] DB error:", err);
  }

  const stats = [
    { label: "Total users",       value: d.userCount,                    emoji: "👥", href: "/admin/users" },
    { label: "Active today",      value: d.activeToday,                  emoji: "🟢", href: "/admin/users" },
    { label: "Active this week",  value: d.activeWeek,                   emoji: "📅", href: "/admin/users" },
    { label: "Classrooms",        value: d.groupCount,                   emoji: "🏫", href: "/admin/groups" },
    { label: "Total XP earned",   value: d.totalXp.toLocaleString(),     emoji: "⚡", href: "/admin/analytics" },
    { label: "AI sessions",       value: d.aiCount.toLocaleString(),     emoji: "🤖", href: "/admin/analytics" },
    { label: "Game plays",        value: d.gameCount.toLocaleString(),   emoji: "🎮", href: "/admin/analytics" },
    { label: "Writing sessions",  value: d.writeCount.toLocaleString(),  emoji: "✍️", href: "/admin/analytics" },
  ];

  return (
    <div>
      <AdminAutoRefresh />
      <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", fontFamily: "var(--font-display)", letterSpacing: "-0.02em", marginBottom: 4 }}>Overview</h1>
      <p className="text-sm mb-8" style={{ color: "var(--text-3)" }}>
        {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
      </p>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => {
          const inner = (
            <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <p className="text-2xl mb-2">{s.emoji}</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", fontFamily: "var(--font-mono)", letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>{s.value}</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>{s.label}</p>
            </div>
          );
          return (
            <Link key={s.label} href={s.href} className="block hover:opacity-80 transition-opacity">{inner}</Link>
          );
        })}
      </div>

      {/* Breakdown row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Role breakdown */}
        <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text)" }}>User roles</h3>
          {[
            { label: "Students", count: d.studentCount, color: "var(--accent)" },
            { label: "Teachers", count: d.teacherCount, color: "#f59e0b" },
            { label: "Admins",   count: d.adminCount,   color: "var(--red)" },
          ].map((r) => (
            <div key={r.label} className="mb-3 last:mb-0">
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: "var(--text-2)" }}>{r.label}</span>
                <span style={{ color: "var(--text-3)" }}>{r.count}</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: "var(--border)" }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: d.userCount > 0 ? `${(r.count / d.userCount) * 100}%` : "0%", background: r.color }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Language breakdown */}
        <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text)" }}>Target languages</h3>
          {[
            { lang: "French",  count: d.frCount, flag: "🇫🇷", color: "#3b82f6" },
            { lang: "Spanish", count: d.esCount, flag: "🇪🇸", color: "#f59e0b" },
          ].map((l) => (
            <div key={l.lang} className="mb-3 last:mb-0">
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: "var(--text-2)" }}>{l.flag} {l.lang}</span>
                <span style={{ color: "var(--text-3)" }}>{l.count}</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: "var(--border)" }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: d.userCount > 0 ? `${(l.count / d.userCount) * 100}%` : "0%", background: l.color }}
                />
              </div>
            </div>
          ))}
          <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
            <p className="text-xs" style={{ color: "var(--text-3)" }}>
              📍 {d.locationCount} user{d.locationCount !== 1 ? "s" : ""} sharing location ·{" "}
              <Link href="/admin/locations" style={{ color: "var(--accent)" }}>View map →</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent signups */}
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          <div className="px-5 py-3.5 flex items-center justify-between" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
            <h2 className="font-semibold text-sm" style={{ color: "var(--text)" }}>Recent sign-ups</h2>
            <Link href="/admin/users" className="text-xs" style={{ color: "var(--accent)" }}>View all →</Link>
          </div>
          <div style={{ background: "var(--surface)" }}>
            {d.recentUsers.map((u: any, i: number) => (
              <div
                key={u.id}
                className="px-5 py-3 flex items-center gap-3"
                style={{ borderTop: i > 0 ? "1px solid var(--border)" : undefined }}
              >
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: "linear-gradient(135deg, #7c6aff, #4338ca)" }}
                >
                  {u.name?.[0]?.toUpperCase() ?? u.email[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>{u.name ?? "—"}</p>
                  <p className="text-xs truncate" style={{ color: "var(--text-3)" }}>{u.email}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-medium" style={{ color: "var(--text-2)" }}>
                    {LANG_FLAG[u.targetLanguage] ?? "🌍"} Lv {u.progress?.level ?? 1}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-3)" }}>
                    {new Date(u.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent game plays */}
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          <div className="px-5 py-3.5 flex items-center justify-between" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
            <h2 className="font-semibold text-sm" style={{ color: "var(--text)" }}>Recent game plays</h2>
            <Link href="/admin/analytics" className="text-xs" style={{ color: "var(--accent)" }}>Analytics →</Link>
          </div>
          <div style={{ background: "var(--surface)" }}>
            {d.recentGames.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm" style={{ color: "var(--text-3)" }}>No games played yet</div>
            ) : d.recentGames.map((g: any, i: number) => (
              <div
                key={g.id}
                className="px-5 py-3 flex items-center gap-3"
                style={{ borderTop: i > 0 ? "1px solid var(--border)" : undefined }}
              >
                <div className="text-xl flex-shrink-0">🎮</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>
                    {g.gameType.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase())}
                  </p>
                  <p className="text-xs truncate" style={{ color: "var(--text-3)" }}>
                    {g.user.name ?? g.user.email}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-semibold" style={{ color: "var(--accent)" }}>+{g.xpEarned} XP</p>
                  <p className="text-xs" style={{ color: "var(--text-3)" }}>
                    {new Date(g.playedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
