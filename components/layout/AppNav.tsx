"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { getXpProgress } from "@/types";
import { ThemeToggle } from "@/components/ThemeToggle";

interface ProgressData { xp: number; level: number; streak: number; }

const NAV_LINKS = [
  { href: "/home",         label: "Home" },
  { href: "/learn",        label: "Learn" },
  { href: "/stories",      label: "Stories" },
  { href: "/tutor",        label: "Tutor" },
  { href: "/games",        label: "Games" },
  { href: "/review",       label: "Practice" },
  { href: "/dictionary",   label: "Dictionary" },
  { href: "/my-words",     label: "My Words" },
  // Teacher hidden for now: { href: "/teacher", label: "Teacher" },
];

let _pcache: { data: ProgressData; at: number } | null = null;

async function fetchProgress(): Promise<ProgressData | null> {
  if (_pcache && Date.now() - _pcache.at < 30_000) return _pcache.data;
  try {
    const r = await fetch("/api/progress");
    const d = await r.json();
    if (d.progress) { _pcache = { data: d.progress, at: Date.now() }; return d.progress; }
  } catch { /* ignore */ }
  return _pcache?.data ?? null;
}

export function AppNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [progress, setProgress] = useState<ProgressData | null>(_pcache?.data ?? null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetchProgress().then((p) => { if (p) setProgress(p); });
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const xpInfo = progress ? getXpProgress(progress.xp) : null;

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: "rgba(7,8,15,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="max-w-[1080px] mx-auto px-4 md:px-8 h-14 flex items-center gap-4">

        {/* Logo */}
        <Link href="/home" className="flex items-center gap-2.5 flex-shrink-0 mr-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black"
            style={{ background: "linear-gradient(135deg, #7c6aff, #5b4fcf)" }}
          >
            LF
          </div>
          <span className="hidden sm:block text-sm font-bold" style={{ color: "var(--text)" }}>
            LinguaFlow
          </span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-1">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link"
                style={active ? {
                  background: "var(--accent-dim)",
                  color: "var(--accent)",
                } : {}}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1 lg:flex-none" />

        {/* Stats */}
        <div className="hidden sm:flex items-center gap-2">
          {progress?.streak ? (
            <div className="stat-pill">
              <span className="animate-streak-flame inline-block">🔥</span>
              <span style={{ color: "var(--gold)" }}>{progress.streak}</span>
            </div>
          ) : null}
          {xpInfo && (
            <div className="stat-pill gap-2">
              <span>Lv {xpInfo.level}</span>
              <div className="w-14 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${xpInfo.pct}%`,
                    background: "linear-gradient(90deg, #7c6aff, #a78bfa)",
                    boxShadow: "0 0 6px rgba(167,139,250,0.7)",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <ThemeToggle />

        {/* Avatar + dropdown */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 transition-transform hover:scale-105"
            style={{ background: "linear-gradient(135deg, #7c6aff, #4338ca)" }}
          >
            {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-10 w-48 rounded-2xl p-1 z-50"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border-md)", boxShadow: "0 16px 48px rgba(0,0,0,0.6)" }}
            >
              <div className="px-3 py-2 border-b mb-1" style={{ borderColor: "var(--border)" }}>
                <p className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>{session?.user?.name}</p>
                <p className="text-xs truncate" style={{ color: "var(--text-3)" }}>{session?.user?.email}</p>
              </div>
              {[
                { href: "/settings", label: "Settings" },
                { href: "/progress", label: "Progress" },
                { href: "/analytics", label: "Analytics" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors"
                  style={{ color: "var(--text-2)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                >
                  {item.label}
                </Link>
              ))}
              <div className="divider my-1" />
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors text-left"
                style={{ color: "var(--red)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--red-dim)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "")}
              >
                Sign out
              </button>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden btn-ghost p-2"
        >
          <div className="w-4 h-3 flex flex-col justify-between">
            <span className="h-0.5 w-full rounded-full" style={{ background: "var(--text-2)" }} />
            <span className="h-0.5 w-full rounded-full" style={{ background: "var(--text-2)" }} />
            <span className="h-0.5 w-full rounded-full" style={{ background: "var(--text-2)" }} />
          </div>
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div
          className="lg:hidden border-t px-4 py-3 grid grid-cols-3 gap-1.5"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="py-2.5 px-3 rounded-xl text-sm font-medium text-center transition-colors"
                style={{
                  background: active ? "var(--accent-dim)" : "transparent",
                  color: active ? "var(--accent)" : "var(--text-2)",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
