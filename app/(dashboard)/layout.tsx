import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppNav } from "@/components/layout/AppNav";
import { MobileNav } from "@/components/layout/MobileNav";
import { NavigationProgress } from "@/components/layout/NavigationProgress";
import { RightPanel } from "@/components/layout/RightPanel";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <NavigationProgress />
      <AppNav />

      {/* Full-width wrapper */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-8 pb-28 md:pb-12">
        <div className="flex gap-6 items-start">

          {/* Main content — grows to fill */}
          <main className="flex-1 min-w-0">
            {children}
          </main>

          {/* Right panel — only on xl+ screens */}
          <div className="hidden xl:block w-72 flex-shrink-0">
            <RightPanel />
          </div>

        </div>
      </div>

      <MobileNav />
    </div>
  );
}
