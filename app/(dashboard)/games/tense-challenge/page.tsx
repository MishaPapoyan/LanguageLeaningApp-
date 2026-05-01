import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TenseChallenge } from "@/components/games/TenseChallenge";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Tense Challenge — Lingova" };

export default async function TenseChallengePage() {
  const session = await getServerSession(authOptions);
  const language = session?.user?.targetLanguage ?? "fr";
  const level    = (session?.user as any)?.cefrLevel ?? "B1";

  return (
    <div className="max-w-2xl animate-fade-up">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "var(--text)", margin: "0 0 4px" }}>Tense Challenge ⏰</h1>
        <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>Rewrite sentences in the specified tense — type the answer yourself</p>
      </div>
      <ErrorBoundary label="Tense Challenge">
        <TenseChallenge language={language} level={level} />
      </ErrorBoundary>
    </div>
  );
}
