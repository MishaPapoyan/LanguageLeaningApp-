import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { awardXp, updateStreak } from "@/lib/gamification";
import { XP_REWARDS } from "@/types";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { score, completed } = await req.json();
  const userId = session.user.id;

  // Calculate XP earned
  let xpEarned = 0;
  if (completed) xpEarned += XP_REWARDS.completeStory;
  if (score === 100) xpEarned += XP_REWARDS.perfectQuiz;
  else if (score > 0) xpEarned += Math.floor((score / 100) * XP_REWARDS.quizAnswer * 3);

  const progress = await prisma.storyProgress.upsert({
    where: { userId_storyId: { userId, storyId: params.id } },
    create: { userId, storyId: params.id, completed, score, xpEarned },
    update: { completed, score: Math.max(score, 0), xpEarned },
  });

  if (xpEarned > 0) {
    await awardXp(userId, xpEarned, "grammar");
    await updateStreak(userId);
  }

  return NextResponse.json({ progress, xpEarned });
}
