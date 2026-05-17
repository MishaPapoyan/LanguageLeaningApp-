"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Zap, Phone, Mail } from "lucide-react";
import { t, getClientLocale, type Locale } from "@/lib/i18n";

export function LoginForm() {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>("en");
  useEffect(() => { setLocale(getClientLocale()); }, []);
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [email, setEmail]       = useState("");
  const [phone, setPhone]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const doSignIn = async (e: string, p: string) => {
    const result = await signIn("credentials", { email: e, password: p, redirect: false });
    if (result?.error) {
      setError(t(locale, "auth_invalidCredentials"));
      setLoading(false);
      setDemoLoading(false);
    } else {
      localStorage.removeItem("lc_location_consent");
      router.push("/home");
      router.refresh();
    }
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setLoading(true);
    setError("");
    // For phone login, pass phone as email field — auth layer will resolve it
    await doSignIn(loginMethod === "email" ? email : phone, password);
  };

  const handleDemo = async () => {
    setDemoLoading(true);
    setError("");
    await doSignIn("demo@lingova.app", "demo123");
  };

  return (
    <div>
      {/* Demo banner */}
      <button
        type="button"
        onClick={handleDemo}
        disabled={demoLoading || loading}
        style={{
          width: "100%", marginBottom: 20,
          padding: "13px 16px", borderRadius: 14,
          background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(20,184,166,0.12))",
          border: "1.5px solid rgba(16,185,129,0.35)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          cursor: demoLoading ? "wait" : "pointer",
          transition: "all 0.15s",
        }}
      >
        <Zap size={15} style={{ color: "var(--accent)" }} />
        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--accent)" }}>
          {demoLoading ? t(locale, "auth_demoLoading") : t(locale, "auth_demoBtn")}
        </span>
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        <span style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{t(locale, "auth_orSignIn")}</span>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      </div>

      {/* Toggle email / phone */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
        {(["email", "phone"] as const).map((method) => (
          <button
            key={method}
            type="button"
            onClick={() => { setLoginMethod(method); setError(""); }}
            style={{
              padding: "10px 12px", borderRadius: 12,
              border: loginMethod === method ? "2px solid var(--accent)" : "2px solid var(--border)",
              background: loginMethod === method ? "var(--accent-dim)" : "var(--surface)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              cursor: "pointer", transition: "all 0.15s",
              fontSize: 13, fontWeight: 600,
              color: loginMethod === method ? "var(--accent-2)" : "var(--text-3)",
            }}
          >
            {method === "email" ? <Mail size={14} /> : <Phone size={14} />}
            {method === "email" ? t(locale, "auth_email") : t(locale, "auth_phone")}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="px-4 py-3 rounded-xl text-sm font-medium" style={{ background: "var(--red-dim)", color: "var(--red)" }}>
            {error}
          </div>
        )}

        {loginMethod === "email" ? (
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide mb-1.5" style={{ color: "var(--text-3)" }}>{t(locale, "auth_email")}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder={t(locale, "auth_emailPlaceholder")} required />
          </div>
        ) : (
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide mb-1.5" style={{ color: "var(--text-3)" }}>{t(locale, "auth_phoneNumber")}</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input" placeholder="+1 555 000 0000" required />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium uppercase tracking-wide mb-1.5" style={{ color: "var(--text-3)" }}>{t(locale, "auth_password")}</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder={t(locale, "auth_passwordEnter")} required />
        </div>
        <button type="submit" disabled={loading || demoLoading} className="btn-primary w-full py-3">
          {loading ? t(locale, "auth_signingIn") : t(locale, "auth_signIn")}
        </button>
      </form>
    </div>
  );
}
