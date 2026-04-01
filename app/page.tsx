import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/home");

  const features = [
    { emoji: "📖", title: "Stories", desc: "Tap any word to translate it instantly", color: "bg-amber-50 border-amber-100", tag: "Reading" },
    { emoji: "💬", title: "AI Tutor", desc: "Real conversations that adapt to you", color: "bg-violet-50 border-violet-100", tag: "Speaking" },
    { emoji: "🎮", title: "Games", desc: "Flashcards, matching & memory palace", color: "bg-rose-50 border-rose-100", tag: "Vocab" },
    { emoji: "✍️", title: "Writing", desc: "Write French & get instant feedback", color: "bg-emerald-50 border-emerald-100", tag: "Grammar" },
    { emoji: "🔄", title: "Spaced Review", desc: "Smart repetition so you never forget", color: "bg-sky-50 border-sky-100", tag: "Memory" },
    { emoji: "📊", title: "Analytics", desc: "See exactly where you stand", color: "bg-orange-50 border-orange-100", tag: "Progress" },
  ];

  const words = [
    { fr: "Bonjour", en: "Hello", color: "bg-violet-50" },
    { fr: "Merci", en: "Thank you", color: "bg-amber-50" },
    { fr: "S'il vous plaît", en: "Please", color: "bg-rose-50" },
    { fr: "Comment ça va?", en: "How are you?", color: "bg-emerald-50" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Nav */}
      <header className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
            LF
          </div>
          <span className="font-serif text-lg text-zinc-900">LinguaFlow</span>
        </div>
        <div className="flex gap-2 items-center">
          <Link href="/login" className="btn-ghost text-sm">Log in</Link>
          <Link href="/register" className="btn-primary text-sm">Start free</Link>
        </div>
      </header>

      {/* Hero - asymmetric */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 text-violet-600 text-xs font-semibold mb-6">
              🇫🇷 For absolute beginners
            </div>
            <h1 className="text-5xl lg:text-6xl font-serif text-zinc-900 leading-[1.1] mb-6">
              Learn French,<br />
              <span className="italic text-violet-600">naturally.</span>
            </h1>
            <p className="text-lg text-zinc-500 mb-8 max-w-md leading-relaxed">
              Stories, AI conversations, and games — no textbook, no memorization. Just start talking.
            </p>
            <div className="flex gap-3 items-center">
              <Link href="/register" className="btn-primary text-base px-7 py-3">
                Start learning
              </Link>
              <span className="text-sm text-zinc-400">Free forever</span>
            </div>
          </div>

          {/* Right: floating word cards */}
          <div className="hidden lg:block relative h-[400px]">
            {words.map((w, i) => {
              const positions = [
                "top-0 right-0",
                "top-24 left-0",
                "bottom-16 right-12",
                "bottom-0 left-8",
              ];
              const rotations = ["-rotate-2", "rotate-1", "rotate-2", "-rotate-1"];
              return (
                <div
                  key={w.fr}
                  className={`absolute ${positions[i]} ${rotations[i]} ${w.color} rounded-2xl px-6 py-4 border border-zinc-100 shadow-sm`}
                >
                  <p className="text-2xl font-serif text-zinc-900">{w.fr}</p>
                  <p className="text-sm text-zinc-500">{w.en}</p>
                </div>
              );
            })}
            {/* Decorative circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-br from-violet-100 to-indigo-50 -z-10" />
          </div>
        </div>
      </section>

      {/* How it works - numbered steps */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 mb-8">How it works</p>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { n: "01", title: "Read stories", desc: "Short French stories with tap-to-translate. Learn words in context, not from lists.", color: "border-l-amber-400" },
            { n: "02", title: "Talk with AI", desc: "Order coffee, ask directions, chat freely. The AI tutor corrects you gently in real-time.", color: "border-l-violet-400" },
            { n: "03", title: "Play & remember", desc: "Flashcards, matching games, and a memory palace. Your brain does the rest.", color: "border-l-rose-400" },
          ].map((s) => (
            <div key={s.n} className={`bg-white rounded-xl p-6 border border-zinc-100 border-l-4 ${s.color}`}>
              <span className="text-xs font-bold text-zinc-300">{s.n}</span>
              <h3 className="font-serif text-xl text-zinc-900 mt-2 mb-2">{s.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature grid */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2">Everything you need</p>
        <h2 className="font-serif text-3xl text-zinc-900 mb-8">Six ways to learn</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {features.map((f) => (
            <div key={f.title} className={`rounded-xl p-5 border ${f.color} group`}>
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{f.emoji}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{f.tag}</span>
              </div>
              <h3 className="font-serif text-lg text-zinc-900">{f.title}</h3>
              <p className="text-sm text-zinc-500 mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo CTA */}
      <section className="max-w-lg mx-auto px-6 py-16 text-center">
        <div className="bg-white rounded-2xl p-8 border border-zinc-100 shadow-sm">
          <p className="text-sm text-zinc-500 mb-1">Want to explore first?</p>
          <p className="text-sm text-zinc-600">
            Log in with{" "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-xs text-zinc-700">student@demo.com</code>
            {" / "}
            <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-xs text-zinc-700">demo123</code>
          </p>
          <Link href="/login" className="btn-primary mt-4">Try the demo</Link>
        </div>
      </section>
    </div>
  );
}
