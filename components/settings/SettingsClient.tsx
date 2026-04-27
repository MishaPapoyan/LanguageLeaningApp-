"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/types";
import { t, getLocale } from "@/lib/i18n";

const AVATAR_EMOJIS = [
  "🧑", "👩", "👨", "🧔", "👱", "🧕", "🦸", "🧙", "🦊", "🐺",
  "🦁", "🐯", "🐻", "🐼", "🐸", "🦋", "🌟", "🔥", "⚡", "🎭",
  "🎨", "🎯", "🚀", "🌙", "☀️", "🌈", "💎", "👑", "🏆", "🎓",
];

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hy", label: "Armenian" },
  { code: "ru", label: "Russian" },
  { code: "de", label: "German" },
  { code: "es", label: "Spanish" },
  { code: "it", label: "Italian" },
  { code: "pt", label: "Portuguese" },
  { code: "zh", label: "Chinese" },
  { code: "ja", label: "Japanese" },
  { code: "ar", label: "Arabic" },
];

interface XpInfo { level: number; current: number; needed: number; pct: number; }

const TARGET_LANGUAGES = [
  { code: "fr", label: "French", flag: "🇫🇷" },
  { code: "es", label: "Spanish", flag: "🇪🇸" },
];

interface Props {
  initialName: string;
  initialAvatar: string;
  initialNativeLang: string;
  initialTargetLang: string;
  email: string;
  role: string;
  joinDate: string;
  xpInfo: XpInfo;
  streak: number;
  savedWordCount: number;
  completedStories: number;
  gamePlays: number;
  earnedBadges: Badge[];
}

