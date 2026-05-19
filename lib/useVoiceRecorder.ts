"use client";

import { useRef, useState, useCallback } from "react";

export type RecorderState = "idle" | "recording" | "processing";

interface Options {
  lang: string;
  silenceMs?: number;       // ms of silence before auto-stop (default 1800)
  silenceThreshold?: number; // RMS threshold 0-1 (default 0.01)
  onTranscript?: (text: string) => void;
  onStateChange?: (state: RecorderState) => void;
  onError?: (msg: string) => void;
}

export function useVoiceRecorder({
  lang,
  silenceMs = 1800,
  silenceThreshold = 0.012,
  onTranscript,
  onStateChange,
  onError,
}: Options) {
  const [state, setState] = useState<RecorderState>("idle");
  const mediaRef     = useRef<MediaRecorder | null>(null);
  const chunksRef    = useRef<Blob[]>([]);
  const audioCtxRef  = useRef<AudioContext | null>(null);
  const analyserRef  = useRef<AnalyserNode | null>(null);
  const silenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef       = useRef<number | null>(null);
  const streamRef    = useRef<MediaStream | null>(null);

  const setS = useCallback((s: RecorderState) => {
    setState(s);
    onStateChange?.(s);
  }, [onStateChange]);

  const stopAndTranscribe = useCallback(async () => {
    // Stop silence detection
    if (silenceTimer.current) { clearTimeout(silenceTimer.current); silenceTimer.current = null; }
    if (rafRef.current)        { cancelAnimationFrame(rafRef.current); rafRef.current = null; }

    const recorder = mediaRef.current;
    if (!recorder || recorder.state === "inactive") return;

    return new Promise<void>((resolve) => {
      recorder.onstop = async () => {
        setS("processing");

        const mimeType = chunksRef.current[0]?.type || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });
        chunksRef.current = [];

        // Clean up audio context
        audioCtxRef.current?.close();
        audioCtxRef.current = null;
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;

        if (blob.size < 1000) {
          // Too short — skip transcription
          setS("idle");
          resolve();
          return;
        }

        try {
          const ext  = mimeType.includes("ogg") ? "ogg" : mimeType.includes("mp4") ? "mp4" : "webm";
          const file = new File([blob], `recording.${ext}`, { type: mimeType });
          const form = new FormData();
          form.append("audio", file);
          form.append("lang", lang);

          const res  = await fetch("/api/transcribe", { method: "POST", body: form });
          const data = await res.json();

          if (data.text?.trim()) {
            onTranscript?.(data.text.trim());
          }
        } catch {
          onError?.("Transcription failed — please try again.");
        } finally {
          setS("idle");
          resolve();
        }
      };

      recorder.stop();
    });
  }, [lang, onTranscript, onError, setS]);

  // Watch audio level — auto-stop on silence
  const watchSilence = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const buf = new Float32Array(analyser.fftSize);

    const tick = () => {
      analyser.getFloatTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
      const rms = Math.sqrt(sum / buf.length);

      if (rms < silenceThreshold) {
        if (!silenceTimer.current) {
          silenceTimer.current = setTimeout(() => {
            stopAndTranscribe();
          }, silenceMs);
        }
      } else {
        if (silenceTimer.current) {
          clearTimeout(silenceTimer.current);
          silenceTimer.current = null;
        }
      }

      if (mediaRef.current?.state === "recording") {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [silenceMs, silenceThreshold, stopAndTranscribe]);

  const start = useCallback(async () => {
    if (state !== "idle") return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up analyser for silence detection
      const ctx      = new AudioContext();
      const src      = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;

      // Pick best supported mime type
      const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"]
        .find(t => MediaRecorder.isTypeSupported(t)) ?? "";

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRef.current  = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.start(100); // collect in 100ms chunks

      setS("recording");
      watchSilence();
    } catch (err: any) {
      onError?.(err?.message ?? "Microphone access denied");
      setS("idle");
    }
  }, [state, watchSilence, onError, setS]);

  const stop = useCallback(() => {
    if (state === "recording") stopAndTranscribe();
  }, [state, stopAndTranscribe]);

  const cancel = useCallback(() => {
    if (silenceTimer.current) { clearTimeout(silenceTimer.current); silenceTimer.current = null; }
    if (rafRef.current)       { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    mediaRef.current?.stop();
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    chunksRef.current = [];
    setS("idle");
  }, [setS]);

  return { state, start, stop, cancel, isRecording: state === "recording", isProcessing: state === "processing" };
}
