import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AccentChallenge } from "@/components/games/AccentChallenge";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Accent Challenge — Lingova" };

export default async function AccentChallengePage() {
  const session = await getServerSession(authOptions);
  const language = session?.user?.targetLanguage ?? "fr";
  const level    = (session?.user as any)?.cefrLevel ?? "B1";

  return (
    <div className="max-w-2xl animate-fade-up">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "var(--text)", margin: "0 0 4px" }}>Accent Challenge 🎤</h1>
        <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>Same word, different accents — train your ear for regional pronunciation</p>
      </div>
      <ErrorBoundary label="Accent Challenge">
        <AccentChallenge language={language} level={level} />
      </ErrorBoundary>
    </div>
  );
}
