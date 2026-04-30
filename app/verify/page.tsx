"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight, Mail, Phone, ShieldCheck } from "lucide-react";

function VerifyForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";

  const [emailCode, setEmailCode] = useState(["", "", "", "", "", ""]);
  const [phoneCode, setPhoneCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const emailRefs = [
    useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null),
  ];
  const phoneRefs = [
    useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null),
  ];

  const handleDigit = (
    val: string,
    idx: number,
    code: string[],
    setCode: (c: string[]) => void,
    refs: React.RefObject<HTMLInputElement>[]
  ) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[idx] = digit;
    setCode(next);
    if (digit && idx < 5) refs[idx + 1].current?.focus();
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    idx: number,
    code: string[],
    setCode: (c: string[]) => void,
    refs: React.RefObject<HTMLInputElement>[]
  ) => {
    if (e.key === "Backspace" && !code[idx] && idx > 0) {
      refs[idx - 1].current?.focus();
    }
  };

  const handlePaste = (
    e: React.ClipboardEvent,
    setCode: (c: string[]) => void,
    refs: React.RefObject<HTMLInputElement>[]
  ) => {
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
    if (digits.length === 6) {
      setCode(digits);
      refs[5].current?.focus();
      e.preventDefault();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ec = emailCode.join("");
    const pc = phoneCode.join("");
    if (ec.length < 6 || pc.length < 6) {
      setError("Please enter both 6-digit codes.");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, emailOtp: ec, phoneOtp: pc }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Verification failed");
      setLoading(false);
      return;
    }

    // Sign in and go to onboarding
    const result = await signIn("credentials", {
      email,
      // We need the password — store it in sessionStorage during register
      password: sessionStorage.getItem("__reg_pw") ?? "",
      redirect: false,
    });
    sessionStorage.removeItem("__reg_pw");

    if (result?.error) {
      router.push("/login");
    } else {
      router.push("/onboarding");
    }
  };

  const OtpRow = ({
    label, icon, code, setCode, refs,
  }: {
    label: string;
    icon: React.ReactNode;
    code: string[];
    setCode: (c: string[]) => void;
    refs: React.RefObject<HTMLInputElement>[];
  }) => (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ color: "var(--accent)" }}>{icon}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)" }}>{label}</span>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {code.map((d, i) => (
          <input
            key={i}
            ref={refs[i]}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleDigit(e.target.value, i, code, setCode, refs)}
            onKeyDown={(e) => handleKeyDown(e, i, code, setCode, refs)}
            onPaste={(e) => handlePaste(e, setCode, refs)}
            style={{
              width: 44, height: 52,
              textAlign: "center",
              fontSize: 20, fontWeight: 700,
              borderRadius: 12,
              border: `2px solid ${d ? "var(--accent)" : "var(--border)"}`,
              background: "var(--surface)",
              color: "var(--text)",
              outline: "none",
              transition: "border-color 0.15s",
            }}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)", color: "var(--text)",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: 24,
    }}>
      <div style={{ width: "100%", maxWidth: 440 }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 40 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: "linear-gradient(135deg, #7c6aff 0%, #5b4fcf 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: 700, fontSize: 10,
          }}>LG</div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em" }}>Lingova</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, marginBottom: 16,
            background: "var(--accent-dim)", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}>
            <ShieldCheck size={24} style={{ color: "var(--accent)" }} />
          </div>
          <h1 style={{ fontFamily: "serif", fontSize: 26, margin: "0 0 8px", letterSpacing: "-0.01em" }}>
            Verify your account
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-2)", margin: 0, lineHeight: 1.55 }}>
            Enter the 6-digit codes sent to your email and phone.
          </p>
          {/* DEV notice */}
          <div style={{
            marginTop: 12, padding: "8px 12px", borderRadius: 10,
            background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)",
            fontSize: 12, color: "#d97706",
          }}>
            🔧 Dev mode — use code <strong>123456</strong> for both fields
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {error && (
            <div style={{
              padding: "12px 16px", borderRadius: 12,
              background: "var(--red-dim)", color: "var(--red)",
              fontSize: 13, fontWeight: 500,
            }}>{error}</div>
          )}

          <OtpRow
            label="Email verification code"
            icon={<Mail size={16} />}
            code={emailCode}
            setCode={setEmailCode}
            refs={emailRefs}
          />

          <OtpRow
            label="Phone verification code"
            icon={<Phone size={16} />}
            code={phoneCode}
            setCode={setPhoneCode}
            refs={phoneRefs}
          />

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: "100%", padding: 14,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              fontSize: 15, fontWeight: 600,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Verifying…" : <>Verify & continue <ArrowRight size={15} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}
