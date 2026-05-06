"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GameError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[game-error]", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: "rgba(239,68,68,0.12)",
          border: "1px solid rgba(239,68,68,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AlertTriangle size={28} style={{ color: "#f87171" }} />
      </div>

      <div>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: "var(--text)",
            marginBottom: 6,
          }}
        >
          Something went wrong
        </h2>
        <p
          style={{
            fontSize: 13,
            color: "var(--text-3)",
            maxWidth: 340,
            lineHeight: 1.6,
          }}
        >
          This game hit an unexpected error. Your progress has been saved.
          Try refreshing or go back to games.
        </p>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={reset}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "9px 18px",
            borderRadius: 10,
            background: "var(--accent)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
          }}
        >
          <RefreshCw size={14} />
          Try again
        </button>

        <Link
          href="/games"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "9px 18px",
            borderRadius: 10,
            background: "var(--surface-2)",
            color: "var(--text-2)",
            fontSize: 13,
            fontWeight: 700,
            border: "1px solid var(--border)",
            textDecoration: "none",
          }}
        >
          <Home size={14} />
          Back to games
        </Link>
      </div>
    </div>
  );
}
