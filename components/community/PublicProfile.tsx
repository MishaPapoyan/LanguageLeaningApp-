"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { t, getLocale } from "@/lib/i18n";
import {
  Flame, Zap, Trophy, BookMarked, Gamepad2,
  Globe, Calendar, Award, TrendingUp, User, Star,
} from "lucide-react";

/* в”Ђв”Ђв”Ђ Types в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */
interface ProfileData {
  id: string;
  name: string | null;
  image: string | null;
  targetLanguage: string | null;
  joinedAt: string;
  progress: {
    xp: number; level: number; streak: number;
    badges: string[];
    skillTree: { vocabulary: number; grammar: number; speaking: number };
    weeklyXp: Record<string, number>;
  } | null;
  bestScores: Record<string, number>;
  counts: { gameScores: number; savedWords: number };
}
interface Props { profile: ProfileData; viewerUserId: string; }

/* в”Ђв”Ђв”Ђ Constants в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */
const LANG: Record<string, { label: string; flag: string; grad: string; accent: string }> = {
  fr: { label: "French",  flag: "рџ‡«рџ‡·", grad: "linear-gradient(135deg,#0f1b6b 0%,#2d1d8a 40%,#5b21b6 100%)", accent: "var(--accent-2)" },
  es: { label: "Spanish", flag: "рџ‡Єрџ‡ё", grad: "linear-gradient(135deg,#7c2d12 0%,#b45309 50%,#d97706 100%)", accent: "#fbbf24" },
  en: { label: "English", flag: "рџ‡¬рџ‡§", grad: "linear-gradient(135deg,#0c1e3a 0%,#155e75 50%,#0e7490 100%)", accent: "#22d3ee" },
};
const GAME_LABEL: Record<string, string> = {
  MATCHING:"Matching", WORD_SCRAMBLE:"Scramble", FILL_BLANK:"Fill Blank",
  TRUE_FALSE:"True/False", SENTENCE_BUILDER:"Sentence Builder",
  DIALOG_ADVENTURE:"Dialog", CITY_EXPLORER:"City Explorer", WORD_BLAST:"Word Blast",
};
const GAME_ICON: Record<string, string> = {
  MATCHING:"рџѓЏ", WORD_SCRAMBLE:"рџ”Ђ", FILL_BLANK:"вњЏпёЏ", TRUE_FALSE:"вљ–пёЏ",
  SENTENCE_BUILDER:"рџ”¤", DIALOG_ADVENTURE:"рџ’¬", CITY_EXPLORER:"рџЏ™пёЏ", WORD_BLAST:"рџ’Ґ",
};
const XP_PER_LVL = 500;

/* в”Ђв”Ђв”Ђ Helpers в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */
function isEmoji(s: string | null) {
  return !!s && /\p{Emoji}/u.test(s) && !/^[a-zA-Z0-9]$/.test(s);
}
function useCountUp(target: number, ms = 1200, go: boolean) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!go) return;
    if (target === 0) { setV(0); return; }
    let t0: number | null = null;
    const tick = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / ms, 1);
      setV(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, ms, go]);
  return v;
}

/* в”Ђв”Ђв”Ђ XP Ring в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */
function XpRing({ xp, level, go }: { xp: number; level: number; go: boolean }) {
  const R = 52, C = 2 * Math.PI * R;
  const pct = Math.min(((xp % XP_PER_LVL) / XP_PER_LVL) * 100, 100);
  const [dash, setDash] = useState(C);
  const counted = useCountUp(xp, 1400, go);
  const inLvl   = useCountUp(xp % XP_PER_LVL, 1400, go);
  useEffect(() => {
    if (!go) return;
    const t = setTimeout(() => setDash(C - (pct / 100) * C), 250);
    return () => clearTimeout(t);
  }, [pct, go, C]);
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
      <div style={{ position:"relative", width:120, height:120 }}>
        <svg width="120" height="120" style={{ transform:"rotate(-90deg)" }}>
          <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="9"/>
          <circle cx="60" cy="60" r={R} fill="none" stroke="url(#rg)" strokeWidth="9"
            strokeLinecap="round" strokeDasharray={C} strokeDashoffset={dash}
            style={{ transition:"stroke-dashoffset 1.5s cubic-bezier(.4,0,.2,1)", filter:"drop-shadow(0 0 6px var(--accent))" }}/>
          <defs>
            <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--accent)"/>
              <stop offset="100%" stopColor="var(--accent-2)"/>
            </linearGradient>
          </defs>
        </svg>
        <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
          <span style={{ fontSize:10, fontWeight:700, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"0.08em" }}>LVL</span>
          <span style={{ fontSize:30, fontWeight:900, color:"var(--accent)", lineHeight:1 }}>{level}</span>
          <span style={{ fontSize:9, color:"var(--text-3)" }}>{inLvl}/{XP_PER_LVL}</span>
        </div>
      </div>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:18, fontWeight:900, color:"var(--text)", fontVariantNumeric:"tabular-nums" }}>{counted.toLocaleString()}</div>
        <div style={{ fontSize:10, color:"var(--text-3)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.07em" }}>Total XP</div>
      </div>
    </div>
  );
}

