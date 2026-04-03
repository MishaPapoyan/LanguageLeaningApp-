export default function ReviewLoading() {
  return (
    <div className="max-w-md animate-pulse space-y-4">
      <div className="h-2 rounded-full" style={{ background: "var(--surface-2)" }} />
      <div className="h-64 rounded-2xl" style={{ background: "var(--surface)" }} />
      <div className="grid grid-cols-2 gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 rounded-xl" style={{ background: "var(--surface)" }} />
        ))}
      </div>
    </div>
  );
}
