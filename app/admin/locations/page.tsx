"use client";

import { useEffect, useState } from "react";

interface LocationEntry {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  city: string | null;
  country: string | null;
  updatedAt: string;
  user: { id: string; name: string | null; email: string };
}

export default function AdminLocationsPage() {
  const [locations, setLocations] = useState<LocationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/locations")
      .then((r) => r.json())
      .then((d) => { setLocations(d.locations ?? []); setLoading(false); });
  }, []);

  const filtered = locations.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (l.user.name ?? "").toLowerCase().includes(q) ||
      l.user.email.toLowerCase().includes(q) ||
      (l.city ?? "").toLowerCase().includes(q) ||
      (l.country ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <h1 className="font-serif text-3xl mb-1" style={{ color: "var(--text)" }}>User Locations</h1>
      <p className="text-sm mb-6" style={{ color: "var(--text-3)" }}>
        {locations.length} user{locations.length !== 1 ? "s" : ""} sharing location
      </p>

      <div className="flex items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="Search user, city, country…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input text-sm"
          style={{ maxWidth: 300 }}
        />
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl" style={{ background: "var(--surface)" }} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          {/* Header */}
          <div
            className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr_auto] gap-4 px-5 py-3 text-[11px] font-bold uppercase tracking-wider"
            style={{ background: "var(--surface-2)", color: "var(--text-3)", borderBottom: "1px solid var(--border)" }}
          >
            <span>User</span>
            <span>Location</span>
            <span>Coordinates</span>
            <span>Accuracy</span>
            <span>Updated</span>
          </div>

          {filtered.length === 0 ? (
            <div className="px-5 py-12 text-center" style={{ background: "var(--surface)" }}>
              <p className="text-3xl mb-3">📍</p>
              <p className="text-sm font-medium" style={{ color: "var(--text-2)" }}>No locations yet</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>
                Users will appear here once they allow location access.
              </p>
            </div>
          ) : (
            filtered.map((l, i) => (
              <div
                key={l.id}
                className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr_auto] gap-4 items-center px-5 py-3.5"
                style={{
                  background: "var(--surface)",
                  borderTop: i > 0 ? "1px solid var(--border)" : undefined,
                }}
              >
                {/* User */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: "linear-gradient(135deg, #7c6aff, #4338ca)" }}
                  >
                    {l.user.name?.[0]?.toUpperCase() ?? l.user.email[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>{l.user.name ?? "—"}</p>
                    <p className="text-xs truncate" style={{ color: "var(--text-3)" }}>{l.user.email}</p>
                  </div>
                </div>

                {/* City / Country */}
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                    {l.city ?? "Unknown"}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-3)" }}>{l.country ?? "—"}</p>
                </div>

                {/* Coordinates + Maps link */}
                <div>
                  <a
                    href={`https://www.google.com/maps?q=${l.latitude},${l.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono hover:underline"
                    style={{ color: "var(--accent)" }}
                  >
                    {l.latitude.toFixed(5)}, {l.longitude.toFixed(5)}
                  </a>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>Open in Maps ↗</p>
                </div>

                {/* Accuracy */}
                <div>
                  <p className="text-xs" style={{ color: "var(--text-2)" }}>
                    {l.accuracy != null ? `±${Math.round(l.accuracy)}m` : "—"}
                  </p>
                </div>

                {/* Updated */}
                <div className="text-right">
                  <p className="text-xs whitespace-nowrap" style={{ color: "var(--text-3)" }}>
                    {new Date(l.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-3)" }}>
                    {new Date(l.updatedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
