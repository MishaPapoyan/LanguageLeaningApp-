import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim() ?? "";
  const lang   = searchParams.get("lang") ?? "";

  try {
    // HIGH-3: Don't spread duplicate `name` keys — the spread would silently
    // overwrite `name: { not: null }` with `name: { contains: search }`,
    // allowing users with null names to appear in search results.
    const users = await prisma.user.findMany({
      where: {
        name: search
          ? { contains: search, mode: "insensitive" }
          : { not: null },
        progress: { isNot: null },
        ...(lang ? { targetLanguage: lang } : {}),
      },
      select: {
        id: true,
        name: true,
        image: true,
        targetLanguage: true,
        createdAt: true,
        progress: { select: { xp: true, level: true, streak: true, badges: true } },
        _count: { select: { gameScores: true, savedWords: true } },
      },
      orderBy: { progress: { xp: "desc" } },
      take: 60,
    });

    return NextResponse.json({ learners: users });
  } catch (err) {
    console.error("[community/learners]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
