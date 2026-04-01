import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { awardXp, updateStreak } from "@/lib/gamification";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { lessonId, score, totalQuestions } = await req.json();

  if (!lessonId || typeof score !== "number" || typeof totalQuestions !== "number") {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const userId = session.user.id;
  const pct = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  // Base XP for completing a lesson
  let xpEarned = 15;

  // Bonus for good performance
  if (pct >= 80) xpEarned += 10;
  if (pct === 100) xpEarned += 10;

  // Award XP with grammar skill (lessons teach grammar)
  const progress = await awardXp(userId, xpEarned, "grammar");

  // Update streak
  await updateStreak(userId);

  return NextResponse.json({
    xpEarned,
    pct,
    level: progress.level,
    totalXp: progress.xp,
  });
}
