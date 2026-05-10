"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Users, Trophy, Star, Hash, MessageCircle, Video, PlayCircle,
  Search, Zap, Flame, Award,
} from "lucide-react";
import { t, getLocale } from "@/lib/i18n";

interface Learner {
  id: string;
  name: string | null;
  image: string | null;
  targetLanguage: string | null;
  createdAt: string;
  progress: { xp: number; level: number; streak: number; badges: string[] } | null;
  _count: { gameScores: number; savedWords: number };
}

interface MonthlyEntry {
  rank: number;
  userId: string;
  name: string;
  image: string | null;
  targetLanguage: string;
  level: number;
  streak: number;
  monthlyXp: number;
}

const LANG_FLAGS: Record<string, string> = { fr: "🇫🇷", es: "🇪🇸", en: "🇬🇧" };
const LANG_LABELS: Record<string, string> = { fr: "French", es: "Spanish", en: "English" };

function isEmoji(s: string | null) {
  if (!s) return false;
  return /\p{Emoji}/u.test(s) && !/^[a-zA-Z0-9]$/.test(s);
}

function Avatar({ image, name, size = 40 }: { image: string | null; name: string | null; size?: number }) {
  const emoji = isEmoji(image);
  const initial = (name ?? "?")[0]?.toUpperCase();
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white shrink-0"
      style={{
        width: size,
        height: size,
        background: emoji ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg,#10b981,#059669)",
        fontSize: emoji ? size * 0.55 : size * 0.4,
      }}
    >
      {emoji ? image : initial}
    </div>
  );
}

