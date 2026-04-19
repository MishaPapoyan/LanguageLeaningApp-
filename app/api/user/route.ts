import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, image, nativeLanguage, targetLanguage } = body;

  const SUPPORTED_TARGET_LANGUAGES = ["fr", "es"];
  const data: Record<string, string> = {};
  if (typeof name === "string" && name.trim()) data.name = name.trim().slice(0, 50);
  if (typeof image === "string") data.image = image.slice(0, 10);
  if (typeof nativeLanguage === "string") data.nativeLanguage = nativeLanguage;
  if (typeof targetLanguage === "string" && SUPPORTED_TARGET_LANGUAGES.includes(targetLanguage)) {
    data.targetLanguage = targetLanguage;
  }

  try {
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: { id: true, name: true, image: true, nativeLanguage: true, targetLanguage: true, email: true },
    });
    const res = NextResponse.json({ user });
    res.headers.set("Cache-Control", "private, no-cache");
    return res;
  } catch (err) {
    console.error("[user] DB error:", err);
    return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503 });
  }
}
