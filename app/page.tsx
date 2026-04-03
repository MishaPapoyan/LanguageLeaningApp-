import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/home");

  const features = [
    { emoji: "📖", title: "Stories", desc: "Tap any word to translate it instantly", tag: "Reading" },
    { emoji: "💬", title: "AI Tutor", desc: "Real conversations that adapt to you", tag: "Speaking" },
    { emoji: "🎮", title: "Games", desc: "Flashcards, matching & memory palace", tag: "Vocab" },
    { emoji: "✍️", title: "Writing", desc: "Write French & get instant feedback", tag: "Grammar" },
    { emoji: "🔄", title: "Spaced Review", desc: "Smart repetition so you never forget", tag: "Memory" },
    { emoji: "📊", title: "Analytics", desc: "See exactly where you stand", tag: "Progress" },
  ];

  const words = [
    { fr: "Bonjour", en: "Hello" },
    { fr: "Merci", en: "Thank you" },
    { fr: "S'il vous plaît", en: "Please" },
    { fr: "Comment ça va?", en: "How are you?" },
  ];

  const positions = ["top-0 right-0", "top-24 left-0", "bottom-16 right-12", "bottom-0 left-8"];
  const rotations = ["-rotate-2", "rotate-1", "rotate-2", "-rotate-1"];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--text)" }}>

      {/* Nav */}
      <header className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
            style={{ background: "linear-gradient(135deg, #7c6aff 0%, #5b4fcf 100%)" }}>
            LF
          </div>
          <span className="font-serif text-lg" style={{ color: "var(--text)" }}>LinguaFlow</span>
        </div>
        <div className="flex gap-2 items-center">
          <Link href="/login" className="btn-ghost text-sm">Log in</Link>
          <Link href="/register" className="btn-primary text-sm">Start free</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-6"
              style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>
              🇫🇷 For absolute beginners
            </div>
            <h1 className="text-5xl lg:text-6xl font-serif leading-[1.1] mb-6" style={{ color: "var(--text)" }}>
              Learn French,<br />
              <span className="italic" style={{ color: "var(--accent)" }}>naturally.</span>
            </h1>
            <p className="text-lg mb-8 max-w-md leading-relaxed" style={{ color: "var(--text-2)" }}>
              Stories, AI conversations, and games — no textbook, no memorization. Just start talking.
            </p>
            <div className="flex gap-3 items-center">
              <Link href="/register" className="btn-primary text-base px-7 py-3">Start learning</Link>
              <span className="text-sm" style={{ color: "var(--text-3)" }}>Free forever</span>
            </div>
          </div>

          {/* Floating word cards */}
          <div className="hidden lg:block relative h-[400px]">
            {words.map((w, i) => (
              <div
                key={w.fr}
                className={`absolute ${positions[i]} ${rotations[i]} rounded-2xl px-6 py-4`}
                style={{ background: "var(--surface-2)", border: "1px solid var(--border-md)" }}
              >
                <p className="text-2xl font-serif" style={{ color: "var(--text)" }}>{w.fr}</p>
                <p className="text-sm" style={{ color: "var(--text-2)" }}>{w.en}</p>
              </div>
            ))}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full -z-10"
              style={{ background: "radial-gradient(circle, rgba(124,106,255,0.15) 0%, transparent 70%)" }} />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-8" style={{ color: "var(--text-3)" }}>How it works</p>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { n: "01", title: "Read stories", desc: "Short French stories with tap-to-translate. Learn words in context, not from lists.", accent: "var(--gold)" },
            { n: "02", title: "Talk with AI", desc: "Order coffee, ask directions, chat freely. The AI tutor corrects you gently in real-time.", accent: "var(--accent)" },
            { n: "03", title: "Play & remember", desc: "Flashcards, matching games, and a memory palace. Your brain does the rest.", accent: "var(--red)" },
          ].map((s) => (
            <div key={s.n} className="rounded-xl p-6"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", borderLeft: `3px solid ${s.accent}` }}>
              <span className="text-xs font-bold" style={{ color: "var(--text-3)" }}>{s.n}</span>
              <h3 className="font-serif text-xl mt-2 mb-2" style={{ color: "var(--text)" }}>{s.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature grid */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2" style={{ color: "var(--text-3)" }}>Everything you need</p>
        <h2 className="font-serif text-3xl mb-8" style={{ color: "var(--text)" }}>Six ways to learn</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl p-5"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{f.emoji}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>{f.tag}</span>
              </div>
              <h3 className="font-serif text-lg" style={{ color: "var(--text)" }}>{f.title}</h3>
              <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between text-xs"
        style={{ borderTop: "1px solid var(--border)", color: "var(--text-3)" }}>
        <span>© 2026 LinguaFlow</span>
        <div className="flex gap-6">
          <Link href="/login" style={{ color: "var(--text-3)" }} className="hover:underline">Log in</Link>
          <Link href="/register" style={{ color: "var(--text-3)" }} className="hover:underline">Sign up</Link>
        </div>
      </footer>

    </div>
  );
}
