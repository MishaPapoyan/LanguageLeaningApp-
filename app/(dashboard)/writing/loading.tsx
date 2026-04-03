export default function WritingLoading() {
  return (
    <div className="max-w-3xl animate-pulse space-y-3">
      <div className="h-8 w-36 rounded-xl" style={{ background: "var(--surface-2)" }} />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-24 rounded-2xl" style={{ background: "var(--surface)" }} />
      ))}
    </div>
  );
}
