import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

const ADMIN_NAV = [
  { href: "/admin",           label: "Overview",  emoji: "🏠" },
  { href: "/admin/users",     label: "Users",     emoji: "👥" },
  { href: "/admin/locations", label: "Locations", emoji: "📍" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/home");

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>

      {/* ── Mobile top bar (hidden on md+) ── */}
      <div
        className="flex md:hidden items-center gap-2 px-4 py-3 overflow-x-auto"
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <Link
          href="/home"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0"
          style={{ color: "var(--text-3)", background: "var(--surface-2)", border: "1px solid var(--border)" }}
        >
          ← App
        </Link>
        {ADMIN_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex-shrink-0"
            style={{ color: "var(--text-2)", background: "var(--surface-2)", border: "1px solid var(--border)" }}
          >
            <span>{item.emoji}</span>
            {item.label}
          </Link>
        ))}
      </div>

      {/* ── Desktop layout (sidebar + content) ── */}
      <div className="flex min-h-screen md:min-h-0">

        {/* Sidebar — hidden on mobile */}
        <aside
          className="hidden md:flex w-56 flex-shrink-0 flex-col sticky top-0 h-screen"
          style={{ background: "var(--surface)", borderRight: "1px solid var(--border)" }}
        >
          {/* Logo */}
          <div className="px-5 py-5 flex items-center gap-2.5" style={{ borderBottom: "1px solid var(--border)" }}>
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black"
              style={{ background: "linear-gradient(135deg, #7c6aff, #5b4fcf)" }}
            >
              LF
            </div>
            <div>
              <p className="text-xs font-bold" style={{ color: "var(--text)" }}>LinguaFlow</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>Admin</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-0.5">
            {ADMIN_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
                style={{ color: "var(--text-2)" }}
              >
                <span className="text-base">{item.emoji}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Back to app */}
          <div className="px-3 py-4" style={{ borderTop: "1px solid var(--border)" }}>
            <Link
              href="/home"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
              style={{ color: "var(--text-3)" }}
            >
              <span>←</span>
              Back to app
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0 flex flex-col">
          <header
            className="px-5 md:px-8 py-4 hidden md:flex items-center justify-between"
            style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)" }}
          >
            <div />
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: "linear-gradient(135deg, #7c6aff, #4338ca)" }}
              >
                {session.user.name?.[0]?.toUpperCase() ?? "A"}
              </div>
              <span className="text-sm" style={{ color: "var(--text-2)" }}>{session.user.name}</span>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
