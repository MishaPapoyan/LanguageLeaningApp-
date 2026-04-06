"use client";

import { useEffect } from "react";

export function LocationBanner() {
  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((data) => {
        if (!data.city && !data.country_name) return;
        fetch("/api/user/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            latitude: data.latitude ?? null,
            longitude: data.longitude ?? null,
            accuracy: null,
            city: data.city || null,
            country: data.country_name || null,
          }),
        }).catch(() => {});
      })
      .catch(() => {});
  }, []);

  return null;
}
