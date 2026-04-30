import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { awardXp, updateStreak } from "@/lib/gamification";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { durationSec = 0 } = await req.json();

  // Award 5 XP per voice practice session (capped at 25 XP per session)
  const xpEarned = Math.min(25, Math.max(5, Math.floor(durationSec / 2)));

  // HIGH-2: Use the user's actual target language, not hardcoded "fr"
  const language = session.user.targetLanguage ?? "fr";

  await prisma.voiceSession.create({
    data: {
      userId: session.user.id,
      language,
      durationSec,
      xpEarned,
      provider: "browser-media-recorder",
    },
  });

  await awardXp(session.user.id, xpEarned, "speaking");
  await updateStreak(session.user.id);

  return NextResponse.json({ xpEarned });
}