export function SettingsClient({
  initialName, initialAvatar, initialNativeLang, initialTargetLang,
  email, role, joinDate, xpInfo, streak,
  savedWordCount, completedStories, gamePlays, earnedBadges,
}: Props) {
  const { data: session, update: updateSession } = useSession();
  const locale = getLocale((session?.user as any)?.nativeLanguage);
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [avatar, setAvatar] = useState(initialAvatar || "🧑");
  const [nativeLang, setNativeLang] = useState(initialNativeLang);
  const [targetLang, setTargetLang] = useState(initialTargetLang || "fr");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch("/api/user", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      await signOut({ callbackUrl: "/" });
    } catch {
      setDeleteError("Could not delete account. Please try again.");
      setDeleting(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image: avatar, nativeLanguage: nativeLang, targetLanguage: targetLang }),
      });
      if (!res.ok) throw new Error("Failed to save");
      // Refresh session so targetLanguage/nativeLanguage is reflected immediately
      await updateSession();
      // Full reload guarantees server components re-render with new JWT cookie
      window.location.reload();
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError(t(locale, "settings_saveError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>{t(locale, "settings_title")}</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-3)" }}>{t(locale, "settings_subtitle")}</p>
      </div>

      {/* Profile card */}
      <div className="card p-6">
        <p className="section-label mb-4">{t(locale, "settings_profile")}</p>

        {/* Avatar + Name row */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <button
              onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl transition-all hover:scale-105"
              style={{ background: "var(--surface-3)", border: `2px solid ${showAvatarPicker ? "var(--accent)" : "var(--border-md)"}` }}
            >
              {avatar}
            </button>
            <div
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              ✏️
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>{name || t(locale, "settings_yourName")}</p>
            <p className="text-xs" style={{ color: "var(--text-3)" }}>{email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
              >
                {role === "TEACHER" ? t(locale, "settings_teacher") : t(locale, "settings_student")}
              </span>
              <span className="text-[11px]" style={{ color: "var(--text-3)" }}>{t(locale, "settings_joined", { date: joinDate })}</span>
            </div>
          </div>
        </div>

        {/* Emoji picker */}
        {showAvatarPicker && (
          <div
            className="rounded-2xl p-4 mb-5"
            style={{ background: "var(--surface-3)", border: "1px solid var(--border)" }}
          >
            <p className="text-xs font-semibold mb-3" style={{ color: "var(--text-3)" }}>{t(locale, "settings_chooseAvatar")}</p>
            <div className="grid grid-cols-10 gap-1">
              {AVATAR_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => { setAvatar(emoji); setShowAvatarPicker(false); }}
                  className="w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all hover:scale-110"
                  style={{
                    background: avatar === emoji ? "var(--accent-dim)" : "var(--surface-2)",
                    border: `1px solid ${avatar === emoji ? "rgba(124,106,255,0.4)" : "transparent"}`,
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-3)" }}>
              {t(locale, "settings_displayName")}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              placeholder={t(locale, "settings_displayNamePlaceholder")}
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-3)" }}>
              {t(locale, "settings_nativeLang")}
            </label>
            <select
              value={nativeLang}
              onChange={(e) => setNativeLang(e.target.value)}
              className="input w-full"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-3)" }}>
              {t(locale, "settings_learning")}
            </label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="input w-full"
            >
              {TARGET_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <p className="text-xs mt-3" style={{ color: "var(--red)" }}>{error}</p>
        )}

        <div className="flex items-center gap-3 mt-5">
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="btn-primary px-6 disabled:opacity-50"
          >
            {saving ? t(locale, "settings_saving") : saved ? t(locale, "settings_saved") : t(locale, "settings_save")}
          </button>
          {saved && <span className="text-xs" style={{ color: "var(--green)" }}>{t(locale, "settings_profileUpdated")}</span>}
        </div>
      </div>

      {/* Stats overview */}
      <div className="card p-5">
        <p className="section-label mb-4">{t(locale, "settings_yourStats")}</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: t(locale, "settings_level"),       value: t(locale, "settings_lvDisplay", { n: String(xpInfo.level) }),   emoji: "⭐", color: "var(--accent)" },
            { label: t(locale, "settings_streak"),      value: t(locale, "settings_daysDisplay", { n: String(streak) }),        emoji: "🔥", color: "var(--gold)" },
            { label: t(locale, "settings_words"),       value: savedWordCount,          emoji: "📚", color: "var(--blue)" },
            { label: t(locale, "settings_storiesStat"), value: completedStories,        emoji: "📖", color: "var(--green)" },
            { label: t(locale, "settings_gamesStat"),   value: gamePlays,               emoji: "🎮", color: "#f472b6" },
            { label: t(locale, "settings_xp"),          value: xpInfo.current + xpInfo.needed > 0 ? `${xpInfo.current}/${xpInfo.needed}` : "—", emoji: "💎", color: "var(--accent)" },
          ].map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
            >
              <span className="text-lg">{s.emoji}</span>
              <div>
                <p className="text-sm font-bold leading-none" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--text-3)" }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* XP progress bar */}
        <div>
          <div className="flex justify-between text-[10px] mb-1" style={{ color: "var(--text-3)" }}>
            <span>{t(locale, "settings_levelDisplay", { n: String(xpInfo.level) })}</span>
            <span>{t(locale, "settings_xpProgress", { current: String(xpInfo.current), needed: String(xpInfo.needed), next: String(xpInfo.level + 1) })}</span>
          </div>
          <div className="xp-bar">
            <div className="xp-bar-fill" style={{ width: `${xpInfo.pct}%` }} />
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="section-label">{t(locale, "settings_earnedBadges")}</p>
          <Link href="/progress" className="text-xs font-semibold" style={{ color: "var(--accent)" }}>
            {t(locale, "settings_allBadgesArrow")}
          </Link>
        </div>
        {earnedBadges.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {earnedBadges.map((badge) => (
              <div
                key={badge.id}
                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}
              >
                <span className="text-lg">{badge.emoji}</span>
                <div>
                  <p className="text-xs font-semibold" style={{ color: "var(--gold)" }}>{badge.name}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-3)" }}>{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6" style={{ color: "var(--text-3)" }}>
            <p className="text-2xl mb-2">🏅</p>
            <p className="text-sm">{t(locale, "settings_noBadges")}</p>
          </div>
        )}
      </div>

      {/* Danger zone */}
      <div className="card p-5" style={{ border: "1px solid rgba(239,68,68,0.25)" }}>
        <p className="section-label mb-1" style={{ color: "var(--red)" }}>Danger Zone</p>
        <p className="text-xs mb-4" style={{ color: "var(--text-3)" }}>
          Permanently delete your account and all data. This cannot be undone.
        </p>

        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="btn text-sm px-4 py-2 rounded-xl font-semibold"
            style={{ background: "rgba(239,68,68,0.1)", color: "var(--red)", border: "1px solid rgba(239,68,68,0.3)" }}
          >
            Delete my account
          </button>
        ) : (
          <div className="rounded-xl p-4 space-y-3" style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.25)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--red)" }}>
              Are you sure? All your progress, words, and data will be gone forever.
            </p>
            {deleteError && <p className="text-xs" style={{ color: "var(--red)" }}>{deleteError}</p>}
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="btn text-sm px-4 py-2 rounded-xl font-semibold disabled:opacity-50"
                style={{ background: "var(--red)", color: "#fff", border: "none" }}
              >
                {deleting ? "Deleting…" : "Yes, delete everything"}
              </button>
              <button
                onClick={() => { setConfirmDelete(false); setDeleteError(""); }}
                className="btn text-sm px-4 py-2 rounded-xl font-semibold"
                style={{ background: "var(--surface-2)", color: "var(--text-2)", border: "1px solid var(--border)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick navigation */}
      <div className="card p-5">
        <p className="section-label mb-3">{t(locale, "settings_quickLinks")}</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { href: "/progress",    label: t(locale, "nav_progress"),    emoji: "📊" },
            { href: "/analytics",   label: t(locale, "nav_analytics"),   emoji: "📈" },
            { href: "/leaderboard", label: t(locale, "lb_title"),        emoji: "🏆" },
            { href: "/my-words",    label: t(locale, "nav_myWords"),     emoji: "📝" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-2)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-3)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
            >
              <span>{item.emoji}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
