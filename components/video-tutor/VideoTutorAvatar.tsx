"use client";

export type AvatarState = "idle" | "speaking" | "listening" | "thinking";

export function VideoTutorAvatar({
  state,
  name,
}: {
  state: AvatarState;
  name: string;
}) {
  const isSpeaking  = state === "speaking";
  const isListening = state === "listening";
  const isThinking  = state === "thinking";

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "4/3",
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
      }}
    >
      {/* Background */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#1e1b4b 0%,#312e81 60%,#4c1d95 100%)" }} />

      {/* Grid */}
      <svg aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.06 }}>
        <defs>
          <pattern id="vt-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#vt-grid)" />
      </svg>

      {/* Listening rings */}
      {isListening && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <div className="vt-ring" style={{ width: 160, height: 160, animationDelay: "0s" }} />
          <div className="vt-ring" style={{ width: 210, height: 210, animationDelay: "0.5s" }} />
          <div className="vt-ring" style={{ width: 260, height: 260, animationDelay: "1s" }} />
        </div>
      )}

      {/* Speaking glow */}
      {isSpeaking && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{ width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle,rgba(251,191,36,0.1) 0%,transparent 70%)", animation: "vt-glow 1.2s ease-in-out infinite alternate" }} />
        </div>
      )}

      {/* Thinking dots above head */}
      {isThinking && (
        <div style={{ position: "absolute", top: "18%", left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6, pointerEvents: "none" }}>
          {[0, 0.2, 0.4].map((d) => (
            <div key={d} style={{ width: 9, height: 9, borderRadius: "50%", background: "rgba(167,139,250,0.9)", animation: `vt-think 1s ease-in-out infinite`, animationDelay: `${d}s` }} />
          ))}
        </div>
      )}

      {/* Avatar */}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", animation: state === "idle" ? "vt-float 4s ease-in-out infinite" : "none" }}>
        <svg width="190" height="210" viewBox="0 0 190 210" xmlns="http://www.w3.org/2000/svg">
          {/* Body */}
          <path d="M35 210 Q42 168 95 162 Q148 168 155 210Z" fill="#c0392b" />
          <rect x="52" y="158" width="86" height="55" rx="8" fill="#c0392b" />
          <path d="M72 163 L95 178 L118 163" stroke="#a93226" strokeWidth="2" fill="none" strokeLinejoin="round" />
          {/* Neck */}
          <rect x="80" y="144" width="30" height="22" rx="5" fill="#f0c4a0" />
          {/* Head */}
          <ellipse cx="95" cy="112" rx="54" ry="58" fill="#f0c4a0" />
          {/* Hair */}
          <ellipse cx="95" cy="57" rx="54" ry="22" fill="#4a2c0a" />
          <rect x="41" y="54" width="108" height="26" fill="#4a2c0a" />
          <ellipse cx="95" cy="54" rx="52" ry="18" fill="#5c3610" />
          <ellipse cx="40" cy="92" rx="11" ry="25" fill="#4a2c0a" />
          <ellipse cx="150" cy="92" rx="11" ry="25" fill="#4a2c0a" />
          {/* Ears */}
          <ellipse cx="41" cy="110" rx="8" ry="10" fill="#f0c4a0" />
          <ellipse cx="149" cy="110" rx="8" ry="10" fill="#f0c4a0" />
          <ellipse cx="41" cy="110" rx="4.5" ry="6" fill="#e0a882" />
          <ellipse cx="149" cy="110" rx="4.5" ry="6" fill="#e0a882" />
          {/* Eyebrows — raised slightly when thinking */}
          <path d={isThinking ? "M58 83 Q70 76 82 80" : "M58 88 Q70 81 82 86"} stroke="#4a2c0a" strokeWidth="3" fill="none" strokeLinecap="round" style={{ transition: "d 0.3s" }} />
          <path d={isThinking ? "M108 80 Q120 76 132 83" : "M108 86 Q120 81 132 88"} stroke="#4a2c0a" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Left eye */}
          <g style={{ transformOrigin: "70px 103px", animation: isThinking ? "vt-blink 1.8s ease-in-out infinite" : "vt-blink 4.5s ease-in-out infinite" }}>
            <ellipse cx="70" cy="103" rx="11" ry="12" fill="white" />
            <ellipse cx={isThinking ? "72" : "70"} cy="105" rx="7" ry="7.5" fill="#3d2b1f" />
            <ellipse cx={isThinking ? "72" : "70"} cy="105" rx="4" ry="4.2" fill="#111" />
            <circle cx="73" cy="102" r="2" fill="white" />
          </g>
          {/* Right eye */}
          <g style={{ transformOrigin: "120px 103px", animation: isThinking ? "vt-blink 1.8s ease-in-out infinite 0.15s" : "vt-blink 4.5s ease-in-out infinite 0.1s" }}>
            <ellipse cx="120" cy="103" rx="11" ry="12" fill="white" />
            <ellipse cx={isThinking ? "118" : "120"} cy="105" rx="7" ry="7.5" fill="#3d2b1f" />
            <ellipse cx={isThinking ? "118" : "120"} cy="105" rx="4" ry="4.2" fill="#111" />
            <circle cx="123" cy="102" r="2" fill="white" />
          </g>
          {/* Nose */}
          <path d="M91 122 Q95 129 99 122" stroke="#e0a882" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Cheek blush */}
          <ellipse cx="52" cy="118" rx="11" ry="7" fill="rgba(255,140,110,0.22)" />
          <ellipse cx="138" cy="118" rx="11" ry="7" fill="rgba(255,140,110,0.22)" />
          {/* Mouth */}
          {isSpeaking ? (
            <g style={{ transformOrigin: "95px 136px", animation: "vt-speak 0.28s ease-in-out infinite alternate" }}>
              <ellipse cx="95" cy="136" rx="15" ry="9" fill="#c0392b" />
              <ellipse cx="95" cy="132" rx="15" ry="4.5" fill="#e05a4a" />
              <clipPath id="vt-teeth"><rect x="80" y="133" width="30" height="8" /></clipPath>
              <rect x="80" y="133" width="30" height="7" rx="2" fill="white" clipPath="url(#vt-teeth)" />
            </g>
          ) : isThinking ? (
            /* Slight "hmm" mouth */
            <path d="M80 136 Q95 132 110 136" stroke="#c0392b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          ) : (
            /* Smile */
            <path d="M78 132 Q95 145 112 132" stroke="#c0392b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          )}
        </svg>
      </div>

      {/* Sound wave bars (listening) */}
      {isListening && (
        <div style={{ position: "absolute", bottom: 48, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 4, height: 28 }}>
          {[0, 0.1, 0.2, 0.05, 0.15, 0.25, 0.08].map((d, i) => (
            <div key={i} style={{ width: 4, borderRadius: 4, background: "#10b981", animation: "vt-wave 0.8s ease-in-out infinite alternate", animationDelay: `${d}s`, height: `${14 + (i % 3) * 8}px` }} />
          ))}
        </div>
      )}

      {/* LIVE badge */}
      <div style={{ position: "absolute", top: 14, right: 14, background: "rgba(239,68,68,0.88)", color: "white", borderRadius: 5, padding: "3px 10px", fontSize: 10, fontFamily: "var(--mono)", fontWeight: 700, letterSpacing: "0.12em", display: "flex", alignItems: "center", gap: 5, backdropFilter: "blur(4px)" }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "white", animation: "vt-blink-dot 1s ease-in-out infinite" }} />
        LIVE
      </div>

      {/* Name + status */}
      <div style={{ position: "absolute", bottom: 14, left: 14, display: "flex", alignItems: "center", gap: 8, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", padding: "6px 14px", borderRadius: 20 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: isListening ? "#10b981" : isSpeaking ? "#f59e0b" : isThinking ? "#a78bfa" : "#6b7280", boxShadow: isListening ? "0 0 8px #10b981" : isSpeaking ? "0 0 8px #f59e0b" : isThinking ? "0 0 8px #a78bfa" : "none" }} />
        <span style={{ color: "white", fontSize: 12, fontFamily: "var(--mono)", letterSpacing: "0.05em" }}>
          {isListening ? "Listening…" : isSpeaking ? "Speaking…" : isThinking ? "Thinking…" : name}
        </span>
      </div>

      <style>{`
        @keyframes vt-float    { 0%,100% { transform:translateY(0);   } 50% { transform:translateY(-10px); } }
        @keyframes vt-blink    { 0%,88%,100% { transform:scaleY(1); } 93% { transform:scaleY(0.05); } }
        @keyframes vt-speak    { 0% { transform:scaleY(0.18); } 100% { transform:scaleY(1); } }
        @keyframes vt-glow     { 0% { opacity:.5;transform:scale(0.9); } 100% { opacity:1;transform:scale(1.1); } }
        @keyframes vt-blink-dot{ 0%,100%{opacity:1;} 50%{opacity:.2;} }
        @keyframes vt-think    { 0%,100%{transform:translateY(0);opacity:.5;} 50%{transform:translateY(-6px);opacity:1;} }
        @keyframes vt-wave     { 0%{transform:scaleY(.4);} 100%{transform:scaleY(1.2);} }
        .vt-ring { position:absolute;border-radius:50%;border:2px solid rgba(16,185,129,.45);animation:vt-pulse 2s ease-out infinite; }
        @keyframes vt-pulse    { 0%{transform:scale(1);opacity:.8;} 100%{transform:scale(1.3);opacity:0;} }
      `}</style>
    </div>
  );
}
