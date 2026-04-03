"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { getXpProgress } from "@/types";

interface ProgressData { xp: number; level: number; streak: number; }

const NAV_LINKS = [
  { href: "/home",       label: "Home" },
  { href: "/learn",      label: "Learn" },
  { href: "/stories",    label: "Stories" },
  { href: "/tutor",      label: "Tutor" },
  { href: "/games",      label: "Games" },
  { href: "/review",     label: "Practice" },
  { href: "/dictionary", label: "Dictionary" },
  { href: "/my-words",   label: "My Words" },
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

/* ── SVG icons ──────────────────────────────────────────────────────────── */
function IconMenu({ open }: { open: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      {open ? (
        <>
          <line x1="3" y1="3" x2="15" y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="15" y1="3" x2="3" y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </>
      ) : (
        <>
          <line x1="3" y1="5"  x2="15" y2="5"  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="3" y1="9"  x2="15" y2="9"  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="3" y1="13" x2="15" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function IconChevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M13.3 6.6a1 1 0 0 0 .2-1.1l-1-1.7a1 1 0 0 0-1-.5l-1.2.2a5.2 5.2 0 0 0-.9-.5l-.3-1.2A1 1 0 0 0 8 1H6a1 1 0 0 0-1 .8l-.3 1.2a5.2 5.2 0 0 0-.9.5l-1.2-.2a1 1 0 0 0-1 .5l-1 1.7a1 1 0 0 0 .2 1.1l.9.8v1l-.9.8a1 1 0 0 0-.2 1.1l1 1.7a1 1 0 0 0 1 .5l1.2-.2c.3.2.6.4.9.5l.3 1.2A1 1 0 0 0 6 15h2a1 1 0 0 0 1-.8l.3-1.2c.3-.1.6-.3.9-.5l1.2.2a1 1 0 0 0 1-.5l1-1.7a1 1 0 0 0-.2-1.1l-.9-.8v-1l.9-.8Z" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function IconProgress() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M2 12V8M6 12V5M10 12V7M14 12V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconAnalytics() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 8L11.5 4.5M8 8V4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconSignOut() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── helpers ────────────────────────────────────────────────────────────── */
function isEmoji(str: string) {
  return /\p{Emoji}/u.test(str) && !/^[a-zA-Z0-9]$/.test(str);
}

/* ── component ──────────────────────────────────────────────────────────── */
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

  useEffect(() => { setMobileOpen(false); setDropOpen(false); }, [pathname]);

  /* close dropdown on outside click */
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
    { href: "/settings",  label: "Settings",  icon: <IconSettings /> },
    { href: "/progress",  label: "Progress",  icon: <IconProgress /> },
    { href: "/analytics", label: "Analytics", icon: <IconAnalytics /> },
  ];

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        width: "100%",
        background: "rgba(5,6,14,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* ── main bar ── */}
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 20px",
          height: 60,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {/* Logo */}
        <Link
          href="/home"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
            marginRight: 4,
            textDecoration: "none",
          }}
        >
          {/* gradient badge */}
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: "linear-gradient(135deg, #6366f1, #818cf8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 900,
              color: "#fff",
              letterSpacing: "-0.5px",
              flexShrink: 0,
              boxShadow: "0 0 16px rgba(99,102,241,0.45)",
            }}
          >
            LF
          </span>
          <span
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "var(--text)",
              letterSpacing: "-0.3px",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
            className="hidden-xs"
          >
            LinguaFlow
            <span style={{ fontSize: 16 }}>🇫🇷</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav
          style={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}
          className="desktop-nav"
        >
          {NAV_LINKS.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={active ? "nav-link active" : "nav-link"}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ flex: 1 }} className="desktop-spacer" />

        {/* XP + streak (desktop) */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }} className="stats-row">
          {progress?.streak ? (
            <div
              className="stat-pill"
              style={{ gap: 5 }}
            >
              <span style={{ fontSize: 13 }}>🔥</span>
              <span style={{ color: "var(--gold)", fontWeight: 700, fontSize: 13 }}>
                {progress.streak}
              </span>
            </div>
          ) : null}

          {xpInfo && (
            <div
              className="stat-pill"
              style={{ gap: 8, paddingLeft: 10, paddingRight: 10 }}
            >
              {/* level badge */}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--accent-2)",
                  letterSpacing: "0.2px",
                }}
              >
                Lv {xpInfo.level}
              </span>

              {/* shimmer xp bar */}
              <div
                style={{
                  width: 80,
                  height: 5,
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.07)",
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
                    boxShadow: "0 0 8px var(--accent-glow)",
                    transition: "width 0.7s cubic-bezier(.4,0,.2,1)",
                  }}
                />
                {/* shimmer overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)",
                    animation: "shimmer 2s linear infinite",
                    backgroundSize: "200% 100%",
                  }}
                />
              </div>

              <span style={{ fontSize: 11, color: "var(--text-3)", fontVariantNumeric: "tabular-nums" }}>
                {rawXp.toLocaleString()} xp
              </span>
            </div>
          )}
        </div>

        {/* Avatar + dropdown */}
        <div ref={dropRef} style={{ position: "relative", flexShrink: 0 }}>
          <button
            onClick={() => setDropOpen(!dropOpen)}
            aria-label="User menu"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "var(--surface-3)",
              border: "1px solid var(--border-md)",
              borderRadius: 999,
              padding: "4px 10px 4px 4px",
              cursor: "pointer",
              transition: "border-color 0.15s, box-shadow 0.15s",
              outline: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--border-lg)";
              e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-dim)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-md)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {/* avatar circle */}
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: avatarIsEmoji ? "var(--surface-4)" : "linear-gradient(135deg, #6366f1, #4338ca)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: avatarIsEmoji ? 16 : 12,
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
                maxWidth: 72,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              className="hidden-xs"
            >
              {userName.split(" ")[0]}
            </span>
            <span style={{ color: "var(--text-3)", display: "flex" }}>
              <IconChevron />
            </span>
          </button>

          {/* Dropdown */}
          {dropOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                width: 220,
                borderRadius: 16,
                padding: "6px",
                background: "var(--surface-2)",
                border: "1px solid var(--border-md)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)",
                zIndex: 100,
                animation: "fadeDropdown 0.12s ease",
              }}
            >
              {/* user info */}
              <div
                style={{
                  padding: "10px 12px 10px",
                  borderBottom: "1px solid var(--border)",
                  marginBottom: 4,
                }}
              >
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {userName}
                </p>
                <p style={{ fontSize: 11, color: "var(--text-3)", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {userEmail}
                </p>
              </div>

              {DROPDOWN_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    padding: "9px 12px",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--text-2)",
                    textDecoration: "none",
                    transition: "background 0.12s, color 0.12s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.color = "var(--text)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "";
                    e.currentTarget.style.color = "var(--text-2)";
                  }}
                >
                  <span style={{ color: "var(--text-3)", display: "flex", flexShrink: 0 }}>{item.icon}</span>
                  {item.label}
                </Link>
              ))}

              <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "9px 12px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--red)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.12s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = ""; }}
              >
                <span style={{ display: "flex", flexShrink: 0 }}><IconSignOut /></span>
                Sign out
              </button>
            </div>
          )}
        </div>

        {/* Mobile hamburger (hidden on lg) */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          style={{
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: 10,
            background: mobileOpen ? "var(--accent-dim)" : "transparent",
            border: "1px solid var(--border)",
            cursor: "pointer",
            color: "var(--text-2)",
            flexShrink: 0,
            transition: "background 0.15s",
          }}
          className="hamburger-btn"
        >
          <IconMenu open={mobileOpen} />
        </button>
      </div>

      {/* ── Mobile slide-down panel ── */}
      {mobileOpen && (
        <div
          style={{
            borderTop: "1px solid var(--border)",
            background: "var(--surface)",
            padding: "12px 16px 16px",
          }}
          className="mobile-panel"
        >
          {/* 4-col grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 6,
              marginBottom: 12,
            }}
          >
            {NAV_LINKS.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "10px 4px",
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 600,
                    textAlign: "center",
                    textDecoration: "none",
                    background: active ? "var(--accent-dim)" : "var(--surface-2)",
                    color: active ? "var(--accent)" : "var(--text-2)",
                    border: active ? "1px solid rgba(99,102,241,0.2)" : "1px solid var(--border)",
                    transition: "background 0.12s, color 0.12s",
                    minHeight: 52,
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* mobile stats row */}
          {progress && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                borderRadius: 12,
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
              }}
            >
              {progress.streak ? (
                <span style={{ fontSize: 12, color: "var(--gold)", fontWeight: 700 }}>
                  🔥 {progress.streak} day streak
                </span>
              ) : null}
              {xpInfo && (
                <>
                  <span style={{ fontSize: 12, color: "var(--text-3)" }}>·</span>
                  <span style={{ fontSize: 12, color: "var(--text-2)" }}>
                    Level {xpInfo.level}
                  </span>
                  <div style={{ flex: 1, height: 4, borderRadius: 999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${xpInfo.pct}%`,
                        background: "linear-gradient(90deg, var(--accent), var(--accent-2))",
                        borderRadius: 999,
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 11, color: "var(--text-3)", fontVariantNumeric: "tabular-nums" }}>
                    {rawXp.toLocaleString()} xp
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* scoped styles */}
      <style>{`
        @media (max-width: 1023px) {
          .desktop-nav    { display: none !important; }
          .desktop-spacer { display: none !important; }
          .stats-row      { display: none !important; }
          .hamburger-btn  { display: flex !important; }
          .mobile-panel   { display: block; }
        }
        @media (max-width: 479px) {
          .hidden-xs { display: none !important; }
        }
        @media (min-width: 1024px) {
          .hamburger-btn { display: none !important; }
          .mobile-panel  { display: none !important; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        @keyframes fadeDropdown {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  );
}
