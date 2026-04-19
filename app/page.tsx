import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import {
  BookOpen,
  MessageCircle,
  Gamepad2,
  PenLine,
  RotateCcw,
  BarChart3,
  ArrowRight,
  Star,
  Users,
  Trophy,
  Globe,
  ChevronRight,
  Zap,
} from "lucide-react";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/home");

  const features = [
    {
      icon: BookOpen,
      title: "Stories",
      desc: "Tap any word to translate it instantly",
      tag: "Reading",
      color: "var(--gold)",
      colorDim: "rgba(234,179,8,0.12)",
    },
    {
      icon: MessageCircle,
      title: "AI Tutor",
      desc: "Real conversations that adapt to you",
      tag: "Speaking",
      color: "var(--accent)",
      colorDim: "var(--accent-dim)",
    },
    {
      icon: Gamepad2,
      title: "Games",
      desc: "Flashcards, matching & memory palace",
      tag: "Vocab",
      color: "var(--teal)",
      colorDim: "rgba(20,184,166,0.12)",
    },
    {
      icon: PenLine,
      title: "Writing",
      desc: "Write & get instant feedback",
      tag: "Grammar",
      color: "var(--coral)",
      colorDim: "rgba(251,113,133,0.12)",
    },
    {
      icon: RotateCcw,
      title: "Spaced Review",
      desc: "Smart repetition so you never forget",
      tag: "Memory",
      color: "var(--green)",
      colorDim: "rgba(34,197,94,0.12)",
    },
    {
      icon: BarChart3,
      title: "Analytics",
      desc: "See exactly where you stand",
      tag: "Progress",
      color: "var(--blue)",
      colorDim: "rgba(59,130,246,0.12)",
    },
  ];

  const words = [
    { fr: "Bonjour", en: "Hello" },
    { fr: "Hola", en: "Hi" },
    { fr: "Merci", en: "Thank you" },
    { fr: "Gracias", en: "Thanks" },
  ];

  const wordPositions = [
    { top: "4%", right: "2%" },
    { top: "28%", left: "0%" },
    { bottom: "22%", right: "10%" },
    { bottom: "4%", left: "6%" },
  ];

  const wordRotations = ["-2deg", "1.5deg", "2.5deg", "-1.5deg"];

  const steps = [
    {
      n: "01",
      title: "Read stories",
      desc: "Short stories with tap-to-translate. Learn words in context, not from lists.",
      accent: "var(--gold)",
    },
    {
      n: "02",
      title: "Talk with AI",
      desc: "Order coffee, ask directions, chat freely. The AI tutor corrects you gently in real-time.",
      accent: "var(--accent)",
    },
    {
      n: "03",
      title: "Play & remember",
      desc: "Flashcards, matching games, and a memory palace. Your brain does the rest.",
      accent: "var(--teal)",
    },
  ];

  return (
    <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh" }}>

      {/* Sticky Nav */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          borderBottom: "1px solid var(--border)",
          backdropFilter: "blur(12px)",
          background: "rgba(var(--bg-rgb, 10,10,18), 0.85)",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "0 24px",
            height: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
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
            <span style={{ fontFamily: "serif", fontSize: "18px", color: "var(--text)", fontWeight: 500 }}>
              LangCraft
            </span>
            <span style={{ fontSize: "15px", lineHeight: 1 }}>{"\u{1F30D}"}</span>
          </Link>

          {/* Nav actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Link href="/login" className="btn-ghost" style={{ fontSize: "14px", cursor: "pointer" }}>
              Log in
            </Link>
            <Link
              href="/register"
              className="btn-primary"
              style={{ fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
            >
              Start free
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "80px 24px 64px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "48px",
            alignItems: "center",
          }}
          className="hero-grid"
        >
          {/* Left copy */}
          <div style={{ maxWidth: "600px" }}>
            {/* Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "5px 12px",
                borderRadius: "999px",
                background: "var(--accent-dim)",
                color: "var(--accent-2)",
                fontSize: "12px",
                fontWeight: 600,
                marginBottom: "28px",
                border: "1px solid rgba(99,102,241,0.25)",
              }}
            >
              <Zap size={11} />
              For absolute beginners &amp; returners
            </div>

            {/* Headline */}
            <h1
              style={{
                fontFamily: "serif",
                fontSize: "clamp(44px, 7vw, 72px)",
                lineHeight: 1.05,
                margin: "0 0 24px",
                color: "var(--text)",
                letterSpacing: "-0.02em",
              }}
            >
              Learn languages,
              <br />
              <em style={{ color: "var(--accent)", fontStyle: "italic" }}>naturally.</em>
            </h1>

            <p
              style={{
                fontSize: "18px",
                lineHeight: 1.7,
                color: "var(--text-2)",
                maxWidth: "420px",
                margin: "0 0 36px",
              }}
            >
              Stories, AI conversations, and games — no textbook, no memorisation. Just start talking.
            </p>

            {/* CTAs */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              <Link
                href="/register"
                className="btn-primary"
                style={{
                  fontSize: "15px",
                  padding: "12px 28px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                Start learning free
                <ArrowRight size={15} />
              </Link>
              <Link
                href="/login"
                className="btn-ghost"
                style={{
                  fontSize: "15px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "var(--text-2)",
                }}
              >
                I have an account
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          {/* Right — floating word cards */}
          <div
            style={{
              position: "relative",
              height: "420px",
              display: "none",
            }}
            className="hero-cards"
          >
            {/* Glow orb */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "280px",
                height: "280px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
                filter: "blur(24px)",
                pointerEvents: "none",
              }}
            />
            {words.map((w, i) => (
              <div
                key={w.fr}
                style={{
                  position: "absolute",
                  ...wordPositions[i],
                  transform: `rotate(${wordRotations[i]})`,
                  background: "var(--surface-2)",
                  border: "1px solid var(--border-md)",
                  borderRadius: "16px",
                  padding: "16px 24px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
                }}
              >
                <p
                  style={{
                    fontFamily: "serif",
                    fontSize: "22px",
                    color: "var(--text)",
                    margin: 0,
                  }}
                >
                  {w.fr}
                </p>
                <p style={{ fontSize: "13px", color: "var(--text-2)", margin: "4px 0 0" }}>
                  {w.en}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div
          style={{
            marginTop: "56px",
            paddingTop: "28px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: "32px",
            flexWrap: "wrap",
          }}
        >
          {[
            { icon: Users, label: "2,400+ learners" },
            { icon: BookOpen, label: "50+ stories" },
            { icon: Globe, label: "Free forever" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "var(--text-3)",
                fontSize: "13px",
                fontWeight: 500,
              }}
            >
              <stat.icon size={14} style={{ color: "var(--accent-2)" }} />
              {stat.label}
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "64px 24px" }}>
        <p
          style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--text-3)",
            marginBottom: "10px",
          }}
        >
          How it works
        </p>
        <h2
          style={{
            fontFamily: "serif",
            fontSize: "clamp(26px, 4vw, 36px)",
            color: "var(--text)",
            marginBottom: "32px",
            letterSpacing: "-0.01em",
          }}
        >
          Three steps to fluency
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
          }}
        >
          {steps.map((s) => (
            <div
              key={s.n}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderLeft: `3px solid ${s.accent}`,
                borderRadius: "12px",
                padding: "24px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  color: s.accent,
                }}
              >
                {s.n}
              </span>
              <h3
                style={{
                  fontFamily: "serif",
                  fontSize: "20px",
                  color: "var(--text)",
                  margin: "8px 0 8px",
                }}
              >
                {s.title}
              </h3>
              <p style={{ fontSize: "14px", lineHeight: 1.65, color: "var(--text-2)", margin: 0 }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature grid */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "64px 24px" }}>
        <p
          style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--text-3)",
            marginBottom: "10px",
          }}
        >
          Everything you need
        </p>
        <h2
          style={{
            fontFamily: "serif",
            fontSize: "clamp(26px, 4vw, 36px)",
            color: "var(--text)",
            marginBottom: "32px",
            letterSpacing: "-0.01em",
          }}
        >
          Six ways to learn
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "12px",
          }}
        >
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "14px",
                  padding: "22px",
                  transition: "border-color 0.2s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: "14px",
                  }}
                >
                  {/* Icon box */}
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: f.colorDim,
                      border: `1px solid ${f.color}33`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={18} style={{ color: f.color }} />
                  </div>

                  {/* Tag pill */}
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: f.color,
                      background: f.colorDim,
                      border: `1px solid ${f.color}33`,
                      borderRadius: "999px",
                      padding: "3px 9px",
                    }}
                  >
                    {f.tag}
                  </span>
                </div>
                <h3
                  style={{
                    fontFamily: "serif",
                    fontSize: "18px",
                    color: "var(--text)",
                    margin: "0 0 6px",
                  }}
                >
                  {f.title}
                </h3>
                <p style={{ fontSize: "13px", lineHeight: 1.6, color: "var(--text-2)", margin: 0 }}>
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Social proof strip */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" }}>
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            padding: "24px 32px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", gap: "3px" }}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={16} style={{ color: "var(--gold)", fill: "var(--gold)" }} />
            ))}
          </div>
          <p style={{ fontSize: "14px", color: "var(--text-2)", margin: 0 }}>
            <strong style={{ color: "var(--text)" }}>Loved by 2,400+ learners.</strong>{" "}
            &ldquo;The most natural way I&rsquo;ve ever learned a language.&rdquo;
          </p>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px" }}>
            <Trophy size={14} style={{ color: "var(--gold)" }} />
            <span style={{ fontSize: "12px", color: "var(--text-3)", fontWeight: 500 }}>
              #1 language learning app
            </span>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 24px 80px" }}>
        <div
          style={{
            borderRadius: "20px",
            background: "linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(91,79,207,0.12) 60%, rgba(20,184,166,0.08) 100%)",
            border: "1px solid rgba(99,102,241,0.3)",
            padding: "56px 48px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative glow */}
          <div
            style={{
              position: "absolute",
              top: "-60px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "400px",
              height: "200px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)",
              filter: "blur(30px)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 14px",
              borderRadius: "999px",
              background: "var(--accent-dim)",
              color: "var(--accent-2)",
              fontSize: "12px",
              fontWeight: 600,
              marginBottom: "20px",
              border: "1px solid rgba(99,102,241,0.3)",
            }}
          >
            <Zap size={11} />
            Free — no credit card needed
          </div>

          <h2
            style={{
              fontFamily: "serif",
              fontSize: "clamp(28px, 5vw, 48px)",
              color: "var(--text)",
              margin: "0 0 16px",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              position: "relative",
            }}
          >
            Ready to start speaking?
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: "var(--text-2)",
              maxWidth: "380px",
              margin: "0 auto 32px",
              lineHeight: 1.6,
              position: "relative",
            }}
          >
            Join thousands of learners who ditched the textbook and actually started talking.
          </p>
          <Link
            href="/register"
            className="btn-primary"
            style={{
              fontSize: "15px",
              padding: "13px 32px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              position: "relative",
            }}
          >
            Start learning for free
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          color: "var(--text-3)",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            fontSize: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "5px",
                background: "linear-gradient(135deg, #7c6aff 0%, #5b4fcf 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 700,
                fontSize: "8px",
              }}
            >
              LC
            </div>
            <span>© 2026 LangCraft. All rights reserved.</span>
          </div>
          <div style={{ display: "flex", gap: "20px" }}>
            <Link
              href="/login"
              style={{ color: "var(--text-3)", textDecoration: "none" }}
            >
              Log in
            </Link>
            <Link
              href="/register"
              style={{ color: "var(--text-3)", textDecoration: "none" }}
            >
              Sign up
            </Link>
          </div>
        </div>
      </footer>

      {/* Responsive styles */}
      <style>{`
        @media (min-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .hero-cards {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
