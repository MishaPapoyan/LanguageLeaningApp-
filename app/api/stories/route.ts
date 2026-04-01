import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  const stories = await prisma.story.findMany({
    orderBy: { chapter: "asc" },
    include: {
      quizzes: { select: { id: true } },
      words: { include: { word: { select: { id: true, word: true, translation: true, imageEmoji: true } } } },
      progress: session?.user?.id
        ? { where: { userId: session.user.id }, select: { completed: true, score: true, xpEarned: true } }
        : false,
    },
  });

  const result = stories.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    difficulty: s.difficulty,
    chapter: s.chapter,
    imageEmoji: s.imageEmoji,
    quizCount: s.quizzes.length,
    wordCount: s.words.length,
    userProgress: s.progress?.[0] ?? null,
  }));

  return NextResponse.json(result);
}
