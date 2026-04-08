import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MatchingGame } from "@/components/games/MatchingGame";
import { ErrorBoundary } from "@/components/ErrorBoundary";
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

  const perfectCount = userId ? await prisma.gameScore.count({ where: { userId, score: 100 } }) : 0;

  try {
    if (userId) {
      const savedCount = await prisma.savedWord.count({ where: { userId } });
      const savedSkip = savedCount > 8 ? (perfectCount * 8) % Math.max(1, savedCount - 8 + 1) : 0;
      savedWords = await prisma.savedWord.findMany({
        where: { userId },
        include: { word: true },
        skip: savedSkip,
        take: 8,
      });
    }
    if (savedWords.length >= 4) {
      words = savedWords.map((sw: any) => sw.word);
    } else {
      const totalWords = await prisma.word.count();
      const dictSkip = totalWords > 8 ? (perfectCount * 8) % Math.max(1, totalWords - 8 + 1) : 0;
      words = await prisma.word.findMany({ where: { difficulty: "BEGINNER" }, skip: dictSkip, orderBy: { createdAt: "asc" }, take: 8 });
    }
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
      <ErrorBoundary label="Word Matching">
        <MatchingGame words={words.slice(0, 6) as any} />
      </ErrorBoundary>
    </div>
  );
}
