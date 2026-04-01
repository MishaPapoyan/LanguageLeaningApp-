import { RegisterForm } from "@/components/auth/RegisterForm";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/home");

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Left - decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-500 to-teal-600 relative overflow-hidden items-center justify-center">
        <div className="text-center text-white z-10 px-12">
          <p className="text-7xl mb-4">✨</p>
          <h2 className="font-serif text-4xl mb-3 italic">Commencez!</h2>
          <p className="text-emerald-100 text-lg">Start speaking French from day one.</p>
        </div>
        <div className="absolute top-20 -right-20 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -left-16 w-96 h-96 rounded-full bg-white/5" />
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
          <h1 className="font-serif text-3xl text-zinc-900 mb-1">Create account</h1>
          <p className="text-zinc-500 text-sm mb-8">Start your free French learning journey</p>
          <RegisterForm />
          <p className="text-center text-sm text-zinc-500 mt-6">
            Already learning?{" "}
            <Link href="/login" className="text-violet-600 font-medium hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
