import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stories — LinguaFlow",
  description: "Learn French through interactive stories",
};

const diffBadge = {
  BEGINNER: "badge-green",
  INTERMEDIATE: "badge-blue",
  ADVANCED: "badge-red",
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

  return (
    <div className="max-w-3xl">
      {/* Tip */}
      <div className="flex items-start gap-3 bg-amber-50 rounded-xl p-4 mb-6 border border-amber-100/50">
        <span className="text-lg">💡</span>
        <p className="text-sm text-amber-800">
          Tap any highlighted word while reading to see its translation instantly. Then take the quiz!
        </p>
      </div>

      <div className="space-y-2">
        {stories.map((story) => {
          const progress = story.progress[0];
          const isCompleted = progress?.completed ?? false;
          const isStarted = !!progress;

          return (
            <Link key={story.id} href={`/stories/${story.id}`}
              className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-zinc-100 hover:border-zinc-200 hover:shadow-sm transition-all group">
              <div className="text-4xl flex-shrink-0 group-hover:scale-110 transition-transform">{story.imageEmoji}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-[11px] font-bold text-zinc-300 uppercase">Ch. {story.chapter}</span>
                  <span className={diffBadge[story.difficulty]}>{story.difficulty.toLowerCase()}</span>
                  {isCompleted && <span className="badge-green">done</span>}
                </div>
                <h3 className="font-serif text-lg text-zinc-900">{story.title}</h3>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-zinc-400 font-medium">
                  <span>{story._count.words} words</span>
                  <span className="w-0.5 h-0.5 rounded-full bg-zinc-300" />
                  <span>{story.quizzes.length} questions</span>
                  {isCompleted && progress.score > 0 && (
                    <>
                      <span className="w-0.5 h-0.5 rounded-full bg-zinc-300" />
                      <span className="text-emerald-500">{progress.score}%</span>
                    </>
                  )}
                </div>
              </div>
              <div className={`px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                isCompleted ? "bg-zinc-100 text-zinc-500" : "bg-violet-500 text-white"
              }`}>
                {isCompleted ? "Review" : isStarted ? "Continue" : "Start"}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
