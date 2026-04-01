import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Games — LinguaFlow",
  description: "Practice French vocabulary with fun games",
};

const GAMES = [
  {
    href: "/games/flashcards",
    emoji: "🃏",
    title: "Flashcards",
    desc: "See a French word, recall its meaning, flip to check.",
    bg: "bg-sky-50 border-sky-100/50",
    tag: "Easy",
    xp: "10-20",
  },
  {
    href: "/games/matching",
    emoji: "🎯",
    title: "Word Matching",
    desc: "Match French words to English translations. Race the clock!",
    bg: "bg-rose-50 border-rose-100/50",
    tag: "Medium",
    xp: "10-20",
  },
  {
    href: "/games/memory-palace",
    emoji: "☕",
    title: "Memory Palace",
    desc: "Place words in a virtual cafe to build spatial memory.",
    bg: "bg-violet-50 border-violet-100/50",
    tag: "Medium",
    xp: "10-20",
  },
];

export default function GamesPage() {
  return (
    <div className="max-w-3xl">
      <div className="flex items-start gap-3 bg-violet-50 rounded-xl p-4 mb-6 border border-violet-100/50">
        <span className="text-lg">✨</span>
        <p className="text-sm text-violet-800">
          New here? Start with <strong>Flashcards</strong> — simplest words, your own pace.
        </p>
      </div>

      <div className="space-y-3">
        {GAMES.map((game) => (
          <Link key={game.href} href={game.href}
            className={`flex items-center gap-5 rounded-2xl p-5 border ${game.bg} group hover:shadow-sm transition-all`}>
            <div className="w-16 h-16 rounded-2xl bg-white/70 flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-105 transition-transform">
              {game.emoji}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-serif text-xl text-zinc-900">{game.title}</h3>
                <span className="badge-gray">{game.tag}</span>
              </div>
              <p className="text-sm text-zinc-500">{game.desc}</p>
              <p className="text-[11px] text-violet-500 font-semibold mt-1.5">{game.xp} XP per game</p>
            </div>
            <svg className="w-5 h-5 text-zinc-300 group-hover:text-violet-400 group-hover:translate-x-1 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
