import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--bg)" }}
    >
      <div className="text-center">
        <div className="text-6xl mb-4">🗺️</div>
        <h1 className="text-4xl font-bold mb-2" style={{ color: "var(--text)" }}>404</h1>
        <p className="text-lg mb-1" style={{ color: "var(--text-2)" }}>
          Cette page n&apos;existe pas
        </p>
        <p className="text-sm mb-8" style={{ color: "var(--text-3)" }}>
          This page doesn&apos;t exist — but your French journey does!
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/home" className="btn-primary">
            Go to Dashboard
          </Link>
          <Link href="/learn" className="btn-outline">
            Continue Learning
          </Link>
        </div>
      </div>
    </div>
  );
}
