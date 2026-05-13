"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { speak } from "@/lib/speech";
import { Mic, MicOff, Play, Square, Volume2 } from "lucide-react";

interface Word {
  id: string;
  word: string;
  translation: string;
  exampleFr: string;
  exampleEn: string;
  imageEmoji: string;
  category: string;
}

interface Props {
  words: Word[];
  categories: string[];
  ttsLocale?: string;
}

// ─── Waveform bar animation (CSS-only, no canvas needed) ─────────────────────
function WaveformBars({ active }: { active: boolean }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2, height: 20 }}>
      {[0.6, 1.0, 0.75, 0.9, 0.5, 0.85, 0.65].map((h, i) => (
        <span
          key={i}
          style={{
            display: "block",
            width: 3,
            borderRadius: 99,
            background: "var(--accent)",
            height: active ? `${h * 100}%` : "20%",
            transition: active
              ? `height ${0.3 + i * 0.07}s ease-in-out alternate infinite`
              : "height 0.2s ease",
            animation: active ? `wavebar-${i % 3} 0.6s ease-in-out infinite alternate` : "none",
          }}
        />
      ))}
    </span>
  );
}

export function PronunciationClient({ words, categories, ttsLocale = "fr-FR" }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [speed, setSpeed] = useState<number>(0.85);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [ttsStatus, setTtsStatus] = useState<"idle" | "loading" | "playing">("idle");
  const playing = ttsStatus !== "idle";

  // ── Recording state ─────────────────────────────────────────────────────────
  const [recording, setRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [xpAwarded, setXpAwarded] = useState<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setRecordedUrl(null);
    setMicError(null);
    setXpAwarded(null);
  }, [currentWord?.id]);

  const filtered = selectedCategory
    ? words.filter((w) => w.category === selectedCategory)
    : words;

  const speakText = useCallback((text: string, lang = ttsLocale) => {
    setTtsStatus("loading");
    speak(text, {
      lang,
      rate: speed,
      onLoading: () => setTtsStatus("loading"),
      onPlaying: () => setTtsStatus("playing"),
      onEnd:     () => setTtsStatus("idle"),
      onError:   () => setTtsStatus("idle"),
    });
  }, [speed, ttsLocale]);

  const playWord = (word: Word) => {
    setCurrentWord(word);
    speakText(word.word);
  };

  const playExample = (word: Word) => {
    setCurrentWord(word);
    // LOW-7: use speakText so ttsLocale and speed are applied consistently
    speakText(word.exampleFr);
  };

  // ── Recording logic ─────────────────────────────────────────────────────────
  const startRecording = async () => {
    setMicError(null);
    setRecordedUrl(null);
    setXpAwarded(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      startTimeRef.current = Date.now();
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration(Math.round((Date.now() - startTimeRef.current) / 1000));
      }, 500);

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        clearInterval(timerRef.current!);
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
        setRecording(false);

        const durationSec = Math.round((Date.now() - startTimeRef.current) / 1000);
        try {
          const res = await fetch("/api/voice-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ durationSec }),
          });
          if (res.ok) {
            const data = await res.json();
            setXpAwarded(data.xpEarned ?? null);
          }
        } catch {/* silent */}
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);

      autoStopRef.current = setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, 8000);
    } catch {
      setMicError("Microphone access denied. Allow mic access in your browser settings.");
    }
  };

  const stopRecording = () => {
    if (autoStopRef.current) clearTimeout(autoStopRef.current);
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const playRecording = () => {
    if (!recordedUrl) return;
    new Audio(recordedUrl).play().catch(() => {});
  };

  return (
    <>
      {/* Tip */}
      <div style={{
        display: "flex", alignItems: "flex-start", gap: 12,
        background: "var(--accent-dim)", borderRadius: 14, padding: "14px 16px",
        marginBottom: 24, border: "1px solid rgba(16,185,129,0.2)",
      }}>
        <span style={{ fontSize: 18 }}>♪</span>
        <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>
          <span style={{ fontWeight: 700, color: "var(--text)" }}>How to practice:</span> Click a word to hear it, then hit{" "}
          <span style={{ fontWeight: 700 }}>Record</span> to compare your pronunciation.
        </p>
      </div>

      {/* Controls */}
      <div style={{ background: "var(--surface-2)", borderRadius: 16, border: "1px solid var(--border-md)", padding: "18px 20px", marginBottom: 24 }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 16 }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
              Speed
            </label>
            <div style={{ display: "flex", gap: 6 }}>
              {([
                { label: "0.75×", value: 0.75 },
                { label: "1×",    value: 1.0  },
                { label: "1.25×", value: 1.25 },
              ] as const).map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSpeed(s.value)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: "var(--font-mono)",
                    border: `1px solid ${speed === s.value ? "var(--accent)" : "var(--border)"}`,
                    background: speed === s.value ? "var(--accent-dim)" : "var(--surface-3)",
                    color: speed === s.value ? "var(--accent-2)" : "var(--text-2)",
                    cursor: "pointer",
                    transition: "all 0.12s",
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Currently selected word + recording panel */}
      {currentWord && (
        <div style={{
          background: "var(--surface-2)", borderRadius: 16, padding: "18px 20px", marginBottom: 24,
          border: "1px solid rgba(16,185,129,0.35)", boxShadow: "0 0 24px rgba(16,185,129,0.1)",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, flexShrink: 0,
              background: "var(--accent-dim)", border: "1px solid rgba(16,185,129,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
            }}>
              {currentWord.imageEmoji}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <p style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>
                  {currentWord.word}
                </p>
                {ttsStatus === "loading" && (
                  <span style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600 }}>
                    Loading…
                  </span>
                )}
                {ttsStatus === "playing" && (
                  <span style={{ fontSize: 11, color: "var(--accent-2)", fontWeight: 600, animation: "pulse 1s infinite" }}>
                    Playing…
                  </span>
                )}
              </div>
              <p style={{ fontSize: 14, color: "var(--accent-2)", fontWeight: 600, marginTop: 2 }}>{currentWord.translation}</p>
              <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 4, fontStyle: "italic" }}>&ldquo;{currentWord.exampleFr}&rdquo;</p>
              <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>{currentWord.exampleEn}</p>
            </div>

            {/* Playback buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
              <button onClick={() => speakText(currentWord.word)} className="btn-primary" style={{ fontSize: 13, padding: "7px 14px" }} disabled={playing}>
                <Volume2 size={14} style={{ display: "inline", marginRight: 4 }} />Word
              </button>
              <button onClick={() => speakText(currentWord.exampleFr)} className="btn-secondary" style={{ fontSize: 13, padding: "7px 14px" }} disabled={playing}>
                <Volume2 size={14} style={{ display: "inline", marginRight: 4 }} />Example
              </button>
            </div>
          </div>

          {/* Recording row */}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
              🎙 Your pronunciation
            </p>

            {micError && (
              <p style={{ fontSize: 12, color: "var(--red)", marginBottom: 8 }}>{micError}</p>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              {!recording ? (
                <button
                  onClick={startRecording}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 16px", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer",
                    background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.3)", color: "var(--red)",
                  }}
                >
                  <Mic size={15} /> Record yourself
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 16px", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer",
                    background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", color: "var(--red)",
                    animation: "pulse 1s infinite",
                  }}
                >
                  <Square size={13} fill="#ef4444" /> Stop ({recordingDuration}s)
                </button>
              )}

              {recording && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <WaveformBars active={true} />
                  <span style={{ fontSize: 12, color: "var(--red)", fontWeight: 600 }}>Recording…</span>
                </div>
              )}

              {recordedUrl && !recording && (
                <button
                  onClick={playRecording}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 16px", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer",
                    background: "var(--accent-dim)", border: "1px solid rgba(16,185,129,0.3)", color: "var(--accent-2)",
                  }}
                >
                  <Play size={13} /> Play back
                </button>
              )}

              {xpAwarded && (
                <span style={{
                  fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 999,
                  background: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.3)", color: "var(--green)",
                }}>
                  +{xpAwarded} XP
                </span>
              )}
            </div>

            {recordedUrl && !recording && (
              <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 8 }}>
                Compare: does it sound like the native pronunciation above?
              </p>
            )}
          </div>
        </div>
      )}

      {/* Word list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map((word) => {
          const isActive = currentWord?.id === word.id;
          return (
            <div
              key={word.id}
              style={{
                background: isActive ? "var(--surface-3)" : "var(--surface-2)",
                borderRadius: 16, border: `1px solid ${isActive ? "rgba(16,185,129,0.35)" : "var(--border)"}`,
                padding: "12px 16px", display: "flex", alignItems: "center", gap: 12,
                cursor: "pointer", transition: "all 0.12s",
              }}
              onClick={() => playWord(word)}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: "var(--surface-3)", border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
              }}>
                {word.imageEmoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{word.word}</span>
                  <span style={{ fontSize: 13, color: "var(--accent-2)" }}>{word.translation}</span>
                </div>
                <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{word.exampleFr}</p>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button
                  onClick={(e) => { e.stopPropagation(); playWord(word); }}
                  style={{
                    width: 32, height: 32, borderRadius: 9,
                    background: "var(--accent-dim)", color: "var(--accent-2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "1px solid rgba(16,185,129,0.2)", cursor: "pointer",
                  }}
                  title="Listen to word"
                >
                  <Volume2 size={14} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); playExample(word); }}
                  style={{
                    width: 32, height: 32, borderRadius: 9,
                    background: "var(--surface-3)", color: "var(--text-2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "1px solid var(--border)", cursor: "pointer", fontSize: 13,
                  }}
                  title="Listen to example"
                >
                  ◈
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "64px 0", color: "var(--text-3)" }}>
          <p style={{ fontSize: 24, marginBottom: 8 }}>♪</p>
          <p style={{ fontSize: 14 }}>No words found in this category</p>
        </div>
      )}
    </>
  );
}
