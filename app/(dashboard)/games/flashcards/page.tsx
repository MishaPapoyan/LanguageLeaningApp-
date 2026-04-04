import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FlashcardGame } from "@/components/games/FlashcardGame";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flashcards — LinguaFlow",
  description: "Practice French vocabulary with flashcards",
};

export default async function FlashcardsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? "";

  let savedWords: any[] = [];
  let words: any[] = [];

  try {
    if (userId) {
      savedWords = await prisma.savedWord.findMany({
        where: { userId },
        include: { word: true },
        orderBy: { addedAt: "desc" },
        take: 20,
      });
    }
    words = savedWords.length >= 4
      ? savedWords.map((sw: any) => sw.word)
      : await prisma.word.findMany({ where: { difficulty: "BEGINNER" }, take: 20 });
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
