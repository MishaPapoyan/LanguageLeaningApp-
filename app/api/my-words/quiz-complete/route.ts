import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { awardXp, updateStreak } from "@/lib/gamification";
import { NextResponse } from "next/server";

function calcXp(correct: number, total: number): number {
  if (correct === 0) return 0;
  const base = correct * 5;
  const sizeMult = total >= 100 ? 2.5 : total >= 40 ? 2.0 : total >= 20 ? 1.5 : 1.0;
  const pct = correct / total;
  const accMult = pct === 1 ? 1.5 : pct >= 0.8 ? 1.2 : 1.0;
  return Math.round(base * sizeMult * accMult);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { correct, total } = await req.json();
  if (typeof correct !== "number" || typeof total !== "number") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const xp = calcXp(correct, total);
  if (xp > 0) {
    await awardXp(session.user.id, xp, "vocabulary");
    await updateStreak(session.user.id);
  }

  return NextResponse.json({ xp });
}
