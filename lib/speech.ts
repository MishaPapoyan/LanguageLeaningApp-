/**
 * Speech synthesis utility.
 *
 * Priority chain:
 *  1. Server TTS (/api/pronunciation/tts)
 *       → OpenAI tts-1-hd   if OPENAI_API_KEY is set  (best quality)
 *       → Mistral Voxtral   if MISTRAL_API_KEY is set  (native voices)
 *  2. Web Speech API — universal browser fallback
 */

export interface SpeakOptions {
  lang?: string;
  /** 0.5 = slow, 0.85 = natural learning pace, 1.0 = native speed */
  rate?: number;
  pitch?: number;
  volume?: number;
  /** Called as soon as the fetch starts (before audio is ready) */
  onLoading?: () => void;
  /** Called the moment audio begins playing */
  onPlaying?: () => void;
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

// Client-side blob URL cache so we don't re-request the same text.
// LOW-13: Cap at MAX_VOXTRAL_CACHE entries using FIFO eviction to prevent
// unbounded memory growth from blob URLs accumulating over a session.
const MAX_VOXTRAL_CACHE = 50;
const voxtralCache = new Map<string, string>();

async function speakViaVoxtral(
  text: string,
  lang: string,
  volume: number,
  onLoading?: () => void,
  onPlaying?: () => void,
  onEnd?: () => void,
  onError?: () => void
): Promise<boolean> {
  const cacheKey = `${lang}:${text.trim().toLowerCase()}`;
  let blobUrl = voxtralCache.get(cacheKey);

  if (!blobUrl) {
    onLoading?.();
    try {
      const res = await fetch("/api/pronunciation/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), lang }),
      });
      if (!res.ok) return false;
      const blob = await res.blob();
      blobUrl = URL.createObjectURL(blob);
      // Evict oldest entry (Maps iterate in insertion order)
      if (voxtralCache.size >= MAX_VOXTRAL_CACHE) {
        const oldestKey = voxtralCache.keys().next().value as string;
        const oldUrl = voxtralCache.get(oldestKey);
        if (oldUrl) URL.revokeObjectURL(oldUrl);
        voxtralCache.delete(oldestKey);
      }
      voxtralCache.set(cacheKey, blobUrl);
    } catch {
      return false;
    }
  }

  onPlaying?.();
  return playAudioUrl(blobUrl, volume, onEnd, onError);
}

// ─── Web Speech API (fallback for single words and Voxtral outages) ──────────

const PREFERRED_VOICE_FRAGMENTS: Record<string, string[]> = {
  fr: ["Hortense", "Julie", "Henri", "français", "French"],
  es: ["Elvira", "Jorge", "español", "Spanish", "Microsoft Pablo"],
  en: ["Aria", "Jenny", "Guy", "Davis", "Sonia", "Ryan", "Neural"],
};

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
  const preferred = PREFERRED_VOICE_FRAGMENTS[prefix] ?? PREFERRED_VOICE_FRAGMENTS["en"];
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

// ─── Sentence-by-sentence TTS ────────────────────────────────────────────────

function splitSentences(text: string): string[] {
  // Split at sentence-ending punctuation; keep short fragments together
  const parts = text.split(/(?<=[.!?…])\s+/).map(s => s.trim()).filter(Boolean);
  // Merge very short fragments (<= 6 chars) with the next sentence
  const merged: string[] = [];
  for (const p of parts) {
    if (merged.length > 0 && merged[merged.length - 1].length <= 6) {
      merged[merged.length - 1] += " " + p;
    } else {
      merged.push(p);
    }
  }
  return merged.length > 0 ? merged : [text.trim()];
}

