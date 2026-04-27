import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const [
      topUsers,
      gameTypeBreakdown,
      targetLangBreakdown,
      nativeLangBreakdown,
      levelDistribution,
      totals,
    ] = await Promise.all([
      prisma.progress.findMany({
        take: 10,
        orderBy: { xp: "desc" },
        select: {
          xp: true,
          level: true,
          streak: true,
          user: { select: { id: true, name: true, email: true, targetLanguage: true } },
        },
      }),
      prisma.gameScore.groupBy({
        by: ["gameType"],
        _count: { gameType: true },
        _sum: { xpEarned: true },
        orderBy: { _count: { gameType: "desc" } },
      }),
      prisma.user.groupBy({
        by: ["targetLanguage"],
        _count: { targetLanguage: true },
      }),
      prisma.user.groupBy({
        by: ["nativeLanguage"],
        _count: { nativeLanguage: true },
        orderBy: { _count: { nativeLanguage: "desc" } },
        take: 8,
      }),
      prisma.progress.groupBy({
        by: ["level"],
        _count: { level: true },
        orderBy: { level: "asc" },
      }),
      Promise.all([
        prisma.savedWord.count(),
        prisma.aiInteraction.count(),
        prisma.gameScore.count(),
        prisma.writingSession.count(),
        prisma.voiceSession.count(),
      ]).then(([words, ai, games, writing, voice]) => ({ words, ai, games, writing, voice })),
    ]);

    return NextResponse.json({
      topUsers,
      gameTypeBreakdown,
      targetLangBreakdown,
      nativeLangBreakdown,
      levelDistribution,
      totals,
    });
  } catch (err) {
    console.error("[admin/analytics] DB error:", err);
    return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503 });
  }
}
