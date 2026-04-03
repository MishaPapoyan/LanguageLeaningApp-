export default function TutorLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-24 rounded-2xl" style={{ background: "var(--surface)" }} />
      <div className="h-96 rounded-2xl" style={{ background: "var(--surface)" }} />
      <div className="h-12 rounded-xl" style={{ background: "var(--surface-2)" }} />
    </div>
  );
}
