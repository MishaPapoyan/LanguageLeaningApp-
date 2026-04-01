import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-sand-50 px-4">
      <div className="text-center">
        <div className="text-6xl mb-4">🗺️</div>
        <h1 className="text-4xl font-serif font-bold text-zinc-800 mb-2">404</h1>
        <p className="text-lg text-zinc-500 mb-1">
          Cette page n&apos;existe pas
        </p>
        <p className="text-sm text-zinc-400 mb-8">
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
