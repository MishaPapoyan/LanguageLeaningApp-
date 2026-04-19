import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MemoryPalace } from "@/components/games/MemoryPalace";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Memory Palace — LangCraft",
  description: "Learn words through spatial memory",
};

export default async function MemoryPalacePage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? "";
  const language = session?.user?.targetLanguage ?? "fr";

  const perfectCount = userId ? await prisma.gameScore.count({ where: { userId, score: 100 } }) : 0;
  const totalWords = await prisma.word.count({ where: { language } });
  const dictSkip = totalWords > 8 ? (perfectCount * 8) % Math.max(1, totalWords - 8 + 1) : 0;

  // Get kitchen/home words for the memory palace
  const words = await prisma.word.findMany({
    where: { category: { in: ["food", "travel", "places", "greetings"] }, language },
    skip: dictSkip,
    orderBy: { createdAt: "asc" },
    take: 8,
  });

  return (
    <div className="max-w-2xl animate-fade-up">
      <div className="mb-6">
        <h1 className="text-2xl font-serif text-zinc-900">Memory Palace</h1>
        <p className="text-sm text-zinc-500 mt-1">Place vocabulary words around a virtual café — click objects to reveal their names</p>
      </div>
      <ErrorBoundary label="Memory Palace">
        <MemoryPalace words={words as any} />
      </ErrorBoundary>
    </div>
  );
}
