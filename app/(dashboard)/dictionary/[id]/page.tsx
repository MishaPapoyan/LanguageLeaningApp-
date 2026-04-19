import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { WordDetail } from "@/components/dictionary/WordDetail";

export default async function WordPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? "";

  let word = null;
  let savedWord = null;

  try {
    [word, savedWord] = await Promise.all([
      prisma.word.findUnique({ where: { id: params.id } }),
      userId ? prisma.savedWord.findUnique({ where: { userId_wordId: { userId, wordId: params.id } } }) : null,
    ]);
  } catch (err) {
    console.error("[word page] DB error:", err);
  }

  if (!word) notFound();

  return (
    <WordDetail
      word={{
        ...word,
        isSaved: !!savedWord,
        masteryLevel: savedWord?.masteryLevel ?? 0,
        quizAttempts: savedWord?.quizAttempts ?? 0,
        quizCorrect: savedWord?.quizCorrect ?? 0,
      }}
    />
  );
}
