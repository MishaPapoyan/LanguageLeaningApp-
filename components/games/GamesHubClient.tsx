"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Layers, Link2, Puzzle, Shuffle, PenLine,
  CheckSquare, Keyboard, Headphones, MessagesSquare, AlignJustify,
  Map, Box, Briefcase,
  Network, Search, Clock, Mic, BookOpen, Radio, Mic2,
  Plane, Stethoscope, ShoppingBag, Hotel, Home, Play,
  type LucideIcon,
} from "lucide-react";

type FilterKey = "All" | "Vocabulary" | "Grammar" | "Listening" | "Immersive";

type Game = {
  href: string;
  gameType: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  difficulty: string;
  category: "vocabulary" | "grammar" | "listening" | "immersive";
  filterCategory: Exclude<FilterKey, "All">;
  xp: number;
};

const ICON_MAP: Record<string, LucideIcon> = {
  Layers, Link2, Puzzle, Shuffle, PenLine, CheckSquare, Keyboard,
  Headphones, MessagesSquare, AlignJustify, Map, Box, Home, Briefcase,
  Network, Search, Clock, Mic, BookOpen, Radio, Mic2, Plane, Stethoscope,
  ShoppingBag, Hotel,
};

export type SerializedGame = Omit<Game, "icon"> & { iconName: string };

const FILTERS: FilterKey[] = ["All", "Vocabulary", "Grammar", "Listening", "Immersive"];

export function GamesHubClient({ games }: { games: SerializedGame[] }) {
  const [filter, setFilter] = useState<FilterKey>("All");

  const filteredGames =
    filter === "All" ? games : games.filter((g) => g.filterCategory === filter);

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl mb-2">Practice Games</h1>
          <p className="text-white/40 text-lg">
            Master skills through interactive challenges.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 p-1 bg-white/5 rounded-full border border-white/10">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                filter === f
                  ? "bg-white text-black"
                  : "border border-white/10 text-white/50 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredGames.map((game) => {
          const Icon = ICON_MAP[game.iconName] ?? Layers;
          return (
            <Link
              key={game.href}
              href={game.href}
              className="card-premium p-6 group block relative overflow-hidden"
            >
              <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-[0.03] group-hover:opacity-[0.08] transition-opacity bg-white" />

              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-emerald-500 group-hover:bg-emerald-500/10 transition-all">
                  <Icon size={24} />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-2 py-0.5 border border-white/10 rounded">
                    {game.filterCategory}
                  </span>
                  <span className="text-[10px] font-bold text-amber-500 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                    +{game.xp} XP
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-2 italic serif relative z-10">
                {game.title}
              </h3>
              <p className="text-sm text-white/40 group-hover:text-white/60 transition-colors line-clamp-2 relative z-10">
                {game.desc}
              </p>

              <div className="mt-6 flex items-center justify-between relative z-10">
                <div className="flex -space-x-2 items-center">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full bg-white/5 border-2 border-black"
                    />
                  ))}
                  <span className="pl-4 text-[10px] text-white/20 font-bold uppercase py-1">
                    200+ Playing
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-emerald-500 flex items-center justify-center transition-all">
                  <Play
                    size={14}
                    className="text-white/40 group-hover:text-black transition-colors"
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
