import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const groups = await prisma.group.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        inviteCode: true,
        createdAt: true,
        teacher: { select: { id: true, name: true, email: true } },
        _count: { select: { members: true, assignments: true } },
      },
    });
    return NextResponse.json({ groups });
  } catch (err) {
    console.error("[admin/groups] DB error:", err);
    return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503 });
  }
}
