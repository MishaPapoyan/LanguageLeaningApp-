export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ListenQuiz } from "@/components/games/ListenQuiz";
import { getWordsByLanguage } from "@/data/dictionary-words";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Listen & Choose — Lingova" };

export default async function ListenQuizPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? "";
  const language = (session?.user as any)?.targetLanguage ?? "fr";

  let words: any[] = [];
  try {
    if (userId) {
      const saved = await prisma.savedWord.findMany({
        where: { userId, word: { language } },
        include: { word: true },
        take: 40,
      });
      if (saved.length >= 8) {
        words = saved.map((s: any) => s.word);
      }
    }
    if (words.length < 8) {
      words = await prisma.word.findMany({ where: { language }, take: 40, orderBy: { createdAt: "asc" } });
    }
  } catch { words = []; }

  if (words.length < 8) {
    words = getWordsByLanguage(language).slice(0, 40);
  }

  return (
    <div className="max-w-2xl animate-fade-up">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold" style={{ color: "var(--text)" }}>Listen &amp; Choose</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>Hear the word — pick the right translation!</p>
      </div>
      <ListenQuiz words={words} targetLang={language} />
    </div>
  );
}
