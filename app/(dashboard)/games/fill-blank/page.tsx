import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FillBlank } from "@/components/games/FillBlank";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Fill in the Blank — LinguaFlow" };

export default async function FillBlankPage() {
  const session = await getServerSession(authOptions);
  const userId  = session?.user?.id ?? "";

  let words: any[] = [];
  try {
    const saved = userId ? await prisma.savedWord.findMany({
      where: { userId }, include: { word: true }, orderBy: { addedAt: "desc" }, take: 30,
    }) : [];
    words = saved.length >= 4
      ? saved.map((s: any) => s.word)
      : await prisma.word.findMany({ take: 30, select: { id: true, word: true, translation: true, imageEmoji: true, exampleFr: true, exampleEn: true } });
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
