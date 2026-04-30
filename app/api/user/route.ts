import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    // Delete GroupMember rows first (no DB-level cascade on this join table)
    await prisma.groupMember.deleteMany({ where: { userId: session.user.id } });
    await prisma.user.delete({ where: { id: session.user.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[user] delete error:", err);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}

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
  if (typeof image === "string" && image.length > 0) {
    // HIGH-4: Use grapheme cluster segmentation so multi-codepoint emoji (e.g. 🧑‍💻)
    // aren't sliced mid-sequence, which produces broken replacement characters.
    try {
      const seg = new Intl.Segmenter();
      data.image = [...seg.segment(image)][0]?.segment ?? image.slice(0, 2);
    } catch {
      data.image = [...image].slice(0, 2).join(""); // safe fallback
    }
  }
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
