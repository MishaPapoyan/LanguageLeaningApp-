import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const onboardingSchema = z.object({
  ageGroup: z.string().min(1),
  nativeLanguage: z.string().min(2),
  learningGoal: z.string().min(1),
  proficiencyLevel: z.string().min(1),
  dailyGoalMinutes: z.number().int().min(5).max(120),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = onboardingSchema.parse(body);

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...data,
        onboardingCompleted: true,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("[onboarding] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
