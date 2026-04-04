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
    const locations = await prisma.userLocation.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ locations });
  } catch (err) {
    console.error("[admin/locations] DB error:", err);
    return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503 });
  }
}
