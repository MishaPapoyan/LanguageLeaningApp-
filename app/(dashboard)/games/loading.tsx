export default function GamesLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
      <div className="h-8 w-36 bg-transparent rounded-lg" />
      <div className="h-4 w-64 bg-transparent rounded-lg" />
      <div className="grid md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card h-48" />
        ))}
      </div>
    </div>
  );
}
