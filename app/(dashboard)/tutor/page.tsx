import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TutorClient } from "@/components/tutor/TutorClient";
import { getLevelFromXp } from "@/types";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Tutor — LinguaFlow",
  description: "Practice French with an AI conversation partner",
};

export default async function TutorPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? "";

  const progress = userId
    ? await prisma.progress.findUnique({ where: { userId }, select: { xp: true, level: true } })
    : null;

  const userLevel = progress ? getLevelFromXp(progress.xp) : 1;

  return (
    <div className="animate-fade-up">
      <TutorClient userLevel={userLevel} />
    </div>
  );
}
