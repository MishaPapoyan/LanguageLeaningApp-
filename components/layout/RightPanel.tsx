import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getXpProgress } from "@/types";
import { unstable_cache } from "next/cache";

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

const getLeaderboard = unstable_cache(
  async () => {
    return prisma.user.findMany({
      where: { progress: { isNot: null } },
      select: {
        id: true,
        name: true,
        progress: { select: { xp: true, level: true, streak: true } },
      },
      orderBy: { progress: { xp: "desc" } },
      take: 10,
    });
  },
  ["right-panel-leaderboard"],
  { revalidate: 60, tags: ["right-panel-leaderboard"] }
);

const getUserPanelData = unstable_cache(
  async (userId: string) => {
    const [myProgress, savedWords] = await Promise.all([
      prisma.progress.findUnique({ where: { userId } }),
      prisma.savedWord.findMany({
        where: { userId },
        select: { word: { select: { word: true, translation: true, imageEmoji: true } } },
        take: 100,
      }),
    ]);
    return { myProgress, savedWords };
  },
  ["right-panel-user"],
  { revalidate: 30, tags: ["right-panel-user"] }
);

const TIPS = [
  { tip: "Speak out loud every word you learn — even alone. Your mouth needs practice too.", emoji: "🗣️" },
  { tip: "French has silent letters everywhere. Focus on the sound, not the spelling, at first.", emoji: "🔇" },
  { tip: "Learn phrases, not just words. \"Je voudrais\" is more useful than \"vouloir\" alone.", emoji: "💬" },
  { tip: "Gender (le/la) matters. Learn every noun with its article as one unit.", emoji: "🏷️" },
  { tip: "Watch French YouTube with subtitles — your ear adapts faster than any exercise.", emoji: "📺" },
  { tip: "\"Faux amis\" are words that look English but mean something different. Watch out!", emoji: "⚠️" },
  { tip: "The 100 most common French words cover ~50% of everyday conversation.", emoji: "📊" },
  { tip: "Say \"Parlez-vous plus lentement, s'il vous plaît?\" — ask locals to slow down.", emoji: "🐌" },
  { tip: "Liaisons (linking words) make French sound fluid. Practice them daily.", emoji: "🔗" },
  { tip: "Read children's books in French — perfect vocab level, real grammar.", emoji: "📖" },
  { tip: "\"C'est\" vs \"Il est\" — both mean \"it is\" but follow different rules. Learn them early.", emoji: "🤔" },
  { tip: "Immersion beats memorization. Change your phone language to French today.", emoji: "📱" },
  { tip: "French tenses: start with présent, passé composé, and futur proche. Master those three first.", emoji: "⏳" },
  { tip: "Repetition spaced over days beats cramming. Even 10 minutes daily beats 2 hours once a week.", emoji: "🗓️" },
];

