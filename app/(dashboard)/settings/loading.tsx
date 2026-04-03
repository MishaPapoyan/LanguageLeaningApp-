export default function SettingsLoading() {
  return (
    <div className="max-w-2xl space-y-4 animate-pulse">
      <div className="h-8 w-32 rounded-xl" style={{ background: "var(--surface-2)" }} />
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-20 rounded-2xl" style={{ background: "var(--surface)" }} />
      ))}
    </div>
  );
}
