"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

const NAV_SECTIONS = [
  {
    title: "Learn",
    items: [
      { href: "/home", icon: "⌂", label: "Home" },
      { href: "/learn", icon: "◈", label: "Path" },
      { href: "/stories", icon: "▤", label: "Stories" },
      { href: "/tutor", icon: "◉", label: "Tutor" },
    ],
  },
  {
    title: "Practice",
    items: [
      { href: "/review", icon: "↻", label: "Review" },
      { href: "/my-words", icon: "⊕", label: "My Words" },
      { href: "/writing", icon: "✎", label: "Write" },
      { href: "/games", icon: "△", label: "Games" },
      { href: "/pronunciation", icon: "♪", label: "Speak" },
    ],
  },
  {
    title: "Track",
    items: [
      { href: "/dictionary", icon: "⊞", label: "Words" },
      { href: "/progress", icon: "◐", label: "Progress" },
      { href: "/analytics", icon: "▥", label: "Analytics" },
      { href: "/leaderboard", icon: "⚑", label: "Ranks" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      className={`hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-30 bg-white dark:bg-zinc-900 border-r border-zinc-100 dark:border-zinc-800 transition-all duration-300 ease-in-out ${
        expanded ? "w-[200px]" : "w-[68px]"
      }`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-zinc-50 dark:border-zinc-800">
        <Link href="/home" className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            LF
          </div>
          <span className={`font-serif text-xl text-zinc-900 dark:text-zinc-100 whitespace-nowrap transition-opacity duration-200 ${expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
            LinguaFlow
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto scrollbar-hide">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="mb-4">
            <div className={`px-4 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-300 dark:text-zinc-600 transition-opacity duration-200 ${expanded ? "opacity-100" : "opacity-0"}`}>
              {section.title}
            </div>
            <div className="space-y-0.5 px-2">
              {section.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    className={`flex items-center gap-3 h-10 rounded-xl transition-all duration-150 ${
                      expanded ? "px-3" : "px-0 justify-center"
                    } ${
                      active
                        ? "bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-400"
                        : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <span className={`text-base font-medium flex-shrink-0 ${active ? "text-violet-600 dark:text-violet-400" : ""}`} style={{ fontFamily: "system-ui" }}>
                      {item.icon}
                    </span>
                    <span className={`text-[13px] font-medium whitespace-nowrap transition-opacity duration-200 ${expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
                      {item.label}
                    </span>
                    {active && !expanded && (
                      <div className="absolute left-0 w-[3px] h-5 rounded-r-full bg-violet-500" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {session?.user?.role === "TEACHER" && (
          <div className="px-2 mt-2">
            <Link
              href="/teacher"
              className={`flex items-center gap-3 h-10 rounded-xl transition-all duration-150 ${
                expanded ? "px-3" : "px-0 justify-center"
              } ${
                pathname === "/teacher"
                  ? "bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-400"
                  : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              <span className="text-base" style={{ fontFamily: "system-ui" }}>♟</span>
              <span className={`text-[13px] font-medium whitespace-nowrap transition-opacity duration-200 ${expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
                Teacher
              </span>
            </Link>
          </div>
        )}
      </nav>

      {/* Bottom */}
      <div className="border-t border-zinc-50 dark:border-zinc-800 p-2">
        <Link
          href="/settings"
          className={`flex items-center gap-3 h-10 rounded-xl transition-all duration-150 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-zinc-800 ${
            expanded ? "px-3" : "px-0 justify-center"
          }`}
        >
          <span className="text-base" style={{ fontFamily: "system-ui" }}>⚙</span>
          <span className={`text-[13px] font-medium whitespace-nowrap transition-opacity duration-200 ${expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
            Settings
          </span>
        </Link>
        <div className={`flex items-center gap-3 h-10 rounded-xl px-2 mt-1 ${expanded ? "" : "justify-center"}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          {expanded && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate">{session?.user?.name}</p>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-[11px] text-zinc-400 hover:text-rose-500 transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
