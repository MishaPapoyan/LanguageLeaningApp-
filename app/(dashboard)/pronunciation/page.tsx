export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PronunciationClient } from "@/components/pronunciation/PronunciationClient";
import { getLanguageConfig } from "@/data/language-config";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pronunciation — LangCraft",
  description: "Practice pronunciation",
};

export default async function PronunciationPage() {
  const session = await getServerSession(authOptions);
  const language = session?.user?.targetLanguage ?? "fr";
  const langConfig = getLanguageConfig(language);

  const words = await prisma.word.findMany({
    where: { difficulty: "BEGINNER", language },
    select: {
      id: true,
      word: true,
      translation: true,
      exampleFr: true,
      exampleEn: true,
      imageEmoji: true,
      category: true,
    },
    orderBy: { category: "asc" },
    take: 30,
  });

  const categories = [...new Set(words.map((w) => w.category))];

  return (
    <div className="animate-fade-up">
      <PronunciationClient words={words} categories={categories} ttsLocale={langConfig.ttsLocale} />
    </div>
  );
}
