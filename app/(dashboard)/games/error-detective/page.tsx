import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ErrorDetective } from "@/components/games/ErrorDetective";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Error Detective — Lingova" };

export default async function ErrorDetectivePage() {
  const session = await getServerSession(authOptions);
  const language = session?.user?.targetLanguage ?? "fr";
  const level    = (session?.user as any)?.cefrLevel ?? "B1";

  return (
    <div className="max-w-2xl animate-fade-up">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "var(--text)", margin: "0 0 4px" }}>Error Detective 🔍</h1>
        <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>Find the grammar mistake in each sentence and correct it</p>
      </div>
      <ErrorBoundary label="Error Detective">
        <ErrorDetective language={language} level={level} />
      </ErrorBoundary>
    </div>
  );
}
