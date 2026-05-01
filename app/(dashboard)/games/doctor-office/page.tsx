export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { VenueConversation } from "@/components/games/VenueConversation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Doctor's Office — Lingova",
  description: "Visit the doctor and describe your symptoms in your target language",
};

export default async function DoctorOfficePage() {
  const session = await getServerSession(authOptions);
  const language = session?.user?.targetLanguage ?? "fr";
  const level = (session?.user as any)?.cefrLevel ?? "B1";

  return (
    <div className="max-w-2xl animate-fade-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Doctor's Office</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>
          Book an appointment, describe symptoms, and pick up your prescription
        </p>
      </div>
      <VenueConversation venue="doctor-office" language={language} level={level} />
    </div>
  );
}
