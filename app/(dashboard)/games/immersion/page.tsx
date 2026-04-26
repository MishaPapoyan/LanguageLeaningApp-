export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Immersion Room — LangCraft",
  description: "Find objects in a 3D room by listening to voice commands",
};

// WASM loader can't run on the server
const ImmersionGame = dynamic(
  () => import("@/components/games/ImmersionGame"),
  {
    ssr: false,
    loading: () => (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 600 }}>
        <p style={{ color: "var(--text-3)", fontSize: 14 }}>Loading 3D room…</p>
      </div>
    ),
  }
);

export default async function ImmersionPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const lang = (session.user as any)?.targetLanguage ?? "fr";

  return (
    <div className="animate-fade-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Immersion Room</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>
          Listen and find the object in the room — train vocabulary in 3D
        </p>
      </div>
      <ImmersionGame language={lang} />
    </div>
  );
}
