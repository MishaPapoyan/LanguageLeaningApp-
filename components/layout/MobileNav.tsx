"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/home",    icon: "⌂",  label: "Home"    },
  { href: "/learn",   icon: "◈",  label: "Learn"   },
  { href: "/my-words",icon: "⊕",  label: "Words"   },
  { href: "/tutor",   icon: "◉",  label: "Tutor"   },
  { href: "/games",   icon: "△",  label: "Games"   },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-0"
      style={{ background: "transparent" }}
    >
      <div
        className="flex items-center justify-around rounded-2xl px-2 py-2"
        style={{
          background: "rgba(13,14,24,0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid var(--border-md)",
          boxShadow: "0 -4px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
        }}
      >
        {ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-150 active:scale-90"
              style={{
                background: active ? "var(--accent-dim)" : "transparent",
                color: active ? "var(--accent)" : "var(--text-3)",
              }}
            >
              <span className="text-base leading-none" style={{ fontFamily: "system-ui" }}>
                {item.icon}
              </span>
              <span className="text-[10px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
