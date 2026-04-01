import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { StoryReader } from "@/components/stories/StoryReader";

export default async function StoryPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const [story, savedWordRows] = await Promise.all([
    prisma.story.findUnique({
      where: { id: params.id },
      include: {
        quizzes: true,
        words: { include: { word: true } },
        progress: { where: { userId } },
      },
    }),
    prisma.savedWord.findMany({ where: { userId }, select: { wordId: true } }),
  ]);

  if (!story) notFound();

  const savedWordIds = new Set(savedWordRows.map((r) => r.wordId));

  const wordsWithSaved = story.words.map((sw) => ({
    ...sw.word,
    isSaved: savedWordIds.has(sw.word.id),
  }));

  return (
    <StoryReader
      story={{
        id: story.id,
        title: story.title,
        description: story.description,
        content: story.content as any,
        difficulty: story.difficulty,
        chapter: story.chapter,
        imageEmoji: story.imageEmoji,
        words: wordsWithSaved,
        quizzes: story.quizzes.map((q) => ({
          id: q.id,
          question: q.question,
          options: q.options as string[],
          answer: q.answer,
        })),
        userProgress: story.progress[0] ?? null,
      }}
    />
  );
}
