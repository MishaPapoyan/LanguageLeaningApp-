import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { WordDetail } from "@/components/dictionary/WordDetail";

export default async function WordPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const word = await prisma.word.findUnique({ where: { id: params.id } });
  if (!word) notFound();

  const savedWord = await prisma.savedWord.findUnique({
    where: { userId_wordId: { userId, wordId: params.id } },
  });

  return (
    <WordDetail
      word={{ ...word, isSaved: !!savedWord, masteryLevel: savedWord?.masteryLevel ?? 0 }}
    />
  );
}
