import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PublicProfile } from "@/components/community/PublicProfile";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface PageProps {
  params: { userId: string };
}

export default async function ProfilePage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  const { userId } = params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      image: true,
      targetLanguage: true,
      createdAt: true,
      onboardingCompleted: true,
      progress: {
        select: {
          xp: true,
          level: true,
          streak: true,
          badges: true,
          skillTree: true,
          weeklyXp: true,
        },
      },
      gameScores: {
        select: { gameType: true, score: true, playedAt: true },
        orderBy: { score: "desc" },
        take: 100,
      },
      _count: { select: { gameScores: true, savedWords: true } },
    },
  });

  if (!user) notFound();

  // Best score per game type
  const bestScores: Record<string, number> = {};
  for (const gs of user.gameScores) {
    if (!bestScores[gs.gameType] || gs.score > bestScores[gs.gameType]) {
      bestScores[gs.gameType] = gs.score;
    }
  }

  const profile = {
    id: user.id,
    name: user.name,
    image: user.image,
    targetLanguage: user.targetLanguage,
    joinedAt: user.createdAt.toISOString(),
    progress: user.progress
      ? {
          xp: user.progress.xp,
          level: user.progress.level,
          streak: user.progress.streak,
          badges: user.progress.badges,
          skillTree: user.progress.skillTree as { vocabulary: number; grammar: number; speaking: number },
          weeklyXp: user.progress.weeklyXp as Record<string, number>,
        }
      : null,
    bestScores,
    counts: user._count,
  };

  const viewerId = (session.user as any).id ?? "";

  return (
    <div style={{ padding: "0 0 48px" }}>
      <div style={{ padding: "20px 24px 12px" }}>
        <Link href="/community" className="back-link" style={{ marginBottom: 0 }}>
          <ChevronLeft size={14} />
          Community
        </Link>
      </div>
      <PublicProfile profile={profile} viewerUserId={viewerId} />
    </div>
  );
}
