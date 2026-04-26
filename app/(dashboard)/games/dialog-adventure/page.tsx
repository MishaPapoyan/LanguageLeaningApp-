export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DialogAdventure } from "@/components/games/DialogAdventure";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dialog Adventure — LangCraft",
  description: "Live scripted conversations in real-world scenarios",
};

export default async function DialogAdventurePage() {
  const session = await getServerSession(authOptions);
  const lang = session?.user?.targetLanguage ?? "fr";

  return (
    <div className="max-w-2xl animate-fade-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Dialog Adventure</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>
          Real conversations, real scenarios — choose the right response
        </p>
      </div>
      <ErrorBoundary label="Dialog Adventure">
        <DialogAdventure targetLang={lang} />
      </ErrorBoundary>
    </div>
  );
}
