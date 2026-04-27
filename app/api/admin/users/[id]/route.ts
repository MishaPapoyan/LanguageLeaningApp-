import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (params.id === session.user.id) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
  }
  try {
    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/users/delete] DB error:", err);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
