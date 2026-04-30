import { RegisterForm } from "@/components/auth/RegisterForm";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Star, Zap, Globe } from "lucide-react";

export default async function RegisterPage() {
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
          background: "linear-gradient(150deg, #0d1f1a 0%, #091512 100%)",
          borderRight: "1px solid var(--border)",
          flexShrink: 0,
        }}
        className="register-panel"
      >
        {/* Glow orbs */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            right: "10%",
            width: "340px",
            height: "340px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(20,184,166,0.2) 0%, transparent 70%)",
            filter: "blur(50px)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "20%",
            left: "10%",
            width: "260px",
            height: "260px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.16) 0%, transparent 70%)",
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: "60px",
            right: "-80px",
            width: "280px",
            height: "280px",
            borderRadius: "50%",
            border: "1px solid rgba(20,184,166,0.1)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-60px",
            left: "-60px",
            width: "380px",
            height: "380px",
            borderRadius: "50%",
            border: "1px solid rgba(20,184,166,0.07)",
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
            Let's go!
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: "var(--text-2)",
              lineHeight: 1.6,
              marginBottom: "40px",
            }}
          >
            Start speaking from day one.
          </p>

          {/* Benefit list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", textAlign: "left" }}>
            {[
              { icon: Zap, label: "Up and running in 60 seconds", color: "var(--gold)" },
              { icon: Star, label: "No credit card required", color: "var(--teal)" },
              { icon: Globe, label: "French & Spanish supported", color: "var(--accent-2)" },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <item.icon size={14} style={{ color: item.color }} />
                </div>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)" }}>
                  {item.label}
                </span>
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
              LG
            </div>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "18px",
                color: "var(--text)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              Lingova
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
            Create your account
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "var(--text-2)",
              marginBottom: "32px",
              lineHeight: 1.5,
            }}
          >
            Takes 60 seconds — no credit card needed
          </p>

          {/* Form */}
          <RegisterForm />

          {/* Log in link */}
          <p
            style={{
              textAlign: "center",
              fontSize: "13px",
              color: "var(--text-3)",
              marginTop: "24px",
            }}
          >
            Already learning?{" "}
            <Link
              href="/login"
              style={{
                color: "var(--accent)",
                fontWeight: 600,
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              Log in
            </Link>
          </p>
        </div>
      </div>

      {/* Responsive: show left panel on large screens */}
      <style>{`
        @media (min-width: 1024px) {
          .register-panel {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
