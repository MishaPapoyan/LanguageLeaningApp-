export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CityExplorer } from "@/components/games/CityExplorer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "City Explorer — LangCraft",
  description: "Explore a 2D city and talk to NPCs in your target language",
};

export default async function CityExplorerPage() {
  const session = await getServerSession(authOptions);
  const lang = session?.user?.targetLanguage ?? "fr";

  return (
    <div className="animate-fade-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>City Explorer</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>
          Explore the city, find NPCs, and answer their vocabulary challenges
        </p>
      </div>
      <ErrorBoundary label="City Explorer">
        <CityExplorer targetLang={lang} />
      </ErrorBoundary>
    </div>
  );
}
