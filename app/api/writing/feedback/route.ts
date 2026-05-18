import { analyzeWriting } from "@/lib/claude";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";
import { prisma } from "@/lib/prisma";
import { awardXp } from "@/lib/gamification";
import { XP_REWARDS } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 10 writing feedback requests per minute per user
  const { allowed, resetIn } = await checkRateLimit(`writing:${session.user.id}`, 10, 60);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before submitting again." },
      { status: 429, headers: { "Retry-After": String(resetIn) } }
    );
  }

  const { text, prompt, level } = await req.json();
  if (!text || !prompt) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const userId = session.user.id;
  const targetLanguage = session.user.targetLanguage ?? "fr";
  const nativeLanguage = (session.user as { nativeLanguage?: string }).nativeLanguage ?? "en";

  try {
    // Same structured analysis as the AI Tutor's session feedback.
    const feedback = await analyzeWriting(text, prompt, level || "beginner", targetLanguage, nativeLanguage);

    // Persist (feedback stored as JSON string; history view parses it back).
    await prisma.writingSession
      .create({
        data: {
          userId,
          prompt,
          text,
          feedback: JSON.stringify(feedback),
          level: level || "beginner",
        },
      })
      .catch((e: Error) => console.error("[writing] save session:", e.message));

    await awardXp(userId, XP_REWARDS.tutorSession, "vocabulary").catch(() => {});

    return NextResponse.json({ feedback, xpEarned: XP_REWARDS.tutorSession });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI service error";
    console.error("Writing feedback error:", message);
    return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503 });
  }
}
