export default function DictionaryLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
      <div className="h-8 w-40 bg-zinc-200 rounded-lg" />
      <div className="h-10 w-full bg-zinc-200 rounded-xl" />
      <div className="flex gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 w-20 bg-zinc-200 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="card h-32" />
        ))}
      </div>
    </div>
  );
}