async function fetchTTSBlob(text: string, lang: string): Promise<string | null> {
  const cacheKey = `${lang}:${text.trim().toLowerCase()}`;
  const cached = voxtralCache.get(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch("/api/pronunciation/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.trim(), lang }),
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    if (voxtralCache.size >= MAX_VOXTRAL_CACHE) {
      const oldestKey = voxtralCache.keys().next().value as string;
      const oldUrl = voxtralCache.get(oldestKey);
      if (oldUrl) URL.revokeObjectURL(oldUrl);
      voxtralCache.delete(oldestKey);
    }
    voxtralCache.set(cacheKey, blobUrl);
    return blobUrl;
  } catch {
    return null;
  }
}

/**
 * Speak text in sentence-by-sentence chunks for minimal latency.
 * Fetches TTS for each sentence sequentially; while sentence N plays,
 * sentence N+1 is pre-fetched so transitions are seamless.
 */
export async function speakChunked(text: string, options: SpeakOptions = {}): Promise<void> {
  const {
    lang = "fr-FR",
    rate = 0.88,
    pitch = 1.0,
    volume = 0.95,
    onLoading,
    onPlaying,
    onEnd,
    onError,
  } = options;

  stopCurrentAudio();
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();

  const sentences = splitSentences(text);
  if (sentences.length === 0) { onEnd?.(); return; }

  let playingStarted = false;
  let prefetchPromise: Promise<string | null> | null = null;

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const isLast = i === sentences.length - 1;

    // Signal loading on first sentence
    if (i === 0) onLoading?.();

    // Use pre-fetched result if available, otherwise fetch now
    const blobUrl = prefetchPromise
      ? await prefetchPromise
      : await fetchTTSBlob(sentence, lang ?? "fr-FR");

    // Pre-fetch next sentence in parallel while current plays
    if (!isLast) {
      prefetchPromise = fetchTTSBlob(sentences[i + 1], lang ?? "fr-FR");
    } else {
      prefetchPromise = null;
    }

    if (!playingStarted) { onPlaying?.(); playingStarted = true; }

    if (blobUrl) {
      // Play this sentence; await completion before next sentence
      await new Promise<void>((resolve) => {
        playAudioUrl(blobUrl, volume,
          () => resolve(),
          () => resolve()  // on error, continue to next sentence
        );
      });
    } else {
      // Server TTS unavailable for this sentence — use Web Speech
      const voices = cachedVoices ?? [];
      const voice = voices.length > 0 ? pickBestVoice(voices, lang ?? "fr") : null;
      await new Promise<void>((resolve) => {
        speakViaWebSpeech(sentence, { lang, rate, pitch, volume, onEnd: resolve, onError: resolve }, voice);
      });
    }
  }

  onEnd?.();
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function speak(text: string, options: SpeakOptions = {}): Promise<void> {
  const {
    lang = "fr-FR",
    rate = 0.88,
    pitch = 1.0,
    volume = 0.95,
    onLoading,
    onPlaying,
    onEnd,
    onError,
  } = options;

  stopCurrentAudio();
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();

  // 1. Server TTS (ElevenLabs → OpenAI → Mistral, whichever key is configured)
  const serverOk = await speakViaVoxtral(text, lang, volume, onLoading, onPlaying, onEnd, onError);
  if (serverOk) return;

  // 2. Web Speech API — handles single words and acts as universal fallback
  if (!("speechSynthesis" in window)) { onError?.(); return; }
  const voices = await getVoices();
  const voice = pickBestVoice(voices, lang);
  speakViaWebSpeech(text, { lang, rate, pitch, volume, onEnd, onError }, voice);
}

/** Map target-language code (fr/es/en/...) to a BCP-47 locale for speech synthesis */
function toLocale(lang: string): string {
  const prefix = lang.toLowerCase().split(/[-_]/)[0];
  const map: Record<string, string> = {
    fr: "fr-FR",
    es: "es-ES",
    en: "en-US",
    de: "de-DE",
    it: "it-IT",
    pt: "pt-PT",
    ja: "ja-JP",
    ko: "ko-KR",
    zh: "zh-CN",
    ru: "ru-RU",
  };
  return map[prefix] ?? lang;
}

/** Speak text in the user's target language at a natural learning pace */
export function speakTarget(
  text: string,
  targetLang: string,
  rate = 0.88,
  callbacks?: { onLoading?: () => void; onPlaying?: () => void; onEnd?: () => void; onError?: () => void }
) {
  return speak(text, { lang: toLocale(targetLang), rate, pitch: 1.0, ...callbacks });
}

/** Sentence-chunked version of speakTarget — lower latency for long AI responses */
export function speakTargetChunked(
  text: string,
  targetLang: string,
  rate = 0.92,
  callbacks?: { onLoading?: () => void; onPlaying?: () => void; onEnd?: () => void; onError?: () => void }
) {
  return speakChunked(text, { lang: toLocale(targetLang), rate, pitch: 1.0, ...callbacks });
}

/** Speak French text at a natural learning pace (legacy — prefer speakTarget) */
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
