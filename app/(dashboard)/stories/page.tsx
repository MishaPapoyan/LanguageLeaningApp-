export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLanguageConfig } from "@/data/language-config";
import { Metadata } from "next";
import { StoriesClient } from "@/components/stories/StoriesClient";
import { t, getLocale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Stories — Lingova",
  description: "Learn through interactive stories",
};

export default async function StoriesPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const language = session?.user?.targetLanguage ?? "fr";
  const langConfig = getLanguageConfig(language);
  const locale = getLocale((session?.user as any)?.nativeLanguage ?? "en");

  let storiesData: {
    id: string; title: string; chapter: number; difficulty: string;
    imageEmoji: string; quizCount: number; wordCount: number;
    isCompleted: boolean; isStarted: boolean; score: number;
  }[] = [];

  try {
    const stories = await prisma.story.findMany({
      where: { language },
      orderBy: { chapter: "asc" },
      select: {
        id: true,
        title: true,
        chapter: true,
        difficulty: true,
        imageEmoji: true,
        quizzes: { select: { id: true } },
        _count: { select: { words: true } },
        ...(userId ? { progress: { where: { userId }, select: { completed: true, score: true } } } : {}),
      },
    });

    storiesData = stories.map((story) => {
      const progress = (story as any).progress?.[0];
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
  } catch (err) {
    console.error("[stories] DB error:", err);
  }

  return (
    <div className="space-y-12">
      {/* ── Header ── */}
      <header>
        <h1 className="text-5xl mb-2">Immersive Stories</h1>
        <p className="text-white/40 text-lg">
          Read and listen to tales crafted for your level. {langConfig.flag}{" "}
          <span className="text-white/30">{t(locale, "stories_subtitle_tpl", { lang: langConfig.label })}</span>
        </p>
      </header>

      <StoriesClient stories={storiesData} />
    </div>
  );
}
