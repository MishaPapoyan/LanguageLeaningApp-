"use client";

import { useEffect } from "react";

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.body.classList.add("hide-right-panel");
    return () => document.body.classList.remove("hide-right-panel");
  }, []);

  // Bleed out of the parent dashboard padding (px-4 md:px-8, pt-8)
  // so the banner can go truly edge-to-edge
  return (
    <div className="community-breakout">
      {children}
    </div>
  );
}
