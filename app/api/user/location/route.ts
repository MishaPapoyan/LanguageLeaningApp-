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

  // Reverse-geocode when browser geolocation gives coords but no city name
  let finalCity: string | null = city ?? null;
  let finalCountry: string | null = country ?? null;

  if (!finalCity) {
    try {
      const geo = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        { headers: { "User-Agent": "LangCraft/1.0" }, signal: AbortSignal.timeout(5000) }
      );
      if (geo.ok) {
        const d = await geo.json();
        finalCity    = d.address?.city || d.address?.town || d.address?.village || d.address?.suburb || null;
        finalCountry = d.address?.country || null;
      }
    } catch { /* ignore */ }
  }

  try {
    await prisma.userLocation.upsert({
      where:  { userId: session.user.id },
      update: { latitude, longitude, accuracy: accuracy ?? null, city: finalCity, country: finalCountry },
      create: { userId: session.user.id, latitude, longitude, accuracy: accuracy ?? null, city: finalCity, country: finalCountry },
    });
  } catch (err) {
    console.error("[user/location] DB error:", err);
  }

  return NextResponse.json({ ok: true });
}
