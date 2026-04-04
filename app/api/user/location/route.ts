import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { latitude, longitude, accuracy, city, country } = await req.json();

  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  try {
    await prisma.userLocation.upsert({
      where: { userId: session.user.id },
      update: { latitude, longitude, accuracy: accuracy ?? null, city: city ?? null, country: country ?? null },
      create: { userId: session.user.id, latitude, longitude, accuracy: accuracy ?? null, city: city ?? null, country: country ?? null },
    });
  } catch (err) {
    console.error("[user/location] DB error:", err);
  }

  return NextResponse.json({ ok: true });
}
