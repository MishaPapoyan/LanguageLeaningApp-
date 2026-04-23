import { NextRequest, NextResponse } from "next/server";

/**
 * TTS priority chain (server-side):
 *  1. OpenAI TTS HD  — best quality, natural pronunciation (requires OPENAI_API_KEY)
 *  2. Mistral Voxtral — native-speaker voices per language (requires MISTRAL_API_KEY)
 *  3. 503 → client falls back to Web Speech API
 */

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=604800, immutable", // 7 days
};

// ─── OpenAI TTS ───────────────────────────────────────────────────────────────

async function openaiTTS(text: string, lang: string): Promise<ArrayBuffer | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  // Best voices per language for clear educational pronunciation
  const VOICES: Record<string, string> = {
    fr: "nova",   // clear, warm French
    es: "nova",   // clear Spanish
    en: "alloy",
  };
  const prefix = lang.split(/[-_]/)[0].toLowerCase();
  const voice = VOICES[prefix] ?? "nova";

  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "tts-1-hd",
      input: text,
      voice,
      response_format: "mp3",
      speed: 0.9, // slightly slower for learning
    }),
  });

  if (!res.ok) {
    console.error("[TTS/openai] error:", res.status, await res.text());
    return null;
  }
  return res.arrayBuffer();
}

// ─── Mistral Voxtral ──────────────────────────────────────────────────────────

async function mistralTTS(text: string, lang: string): Promise<ArrayBuffer | null> {
  const key = process.env.MISTRAL_API_KEY;
  if (!key) return null;

  const VOICE_IDS: Record<string, string> = {
    fr: "a249eaff-1b96-4ce2-a3e7-b2c9b43c4b9a",
    es: "0a4aa596-c999-4922-afae-9fb3a2d85e9e",
  };
  const prefix = lang.split(/[-_]/)[0].toLowerCase();
  const voiceId = VOICE_IDS[prefix];

  const body: Record<string, unknown> = {
    model: "voxtral-mini-tts-2603",
    input: text,
    response_format: "mp3",
  };
  if (voiceId) body.voice_id = voiceId;

  const res = await fetch("https://api.mistral.ai/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error("[TTS/mistral] error:", res.status, await res.text());
    return null;
  }

  // Mistral may return binary audio or base64 JSON — handle both
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("audio") || contentType.includes("octet")) {
    return res.arrayBuffer();
  }
  try {
    const json = await res.json();
    if (json.audio_data) return Buffer.from(json.audio_data, "base64");
  } catch {
    // not JSON
  }
  return null;
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { text, lang = "fr" } = await req.json();
  if (!text?.trim()) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  const langPrefix = lang.split(/[-_]/)[0].toLowerCase();

  // 1. OpenAI (best quality)
  const openaiAudio = await openaiTTS(text.trim(), langPrefix);
  if (openaiAudio) {
    return new NextResponse(openaiAudio, {
      headers: { "Content-Type": "audio/mpeg", ...CACHE_HEADERS },
    });
  }

  // 2. Mistral Voxtral
  const mistralAudio = await mistralTTS(text.trim(), langPrefix);
  if (mistralAudio) {
    return new NextResponse(mistralAudio, {
      headers: { "Content-Type": "audio/mpeg", ...CACHE_HEADERS },
    });
  }

  // 3. No server TTS available — client will use Web Speech API
  return NextResponse.json({ error: "No TTS provider available" }, { status: 503 });
}
