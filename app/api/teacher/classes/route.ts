import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "TEACHER") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await req.json();

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return Response.json({ error: "Class name must be at least 2 characters" }, { status: 400 });
  }

  const inviteCode = crypto.randomUUID().slice(0, 8).toUpperCase();

  const group = await prisma.group.create({
    data: {
      name: name.trim(),
      teacherId: session.user.id,
      inviteCode,
    },
  });

  return Response.json({ group });
}
