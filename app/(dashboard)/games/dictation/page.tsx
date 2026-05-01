import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Dictation } from "@/components/games/Dictation";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Dictation — Lingova" };

export default async function DictationPage() {
  const session = await getServerSession(authOptions);
  const language = session?.user?.targetLanguage ?? "fr";
  const level    = (session?.user as any)?.cefrLevel ?? "B1";

  return (
    <div className="max-w-2xl animate-fade-up">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "var(--text)", margin: "0 0 4px" }}>Dictation ✍️</h1>
        <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>Listen and type exactly what you hear — spelling and accents count</p>
      </div>
      <ErrorBoundary label="Dictation">
        <Dictation language={language} level={level} />
      </ErrorBoundary>
    </div>
  );
}
