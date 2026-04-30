import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { amount } = await req.json();
  if (!amount || amount <= 0) return NextResponse.json({ error: "Invalid amount" }, { status: 400 });

  // HIGH-5: Wrap DB calls in try/catch — bare Prisma calls crash the route on DB errors
  try {
    const progress = await prisma.progress.findUnique({ where: { userId: session.user.id } });
    if (!progress || progress.xp < amount) {
      return NextResponse.json({ error: "insufficient_xp", currentXp: progress?.xp ?? 0 }, { status: 402 });
    }

    const updated = await prisma.progress.update({
      where: { userId: session.user.id },
      data: { xp: { decrement: amount } },
    });

    return NextResponse.json({ ok: true, newXp: updated.xp });
  } catch (err) {
    console.error("[spend-xp] DB error:", err);
    return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503 });
  }
}
