"use client";

import { useEffect, useState } from "react";

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  targetLanguage: string;
  nativeLanguage: string;
  onboardingCompleted: boolean;
  progress: { xp: number; level: number; streak: number; lastActive: string } | null;
  location: { city: string | null; country: string | null; updatedAt: string } | null;
  _count: { savedWords: number; storyProgress: number; aiInteractions: number; gameScores: number; writingSessions: number; voiceSessions: number };
}

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  ADMIN:   { bg: "var(--red-dim)",    color: "var(--red)" },
  TEACHER: { bg: "var(--accent-dim)", color: "var(--accent)" },
  STUDENT: { bg: "rgba(255,255,255,0.06)", color: "var(--text-3)" },
};

const LANG_FLAG: Record<string, string> = { fr: "🇫🇷", es: "🇪🇸" };

const NATIVE_LABEL: Record<string, string> = {
  en: "EN", hy: "HY", ru: "RU", de: "DE", es: "ES", fr: "FR", ar: "AR", zh: "ZH",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "today";
  if (d === 1) return "1d ago";
  if (d < 30) return `${d}d ago`;
  const m = Math.floor(d / 30);
  return `${m}mo ago`;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [changing, setChanging] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => { setUsers(d.users ?? []); setLoading(false); });
  }, []);

  const deleteUser = async (userId: string) => {
    setDeleting(userId);
    const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    if (res.ok) setUsers((prev) => prev.filter((u) => u.id !== userId));
    setDeleting(null);
    setConfirmDeleteId(null);
  };

  const changeRole = async (userId: string, role: string) => {
    setChanging(userId);
    const res = await fetch(`/api/admin/users/${userId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (res.ok) setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role } : u));
    setChanging(null);
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchQ = !q || (u.name ?? "").toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchQ && matchRole;
  });

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", fontFamily: "var(--font-display)", letterSpacing: "-0.02em", marginBottom: 4 }}>Users</h1>
      <p className="text-sm mb-6" style={{ color: "var(--text-3)" }}>{users.length} total registered users</p>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <input
          type="text"
          placeholder="Search name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input text-sm"
          style={{ maxWidth: 280 }}
        />
        {["ALL", "STUDENT", "TEACHER", "ADMIN"].map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
            style={{
              background: roleFilter === r ? "var(--accent-dim)" : "var(--surface)",
              color: roleFilter === r ? "var(--accent)" : "var(--text-3)",
              border: "1px solid var(--border)",
            }}
          >
            {r === "ALL" ? "All" : r.charAt(0) + r.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl" style={{ background: "var(--surface)" }} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          {/* Header */}
          <div
            className="grid grid-cols-[2fr_1fr_1.2fr_1fr_1fr_auto] gap-4 px-5 py-3 text-[11px] font-bold uppercase tracking-wider"
            style={{ background: "var(--surface-2)", color: "var(--text-3)", borderBottom: "1px solid var(--border)" }}
          >
            <span>User</span>
            <span>Level / XP</span>
            <span>Activity</span>
            <span>Location</span>
            <span>Role</span>
            <span></span>
          </div>

          {filtered.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm" style={{ background: "var(--surface)", color: "var(--text-3)" }}>
              No users found
            </div>
          ) : (
            filtered.map((u, i) => (
              <div key={u.id}>
                {/* Main row */}
                <div
                  className="grid grid-cols-[2fr_1fr_1.2fr_1fr_1fr_auto] gap-4 items-center px-5 py-3.5 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  style={{
                    background: "var(--surface)",
                    borderTop: i > 0 ? "1px solid var(--border)" : undefined,
                  }}
                  onClick={() => setExpanded(expanded === u.id ? null : u.id)}
                >
                  {/* User */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: "linear-gradient(135deg, #10b981, var(--accent-press))" }}
                    >
                      {u.name?.[0]?.toUpperCase() ?? u.email[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>{u.name ?? "—"}</p>
                        {u.onboardingCompleted && (
                          <span className="text-[10px] flex-shrink-0" title="Onboarding complete">✅</span>
                        )}
                      </div>
                      <p className="text-xs truncate" style={{ color: "var(--text-3)" }}>{u.email}</p>
                    </div>
                  </div>

                  {/* Level / XP */}
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                      {LANG_FLAG[u.targetLanguage] ?? "🌍"} Lv {u.progress?.level ?? 1}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-3)" }}>{(u.progress?.xp ?? 0).toLocaleString()} XP</p>
                  </div>

                  {/* Activity */}
                  <div>
                    <p className="text-xs" style={{ color: "var(--text-2)" }}>
                      🔥 {u.progress?.streak ?? 0}d · {u.progress?.lastActive ? timeAgo(u.progress.lastActive) : "never"}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-3)" }}>
                      {u._count.savedWords}w · {u._count.aiInteractions}ai · {u._count.gameScores}g
                    </p>
                  </div>

                  {/* Location */}
                  <div>
                    {u.location ? (
                      <>
                        <p className="text-xs font-medium truncate" style={{ color: "var(--text-2)" }}>
                          {u.location.city ?? "Unknown city"}
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-3)" }}>{u.location.country ?? ""}</p>
                      </>
                    ) : (
                      <p className="text-xs" style={{ color: "var(--text-3)" }}>No data</p>
                    )}
                  </div>

                  {/* Role */}
                  <div onClick={(e) => e.stopPropagation()}>
                    <select
                      value={u.role}
                      disabled={changing === u.id}
                      onChange={(e) => changeRole(u.id, e.target.value)}
                      className="text-xs rounded-lg px-2 py-1 border"
                      style={{
                        background: ROLE_COLORS[u.role]?.bg ?? "transparent",
                        color: ROLE_COLORS[u.role]?.color ?? "var(--text)",
                        borderColor: "var(--border-md)",
                        cursor: "pointer",
                      }}
                    >
                      <option value="STUDENT">Student</option>
                      <option value="TEACHER">Teacher</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>

                  {/* Delete */}
                  <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                    {confirmDeleteId === u.id ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => deleteUser(u.id)}
                          disabled={deleting === u.id}
                          className="text-[11px] font-semibold px-2 py-1 rounded-lg disabled:opacity-50"
                          style={{ background: "var(--red)", color: "#fff" }}
                        >
                          {deleting === u.id ? "…" : "Confirm"}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-[11px] font-semibold px-2 py-1 rounded-lg"
                          style={{ background: "var(--surface-2)", color: "var(--text-3)", border: "1px solid var(--border)" }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(u.id)}
                        className="text-[11px] font-semibold px-2 py-1 rounded-lg transition-colors"
                        style={{ background: "rgba(239,68,68,0.1)", color: "var(--red)", border: "1px solid rgba(239,68,68,0.2)" }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded detail row */}
                {expanded === u.id && (
                  <div
                    className="px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4"
                    style={{ background: "var(--surface-2)", borderTop: "1px solid var(--border)" }}
                  >
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-3)" }}>Languages</p>
                      <p className="text-xs" style={{ color: "var(--text-2)" }}>
                        Native: <strong>{NATIVE_LABEL[u.nativeLanguage] ?? u.nativeLanguage}</strong>
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-2)" }}>
                        Learning: <strong>{LANG_FLAG[u.targetLanguage] ?? "🌍"} {u.targetLanguage.toUpperCase()}</strong>
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-3)" }}>Learning stats</p>
                      <p className="text-xs" style={{ color: "var(--text-2)" }}>{u._count.savedWords} saved words</p>
                      <p className="text-xs" style={{ color: "var(--text-2)" }}>{u._count.storyProgress} stories read</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-3)" }}>Engagement</p>
                      <p className="text-xs" style={{ color: "var(--text-2)" }}>{u._count.aiInteractions} AI sessions</p>
                      <p className="text-xs" style={{ color: "var(--text-2)" }}>{u._count.gameScores} game plays</p>
                      <p className="text-xs" style={{ color: "var(--text-2)" }}>{u._count.writingSessions} writing · {u._count.voiceSessions} voice</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-3)" }}>Account</p>
                      <p className="text-xs" style={{ color: "var(--text-2)" }}>
                        Joined {new Date(u.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-2)" }}>
                        Onboarding: {u.onboardingCompleted ? "✅ done" : "⏳ pending"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
