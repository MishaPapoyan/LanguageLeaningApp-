export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SpeedTyping } from "@/components/games/SpeedTyping";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Speed Typing — LangCraft" };

export default async function SpeedTypingPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? "";
  const language = (session?.user as any)?.targetLanguage ?? "fr";

  // Single words only (no spaces) — easier to type
  let words: any[] = [];
  try {
    if (userId) {
      const saved = await prisma.savedWord.findMany({
        where: { userId, word: { language } },
        include: { word: true },
        take: 50,
      });
      if (saved.length >= 6) {
        words = saved.map((s: any) => s.word).filter((w: any) => !w.word.includes(" "));
      }
    }
    if (words.length < 6) {
      const all = await prisma.word.findMany({ where: { language }, take: 60, orderBy: { createdAt: "asc" } });
      words = all.filter((w: any) => !w.word.includes(" "));
    }
  } catch { words = []; }

  return (
    <div className="max-w-2xl animate-fade-up">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold" style={{ color: "var(--text)" }}>Speed Typing</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>See the meaning, type the word — as fast as you can!</p>
      </div>
      <SpeedTyping words={words} targetLang={language} />
    </div>
  );
}
