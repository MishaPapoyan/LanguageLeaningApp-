"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface GroupData {
  id: string;
  name: string;
  inviteCode: string;
  members: Array<{
    user: {
      id: string;
      name: string | null;
      progress: { xp: number; level: number; streak: number } | null;
    };
  }>;
  assignments: Array<{
    id: string;
    title: string;
    type: string;
    dueDate: string;
  }>;
}

export function TeacherDashboard({ groups: initialGroups }: { groups: GroupData[] }) {
  const router = useRouter();
  const [groups] = useState(initialGroups);
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [showCreateAssignment, setShowCreateAssignment] = useState<string | null>(null);
  const [className, setClassName] = useState("");
  const [assignTitle, setAssignTitle] = useState("");
  const [assignType, setAssignType] = useState("VOCABULARY");
  const [assignDue, setAssignDue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const createClass = async () => {
    if (!className.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/teacher/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: className }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to create class");
        return;
      }
      setClassName("");
      setShowCreateClass(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const createAssignment = async () => {
    if (!assignTitle.trim() || !assignDue || !showCreateAssignment) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/teacher/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId: showCreateAssignment, title: assignTitle, type: assignType, dueDate: assignDue }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to create assignment");
        return;
      }
      setAssignTitle("");
      setAssignType("VOCABULARY");
      setAssignDue("");
      setShowCreateAssignment(null);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }} className="space-y-6 animate-fade-up">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>
            Teacher Dashboard
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 2 }}>
            Manage your classes and assignments
          </p>
        </div>
        <button onClick={() => setShowCreateClass(true)} className="btn-primary">
          + New Class
        </button>
      </div>

      {/* Create class form */}
      {showCreateClass && (
        <div style={{
          borderRadius: 16, padding: "20px",
          background: "var(--surface-2)", border: "1px solid rgba(99,102,241,0.3)",
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>
            Create a new class
          </h3>
          {error && <p style={{ fontSize: 13, color: "var(--red)", marginBottom: 8 }}>{error}</p>}
          <div style={{ display: "flex", gap: 10 }}>
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="Class name (e.g. Beginners B)"
              className="input"
              style={{ flex: 1 }}
              onKeyDown={(e) => { if (e.key === "Enter") createClass(); }}
            />
            <button onClick={createClass} disabled={loading || !className.trim()} className="btn-primary">
              {loading ? "Creating..." : "Create"}
            </button>
            <button onClick={() => { setShowCreateClass(false); setError(""); }} className="btn-ghost">
              Cancel
            </button>
          </div>
          <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 8 }}>
            Students can join using the invite code that will be generated.
          </p>
        </div>
      )}

      {groups.length === 0 && !showCreateClass ? (
        <div style={{
          borderRadius: 20, padding: "64px 24px", textAlign: "center",
          background: "var(--surface-2)", border: "1px solid var(--border)",
        }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>⊞</p>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>No classes yet</h2>
          <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 6 }}>
            Create your first class to start managing students.
          </p>
          <button onClick={() => setShowCreateClass(true)} className="btn-primary" style={{ marginTop: 16 }}>
            + Create your first class
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {groups.map((group) => (
            <div key={group.id} style={{
              borderRadius: 18, padding: "22px 24px",
              background: "var(--surface-2)", border: "1px solid var(--border)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-display)" }}>
                    {group.name}
                  </h2>
                  <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>
                    {group.members.length} student{group.members.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    fontSize: 12, background: "var(--surface-3)",
                    padding: "6px 12px", borderRadius: 9,
                    border: "1px solid var(--border-md)",
                  }}>
                    <span style={{ color: "var(--text-3)" }}>Invite: </span>
                    <code style={{ fontFamily: "var(--font-mono)", color: "var(--accent-2)", fontWeight: 700 }}>
                      {group.inviteCode.slice(0, 8)}
                    </code>
                  </div>
                  <button
                    onClick={() => setShowCreateAssignment(showCreateAssignment === group.id ? null : group.id)}
                    className="btn-secondary"
                    style={{ fontSize: 13 }}
                  >
                    + Assignment
                  </button>
                </div>
              </div>

              {/* Create assignment form */}
              {showCreateAssignment === group.id && (
                <div style={{
                  borderRadius: 14, padding: "16px", marginBottom: 16,
                  background: "var(--accent-dim)", border: "1px solid rgba(99,102,241,0.25)",
                }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>
                    New Assignment
                  </h3>
                  {error && <p style={{ fontSize: 13, color: "var(--red)", marginBottom: 8 }}>{error}</p>}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 10 }}>
                    <input
                      type="text"
                      value={assignTitle}
                      onChange={(e) => setAssignTitle(e.target.value)}
                      placeholder="Assignment title"
                      className="input"
                    />
                    <select value={assignType} onChange={(e) => setAssignType(e.target.value)} className="input">
                      <option value="VOCABULARY">Vocabulary</option>
                      <option value="STORY">Story</option>
                      <option value="QUIZ">Quiz</option>
                      <option value="SPEAKING">Speaking</option>
                    </select>
                    <input
                      type="date"
                      value={assignDue}
                      onChange={(e) => setAssignDue(e.target.value)}
                      className="input"
                    />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={createAssignment}
                      disabled={loading || !assignTitle.trim() || !assignDue}
                      className="btn-primary"
                      style={{ fontSize: 13 }}
                    >
                      {loading ? "Creating..." : "Create assignment"}
                    </button>
                    <button
                      onClick={() => { setShowCreateAssignment(null); setError(""); }}
                      className="btn-ghost"
                      style={{ fontSize: 13 }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Students table */}
              {group.members.length > 0 && (
                <div style={{ overflowX: "auto", marginBottom: 12 }}>
                  <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border)" }}>
                        {["Student", "Level", "XP", "Streak"].map((h) => (
                          <th key={h} style={{
                            textAlign: "left", paddingBottom: 8, fontWeight: 600,
                            fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em",
                            color: "var(--text-3)",
                          }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {group.members.map(({ user }) => (
                        <tr key={user.id} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td style={{ padding: "10px 0" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{
                                width: 28, height: 28, borderRadius: "50%",
                                background: "var(--accent-dim)", border: "1px solid rgba(99,102,241,0.25)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 11, fontWeight: 800, color: "var(--accent-2)",
                              }}>
                                {user.name?.[0]?.toUpperCase() ?? "?"}
                              </div>
                              <span style={{ color: "var(--text)", fontWeight: 500 }}>{user.name}</span>
                            </div>
                          </td>
                          <td style={{ padding: "10px 0", color: "var(--text-2)" }}>
                            Lv. {user.progress?.level ?? 1}
                          </td>
                          <td style={{ padding: "10px 0", color: "var(--accent-2)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                            {user.progress?.xp ?? 0}
                          </td>
                          <td style={{ padding: "10px 0", color: "var(--xp)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                            {user.progress?.streak ?? 0}d
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {group.members.length === 0 && (
                <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 12 }}>
                  No students yet. Share the invite code to add students.
                </p>
              )}

              {/* Assignments */}
              {group.assignments.length > 0 && (
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                    Recent Assignments
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {group.assignments.map((a) => (
                      <div key={a.id} style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "9px 0",
                        borderBottom: "1px solid var(--border)",
                      }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
                          background: "var(--accent-dim)", color: "var(--accent-2)",
                          border: "1px solid rgba(99,102,241,0.25)", borderRadius: 999, padding: "2px 8px",
                        }}>
                          {a.type}
                        </span>
                        <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{a.title}</span>
                        <span style={{ fontSize: 11, color: "var(--text-3)", marginLeft: "auto" }}>
                          Due: {new Date(a.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
