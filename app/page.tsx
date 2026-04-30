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
  ChevronRight,
  Zap,
  Check,
  Sparkles,
  Globe2,
  BrainCircuit,
} from "lucide-react";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/home");

  const features = [
    {
      icon: BookOpen,
      title: "Stories",
      desc: "Tap any word to translate it instantly. Learn in context, not from lists.",
      tag: "Reading",
      color: "var(--gold)",
      colorDim: "rgba(234,179,8,0.12)",
    },
    {
      icon: MessageCircle,
      title: "AI Tutor",
      desc: "Real conversations that adapt to your level and correct you gently.",
      tag: "Speaking",
      color: "var(--accent)",
      colorDim: "var(--accent-dim)",
    },
    {
      icon: Gamepad2,
      title: "Games",
      desc: "Flashcards, matching, memory palace — vocabulary that actually sticks.",
      tag: "Vocab",
      color: "var(--teal)",
      colorDim: "rgba(20,184,166,0.12)",
    },
    {
      icon: PenLine,
      title: "Writing",
      desc: "Write sentences and paragraphs, get instant AI grammar feedback.",
      tag: "Grammar",
      color: "var(--coral)",
      colorDim: "rgba(251,113,133,0.12)",
    },
    {
      icon: RotateCcw,
      title: "Spaced Review",
      desc: "Smart repetition so your brain stores words in long-term memory.",
      tag: "Memory",
      color: "var(--green)",
      colorDim: "rgba(34,197,94,0.12)",
    },
    {
      icon: BarChart3,
      title: "Analytics",
      desc: "See your XP, streaks, skill tree, and exactly where to improve.",
      tag: "Progress",
      color: "var(--blue)",
      colorDim: "rgba(59,130,246,0.12)",
    },
  ];

  const steps = [
    {
      n: "01",
      title: "Read stories",
      desc: "Short stories with tap-to-translate. Learn words in context, not from lists.",
      accent: "var(--gold)",
      icon: BookOpen,
    },
    {
      n: "02",
      title: "Talk with AI",
      desc: "Order coffee, ask directions, chat freely. The AI tutor corrects you gently in real-time.",
      accent: "var(--accent)",
      icon: MessageCircle,
    },
    {
      n: "03",
      title: "Play & remember",
      desc: "Flashcards, matching games, and a memory palace. Your brain does the rest.",
      accent: "var(--teal)",
      icon: Gamepad2,
    },
  ];

  const pillars = [
    { label: "No credit card required", icon: Check },
    { label: "French & Spanish", icon: Globe2 },
    { label: "AI-powered learning", icon: BrainCircuit },
    { label: "Personalised path", icon: Sparkles },
  ];

  return (
    <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh" }}>

      {/* Sticky Nav */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(16px)",
        background: "rgba(var(--bg-rgb, 10,10,18), 0.82)",
      }}>
        <div style={{
          maxWidth: "1100px", margin: "0 auto", padding: "0 24px",
          height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "8px",
              background: "linear-gradient(135deg, #7c6aff 0%, #5b4fcf 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontWeight: 700, fontSize: "11px", letterSpacing: "0.05em", flexShrink: 0,
            }}>LG</div>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "18px", color: "var(--text)", fontWeight: 800, letterSpacing: "-0.02em" }}>Lingova</span>
            <span style={{ fontSize: "15px", lineHeight: 1 }}>{"\u{1F30D}"}</span>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Link href="/login" className="btn-ghost" style={{ fontSize: "14px", cursor: "pointer" }}>Log in</Link>
            <Link href="/register" className="btn-primary" style={{ fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              Get started <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "96px 24px 72px" }}>
        <div style={{ display: "grid", gap: "48px", alignItems: "center" }} className="hero-grid">

          {/* Left copy */}
          <div style={{ maxWidth: "600px" }}>
            {/* Badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "5px 14px", borderRadius: "999px",
              background: "var(--accent-dim)", color: "var(--accent-2)",
              fontSize: "12px", fontWeight: 600, marginBottom: "28px",
              border: "1px solid rgba(99,102,241,0.25)",
            }}>
              <Zap size={11} /> AI-powered language learning
            </div>

            <h1 style={{
              fontFamily: "serif",
              fontSize: "clamp(44px, 7vw, 72px)",
              lineHeight: 1.05, margin: "0 0 24px",
              color: "var(--text)", letterSpacing: "-0.02em",
            }}>
              Learn languages,<br />
              <em style={{ color: "var(--accent)", fontStyle: "italic" }}>naturally.</em>
            </h1>

            <p style={{ fontSize: "18px", lineHeight: 1.75, color: "var(--text-2)", maxWidth: "440px", margin: "0 0 40px" }}>
              Stories, AI conversations, and games — no textbook, no memorisation grids. Just start talking.
            </p>

            {/* CTAs */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", marginBottom: "40px" }}>
              <Link href="/register" className="btn-primary" style={{
                fontSize: "15px", padding: "13px 28px", cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: "8px",
              }}>
                Start for free <ArrowRight size={15} />
              </Link>
              <Link href="/login" className="btn-ghost" style={{
                fontSize: "15px", cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-2)",
              }}>
                I have an account <ChevronRight size={14} />
              </Link>
            </div>

            {/* Trust pillars */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {pillars.map((p) => (
                <div key={p.label} style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "5px 12px", borderRadius: "999px",
                  background: "var(--surface)", border: "1px solid var(--border)",
                  fontSize: "12px", color: "var(--text-3)", fontWeight: 500,
                }}>
                  <p.icon size={11} style={{ color: "var(--accent-2)" }} />
                  {p.label}
                </div>
              ))}
            </div>
          </div>

          {/* Right — floating word cards */}
          <div style={{ position: "relative", height: "420px", display: "none" }} className="hero-cards">
            {/* Glow orb */}
            <div style={{
              position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
              width: "300px", height: "300px", borderRadius: "50%",
              background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
              filter: "blur(28px)", pointerEvents: "none",
            }} />

            {/* Central card */}
            <div style={{
              position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
              background: "var(--surface-2)", border: "1px solid var(--border-md)",
              borderRadius: "20px", padding: "24px 32px", textAlign: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
              minWidth: "200px",
            }}>
              <div style={{ fontSize: "36px", marginBottom: "8px" }}>🇫🇷</div>
              <p style={{ fontFamily: "serif", fontSize: "28px", color: "var(--text)", margin: "0 0 4px" }}>Bonjour</p>
              <p style={{ fontSize: "13px", color: "var(--text-3)", margin: 0 }}>Hello · French</p>
            </div>

            {[
              { top: "6%", right: "4%", word: "Merci", flag: "🇫🇷", en: "Thank you", rotate: "-2deg" },
              { top: "18%", left: "2%", word: "Hola", flag: "🇪🇸", en: "Hello", rotate: "1.5deg" },
              { bottom: "14%", right: "8%", word: "Amigo", flag: "🇪🇸", en: "Friend", rotate: "2deg" },
              { bottom: "6%", left: "10%", word: "Bonsoir", flag: "🇫🇷", en: "Good evening", rotate: "-1.5deg" },
            ].map((w) => (
              <div key={w.word} style={{
                position: "absolute",
                top: w.top, right: w.right, bottom: w.bottom, left: w.left,
                transform: `rotate(${w.rotate})`,
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: "14px", padding: "12px 18px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
              }}>
                <p style={{ fontFamily: "serif", fontSize: "17px", color: "var(--text)", margin: "0 0 2px" }}>
                  {w.flag} {w.word}
                </p>
                <p style={{ fontSize: "12px", color: "var(--text-3)", margin: 0 }}>{w.en}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "64px 24px" }}>
        <p style={{
          fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em",
          textTransform: "uppercase", color: "var(--text-3)", marginBottom: "10px",
        }}>How it works</p>
        <h2 style={{
          fontFamily: "serif", fontSize: "clamp(26px, 4vw, 38px)",
          color: "var(--text)", marginBottom: "12px", letterSpacing: "-0.01em",
        }}>Three steps to fluency</h2>
        <p style={{ fontSize: "15px", color: "var(--text-2)", marginBottom: "40px", maxWidth: "480px" }}>
          A complete learning loop — read, speak, and practice — all in one place.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.n} style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: "16px", padding: "28px",
                position: "relative", overflow: "hidden",
              }}>
                {/* Number watermark */}
                <span style={{
                  position: "absolute", top: "12px", right: "18px",
                  fontSize: "52px", fontWeight: 800, color: `${s.accent}18`,
                  fontFamily: "serif", lineHeight: 1, pointerEvents: "none",
                }}>{s.n}</span>

                <div style={{
                  width: "42px", height: "42px", borderRadius: "12px",
                  background: `${s.accent}18`, border: `1px solid ${s.accent}33`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "16px",
                }}>
                  <Icon size={18} style={{ color: s.accent }} />
                </div>

                <h3 style={{ fontFamily: "serif", fontSize: "20px", color: "var(--text)", margin: "0 0 8px" }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: "14px", lineHeight: 1.65, color: "var(--text-2)", margin: 0 }}>
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature grid */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px 64px" }}>
        <p style={{
          fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em",
          textTransform: "uppercase", color: "var(--text-3)", marginBottom: "10px",
        }}>Everything you need</p>
        <h2 style={{
          fontFamily: "serif", fontSize: "clamp(26px, 4vw, 38px)",
          color: "var(--text)", marginBottom: "40px", letterSpacing: "-0.01em",
        }}>Six ways to learn</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: "14px", padding: "22px", transition: "border-color 0.2s",
              }}>
                <div style={{
                  display: "flex", alignItems: "flex-start",
                  justifyContent: "space-between", marginBottom: "14px",
                }}>
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "10px",
                    background: f.colorDim, border: `1px solid ${f.color}33`,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <Icon size={18} style={{ color: f.color }} />
                  </div>
                  <span style={{
                    fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em",
                    textTransform: "uppercase", color: f.color, background: f.colorDim,
                    border: `1px solid ${f.color}33`, borderRadius: "999px", padding: "3px 9px",
                  }}>{f.tag}</span>
                </div>
                <h3 style={{ fontFamily: "serif", fontSize: "18px", color: "var(--text)", margin: "0 0 6px" }}>{f.title}</h3>
                <p style={{ fontSize: "13px", lineHeight: 1.6, color: "var(--text-2)", margin: 0 }}>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 24px 96px" }}>
        <div style={{
          borderRadius: "24px",
          background: "linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(91,79,207,0.10) 60%, rgba(20,184,166,0.07) 100%)",
          border: "1px solid rgba(99,102,241,0.28)",
          padding: "clamp(40px, 6vw, 72px) clamp(24px, 5vw, 64px)",
          textAlign: "center", position: "relative", overflow: "hidden",
        }}>
          {/* Decorative glow */}
          <div style={{
            position: "absolute", top: "-80px", left: "50%", transform: "translateX(-50%)",
            width: "500px", height: "280px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)",
            filter: "blur(40px)", pointerEvents: "none",
          }} />
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "5px 14px", borderRadius: "999px",
            background: "var(--accent-dim)", color: "var(--accent-2)",
            fontSize: "12px", fontWeight: 600, marginBottom: "24px",
            border: "1px solid rgba(99,102,241,0.3)", position: "relative",
          }}>
            <Zap size={11} /> No credit card, no catch
          </div>

          <h2 style={{
            fontFamily: "serif", fontSize: "clamp(30px, 5vw, 52px)",
            color: "var(--text)", margin: "0 0 16px", letterSpacing: "-0.02em",
            lineHeight: 1.1, position: "relative",
          }}>Ready to start speaking?</h2>
          <p style={{
            fontSize: "16px", color: "var(--text-2)", maxWidth: "380px",
            margin: "0 auto 36px", lineHeight: 1.65, position: "relative",
          }}>
            Pick your language, set your goal, and start your first lesson in under two minutes.
          </p>
          <Link href="/register" className="btn-primary" style={{
            fontSize: "15px", padding: "14px 36px", cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: "8px", position: "relative",
          }}>
            Create free account <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", color: "var(--text-3)" }}>
        <div style={{
          maxWidth: "1100px", margin: "0 auto", padding: "24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: "12px", fontSize: "12px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{
              width: "22px", height: "22px", borderRadius: "5px",
              background: "linear-gradient(135deg, #7c6aff 0%, #5b4fcf 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontWeight: 700, fontSize: "8px",
            }}>LG</div>
            <span>© 2026 Lingova. All rights reserved.</span>
          </div>
          <div style={{ display: "flex", gap: "20px" }}>
            <Link href="/login" style={{ color: "var(--text-3)", textDecoration: "none" }}>Log in</Link>
            <Link href="/register" style={{ color: "var(--text-3)", textDecoration: "none" }}>Sign up</Link>
          </div>
        </div>
      </footer>

      <style>{`
        @media (min-width: 900px) {
          .hero-grid { grid-template-columns: 1fr 1fr !important; }
          .hero-cards { display: block !important; }
        }
      `}</style>
    </div>
  );
}
