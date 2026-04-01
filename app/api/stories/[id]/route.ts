import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  const story = await prisma.story.findUnique({
    where: { id: params.id },
    include: {
      quizzes: true,
      words: {
        include: {
          word: true,
        },
      },
      progress: session?.user?.id
        ? { where: { userId: session.user.id } }
        : false,
    },
  });

  if (!story) {
    return NextResponse.json({ error: "Story not found" }, { status: 404 });
  }

  // Check which words are saved by current user
  let savedWordIds: Set<string> = new Set();
  if (session?.user?.id) {
    const saved = await prisma.savedWord.findMany({
      where: { userId: session.user.id },
      select: { wordId: true },
    });
    savedWordIds = new Set(saved.map((s) => s.wordId));
  }

  return NextResponse.json({
    ...story,
    words: story.words.map((sw) => ({
      ...sw.word,
      isSaved: savedWordIds.has(sw.word.id),
    })),
    userProgress: story.progress?.[0] ?? null,
  });
}
