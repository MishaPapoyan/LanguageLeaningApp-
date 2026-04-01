"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/home");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-rose-50 text-rose-600 px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}
      <div>
        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1.5">Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" required />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1.5">Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="Enter your password" required />
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full py-3">
        {loading ? "Signing in..." : "Sign in"}
      </button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-100" /></div>
        <div className="relative flex justify-center"><span className="bg-zinc-50 px-3 text-xs text-zinc-400">or try a demo</span></div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => { setEmail("student@demo.com"); setPassword("demo123"); }}
          className="btn-outline text-xs py-2.5">
          🎓 Student
        </button>
        <button type="button" onClick={() => { setEmail("teacher@demo.com"); setPassword("demo123"); }}
          className="btn-outline text-xs py-2.5">
          👩‍🏫 Teacher
        </button>
      </div>
    </form>
  );
}
