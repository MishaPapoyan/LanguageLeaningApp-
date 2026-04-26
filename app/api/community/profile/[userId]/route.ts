import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        image: true,
        targetLanguage: true,
        createdAt: true,
        onboardingCompleted: true,
        progress: {
          select: {
            xp: true,
            level: true,
            streak: true,
            badges: true,
            skillTree: true,
            weeklyXp: true,
          },
        },
        gameScores: {
          select: { gameType: true, score: true, playedAt: true },
          orderBy: { score: "desc" },
          take: 100,
        },
        _count: { select: { gameScores: true, savedWords: true } },
      },
    });

    if (!user || !user.onboardingCompleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Compute best score per game type
    const bestScores: Record<string, number> = {};
    for (const gs of user.gameScores) {
      if (!bestScores[gs.gameType] || gs.score > bestScores[gs.gameType]) {
        bestScores[gs.gameType] = gs.score;
      }
    }

    return NextResponse.json({
      profile: {
        id: user.id,
        name: user.name,
        image: user.image,
        targetLanguage: user.targetLanguage,
        joinedAt: user.createdAt,
        progress: user.progress,
        bestScores,
        counts: user._count,
      },
    });
  } catch (err) {
    console.error("[community/profile]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
