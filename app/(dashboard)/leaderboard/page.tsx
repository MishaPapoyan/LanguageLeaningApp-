import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getXpProgress } from "@/types";
import { Metadata } from "next";
import { Flame, Zap, Trophy, Crown, Medal, ArrowUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Leaderboard — LangCraft",
  description: "See how you rank among other learners",
};

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id ?? "";

  let users: { id: string; name: string | null; progress: { xp: number; level: number; streak: number } | null }[] = [];

  try {
    users = await prisma.user.findMany({
      where: { progress: { isNot: null } },
      select: {
        id: true,
        name: true,
        progress: {
          select: { xp: true, level: true, streak: true },
        },
      },
      orderBy: { progress: { xp: "desc" } },
      take: 50,
    });
  } catch (err) {
    console.error("[leaderboard] DB error:", err);
  }

  const leaderboard = users.map((u, i) => ({
    rank: i + 1,
    id: u.id,
    name: u.name ?? "Anonymous",
    xp: u.progress?.xp ?? 0,
    level: u.progress?.level ?? 1,
    streak: u.progress?.streak ?? 0,
    isCurrentUser: u.id === currentUserId,
  }));

  const myRank = leaderboard.find((u) => u.isCurrentUser);
  const isInTopTen = myRank ? myRank.rank <= 10 : false;

  // Podium: [2nd, 1st, 3rd]
  const podiumOrder = leaderboard.length >= 3 ? [leaderboard[1], leaderboard[0], leaderboard[2]] : [];

  const podiumMedals = ["🥈", "🥇", "🥉"];
  const podiumHeights = [120, 150, 100];    // px — visual height of the podium block
  const podiumPadTop  = [28, 0, 38];        // extra top padding to align bases
  const podiumGlow = [
    "none",
    "0 0 32px rgba(245,158,11,0.35), 0 0 64px rgba(245,158,11,0.15)",
    "none",
  ];
  const podiumBorder = [
    "1px solid var(--border)",
    "1px solid rgba(245,158,11,0.4)",
    "1px solid var(--border)",
  ];
  const avatarBg = [
    "var(--surface-3)",
    "linear-gradient(135deg,#f59e0b,#fbbf24)",
    "var(--surface-3)",
  ];

  return (
    <div style={{ maxWidth: 680 }} className="animate-fade-up">

      {/* ── Header ── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: 28, fontWeight: 700, color: "var(--text)",
          letterSpacing: "-0.5px", marginBottom: 4,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <Trophy size={20} style={{ color: "var(--accent-2)", flexShrink: 0 }} />
          Leaderboard
        </h1>
        <p style={{ color: "var(--text-2)", fontSize: 14 }}>
          Top learners ranked by total XP earned. Keep that streak going!
        </p>
      </div>

      {/* ── Podium ── */}
      {podiumOrder.length === 3 && (
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10,
          marginBottom: 28, alignItems: "flex-end",
        }}>
          {podiumOrder.map((user, i) => (
            <div
              key={user.id}
              style={{
                paddingTop: podiumPadTop[i],
                display: "flex", flexDirection: "column",
              }}
            >
              <div style={{
                background: "var(--surface)",
                border: `${user.isCurrentUser ? "2px solid var(--accent)" : podiumBorder[i]}`,
                borderRadius: 18, padding: "20px 12px",
                textAlign: "center",
                boxShadow: user.isCurrentUser
                  ? "0 0 24px rgba(99,102,241,0.25)"
                  : podiumGlow[i],
                height: podiumHeights[i],
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 6,
              }}>
                {/* Medal: #1 gets Crown icon, #2 and #3 keep emoji medals */}
                {i === 1 ? (
                  <Crown size={20} style={{ color: "var(--gold)", flexShrink: 0 }} />
                ) : (
                  <span style={{ fontSize: 20 }}>{podiumMedals[i]}</span>
                )}

                {/* Avatar circle */}
                <div style={{
                  width: i === 1 ? 52 : 42, height: i === 1 ? 52 : 42,
                  borderRadius: "50%",
                  background: avatarBg[i],
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: i === 1 ? 20 : 16, fontWeight: 700,
                  color: i === 1 ? "#fff" : "var(--text-2)",
                  flexShrink: 0,
                }}>
                  {user.name[0]?.toUpperCase() ?? "?"}
                </div>

                {/* Name */}
                <p style={{
                  fontSize: 12, fontWeight: 700, color: "var(--text)",
                  textOverflow: "ellipsis", overflow: "hidden",
                  whiteSpace: "nowrap", width: "100%", textAlign: "center",
                }}>
                  {user.name}
                </p>

                {/* XP */}
                <p style={{
                  fontSize: i === 1 ? 13 : 11, fontWeight: 700,
                  color: i === 1 ? "var(--gold)" : "var(--accent-2)",
                }}>
                  {user.xp.toLocaleString()} XP
                </p>

                <p style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 600 }}>
                  Lv.{user.level}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Full Rankings Table ── */}
      {leaderboard.length > 0 ? (
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 18, overflow: "hidden", marginBottom: 20,
        }}>
          {/* Table header */}
          <div style={{
            display: "grid", gridTemplateColumns: "40px 1fr 80px 70px 54px",
            padding: "10px 16px", gap: 8,
            borderBottom: "1px solid var(--border)",
          }}>
            {["#", "Player", "Level", "XP", "Streak"].map((h) => (
              <span key={h} style={{
                fontSize: 10, fontWeight: 700, color: "var(--text-3)",
                textTransform: "uppercase", letterSpacing: "0.07em",
              }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          <div>
            {leaderboard.map((user) => (
              <div
                key={user.id}
                style={{
                  display: "grid", gridTemplateColumns: "40px 1fr 80px 70px 54px",
                  alignItems: "center", padding: "11px 16px", gap: 8,
                  background: user.isCurrentUser ? "var(--accent-dim)" : "transparent",
                  borderBottom: "1px solid var(--border)",
                  transition: "background 0.12s",
                }}
              >
                {/* Rank */}
                <span style={{
                  fontSize: 13, fontWeight: 700,
                  color: user.rank === 1 ? "var(--gold)"
                       : user.rank === 2 ? "var(--text-2)"
                       : user.rank === 3 ? "#cd7f32"
                       : "var(--text-3)",
                }}>
                  {user.rank}
                </span>

                {/* Player */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                    background: user.isCurrentUser
                      ? "linear-gradient(135deg, var(--accent), var(--accent-2))"
                      : "var(--surface-3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700,
                    color: user.isCurrentUser ? "#fff" : "var(--text-2)",
                  }}>
                    {user.name[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{
                      fontSize: 13, fontWeight: 600, color: "var(--text)",
                      textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap",
                    }}>
                      {user.name}
                      {user.isCurrentUser && (
                        <span style={{ color: "var(--accent-2)", fontSize: 11, marginLeft: 5, fontWeight: 500 }}>
                          (you)
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Level badge */}
                <div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: "var(--accent-2)",
                    background: "var(--accent-dim)", borderRadius: 99,
                    padding: "3px 10px",
                  }}>
                    Lv. {user.level}
                  </span>
                </div>

                {/* XP */}
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
                  {user.xp.toLocaleString()}
                </span>

                {/* Streak */}
                <span style={{
                  fontSize: 12, fontWeight: 600,
                  color: user.streak > 0 ? "var(--gold)" : "var(--text-3)",
                  display: "flex", alignItems: "center", gap: 3,
                }}>
                  {user.streak > 0 ? (
                    <>
                      <Flame size={12} style={{ color: "var(--gold)", flexShrink: 0 }} />
                      {user.streak}d
                    </>
                  ) : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 18, textAlign: "center", padding: "56px 24px",
          marginBottom: 20,
        }}>
          <p style={{ fontSize: 36, marginBottom: 10 }}>◈</p>
          <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
            No learners yet
          </p>
          <p style={{ fontSize: 13, color: "var(--text-2)" }}>
            Start learning to claim the #1 spot!
          </p>
        </div>
      )}

      {/* ── Your Rank Summary Card (if not in top 10) ── */}
      {myRank && !isInTopTen && (
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border-md, rgba(255,255,255,0.10))",
          borderRadius: 18, padding: "20px 24px",
          display: "flex", alignItems: "center", gap: 16,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Trophy size={18} style={{ color: "#fff" }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>
              Your Rank — #{myRank.rank}
            </p>
            <p style={{ fontSize: 12, color: "var(--text-2)" }}>
              Level {myRank.level} · {myRank.xp.toLocaleString()} XP
              {myRank.streak > 0 && (
                <>
                  {" · "}
                  <Flame size={11} style={{ color: "var(--gold)", display: "inline", verticalAlign: "middle", marginRight: 2 }} />
                  {myRank.streak}-day streak
                </>
              )}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600 }}>
              {myRank.rank - 10} spots from top 10
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
