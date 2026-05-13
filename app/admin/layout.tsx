import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

const ADMIN_NAV = [
  { href: "/admin",            label: "Overview",   emoji: "🏠" },
  { href: "/admin/users",      label: "Users",      emoji: "👥" },
  { href: "/admin/analytics",  label: "Analytics",  emoji: "📊" },
  { href: "/admin/groups",     label: "Classrooms", emoji: "🏫" },
  { href: "/admin/locations",  label: "Locations",  emoji: "📍" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/home");

  const initial = session.user.name?.[0]?.toUpperCase() ?? "A";

  return (
    <>
      <style>{`
        .admin-wrap { display: flex; min-height: 100vh; background: var(--bg); }
        .admin-sidebar { width: 220px; flex-shrink: 0; display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh; background: var(--surface); border-right: 1px solid var(--border); }
        .admin-mobile-bar { display: none; }
        .admin-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
        .admin-content { flex: 1; padding: 32px; }
        @media (max-width: 768px) {
          .admin-wrap { flex-direction: column; }
          .admin-sidebar { display: none; }
          .admin-mobile-bar {
            display: flex; align-items: center; gap: 8px;
            padding: 10px 16px; overflow-x: auto;
            background: var(--surface); border-bottom: 1px solid var(--border);
            position: sticky; top: 0; z-index: 40;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .admin-mobile-bar::-webkit-scrollbar { display: none; }
          .admin-content { padding: 16px; }
        }
      `}</style>

      <div className="admin-wrap">

        {/* Desktop sidebar */}
        <aside className="admin-sidebar">
          <div style={{ padding: "20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 9, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "#050505", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)", fontStyle: "italic", boxShadow: "0 0 16px rgba(16,185,129,0.4)" }}>L</div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 800, color: "var(--text)", margin: 0 }}>Lingova</p>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)", margin: 0 }}>Admin</p>
            </div>
          </div>
          <nav style={{ flex: 1, padding: "12px 10px" }}>
            {ADMIN_NAV.map(item => (
              <Link key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "var(--text-2)", textDecoration: "none", marginBottom: 2 }}>
                <span style={{ fontSize: 15 }}>{item.emoji}</span>{item.label}
              </Link>
            ))}
          </nav>
          <div style={{ padding: "12px 10px", borderTop: "1px solid var(--border)" }}>
            <Link href="/home" style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 10, fontSize: 12, color: "var(--text-3)", textDecoration: "none", fontWeight: 600 }}>
              ← Back to app
            </Link>
          </div>
        </aside>

        {/* Mobile top bar */}
        <div className="admin-mobile-bar">
          <Link href="/home" style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 99, background: "var(--surface-2)", border: "1px solid var(--border)", fontSize: 12, fontWeight: 700, color: "var(--text-3)", textDecoration: "none", whiteSpace: "nowrap" }}>
            ← App
          </Link>
          {ADMIN_NAV.map(item => (
            <Link key={item.href} href={item.href} style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 99, background: "var(--surface-2)", border: "1px solid var(--border)", fontSize: 12, fontWeight: 700, color: "var(--text-2)", textDecoration: "none", whiteSpace: "nowrap" }}>
              {item.emoji} {item.label}
            </Link>
          ))}
          <div style={{ marginLeft: "auto", flexShrink: 0, width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #10b981, var(--accent-press))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 800 }}>
            {initial}
          </div>
        </div>

        {/* Main content */}
        <div className="admin-main">
          <div className="admin-content">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
