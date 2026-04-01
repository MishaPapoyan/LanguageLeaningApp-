"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getXpProgress } from "@/types";
import { ThemeToggle } from "@/components/ThemeToggle";

interface ProgressData {
  xp: number;
  level: number;
  streak: number;
}

const PAGE_TITLES: Record<string, string> = {
  "/home": "Dashboard",
  "/learn": "Learning Path",
  "/stories": "Stories",
  "/dictionary": "Dictionary",
  "/tutor": "AI Tutor",
  "/review": "Review",
  "/my-words": "My Words",
  "/writing": "Writing",
  "/games": "Games",
  "/pronunciation": "Pronunciation",
  "/leaderboard": "Leaderboard",
  "/analytics": "Analytics",
  "/progress": "Progress",
  "/settings": "Settings",
  "/teacher": "Teacher",
};

// Module-level cache — survives client-side navigation (component remounts)
let _cached: { data: ProgressData; at: number } | null = null;
const CACHE_TTL = 30_000; // 30 s

async function fetchProgress(): Promise<ProgressData | null> {
  if (_cached && Date.now() - _cached.at < CACHE_TTL) return _cached.data;
  try {
    const r = await fetch("/api/progress");
    const d = await r.json();
    if (d.progress) {
      _cached = { data: d.progress, at: Date.now() };
      return d.progress;
    }
  } catch {
    // ignore
  }
  return _cached?.data ?? null;
}

export function TopNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [progress, setProgress] = useState<ProgressData | null>(_cached?.data ?? null);

  useEffect(() => {
    fetchProgress().then((p) => { if (p) setProgress(p); });
  }, []);

  const xpInfo = progress ? getXpProgress(progress.xp) : null;
  const title = PAGE_TITLES[pathname] ?? PAGE_TITLES[pathname.split("/").slice(0, 2).join("/")] ?? "";

  return (
    <header className="h-14 flex items-center px-6 gap-4 sticky top-0 z-10 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-transparent dark:border-zinc-800/50">
      <h1 className="font-serif text-xl text-zinc-900 dark:text-zinc-100">{title}</h1>

      <div className="flex-1" />

      <div className="hidden sm:flex items-center gap-2">
        {progress && progress.streak > 0 && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 text-xs font-semibold">
            <span className="animate-streak-flame inline-block text-sm">🔥</span>
            {progress.streak}
          </div>
        )}
        {xpInfo && (
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400 text-xs font-semibold">
            Lv.{xpInfo.level}
            <div className="w-12 h-1.5 rounded-full bg-violet-100 dark:bg-violet-900 overflow-hidden">
              <div className="h-full rounded-full bg-violet-400 transition-all duration-700" style={{ width: `${xpInfo.pct}%` }} />
            </div>
          </div>
        )}
        {progress && (
          <div className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-semibold">
            {progress.xp} XP
          </div>
        )}
      </div>

      <ThemeToggle />
    </header>
  );
}
