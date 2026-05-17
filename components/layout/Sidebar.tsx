"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { getXpProgress } from "@/types";
import { t, getLocale, type TranslationKey } from "@/lib/i18n";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Home, BookOpen, MessageSquare, Gamepad2,
  Trophy, Users, Search, GraduationCap,
  Settings, LogOut, ChevronRight, Award,
  TrendingUp, BookMarked, PenLine, Menu, X,
  RotateCcw,
} from "lucide-react";

interface ProgressData { xp: number; level: number; streak: number; }

type NavEntry =
  | { groupKey: TranslationKey }
  | { id: string; href: string; icon: typeof Home; labelKey: TranslationKey };

const NAV_ITEMS: NavEntry[] = [
  { groupKey: "nav_secLearn" },
  { id: "dashboard",  href: "/home",       icon: Home,           labelKey: "nav_home" },
  { id: "path",       href: "/learn",      icon: GraduationCap,  labelKey: "nav_learn" },
  { id: "games",      href: "/games",      icon: Gamepad2,       labelKey: "nav_games" },
  { id: "tutor",      href: "/tutor",      icon: MessageSquare,  labelKey: "nav_tutor" },
  { id: "stories",    href: "/stories",    icon: BookOpen,       labelKey: "nav_stories" },
  { id: "writing",    href: "/writing",    icon: Award,          labelKey: "nav_writing" },
  { groupKey: "nav_secLibrary" },
  { id: "dictionary", href: "/dictionary", icon: Search,         labelKey: "nav_dictionary" },
  { id: "mywords",    href: "/my-words",   icon: BookMarked,     labelKey: "nav_myWords" },
  { id: "review",     href: "/review",     icon: RotateCcw,      labelKey: "nav_review" },
  { groupKey: "nav_secCommunity" },
  { id: "progress",   href: "/progress",   icon: TrendingUp,     labelKey: "nav_progress" },
  { id: "leaderboard",href: "/leaderboard",icon: Trophy,         labelKey: "nav_leaderboard" },
  { id: "community",  href: "/community",  icon: Users,          labelKey: "nav_community" },
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
  const locale = getLocale((session?.user as { nativeLanguage?: string })?.nativeLanguage);
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

  const pct = xpInfo ? Math.round((xpInfo.current / xpInfo.needed) * 100) : 0;

  return (
    <>
      {/* Mobile burger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 lv-btn lv-btn--ghost lv-btn--icon"
        aria-label={t(locale, "nav_openMenu")}
      >
        <Menu size={18} />
      </button>

      {/* Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40"
          style={{ background: "oklch(0.17 0.018 60 / 0.45)", backdropFilter: "blur(3px)" }}
        />
      )}

      <aside
        className={`${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:sticky top-0 left-0 z-50 lg:z-10 h-screen flex flex-col transition-transform duration-300`}
        style={{
          width: 248,
          background: "var(--paper)",
          borderRight: "1px solid var(--line)",
          padding: "24px 18px",
          overflowY: "auto",
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between" style={{ padding: "4px 10px 18px" }}>
          <Link href="/home" className="flex items-center" style={{ gap: 10, textDecoration: "none" }}>
            <svg viewBox="0 0 40 40" width={26} height={26} aria-hidden>
              <circle cx="20" cy="20" r="18" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
              <path d="M12 27 V13 H15 V24 H22" fill="none" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="27" cy="13" r="2.5" fill="var(--terracotta)" />
            </svg>
            <span style={{ fontFamily: "var(--display)", fontSize: 22, letterSpacing: "-0.02em", color: "var(--ink)", display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span>Ling<em style={{ fontStyle: "italic", color: "var(--terracotta)" }}>o</em>va</span>
              <span style={{ fontSize: 14 }}>{flag}</span>
            </span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden"
            style={{ color: "var(--ink-3)", background: "none", border: "none", cursor: "pointer" }}
            aria-label={t(locale, "nav_closeMenu")}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_ITEMS.map((item, i) => {
            if ("groupKey" in item) {
              return (
                <div
                  key={"g" + i}
                  style={{
                    fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.14em",
                    textTransform: "uppercase", color: "var(--ink-4)", padding: "14px 12px 6px",
                  }}
                >
                  {t(locale, item.groupKey)}
                </div>
              );
            }
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/home" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.id}
                href={item.href}
                className="lv-nav-item"
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "9px 12px", borderRadius: "var(--r-md)",
                  fontSize: 14, fontWeight: 450, textDecoration: "none",
                  background: active ? "var(--ink)" : "transparent",
                  color: active ? "var(--paper)" : "var(--ink-2)",
                  transition: "background 160ms, color 160ms",
                }}
                onMouseEnter={(e) => {
                  if (!active) { e.currentTarget.style.background = "var(--paper-2)"; e.currentTarget.style.color = "var(--ink)"; }
                }}
                onMouseLeave={(e) => {
                  if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--ink-2)"; }
                }}
              >
                <Icon size={17} style={{ flexShrink: 0, opacity: 0.85 }} />
                <span>{t(locale, item.labelKey)}</span>
              </Link>
            );
          })}
        </nav>

        {/* Profile card + stamps */}
        <div style={{ marginTop: "auto", paddingTop: 20 }}>
          <Link
            href={session?.user?.id ? `/community/${(session.user as { id?: string }).id}` : "/community"}
            style={{
              display: "block", textDecoration: "none",
              background: "var(--paper-2)", borderRadius: "var(--r-lg)", padding: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "var(--terracotta)", color: "#fff",
                  display: "grid", placeItems: "center",
                  fontFamily: "var(--display)", fontSize: avatarIsEmoji ? 18 : 16,
                  flexShrink: 0,
                }}
              >
                {avatarIsEmoji ? userImage : avatarInitial}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: 13.5, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userName}</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)" }}>Lv · {level}</div>
              </div>
            </div>
            <div className="lv-progress lv-progress--terra">
              <span style={{ width: `${pct}%` }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)" }}>
              <span>{(progress?.xp ?? 0).toLocaleString()} xp</span>
              <span>{xpInfo ? xpInfo.needed.toLocaleString() : "—"}</span>
            </div>
          </Link>

          {/* Actions + stamp row */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "14px 6px 0" }}>
            <Link
              href="/settings"
              style={{ padding: 7, color: "var(--ink-3)", borderRadius: 8, display: "flex", transition: "color 160ms" }}
              onMouseEnter={e => { e.currentTarget.style.color = "var(--ink)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "var(--ink-3)"; }}
              aria-label={t(locale, "nav_settings")}
            >
              <Settings size={17} />
            </Link>
            <ThemeToggle />
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              style={{ padding: 7, color: "var(--ink-3)", borderRadius: 8, background: "none", border: "none", cursor: "pointer", display: "flex", transition: "color 160ms" }}
              onMouseEnter={e => { e.currentTarget.style.color = "var(--terracotta)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "var(--ink-3)"; }}
              aria-label={t(locale, "nav_signOut")}
            >
              <LogOut size={17} />
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 10px 0", fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.14em", color: "var(--ink-4)", textTransform: "uppercase" }}>
            <span>EST · 2025</span>
            <span className="lv-dot" />
            <span>LV-001</span>
          </div>
        </div>
      </aside>
    </>
  );
}
