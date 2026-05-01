import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { WordAssociation } from "@/components/games/WordAssociation";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Word Association — Lingova" };

export default async function WordAssociationPage() {
  const session = await getServerSession(authOptions);
  const language = session?.user?.targetLanguage ?? "fr";
  const level    = (session?.user as any)?.cefrLevel ?? "B1";

  return (
    <div className="max-w-2xl animate-fade-up">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "var(--text)", margin: "0 0 4px" }}>Word Association</h1>
        <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>Find all words related to the target word before time runs out</p>
      </div>
      <ErrorBoundary label="Word Association">
        <WordAssociation language={language} level={level} />
      </ErrorBoundary>
    </div>
  );
}
