import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  const word = await prisma.word.findUnique({ where: { id: params.id } });
  if (!word) return NextResponse.json({ error: "Word not found" }, { status: 404 });

  let isSaved = false;
  let masteryLevel = 0;

  if (session?.user?.id) {
    const saved = await prisma.savedWord.findUnique({
      where: { userId_wordId: { userId: session.user.id, wordId: params.id } },
    });
    isSaved = !!saved;
    masteryLevel = saved?.masteryLevel ?? 0;
  }

  const res = NextResponse.json({ ...word, isSaved, masteryLevel });
  res.headers.set("Cache-Control", "private, s-maxage=300, stale-while-revalidate=600");
  return res;
}
