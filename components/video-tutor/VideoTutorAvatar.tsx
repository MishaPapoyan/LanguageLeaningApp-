"use client";

export type AvatarState = "idle" | "speaking" | "listening";

export function VideoTutorAvatar({
  state,
  name,
}: {
  state: AvatarState;
  name: string;
}) {
  const isSpeaking = state === "speaking";
  const isListening = state === "listening";

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
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4c1d95 100%)",
        }}
      />

      {/* Subtle grid */}
      <svg
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.06,
        }}
      >
        <defs>
          <pattern id="vt-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#vt-grid)" />
      </svg>

      {/* Listening pulse rings */}
      {isListening && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div className="vt-ring" style={{ width: 160, height: 160, animationDelay: "0s" }} />
          <div className="vt-ring" style={{ width: 210, height: 210, animationDelay: "0.5s" }} />
          <div className="vt-ring" style={{ width: 260, height: 260, animationDelay: "1s" }} />
        </div>
      )}

      {/* Speaking glow */}
      {isSpeaking && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: 240,
              height: 240,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(251,191,36,0.1) 0%, transparent 70%)",
              animation: "vt-glow 1.2s ease-in-out infinite alternate",
            }}
          />
        </div>
      )}

      {/* Avatar SVG */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation:
            state === "idle" ? "vt-float 4s ease-in-out infinite" : "none",
        }}
      >
        <svg
          width="190"
          height="210"
          viewBox="0 0 190 210"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Shirt / body */}
          <path d="M35 210 Q42 168 95 162 Q148 168 155 210Z" fill="#c0392b" />
          <rect x="52" y="158" width="86" height="55" rx="8" fill="#c0392b" />
          {/* Collar V */}
          <path
            d="M72 163 L95 178 L118 163"
            stroke="#a93226"
            strokeWidth="2"
            fill="none"
            strokeLinejoin="round"
          />

          {/* Neck */}
          <rect x="80" y="144" width="30" height="22" rx="5" fill="#f0c4a0" />

          {/* Head */}
          <ellipse cx="95" cy="112" rx="54" ry="58" fill="#f0c4a0" />

          {/* Hair — back layer */}
          <ellipse cx="95" cy="57" rx="54" ry="22" fill="#4a2c0a" />
          <rect x="41" y="54" width="108" height="26" fill="#4a2c0a" />
          {/* Hair — top sheen */}
          <ellipse cx="95" cy="54" rx="52" ry="18" fill="#5c3610" />
          {/* Hair sides */}
          <ellipse cx="40" cy="92" rx="11" ry="25" fill="#4a2c0a" />
          <ellipse cx="150" cy="92" rx="11" ry="25" fill="#4a2c0a" />

          {/* Ears */}
          <ellipse cx="41" cy="110" rx="8" ry="10" fill="#f0c4a0" />
          <ellipse cx="149" cy="110" rx="8" ry="10" fill="#f0c4a0" />
          <ellipse cx="41" cy="110" rx="4.5" ry="6" fill="#e0a882" />
          <ellipse cx="149" cy="110" rx="4.5" ry="6" fill="#e0a882" />

          {/* Eyebrows */}
          <path
            d="M58 88 Q70 81 82 86"
            stroke="#4a2c0a"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M108 86 Q120 81 132 88"
            stroke="#4a2c0a"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />

          {/* Left eye (blinks via CSS) */}
          <g
            style={{
              transformOrigin: "70px 103px",
              animation: "vt-blink 4.5s ease-in-out infinite",
            }}
          >
            <ellipse cx="70" cy="103" rx="11" ry="12" fill="white" />
            <ellipse cx="70" cy="105" rx="7" ry="7.5" fill="#3d2b1f" />
            <ellipse cx="70" cy="105" rx="4" ry="4.2" fill="#111" />
            <circle cx="73" cy="102" r="2" fill="white" />
          </g>

          {/* Right eye */}
          <g
            style={{
              transformOrigin: "120px 103px",
              animation: "vt-blink 4.5s ease-in-out infinite 0.1s",
            }}
          >
            <ellipse cx="120" cy="103" rx="11" ry="12" fill="white" />
            <ellipse cx="120" cy="105" rx="7" ry="7.5" fill="#3d2b1f" />
            <ellipse cx="120" cy="105" rx="4" ry="4.2" fill="#111" />
            <circle cx="123" cy="102" r="2" fill="white" />
          </g>

          {/* Nose */}
          <path
            d="M91 122 Q95 129 99 122"
            stroke="#e0a882"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />

          {/* Cheek blush */}
          <ellipse cx="52" cy="118" rx="11" ry="7" fill="rgba(255,140,110,0.22)" />
          <ellipse cx="138" cy="118" rx="11" ry="7" fill="rgba(255,140,110,0.22)" />

          {/* Mouth */}
          {isSpeaking ? (
            /* Open, animated mouth */
            <g
              style={{
                transformOrigin: "95px 136px",
                animation: "vt-speak 0.28s ease-in-out infinite alternate",
              }}
            >
              {/* Lips */}
              <ellipse cx="95" cy="136" rx="15" ry="9" fill="#c0392b" />
              {/* Upper lip ridge */}
              <ellipse cx="95" cy="132" rx="15" ry="4.5" fill="#e05a4a" />
              {/* Teeth (clipped inside mouth) */}
              <clipPath id="vt-teeth">
                <rect x="80" y="133" width="30" height="8" />
              </clipPath>
              <rect
                x="80"
                y="133"
                width="30"
                height="7"
                rx="2"
                fill="white"
                clipPath="url(#vt-teeth)"
              />
            </g>
          ) : (
            /* Smile */
            <path
              d="M78 132 Q95 145 112 132"
              stroke="#c0392b"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
          )}
        </svg>
      </div>

      {/* LIVE badge */}
      <div
        style={{
          position: "absolute",
          top: 14,
          right: 14,
          background: "rgba(239,68,68,0.88)",
          color: "white",
          borderRadius: 5,
          padding: "3px 10px",
          fontSize: 10,
          fontFamily: "var(--mono)",
          fontWeight: 700,
          letterSpacing: "0.12em",
          display: "flex",
          alignItems: "center",
          gap: 5,
          backdropFilter: "blur(4px)",
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "white",
            animation: "vt-blink-dot 1s ease-in-out infinite",
          }}
        />
        LIVE
      </div>

      {/* Name + status */}
      <div
        style={{
          position: "absolute",
          bottom: 14,
          left: 14,
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(8px)",
          padding: "6px 14px",
          borderRadius: 20,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: isListening
              ? "#10b981"
              : isSpeaking
              ? "#f59e0b"
              : "#6b7280",
            boxShadow: isListening
              ? "0 0 8px #10b981"
              : isSpeaking
              ? "0 0 8px #f59e0b"
              : "none",
          }}
        />
        <span
          style={{
            color: "white",
            fontSize: 12,
            fontFamily: "var(--mono)",
            letterSpacing: "0.05em",
          }}
        >
          {isListening ? "Listening…" : isSpeaking ? "Speaking…" : name}
        </span>
      </div>

      <style>{`
        @keyframes vt-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes vt-blink {
          0%, 88%, 100% { transform: scaleY(1); }
          93%           { transform: scaleY(0.05); }
        }
        @keyframes vt-speak {
          0%   { transform: scaleY(0.18); }
          100% { transform: scaleY(1); }
        }
        @keyframes vt-glow {
          0%   { opacity: 0.5; transform: scale(0.9); }
          100% { opacity: 1;   transform: scale(1.1); }
        }
        @keyframes vt-blink-dot {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.2; }
        }
        .vt-ring {
          position: absolute;
          border-radius: 50%;
          border: 2px solid rgba(16, 185, 129, 0.45);
          animation: vt-pulse 2s ease-out infinite;
        }
        @keyframes vt-pulse {
          0%   { transform: scale(1);   opacity: 0.8; }
          100% { transform: scale(1.3); opacity: 0;   }
        }
      `}</style>
    </div>
  );
}
