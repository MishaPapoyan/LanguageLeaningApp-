export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { WordDetail } from "@/components/dictionary/WordDetail";
import { getWordById } from "@/data/dictionary-words";

export default async function WordPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? "";

  // Look up from hardcoded dictionary first
  const hardcoded = getWordById(params.id);
  if (!hardcoded) notFound();

  // Check if this user has saved the word (optional — graceful on DB error)
  let savedWord = null;
  try {
    if (userId) {
      savedWord = await prisma.savedWord.findUnique({
        where: { userId_wordId: { userId, wordId: params.id } },
      });
    }
  } catch {
    // DB unavailable — just show unsaved state
  }

  return (
    <WordDetail
      word={{
        ...hardcoded,
        isSaved: !!savedWord,
        masteryLevel: savedWord?.masteryLevel ?? 0,
        quizAttempts: savedWord?.quizAttempts ?? 0,
        quizCorrect: savedWord?.quizCorrect ?? 0,
      }}
    />
  );
}
