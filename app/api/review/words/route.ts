import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Words are due if: never reviewed (nextReviewAt is null) OR nextReviewAt <= now
  const due = await prisma.savedWord.findMany({
    where: {
      userId: session.user.id,
      OR: [{ nextReviewAt: null }, { nextReviewAt: { lte: now } }],
    },
    include: {
      word: {
        select: { word: true, translation: true, imageEmoji: true },
      },
    },
    orderBy: { nextReviewAt: "asc" },
    take: 20,
  });

  const words = due.map((sw) => ({
    id: sw.id,
    word: sw.word.word,
    translation: sw.word.translation,
    imageEmoji: sw.word.imageEmoji,
    nextReview: sw.nextReviewAt ? sw.nextReviewAt.getTime() : 0,
    interval: sw.interval,
    ease: sw.ease,
    repetitions: sw.repetitions,
  }));

  return NextResponse.json({ words });
}
