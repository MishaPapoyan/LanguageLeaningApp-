import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { awardXp, updateStreak } from "@/lib/gamification";
import { XP_REWARDS, GameScoreData } from "@/types";
import { GameType } from "@prisma/client";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { gameType, score, wordsUsed }: GameScoreData = await req.json();
  const userId = session.user.id;

  // Validate gameType against the Prisma enum at runtime
  const validGameTypes = Object.values(GameType) as string[];
  if (!gameType || !validGameTypes.includes(gameType)) {
    return NextResponse.json({ error: "Invalid gameType" }, { status: 400 });
  }

  const xpEarned = score > 0 ? XP_REWARDS.gameWin : XP_REWARDS.gamePlay;

  try {
    const gameScore = await prisma.gameScore.create({
      data: { userId, gameType: gameType as GameType, score, wordsUsed, xpEarned },
    });
    await awardXp(userId, xpEarned, "vocabulary");
    await updateStreak(userId);

    // Auto-save all played words to the user's dictionary
    if (wordsUsed && wordsUsed.length > 0) {
      await prisma.savedWord.createMany({
        data: wordsUsed.map((wordId: string) => ({ userId, wordId })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json({ gameScore, xpEarned });
  } catch (err) {
    console.error("[games/score] DB error:", err);
    return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503 });
  }
}
