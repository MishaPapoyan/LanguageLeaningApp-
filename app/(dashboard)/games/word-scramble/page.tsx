import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WordScramble } from "@/components/games/WordScramble";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Word Scramble — LinguaFlow" };

export default async function WordScramblePage() {
  const session = await getServerSession(authOptions);
  const userId  = session?.user?.id ?? "";

  let words: any[] = [];
  try {
    const saved = userId ? await prisma.savedWord.findMany({
      where: { userId }, include: { word: true }, orderBy: { addedAt: "desc" }, take: 20,
    }) : [];
    words = saved.length >= 4
      ? saved.map((s: any) => s.word)
      : await prisma.word.findMany({ where: { difficulty: "BEGINNER" }, take: 20 });
  } catch (e) { console.error(e); }

  return (
    <div className="max-w-2xl animate-fade-up">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "var(--text)", margin: "0 0 4px" }}>Word Scramble</h1>
        <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>Unscramble the French word — use hints (5 XP each)</p>
      </div>
      <WordScramble words={words} />
    </div>
  );
}
