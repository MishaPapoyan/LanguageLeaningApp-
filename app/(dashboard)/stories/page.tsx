import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import { StoriesClient } from "@/components/stories/StoriesClient";

export const metadata: Metadata = {
  title: "Stories — LinguaFlow",
  description: "Learn French through interactive stories",
};

export default async function StoriesPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const stories = await prisma.story.findMany({
    orderBy: { chapter: "asc" },
    select: {
      id: true,
      title: true,
      chapter: true,
      difficulty: true,
      imageEmoji: true,
      quizzes: { select: { id: true } },
      _count: { select: { words: true } },
      progress: { where: { userId }, select: { completed: true, score: true } },
    },
  });

  const storiesData = stories.map((story) => {
    const progress = story.progress[0];
    return {
      id: story.id,
      title: story.title,
      chapter: story.chapter,
      difficulty: story.difficulty as string,
      imageEmoji: story.imageEmoji,
      quizCount: story.quizzes.length,
      wordCount: story._count.words,
      isCompleted: progress?.completed ?? false,
      isStarted: !!progress,
      score: progress?.score ?? 0,
    };
  });

  return (
    <div style={{ maxWidth: 760 }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.5px" }}>
            Stories
          </h1>
          <span style={{ fontSize: 24 }}>🇫🇷</span>
        </div>
        <p style={{ color: "var(--text-2)", fontSize: 14 }}>
          Immerse yourself in French through rich, interactive stories. Tap highlighted words to reveal translations, then test your memory with a quiz.
        </p>
      </div>

      <StoriesClient stories={storiesData} />
    </div>
  );
}
