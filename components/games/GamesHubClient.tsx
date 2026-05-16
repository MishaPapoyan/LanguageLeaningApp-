"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Layers, Link2, Puzzle, Shuffle, PenLine,
  CheckSquare, Keyboard, Headphones, MessagesSquare, AlignJustify,
  Map, Box, Briefcase,
  Network, Search, Clock, Mic, BookOpen, Radio, Mic2,
  Plane, Stethoscope, ShoppingBag, Hotel, Home, Play, ArrowRight,
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

// Tone rotation for the Field Guide accent system
const CATEGORY_TONE: Record<string, "terra" | "marine" | "lime"> = {
  vocabulary: "terra",
  grammar: "marine",
  listening: "lime",
  immersive: "terra",
};

function toneStyles(tone: "terra" | "marine" | "lime") {
  if (tone === "marine") {
    return { bg: "var(--marine-soft)", fg: "var(--marine)" };
  }
  if (tone === "lime") {
    return { bg: "var(--lime)", fg: "var(--ink)" };
  }
  return { bg: "var(--terracotta-soft)", fg: "var(--terracotta)" };
}

export function GamesHubClient({ games }: { games: SerializedGame[] }) {
  const [filter, setFilter] = useState<FilterKey>("All");

  const filteredGames =
    filter === "All" ? games : games.filter((g) => g.filterCategory === filter);

  const featured = games[0];
  const FeaturedIcon = featured ? ICON_MAP[featured.iconName] ?? Layers : Layers;

  return (
    <div className="space-y-12">
      {/* ===== Header ===== */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="mono-sm" style={{ color: "var(--ink-3)", marginBottom: 10 }}>
            § The arcade · {games.length} games
          </div>
          <h1
            className="serif"
            style={{ fontSize: 52, lineHeight: 1, letterSpacing: "-0.02em", margin: "0 0 10px" }}
          >
            Pick your <em className="serif-i" style={{ color: "var(--terracotta)" }}>poison.</em>
          </h1>
          <p style={{ color: "var(--ink-3)", fontSize: 17, maxWidth: 460 }}>
            Every game feeds your XP, your streak, and — yes — your fluency.
          </p>
        </div>
      </header>

      {/* ===== Featured row ===== */}
      {featured && (
        <section
          className="grid grid-cols-1 lg:grid-cols-3 gap-4"
          style={{ marginBottom: 8 }}
        >
          <Link
            href={featured.href}
            className="lv-card lv-card--ink lv-card--hover lg:col-span-2"
            style={{ padding: 36, position: "relative", overflow: "hidden", display: "block" }}
          >
            <span
              className="lv-sticker"
              style={{ transform: "rotate(3deg)", color: "var(--lime)" }}
            >
              Featured · {featured.filterCategory}
            </span>
            <div
              className="serif"
              style={{
                fontSize: 52,
                lineHeight: 1,
                letterSpacing: "-0.02em",
                margin: "20px 0 12px",
              }}
            >
              {featured.title}{" "}
              <em className="serif-i" style={{ color: "var(--lime)" }}>now.</em>
            </div>
            <p style={{ color: "var(--paper-3)", maxWidth: 380, marginBottom: 24 }}>
              {featured.desc}
            </p>
            <span className="lv-btn lv-btn--lime">
              Play · +{featured.xp} XP <ArrowRight size={16} />
            </span>
          </Link>

          <div
            className="lv-card"
            style={{
              padding: 28,
              background: "var(--terracotta)",
              color: "#fff",
              borderColor: "var(--terracotta)",
            }}
          >
            <span className="mono-sm" style={{ color: "oklch(0.96 0.02 50 / 0.7)" }}>
              Daily challenge
            </span>
            <div
              className="serif"
              style={{ fontSize: 34, lineHeight: 1.1, marginTop: 8 }}
            >
              Keep the streak alive
            </div>
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 8 }}>
              Play any game today to bank XP and protect your streak.
            </div>
            <div
              className="lv-progress lv-progress--lime"
              style={{ marginTop: 18 }}
              role="presentation"
            >
              <span style={{ width: "42%" }} />
            </div>
            <div
              style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}
            >
              <span className="mono-sm" style={{ color: "oklch(0.96 0.02 50 / 0.7)" }}>
                {games.length} games
              </span>
              <span className="mono-sm" style={{ color: "oklch(0.96 0.02 50 / 0.7)" }}>
                <FeaturedIcon size={13} style={{ display: "inline", verticalAlign: "-2px" }} />
              </span>
            </div>
          </div>
        </section>
      )}

      {/* ===== Filters ===== */}
      <div className="flex flex-wrap" style={{ gap: 8 }}>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`lv-pill${filter === f ? " lv-pill--active" : ""}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ===== Grid ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredGames.map((game) => {
          const Icon = ICON_MAP[game.iconName] ?? Layers;
          const tone = CATEGORY_TONE[game.category] ?? "terra";
          const ts = toneStyles(tone);
          return (
            <Link
              key={game.href}
              href={game.href}
              className="lv-card lv-card--hover group block"
              style={{
                padding: 24,
                display: "flex",
                flexDirection: "column",
                minHeight: 220,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 18,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: ts.bg,
                    color: ts.fg,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Icon size={24} />
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <span className="lv-chip">{game.difficulty}</span>
                </div>
              </div>

              <div
                className="mono-sm"
                style={{ color: "var(--ink-3)", marginBottom: 6 }}
              >
                {game.filterCategory}
              </div>
              <div
                className="serif"
                style={{ fontSize: 24, lineHeight: 1.1, marginBottom: 6 }}
              >
                {game.title}
              </div>
              <p
                style={{
                  color: "var(--ink-3)",
                  fontSize: 13,
                  flex: 1,
                  marginBottom: 14,
                }}
              >
                {game.desc}
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span className="lv-stamp">+{game.xp} XP</span>
                <span
                  className="lv-btn lv-btn--ghost lv-btn--icon lv-btn--sm"
                  aria-hidden="true"
                >
                  <Play size={14} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