/* в”Ђв”Ђв”Ђ Skill bar в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */
function SkillBar({ label, icon, value, go, delay=0, color }: { label:string; icon:string; value:number; go:boolean; delay?:number; color:string }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!go) return;
    const t = setTimeout(() => setW(Math.min(value, 100)), delay);
    return () => clearTimeout(t);
  }, [value, go, delay]);
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
        <span style={{ fontSize:13, fontWeight:700, color:"var(--text)", display:"flex", alignItems:"center", gap:6 }}><span>{icon}</span>{label}</span>
        <span style={{ fontSize:12, fontWeight:700, color, fontVariantNumeric:"tabular-nums" }}>{value}%</span>
      </div>
      <div style={{ height:8, borderRadius:999, background:"var(--surface-3)", overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${w}%`, borderRadius:999, background:`linear-gradient(90deg,${color}99,${color})`, boxShadow:`0 0 8px ${color}55`, transition:`width 1.1s cubic-bezier(.4,0,.2,1) ${delay}ms` }}/>
      </div>
    </div>
  );
}

/* в”Ђв”Ђв”Ђ Stat tile в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */
function StatTile({ icon, label, value, color, go, delay=0 }: { icon:React.ReactNode; label:string; value:number; color:string; go:boolean; delay?:number }) {
  const [hov, setHov] = useState(false);
  const n = useCountUp(value, 1100, go);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:"20px 10px", borderRadius:18, gap:6, flex:1, minWidth:0, cursor:"default",
      background: hov ? "var(--surface-3)" : "var(--surface-2)",
      border:`1.5px solid ${hov ? color+"55" : "var(--border)"}`,
      transform: hov ? "translateY(-4px) scale(1.04)" : "scale(1)",
      transition:"all 0.25s cubic-bezier(.34,1.56,.64,1)",
      boxShadow: hov ? `0 12px 32px ${color}22` : "none",
    }}>
      <div style={{ color, opacity:0.85 }}>{icon}</div>
      <span style={{ fontSize:26, fontWeight:900, color:"var(--text)", fontVariantNumeric:"tabular-nums", lineHeight:1 }}>{n.toLocaleString()}</span>
      <span style={{ fontSize:10, fontWeight:700, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"0.07em", textAlign:"center" }}>{label}</span>
    </div>
  );
}

/* в”Ђв”Ђв”Ђ Weekly chart в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */
function WeekChart({ data, go }: { data: Record<string,number>; go: boolean }) {
  const DAYS = ["M","T","W","T","F","S","S"];
  const today = new Date();
  const bars = DAYS.map((_,i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (today.getDay()||7) + 1 + i);
    return { d: DAYS[i], xp: data[d.toISOString().slice(0,10)] ?? 0 };
  });
  const max = Math.max(...bars.map(b=>b.xp), 1);
  const [hs, setHs] = useState(bars.map(()=>0));
  useEffect(() => {
    if (!go) return;
    const t = setTimeout(() => setHs(bars.map(b=>(b.xp/max)*100)), 350);
    return () => clearTimeout(t);
  }, [go]);
  const total = bars.reduce((s,b)=>s+b.xp,0);
  return (
    <div>
      <div style={{ display:"flex", alignItems:"flex-end", gap:5, height:80 }}>
        {bars.map((b,i)=>(
          <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
            <div style={{ width:"100%", height:68, display:"flex", alignItems:"flex-end" }}>
              <div style={{ width:"100%", height:`${hs[i]}%`, minHeight: b.xp>0?4:0, borderRadius:"4px 4px 0 0", background: b.xp>0?"linear-gradient(180deg,var(--accent-2),var(--accent))":"var(--surface-3)", transition:`height 0.8s cubic-bezier(.4,0,.2,1) ${i*55}ms`, boxShadow: b.xp>0?"0 0 8px rgba(16,185,129,0.3)":"none" }}/>
            </div>
            <span style={{ fontSize:9, color:"var(--text-3)", fontWeight:600 }}>{b.d}</span>
          </div>
        ))}
      </div>
      <div style={{ textAlign:"center", marginTop:8, fontSize:12, color:"var(--text-3)" }}>
        <span style={{ fontWeight:800, color:"var(--accent-2)" }}>{total.toLocaleString()} XP</span>
      </div>
    </div>
  );
}

/* в”Ђв”Ђв”Ђ Compare bar в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */
function CmpBar({ label, a, b, nameA, nameB }: { label:string; a:number; b:number; nameA:string; nameB:string }) {
  const t = a+b||1;
  const pA = Math.round((a/t)*100);
  const win = a>=b;
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
        <span style={{ fontSize:12, fontWeight:700, color: win?"var(--accent)":"var(--text-3)" }}>{a.toLocaleString()}</span>
        <span style={{ fontSize:11, color:"var(--text-3)", fontWeight:600 }}>{label}</span>
        <span style={{ fontSize:12, fontWeight:700, color: !win?"var(--accent-2)":"var(--text-3)" }}>{b.toLocaleString()}</span>
      </div>
      <div style={{ height:7, borderRadius:999, overflow:"hidden", display:"flex" }}>
        <div style={{ width:`${pA}%`, background:"var(--accent)", borderRadius:"999px 0 0 999px", transition:"width 0.9s ease" }}/>
        <div style={{ width:`${100-pA}%`, background:"var(--accent-2)", borderRadius:"0 999px 999px 0", transition:"width 0.9s ease" }}/>
      </div>
    </div>
  );
}

/* в”Ђв”Ђв”Ђ Collapsible card в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */
function Card({ title, icon, children }: { title:string; icon:React.ReactNode; children:React.ReactNode }) {
  return (
    <div className="card" style={{ padding:"20px 22px", marginBottom:12 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
        <span style={{ color:"var(--accent)" }}>{icon}</span>
        <span style={{ fontSize:14, fontWeight:800, color:"var(--text)" }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

/* в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
   MAIN COMPONENT
в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ */
export function PublicProfile({ profile, viewerUserId }: Props) {
  const { data: session } = useSession();
  const locale = getLocale((session?.user as any)?.nativeLanguage);
  const [go, setGo] = useState(false);
  useEffect(() => { const t = setTimeout(()=>setGo(true),80); return ()=>clearTimeout(t); }, []);

  const isOwn = viewerUserId === profile.id;
  const p = profile.progress;
  const xp     = p?.xp ?? 0;
  const level  = p?.level ?? 1;
  const streak = p?.streak ?? 0;
  const badges = p?.badges ?? [];
  const skill  = p?.skillTree ?? { vocabulary:0, grammar:0, speaking:0 };
  const wkly   = p?.weeklyXp ?? {};
  const lang   = profile.targetLanguage ?? "fr";
  const lm     = LANG[lang] ?? LANG.fr;
  const joined = new Date(profile.joinedAt).toLocaleDateString("en-US",{ month:"long", year:"numeric" });
  const emojiAv = isEmoji(profile.image);
  const initial = (profile.name ?? "?")[0]?.toUpperCase();
  const totalScore = Object.values(profile.bestScores).reduce((s,v)=>s+v,0);
  const bestGame   = Object.entries(profile.bestScores).sort((a,b)=>b[1]-a[1])[0];

  const vXp     = (session?.user as any)?.progress?.xp ?? 0;
  const vLevel  = (session?.user as any)?.progress?.level ?? 1;
  const vStreak = (session?.user as any)?.progress?.streak ?? 0;
  const vName   = session?.user?.name?.split(" ")[0] ?? "You";

  return (
    <div style={{ width:"100%" }}>

      {/* в•ђв•ђ COVER в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ */}
      <div style={{ height:220, borderRadius:0, background:lm.grad, position:"relative", overflow:"hidden" }}>
        {/* decorative blobs */}
        {[{w:300,h:300,t:-80,r:-60,o:0.06},{w:180,h:180,b:-60,l:80,o:0.07},{w:100,h:100,t:30,l:220,o:0.05},{w:60,h:60,t:80,r:120,o:0.08}].map((s,i)=>(
          <div key={i} style={{ position:"absolute", width:s.w, height:s.h, borderRadius:"50%", background:`rgba(255,255,255,${s.o})`, top:(s as any).t, bottom:(s as any).b, right:(s as any).r, left:(s as any).l }} />
        ))}
        {/* streak */}
        {streak>0 && (
          <div style={{ position:"absolute", top:18, left:20, background:"rgba(0,0,0,0.35)", backdropFilter:"blur(10px)", borderRadius:20, padding:"6px 14px", fontSize:13, fontWeight:700, color:"#fbbf24", border:"1px solid rgba(251,191,36,0.3)", display:"flex", alignItems:"center", gap:6 }}>
            рџ”Ґ {t(locale, "profile_dayStreak", { n: streak.toString() })}
          </div>
        )}
        {/* lang pill */}
        <div style={{ position:"absolute", top:18, right:20, background:"rgba(0,0,0,0.35)", backdropFilter:"blur(10px)", borderRadius:20, padding:"6px 14px", fontSize:13, fontWeight:700, color:"#fff", border:"1px solid rgba(255,255,255,0.15)", display:"flex", alignItems:"center", gap:6 }}>
          {lm.flag} {lm.label}
        </div>
      </div>

      {/* в•ђв•ђ IDENTITY ROW в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ */}
      <div style={{ background:"var(--surface)", borderBottom:"1px solid var(--border)", padding:"0 20px 24px", position:"relative", zIndex:2 }}>
        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:14, marginBottom:18 }}>
          {/* avatar */}
          <div style={{
            width:110, height:110, borderRadius:"50%", flexShrink:0,
            background: emojiAv ? "var(--surface-3)" : lm.grad,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize: emojiAv ? 56 : 40, fontWeight:900, color:"#fff",
            border:"5px solid var(--surface)",
            boxShadow:`0 0 0 2px ${lm.accent}55, 0 8px 32px rgba(0,0,0,0.4)`,
            marginTop:-55,
            position:"relative", zIndex:10,
          }}>
            {emojiAv ? profile.image : initial}
          </div>

          {/* action buttons */}
          <div style={{ display:"flex", gap:8, paddingTop:10 }}>
            {isOwn ? (
              <Link href="/settings" style={{ display:"inline-flex", alignItems:"center", gap:7, fontSize:13, fontWeight:700, padding:"9px 18px", borderRadius:11, textDecoration:"none", background:"var(--accent)", color:"#fff", boxShadow:"0 4px 14px rgba(16,185,129,0.4)", transition:"all 0.15s" }}>
                вњЏпёЏ {t(locale, "profile_editProfile")}
              </Link>
            ) : (
              <Link href="/community" style={{ display:"inline-flex", alignItems:"center", gap:7, fontSize:13, fontWeight:700, padding:"9px 18px", borderRadius:11, textDecoration:"none", background:"var(--surface-2)", color:"var(--text-2)", border:"1px solid var(--border)", transition:"all 0.15s" }}>
                в†ђ Back
              </Link>
            )}
          </div>
        </div>

        {/* name */}
        <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", marginBottom:8 }}>
          <h1 style={{ fontSize:28, fontWeight:900, color:"var(--text)", margin:0 }}>{profile.name ?? t(locale, "profile_learner")}</h1>
          {isOwn && <span style={{ fontSize:11, fontWeight:800, color:"var(--accent)", background:"var(--accent-dim)", padding:"3px 10px", borderRadius:20, border:"1px solid rgba(16,185,129,0.25)" }}>{t(locale, "profile_you")}</span>}
          {badges.length>0 && <span style={{ fontSize:11, fontWeight:800, color:lm.accent, background:"rgba(0,0,0,0.15)", padding:"3px 10px", borderRadius:20 }}>в­ђ {badges.length} badges</span>}
        </div>

        {/* meta row */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:16, marginBottom:22 }}>
          <span style={{ fontSize:13, color:"var(--text-3)", display:"flex", alignItems:"center", gap:5 }}><Globe size={13} style={{ color:lm.accent }} /> {t(locale, "profile_learning", { lang: lm.label })}</span>
          <span style={{ fontSize:13, color:"var(--text-3)", display:"flex", alignItems:"center", gap:5 }}><Calendar size={13} /> {t(locale, "profile_joined")} {joined}</span>
          {bestGame && <span style={{ fontSize:13, color:"var(--text-3)", display:"flex", alignItems:"center", gap:5 }}><Trophy size={13} style={{ color:"var(--gold)" }} /> {t(locale, "profile_best")} {GAME_LABEL[bestGame[0]]}</span>}
        </div>

        {/* в”Ђв”Ђ 6 stat tiles в”Ђв”Ђ */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:10 }}>
          <StatTile icon={<Zap size={22}/>}       label={t(locale, "profile_totalXp")}  value={xp}                        color="var(--accent)"   go={go} delay={0}   />
          <StatTile icon={<Star size={22}/>}       label={t(locale, "profile_level")}    value={level}                     color="var(--accent-2)" go={go} delay={70}  />
          <StatTile icon={<Flame size={22}/>}      label={t(locale, "profile_streak")}   value={streak}                    color="var(--gold)"     go={go} delay={140} />
          <StatTile icon={<Gamepad2 size={22}/>}   label={t(locale, "profile_games")}    value={profile.counts.gameScores} color="#34d399"         go={go} delay={210} />
          <StatTile icon={<BookMarked size={22}/>} label={t(locale, "profile_words")}    value={profile.counts.savedWords} color="#f472b6"         go={go} delay={280} />
          <StatTile icon={<Award size={22}/>}      label={t(locale, "profile_badges")}   value={badges.length}             color="#a78bfa"         go={go} delay={350} />
        </div>
      </div>

      {/* в•ђв•ђ 2-COLUMN BODY в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, margin:"12px 0 0", padding:"0 20px 32px" }}>

        {/* в”Ђв”Ђ LEFT COLUMN в”Ђв”Ђ */}
        <div>
          {/* XP ring + weekly */}
          <div className="card" style={{ padding:"22px", marginBottom:12 }}>
            <div style={{ display:"flex", gap:20, alignItems:"center", flexWrap:"wrap" }}>
              <XpRing xp={xp} level={level} go={go} />
              <div style={{ flex:1, minWidth:160 }}>
                <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:12 }}>
                  <TrendingUp size={13} style={{ color:"var(--accent)" }}/>
                  <span style={{ fontSize:13, fontWeight:800, color:"var(--text)" }}>{t(locale, "profile_weeklyActivity")}</span>
                </div>
                <WeekChart data={wkly} go={go} />
              </div>
            </div>
          </div>

          {/* Skill tree */}
          <Card title={t(locale, "profile_skillTree")} icon={<Zap size={15}/>}>
            <SkillBar label={t(locale, "profile_vocabulary")} icon="рџ“љ" value={skill.vocabulary} go={go} delay={0}   color="var(--accent-2)"/>
            <SkillBar label={t(locale, "profile_grammar")}    icon="вњЌпёЏ"  value={skill.grammar}    go={go} delay={120} color="#34d399"/>
            <SkillBar label={t(locale, "profile_speaking")}   icon="рџЋ™пёЏ"  value={skill.speaking}   go={go} delay={240} color="#f472b6"/>
          </Card>

          {/* Compare вЂ” only when viewing someone else */}
          {!isOwn && (
            <Card title={t(locale, "profile_compareWith")} icon={<User size={15}/>}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
                <span style={{ fontSize:13, fontWeight:700, color:"var(--accent)" }}>{vName}</span>
                <span style={{ fontSize:12, color:"var(--text-3)" }}>vs</span>
                <span style={{ fontSize:13, fontWeight:700, color:"var(--accent-2)" }}>{profile.name?.split(" ")[0]}</span>
              </div>
              <CmpBar label="XP"     a={vXp}     b={xp}     nameA={vName} nameB={profile.name?.split(" ")[0]??""} />
              <CmpBar label="Level"  a={vLevel}  b={level}  nameA={vName} nameB={profile.name?.split(" ")[0]??""} />
              <CmpBar label="Streak" a={vStreak} b={streak} nameA={vName} nameB={profile.name?.split(" ")[0]??""} />
              <CmpBar label="Games"  a={0}       b={profile.counts.gameScores} nameA={vName} nameB={profile.name?.split(" ")[0]??""} />
            </Card>
          )}
        </div>

        {/* в”Ђв”Ђ RIGHT COLUMN в”Ђв”Ђ */}
        <div>
          {/* Best game scores */}
          {Object.keys(profile.bestScores).length > 0 && (
            <Card title={t(locale, "profile_bestScores")} icon={<Gamepad2 size={15}/>}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
                {Object.entries(profile.bestScores).sort((a,b)=>b[1]-a[1]).map(([g,s])=>(
                  <GameCard key={g} game={g} score={s}/>
                ))}
              </div>
              <div style={{ padding:"10px 14px", borderRadius:10, background:"var(--surface-3)", display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:12, color:"var(--text-3)", fontWeight:600 }}>{t(locale, "profile_combined")}</span>
                <span style={{ fontSize:14, fontWeight:900, color:"var(--accent)", fontVariantNumeric:"tabular-nums" }}>{totalScore.toLocaleString()}</span>
              </div>
            </Card>
          )}

          {/* Badges */}
          {badges.length > 0 && (
            <Card title={t(locale, "profile_badgesCount", { n: badges.length.toString() })} icon={<Award size={15}/>}>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {badges.map((b,i) => <BadgeChip key={b} badge={b} delay={i*60}/>)}
              </div>
            </Card>
          )}

          {/* Empty state if no scores / badges yet */}
          {Object.keys(profile.bestScores).length === 0 && badges.length === 0 && (
            <div className="card" style={{ padding:"40px 20px", textAlign:"center" }}>
              <div style={{ fontSize:40, marginBottom:10 }}>рџЋ®</div>
              <p style={{ fontSize:14, fontWeight:700, color:"var(--text)", marginBottom:4 }}>{t(locale, "profile_noGames")}</p>
              <p style={{ fontSize:12, color:"var(--text-3)" }}>{t(locale, "profile_noGamesHint")}</p>
            </div>
          )}
        </div>
      </div>

      {/* Responsive: stack on small screens */}
      <style>{`
        @media (max-width: 720px) {
          .profile-2col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

/* в”Ђв”Ђв”Ђ Game score card в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */
function GameCard({ game, score }: { game:string; score:number }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{
      padding:"14px", borderRadius:14, cursor:"default",
      background: hov ? "var(--accent-dim)" : "var(--surface-2)",
      border:`1.5px solid ${hov?"rgba(16,185,129,0.35)":"var(--border)"}`,
      transform: hov ? "translateY(-2px) scale(1.03)" : "none",
      transition:"all 0.2s cubic-bezier(.34,1.56,.64,1)",
    }}>
      <div style={{ fontSize:22, marginBottom:6 }}>{GAME_ICON[game]??"рџЋ®"}</div>
      <div style={{ fontSize:10, fontWeight:700, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:3 }}>{GAME_LABEL[game]??game}</div>
      <div style={{ fontSize:20, fontWeight:900, color: hov?"var(--accent)":"var(--text)", fontVariantNumeric:"tabular-nums" }}>{score.toLocaleString()}</div>
    </div>
  );
}

/* в”Ђв”Ђв”Ђ Badge chip в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */
function BadgeChip({ badge, delay }: { badge:string; delay:number }) {
  const [vis, setVis] = useState(false);
  const [hov, setHov] = useState(false);
  useEffect(() => { const t = setTimeout(()=>setVis(true), delay); return ()=>clearTimeout(t); }, [delay]);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{
      padding:"8px 14px", borderRadius:20, cursor:"default",
      background: hov ? "var(--accent-dim)" : "var(--surface-2)",
      border:`1px solid ${hov?"rgba(16,185,129,0.4)":"rgba(16,185,129,0.15)"}`,
      display:"flex", alignItems:"center", gap:6,
      transform: vis ? (hov?"scale(1.06)":"scale(1)") : "scale(0.3)",
      opacity: vis ? 1 : 0,
      transition:"transform 0.4s cubic-bezier(.34,1.56,.64,1), opacity 0.3s, background 0.15s",
    }}>
      <Award size={12} style={{ color:"var(--accent)", flexShrink:0 }}/>
      <span style={{ fontSize:12, fontWeight:700, color:"var(--text)" }}>{badge}</span>
    </div>
  );
}
