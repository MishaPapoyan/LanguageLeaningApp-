"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { getXpProgress } from "@/types";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Home, BookOpen, MessageSquare, Gamepad2,
  Trophy, Users, Search, GraduationCap,
  Settings, LogOut, ChevronRight, Award,
  TrendingUp, BookMarked, PenLine, Menu, X,
  RotateCcw,
} from "lucide-react";

interface ProgressData { xp: number; level: number; streak: number; }

const NAV_ITEMS: { id: string; href: string; icon: typeof Home; label: string }[] = [
  { id: "dashboard",  href: "/home",       icon: Home,           label: "Dashboard" },
  { id: "path",       href: "/learn",      icon: GraduationCap,  label: "Learning Path" },
  { id: "games",      href: "/games",      icon: Gamepad2,       label: "Games Hub" },
  { id: "tutor",      href: "/tutor",      icon: MessageSquare,  label: "AI Tutor" },
  { id: "stories",    href: "/stories",    icon: BookOpen,       label: "Stories" },
  { id: "writing",    href: "/writing",    icon: Award,          label: "Writing" },
  { id: "dictionary", href: "/dictionary", icon: Search,         label: "Dictionary" },
  { id: "mywords",    href: "/my-words",   icon: BookMarked,     label: "My Words" },
  { id: "review",     href: "/review",     icon: RotateCcw,      label: "Review" },
  { id: "progress",   href: "/progress",   icon: TrendingUp,     label: "Progress" },
  { id: "leaderboard",href: "/leaderboard",icon: Trophy,         label: "Leaderboard" },
  { id: "community",  href: "/community",  icon: Users,          label: "Community" },
];

const TARGET_LANG_FLAGS: Record<string, string> = {
  fr: "\u{1F1EB}\u{1F1F7}",
  es: "\u{1F1EA}\u{1F1F8}",
  en: "\u{1F1EC}\u{1F1E7}",
};

type PCache = { data: ProgressData; at: number } | null;

async function fetchProgress(cacheRef: React.MutableRefObject<PCache>): Promise<ProgressData | null> {
  if (cacheRef.current && Date.now() - cacheRef.current.at < 30_000) return cacheRef.current.data;
  try {
    const r = await fetch("/api/progress", { cache: "no-store" });
    const d = await r.json();
    if (d.progress) {
      cacheRef.current = { data: d.progress, at: Date.now() };
      return d.progress;
    }
  } catch {}
  return cacheRef.current?.data ?? null;
}

function isEmoji(str: string) {
  return /\p{Emoji}/u.test(str) && !/^[a-zA-Z0-9]$/.test(str);
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const pcacheRef = useRef<PCache>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { fetchProgress(pcacheRef).then(p => p && setProgress(p)); }, []);
  useEffect(() => {
    function onXp() {
      pcacheRef.current = null;
      setTimeout(() => fetchProgress(pcacheRef).then(p => p && setProgress(p)), 700);
    }
    window.addEventListener("xp-updated", onXp);
    return () => window.removeEventListener("xp-updated", onXp);
  }, []);
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const userImage  = session?.user?.image ?? "";
  const userName   = session?.user?.name ?? "User";
  const targetLang = (session?.user as { targetLanguage?: string })?.targetLanguage ?? "fr";
  const flag = TARGET_LANG_FLAGS[targetLang] ?? "\u{1F1EB}\u{1F1F7}";
  const xpInfo = progress ? getXpProgress(progress.xp) : null;
  const level = xpInfo?.level ?? 1;
  const avatarIsEmoji = isEmoji(userImage);
  const avatarInitial = userName[0]?.toUpperCase() ?? "U";

  return (
    <>
      {/* Mobile burger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        />
      )}

      <aside
        className={`${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:sticky top-0 left-0 z-50 lg:z-10 w-64 h-screen flex flex-col transition-transform duration-300`}
        style={{
          background: "var(--nav-bg)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRight: "1px solid var(--border)",
        }}
      >
        {/* Logo + close (mobile) */}
        <div className="px-6 py-5 flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-3" style={{ textDecoration: "none" }}>
            <span
              style={{
                width: 40, height: 40, borderRadius: 12,
                background: "var(--accent)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, fontWeight: 700, color: "#050505",
                fontFamily: "var(--font-display)", fontStyle: "italic",
                boxShadow: "0 0 24px rgba(16,185,129,0.45)",
                flexShrink: 0,
              }}
            >L</span>
            <span
              className="serif"
              style={{
                fontSize: 22, fontWeight: 700, color: "var(--text)",
                fontFamily: "var(--font-display)", fontStyle: "italic",
                letterSpacing: "-0.01em",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              Lingova
              <span style={{ fontSize: 16, fontStyle: "normal" }}>{flag}</span>
            </span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden"
            style={{ color: "var(--text-2)" }}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto" style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/home" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: active ? "rgba(255,255,255,0.08)" : "transparent",
                  color: active ? "var(--text)" : "var(--text-2)",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.color = "var(--text)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--text-2)";
                  }
                }}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Profile widget */}
        <div className="p-4" style={{ borderTop: "1px solid var(--border)" }}>
          <Link
            href={session?.user?.id ? `/community/${(session.user as { id?: string }).id}` : "/community"}
            className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
            style={{ textDecoration: "none" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <div
              style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "linear-gradient(135deg, var(--accent), #60a5fa)",
                padding: 1, flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: "100%", height: "100%", borderRadius: "50%",
                  background: "var(--bg)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: avatarIsEmoji ? 18 : 12,
                  fontWeight: 700, color: "var(--text)",
                  fontFamily: "var(--font-display)", fontStyle: avatarIsEmoji ? "normal" : "italic",
                }}
              >
                {avatarIsEmoji ? userImage : avatarInitial}
              </div>
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userName}</p>
              <p style={{ fontSize: 11, color: "var(--text-3)" }}>Level {level}</p>
            </div>
            <ChevronRight size={14} style={{ color: "var(--text-3)" }} />
          </Link>

          <div style={{ display: "flex", gap: 4, marginTop: 12, paddingLeft: 4 }}>
            <Link
              href="/settings"
              style={{
                padding: 8, color: "var(--text-3)", borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "color var(--dur-fast) var(--ease)",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = "var(--text)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "var(--text-3)"; }}
              aria-label="Settings"
            >
              <Settings size={18} />
            </Link>
            <ThemeToggle />
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              style={{
                padding: 8, color: "rgba(244,63,94,0.6)", borderRadius: 8,
                background: "transparent", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "color var(--dur-fast) var(--ease)",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = "rgb(244,63,94)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(244,63,94,0.6)"; }}
              aria-label="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
