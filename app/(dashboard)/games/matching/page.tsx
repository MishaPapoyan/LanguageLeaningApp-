import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MatchingGame } from "@/components/games/MatchingGame";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Matching Game — LangCraft",
  description: "Match French words with their English translations",
};

export default async function MatchingPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? "";

  let savedWords: any[] = [];
  let words: any[] = [];

  try {
    if (userId) {
      savedWords = await prisma.savedWord.findMany({
        where: { userId },
        include: { word: true },
        take: 8,
      });
    }
    words = savedWords.length >= 4
      ? savedWords.map((sw: any) => sw.word)
      : await prisma.word.findMany({ where: { difficulty: "BEGINNER" }, take: 8 });
  } catch (err) {
    console.error("[matching] DB error:", err);
    words = [];
  }

  return (
    <div className="max-w-2xl animate-fade-up">
      <div className="mb-6">
        <h1 className="text-2xl font-serif text-zinc-900">Word Matching</h1>
        <p className="text-sm text-zinc-500 mt-1">Match each French word to its English translation</p>
      </div>
      <MatchingGame words={words.slice(0, 6) as any} />
    </div>
  );
}
