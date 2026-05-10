import { RegisterForm } from "@/components/auth/RegisterForm";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/home");

  return (
    <div className="min-h-screen bg-black text-white relative">
      <div className="min-h-screen flex flex-col items-center justify-center p-8 py-16">
        <div className="w-full max-w-lg space-y-10">
          {/* Logo */}
          <Link href="/" className="block">
            <div className="w-20 h-20 bg-emerald-500 rounded-3xl mx-auto flex items-center justify-center font-bold text-3xl italic text-black shadow-[0_0_50px_rgba(16,185,129,0.3)] serif">
              L
            </div>
          </Link>

          {/* Wordmark + heading */}
          <div className="text-center space-y-3">
            <h1 className="text-7xl md:text-8xl italic font-black tracking-tighter">Lingova</h1>
            <p className="text-white/40 text-lg">
              Start speaking from day one — no credit card required.
            </p>
          </div>

          {/* Form */}
          <RegisterForm />

          {/* Log in link */}
          <p className="text-center text-sm text-white/40">
            Already learning?{" "}
            <Link
              href="/login"
              className="text-emerald-500 font-bold hover:text-emerald-400 transition-colors"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>

      <footer className="w-full text-center text-[10px] font-bold uppercase tracking-[0.3em] text-white/10 pb-8">
        Lingova Global Platform · Secure Auth Enabled
      </footer>
    </div>
  );
}
