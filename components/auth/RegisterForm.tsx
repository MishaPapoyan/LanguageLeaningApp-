"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type Role = "STUDENT" | "TEACHER";
type TargetLang = "fr" | "es";

const TARGET_LANGUAGES: { code: TargetLang; label: string; flag: string }[] = [
  { code: "fr", label: "French", flag: "\u{1F1EB}\u{1F1F7}" },
  { code: "es", label: "Spanish", flag: "\u{1F1EA}\u{1F1F8}" },
];

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("STUDENT");
  const [targetLanguage, setTargetLanguage] = useState<TargetLang>("fr");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role, targetLanguage }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Registration failed");
      setLoading(false);
      return;
    }

    await signIn("credentials", { email, password, redirect: false });
    router.push("/home");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-rose-50 text-rose-600 px-4 py-3 rounded-xl text-sm font-medium">{error}</div>
      )}

      <div>
        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">I am a</label>
        <div className="grid grid-cols-2 gap-2">
          {(["STUDENT", "TEACHER"] as Role[]).map((r) => (
            <button key={r} type="button" onClick={() => setRole(r)}
              className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                role === r ? "border-violet-500 bg-violet-50 text-violet-700" : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
              }`}>
              {r === "STUDENT" ? "\u{1F393} Student" : "\u{1F469}\u200D\u{1F3EB} Teacher"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">I want to learn</label>
        <div className="grid grid-cols-2 gap-2">
          {TARGET_LANGUAGES.map((lang) => (
            <button key={lang.code} type="button" onClick={() => setTargetLanguage(lang.code)}
              className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                targetLanguage === lang.code ? "border-violet-500 bg-violet-50 text-violet-700" : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
              }`}>
              {lang.flag} {lang.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1.5">Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Your name" required minLength={2} />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1.5">Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" required />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1.5">Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="At least 6 characters" required minLength={6} />
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full py-3">
        {loading ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
