export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import nextDynamic from "next/dynamic";

const InterviewGame = nextDynamic(
  () => import("@/components/games/interview/InterviewGame"),
  { ssr: false }
);

export default async function InterviewPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const lang = (session.user as any).targetLanguage ?? "fr";

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 0 48px" }}>
      <InterviewGame language={lang} />
    </div>
  );
}