export default function CommunityPage() {
  const { data: session } = useSession();
  const locale = getLocale((session?.user as any)?.nativeLanguage);
  const [learners, setLearners] = useState<Learner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [langFilter, setLangFilter] = useState("");
  const [monthly, setMonthly] = useState<MonthlyEntry[]>([]);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const myId = (session?.user as any)?.id ?? "";

  useEffect(() => {
    const tm = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(tm);
  }, [search]);

  const fetchLearners = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (langFilter) params.set("lang", langFilter);
    try {
      const r = await fetch(`/api/community/learners?${params}`);
      const d = await r.json();
      setLearners(d.learners ?? []);
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, [debouncedSearch, langFilter]);

  useEffect(() => {
    fetchLearners();
  }, [fetchLearners]);

  useEffect(() => {
    fetch("/api/community/monthly")
      .then((r) => r.json())
      .then((d) => setMonthly(d.monthly ?? []))
      .catch(() => {});
  }, []);

  const topContributors = [...learners]
    .sort((a, b) => (b.progress?.xp ?? 0) - (a.progress?.xp ?? 0))
    .slice(0, 5);

  const studyGroups = [
    { name: "DELF B2 Prep", members: 42, icon: Hash },
    { name: "Parisian Slang", members: 156, icon: MessageCircle },
    { name: "Business French", members: 89, icon: Video },
    { name: "Literature Club", members: 24, icon: Users },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-5xl mb-2">{t(locale, "comm_title")}</h1>
        <p className="text-white/40 text-lg">
          {t(locale, "comm_subtitle", { n: learners.length.toString() })}
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* LEFT ASIDE */}
        <aside className="space-y-8 xl:col-span-1">
          <section className="space-y-4">
            <h3 className="text-xl font-bold serif italic mb-4">Study Groups</h3>
            <div className="space-y-2">
              {studyGroups.map((g, i) => (
                <button
                  key={i}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40">
                      <g.icon size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{g.name}</p>
                      <p className="text-[10px] text-white/30 font-bold uppercase mono">
                        {g.members} active
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button className="w-full btn-secondary py-2 text-xs border-dashed border-white/20">
              Explore More Rooms
            </button>
          </section>

          {/* Live Practice */}
          <section className="card-premium p-6 bg-emerald-500/5 border-emerald-500/20">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold uppercase tracking-widest text-emerald-500">
                Live Practice
              </h4>
              <div className="px-2 py-0.5 bg-rose-500 text-white text-[8px] font-bold rounded animate-pulse">
                LIVE
              </div>
            </div>
            <div className="space-y-4">
              <div className="relative aspect-video rounded-xl bg-white/5 overflow-hidden group border border-white/10">
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-black/40">
                  <PlayCircle size={32} />
                </div>
                <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur rounded text-[8px] font-bold mono">
                  128 VIEWERS
                </div>
                <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black to-transparent">
                  <p className="text-xs font-bold truncate italic">
                    Intermediate Conversation Hub
                  </p>
                </div>
              </div>
              <button className="w-full btn-primary py-2 text-xs flex items-center justify-center gap-2">
                <Users size={14} /> Join Room
              </button>
            </div>
          </section>
        </aside>

        {/* MAIN */}
        <main className="xl:col-span-2 space-y-8">
          {/* Search + filter */}
          <div className="card-premium p-6 flex flex-col gap-4">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t(locale, "comm_search")}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(["", "fr", "es", "en"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLangFilter(l)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    langFilter === l
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      : "bg-white/5 text-white/40 border-white/10 hover:text-white"
                  }`}
                >
                  {l === "" ? `🌍 ${t(locale, "comm_all")}` : `${LANG_FLAGS[l]} ${LANG_LABELS[l]}`}
                </button>
              ))}
            </div>
          </div>

          {/* Learners feed */}
          <div className="space-y-6">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="card-premium p-6 h-32 animate-pulse"
                  style={{ opacity: 1 - i * 0.15 }}
                />
              ))
            ) : learners.length === 0 ? (
              <div className="card-premium p-12 text-center text-white/40">
                <Users size={48} className="mx-auto mb-4 opacity-30" />
                <p className="text-lg font-bold mb-1">{t(locale, "comm_noLearners")}</p>
                <p className="text-sm">{t(locale, "comm_noLearnersHint")}</p>
              </div>
            ) : (
              learners.map((l) => {
                const xp = l.progress?.xp ?? 0;
                const level = l.progress?.level ?? 1;
                const streak = l.progress?.streak ?? 0;
                const lang = l.targetLanguage ?? "fr";
                const isYou = l.id === myId;
                const isExpert = level >= 5;
                return (
                  <Link
                    key={l.id}
                    href={`/community/${l.id}`}
                    className="card-premium p-6 space-y-6 block"
                  >
                    <header className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar image={l.image} name={l.name} size={44} />
                        <div>
                          <h4 className="font-bold flex items-center gap-2">
                            {l.name ?? t(locale, "comm_learner")}
                            {isExpert && (
                              <span className="text-[10px] font-bold uppercase py-0.5 px-2 bg-emerald-500 text-black rounded">
                                Expert
                              </span>
                            )}
                            {isYou && (
                              <span className="text-[10px] font-bold uppercase py-0.5 px-2 bg-white/10 text-white/60 rounded">
                                {t(locale, "comm_you")}
                              </span>
                            )}
                          </h4>
                          <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest mono">
                            {LANG_FLAGS[lang]} {LANG_LABELS[lang]} · Lv {level}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold uppercase tracking-widest text-white/30">
                          XP
                        </p>
                        <p className="text-lg font-bold mono text-emerald-500">
                          {xp.toLocaleString()}
                        </p>
                      </div>
                    </header>

                    <div className="flex items-center gap-6 pt-4 border-t border-white/5 text-white/40">
                      <span className="flex items-center gap-2 text-sm">
                        <Zap size={16} className="text-emerald-500" />
                        <span className="mono font-bold">Lv {level}</span>
                      </span>
                      {streak > 0 && (
                        <span className="flex items-center gap-2 text-sm">
                          <Flame size={16} className="text-amber-500" />
                          <span className="mono font-bold">{streak}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-2 text-sm">
                        <Trophy size={16} className="text-white/40" />
                        <span className="mono font-bold">{l._count.gameScores}</span>
                      </span>
                      <span className="ml-auto text-xs text-emerald-400 font-bold uppercase tracking-widest">
                        View Profile →
                      </span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </main>

        {/* RIGHT ASIDE */}
        <aside className="xl:col-span-1 space-y-8">
          {/* Top Contributors */}
          <section className="card-premium p-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
              <Star size={14} className="text-amber-500" /> Top Contributors
            </h4>
            <div className="space-y-4">
              {topContributors.length === 0
                ? [...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 opacity-30">
                      <span className="text-xs font-bold mono text-white/10 w-4">{i + 1}</span>
                      <div className="w-8 h-8 rounded-full bg-white/5" />
                      <div className="flex-1">
                        <div className="h-3 bg-white/5 rounded w-3/4 mb-1" />
                        <div className="h-2 bg-white/5 rounded w-1/2" />
                      </div>
                    </div>
                  ))
                : topContributors.map((u, i) => (
                    <Link
                      key={u.id}
                      href={`/community/${u.id}`}
                      className="flex items-center gap-3 hover:bg-white/5 -mx-2 px-2 py-1 rounded-lg transition-all"
                    >
                      <span className="text-xs font-bold mono text-white/20 w-4">{i + 1}</span>
                      <Avatar image={u.image} name={u.name} size={32} />
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium truncate">
                          {u.name ?? t(locale, "comm_learner")}
                        </p>
                        <p className="text-[10px] text-white/30 font-bold uppercase mono">
                          {(u.progress?.xp ?? 0).toLocaleString()} XP
                        </p>
                      </div>
                    </Link>
                  ))}
            </div>
            {myId && (
              <Link
                href={`/community/${myId}`}
                className="block w-full btn-secondary mt-6 py-2 text-xs text-center"
              >
                {t(locale, "comm_myProfile")}
              </Link>
            )}
          </section>

          {/* Monthly Champion */}
          {monthly[0] && (
            <section className="card-premium p-6 bg-amber-500/5 border-amber-500/20">
              <h4 className="text-sm font-bold uppercase tracking-widest text-amber-500 mb-4 flex items-center gap-2">
                <Award size={14} /> Champion of the Month
              </h4>
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">🥇</div>
                <div>
                  <p className="text-base font-bold serif italic">{monthly[0].name}</p>
                  <p className="text-[10px] text-white/40 mono uppercase tracking-widest">
                    {monthly[0].monthlyXp.toLocaleString()} XP this month
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Weekly Challenge */}
          <section className="card-premium p-6 overflow-hidden relative">
            <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
              <Users size={120} />
            </div>
            <h4 className="text-lg font-bold serif italic mb-2">Weekly Challenge</h4>
            <p className="text-xs text-white/40 leading-relaxed mb-6">
              Earn 500 XP this week to climb the leaderboard. Stay consistent — write, play, and review daily.
            </p>
            <button className="btn-primary w-full py-2 text-xs relative z-10">
              Enter Challenge
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}
