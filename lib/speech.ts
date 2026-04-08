/**
 * Speech synthesis utility.
 *
 * Priority chain:
 *  1. Mistral Voxtral TTS — phrases/sentences (3+ words) via /api/pronunciation/tts
 *  2. Web Speech API      — single words and universal fallback
 *
 * NOTE: Google Translate TTS (translate.google.com/translate_tts) was previously
 * the second tier but uses an unofficial endpoint that Google can break at any time.
 * Removed in favour of the stable Web Speech API.
 */

export interface SpeakOptions {
  lang?: string;
  /** 0.5 = slow, 0.85 = natural learning pace, 1.0 = native speed */
  rate?: number;
  pitch?: number;
  volume?: number;
  onEnd?: () => void;
  onError?: () => void;
}

// ─── Audio helpers ────────────────────────────────────────────────────────────

let currentAudio: HTMLAudioElement | null = null;

function stopCurrentAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = "";
    currentAudio = null;
  }
}

function playAudioUrl(
  url: string,
  volume: number,
  onEnd?: () => void,
  onError?: () => void
): Promise<boolean> {
  return new Promise((resolve) => {
    stopCurrentAudio();
    const audio = new Audio(url);
    audio.volume = volume;
    currentAudio = audio;
    audio.onended = () => { currentAudio = null; onEnd?.(); resolve(true); };
    audio.onerror = () => { currentAudio = null; resolve(false); };
    audio.play().catch(() => resolve(false));
  });
}

// ─── Mistral Voxtral TTS ──────────────────────────────────────────────────────

// Client-side blob URL cache so we don't re-request the same text
const voxtralCache = new Map<string, string>();

async function speakViaVoxtral(
  text: string,
  volume: number,
  onEnd?: () => void,
  onError?: () => void
): Promise<boolean> {
  const cacheKey = text.trim().toLowerCase();
  let blobUrl = voxtralCache.get(cacheKey);

  if (!blobUrl) {
    try {
      const res = await fetch("/api/pronunciation/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });
      if (!res.ok) return false;
      const blob = await res.blob();
      blobUrl = URL.createObjectURL(blob);
      voxtralCache.set(cacheKey, blobUrl);
    } catch {
      return false;
    }
  }

  return playAudioUrl(blobUrl, volume, onEnd, onError);
}

// ─── Web Speech API (fallback for single words and Voxtral outages) ──────────

const PREFERRED_FR_VOICE_FRAGMENTS = ["Hortense", "Julie", "Henri", "français", "French"];
const PREFERRED_EN_VOICE_FRAGMENTS = ["Aria", "Jenny", "Guy", "Davis", "Sonia", "Ryan", "Neural"];

const VOICE_TIERS: Array<(name: string) => boolean> = [
  (n) => n.includes("Microsoft") && n.includes("Natural"),
  (n) => n.startsWith("Google"),
  (n) => n.includes("Microsoft") && n.includes("Online"),
  (n) => n.includes("Enhanced"),
  (n) => n.includes("Compact"),
];

let cachedVoices: SpeechSynthesisVoice[] | null = null;
let loadPromise: Promise<SpeechSynthesisVoice[]> | null = null;

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (loadPromise) return loadPromise;
  loadPromise = new Promise<SpeechSynthesisVoice[]>((resolve) => {
    const immediate = window.speechSynthesis.getVoices();
    if (immediate.length > 0) { resolve(immediate); return; }
    let resolved = false;
    let timeoutId: ReturnType<typeof setTimeout>;
    const handler = () => {
      if (resolved) return;
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) {
        resolved = true;
        clearTimeout(timeoutId);
        window.speechSynthesis.removeEventListener("voiceschanged", handler);
        resolve(v);
      }
    };
    window.speechSynthesis.addEventListener("voiceschanged", handler);
    timeoutId = setTimeout(() => {
      if (resolved) return;
      resolved = true;
      window.speechSynthesis.removeEventListener("voiceschanged", handler);
      resolve(window.speechSynthesis.getVoices());
    }, 2000);
  });
  return loadPromise;
}

async function getVoices(): Promise<SpeechSynthesisVoice[]> {
  if (cachedVoices && cachedVoices.length > 0) return cachedVoices;
  const voices = await loadVoices();
  if (voices.length > 0) cachedVoices = voices;
  return voices;
}

function pickBestVoice(voices: SpeechSynthesisVoice[], lang: string): SpeechSynthesisVoice | null {
  const prefix = lang.toLowerCase().split("-")[0];
  const candidates = voices.filter((v) => v.lang.toLowerCase().startsWith(prefix));
  if (candidates.length === 0) return null;
  const preferred = prefix === "fr" ? PREFERRED_FR_VOICE_FRAGMENTS : PREFERRED_EN_VOICE_FRAGMENTS;
  for (const fragment of preferred) {
    const match = candidates.find((v) => v.name.includes(fragment));
    if (match) return match;
  }
  for (const test of VOICE_TIERS) {
    const match = candidates.find((v) => test(v.name));
    if (match) return match;
  }
  return candidates.find((v) => !v.localService) ?? candidates[0] ?? null;
}

function speakViaWebSpeech(
  text: string,
  opts: Required<Pick<SpeakOptions, "lang" | "rate" | "pitch" | "volume">> & SpeakOptions,
  voice: SpeechSynthesisVoice | null
): void {
  const chunks = text.length < 60 || !text.match(/[.!?;,—]/)
    ? [text]
    : text.split(/(?<=[.!?;,—])\s+/).map((s) => s.trim()).filter(Boolean);
  let i = 0;
  function next() {
    if (i >= chunks.length) { opts.onEnd?.(); return; }
    const utt = new SpeechSynthesisUtterance(chunks[i]);
    utt.lang = opts.lang; utt.rate = opts.rate; utt.pitch = opts.pitch; utt.volume = opts.volume;
    if (voice) utt.voice = voice;
    utt.onend = () => { i++; next(); };
    utt.onerror = (e) => { if (e.error !== "interrupted") opts.onError?.(); };
    window.speechSynthesis.speak(utt);
  }
  next();
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function speak(text: string, options: SpeakOptions = {}): Promise<void> {
  const {
    lang = "fr-FR",
    rate = 0.88,
    pitch = 1.0,
    volume = 0.95,
    onEnd,
    onError,
  } = options;

  stopCurrentAudio();
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();

  // Voxtral is generative — it hallucinates extra speech around single words.
  // Only use it for phrases/sentences (3+ words); Google TTS handles the rest.
  const wordCount = text.trim().split(/\s+/).length;

  if (wordCount >= 3) {
    // 1. Mistral Voxtral — best quality for phrases and sentences
    const voxtralOk = await speakViaVoxtral(text, volume, onEnd, onError);
    if (voxtralOk) return;
  }

  // 2. Web Speech API — handles single words and acts as universal fallback
  if (!("speechSynthesis" in window)) { onError?.(); return; }
  const voices = await getVoices();
  const voice = pickBestVoice(voices, lang);
  speakViaWebSpeech(text, { lang, rate, pitch, volume, onEnd, onError }, voice);
}

/** Speak French text at a natural learning pace */
export function speakFr(
  text: string,
  rate = 0.88,
  callbacks?: { onEnd?: () => void; onError?: () => void }
) {
  return speak(text, { lang: "fr-FR", rate, pitch: 1.0, ...callbacks });
}

/** Speak English text */
export function speakEn(text: string, callbacks?: { onEnd?: () => void; onError?: () => void }) {
  return speak(text, { lang: "en-US", rate: 0.92, pitch: 1.0, ...callbacks });
}
