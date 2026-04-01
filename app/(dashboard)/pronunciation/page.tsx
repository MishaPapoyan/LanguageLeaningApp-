import { prisma } from "@/lib/prisma";
import { PronunciationClient } from "@/components/pronunciation/PronunciationClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pronunciation — LinguaFlow",
  description: "Practice French pronunciation",
};

export default async function PronunciationPage() {
  const words = await prisma.word.findMany({
    where: { difficulty: "BEGINNER" },
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
      <PronunciationClient words={words} categories={categories} />
    </div>
  );
}
