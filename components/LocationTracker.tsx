"use client";

import { useEffect } from "react";

const STORAGE_KEY = "lf_location_consent";

async function reverseGeocode(lat: number, lng: number): Promise<{ city: string | null; country: string | null }> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { "Accept-Language": "en" } }
    );
    if (!res.ok) return { city: null, country: null };
    const data = await res.json();
    const city =
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.county ||
      null;
    const country = data.address?.country || null;
    return { city, country };
  } catch {
    return { city: null, country: null };
  }
}

async function sendLocation(coords: GeolocationCoordinates) {
  const { city, country } = await reverseGeocode(coords.latitude, coords.longitude);
  await fetch("/api/user/location", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy,
      city,
      country,
    }),
  });
}

// Silent tracker — no in-app banner.
// The browser's native permission dialog handles consent (once per browser session).
// If already denied, silently skips.
export function LocationTracker() {
  useEffect(() => {
    if (!navigator?.geolocation) return;

    // Already handled this login session — skip
    if (localStorage.getItem(STORAGE_KEY) === "granted") return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        localStorage.setItem(STORAGE_KEY, "granted");
        sendLocation(pos.coords);
      },
      () => {
        // Don't store denial — next login will try again
      },
      { timeout: 8000, maximumAge: 0 }
    );
  }, []);

  return null;
}
