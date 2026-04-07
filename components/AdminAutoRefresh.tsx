"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Silently refreshes admin server data every 20 seconds */
export function AdminAutoRefresh() {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => router.refresh(), 20_000);
    return () => clearInterval(id);
  }, [router]);
  return null;
}
