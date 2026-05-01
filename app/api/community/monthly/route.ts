import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  // First day of the current calendar month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Sum xpEarned from GameScores this month, grouped by userId
  const gameXp = await prisma.gameScore.groupBy({
    by: ["userId"],
    where: { playedAt: { gte: monthStart } },
    _sum: { xpEarned: true },
    orderBy: { _sum: { xpEarned: "desc" } },
    take: 20,
  });

  // Also include storyProgress xpEarned this month
  const storyXp = await prisma.storyProgress.groupBy({
    by: ["userId"],
    where: { updatedAt: { gte: monthStart } },
    _sum: { xpEarned: true },
  });

  // Merge totals
  const totals: Record<string, number> = {};
  for (const g of gameXp)   totals[g.userId] = (totals[g.userId] ?? 0) + (g._sum?.xpEarned ?? 0);
  for (const s of storyXp)  totals[s.userId] = (totals[s.userId] ?? 0) + (s._sum?.xpEarned ?? 0);

  const sorted = Object.entries(totals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  if (sorted.length === 0) return NextResponse.json({ monthly: [] });

  const userIds = sorted.map(([id]) => id);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      name: true,
      image: true,
      targetLanguage: true,
      progress: { select: { level: true, streak: true } },
    },
  });

  const userMap = Object.fromEntries(users.map(u => [u.id, u]));

  const monthly = sorted.map(([userId, xp], i) => ({
    rank: i + 1,
    userId,
    name: userMap[userId]?.name ?? "Anonymous",
    image: userMap[userId]?.image ?? null,
    targetLanguage: userMap[userId]?.targetLanguage ?? "fr",
    level: userMap[userId]?.progress?.level ?? 1,
    streak: userMap[userId]?.progress?.streak ?? 0,
    monthlyXp: xp,
  }));

  return NextResponse.json({ monthly, month: monthStart.toISOString() });
}
