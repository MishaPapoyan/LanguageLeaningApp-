"use client";

import { Shield } from "lucide-react";

interface Props {
  shields: number;
  maxShields?: number;
}

/**
 * Displays filled/empty shield pips under the streak counter.
 * Earned at every 7-day streak milestone (cap 3).
 */
export function StreakShields({ shields, maxShields = 3 }: Props) {
  if (maxShields === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        marginTop: 8,
      }}
      title={`${shields} streak shield${shields !== 1 ? "s" : ""} — protects your streak if you miss a day`}
    >
      {Array.from({ length: maxShields }).map((_, i) => {
        const active = i < shields;
        return (
          <Shield
            key={i}
            size={14}
            style={{
              color: active ? "#f59e0b" : "rgba(255,255,255,0.15)",
              fill: active ? "rgba(245,158,11,0.25)" : "transparent",
              filter: active ? "drop-shadow(0 0 4px rgba(245,158,11,0.5))" : undefined,
              transition: "color 0.2s, filter 0.2s",
            }}
          />
        );
      })}
      <span
        style={{
          fontSize: 10,
          color: shields > 0 ? "rgba(245,158,11,0.7)" : "var(--text-3)",
          fontWeight: 600,
          marginLeft: 2,
        }}
      >
        {shields > 0 ? `${shields} shield${shields !== 1 ? "s" : ""}` : "No shields"}
      </span>
    </div>
  );
}
