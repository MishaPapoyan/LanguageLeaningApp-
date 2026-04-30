export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SentenceBuilder } from "@/components/games/SentenceBuilder";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sentence Builder — Lingova",
  description: "Arrange word tiles into correct sentences",
};

export default async function SentenceBuilderPage() {
  const session = await getServerSession(authOptions);
  const lang = session?.user?.targetLanguage ?? "fr";

  return (
    <div className="max-w-2xl animate-fade-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Sentence Builder</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>
          Tap the word tiles to build the correct sentence
        </p>
      </div>
      <ErrorBoundary label="Sentence Builder">
        <SentenceBuilder targetLang={lang} />
      </ErrorBoundary>
    </div>
  );
}
