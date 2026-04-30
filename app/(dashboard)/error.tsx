"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="max-w-md mx-auto text-center py-20">
      <div className="text-5xl mb-4">😵</div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", fontFamily: "var(--font-display)", letterSpacing: "-0.02em", marginBottom: 8 }}>
        Something went wrong
      </h2>
      <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 24 }}>
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <div className="flex gap-3 justify-center">
        <button onClick={reset} className="btn-primary">
          Try again
        </button>
        <a href="/home" className="btn-outline">
          Go home
        </a>
      </div>
    </div>
  );
}
