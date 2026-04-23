import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ storiesRead: 0, gamesPlayed: 0, practiceCount: 0 });
  }

  const userId = session.user.id;
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  try {
    const [storiesRead, gamesPlayed, aiCount, writingCount] = await Promise.all([
      prisma.storyProgress.count({
        where: { userId, completed: true, updatedAt: { gte: startOfDay } },
      }),
      prisma.gameScore.count({
        where: { userId, playedAt: { gte: startOfDay } },
      }),
      prisma.aiInteraction.count({
        where: { userId, createdAt: { gte: startOfDay } },
      }),
      prisma.writingSession.count({
        where: { userId, createdAt: { gte: startOfDay } },
      }),
    ]);

    return NextResponse.json({
      storiesRead,
      gamesPlayed,
      practiceCount: aiCount + writingCount,
    });
  } catch {
    return NextResponse.json({ storiesRead: 0, gamesPlayed: 0, practiceCount: 0 });
  }
}
