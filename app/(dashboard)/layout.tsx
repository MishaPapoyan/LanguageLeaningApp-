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
    <div style={{ background: "var(--paper)", minHeight: "100vh", display: "flex" }}>
      <NavigationProgress />
      <Sidebar />
      <main style={{ flex: 1, minWidth: 0, overflowX: "hidden" }}>
        <div
          className="lv-page-enter px-5 md:px-10 lg:px-14 pt-8 lg:pt-10 pb-20"
          style={{ maxWidth: 1280, marginInline: "auto", width: "100%" }}
        >
          {children}
        </div>
      </main>
      <LocationBanner />
    </div>
  );
}
