import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const [progress, savedWordCount, completedStories, gamePlays, tutorSessions] = await Promise.all([
    prisma.progress.findUnique({ where: { userId } }),
    prisma.savedWord.count({ where: { userId } }),
    prisma.storyProgress.count({ where: { userId, completed: true } }),
    prisma.gameScore.count({ where: { userId } }),
    prisma.aiInteraction.count({ where: { userId } }),
  ]);

  return NextResponse.json(
    {
      progress,
      stats: {
        savedWords: savedWordCount,
        completedStories,
        gamePlays,
        tutorSessions,
      },
    },
    {
      headers: {
        // Browser caches for 30 s; serves stale while revalidating for 60 s
        "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
      },
    }
  );
}
