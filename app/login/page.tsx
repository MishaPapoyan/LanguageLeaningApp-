import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BookOpen, MessageCircle, Gamepad2 } from "lucide-react";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/home");

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "var(--bg)",
        color: "var(--text)",
      }}
    >
      {/* Left — decorative panel */}
      <div
        style={{
          display: "none",
          width: "50%",
          position: "relative",
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(150deg, #1a1535 0%, #0f0e1f 100%)",
          borderRight: "1px solid var(--border)",
          flexShrink: 0,
        }}
        className="login-panel"
      >
        {/* Glow orbs */}
        <div
          style={{
            position: "absolute",
            top: "25%",
            left: "20%",
            width: "320px",
            height: "320px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)",
            filter: "blur(48px)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "25%",
            right: "15%",
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(20,184,166,0.14) 0%, transparent 70%)",
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />

        {/* Content */}
        <div style={{ textAlign: "center", position: "relative", zIndex: 10, padding: "0 48px" }}>
          <p style={{ fontSize: "72px", lineHeight: 1, marginBottom: "24px" }}>{"\u{1F30D}"}</p>
          <h2
            style={{
              fontFamily: "serif",
              fontSize: "38px",
              fontStyle: "italic",
              color: "var(--text)",
              marginBottom: "12px",
            }}
          >
            Welcome!
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: "var(--text-2)",
              lineHeight: 1.6,
              marginBottom: "40px",
            }}
          >
            Your learning journey continues here.
          </p>

          {/* Feature pills */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
            {[
              { icon: BookOpen, label: "50+ immersive stories" },
              { icon: MessageCircle, label: "AI conversation tutor" },
              { icon: Gamepad2, label: "Vocab games & flashcards" },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  borderRadius: "999px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                <item.icon size={13} style={{ color: "rgba(129,140,248,0.9)" }} />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div style={{ width: "100%", maxWidth: "360px" }}>

          {/* Logo */}
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "40px",
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #7c6aff 0%, #5b4fcf 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 700,
                fontSize: "11px",
                letterSpacing: "0.05em",
                flexShrink: 0,
              }}
            >
              LC
            </div>
            <span
              style={{
                fontFamily: "serif",
                fontSize: "18px",
                color: "var(--text)",
                fontWeight: 500,
              }}
            >
              LangCraft
            </span>
          </Link>

          {/* Heading */}
          <h1
            style={{
              fontFamily: "serif",
              fontSize: "30px",
              color: "var(--text)",
              marginBottom: "6px",
              letterSpacing: "-0.02em",
            }}
          >
            Welcome back
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "var(--text-2)",
              marginBottom: "32px",
              lineHeight: 1.5,
            }}
          >
            Enter your details to continue learning
          </p>

          {/* Form */}
          <LoginForm />

          {/* Sign up link */}
          <p
            style={{
              textAlign: "center",
              fontSize: "13px",
              color: "var(--text-3)",
              marginTop: "24px",
            }}
          >
            Don&rsquo;t have an account?{" "}
            <Link
              href="/register"
              style={{
                color: "var(--accent)",
                fontWeight: 600,
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              Sign up free
            </Link>
          </p>
        </div>
      </div>

      {/* Responsive: show left panel on large screens */}
      <style>{`
        @media (min-width: 1024px) {
          .login-panel {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
