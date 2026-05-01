import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { awardXp } from "@/lib/gamification";
import { XP_REWARDS } from "@/types";
import { getWordById } from "@/data/dictionary-words";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { wordId, remove } = await req.json();
  const userId = session.user.id;

  try {
    if (remove) {
      await prisma.savedWord.deleteMany({ where: { userId, wordId } });
      return NextResponse.json({ saved: false });
    }

    // Ensure the Word record exists in DB (hardcoded words are not seeded)
    const hardcoded = getWordById(wordId);
    if (hardcoded) {
      await prisma.word.upsert({
        where: { id: wordId },
        create: {
          id: wordId,
          word: hardcoded.word,
          translation: hardcoded.translation,
          definition: hardcoded.definition,
          exampleFr: hardcoded.exampleFr,
          exampleEn: hardcoded.exampleEn,
          category: hardcoded.category,
          difficulty: hardcoded.difficulty as any,
          imageEmoji: hardcoded.imageEmoji,
          language: hardcoded.language,
        },
        update: {},
      });
    }

    const saved = await prisma.savedWord.upsert({
      where: { userId_wordId: { userId, wordId } },
      create: { userId, wordId },
      update: {},
    });
    await awardXp(userId, XP_REWARDS.saveWord, "vocabulary");
    return NextResponse.json({ saved: true, data: saved });
  } catch (err) {
    console.error("[dictionary/save] DB error:", err);
    return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503 });
  }
}
