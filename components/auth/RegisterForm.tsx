"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, ArrowRight, Check } from "lucide-react";
import { t, getClientLocale, type Locale } from "@/lib/i18n";

type TargetLang = "fr" | "es" | "en";

const LANGUAGES: { code: TargetLang; label: string; flag: string; sub: string }[] = [
  { code: "fr", label: "French",  flag: "🇫🇷", sub: "Français" },
  { code: "es", label: "Spanish", flag: "🇪🇸", sub: "Español" },
  { code: "en", label: "English", flag: "🇬🇧", sub: "English" },
];

const NATIVE_LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "hy", label: "Armenian", flag: "🇦🇲" },
  { code: "ru", label: "Russian", flag: "🇷🇺" },
  { code: "de", label: "German", flag: "🇩🇪" },
  { code: "es", label: "Spanish", flag: "🇪🇸" },
  { code: "fr", label: "French", flag: "🇫🇷" },
];

export function RegisterForm() {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>("en");
  useEffect(() => { setLocale(getClientLocale()); }, []);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [targetLanguage, setTargetLanguage] = useState<TargetLang>("fr");
  const [nativeLanguage, setNativeLanguage] = useState("en");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(t(locale, "auth_passwordsMismatch"));
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password, role: "STUDENT", targetLanguage, nativeLanguage }),
    });

    if (!res.ok) {
      const data = await res.json();
      const msg = typeof data.error === "string" ? data.error : t(locale, "auth_registrationFailed");
      setError(msg);
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setError(t(locale, "auth_signinAfterRegisterFailed"));
      setLoading(false);
      return;
    }
    router.push("/onboarding");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* Error */}
      {error && (
        <div style={{
          padding: "12px 16px", borderRadius: "12px",
          background: "var(--red-dim)", color: "var(--red)",
          fontSize: "13px", fontWeight: 500,
          border: "1px solid rgba(239,68,68,0.2)",
        }}>{error}</div>
      )}

      {/* Language selector */}
      <div>
        <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "10px" }}>
          {t(locale, "auth_iWantToLearn")}
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => setTargetLanguage(lang.code)}
              style={{
                padding: "14px 12px",
                borderRadius: "14px",
                border: targetLanguage === lang.code
                  ? "2px solid var(--accent)"
                  : "2px solid var(--border)",
                background: targetLanguage === lang.code
                  ? "var(--accent-dim)"
                  : "var(--surface)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                transition: "all 0.15s",
                position: "relative",
              }}
            >
              <span style={{ fontSize: "26px", lineHeight: 1 }}>{lang.flag}</span>
              <div style={{ textAlign: "left" }}>
                <div style={{
                  fontSize: "14px", fontWeight: 600,
                  color: targetLanguage === lang.code ? "var(--accent-2)" : "var(--text)",
                }}>{lang.label}</div>
                <div style={{ fontSize: "11px", color: "var(--text-3)" }}>{lang.sub}</div>
              </div>
              {targetLanguage === lang.code && (
                <div style={{
                  position: "absolute", top: "8px", right: "8px",
                  width: "18px", height: "18px", borderRadius: "50%",
                  background: "var(--accent)", display: "flex",
                  alignItems: "center", justifyContent: "center",
                }}>
                  <Check size={10} style={{ color: "white" }} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Native language */}
      <div>
        <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "10px" }}>
          {t(locale, "auth_myLanguage")}
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
          {NATIVE_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => setNativeLanguage(lang.code)}
              style={{
                padding: "10px 8px",
                borderRadius: "12px",
                border: nativeLanguage === lang.code ? "2px solid var(--accent)" : "2px solid var(--border)",
                background: nativeLanguage === lang.code ? "var(--accent-dim)" : "var(--surface)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: "18px" }}>{lang.flag}</span>
              <span style={{ fontSize: "12px", fontWeight: 600, color: nativeLanguage === lang.code ? "var(--accent-2)" : "var(--text)" }}>
                {lang.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Name */}
      <div>
        <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "8px" }}>
          {t(locale, "auth_yourName")}
        </label>
        <input
          type="text" value={name} onChange={(e) => setName(e.target.value)}
          className="input" placeholder={t(locale, "auth_namePlaceholder")} required minLength={2}
        />
      </div>

      {/* Email */}
      <div>
        <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "8px" }}>
          {t(locale, "auth_email")}
        </label>
        <input
          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="input" placeholder={t(locale, "auth_emailPlaceholder")} required
        />
      </div>

      {/* Phone */}
      <div>
        <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "8px" }}>
          {t(locale, "auth_phoneNumber")}
        </label>
        <input
          type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
          className="input" placeholder="+1 555 000 0000" required
        />
      </div>

      {/* Password */}
      <div>
        <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "8px" }}>
          {t(locale, "auth_password")}
        </label>
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            value={password} onChange={(e) => setPassword(e.target.value)}
            className="input" placeholder={t(locale, "auth_passwordPlaceholder")}
            required minLength={6}
            style={{ paddingRight: "44px" }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer",
              color: "var(--text-3)", padding: "4px", display: "flex",
            }}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Confirm password */}
      <div>
        <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "8px" }}>
          {t(locale, "auth_confirmPassword")}
        </label>
        <div style={{ position: "relative" }}>
          <input
            type={showConfirm ? "text" : "password"}
            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
            className="input" placeholder={t(locale, "auth_passwordRepeat")}
            required
            style={{
              paddingRight: "44px",
              borderColor: passwordMismatch
                ? "var(--red)"
                : passwordMatch
                ? "var(--green)"
                : undefined,
              outline: "none",
            }}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            style={{
              position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer",
              color: passwordMatch ? "var(--green)" : "var(--text-3)", padding: "4px", display: "flex",
            }}
          >
            {passwordMatch ? <Check size={16} /> : showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {passwordMismatch && (
          <p style={{ fontSize: "12px", color: "var(--red)", marginTop: "6px" }}>
            {t(locale, "auth_passwordsMismatch")}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || passwordMismatch}
        className="btn-primary"
        style={{
          width: "100%", padding: "14px",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          fontSize: "15px", marginTop: "4px",
          opacity: loading || passwordMismatch ? 0.7 : 1,
        }}
      >
        {loading ? t(locale, "auth_creatingAccount") : <>{t(locale, "auth_createAccount")} <ArrowRight size={15} /></>}
      </button>

      <p style={{ fontSize: "11px", color: "var(--text-3)", textAlign: "center", lineHeight: 1.5 }}>
        {t(locale, "auth_signupTerms")}
      </p>
    </form>
  );
}
