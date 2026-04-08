import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WordScramble } from "@/components/games/WordScramble";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Word Scramble — LangCraft" };

export default async function WordScramblePage() {
  const session = await getServerSession(authOptions);
  const userId  = session?.user?.id ?? "";

  const perfectCount = userId ? await prisma.gameScore.count({ where: { userId, score: 100 } }) : 0;

  let words: any[] = [];
  try {
    const savedCount = userId ? await prisma.savedWord.count({ where: { userId } }) : 0;
    const savedSkip = savedCount > 20 ? (perfectCount * 20) % Math.max(1, savedCount - 20 + 1) : 0;
    const saved = userId ? await prisma.savedWord.findMany({
      where: { userId }, include: { word: true }, orderBy: { addedAt: "desc" }, skip: savedSkip, take: 20,
    }) : [];
    if (saved.length >= 4) {
      words = saved.map((s: any) => s.word);
    } else {
      const totalWords = await prisma.word.count();
      const dictSkip = totalWords > 20 ? (perfectCount * 20) % Math.max(1, totalWords - 20 + 1) : 0;
      words = await prisma.word.findMany({ where: { difficulty: "BEGINNER" }, skip: dictSkip, orderBy: { createdAt: "asc" }, take: 20 });
    }
  } catch (e) { console.error(e); }

  return (
    <div className="max-w-2xl animate-fade-up">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "var(--text)", margin: "0 0 4px" }}>Word Scramble</h1>
        <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>Unscramble the French word — use hints (5 XP each)</p>
      </div>
      <ErrorBoundary label="Word Scramble">
        <WordScramble words={words} />
      </ErrorBoundary>
    </div>
  );
}
