"use client";

import { useEffect } from "react";

async function reverseGeocode(lat: number, lng: number) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { "Accept-Language": "en" } }
    );
    if (!res.ok) return { city: null, country: null };
    const data = await res.json();
    return {
      city: data.address?.city || data.address?.town || data.address?.village || data.address?.county || null,
      country: data.address?.country || null,
    };
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

export function LocationBanner() {
  useEffect(() => {
    if (!navigator?.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => sendLocation(pos.coords),
      () => {},
      { timeout: 10000, maximumAge: 3600000 }
    );
  }, []);

  return null;
}
