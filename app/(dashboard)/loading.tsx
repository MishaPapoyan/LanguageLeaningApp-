export default function DashboardLoading() {
  return (
    <div className="max-w-4xl mx-auto animate-pulse">
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 bg-zinc-200 rounded-lg" />
          <div className="h-4 w-64 bg-zinc-100 rounded-lg mt-2" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-white border border-zinc-100 rounded-2xl" />
          ))}
        </div>
        <div className="h-48 bg-white border border-zinc-100 rounded-2xl" />
        <div className="grid md:grid-cols-2 gap-4">
          <div className="h-40 bg-white border border-zinc-100 rounded-2xl" />
          <div className="h-40 bg-white border border-zinc-100 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
