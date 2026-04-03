import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      progress: {
        select: { xp: true, level: true, streak: true, lastActive: true },
      },
      location: {
        select: { city: true, country: true, updatedAt: true },
      },
      _count: {
        select: { savedWords: true, storyProgress: true, aiInteractions: true, gameScores: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}
