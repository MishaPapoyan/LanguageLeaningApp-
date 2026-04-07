import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FlashcardGame } from "@/components/games/FlashcardGame";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flashcards — LangCraft",
  description: "Practice French vocabulary with flashcards",
};

export default async function FlashcardsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? "";

  let savedWords: any[] = [];
  let words: any[] = [];

  const perfectCount = userId ? await prisma.gameScore.count({ where: { userId, score: 100 } }) : 0;

  try {
    if (userId) {
      const savedCount = await prisma.savedWord.count({ where: { userId } });
      const savedSkip = savedCount > 20 ? (perfectCount * 20) % Math.max(1, savedCount - 20 + 1) : 0;
      savedWords = await prisma.savedWord.findMany({
        where: { userId },
        include: { word: true },
        orderBy: { addedAt: "desc" },
        skip: savedSkip,
        take: 20,
      });
    }
    if (savedWords.length >= 4) {
      words = savedWords.map((sw: any) => sw.word);
    } else {
      const totalWords = await prisma.word.count();
      const dictSkip = totalWords > 20 ? (perfectCount * 20) % Math.max(1, totalWords - 20 + 1) : 0;
      words = await prisma.word.findMany({ where: { difficulty: "BEGINNER" }, skip: dictSkip, orderBy: { createdAt: "asc" }, take: 20 });
    }
  } catch (err) {
    console.error("[flashcards] DB error:", err);
    words = [];
  }

  return (
    <div className="max-w-2xl animate-fade-up">
      <div className="mb-6">
        <h1 className="text-2xl font-serif text-zinc-900">Flashcards</h1>
        <p className="text-sm text-zinc-500 mt-1">
          {savedWords.length >= 4 ? "Practicing your saved words" : "Practicing beginner vocabulary"}
        </p>
      </div>
      <FlashcardGame words={words as any} />
    </div>
  );
}
