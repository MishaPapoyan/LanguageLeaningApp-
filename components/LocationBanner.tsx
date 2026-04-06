"use client";

import { useEffect } from "react";

export function LocationBanner() {
  useEffect(() => {
    function saveLocation(lat: number, lng: number, accuracy: number | null, city: string | null, country: string | null) {
      fetch("/api/user/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: lat, longitude: lng, accuracy, city, country }),
      }).catch(() => {});
    }

    if (navigator.geolocation) {
      // Use precise browser GPS — no custom UI shown, browser handles permission silently
      // if already granted; falls back to IP only if denied
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          saveLocation(
            pos.coords.latitude,
            pos.coords.longitude,
            pos.coords.accuracy,
            null,
            null,
          );
        },
        () => {
          // Permission denied or unavailable — fall back to IP geolocation
          fetch("https://ipapi.co/json/")
            .then((r) => r.json())
            .then((data) => {
              const lat = typeof data.latitude  === "number" ? data.latitude  : null;
              const lng = typeof data.longitude === "number" ? data.longitude : null;
              if (lat === null || lng === null) return;
              saveLocation(lat, lng, null, data.city || null, data.country_name || null);
            })
            .catch(() => {});
        },
        { timeout: 10_000, maximumAge: 3_600_000 }, // cache for 1 hour
      );
    }
  }, []);

  return null; // renders nothing — completely invisible
}
