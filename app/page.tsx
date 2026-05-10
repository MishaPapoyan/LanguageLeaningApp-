import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { ArrowRight, Zap, Sparkles, Trophy } from "lucide-react";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/home");

  const features = [
    { icon: Zap, label: "Adaptive Path", desc: "Curriculum that evolves with you" },
    { icon: Sparkles, label: "AI Immersion", desc: "Real-time conversation practice" },
    { icon: Trophy, label: "Global Leagues", desc: "Compete for linguistic mastery" },
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-y-auto">
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="max-w-4xl text-center space-y-12">
          {/* Logo block */}
          <div className="w-24 h-24 bg-emerald-500 rounded-3xl mx-auto flex items-center justify-center font-bold text-4xl italic text-black shadow-[0_0_50px_rgba(16,185,129,0.3)] serif">
            L
          </div>

          {/* Wordmark + tagline */}
          <div className="space-y-4">
            <h1 className="text-7xl md:text-8xl italic font-black tracking-tighter">Lingova</h1>
            <p className="text-2xl text-white/40 leading-relaxed max-w-2xl mx-auto">
              The premium immersion platform designed to take you from beginner to fluent through
              AI-powered experiences.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8">
            {features.map((f, i) => (
              <div key={i} className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white/5 mx-auto flex items-center justify-center text-emerald-500">
                  <f.icon size={24} />
                </div>
                <h4 className="font-bold">{f.label}</h4>
                <p className="text-xs text-white/30 leading-relaxed font-bold uppercase tracking-widest">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="btn-primary py-6 px-16 text-xl rounded-2xl flex items-center gap-3 shadow-2xl"
            >
              Get Started <ArrowRight size={24} />
            </Link>
            <Link
              href="/login"
              className="btn-secondary py-6 px-12 text-lg rounded-2xl"
            >
              I have an account
            </Link>
          </div>
        </div>
      </div>

      <footer className="absolute bottom-8 w-full text-center text-[10px] font-bold uppercase tracking-[0.3em] text-white/10">
        Lingova Global Platform · Secure Auth Enabled
      </footer>
    </div>
  );
}
