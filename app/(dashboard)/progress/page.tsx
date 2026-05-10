export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BADGES, getXpProgress, getNextMilestone, getLevelThreshold } from "@/types";
import { t, getLocale } from "@/lib/i18n";
import nextDynamic from "next/dynamic";
import { Zap, Flame, BookMarked, Gamepad2, BookOpen, MessageSquare, Lock, BarChart3, Target, Trophy, Mic, PenLine, TrendingUp, Layers, Link2, Puzzle } from "lucide-react";

const WeeklyChart = nextDynamic(
  () => import("@/components/progress/WeeklyChart").then((m) => ({ default: m.WeeklyChart })),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse" style={{ height: 200, borderRadius: 12, background: "var(--surface-3)" }} />
    ),
  }
);
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Progress вЂ” Lingova",
  description: "Track your learning progress and achievements",
};

export default async function ProgressPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? "";
  const locale = getLocale((session?.user as any)?.nativeLanguage ?? "en");

  let progress = null;
  let savedWords = 0, completedStories = 0, gamePlays = 0, tutorSessions = 0;
  let recentGames: any[] = [];

  try {
    if (userId) {
      const [prog, stats] = await Promise.all([
        prisma.progress.findUnique({ where: { userId } }),
        Promise.all([
          prisma.savedWord.count({ where: { userId } }),
          prisma.storyProgress.count({ where: { userId, completed: true } }),
          prisma.gameScore.count({ where: { userId } }),
          prisma.aiInteraction.count({ where: { userId } }),
          prisma.gameScore.findMany({ where: { userId }, orderBy: { playedAt: "desc" }, take: 5 }),
        ]),
      ]);
      progress = prog;
      [savedWords, completedStories, gamePlays, tutorSessions, recentGames] = stats;
    }
  } catch (err) {
    console.error("[progress page] DB error:", err);
  }

  const xpInfo = getXpProgress(progress?.xp ?? 0);
  const badges = progress?.badges ?? [];
  const skillTree = (progress?.skillTree as Record<string, number>) ?? { vocabulary: 0, grammar: 0, speaking: 0 };
  const weeklyXp = (progress?.weeklyXp as Record<string, number>) ?? {};

  const earnedBadges = BADGES.filter((b) => badges.includes(b.id));
  const lockedBadges = BADGES.filter((b) => !badges.includes(b.id));

  const nextMilestone = getNextMilestone(xpInfo.level);
  const nextMilestoneBadge = nextMilestone
    ? BADGES.find((b) => b.id === nextMilestone.badgeId)
    : null;

  // XP needed to reach next milestone level
  let milestoneXpNeeded = 0;
  let milestoneXpPct = 0;
  if (nextMilestone) {
    const targetXp = getLevelThreshold(nextMilestone.level);
    const currentXp = progress?.xp ?? 0;
    milestoneXpNeeded = Math.max(targetXp - currentXp, 0);
    milestoneXpPct = targetXp > 0 ? Math.min(Math.round((currentXp / targetXp) * 100), 100) : 100;
  }

  const levelCircumference = 2 * Math.PI * 44;

  const skills = [
    {
      key: "vocabulary",
      label: t(locale, "progress_vocabulary"),
      icon: <BookOpen size={16} />,
      color: "var(--blue)",
      dimColor: "rgba(96,165,250,0.15)",
    },
    {
      key: "grammar",
      label: t(locale, "progress_grammar"),
      icon: <PenLine size={16} />,
      color: "var(--accent-2)",
      dimColor: "var(--accent-dim)",
    },
    {
      key: "speaking",
      label: t(locale, "progress_speaking"),
      icon: <Mic size={16} />,
      color: "var(--teal)",
      dimColor: "rgba(45,212,191,0.15)",
    },
  ];

  const allTimeStats = [
    {
      label: t(locale, "progress_gamesPlayed"),
      value: gamePlays,
      icon: <Gamepad2 size={20} />,
      color: "var(--coral)",
      iconColor: "var(--coral)",
      dimColor: "rgba(251,113,133,0.15)",
    },
    {
      label: t(locale, "progress_storiesCompleted"),
      value: completedStories,
      icon: <BookOpen size={20} />,
      color: "var(--blue)",
      iconColor: "var(--blue)",
      dimColor: "rgba(96,165,250,0.15)",
    },
    {
      label: t(locale, "progress_tutorSessions"),
      value: tutorSessions,
      icon: <MessageSquare size={20} />,
      color: "var(--green)",
      iconColor: "var(--green)",
      dimColor: "rgba(74,222,128,0.15)",
    },
  ];

  function gameIcon(gameType: string) {
    if (gameType === "FLASHCARDS") return <Layers size={16} style={{ color: "var(--accent-2)" }} />;
    if (gameType === "MATCHING") return <Link2 size={16} style={{ color: "var(--teal)" }} />;
    return <Puzzle size={16} style={{ color: "var(--gold)" }} />;
  }

  return (
    <div className="animate-fade-up" style={{ maxWidth: 780 }}>

      {/* в”Ђв”Ђ Hero Stats Bento Grid в”Ђв”Ђ */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 12, marginBottom: 20,
      }}>

        {/* Level ring вЂ” spans 1 col */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 18, padding: "20px 16px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
          position: "relative", overflow: "hidden",
        }}>
          {/* soft accent glow behind ring */}
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 110, height: 110, borderRadius: "50%", background: "rgba(16,185,129,0.12)", filter: "blur(20px)", pointerEvents: "none" }} />
          <div style={{ position: "relative", width: 100, height: 100 }}>
            <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="50" cy="50" r="44" fill="none" stroke="var(--surface-3)" strokeWidth="7" />
              <circle
                cx="50" cy="50" r="44" fill="none"
                stroke="var(--accent)" strokeWidth="7" strokeLinecap="round"
                strokeDasharray={levelCircumference}
                strokeDashoffset={levelCircumference - (xpInfo.pct / 100) * levelCircumference}
                style={{ transition: "stroke-dashoffset 1s ease", filter: "drop-shadow(0 0 6px rgba(16,185,129,0.6))" }}
              />
            </svg>
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", lineHeight: 1, fontFamily: "var(--font-mono)", letterSpacing: "-0.03em" }}>
                {xpInfo.level}
              </span>
              <span style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 600, marginTop: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>{t(locale, "progress_levelLabel")}</span>
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 11, color: "var(--text-2)", fontWeight: 500 }}>
              <span style={{ fontFamily: "var(--font-mono)" }}>{xpInfo.current}</span>
              {" / "}
              <span style={{ fontFamily: "var(--font-mono)" }}>{xpInfo.needed}</span>
              {" XP"}
            </p>
            <p style={{ fontSize: 10, color: "var(--text-3)" }}>{t(locale, "progress_toNextLevel")}</p>
          </div>
        </div>

        {/* Total XP */}
        <div style={{
          background: "var(--surface)", border: "1px solid rgba(16,185,129,0.2)",
          borderRadius: 18, padding: "20px 18px",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          boxShadow: "0 0 0 1px rgba(16,185,129,0.06), 0 4px 20px rgba(16,185,129,0.08)",
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "var(--accent-dim)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, marginBottom: 4,
          }}>
            <Zap size={20} style={{ color: "var(--accent-2)" }} />
          </div>
          <div>
            <p style={{ fontSize: 32, fontWeight: 700, color: "var(--accent-2)", lineHeight: 1, marginBottom: 4, fontFamily: "var(--font-mono)", letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
              {(progress?.xp ?? 0).toLocaleString()}
            </p>
            <p style={{ fontSize: 12, color: "var(--text-2)", fontWeight: 600 }}>{t(locale, "progress_totalXp")}</p>
          </div>
        </div>

        {/* Streak */}
        <div style={{
          background: "var(--surface)", border: "1px solid rgba(249,115,22,0.2)",
          borderRadius: 18, padding: "20px 18px",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          boxShadow: "0 0 0 1px rgba(249,115,22,0.06), 0 4px 20px rgba(249,115,22,0.08)",
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "rgba(245,158,11,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, marginBottom: 4,
          }}>
            <Flame size={20} style={{ color: "var(--gold)" }} />
          </div>
          <div>
            <p style={{ fontSize: 32, fontWeight: 700, color: "var(--xp)", lineHeight: 1, marginBottom: 4, fontFamily: "var(--font-mono)", letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
              {progress?.streak ?? 0}
            </p>
            <p style={{ fontSize: 12, color: "var(--text-2)", fontWeight: 600 }}>{t(locale, "progress_dayStreak")}</p>
          </div>
        </div>

        {/* Words Learned */}
        <div style={{
          background: "var(--surface)", border: "1px solid rgba(45,212,191,0.2)",
          borderRadius: 18, padding: "20px 18px",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          boxShadow: "0 0 0 1px rgba(45,212,191,0.06), 0 4px 20px rgba(45,212,191,0.08)",
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "rgba(45,212,191,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, marginBottom: 4,
          }}>
            <BookMarked size={20} style={{ color: "var(--teal)" }} />
          </div>
          <div>
            <p style={{ fontSize: 32, fontWeight: 700, color: "var(--teal)", lineHeight: 1, marginBottom: 4, fontFamily: "var(--font-mono)", letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
              {savedWords}
            </p>
            <p style={{ fontSize: 12, color: "var(--text-2)", fontWeight: 600 }}>{t(locale, "progress_wordsSaved")}</p>
          </div>
        </div>
      </div>

      {/* в”Ђв”Ђ XP Timeline Chart в”Ђв”Ђ */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 18, padding: "22px 24px", marginBottom: 20,
      }}>
        <p style={{
          fontSize: 10, fontWeight: 700, color: "var(--text-3)",
          textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4,
        }}>{t(locale, "progress_weeklyActivity")}</p>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", marginBottom: 20 }}>{t(locale, "progress_xpThisWeek")}</h2>
        <WeeklyChart weeklyXp={weeklyXp} />
      </div>

      {/* в”Ђв”Ђ Skills Section в”Ђв”Ђ */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 18, padding: "22px 24px", marginBottom: 20,
      }}>
        <p style={{
          fontSize: 10, fontWeight: 700, color: "var(--text-3)",
          textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4,
        }}>{t(locale, "progress_skills")}</p>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", marginBottom: 20 }}>{t(locale, "progress_skillProgress")}</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {skills.map((skill) => {
            const val = Math.min(skillTree[skill.key] ?? 0, 100);
            return (
              <div key={skill.key}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 9,
                      background: skill.dimColor,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: skill.color,
                    }}>
                      {skill.icon}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", fontFamily: "var(--font-display)" }}>
                      {skill.label}
                    </span>
                  </div>
                  <span style={{
                    fontSize: 13, fontWeight: 800, color: skill.color, fontFamily: "var(--font-mono)",
                    background: skill.dimColor, borderRadius: 99, padding: "3px 12px",
                    letterSpacing: "-0.01em",
                  }}>
                    {val}%
                  </span>
                </div>
                <div style={{
                  height: 9, background: "var(--surface-3)", borderRadius: 99, overflow: "visible",
                  position: "relative",
                }}>
                  <div style={{
                    height: "100%", borderRadius: 99,
                    background: `linear-gradient(90deg, ${skill.color}cc, ${skill.color})`,
                    width: `${Math.max(val, 1)}%`,
                    transition: "width 1.1s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    boxShadow: `0 0 12px ${skill.color}66`,
                    position: "relative", overflow: "hidden",
                  }}>
                    {/* shine sweep */}
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
                      width: "40%",
                      animation: "xp-shine 2.4s linear infinite",
                    }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* в”Ђв”Ђ Badges Grid в”Ђв”Ђ */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 18, padding: "22px 24px", marginBottom: 20,
      }}>
        <p style={{
          fontSize: 10, fontWeight: 700, color: "var(--text-3)",
          textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4,
        }}>{t(locale, "progress_achievements")}</p>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", marginBottom: 20 }}>{t(locale, "progress_badges")}</h2>

        {/* Earned */}
        {earnedBadges.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <p style={{
              fontSize: 11, fontWeight: 700, color: "var(--text-3)",
              textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14,
            }}>
              {t(locale, "progress_earnedCount", { n: String(earnedBadges.length) })}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
              {earnedBadges.map((badge, idx) => {
                // cycle through accent gradients for each badge
                const gradients = [
                  { bg: "linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(251,191,36,0.08) 100%)", border: "rgba(245,158,11,0.35)", glow: "rgba(245,158,11,0.18)", name: "var(--gold)" },
                  { bg: "linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(129,140,248,0.08) 100%)", border: "rgba(16,185,129,0.35)", glow: "rgba(16,185,129,0.18)", name: "var(--accent-2)" },
                  { bg: "linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(52,211,153,0.08) 100%)", border: "rgba(16,185,129,0.35)", glow: "rgba(16,185,129,0.18)", name: "var(--green)" },
                  { bg: "linear-gradient(135deg, rgba(45,212,191,0.15) 0%, rgba(94,234,212,0.08) 100%)", border: "rgba(45,212,191,0.35)", glow: "rgba(45,212,191,0.18)", name: "var(--teal)" },
                ];
                const g = gradients[idx % gradients.length];
                return (
                  <div key={badge.id} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    background: g.bg,
                    border: `1px solid ${g.border}`,
                    borderRadius: 16, padding: "14px 16px",
                    boxShadow: `0 4px 20px ${g.glow}`,
                    transition: "transform 0.15s, box-shadow 0.15s",
                  }}>
                    <div style={{
                      width: 46, height: 46, borderRadius: 13, flexShrink: 0,
                      background: `linear-gradient(135deg, ${g.border}50, ${g.border}20)`,
                      border: `1px solid ${g.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 24, boxShadow: `0 0 16px ${g.glow}`,
                    }}>
                      {badge.emoji}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: g.name, marginBottom: 3 }}>
                        {badge.name}
                      </p>
                      <p style={{ fontSize: 11, color: "var(--text-2)", lineHeight: 1.4 }}>
                        {badge.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Locked */}
        {lockedBadges.length > 0 && (
          <div>
            <p style={{
              fontSize: 11, fontWeight: 700, color: "var(--text-3)",
              textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14,
            }}>
              {t(locale, "progress_lockedCount", { n: String(lockedBadges.length) })}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
              {lockedBadges.map((badge) => (
                <div key={badge.id} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  background: "var(--surface-3)", border: "1px solid var(--border)",
                  borderRadius: 16, padding: "14px 16px",
                  opacity: 0.5,
                }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 13, flexShrink: 0,
                    background: "var(--surface-4)", border: "1px solid var(--border-md)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 24, filter: "grayscale(1)",
                  }}>
                    {badge.emoji}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-2)" }}>
                        {badge.name}
                      </p>
                      <Lock size={11} style={{ color: "var(--text-3)", flexShrink: 0 }} />
                    </div>
                    <p style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.4 }}>
                      {badge.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* в”Ђв”Ђ Next Milestone Card в”Ђв”Ђ */}
      {nextMilestone && nextMilestoneBadge && (
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border-md, rgba(255,255,255,0.10))",
          borderRadius: 18, padding: "22px 24px", marginBottom: 20,
          position: "relative", overflow: "hidden",
        }}>
          {/* Glow accent */}
          <div style={{
            position: "absolute", top: -40, right: -40,
            width: 120, height: 120, borderRadius: "50%",
            background: "rgba(16,185,129,0.12)", filter: "blur(40px)", pointerEvents: "none",
          }} />

          <p style={{
            fontSize: 10, fontWeight: 700, color: "var(--text-3)",
            textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4,
          }}>{t(locale, "progress_nextMilestone")}</p>
          <h2 style={{
            fontSize: 17, fontWeight: 700, color: "var(--text)", marginBottom: 18,
            display: "flex", alignItems: "center", gap: 7,
          }}>
            <Target size={16} style={{ color: "var(--accent-2)", flexShrink: 0 }} />
            {t(locale, "progress_reachLevel", { level: String(nextMilestone.level) })}
          </h2>

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
            {/* Badge preview */}
            <div style={{
              width: 60, height: 60, borderRadius: 16, flexShrink: 0,
              background: "var(--accent-dim)", border: "1px solid rgba(16,185,129,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 30,
            }}>
              {nextMilestoneBadge.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>
                {nextMilestoneBadge.name}
              </p>
              <p style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 2 }}>
                {nextMilestone.reward}
              </p>
              {milestoneXpNeeded > 0 && (
                <p style={{ fontSize: 11, color: "var(--text-3)" }}>
                  {t(locale, "progress_xpRemaining", { xp: milestoneXpNeeded.toLocaleString() })}
                </p>
              )}
            </div>
          </div>

          {/* Progress bar toward milestone */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: "var(--text-3)" }}>{t(locale, "progress_progressToLevel", { level: String(nextMilestone.level) })}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-2)" }}>{milestoneXpPct}%</span>
            </div>
            <div style={{ height: 8, background: "var(--surface-3)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{
                height: "100%", background: "linear-gradient(90deg, var(--accent), var(--accent-2))",
                borderRadius: 99, width: `${Math.max(milestoneXpPct, 1)}%`,
                transition: "width 1s ease",
              }} />
            </div>
          </div>
        </div>
      )}

      {/* в”Ђв”Ђ All-Time Stats в”Ђв”Ђ */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20,
      }}>
        {allTimeStats.map((stat) => (
          <div key={stat.label} style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 18, padding: "18px 16px",
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: stat.dimColor,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, marginBottom: 8,
              color: stat.iconColor,
            }}>
              {stat.icon}
            </div>
            <p style={{ fontSize: 28, fontWeight: 700, color: stat.color, lineHeight: 1, marginBottom: 4, fontFamily: "var(--font-mono)", letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
              {stat.value}
            </p>
            <p style={{ fontSize: 11, color: "var(--text-2)", fontWeight: 600 }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* в”Ђв”Ђ Recent Games в”Ђв”Ђ */}
      {recentGames.length > 0 && (
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 18, padding: "22px 24px",
        }}>
          <p style={{
            fontSize: 10, fontWeight: 700, color: "var(--text-3)",
            textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4,
          }}>{t(locale, "progress_recentActivity")}</p>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>{t(locale, "progress_recentGames")}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {recentGames.map((game) => (
              <div key={game.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 0",
                borderBottom: "1px solid var(--border)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: "var(--surface-3)", border: "1px solid var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {gameIcon(game.gameType)}
                  </div>
                  <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 600 }}>
                    {game.gameType.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ fontSize: 12, color: "var(--text-2)", fontWeight: 500 }}>
                    {t(locale, "progress_scorePct", { pct: String(game.score) })}
                  </span>
                  <span style={{
                    fontSize: 12, fontWeight: 700, color: "var(--gold)",
                    background: "var(--gold-dim)", borderRadius: 99, padding: "3px 10px",
                  }}>
                    +{game.xpEarned} XP
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
