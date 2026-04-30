"use client";

import { useEffect, useState } from "react";

interface AdminGroup {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: string;
  teacher: { id: string; name: string | null; email: string };
  _count: { members: number; assignments: number };
}

export default function AdminGroupsPage() {
  const [groups, setGroups] = useState<AdminGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/groups")
      .then((r) => r.json())
      .then((d) => { setGroups(d.groups ?? []); setLoading(false); });
  }, []);

  const filtered = groups.filter((g) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      g.name.toLowerCase().includes(q) ||
      (g.teacher.name ?? "").toLowerCase().includes(q) ||
      g.teacher.email.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", fontFamily: "var(--font-display)", letterSpacing: "-0.02em", marginBottom: 4 }}>Classrooms</h1>
      <p className="text-sm mb-6" style={{ color: "var(--text-3)" }}>
        {groups.length} classroom{groups.length !== 1 ? "s" : ""} created by teachers
      </p>

      <div className="flex items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name or teacher…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input text-sm"
          style={{ maxWidth: 300 }}
        />
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl" style={{ background: "var(--surface)" }} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          {/* Header */}
          <div
            className="grid grid-cols-[2fr_2fr_80px_100px_auto] gap-4 px-5 py-3 text-[11px] font-bold uppercase tracking-wider"
            style={{ background: "var(--surface-2)", color: "var(--text-3)", borderBottom: "1px solid var(--border)" }}
          >
            <span>Classroom</span>
            <span>Teacher</span>
            <span>Members</span>
            <span>Assignments</span>
            <span>Created</span>
          </div>

          {filtered.length === 0 ? (
            <div className="px-5 py-12 text-center" style={{ background: "var(--surface)" }}>
              <p className="text-3xl mb-3">🏫</p>
              <p className="text-sm font-medium" style={{ color: "var(--text-2)" }}>No classrooms yet</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>
                Classrooms will appear here when teachers create them.
              </p>
            </div>
          ) : (
            filtered.map((g, i) => (
              <div
                key={g.id}
                className="grid grid-cols-[2fr_2fr_80px_100px_auto] gap-4 items-center px-5 py-3.5"
                style={{ background: "var(--surface)", borderTop: i > 0 ? "1px solid var(--border)" : undefined }}
              >
                {/* Name + invite code */}
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>{g.name}</p>
                  <p className="text-xs font-mono mt-0.5" style={{ color: "var(--text-3)" }}>
                    #{g.inviteCode.slice(0, 8)}
                  </p>
                </div>

                {/* Teacher */}
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
                  >
                    {g.teacher.name?.[0]?.toUpperCase() ?? g.teacher.email[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>
                      {g.teacher.name ?? "—"}
                    </p>
                    <p className="text-xs truncate" style={{ color: "var(--text-3)" }}>{g.teacher.email}</p>
                  </div>
                </div>

                {/* Members */}
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{g._count.members}</p>
                  <p className="text-xs" style={{ color: "var(--text-3)" }}>students</p>
                </div>

                {/* Assignments */}
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{g._count.assignments}</p>
                  <p className="text-xs" style={{ color: "var(--text-3)" }}>tasks</p>
                </div>

                {/* Created */}
                <div className="text-right">
                  <p className="text-xs whitespace-nowrap" style={{ color: "var(--text-3)" }}>
                    {new Date(g.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })}
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
