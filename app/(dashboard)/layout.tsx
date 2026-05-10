export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { NavigationProgress } from "@/components/layout/NavigationProgress";
import { LocationBanner } from "@/components/LocationBanner";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex" }}>
      <NavigationProgress />
      <Sidebar />
      <main style={{ flex: 1, minWidth: 0, overflowX: "hidden" }}>
        <div className="px-4 md:px-8 lg:px-10 pt-6 lg:pt-8 pb-20" style={{ maxWidth: 1280, marginInline: "auto", width: "100%" }}>
          {children}
        </div>
      </main>
      <LocationBanner />
    </div>
  );
}
