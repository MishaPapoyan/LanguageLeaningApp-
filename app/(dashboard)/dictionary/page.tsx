import { prisma } from "@/lib/prisma";
import { DictionaryClient } from "@/components/dictionary/DictionaryClient";
import { Metadata } from "next";
import { unstable_cache } from "next/cache";

export const metadata: Metadata = {
  title: "Dictionary — LinguaFlow",
  description: "Browse and save French vocabulary",
};

const getCachedWords = unstable_cache(
  async () => {
    const words = await prisma.word.findMany({
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
  ["dictionary-words"],
  { revalidate: 3600, tags: ["dictionary"] }
);

export default async function DictionaryPage() {
  const { words, categories } = await getCachedWords();

  return (
    <div className="animate-fade-up">
      <DictionaryClient initialWords={words as any} categories={categories} />
    </div>
  );
}
