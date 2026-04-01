export default function HomeLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div>
          <div className="h-8 w-56 bg-zinc-200 rounded-lg" />
          <div className="h-4 w-40 bg-zinc-100 rounded-lg mt-2" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card h-20" />
        ))}
      </div>
      <div className="card h-16" />
      <div className="card h-32" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="card h-24" />
        ))}
      </div>
    </div>
  );
}
