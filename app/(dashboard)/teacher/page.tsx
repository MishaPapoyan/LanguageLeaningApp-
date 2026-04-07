import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Teacher Dashboard — LangCraft",
};

export default function TeacherPage() {
  return (
    <div className="max-w-2xl mx-auto py-20 px-6 text-center">
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          background: "var(--accent-dim)",
          border: "1px solid rgba(99,102,241,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
          margin: "0 auto 24px",
        }}
      >
        🏫
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>
        Teacher Dashboard
      </h1>
      <p style={{ color: "var(--text-2)", fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>
        Class management, assignments, and student progress tracking are coming soon.
        This feature is currently under development.
      </p>
      <div
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "20px 24px",
          marginBottom: 32,
          textAlign: "left",
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--text-3)",
            marginBottom: 12,
          }}
        >
          Planned features
        </p>
        {[
          "Create and manage classes",
          "Assign stories, quizzes, and vocabulary lists",
          "Track individual student progress and XP",
          "View completion rates and quiz scores",
          "Send feedback to students",
        ].map((item) => (
          <div
            key={item}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 0",
              borderBottom: "1px solid var(--border)",
              color: "var(--text-2)",
              fontSize: 14,
            }}
          >
            <span style={{ color: "var(--accent)", fontSize: 16 }}>○</span>
            {item}
          </div>
        ))}
      </div>
      <Link href="/home" className="btn-primary">
        Back to home
      </Link>
    </div>
  );
}
