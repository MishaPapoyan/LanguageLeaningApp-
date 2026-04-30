"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setLoading(false);
    setProgress(100);
    const timeout = setTimeout(() => setProgress(0), 300);
    return () => clearTimeout(timeout);
  }, [pathname]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("#") || href === pathname) return;
      setLoading(true);
      setProgress(30);
      const interval = setInterval(() => {
        setProgress((p) => (p < 90 ? p + 10 : p));
      }, 150);
      const timeout = setTimeout(() => {
        clearInterval(interval);
        setLoading(false);
        setProgress(0);
      }, 3000);
      const cleanup = () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
      window.addEventListener("popstate", cleanup, { once: true });
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);

  if (progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[2px]">
      <div
        className="h-full transition-all duration-300 ease-out"
        style={{ background: "var(--accent)", width: `${progress}%`, opacity: loading ? 1 : 0 }}
      />
    </div>
  );
}
