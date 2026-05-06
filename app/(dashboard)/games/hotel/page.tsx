export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { VenueConversation } from "@/components/games/VenueConversation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hotel — Lingova",
  description: "Check in, order room service, and handle requests — all in your target language",
};

export default async function HotelPage() {
  const session = await getServerSession(authOptions);
  const language = session?.user?.targetLanguage ?? "fr";
  const level = (session?.user as any)?.cefrLevel ?? "B1";

  return (
    <div className="max-w-2xl animate-fade-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Hotel 🏨</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>
          Check in, order room service, and handle requests — all in{" "}
          {language === "fr" ? "French" : language === "es" ? "Spanish" : "English"}
        </p>
      </div>
      <VenueConversation venue="hotel" language={language} level={level} />
    </div>
  );
}
