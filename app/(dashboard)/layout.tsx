import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppNav } from "@/components/layout/AppNav";
import { MobileNav } from "@/components/layout/MobileNav";
import { NavigationProgress } from "@/components/layout/NavigationProgress";
import { RightPanel } from "@/components/layout/RightPanel";
import { LocationBanner } from "@/components/LocationBanner";
import { Suspense } from "react";

function RightPanelSkeleton() {
  return (
    <div className="space-y-4 sticky top-20 animate-pulse">
      <div className="rounded-2xl p-4 space-y-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="h-3 w-16 rounded" style={{ background: "var(--surface-3)" }} />
        <div className="grid grid-cols-2 gap-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-12 rounded-xl" style={{ background: "var(--surface-3)" }} />)}
        </div>
        <div className="h-2 rounded-full" style={{ background: "var(--surface-3)" }} />
      </div>
      <div className="rounded-2xl p-4 space-y-2" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="h-3 w-20 rounded mb-3" style={{ background: "var(--surface-3)" }} />
        {[...Array(5)].map((_, i) => <div key={i} className="h-9 rounded-xl" style={{ background: "var(--surface-3)" }} />)}
      </div>
    </div>
  );
}

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

          {/* Right panel — only on xl+ screens, loads independently */}
          <div className="hidden xl:block w-72 flex-shrink-0">
            <Suspense fallback={<RightPanelSkeleton />}>
              <RightPanel />
            </Suspense>
          </div>

        </div>
      </div>

      <MobileNav />
      <LocationBanner />
    </div>
  );
}
