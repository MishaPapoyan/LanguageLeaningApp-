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
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-zinc-900">Teacher Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage your classes and assignments</p>
        </div>
        <button onClick={() => setShowCreateClass(true)} className="btn-primary text-sm">
          + New Class
        </button>
      </div>

      {/* Create class form */}
      {showCreateClass && (
        <div className="bg-white rounded-2xl border-2 border-violet-200 p-5">
          <h3 className="font-serif text-zinc-900 mb-3">Create a new class</h3>
          {error && <p className="text-sm text-rose-600 mb-2">{error}</p>}
          <div className="flex gap-3">
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="Class name (e.g. French Beginners B)"
              className="input flex-1"
              onKeyDown={(e) => { if (e.key === "Enter") createClass(); }}
            />
            <button onClick={createClass} disabled={loading || !className.trim()} className="btn-primary text-sm">
              {loading ? "Creating..." : "Create"}
            </button>
            <button onClick={() => { setShowCreateClass(false); setError(""); }} className="btn-ghost text-sm">
              Cancel
            </button>
          </div>
          <p className="text-xs text-zinc-400 mt-2">
            Students can join using the invite code that will be generated.
          </p>
        </div>
      )}

      {groups.length === 0 && !showCreateClass ? (
        <div className="bg-white rounded-2xl border border-zinc-100 text-center py-16">
          <p className="text-3xl mb-3">⊞</p>
          <h2 className="text-lg font-serif text-zinc-900">No classes yet</h2>
          <p className="text-sm text-zinc-500 mt-2">Create your first class to start managing students.</p>
          <button onClick={() => setShowCreateClass(true)} className="btn-primary mt-4">
            + Create your first class
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.id} className="bg-white rounded-2xl border border-zinc-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-serif text-zinc-900">{group.name}</h2>
                  <p className="text-sm text-zinc-500">{group.members.length} students</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm bg-zinc-50 px-3 py-1.5 rounded-lg ring-1 ring-zinc-200">
                    <span className="text-zinc-400">Invite: </span>
                    <code className="font-mono text-violet-600">{group.inviteCode.slice(0, 8)}</code>
                  </div>
                  <button
                    onClick={() => setShowCreateAssignment(showCreateAssignment === group.id ? null : group.id)}
                    className="btn-outline text-sm"
                  >
                    + Assignment
                  </button>
                </div>
              </div>

              {/* Create assignment form */}
              {showCreateAssignment === group.id && (
                <div className="bg-violet-50 rounded-xl p-4 mb-4 ring-1 ring-violet-100">
                  <h3 className="text-sm font-semibold text-zinc-700 mb-3">New Assignment</h3>
                  {error && <p className="text-sm text-rose-600 mb-2">{error}</p>}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
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
                  <div className="flex gap-2">
                    <button onClick={createAssignment} disabled={loading || !assignTitle.trim() || !assignDue} className="btn-primary text-sm">
                      {loading ? "Creating..." : "Create assignment"}
                    </button>
                    <button onClick={() => { setShowCreateAssignment(null); setError(""); }} className="btn-ghost text-sm">Cancel</button>
                  </div>
                </div>
              )}

              {/* Students table */}
              {group.members.length > 0 && (
                <div className="overflow-x-auto mb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-zinc-400 border-b border-zinc-100">
                        <th className="pb-2 font-medium">Student</th>
                        <th className="pb-2 font-medium">Level</th>
                        <th className="pb-2 font-medium">XP</th>
                        <th className="pb-2 font-medium">Streak</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.members.map(({ user }) => (
                        <tr key={user.id} className="border-b border-zinc-50 last:border-0">
                          <td className="py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 bg-violet-50 rounded-full flex items-center justify-center text-violet-700 text-xs font-bold">
                                {user.name?.[0]?.toUpperCase() ?? "?"}
                              </div>
                              <span className="text-zinc-700">{user.name}</span>
                            </div>
                          </td>
                          <td className="py-2.5 text-zinc-600">Lv. {user.progress?.level ?? 1}</td>
                          <td className="py-2.5 text-violet-600 font-medium">{user.progress?.xp ?? 0}</td>
                          <td className="py-2.5 text-amber-500 font-medium">{user.progress?.streak ?? 0}d</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {group.members.length === 0 && (
                <p className="text-sm text-zinc-400 mb-4">
                  No students yet. Share the invite code to add students.
                </p>
              )}

              {/* Assignments */}
              {group.assignments.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Recent Assignments</p>
                  <div className="divide-y divide-zinc-50">
                    {group.assignments.map((a) => (
                      <div key={a.id} className="flex items-center gap-3 py-2.5">
                        <span className="badge-blue">{a.type}</span>
                        <span className="text-sm text-zinc-700">{a.title}</span>
                        <span className="text-xs text-zinc-400 ml-auto">
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
