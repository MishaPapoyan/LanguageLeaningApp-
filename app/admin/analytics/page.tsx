import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

const GAME_EMOJI: Record<string, string> = {
  FLASHCARDS: "🃏", MATCHING: "🔗", MEMORY_PALACE: "🏛️", WORD_SCRAMBLE: "🔀",
  FILL_BLANK: "✏️", TRUE_FALSE: "⚖️", SPEED_TYPING: "⌨️", LISTEN_QUIZ: "👂",
  SENTENCE_BUILDER: "📝", DIALOG_ADVENTURE: "💬", CITY_EXPLORER: "🏙️",
  IMMERSION: "🌊", INTERVIEW: "🎤",
};

const LANG_NAME: Record<string, string> = {
  en: "English", hy: "Armenian", ru: "Russian", de: "German",
  es: "Spanish", fr: "French", ar: "Arabic", zh: "Chinese", ja: "Japanese", ko: "Korean",
};

export default async function AdminAnalyticsPage() {
  let topUsers: any[] = [];
  let gameBreakdown: any[] = [];
  let nativeLangBreakdown: any[] = [];
  let levelDist: any[] = [];
  let totals = { words: 0, ai: 0, games: 0, writing: 0, voice: 0 };

  try {
    const [tu, gb, nlb, ld, words, ai, games, writing, voice] = await Promise.all([
      prisma.progress.findMany({
        take: 10, orderBy: { xp: "desc" },
        select: {
          xp: true, level: true, streak: true,
          user: { select: { id: true, name: true, email: true, targetLanguage: true } },
        },
      }),
      prisma.gameScore.groupBy({
        by: ["gameType"],
        _count: { gameType: true },
        _sum: { xpEarned: true },
        orderBy: { _count: { gameType: "desc" } },
      }),
      prisma.user.groupBy({
        by: ["nativeLanguage"],
        _count: { nativeLanguage: true },
        orderBy: { _count: { nativeLanguage: "desc" } },
        take: 8,
      }),
      prisma.progress.groupBy({
        by: ["level"],
        _count: { level: true },
        orderBy: { level: "asc" },
      }),
      prisma.savedWord.count(),
      prisma.aiInteraction.count(),
      prisma.gameScore.count(),
      prisma.writingSession.count(),
      prisma.voiceSession.count(),
    ]);
    topUsers = tu;
    gameBreakdown = gb;
    nativeLangBreakdown = nlb;
    levelDist = ld;
    totals = { words, ai, games, writing, voice };
  } catch (err) {
    console.error("[admin/analytics] DB error:", err);
  }

  const maxGame = Math.max(...gameBreakdown.map((g) => g._count.gameType), 1);
  const maxLang = Math.max(...nativeLangBreakdown.map((n) => n._count.nativeLanguage), 1);
  const maxLevel = Math.max(...levelDist.map((l) => l._count.level), 1);

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", fontFamily: "var(--font-display)", letterSpacing: "-0.02em", marginBottom: 4 }}>Analytics</h1>
      <p className="text-sm mb-8" style={{ color: "var(--text-3)" }}>
        Platform-wide engagement and learning statistics
      </p>

      {/* Feature engagement totals */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
        {[
          { label: "Saved words",      value: totals.words,   emoji: "📚" },
          { label: "AI sessions",      value: totals.ai,      emoji: "🤖" },
          { label: "Game plays",       value: totals.games,   emoji: "🎮" },
          { label: "Writing sessions", value: totals.writing, emoji: "✍️" },
          { label: "Voice sessions",   value: totals.voice,   emoji: "🎤" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <p className="text-xl mb-1.5">{s.emoji}</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", fontFamily: "var(--font-mono)", letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>{s.value.toLocaleString()}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top learners */}
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          <div className="px-5 py-3.5 flex items-center justify-between" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
            <h2 className="font-semibold text-sm" style={{ color: "var(--text)" }}>Top learners by XP</h2>
            <Link href="/admin/users" className="text-xs" style={{ color: "var(--accent)" }}>All users →</Link>
          </div>
          <div style={{ background: "var(--surface)" }}>
            {topUsers.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm" style={{ color: "var(--text-3)" }}>No data yet</div>
            ) : topUsers.map((u: any, i: number) => (
              <div
                key={u.user.id}
                className="px-5 py-3 flex items-center gap-3"
                style={{ borderTop: i > 0 ? "1px solid var(--border)" : undefined }}
              >
                <span
                  className="text-sm font-bold w-5 text-center flex-shrink-0"
                  style={{ color: ["#f59e0b", "#9ca3af", "#cd7c2b"][i] ?? "var(--text-3)" }}
                >
                  {i + 1}
                </span>
                <div
                  className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: "linear-gradient(135deg, #7c6aff, #4338ca)" }}
                >
                  {u.user.name?.[0]?.toUpperCase() ?? u.user.email[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>{u.user.name ?? "—"}</p>
                  <p className="text-xs" style={{ color: "var(--text-3)" }}>
                    🔥 {u.streak} streak · Lv {u.level}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold" style={{ color: "var(--accent)" }}>
                    {u.xp.toLocaleString()} XP
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-3)" }}>
                    {u.user.targetLanguage === "fr" ? "🇫🇷" : u.user.targetLanguage === "en" ? "🇬🇧" : "🇪🇸"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Game type breakdown */}
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          <div className="px-5 py-3.5" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
            <h2 className="font-semibold text-sm" style={{ color: "var(--text)" }}>Game plays by type</h2>
          </div>
          <div className="px-5 py-4" style={{ background: "var(--surface)" }}>
            {gameBreakdown.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: "var(--text-3)" }}>No games played yet</p>
            ) : gameBreakdown.map((g: any) => (
              <div key={g.gameType} className="mb-3 last:mb-0">
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: "var(--text-2)" }}>
                    {GAME_EMOJI[g.gameType] ?? "🎮"}{" "}
                    {g.gameType.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase())}
                  </span>
                  <span style={{ color: "var(--text-3)" }}>{g._count.gameType} plays</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: "var(--border)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(g._count.gameType / maxGame) * 100}%`, background: "var(--accent)" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Native language distribution */}
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          <div className="px-5 py-3.5" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
            <h2 className="font-semibold text-sm" style={{ color: "var(--text)" }}>User native languages</h2>
          </div>
          <div className="px-5 py-4" style={{ background: "var(--surface)" }}>
            {nativeLangBreakdown.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: "var(--text-3)" }}>No data</p>
            ) : nativeLangBreakdown.map((n: any) => (
              <div key={n.nativeLanguage} className="mb-3 last:mb-0">
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: "var(--text-2)" }}>{LANG_NAME[n.nativeLanguage] ?? n.nativeLanguage}</span>
                  <span style={{ color: "var(--text-3)" }}>{n._count.nativeLanguage} users</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: "var(--border)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(n._count.nativeLanguage / maxLang) * 100}%`, background: "#8b5cf6" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Level distribution */}
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          <div className="px-5 py-3.5" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
            <h2 className="font-semibold text-sm" style={{ color: "var(--text)" }}>Level distribution</h2>
          </div>
          <div className="px-5 py-4" style={{ background: "var(--surface)" }}>
            {levelDist.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: "var(--text-3)" }}>No data</p>
            ) : levelDist.map((l: any) => (
              <div key={l.level} className="mb-2 last:mb-0">
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: "var(--text-2)" }}>Level {l.level}</span>
                  <span style={{ color: "var(--text-3)" }}>{l._count.level} users</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: "var(--border)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(l._count.level / maxLevel) * 100}%`, background: "#10b981" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
