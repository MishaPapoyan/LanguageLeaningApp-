import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FillBlank } from "@/components/games/FillBlank";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Fill in the Blank — LangCraft" };

export default async function FillBlankPage() {
  const session = await getServerSession(authOptions);
  const userId  = session?.user?.id ?? "";

  const perfectCount = userId ? await prisma.gameScore.count({ where: { userId, score: 100 } }) : 0;

  let words: any[] = [];
  try {
    const savedCount = userId ? await prisma.savedWord.count({ where: { userId } }) : 0;
    const savedSkip = savedCount > 30 ? (perfectCount * 30) % Math.max(1, savedCount - 30 + 1) : 0;
    const saved = userId ? await prisma.savedWord.findMany({
      where: { userId }, include: { word: true }, orderBy: { addedAt: "desc" }, skip: savedSkip, take: 30,
    }) : [];
    if (saved.length >= 4) {
      words = saved.map((s: any) => s.word);
    } else {
      const totalWords = await prisma.word.count();
      const dictSkip = totalWords > 30 ? (perfectCount * 30) % Math.max(1, totalWords - 30 + 1) : 0;
      words = await prisma.word.findMany({ skip: dictSkip, orderBy: { createdAt: "asc" }, take: 30, select: { id: true, word: true, translation: true, imageEmoji: true, exampleFr: true, exampleEn: true } });
    }
  } catch (e) { console.error(e); }

  return (
    <div className="max-w-2xl animate-fade-up">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "var(--text)", margin: "0 0 4px" }}>Fill in the Blank</h1>
        <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>Complete the French sentence — hints cost 5 XP each</p>
      </div>
      <FillBlank words={words} />
    </div>
  );
}
