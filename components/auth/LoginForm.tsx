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

    const result = await signIn("credentials", { email, password, redirect: false });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      // Reset location consent on each login so the browser asks again
      localStorage.removeItem("lf_location_consent");
      router.push("/home");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="px-4 py-3 rounded-xl text-sm font-medium" style={{ background: "var(--red-dim)", color: "var(--red)" }}>
          {error}
        </div>
      )}
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide mb-1.5" style={{ color: "var(--text-3)" }}>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" required />
      </div>
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide mb-1.5" style={{ color: "var(--text-3)" }}>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="Enter your password" required />
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full py-3">
        {loading ? "Signing in..." : "Sign in"}
      </button>

    </form>
  );
}
