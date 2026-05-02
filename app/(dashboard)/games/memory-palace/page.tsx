export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MemoryPalace } from "@/components/games/MemoryPalace";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { getWordsByLanguage } from "@/data/dictionary-words";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Memory Palace — Lingova",
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
  let words: any[] = await prisma.word.findMany({
    where: { category: { in: ["food", "travel", "places", "greetings", "Food & Drink", "Travel", "Greetings", "Home"] }, language },
    skip: dictSkip,
    orderBy: { createdAt: "asc" },
    take: 8,
  }).catch(() => []);

  if (words.length < 4) {
    const all = getWordsByLanguage(language);
    const palaceCategories = ["Food & Drink", "Travel", "Greetings", "Home"];
    words = all.filter((w) => palaceCategories.includes(w.category)).slice(0, 8);
    if (words.length < 4) words = all.slice(0, 8);
  }

  return (
    <div className="max-w-2xl animate-fade-up">
      <div className="mb-6">
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>Memory Palace</h1>
        <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 4 }}>Place vocabulary words around a virtual café — click objects to reveal their names</p>
      </div>
      <ErrorBoundary label="Memory Palace">
        <MemoryPalace words={words as any} />
      </ErrorBoundary>
    </div>
  );
}
