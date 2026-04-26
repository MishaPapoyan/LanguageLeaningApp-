export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import nextDynamic from "next/dynamic";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Word Blaster 3D — LangCraft",
  description: "Shoot the correct translation before time runs out in a neon 3D arena",
};

// Three.js cannot run on the server — load client-only
const City3DGame = nextDynamic(
  () => import("@/components/games/City3DScene"),
  { ssr: false, loading: () => (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:400 }}>
      <p style={{ color:"var(--text-3)", fontSize:14 }}>Loading 3D city…</p>
    </div>
  )}
);

export default async function City3DPage() {
  const session = await getServerSession(authOptions);
  const lang = session?.user?.targetLanguage ?? "fr";

  return (
    <div className="animate-fade-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>3D City Explorer</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>
          Walk through a real 3D city — collect glowing word orbs and answer their challenges
        </p>
      </div>
      <City3DGame targetLang={lang} />
    </div>
  );
}
