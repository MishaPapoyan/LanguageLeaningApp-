export default function LeaderboardLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
      <div className="h-8 w-44 bg-zinc-200 rounded-lg" />
      <div className="flex justify-center gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-20 h-28 bg-zinc-200 rounded-xl" />
        ))}
      </div>
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="card h-14" />
        ))}
      </div>
    </div>
  );
}
