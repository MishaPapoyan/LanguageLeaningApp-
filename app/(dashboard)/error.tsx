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
      <h2 className="text-xl font-serif font-bold text-zinc-800 mb-2">
        Something went wrong
      </h2>
      <p className="text-zinc-500 mb-6 text-sm">
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
