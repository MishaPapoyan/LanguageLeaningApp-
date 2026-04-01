import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "TEACHER") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { groupId, title, type, dueDate } = await req.json();

  if (!groupId || !title || !type || !dueDate) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Verify the teacher owns this group
  const group = await prisma.group.findFirst({
    where: { id: groupId, teacherId: session.user.id },
  });

  if (!group) {
    return Response.json({ error: "Group not found" }, { status: 404 });
  }

  const assignment = await prisma.assignment.create({
    data: {
      groupId,
      title: title.trim(),
      type,
      content: {},
      dueDate: new Date(dueDate),
    },
  });

  return Response.json({ assignment });
}
