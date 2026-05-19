export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLevelFromXp } from "@/types";
import { VideoTutorClient } from "@/components/video-tutor/VideoTutorClient";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Video Tutor — Lingova",
  description: "Face-to-face AI language tutor with voice and animated avatar",
};

export default async function VideoTutorPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id ?? "";

  const progress = userId
    ? await prisma.progress.findUnique({
        where: { userId },
        select: { xp: true },
      })
    : null;

  const userLevel = progress ? getLevelFromXp(progress.xp) : 1;

  return (
    <div className="animate-fade-up">
      <ErrorBoundary label="Video Tutor">
        <VideoTutorClient userLevel={userLevel} />
      </ErrorBoundary>
    </div>
  );
}
