export default function AnalyticsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-40 rounded-xl" style={{ background: "var(--surface-2)" }} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-2xl" style={{ background: "var(--surface)" }} />
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="h-64 rounded-2xl" style={{ background: "var(--surface)" }} />
        <div className="h-64 rounded-2xl" style={{ background: "var(--surface)" }} />
      </div>
      <div className="h-48 rounded-2xl" style={{ background: "var(--surface)" }} />
    </div>
  );
}
