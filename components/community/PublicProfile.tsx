"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  User, Globe, Calendar, ChevronRight, Camera, Trophy, Award, Zap, Flame,
  Gamepad2, BookMarked, Star,
} from "lucide-react";
import { t, getLocale } from "@/lib/i18n";

interface ProfileData {
  id: string;
  name: string | null;
  image: string | null;
  targetLanguage: string | null;
  joinedAt: string;
  progress: {
    xp: number;
    level: number;
    streak: number;
    badges: string[];
    skillTree: { vocabulary: number; grammar: number; speaking: number };
    weeklyXp: Record<string, number>;
  } | null;
  bestScores: Record<string, number>;
  counts: { gameScores: number; savedWords: number };
}

interface Props {
  profile: ProfileData;
  viewerUserId: string;
}

const LANG: Record<string, { label: string; flag: string }> = {
  fr: { label: "French", flag: "🇫🇷" },
  es: { label: "Spanish", flag: "🇪🇸" },
  en: { label: "English", flag: "🇬🇧" },
};

const NATIVE_LANG: Record<string, { label: string; flag: string }> = {
  en: { label: "English", flag: "🇬🇧" },
  hy: { label: "Armenian", flag: "🇦🇲" },
  ru: { label: "Russian", flag: "🇷🇺" },
  de: { label: "German", flag: "🇩🇪" },
  es: { label: "Spanish", flag: "🇪🇸" },
  fr: { label: "French", flag: "🇫🇷" },
};

export function PublicProfile({ profile, viewerUserId }: Props) {
  const { data: session } = useSession();
  const locale = getLocale((session?.user as any)?.nativeLanguage);
  const isOwn = viewerUserId === profile.id;

  const p = profile.progress;
  const xp = p?.xp ?? 0;
  const level = p?.level ?? 1;
  const streak = p?.streak ?? 0;
  const badges = p?.badges ?? [];

  const targetLang = LANG[profile.targetLanguage ?? "fr"] ?? LANG.fr;
  const nativeLangCode = (session?.user as any)?.nativeLanguage ?? "en";
  const nativeLang = NATIVE_LANG[nativeLangCode] ?? NATIVE_LANG.en;

  const joined = new Date(profile.joinedAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const initial = (profile.name ?? "?")[0]?.toUpperCase();

  const accountInfo = [
    { label: "Display Name", value: profile.name ?? t(locale, "profile_learner"), icon: User },
    { label: "Member Since", value: joined, icon: Calendar },
    { label: "Target Language", value: `${targetLang.flag} ${targetLang.label}`, icon: Globe },
    {
      label: "Best Game",
      value: (() => {
        const best = Object.entries(profile.bestScores).sort((a, b) => b[1] - a[1])[0];
        return best ? `${best[0]} · ${best[1].toLocaleString()}` : "No games yet";
      })(),
      icon: Trophy,
    },
  ];

  const [hovered, setHovered] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      {/* Header: Avatar + name */}
      <header className="flex flex-col items-center text-center space-y-6">
        <div
          className="relative group"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 p-1 shadow-2xl">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-4xl font-bold italic serif">
              {initial}
            </div>
          </div>
          {isOwn && (
            <Link
              href="/settings"
              className={`absolute bottom-0 right-0 p-2 bg-white text-black rounded-full shadow-lg transition-all transform ${
                hovered ? "opacity-100 scale-100" : "opacity-0 scale-90"
              }`}
            >
              <Camera size={18} />
            </Link>
          )}
        </div>
        <div>
          <h1 className="text-5xl italic font-black">
            {profile.name ?? t(locale, "profile_learner")}
          </h1>
          <p className="text-white/40 text-lg mt-2">
            Learner since {joined} · {isOwn ? "Premium Member" : `Level ${level}`}
          </p>
        </div>
        {!isOwn && (
          <Link
            href="/community"
            className="btn-secondary py-2 px-6 text-sm flex items-center gap-2"
          >
            ← Back to Community
          </Link>
        )}
      </header>

      {/* Languages: Native + Targeting */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="card-premium p-8 space-y-6 text-center">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white/30">
            Native Language
          </h3>
          <div className="flex items-center justify-center gap-4">
            <span className="text-4xl">{nativeLang.flag}</span>
            <span className="text-3xl font-medium serif italic">{nativeLang.label}</span>
          </div>
          {isOwn && (
            <Link
              href="/settings"
              className="text-xs text-white/20 hover:text-white transition-colors underline underline-offset-4 inline-block"
            >
              Change Native Tongue
            </Link>
          )}
        </section>

        <section className="card-premium p-8 space-y-6 text-center text-emerald-400 border-emerald-500/20 bg-emerald-500/5">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white/30">{t(locale, "settings_targeting")}</h3>
          <div className="flex items-center justify-center gap-4">
            <span className="text-4xl">{targetLang.flag}</span>
            <span className="text-3xl font-medium serif italic">
              {targetLang.label} (Lv {level})
            </span>
          </div>
          {isOwn && (
            <Link
              href="/settings"
              className="text-xs text-emerald-500/60 hover:text-emerald-400 transition-colors underline underline-offset-4 font-bold inline-block"
            >
              Manage Targets
            </Link>
          )}
        </section>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Zap, label: "Total XP", value: xp.toLocaleString(), color: "text-emerald-500" },
          { icon: Star, label: "Level", value: level.toString(), color: "text-emerald-400" },
          { icon: Flame, label: "Day Streak", value: streak.toString(), color: "text-amber-500" },
          { icon: Award, label: "Badges", value: badges.length.toString(), color: "text-purple-400" },
        ].map((s, i) => (
          <div key={i} className="card-premium p-6 text-center">
            <s.icon size={20} className={`mx-auto mb-3 ${s.color}`} />
            <p className="text-3xl font-black mono mb-1">{s.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Game stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-premium p-6 flex items-center gap-4">
          <Gamepad2 size={24} className="text-emerald-500" />
          <div>
            <p className="text-2xl font-black mono">{profile.counts.gameScores}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">
              Games Played
            </p>
          </div>
        </div>
        <div className="card-premium p-6 flex items-center gap-4">
          <BookMarked size={24} className="text-emerald-500" />
          <div>
            <p className="text-2xl font-black mono">{profile.counts.savedWords}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">
              Words Saved
            </p>
          </div>
        </div>
      </div>

      {/* Account info */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold serif italic mb-4">{t(locale, "pp_accountInfo")}</h3>
        <div className="space-y-2">
          {accountInfo.map((item, i) => (
            <div
              key={i}
              className="card-premium p-6 flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <item.icon
                  size={20}
                  className="text-white/20 group-hover:text-white transition-colors"
                />
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-1">
                    {item.label}
                  </p>
                  <p className="text-lg font-medium">{item.value}</p>
                </div>
              </div>
              <ChevronRight
                size={18}
                className="text-white/10 group-hover:text-white group-hover:translate-x-1 transition-all"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold serif italic mb-4">{t(locale, "settings_earnedBadges")}</h3>
          <div className="flex flex-wrap gap-2">
            {badges.map((b, i) => (
              <span
                key={i}
                className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold rounded-full flex items-center gap-2"
              >
                <Award size={14} /> {b}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
