"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Search, Flame, Zap, Users, Trophy, Star, Gamepad2, BookMarked } from "lucide-react";
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

const LANG_FLAGS:  Record<string, string> = { fr: "рџ‡«рџ‡·", es: "рџ‡Єрџ‡ё", en: "рџ‡¬рџ‡§" };
const LANG_LABELS: Record<string, string> = { fr: "French", es: "Spanish", en: "English" };
const LANG_GRADIENT: Record<string, string> = {
  fr: "linear-gradient(135deg,#1e3a8a,#3730a3)",
  es: "linear-gradient(135deg,#7c2d12,#b45309)",
};

function isEmoji(s: string | null) {
  if (!s) return false;
  return /\p{Emoji}/u.test(s) && !/^[a-zA-Z0-9]$/.test(s);
}

function Avatar({ image, name, size = 44, lang }: { image: string | null; name: string | null; size?: number; lang?: string }) {
  const emoji = isEmoji(image);
  const initial = (name ?? "?")[0]?.toUpperCase();
  const bg = !emoji ? (LANG_GRADIENT[lang ?? "fr"] ?? "linear-gradient(135deg, #10b981, #059669)") : "var(--surface-3)";
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: emoji ? size * 0.55 : size * 0.4, fontWeight: 900, color: "#fff",
      border: "2px solid var(--surface)",
    }}>
      {emoji ? image : initial}
    </div>
  );
}

