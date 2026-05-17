export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BADGES, getXpProgress, getNextMilestone, getLevelThreshold } from "@/types";
import { t, getLocale } from "@/lib/i18n";
import nextDynamic from "next/dynamic";
import { Flame, Target, Award, Star, Zap, ShieldCheck, BrainCircuit, Rocket } from "lucide-react";

const WeeklyChart = nextDynamic(
  () => import("@/components/progress/WeeklyChart").then((m) => ({ default: m.WeeklyChart })),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse" style={{ height: 220, borderRadius: 16, background: "rgba(255,255,255,0.04)" }} />
    ),
  }
);
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Progress — Lingova",
  description: "Track your learning progress and achievements",
};

const MILESTONE_ICONS = [Star, Flame, Award, BrainCircuit, ShieldCheck, Rocket, Zap, Target];
const MILESTONE_COLORS: Array<{ tile: string; icon: string }> = [
  { tile: "bg-blue-500/10", icon: "text-blue-500" },
  { tile: "bg-amber-500/10", icon: "text-amber-500" },
  { tile: "bg-emerald-500/10", icon: "text-emerald-500" },
  { tile: "bg-purple-500/10", icon: "text-purple-500" },
  { tile: "bg-indigo-500/10", icon: "text-indigo-500" },
  { tile: "bg-rose-500/10", icon: "text-rose-500" },
  { tile: "bg-yellow-500/10", icon: "text-yellow-500" },
  { tile: "bg-cyan-500/10", icon: "text-cyan-500" },
];

export default async function ProgressPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? "";
  const locale = getLocale((session?.user as any)?.nativeLanguage ?? "en");

  let progress = null;
  try {
    if (userId) {
      progress = await prisma.progress.findUnique({ where: { userId } });
    }
  } catch (err) {
    console.error("[progress page] DB error:", err);
  }

  const xpInfo = getXpProgress(progress?.xp ?? 0);
  const badges = progress?.badges ?? [];
  const skillTree = (progress?.skillTree as Record<string, number>) ?? { vocabulary: 0, grammar: 0, speaking: 0, writing: 0 };
  const weeklyXp = (progress?.weeklyXp as Record<string, number>) ?? {};
  const streak = progress?.streak ?? 0;

  const earnedBadges = BADGES.filter((b) => badges.includes(b.id));

  const skills = [
    { label: t(locale, "progress_vocabulary"), val: Math.min(skillTree.vocabulary ?? 0, 100), color: "#10b981" },
    { label: "Listening", val: Math.min((skillTree as any).listening ?? skillTree.speaking ?? 0, 100), color: "#f59e0b" },
    { label: t(locale, "progress_grammar"), val: Math.min(skillTree.grammar ?? 0, 100), color: "#3b82f6" },
    { label: "Writing", val: Math.min((skillTree as any).writing ?? 0, 100), color: "#a855f7" },
  ];

  // Estimated CEFR level mapping from numeric level
  const cefrLevels = ["A1", "A1+", "A2", "A2+", "B1", "B1+", "B2", "B2+", "C1", "C2"];
  const estimatedCefr = cefrLevels[Math.min(Math.max(0, xpInfo.level - 1), cefrLevels.length - 1)] ?? "A1";

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-5xl mb-2">{t(locale, "progress_yourProgress")}</h1>
        <p className="text-white/40 text-lg">{t(locale, "progress_subtitle")}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2-col span */}
        <div className="lg:col-span-2 space-y-8">
          {/* Weekly XP chart */}
          <section className="card-premium p-8 h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl italic font-serif">{t(locale, "progress_weeklyXpVolume")}</h3>
              <div className="flex gap-4 text-xs font-bold uppercase tracking-widest text-white/40">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> {t(locale, "progress_current")}</span>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <WeeklyChart weeklyXp={weeklyXp} />
            </div>
          </section>

          {/* Milestones */}
          <section>
            <h3 className="text-3xl mb-6 italic font-serif">{t(locale, "progress_milestonesAchieved")}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {earnedBadges.length === 0 ? (
                <div className="col-span-full card-premium p-8 text-center text-white/40 text-sm">
                  No milestones yet — keep learning to earn your first badge.
                </div>
              ) : (
                earnedBadges.slice(0, 8).map((badge, i) => {
                  const Icon = MILESTONE_ICONS[i % MILESTONE_ICONS.length];
                  const c = MILESTONE_COLORS[i % MILESTONE_COLORS.length];
                  return (
                    <div key={badge.id} className="card-premium p-6 text-center space-y-3 group">
                      <div className={`w-12 h-12 rounded-2xl ${c.tile} ${c.icon} mx-auto flex items-center justify-center transition-transform group-hover:scale-110`}>
                        <Icon size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{badge.name}</p>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-white/30">{t(locale, "progress_earned")}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>

        {/* Right col */}
        <div className="space-y-8">
          {/* Streak hero */}
          <section className="card-premium p-8 text-center bg-gradient-to-br from-amber-500/20 to-transparent border-amber-500/30">
            <Flame size={64} className="mx-auto text-amber-500 mb-6 drop-shadow-[0_0_20px_rgba(245,158,11,0.4)]" />
            <h4 className="text-4xl font-bold italic font-serif mb-2">{streak} Day Streak</h4>
            <p className="text-white/60 mb-6">
              {streak > 0 ? "Keep the momentum — every day counts." : "Start a streak by learning today."}
            </p>
            <div className="h-px bg-white/10 mb-6" />
            <div className="flex justify-around">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <span className="text-[10px] font-bold text-white/30">{d}</span>
                  <div
                    className={`w-3 h-3 rounded-full ${
                      i < Math.min(streak, 7)
                        ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                        : "bg-white/5"
                    }`}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Skill Breakdown */}
          <section className="card-premium p-8 space-y-6">
            <h4 className="text-2xl italic font-serif">{t(locale, "progress_skillBreakdown")}</h4>
            <div className="space-y-6">
              {skills.map((s) => (
                <div key={s.label} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                    <span className="text-white/60">{s.label}</span>
                    <span className="mono">{s.val}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-[width] duration-1000 ease-out"
                      style={{ backgroundColor: s.color, width: `${Math.max(s.val, 1)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Estimated Level */}
          <section className="card-premium p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Target size={20} />
              </div>
              <div>
                <p className="text-sm font-bold">{t(locale, "progress_estimatedLevel")}</p>
                <p className="text-xs text-white/40 uppercase font-bold tracking-widest">{t(locale, "progress_levelLabel")} {xpInfo.level}</p>
              </div>
            </div>
            <span className="text-3xl font-bold mono">{estimatedCefr}</span>
          </section>
        </div>
      </div>
    </div>
  );
}
