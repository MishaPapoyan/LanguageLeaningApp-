import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminOverview() {
  let userCount = 0, locationCount = 0, activeToday = 0, totalXp = 0;
  let recentUsers: Awaited<ReturnType<typeof prisma.user.findMany>> = [];

  try {
    const [uc, lc, totalXpAgg, ru, at] = await Promise.all([
      prisma.user.count(),
      prisma.userLocation.count(),
      prisma.progress.aggregate({ _sum: { xp: true } }),
      prisma.user.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        select: {
          id: true, name: true, email: true, role: true, createdAt: true,
          progress: { select: { xp: true, level: true, streak: true } },
          location: { select: { city: true, country: true } },
        },
      }),
      prisma.progress.count({
        where: { lastActive: { gte: new Date(Date.now() - 86400000) } },
      }),
    ]);
    userCount = uc; locationCount = lc; activeToday = at;
    totalXp = totalXpAgg._sum.xp ?? 0;
    recentUsers = ru;
  } catch (err) {
    console.error("[admin] DB error:", err);
  }

  const stats = [
    { label: "Total users",       value: userCount,       emoji: "👥", href: "/admin/users" },
    { label: "Active today",      value: activeToday,     emoji: "🟢", href: "/admin/users" },
    { label: "Locations tracked", value: locationCount,   emoji: "📍", href: "/admin/locations" },
    { label: "Total XP earned",   value: totalXp.toLocaleString(), emoji: "⚡", href: null },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl mb-1" style={{ color: "var(--text)" }}>Overview</h1>
      <p className="text-sm mb-8" style={{ color: "var(--text-3)" }}>
        {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => {
          const inner = (
            <div
              className="rounded-2xl p-5"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <p className="text-2xl mb-2">{s.emoji}</p>
              <p className="text-2xl font-bold font-serif" style={{ color: "var(--text)" }}>{s.value}</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>{s.label}</p>
            </div>
          );
          return s.href ? (
            <Link key={s.label} href={s.href} className="block hover:opacity-80 transition-opacity">{inner}</Link>
          ) : (
            <div key={s.label}>{inner}</div>
          );
        })}
      </div>

      {/* Recent users */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}
        >
          <h2 className="font-semibold text-sm" style={{ color: "var(--text)" }}>Recent sign-ups</h2>
          <Link href="/admin/users" className="text-xs" style={{ color: "var(--accent)" }}>View all →</Link>
        </div>
        <div style={{ background: "var(--surface)" }}>
          {recentUsers.map((u, i) => (
            <div
              key={u.id}
              className="px-6 py-3.5 flex items-center gap-4"
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
              <div className="text-right hidden sm:block">
                <p className="text-xs font-medium" style={{ color: "var(--text-2)" }}>
                  Lv {u.progress?.level ?? 1} · {u.progress?.xp ?? 0} XP
                </p>
                {u.location?.city && (
                  <p className="text-xs" style={{ color: "var(--text-3)" }}>
                    📍 {u.location.city}{u.location.country ? `, ${u.location.country}` : ""}
                  </p>
                )}
              </div>
              <span
                className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex-shrink-0"
                style={{
                  background: u.role === "ADMIN" ? "var(--red-dim)" : u.role === "TEACHER" ? "var(--accent-dim)" : "rgba(255,255,255,0.06)",
                  color: u.role === "ADMIN" ? "var(--red)" : u.role === "TEACHER" ? "var(--accent)" : "var(--text-3)",
                }}
              >
                {u.role.toLowerCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
