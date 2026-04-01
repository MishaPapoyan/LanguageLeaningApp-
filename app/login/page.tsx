import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/home");

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Left - decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600 to-indigo-700 relative overflow-hidden items-center justify-center">
        <div className="text-center text-white z-10 px-12">
          <p className="text-7xl mb-4">🇫🇷</p>
          <h2 className="font-serif text-4xl mb-3 italic">Bienvenue!</h2>
          <p className="text-violet-200 text-lg">Your French journey continues here.</p>
        </div>
        {/* Decorative blobs */}
        <div className="absolute top-20 -left-20 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -right-16 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-white/5" />
      </div>

      {/* Right - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Link href="/" className="inline-flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              LF
            </div>
            <span className="font-serif text-lg text-zinc-900">LinguaFlow</span>
          </Link>
          <h1 className="font-serif text-3xl text-zinc-900 mb-1">Welcome back</h1>
          <p className="text-zinc-500 text-sm mb-8">Enter your details to continue learning</p>
          <LoginForm />
          <p className="text-center text-sm text-zinc-500 mt-6">
            No account?{" "}
            <Link href="/register" className="text-violet-600 font-medium hover:underline">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
