import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DictionaryClient } from "@/components/dictionary/DictionaryClient";
import { getWordsByLanguage } from "@/data/dictionary-words";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dictionary — LangCraft",
  description: "Browse and save vocabulary",
};

export default async function DictionaryPage() {
  const session = await getServerSession(authOptions);
  const language = session?.user?.targetLanguage ?? "fr";
  const words = getWordsByLanguage(language);
  const categories = [...new Set(words.map((w) => w.category))].sort();

  return (
    <DictionaryClient initialWords={words as any} categories={categories} />
  );
}
