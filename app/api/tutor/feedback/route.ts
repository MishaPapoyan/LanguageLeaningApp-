import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeTutorSession } from "@/lib/claude";
import { awardXp } from "@/lib/gamification";
import { XP_REWARDS, TutorScenario, ChatMessage } from "@/types";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messages, scenario }: { messages: ChatMessage[]; scenario: TutorScenario } = await req.json();
  const userId = session.user.id;

  try {
    // HIGH-1: Pass the user's target language so Spanish learners get Spanish feedback
    const targetLanguage = session.user.targetLanguage ?? "fr";
    const feedback = await analyzeTutorSession(messages, targetLanguage);

    await prisma.aiInteraction.create({
      data: {
        userId,
        scenario,
        messages: messages as any,
        feedback: feedback as any,
        xpEarned: XP_REWARDS.tutorSession,
      },
    });

    await awardXp(userId, XP_REWARDS.tutorSession, "speaking");

    return NextResponse.json({ feedback, xpEarned: XP_REWARDS.tutorSession });
  } catch (err) {
    console.error("[tutor/feedback] error:", err);
    return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503 });
  }
}
