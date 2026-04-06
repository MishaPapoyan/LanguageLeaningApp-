"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { getXpProgress } from "@/types";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Home, BookOpen, BookText, MessageCircle, Gamepad2, RotateCcw,
  BookMarked, Library, ChevronDown, Settings, BarChart3, TrendingUp,
  LogOut, Menu, X, Flame, Zap,
} from "lucide-react";

interface ProgressData { xp: number; level: number; streak: number; }

const NAV_LINKS = [
  { href: "/home",       label: "Home",       Icon: Home },
  { href: "/learn",      label: "Learn",      Icon: BookText },
  { href: "/stories",    label: "Stories",    Icon: BookOpen },
  { href: "/tutor",      label: "Tutor",      Icon: MessageCircle },
  { href: "/games",      label: "Games",      Icon: Gamepad2 },
  { href: "/review",     label: "Practice",   Icon: RotateCcw },
  { href: "/dictionary", label: "Dictionary", Icon: Library },
  { href: "/my-words",   label: "My Words",   Icon: BookMarked },
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

function isEmoji(str: string) {
  return /\p{Emoji}/u.test(str) && !/^[a-zA-Z0-9]$/.test(str);
}

export function AppNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [progress, setProgress] = useState<ProgressData | null>(_pcache?.data ?? null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProgress().then((p) => { if (p) setProgress(p); });
  }, []);

  useEffect(() => {
    function onXpUpdated() {
      _pcache = null;
      fetchProgress().then((p) => { if (p) setProgress(p); });
    }
    window.addEventListener("xp-updated", onXpUpdated);
    return () => window.removeEventListener("xp-updated", onXpUpdated);
  }, []);

  useEffect(() => { setMobileOpen(false); setDropOpen(false); }, [pathname]);

  useEffect(() => {
    if (!dropOpen) return;
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropOpen]);

  const xpInfo  = progress ? getXpProgress(progress.xp) : null;
  const rawXp   = progress?.xp ?? 0;

  const userImage = session?.user?.image ?? "";
  const userName  = session?.user?.name  ?? "User";
  const userEmail = session?.user?.email ?? "";

  const avatarIsEmoji = isEmoji(userImage);
  const avatarInitial = userName[0]?.toUpperCase() ?? "U";

  const DROPDOWN_ITEMS = [
    { href: "/settings",  label: "Settings",  Icon: Settings },
    { href: "/progress",  label: "Progress",  Icon: TrendingUp },
    { href: "/analytics", label: "Analytics", Icon: BarChart3 },
  ];

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        width: "100%",
        background: "var(--nav-bg)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 20px",
          height: 56,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {/* Logo */}
        <Link
          href="/home"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
            marginRight: 6,
            textDecoration: "none",
          }}
        >
          <span
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 900,
              color: "#fff",
              letterSpacing: "-0.5px",
              flexShrink: 0,
              boxShadow: "0 0 12px rgba(99,102,241,0.4)",
            }}
          >
            LF
          </span>
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "var(--text)",
              letterSpacing: "-0.3px",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
            className="hidden-xs"
          >
            LinguaFlow
            <span style={{ fontSize: 14 }}>🇫🇷</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav
          style={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}
          className="desktop-nav"
        >
          {NAV_LINKS.map(({ href, label, Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link key={href} href={href} className={active ? "nav-link active" : "nav-link"}>
                <Icon size={13} aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div style={{ flex: 1 }} className="desktop-spacer" />

        {/* XP + streak pills */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }} className="stats-row">
          {progress?.streak ? (
            <div className="stat-pill">
              <Flame size={13} style={{ color: "var(--gold)" }} aria-hidden="true" />
              <span style={{ color: "var(--gold)", fontWeight: 700, fontSize: 12 }}>
                {progress.streak}
              </span>
            </div>
          ) : null}

          {xpInfo && (
            <div className="stat-pill" style={{ gap: 7, paddingLeft: 10, paddingRight: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-2)" }}>
                Lv {xpInfo.level}
              </span>
              <div
                style={{
                  width: 72,
                  height: 4,
                  borderRadius: 999,
                  background: "rgba(128,128,128,0.15)",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: `${xpInfo.pct}%`,
                    background: "linear-gradient(90deg, var(--accent), var(--accent-2))",
                    borderRadius: 999,
                    transition: "width 0.7s cubic-bezier(.4,0,.2,1)",
                  }}
                />
              </div>
              <span style={{ fontSize: 11, color: "var(--text-3)", fontVariantNumeric: "tabular-nums" }}>
                {rawXp.toLocaleString()}
              </span>
              <Zap size={11} style={{ color: "var(--accent-2)" }} aria-hidden="true" />
            </div>
          )}
        </div>

        {/* Right group — always pinned to the right edge on all screen sizes */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Avatar + dropdown */}
        <div ref={dropRef} style={{ position: "relative" }}>
          <button
            onClick={() => setDropOpen(!dropOpen)}
            aria-label="User menu"
            aria-expanded={dropOpen}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "var(--surface-2)",
              border: "1px solid var(--border-md)",
              borderRadius: 999,
              padding: "3px 9px 3px 3px",
              cursor: "pointer",
              transition: "border-color 0.15s, box-shadow 0.15s",
              outline: "none",
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-dim)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = "none";
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--border-lg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-md)";
            }}
          >
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: avatarIsEmoji ? "var(--surface-3)" : "linear-gradient(135deg, #6366f1, #4f46e5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: avatarIsEmoji ? 15 : 11,
                fontWeight: 700,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {avatarIsEmoji ? userImage : avatarInitial}
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-2)",
                maxWidth: 68,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              className="hidden-xs"
            >
              {userName.split(" ")[0]}
            </span>
            <ChevronDown
              size={12}
              style={{
                color: "var(--text-3)",
                transform: dropOpen ? "rotate(180deg)" : "none",
                transition: "transform 0.15s",
              }}
              aria-hidden="true"
            />
          </button>

          {/* Dropdown */}
          {dropOpen && (
            <div
              role="menu"
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 6px)",
                width: 210,
                borderRadius: 14,
                padding: "5px",
                background: "var(--surface-2)",
                border: "1px solid var(--border-md)",
                boxShadow: "0 16px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)",
                zIndex: 100,
                animation: "fadeDropdown 0.1s ease",
              }}
            >
              {/* user info */}
              <div
                style={{
                  padding: "9px 11px 10px",
                  borderBottom: "1px solid var(--border)",
                  marginBottom: 3,
                }}
              >
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {userName}
                </p>
                <p style={{ fontSize: 11, color: "var(--text-3)", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {userEmail}
                </p>
              </div>

              {DROPDOWN_ITEMS.map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  role="menuitem"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 11px",
                    borderRadius: 9,
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--text-2)",
                    textDecoration: "none",
                    transition: "background 0.11s, color 0.11s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(128,128,128,0.09)";
                    e.currentTarget.style.color = "var(--text)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "";
                    e.currentTarget.style.color = "var(--text-2)";
                  }}
                >
                  <Icon size={13} style={{ color: "var(--text-3)", flexShrink: 0 }} aria-hidden="true" />
                  {label}
                </Link>
              ))}

              <div style={{ height: 1, background: "var(--border)", margin: "3px 0" }} />

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                role="menuitem"
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 11px",
                  borderRadius: 9,
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--red)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.11s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.07)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = ""; }}
              >
                <LogOut size={13} style={{ flexShrink: 0 }} aria-hidden="true" />
                Sign out
              </button>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          style={{
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            width: 34,
            height: 34,
            borderRadius: 9,
            background: mobileOpen ? "var(--accent-dim)" : "transparent",
            border: "1px solid var(--border)",
            cursor: "pointer",
            color: "var(--text-2)",
            flexShrink: 0,
            transition: "background 0.14s",
          }}
          className="hamburger-btn"
        >
          {mobileOpen ? <X size={17} /> : <Menu size={17} />}
        </button>

        </div>{/* end right group */}
      </div>

      {/* Mobile panel */}
      {mobileOpen && (
        <div
          style={{
            borderTop: "1px solid var(--border)",
            background: "var(--surface)",
            padding: "10px 14px 14px",
          }}
          className="mobile-panel"
        >
          {/* 4-col icon grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 5,
              marginBottom: 10,
            }}
          >
            {NAV_LINKS.map(({ href, label, Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "9px 4px",
                    borderRadius: 11,
                    fontSize: 11,
                    fontWeight: 600,
                    textAlign: "center",
                    textDecoration: "none",
                    gap: 5,
                    background: active ? "var(--accent-dim)" : "var(--surface-2)",
                    color: active ? "var(--accent-2)" : "var(--text-2)",
                    border: active ? "1px solid rgba(99,102,241,0.2)" : "1px solid var(--border)",
                    transition: "background 0.12s",
                    minHeight: 52,
                  }}
                >
                  <Icon size={15} aria-hidden="true" />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Mobile stats row */}
          {progress && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 12px",
                borderRadius: 11,
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
              }}
            >
              {progress.streak ? (
                <span style={{ fontSize: 12, color: "var(--gold)", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                  <Flame size={12} aria-hidden="true" /> {progress.streak}d streak
                </span>
              ) : null}
              {xpInfo && (
                <>
                  <span style={{ fontSize: 12, color: "var(--text-3)" }}>·</span>
                  <span style={{ fontSize: 12, color: "var(--text-2)" }}>Level {xpInfo.level}</span>
                  <div style={{ flex: 1, height: 4, borderRadius: 999, background: "rgba(128,128,128,0.15)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${xpInfo.pct}%`, background: "linear-gradient(90deg, var(--accent), var(--accent-2))", borderRadius: 999 }} />
                  </div>
                  <span style={{ fontSize: 11, color: "var(--text-3)", fontVariantNumeric: "tabular-nums", display: "flex", alignItems: "center", gap: 3 }}>
                    {rawXp.toLocaleString()} <Zap size={10} aria-hidden="true" />
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeDropdown {
          from { opacity:0; transform:translateY(-4px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </header>
  );
}