export async function RightPanel() {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id ?? "";

  const todayTipIndex = Math.floor(Date.now() / 86_400_000) % TIPS.length;
  const todayTip = TIPS[todayTipIndex];

  const [users, { myProgress, savedWords }] = await Promise.all([
    getLeaderboard(),
    getUserPanelData(currentUserId),
  ]);

  const board = users.map((u, i) => ({
    rank: i + 1,
    id: u.id,
    name: u.name ?? "Anonymous",
    xp: u.progress?.xp ?? 0,
    level: u.progress?.level ?? 1,
    streak: u.progress?.streak ?? 0,
    isMe: u.id === currentUserId,
  }));

  const myEntry = board.find((u) => u.isMe);
  const top5 = board.slice(0, 5);
  const showMyRow = myEntry && myEntry.rank > 5;

  // Pick 4 vocab words to preview (random-ish based on day)
  const allVocab = savedWords.map((sw) => sw.word).filter(Boolean);
  const vocabPreview = allVocab.length >= 4
    ? (() => {
        const seed = Math.floor(Date.now() / 86_400_000);
        const start = seed % Math.max(1, allVocab.length - 3);
        return allVocab.slice(start, start + 4);
      })()
    : allVocab.slice(0, 4);

  const xpInfo = myProgress ? getXpProgress(myProgress.xp) : null;
  const skillTree = (myProgress?.skillTree as Record<string, number>) ?? {};

  return (
    <aside className="space-y-4 sticky top-20">

      {/* ── My Stats ── */}
      {myProgress && xpInfo && (
        <div className="card p-4">
          <p className="section-label mb-3">My stats</p>

          <div className="grid grid-cols-2 gap-2 mb-3">
            {[
              { label: "Streak",  value: `${myProgress.streak ?? 0}d`, emoji: "🔥", color: "var(--gold)" },
              { label: "Level",   value: `Lv ${xpInfo.level}`,         emoji: "⭐", color: "var(--accent)" },
              { label: "XP",      value: myProgress.xp.toLocaleString(), emoji: "💎", color: "#60a5fa" },
              { label: "Rank",    value: myEntry ? `#${myEntry.rank}` : "—", emoji: "🏅", color: "var(--green)" },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-2 px-2.5 py-2 rounded-xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}
              >
                <span className="text-base">{s.emoji}</span>
                <div>
                  <p className="text-sm font-extrabold leading-none" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: "var(--text-3)" }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* XP bar */}
          <div>
            <div className="flex justify-between text-[10px] mb-1" style={{ color: "var(--text-3)" }}>
              <span>{xpInfo.current} XP</span>
              <span>{xpInfo.needed} to Lv {xpInfo.level + 1}</span>
            </div>
            <div className="xp-bar">
              <div className="xp-bar-fill" style={{ width: `${xpInfo.pct}%` }} />
            </div>
          </div>

          {/* Skills mini */}
          <div className="flex gap-3 mt-3">
            {[
              { key: "vocabulary", label: "Vocab",   color: "#60a5fa" },
              { key: "grammar",    label: "Grammar",  color: "var(--accent)" },
              { key: "speaking",   label: "Speaking", color: "var(--green)" },
            ].map((sk) => {
              const pct = skillTree[sk.key] ?? 0;
              return (
                <div key={sk.key} className="flex-1 text-center">
                  <div className="text-[11px] font-bold mb-1" style={{ color: sk.color }}>{pct}%</div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: sk.color }} />
                  </div>
                  <div className="text-[9px] mt-1" style={{ color: "var(--text-3)" }}>{sk.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Leaderboard ── */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="section-label">Leaderboard</p>
          <Link href="/leaderboard" className="text-xs font-semibold" style={{ color: "var(--accent)" }}>
            Full →
          </Link>
        </div>

        <div className="space-y-0.5">
          {top5.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl"
              style={{
                background: user.isMe ? "var(--accent-dim)" : "transparent",
                border: `1px solid ${user.isMe ? "rgba(124,106,255,0.25)" : "transparent"}`,
              }}
            >
              <div className="w-6 text-center flex-shrink-0">
                {MEDAL[user.rank]
                  ? <span className="text-sm">{MEDAL[user.rank]}</span>
                  : <span className="text-xs font-bold" style={{ color: "var(--text-3)" }}>{user.rank}</span>}
              </div>
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #7c6aff, #4338ca)" }}
              >
                {user.name[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: user.isMe ? "var(--accent)" : "var(--text)" }}>
                  {user.isMe ? "You" : user.name}
                </p>
              </div>
              <p className="text-xs font-bold tabular-nums flex-shrink-0" style={{ color: user.isMe ? "var(--accent)" : "var(--text-3)" }}>
                {user.xp.toLocaleString()}
              </p>
            </div>
          ))}

          {showMyRow && myEntry && (
            <>
              <div className="flex items-center gap-2 py-1 px-2">
                <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                <span className="text-[9px]" style={{ color: "var(--text-3)" }}>···</span>
                <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
              </div>
              <div
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl"
                style={{ background: "var(--accent-dim)", border: "1px solid rgba(124,106,255,0.25)" }}
              >
                <div className="w-6 text-center flex-shrink-0">
                  <span className="text-xs font-bold" style={{ color: "var(--text-3)" }}>{myEntry.rank}</span>
                </div>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #7c6aff, #4338ca)" }}
                >
                  {myEntry.name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold" style={{ color: "var(--accent)" }}>You</p>
                </div>
                <p className="text-xs font-bold tabular-nums flex-shrink-0" style={{ color: "var(--accent)" }}>
                  {myEntry.xp.toLocaleString()}
                </p>
              </div>
            </>
          )}
        </div>

        {myEntry && (
          <div
            className="mt-3 px-3 py-2 rounded-xl text-center text-[11px]"
            style={{ background: "rgba(255,255,255,0.025)", color: "var(--text-3)" }}
          >
            {(() => {
              const above = board[myEntry.rank - 2];
              const gap = above ? above.xp - myEntry.xp : 0;
              if (myEntry.rank === 1) return <span style={{ color: "var(--green)" }}>You&apos;re #1! 🏆</span>;
              return <><span className="font-bold" style={{ color: "var(--gold)" }}>{gap.toLocaleString()} XP</span> to pass #{myEntry.rank - 1}</>;
            })()}
          </div>
        )}
      </div>

      {/* ── Vocab to review ── */}
      {vocabPreview.length > 0 && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="section-label">Saved words</p>
            <Link href="/dictionary" className="text-xs font-semibold" style={{ color: "var(--accent)" }}>
              All →
            </Link>
          </div>
          <div className="space-y-1">
            {vocabPreview.map((w, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl"
                style={{ background: "rgba(255,255,255,0.025)" }}
              >
                <span className="text-base flex-shrink-0">{w?.imageEmoji ?? "📖"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: "var(--text)" }}>{w?.word}</p>
                  <p className="text-[11px] truncate" style={{ color: "var(--accent)" }}>{w?.translation}</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/review"
            className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors"
            style={{ background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid rgba(124,106,255,0.2)" }}
          >
            Practice these →
          </Link>
        </div>
      )}

      {/* ── French tip of the day ── */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: "linear-gradient(135deg, rgba(124,106,255,0.12), rgba(96,165,250,0.08))",
          border: "1px solid rgba(124,106,255,0.2)",
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{todayTip.emoji}</span>
          <p className="section-label">Tip of the day</p>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: "var(--text-2)" }}>
          {todayTip.tip}
        </p>
      </div>

    </aside>
  );
}
