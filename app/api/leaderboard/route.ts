import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const period = req.nextUrl.searchParams.get("period") ?? "all";

  // Get top 50 users by XP
  const users = await prisma.user.findMany({
    where: { progress: { isNot: null } },
    select: {
      id: true,
      name: true,
      image: true,
      progress: {
        select: { xp: true, level: true, streak: true },
      },
    },
    orderBy: { progress: { xp: "desc" } },
    take: 50,
  });

  const leaderboard = users.map((u, i) => ({
    rank: i + 1,
    id: u.id,
    name: u.name ?? "Anonymous",
    image: u.image,
    xp: u.progress?.xp ?? 0,
    level: u.progress?.level ?? 1,
    streak: u.progress?.streak ?? 0,
    isCurrentUser: u.id === session.user.id,
  }));

  // Find current user's rank if not in top 50
  const currentUserRank = leaderboard.find((u) => u.isCurrentUser);

  return Response.json({ leaderboard, currentUserRank });
}
