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
  const [speed, setSpeed] = useState<number>(0.7);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [playing, setPlaying] = useState(false);

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

  // Clear old recording when switching words
  useEffect(() => {
    setRecordedUrl(null);
    setMicError(null);
    setXpAwarded(null);
  }, [currentWord?.id]);

  const filtered = selectedCategory
    ? words.filter((w) => w.category === selectedCategory)
    : words;

  const speakText = useCallback((text: string, lang = ttsLocale) => {
    setPlaying(true);
    speak(text, {
      lang,
      rate: speed,
      onEnd: () => setPlaying(false),
      onError: () => setPlaying(false),
    });
  }, [speed, ttsLocale]);

  const playWord = (word: Word) => {
    setCurrentWord(word);
    speakText(word.word);
  };

  const playExample = (word: Word) => {
    setCurrentWord(word);
    speak(word.exampleFr);
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

      // Auto-stop after 8s
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
      <div className="flex items-start gap-3 bg-violet-50 rounded-xl p-4 mb-6 ring-1 ring-violet-100">
        <span className="text-lg">♪</span>
        <p className="text-sm text-violet-800">
          <span className="font-semibold">How to practice:</span> Click a word to hear it, then hit{" "}
          <span className="font-semibold">Record</span> to compare your pronunciation.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-5 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Category</label>
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
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">
              Speed: {speed <= 0.5 ? "Slow" : speed <= 0.75 ? "Normal" : "Fast"}
            </label>
            <input
              type="range" min={0.3} max={1.0} step={0.1} value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full accent-violet-500"
            />
            <div className="flex justify-between text-[11px] text-zinc-400 mt-0.5">
              <span>Slow</span><span>Fast</span>
            </div>
          </div>
        </div>
      </div>

      {/* Currently selected word + recording panel */}
      {currentWord && (
        <div className="bg-white rounded-2xl border-2 border-violet-200 p-5 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-violet-50 flex items-center justify-center text-3xl flex-shrink-0">
              {currentWord.imageEmoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-2xl font-serif text-zinc-900">{currentWord.word}</p>
                {playing && <span className="text-violet-600 text-xs animate-pulse font-medium">Playing…</span>}
              </div>
              <p className="text-violet-600 font-medium">{currentWord.translation}</p>
              <p className="text-sm text-zinc-500 mt-1 italic">&ldquo;{currentWord.exampleFr}&rdquo;</p>
              <p className="text-xs text-zinc-400">{currentWord.exampleEn}</p>
            </div>

            {/* Playback buttons */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              <button onClick={() => speakText(currentWord.word)} className="btn-primary text-sm px-3 py-2" disabled={playing}>
                <Volume2 size={14} className="inline mr-1" />Word
              </button>
              <button onClick={() => speakText(currentWord.exampleFr)} className="btn-outline text-sm px-3 py-2" disabled={playing}>
                <Volume2 size={14} className="inline mr-1" />Example
              </button>
            </div>
          </div>

          {/* Recording row */}
          <div className="mt-4 pt-4 border-t border-zinc-100">
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              🎙 Your pronunciation
            </p>

            {micError && (
              <p className="text-xs text-red-500 mb-2">{micError}</p>
            )}

            <div className="flex items-center gap-3 flex-wrap">
              {!recording ? (
                <button
                  onClick={startRecording}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    color: "#ef4444",
                  }}
                >
                  <Mic size={15} /> Record yourself
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{
                    background: "rgba(239,68,68,0.15)",
                    border: "1px solid rgba(239,68,68,0.4)",
                    color: "#ef4444",
                    animation: "pulse 1s infinite",
                  }}
                >
                  <Square size={13} fill="#ef4444" /> Stop ({recordingDuration}s)
                </button>
              )}

              {recording && (
                <div className="flex items-center gap-2">
                  <WaveformBars active={true} />
                  <span className="text-xs text-red-500 font-medium">Recording…</span>
                </div>
              )}

              {recordedUrl && !recording && (
                <button
                  onClick={playRecording}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{
                    background: "rgba(99,102,241,0.1)",
                    border: "1px solid rgba(99,102,241,0.3)",
                    color: "var(--accent)",
                  }}
                >
                  <Play size={13} /> Play back
                </button>
              )}

              {xpAwarded && (
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{
                    background: "rgba(52,211,153,0.1)",
                    border: "1px solid rgba(52,211,153,0.3)",
                    color: "var(--green)",
                  }}
                >
                  +{xpAwarded} XP
                </span>
              )}
            </div>

            {recordedUrl && !recording && (
              <p className="text-xs text-zinc-400 mt-2">
                Compare: does it sound like the native pronunciation above?
              </p>
            )}
          </div>
        </div>
      )}

      {/* Word list */}
      <div className="space-y-2">
        {filtered.map((word) => (
          <div
            key={word.id}
            className={`bg-white rounded-2xl border p-4 flex items-center gap-3 cursor-pointer transition-all hover:shadow-sm ${
              currentWord?.id === word.id ? "border-violet-300 bg-violet-50/30" : "border-zinc-100 hover:border-zinc-200"
            }`}
            onClick={() => playWord(word)}
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-xl flex-shrink-0">
              {word.imageEmoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-zinc-800">{word.word}</span>
                <span className="text-sm text-violet-600">{word.translation}</span>
              </div>
              <p className="text-[11px] text-zinc-400 truncate mt-0.5">{word.exampleFr}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); playWord(word); }}
                className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center hover:bg-violet-100 transition-colors"
                title="Listen to word"
              >
                <Volume2 size={14} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); playExample(word); }}
                className="w-8 h-8 rounded-lg bg-zinc-50 text-zinc-500 flex items-center justify-center hover:bg-zinc-100 transition-colors text-sm"
                title="Listen to example"
              >
                ◈
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-zinc-400">
          <p className="text-2xl mb-2">♪</p>
          <p>No words found in this category</p>
        </div>
      )}
    </>
  );
}
