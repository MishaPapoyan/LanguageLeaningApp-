export default function PronunciationLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 rounded-xl" style={{ background: "var(--surface-2)" }} />
      <div className="flex gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-9 w-24 rounded-xl" style={{ background: "var(--surface)" }} />
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-28 rounded-2xl" style={{ background: "var(--surface)" }} />
        ))}
      </div>
    </div>
  );
}