/* в”Ђв”Ђ Podium card for top 3 в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */
function PodiumCard({ learner, rank, locale }: { learner: Learner; rank: 1 | 2 | 3; locale: import("@/lib/i18n").Locale }) {
  const [hov, setHov] = useState(false);
  const xp = learner.progress?.xp ?? 0;
  const level = learner.progress?.level ?? 1;
  const streak = learner.progress?.streak ?? 0;
  const lang = learner.targetLanguage ?? "fr";

  const medals = ["рџҐ‡", "рџҐ€", "рџҐ‰"];
  const heights = [96, 72, 56];
  const colors = ["#fbbf24", "#94a3b8", "#d97706"];
  const glows = ["rgba(251,191,36,0.3)", "rgba(148,163,184,0.2)", "rgba(217,119,6,0.2)"];

  return (
    <Link
      href={`/community/${learner.id}`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        textDecoration: "none", flex: 1,
        transform: hov ? "translateY(-6px)" : rank === 1 ? "translateY(-8px)" : "none",
        transition: "transform 0.25s cubic-bezier(.34,1.56,.64,1)",
      }}
    >
      {/* medal */}
      <span style={{ fontSize: 28, marginBottom: 6, filter: hov ? "drop-shadow(0 0 8px " + colors[rank - 1] + ")" : "none", transition: "filter 0.2s" }}>
        {medals[rank - 1]}
      </span>

      {/* avatar */}
      <div style={{ position: "relative", marginBottom: 8 }}>
        <Avatar image={learner.image} name={learner.name} size={rank === 1 ? 72 : 56} lang={lang} />
        {streak > 0 && (
          <div style={{
            position: "absolute", bottom: -3, right: -3,
            background: "#fbbf24", borderRadius: "50%", width: 18, height: 18,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9,
            border: "2px solid var(--surface)",
          }}>рџ”Ґ</div>
        )}
      </div>

      {/* name + stats */}
      <div style={{
        padding: rank === 1 ? "14px 16px" : "11px 14px",
        borderRadius: 14, width: "100%",
        background: `linear-gradient(135deg, var(--surface-2), var(--accent-dim))`,
        border: `1px solid ${hov ? colors[rank - 1] + "66" : "rgba(16,185,129,0.15)"}`,
        boxShadow: hov ? `0 8px 24px ${glows[rank - 1]}` : "none",
        transition: "all 0.2s",
        textAlign: "center",
      }}>
        <div style={{ fontSize: rank === 1 ? 14 : 12, fontWeight: 800, color: "var(--text)", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {learner.name ?? t(locale, "comm_learner")}
        </div>
        <div style={{ fontSize: 10, color: "var(--text-3)", marginBottom: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
          {LANG_FLAGS[lang]} {LANG_LABELS[lang]}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-2)", display: "flex", alignItems: "center", gap: 3 }}>
            <Zap size={9} /> Lv {level}
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, color: colors[rank - 1], display: "flex", alignItems: "center", gap: 3, fontVariantNumeric: "tabular-nums" }}>
            вљЎ {xp.toLocaleString()}
          </span>
          {streak > 0 && (
            <span style={{ fontSize: 11, fontWeight: 700, color: "#fbbf24", display: "flex", alignItems: "center", gap: 2 }}>
              рџ”Ґ{streak}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* в”Ђв”Ђ List row for rank 4+ в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */
function LeaderRow({ learner, rank, isYou, locale }: { learner: Learner; rank: number; isYou: boolean; locale: import("@/lib/i18n").Locale }) {
  const [hov, setHov] = useState(false);
  const xp = learner.progress?.xp ?? 0;
  const level = learner.progress?.level ?? 1;
  const streak = learner.progress?.streak ?? 0;
  const lang = learner.targetLanguage ?? "fr";
  const XP_PER_LEVEL = 500;
  const pct = Math.min(((xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100, 100);

  return (
    <Link
      href={`/community/${learner.id}`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
        borderRadius: 14, textDecoration: "none",
        background: isYou ? "var(--accent-dim)" : hov ? "var(--surface-3)" : "var(--surface-2)",
        border: `1px solid ${isYou ? "rgba(16,185,129,0.35)" : hov ? "rgba(16,185,129,0.2)" : "var(--border)"}`,
        transform: hov ? "translateX(4px)" : "none",
        transition: "all 0.18s ease",
        boxShadow: isYou ? "0 2px 16px rgba(16,185,129,0.1)" : "none",
      }}
    >
      {/* rank */}
      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-3)", minWidth: 28, textAlign: "center" }}>#{rank}</span>

      <Avatar image={learner.image} name={learner.name} size={40} lang={lang} />

      {/* info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {learner.name ?? t(locale, "comm_learner")}
          </span>
          <span style={{ fontSize: 12 }}>{LANG_FLAGS[lang]}</span>
          {isYou && <span style={{ fontSize: 10, fontWeight: 700, color: "var(--accent)", background: "rgba(16,185,129,0.12)", padding: "1px 6px", borderRadius: 5 }}>{t(locale, "comm_you")}</span>}
        </div>
        {/* mini XP bar */}
        <div style={{ height: 4, background: "var(--surface-3)", borderRadius: 999, overflow: "hidden", width: "100%", maxWidth: 160 }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,var(--accent),var(--accent-2))", borderRadius: 999 }} />
        </div>
      </div>

      {/* stats */}
      <div style={{ display: "flex", gap: 10, flexShrink: 0, alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-2)", display: "flex", alignItems: "center", gap: 3 }}>
          <Zap size={10} /> Lv {level}
        </span>
        <span style={{ fontSize: 11, color: "var(--text-3)", fontVariantNumeric: "tabular-nums" }}>
          {xp.toLocaleString()} XP
        </span>
        {streak > 0 && (
          <span style={{ fontSize: 11, color: "#fbbf24", fontWeight: 700 }}>рџ”Ґ{streak}</span>
        )}
        <span style={{ fontSize: 11, color: "var(--text-3)" }}>рџЋ®{learner._count.gameScores}</span>
      </div>
    </Link>
  );
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

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function MonthlyTopCard({ entry, myId }: { entry: MonthlyEntry; myId: string }) {
  const isMe = entry.userId === myId;
  const medals: Record<number, string> = { 1: "рџҐ‡", 2: "рџҐ€", 3: "рџҐ‰" };
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
      borderRadius: 14,
      background: isMe ? "var(--accent-dim)" : entry.rank <= 3 ? "var(--surface-3)" : "var(--surface-2)",
      border: `1px solid ${isMe ? "rgba(16,185,129,0.3)" : entry.rank === 1 ? "rgba(251,191,36,0.3)" : "var(--border)"}`,
    }}>
      <span style={{ minWidth: 24, textAlign: "center", fontSize: 14 }}>
        {medals[entry.rank] ?? `#${entry.rank}`}
      </span>
      <div style={{
        width: 32, height: 32, borderRadius: "50%",
        background: "linear-gradient(135deg,#10b981,var(--accent-press))",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 900, color: "#fff", flexShrink: 0,
      }}>
        {entry.name[0]?.toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: isMe ? "var(--accent)" : "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {entry.name} {isMe && <span style={{ fontSize: 10, color: "var(--accent)" }}>(you)</span>}
        </p>
        <p style={{ fontSize: 11, color: "var(--text-3)" }}>
          {LANG_FLAGS[entry.targetLanguage]} Lv {entry.level}
          {entry.streak > 0 && ` В· рџ”Ґ${entry.streak}`}
        </p>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 800, color: entry.rank === 1 ? "#fbbf24" : "var(--text)" }}>
          вљЎ {entry.monthlyXp.toLocaleString()}
        </p>
        <p style={{ fontSize: 10, color: "var(--text-3)" }}>XP this month</p>
      </div>
    </div>
  );
}

/* в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
   PAGE
в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ */
export default function CommunityPage() {
  const { data: session } = useSession();
  const locale = getLocale((session?.user as any)?.nativeLanguage);
  const [learners, setLearners] = useState<Learner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [langFilter, setLangFilter] = useState("");
  const [monthly, setMonthly] = useState<MonthlyEntry[]>([]);
  const [monthLabel, setMonthLabel] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const myId = (session?.user as any)?.id ?? "";

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
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
    } catch { /* ignore */ }
    setLoading(false);
  }, [debouncedSearch, langFilter]);

  useEffect(() => { fetchLearners(); }, [fetchLearners]);

  useEffect(() => {
    fetch("/api/community/monthly")
      .then(r => r.json())
      .then(d => {
        setMonthly(d.monthly ?? []);
        if (d.month) {
          const dt = new Date(d.month);
          setMonthLabel(MONTH_NAMES[dt.getMonth()] + " " + dt.getFullYear());
        }
      })
      .catch(() => {});
  }, []);

  const isSearching = !!debouncedSearch || !!langFilter;
  const top3 = isSearching ? [] : learners.slice(0, 3);
  const rest = isSearching ? learners : learners.slice(3);

  const myRank = learners.findIndex(l => l.id === myId) + 1;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 0 60px" }}>

      {/* в”Ђв”Ђ Header в”Ђв”Ђ */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 16px rgba(16,185,129,0.35)",
          }}>
            <Users size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: "var(--text)", margin: 0, lineHeight: 1.1 }}>{t(locale, "comm_title")}</h1>
            <p style={{ fontSize: 12, color: "var(--text-3)", margin: 0 }}>{t(locale, "comm_subtitle", { n: learners.length.toString() })}</p>
          </div>
        </div>

        {myId && (
          <Link href={`/community/${myId}`} style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 12, fontWeight: 700, padding: "8px 14px", borderRadius: 10,
            background: "var(--accent-dim)", color: "var(--accent)",
            border: "1px solid rgba(16,185,129,0.3)", textDecoration: "none",
            transition: "all 0.15s",
          }}>
            рџ‘¤ {t(locale, "comm_myProfile")} {myRank > 0 && <span style={{ opacity: 0.7 }}>#{myRank}</span>}
          </Link>
        )}
      </div>

      {/* в”Ђв”Ђ Monthly Clever Student в”Ђв”Ђ */}
      {monthly.length > 0 && (
        <div style={{
          borderRadius: 20, padding: "20px 20px 16px",
          marginBottom: 8,
          background: "linear-gradient(135deg,rgba(251,191,36,0.12),rgba(251,191,36,0.04))",
          border: "1px solid rgba(251,191,36,0.3)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 22 }}>рџЏ…</span>
            <div>
              <p style={{ fontSize: 13, fontWeight: 900, color: "#fbbf24", margin: 0 }}>
                Clever Student of the Month
              </p>
              <p style={{ fontSize: 11, color: "var(--text-3)", margin: 0 }}>
                {monthLabel} В· ranked by XP earned this month
              </p>
            </div>
            {monthly[0] && (
              <div style={{ marginLeft: "auto", textAlign: "center" }}>
                <div style={{ fontSize: 28 }}>рџҐ‡</div>
                <p style={{ fontSize: 11, fontWeight: 800, color: "#fbbf24", margin: 0 }}>
                  {monthly[0].name}
                </p>
                <p style={{ fontSize: 10, color: "var(--text-3)", margin: 0 }}>
                  вљЎ {monthly[0].monthlyXp.toLocaleString()} XP
                </p>
              </div>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {monthly.map(entry => (
              <MonthlyTopCard key={entry.userId} entry={entry} myId={myId} />
            ))}
          </div>
        </div>
      )}

      {/* в”Ђв”Ђ Search + filter в”Ђв”Ђ */}
      <div style={{ display: "flex", gap: 8, margin: "20px 0", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
          <Search size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", pointerEvents: "none" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t(locale, "comm_search")}
            style={{
              width: "100%", boxSizing: "border-box", padding: "10px 14px 10px 34px",
              borderRadius: 11, border: "1px solid var(--border-md)",
              background: "var(--surface-2)", color: "var(--text)", fontSize: 13, outline: "none",
            }}
          />
        </div>
        {(["", "fr", "es", "en"] as const).map(l => (
          <button key={l} onClick={() => setLangFilter(l)} style={{
            padding: "9px 14px", borderRadius: 11, fontSize: 12, fontWeight: 700, cursor: "pointer",
            border: `1px solid ${langFilter === l ? "var(--accent)" : "var(--border-md)"}`,
            background: langFilter === l ? "var(--accent-dim)" : "var(--surface-2)",
            color: langFilter === l ? "var(--accent)" : "var(--text-2)",
            transition: "all 0.15s",
          }}>
            {l === "" ? `рџЊЌ ${t(locale, "comm_all")}` : `${LANG_FLAGS[l]} ${LANG_LABELS[l]}`}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{ height: 68, borderRadius: 14, background: "var(--surface-2)", animation: "pulse 1.5s infinite", opacity: 1 - i * 0.08 }} />
          ))}
        </div>
      ) : learners.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-3)" }}>
          <Users size={48} style={{ opacity: 0.2, marginBottom: 14 }} />
          <p style={{ fontSize: 15, fontWeight: 600 }}>{t(locale, "comm_noLearners")}</p>
          <p style={{ fontSize: 13 }}>{t(locale, "comm_noLearnersHint")}</p>
        </div>
      ) : (
        <>
          {/* в”Ђв”Ђ Podium (top 3) в”Ђв”Ђ */}
          {top3.length === 3 && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
                <Trophy size={14} style={{ color: "#fbbf24" }} />
                <span style={{ fontSize: 12, fontWeight: 800, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.09em" }}>{t(locale, "comm_podium")}</span>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end", marginBottom: 28, padding: "0 8px" }}>
                <PodiumCard learner={top3[1]} rank={2} locale={locale} />
                <PodiumCard learner={top3[0]} rank={1} locale={locale} />
                <PodiumCard learner={top3[2]} rank={3} locale={locale} />
              </div>
            </>
          )}

          {/* в”Ђв”Ђ Rest of leaderboard в”Ђв”Ђ */}
          {rest.length > 0 && (
            <>
              {!isSearching && top3.length === 3 && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                  <Star size={13} style={{ color: "var(--text-3)" }} />
                  <span style={{ fontSize: 12, fontWeight: 800, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.09em" }}>{t(locale, "comm_rankings")}</span>
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                {rest.map((l, i) => (
                  <LeaderRow
                    key={l.id}
                    learner={l}
                    rank={isSearching ? i + 1 : i + 4}
                    isYou={l.id === myId}
                    locale={locale}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        input:focus { border-color: var(--accent) !important; box-shadow: 0 0 0 3px var(--accent-dim); }
      `}</style>
    </div>
  );
}
