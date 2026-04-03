export default function StoriesLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
      <div className="h-8 w-40 bg-transparent rounded-lg" />
      <div className="h-4 w-56 bg-transparent rounded-lg" />
      <div className="grid gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card h-28" />
        ))}
      </div>
    </div>
  );
}
