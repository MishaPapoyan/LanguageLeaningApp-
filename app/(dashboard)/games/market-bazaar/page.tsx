export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { VenueConversation } from "@/components/games/VenueConversation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Market Bazaar — Lingova",
  description: "Browse stalls, ask prices and haggle at the market",
};

export default async function MarketBazaarPage() {
  const session = await getServerSession(authOptions);
  const language = session?.user?.targetLanguage ?? "fr";
  const level = (session?.user as any)?.cefrLevel ?? "B1";

  return (
    <div className="max-w-2xl animate-fade-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Market Bazaar</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>
          Browse stalls, ask for prices and bargain like a local
        </p>
      </div>
      <VenueConversation venue="market-bazaar" language={language} level={level} />
    </div>
  );
}
