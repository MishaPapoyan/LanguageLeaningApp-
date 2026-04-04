"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "lf_location_consent";

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
  const [visible, setVisible] = useState(false);
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    if (!navigator?.geolocation) return;
    // Show banner if not yet handled this login session
    if (localStorage.getItem(STORAGE_KEY) !== "granted") {
      // Small delay so banner doesn't flash immediately on load
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  function dismiss() {
    setVisible(false);
    // Don't store denial — next login will show banner again
  }

  function allow() {
    setAsking(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        localStorage.setItem(STORAGE_KEY, "granted");
        sendLocation(pos.coords);
        setVisible(false);
        setAsking(false);
      },
      () => {
        // User denied in browser dialog
        setVisible(false);
        setAsking(false);
      },
      { timeout: 10000, maximumAge: 0 }
    );
  }

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 80,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        width: "min(420px, calc(100vw - 32px))",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 20,
        padding: "16px 18px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(99,102,241,0.15)",
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
        animation: "fade-up 0.35s cubic-bezier(0.34,1.56,0.64,1) both",
      }}
    >
      {/* Icon */}
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(45,212,191,0.2))",
        border: "1px solid rgba(99,102,241,0.25)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20,
      }}>
        📍
      </div>

      {/* Text + actions */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 3, lineHeight: 1.3 }}>
          Share your location?
        </p>
        <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5, marginBottom: 12 }}>
          Helps us show regional French content and connect you with nearby learners.
        </p>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={allow}
            disabled={asking}
            style={{
              flex: 1,
              padding: "8px 16px",
              borderRadius: 10,
              border: "none",
              background: asking ? "var(--surface-3)" : "var(--accent)",
              color: asking ? "var(--text-3)" : "#fff",
              fontSize: 13,
              fontWeight: 700,
              cursor: asking ? "not-allowed" : "pointer",
              transition: "all 0.15s",
            }}
          >
            {asking ? "Asking…" : "Allow"}
          </button>
          <button
            onClick={dismiss}
            disabled={asking}
            style={{
              padding: "8px 14px",
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text-2)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            Skip
          </button>
        </div>
      </div>

      {/* Close X */}
      <button
        onClick={dismiss}
        style={{
          position: "absolute", top: 12, right: 12,
          width: 22, height: 22, borderRadius: 6,
          border: "none", background: "var(--surface-3)",
          color: "var(--text-3)", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, flexShrink: 0,
        }}
      >
        ✕
      </button>
    </div>
  );
}
