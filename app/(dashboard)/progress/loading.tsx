export default function ProgressLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
      <div className="h-8 w-40 bg-transparent rounded-lg" />
      <div className="card h-28" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card h-24" />
        ))}
      </div>
      <div className="card h-52" />
      <div className="card h-40" />
    </div>
  );
}
