export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLevelFromXp, getXpProgress, BADGES } from "@/types";
import { SettingsClient } from "@/components/settings/SettingsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings — LangCraft",
  description: "Manage your profile and preferences",
};

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? "";

  let user = null, progress = null;
  let savedWordCount = 0, completedStories = 0, gamePlays = 0;

  try {
    if (userId) {
      [user, progress, savedWordCount, completedStories, gamePlays] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: { name: true, email: true, image: true, role: true, nativeLanguage: true, targetLanguage: true, createdAt: true },
        }),
        prisma.progress.findUnique({ where: { userId } }),
        prisma.savedWord.count({ where: { userId } }),
        prisma.storyProgress.count({ where: { userId, completed: true } }),
        prisma.gameScore.count({ where: { userId } }),
      ]);
    }
  } catch (err) {
    console.error("[settings] DB error:", err);
  }

  const xpInfo = getXpProgress(progress?.xp ?? 0);
  const earnedBadges = BADGES.filter((b) => (progress?.badges ?? []).includes(b.id));
  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })
    : "Unknown";

  return (
    <div className="max-w-2xl animate-fade-up">
      <SettingsClient
        initialName={user?.name ?? ""}
        initialAvatar={user?.image ?? ""}
        initialNativeLang={user?.nativeLanguage ?? "en"}
        initialTargetLang={user?.targetLanguage ?? "fr"}
        email={user?.email ?? ""}
        role={user?.role ?? "STUDENT"}
        joinDate={joinDate}
        xpInfo={xpInfo}
        streak={progress?.streak ?? 0}
        savedWordCount={savedWordCount}
        completedStories={completedStories}
        gamePlays={gamePlays}
        earnedBadges={earnedBadges}
      />
    </div>
  );
}
