"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/types";
import { t, getLocale } from "@/lib/i18n";
import {
  User, Mail, Globe, Languages,
  Smile, Trash2, ChevronRight,
  Flame, Zap, BookMarked, Award, Star,
} from "lucide-react";

const AVATAR_EMOJIS = [
  "🧑", "👩", "👨", "🧔", "👱", "🧕", "🦸", "🧙", "🦊", "🐺",
  "🦁", "🐯", "🐻", "🐼", "🐸", "🦋", "🌟", "🔥", "⚡", "🎭",
  "🎨", "🎯", "🚀", "🌙", "☀️", "🌈", "💎", "👑", "🏆", "🎓",
];

interface XpInfo { level: number; current: number; needed: number; pct: number; }

const TARGET_LANGUAGES = [
  { code: "fr", label: "French",  nativeName: "Français", flag: "🇫🇷" },
  { code: "es", label: "Spanish", nativeName: "Español",  flag: "🇪🇸" },
  { code: "en", label: "English", nativeName: "English",  flag: "🇬🇧" },
];

const NATIVE_LANGUAGES = [
  { code: "en", label: "English",    flag: "🇬🇧" },
  { code: "hy", label: "Armenian",   flag: "🇦🇲" },
  { code: "ru", label: "Russian",    flag: "🇷🇺" },
  { code: "de", label: "German",     flag: "🇩🇪" },
  { code: "es", label: "Spanish",    flag: "🇪🇸" },
  { code: "it", label: "Italian",    flag: "🇮🇹" },
  { code: "pt", label: "Portuguese", flag: "🇵🇹" },
  { code: "zh", label: "Chinese",    flag: "🇨🇳" },
  { code: "ja", label: "Japanese",   flag: "🇯🇵" },
  { code: "ar", label: "Arabic",     flag: "🇸🇦" },
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
  const [showNativePicker, setShowNativePicker] = useState(false);
  const [editingName, setEditingName] = useState(false);
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
      await updateSession();
      setSaved(true);
      setTimeout(() => { window.location.reload(); }, 800);
    } catch {
      setError(t(locale, "settings_saveError"));
    } finally {
      setSaving(false);
    }
  };

  const nativeMeta = NATIVE_LANGUAGES.find(l => l.code === nativeLang) ?? NATIVE_LANGUAGES[0];
  const initial = (name || "?").trim()[0]?.toUpperCase() ?? "?";
  const isEmojiAvatar = !!avatar && /\p{Emoji}/u.test(avatar) && !/^[a-zA-Z0-9]$/.test(avatar);

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-fade-up">
      {/* Profile hero */}
      <header className="flex flex-col items-center text-center space-y-6">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 p-1 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowAvatarPicker(v => !v)}
              className="w-full h-full rounded-full bg-black flex items-center justify-center text-5xl font-bold italic serif transition-transform hover:scale-105"
              aria-label="Change avatar"
            >
              {isEmojiAvatar ? avatar : initial}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowAvatarPicker(v => !v)}
            className="absolute bottom-0 right-0 p-2 bg-white text-black rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"
            aria-label="Edit avatar"
          >
            <Smile size={18} />
          </button>
        </div>
        <div>
          <h1 className="text-5xl italic font-black">{name || t(locale, "settings_yourName")}</h1>
          <p className="text-white/40 text-lg">
            {t(locale, "settings_joined", { date: joinDate })} • {role === "TEACHER" ? t(locale, "settings_teacher") : t(locale, "settings_student")}
          </p>
        </div>
      </header>

      {/* Avatar picker (collapsible) */}
      {showAvatarPicker && (
        <div className="card-premium p-6">
          <p className="text-sm font-bold uppercase tracking-widest text-white/30 mb-3 px-2">{t(locale, "settings_chooseAvatar")}</p>
          <div className="grid grid-cols-10 gap-2">
            {AVATAR_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => { setAvatar(emoji); setShowAvatarPicker(false); }}
                className={`aspect-square rounded-2xl text-2xl flex items-center justify-center transition-all hover:scale-110 ${
                  avatar === emoji
                    ? "bg-emerald-500/20 border border-emerald-500/40"
                    : "bg-white/5 border border-white/10"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Level",  value: xpInfo.level,    icon: Star,       color: "text-emerald-400" },
          { label: "Streak", value: streak,          icon: Flame,      color: "text-amber-400"   },
          { label: "Words",  value: savedWordCount,  icon: BookMarked, color: "text-pink-400"    },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card-premium p-6 text-center">
              <Icon size={20} className={`mx-auto mb-2 ${s.color}`} />
              <p className={`mono text-3xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-white/30 mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* XP progress bar */}
      <div className="card-premium p-6">
        <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-white/30 mb-2">
          <span>{t(locale, "settings_levelDisplay", { n: String(xpInfo.level) })}</span>
          <span className="mono text-white/60">
            {t(locale, "settings_xpProgress", { current: String(xpInfo.current), needed: String(xpInfo.needed), next: String(xpInfo.level + 1) })}
          </span>
        </div>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all" style={{ width: `${xpInfo.pct}%` }} />
        </div>
      </div>

      {/* Two-column: System + Account */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* System */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white/30 px-2">System</h3>
          <div className="space-y-2">
            {/* Display name row (editable) */}
            <div className="card-premium p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User size={18} className="text-white/20" />
                  <span className="text-sm font-medium">{t(locale, "settings_displayName")}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingName(v => !v)}
                  className="text-xs font-bold text-white/40 hover:text-white transition-colors"
                >
                  {editingName ? "Done" : (name || "Set name")}
                </button>
              </div>
              {editingName && (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={50}
                  placeholder={t(locale, "settings_displayNamePlaceholder")}
                  className="w-full mt-3 bg-white/5 border border-white/10 rounded-2xl p-3 text-sm focus:outline-none focus:border-emerald-500/50"
                  autoFocus
                />
              )}
            </div>

            {/* Email (read only) */}
            <div className="w-full card-premium p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-white/20" />
                <span className="text-sm font-medium">Email</span>
              </div>
              <span className="text-xs font-bold text-white/40 truncate max-w-[180px]">{email}</span>
            </div>

            {/* Native language */}
            <div className="card-premium p-4">
              <button
                type="button"
                onClick={() => setShowNativePicker(v => !v)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Globe size={18} className="text-white/20" />
                  <span className="text-sm font-medium">{t(locale, "settings_nativeLang")}</span>
                </div>
                <span className="text-xs font-bold text-white/40 flex items-center gap-2">
                  {nativeMeta.flag} {nativeMeta.label}
                  <ChevronRight size={14} className={`transition-transform ${showNativePicker ? "rotate-90" : ""}`} />
                </span>
              </button>
              {showNativePicker && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {NATIVE_LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => { setNativeLang(l.code); setShowNativePicker(false); }}
                      className={`flex items-center gap-2 p-2 rounded-xl text-sm transition-all ${
                        nativeLang === l.code
                          ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                          : "bg-white/5 border border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <span className="text-lg">{l.flag}</span>
                      <span className="font-medium">{l.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Avatar control */}
            <button
              type="button"
              onClick={() => setShowAvatarPicker(v => !v)}
              className="w-full card-premium p-4 flex items-center justify-between hover:bg-white/5 transition-all"
            >
              <div className="flex items-center gap-3">
                <Smile size={18} className="text-white/20" />
                <span className="text-sm font-medium">Avatar</span>
              </div>
              <span className="text-2xl">{isEmojiAvatar ? avatar : initial}</span>
            </button>
          </div>
        </section>

        {/* Targeting */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white/30 px-2">Targeting</h3>
          <p className="text-xs text-white/40 px-2">{t(locale, "settings_learning")}</p>
          <div className="space-y-2">
            {TARGET_LANGUAGES.map((l) => {
              const active = targetLang === l.code;
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setTargetLang(l.code)}
                  className={`w-full card-premium p-4 flex items-center justify-between transition-all ${
                    active
                      ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                      : "hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{l.flag}</span>
                    <div className="text-left">
                      <p className="font-medium serif italic text-lg">{l.label}</p>
                      <p className="text-xs text-white/30">{l.nativeName}</p>
                    </div>
                  </div>
                  {active && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/15 px-2 py-1 rounded-full">
                      ✓ Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* Save bar */}
      {error && <p className="text-xs text-rose-400 px-2">{error}</p>}
      <div className="flex items-center gap-3 justify-end">
        {saved && <span className="text-xs text-emerald-400">{t(locale, "settings_profileUpdated")}</span>}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !name.trim()}
          className="btn-primary py-3 px-8 text-sm font-bold rounded-2xl disabled:opacity-50"
        >
          {saving ? t(locale, "settings_saving") : saved ? t(locale, "settings_saved") : t(locale, "settings_save")}
        </button>
      </div>

      {/* Subscriptions */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-white/30 px-2">Subscriptions</h3>
        <div className="card-premium p-8 bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-white text-black flex items-center justify-center font-black italic text-2xl">L+</div>
            <div>
              <h4 className="text-2xl font-bold italic serif">Lingova Premium</h4>
              <p className="text-white/40 text-sm">Free plan — upgrade to unlock everything</p>
            </div>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <button type="button" className="flex-1 btn-secondary py-3 px-8 text-xs font-bold">Manage Plan</button>
            <button type="button" className="flex-1 btn-primary py-3 px-8 text-xs font-bold">Upgrade</button>
          </div>
        </div>
      </section>

      {/* Earned badges */}
      {earnedBadges.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/30">Earned Badges</h3>
            <Link href="/progress" className="text-xs font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300">
              {t(locale, "settings_allBadgesArrow")}
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {earnedBadges.map((badge) => (
              <div key={badge.id} className="card-premium p-4 flex items-center gap-3">
                <span className="text-3xl">{badge.emoji}</span>
                <div>
                  <p className="text-sm font-bold text-amber-400">{badge.name}</p>
                  <p className="text-[11px] text-white/40">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick links */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-white/30 px-2">{t(locale, "settings_quickLinks")}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: "/progress",    label: t(locale, "nav_progress"),    emoji: "📊" },
            { href: "/analytics",   label: t(locale, "nav_analytics"),   emoji: "📈" },
            { href: "/leaderboard", label: t(locale, "lb_title"),        emoji: "🏆" },
            { href: "/my-words",    label: t(locale, "nav_myWords"),     emoji: "📝" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="card-premium p-4 flex items-center gap-3 hover:bg-white/5 transition-all"
            >
              <span className="text-xl">{item.emoji}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Danger zone — bottom */}
      <section className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-wrap gap-6">
          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="text-xs font-bold uppercase tracking-widest text-rose-500/60 hover:text-rose-400 transition-colors flex items-center gap-2"
            >
              <Trash2 size={16} /> Delete Account
            </button>
          ) : (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-bold text-rose-400">Are you sure? This is permanent.</span>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full bg-rose-500 text-white disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Yes, delete"}
              </button>
              <button
                type="button"
                onClick={() => { setConfirmDelete(false); setDeleteError(""); }}
                className="text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full bg-white/5 text-white/60 border border-white/10"
              >
                Cancel
              </button>
            </div>
          )}
          <a
            href="mailto:support@lingova.app"
            className="text-xs font-bold uppercase tracking-widest text-white/20 hover:text-white transition-colors flex items-center gap-2"
          >
            <Mail size={16} /> Contact Support
          </a>
        </div>
        <p className="text-xs text-white/10 mono">Build Version: 2.14.8-premium</p>
      </section>

      {deleteError && <p className="text-xs text-rose-400 px-2">{deleteError}</p>}
    </div>
  );
}
