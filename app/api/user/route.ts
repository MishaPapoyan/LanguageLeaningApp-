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
  const { name, image, nativeLanguage } = body;

  const data: Record<string, string> = {};
  if (typeof name === "string" && name.trim()) data.name = name.trim().slice(0, 50);
  if (typeof image === "string") data.image = image.slice(0, 10); // emoji only
  if (typeof nativeLanguage === "string") data.nativeLanguage = nativeLanguage;

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: { id: true, name: true, image: true, nativeLanguage: true, email: true },
  });

  return NextResponse.json({ user });
}
