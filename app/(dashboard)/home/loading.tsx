// Streamed skeleton for the home dashboard. Renders instantly while server fetches data.
// Improves Lighthouse Speed Index (was 2.4s) by giving the browser content to paint immediately,
// instead of staring at a blank screen until all 6+ Prisma queries finish.

export default function HomeLoading() {
  return (
    <div className="space-y-12 animate-fade-up" aria-hidden="true">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="h-12 md:h-14 w-72 max-w-full rounded-lg skeleton" />
          <div className="h-5 w-80 max-w-full rounded skeleton" />
        </div>
        <div className="h-12 w-44 rounded-2xl skeleton" />
      </header>

      {/* 4 stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="card-premium p-6 flex flex-col gap-4 min-h-[160px]"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl skeleton" />
              <div className="h-4 w-10 rounded skeleton" />
            </div>
            <div className="h-10 w-20 rounded skeleton" />
            <div className="h-3 w-24 rounded skeleton" />
          </div>
        ))}
      </div>

      {/* 2-col content grid (8/4 on desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {/* Quick actions row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="card-premium p-4 min-h-[120px] skeleton" />
            ))}
          </div>
          {/* Today's plan */}
          <div className="card-premium p-6 h-32 skeleton" />
          {/* Recommended games */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="card-premium p-4 h-28 skeleton" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-4 space-y-6">
          <div className="card-premium p-6 h-40 skeleton" />
          <div className="card-premium p-6 h-48 skeleton" />
          <div className="card-premium p-6 h-56 skeleton" />
        </div>
      </div>
    </div>
  );
}
