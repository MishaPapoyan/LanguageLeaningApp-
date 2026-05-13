"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/* ── SVG icons ──────────────────────────────────────────────────────────── */
function IconHome({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M3 9.5L10 3l7 6.5V17a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5Z"
        stroke="currentColor"
        strokeWidth={active ? "1.8" : "1.5"}
        strokeLinejoin="round"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.15 : 0}
      />
      <path
        d="M7.5 18v-5.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5V18"
        stroke="currentColor"
        strokeWidth={active ? "1.8" : "1.5"}
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconBook({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M3 5a2 2 0 0 1 2-2h4.5v14H5a2 2 0 0 1-2-2V5Z"
        stroke="currentColor"
        strokeWidth={active ? "1.8" : "1.5"}
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.12 : 0}
      />
      <path
        d="M9.5 3H15a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9.5V3Z"
        stroke="currentColor"
        strokeWidth={active ? "1.8" : "1.5"}
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.12 : 0}
      />
      <line x1="9.5" y1="3" x2="9.5" y2="17" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function IconGamepad({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect
        x="2" y="6" width="16" height="10" rx="4"
        stroke="currentColor"
        strokeWidth={active ? "1.8" : "1.5"}
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.12 : 0}
      />
      <line x1="6" y1="9.5" x2="6" y2="12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="4.5" y1="11" x2="7.5" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="13" cy="10" r="0.75" fill="currentColor" />
      <circle cx="14.5" cy="11.5" r="0.75" fill="currentColor" />
    </svg>
  );
}

function IconChat({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M3 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6.5L3 17V4Z"
        stroke="currentColor"
        strokeWidth={active ? "1.8" : "1.5"}
        strokeLinejoin="round"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.12 : 0}
      />
      <line x1="7" y1="8"  x2="13" y2="8"  stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="7" y1="11" x2="11" y2="11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function IconBookmark({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M5 3h10a1 1 0 0 1 1 1v12.5l-6-3.5-6 3.5V4a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth={active ? "1.8" : "1.5"}
        strokeLinejoin="round"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.15 : 0}
      />
    </svg>
  );
}

/* ── nav items ──────────────────────────────────────────────────────────── */
const ITEMS = [
  {
    href:  "/home",
    label: "Home",
    icon:  (a: boolean) => <IconHome active={a} />,
  },
  {
    href:  "/learn",
    label: "Learn",
    icon:  (a: boolean) => <IconBook active={a} />,
  },
  {
    href:  "/games",
    label: "Games",
    icon:  (a: boolean) => <IconGamepad active={a} />,
  },
  {
    href:  "/tutor",
    label: "Tutor",
    icon:  (a: boolean) => <IconChat active={a} />,
  },
  {
    href:  "/my-words",
    label: "My Words",
    icon:  (a: boolean) => <IconBookmark active={a} />,
  },
];

/* ── component ──────────────────────────────────────────────────────────── */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <>
      {/* bottom safe-area spacer so content isn't hidden behind the nav */}
      <div style={{ height: 80 }} className="mobile-nav-spacer" aria-hidden="true" />

      <nav
        aria-label="Mobile navigation"
        style={{
          position: "fixed",
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        className="mobile-nav-pill-wrapper"
      >
        {/* frosted glass pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "8px 16px",
            borderRadius: 999,
            background: "rgba(11,13,26,0.92)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow:
              "0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04), 0 0 24px rgba(16,185,129,0.08)",
          }}
        >
          {ITEMS.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 3,
                  minWidth: 52,
                  minHeight: 52,
                  padding: "6px 10px",
                  borderRadius: 999,
                  textDecoration: "none",
                  position: "relative",
                  transition: "transform 0.15s cubic-bezier(.4,0,.2,1)",
                  /* active pill bg */
                  background: active ? "var(--accent-dim)" : "transparent",
                  color: active ? "var(--accent)" : "var(--text-3)",
                  /* border only on active */
                  border: active ? "1px solid rgba(16,185,129,0.22)" : "1px solid transparent",
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.color = "var(--text-2)";
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.color = "var(--text-3)";
                }}
              >
                {/* icon */}
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    lineHeight: 1,
                    /* subtle glow on active */
                    filter: active ? "drop-shadow(0 0 6px var(--accent-glow))" : "none",
                    transition: "filter 0.2s",
                  }}
                >
                  {item.icon(active)}
                </span>

                {/* label */}
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: active ? 700 : 500,
                    letterSpacing: "0.1px",
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.label}
                </span>

                {/* active dot indicator */}
                {active && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: -6,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      background: "var(--accent)",
                      boxShadow: "0 0 6px var(--accent-glow)",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* scoped styles */}
      <style>{`
        @media (min-width: 1024px) {
          .mobile-nav-pill-wrapper { display: none !important; }
          .mobile-nav-spacer       { display: none !important; }
        }
      `}</style>
    </>
  );
}
