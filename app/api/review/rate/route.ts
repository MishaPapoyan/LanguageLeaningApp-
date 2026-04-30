import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { wordId, interval, ease, repetitions, nextReview } = body as {
    wordId: string;
    interval: number;
    ease: number;
    repetitions: number;
    nextReview: number;
  };

  if (!wordId || typeof interval !== "number") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Verify this SavedWord belongs to the user
  const saved = await prisma.savedWord.findFirst({
    where: { id: wordId, userId: session.user.id },
  });
  if (!saved) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Derive masteryLevel (0–5) from repetitions for backwards compat
  const masteryLevel = Math.min(5, repetitions);

  // MED-1: Clamp SM-2 quality to valid range 0–5
  const quality: number = Math.min(5, Math.max(0, Number(body.quality ?? 4)));
  const isCorrect = quality >= 3;

  await prisma.savedWord.update({
    where: { id: wordId },
    data: {
      interval,
      ease,
      repetitions,
      nextReviewAt: new Date(nextReview),
      lastReviewed: new Date(),
      masteryLevel,
      quizAttempts: { increment: 1 },
      quizCorrect: isCorrect ? { increment: 1 } : undefined,
    },
  });

  return NextResponse.json({ ok: true });
}
