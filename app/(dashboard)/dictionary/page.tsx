import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DictionaryClient } from "@/components/dictionary/DictionaryClient";
import { unstable_cache } from "next/cache";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dictionary — LangCraft",
  description: "Browse and save vocabulary",
};

function getCachedWords(language: string) {
  return unstable_cache(
    async () => {
      const words = await prisma.word.findMany({
        where: { language },
        orderBy: { word: "asc" },
        select: {
          id: true, word: true, translation: true, category: true,
          difficulty: true, imageEmoji: true, definition: true,
          exampleFr: true, exampleEn: true,
        },
      });
      const categories = [...new Set(words.map((w) => w.category))].sort();
      return { words, categories };
    },
    [`dictionary-words-${language}`],
    { revalidate: 3600, tags: [`dictionary-${language}`] }
  )();
}

export default async function DictionaryPage() {
  const session = await getServerSession(authOptions);
  const language = session?.user?.targetLanguage ?? "fr";
  const { words, categories } = await getCachedWords(language);

  return (
    <div className="animate-fade-up">
      <DictionaryClient initialWords={words as any} categories={categories} />
    </div>
  );
}
