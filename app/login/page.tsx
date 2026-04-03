import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/home");

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>

      {/* Left — decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center"
        style={{ background: "linear-gradient(135deg, #1a1535 0%, #0f0e1f 100%)", borderRight: "1px solid var(--border)" }}>

        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(124,106,255,0.2) 0%, transparent 70%)", filter: "blur(40px)" }} />
        <div className="absolute bottom-1/3 right-1/4 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(96,165,250,0.12) 0%, transparent 70%)", filter: "blur(40px)" }} />

        <div className="text-center z-10 px-12">
          <p className="text-7xl mb-6">🇫🇷</p>
          <h2 className="font-serif text-4xl mb-3 italic" style={{ color: "var(--text)" }}>Bienvenue!</h2>
          <p className="text-lg mb-8" style={{ color: "var(--text-2)" }}>Your French journey continues here.</p>

        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Link href="/" className="inline-flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
              style={{ background: "linear-gradient(135deg, #7c6aff 0%, #5b4fcf 100%)" }}>
              LF
            </div>
            <span className="font-serif text-lg" style={{ color: "var(--text)" }}>LinguaFlow</span>
          </Link>

          <h1 className="font-serif text-3xl mb-1" style={{ color: "var(--text)" }}>Welcome back</h1>
          <p className="text-sm mb-8" style={{ color: "var(--text-2)" }}>Enter your details to continue learning</p>

          <LoginForm />

          <p className="text-center text-sm mt-6" style={{ color: "var(--text-3)" }}>
            No account?{" "}
            <Link href="/register" className="font-medium hover:underline" style={{ color: "var(--accent)" }}>Sign up free</Link>
          </p>
        </div>
      </div>

    </div>
  );
}
