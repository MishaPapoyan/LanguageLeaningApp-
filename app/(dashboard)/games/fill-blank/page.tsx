export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FillBlank } from "@/components/games/FillBlank";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Fill in the Blank — LangCraft" };

export default async function FillBlankPage() {
  const session = await getServerSession(authOptions);
  const userId  = session?.user?.id ?? "";
  const language = session?.user?.targetLanguage ?? "fr";

  let perfectCount = 0;
  let words: any[] = [];
  try {
    if (userId) perfectCount = await prisma.gameScore.count({ where: { userId, score: 100 } });
    const savedCount = userId ? await prisma.savedWord.count({ where: { userId, word: { language } } }) : 0;
    const savedSkip = savedCount > 30 ? (perfectCount * 30) % Math.max(1, savedCount - 30 + 1) : 0;
    const saved = userId ? await prisma.savedWord.findMany({
      where: { userId, word: { language } }, include: { word: true }, orderBy: { addedAt: "desc" }, skip: savedSkip, take: 30,
    }) : [];
    if (saved.length >= 4) {
      words = saved.map((s: any) => s.word);
    } else {
      const totalWords = await prisma.word.count({ where: { language } });
      const dictSkip = totalWords > 30 ? (perfectCount * 30) % Math.max(1, totalWords - 30 + 1) : 0;
      words = await prisma.word.findMany({ where: { language }, skip: dictSkip, orderBy: { createdAt: "asc" }, take: 30, select: { id: true, word: true, translation: true, imageEmoji: true, exampleFr: true, exampleEn: true } });
    }
  } catch (e) { console.error(e); }

  return (
    <div className="max-w-2xl animate-fade-up">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "var(--text)", margin: "0 0 4px" }}>Fill in the Blank</h1>
        <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>Complete the sentence — hints cost 5 XP each</p>
      </div>
      <ErrorBoundary label="Fill in the Blank">
        <FillBlank words={words} />
      </ErrorBoundary>
    </div>
  );
}
