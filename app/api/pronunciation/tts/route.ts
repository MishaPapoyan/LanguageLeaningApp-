import { NextRequest, NextResponse } from "next/server";

/**
 * TTS priority chain (server-side):
 *  1. ElevenLabs eleven_multilingual_v2 — best quality, genuine native accent
 *  2. OpenAI tts-1-hd                  — very good, natural pronunciation
 *  3. Mistral Voxtral                  — decent, fixed binary response parsing
 *  4. 503 → client falls back to Web Speech API
 */

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=604800, immutable", // 7 days
};

// ─── ElevenLabs ───────────────────────────────────────────────────────────────
// eleven_multilingual_v2 produces genuine native-accent output for any language.
// Voice IDs below are ElevenLabs pre-made voices tuned for European languages.
// You can swap these for any voice from your ElevenLabs library.

const EL_VOICES: Record<string, string> = {
  fr: "cgSgspJ2msm6clMCkdW9", // Jessica (multilingual, natural French accent)
  es: "EXAVITQu4vr4xnSDxMaL", // Bella (multilingual, clear Spanish)
  default: "21m00Tcm4TlvDq8ikWAM", // Rachel — neutral, excellent multilingual
};

async function elevenLabsTTS(text: string, lang: string): Promise<ArrayBuffer | null> {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return null;

  const voiceId = EL_VOICES[lang] ?? EL_VOICES.default;

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": key,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.45,        // slightly lower = more expressive/natural
          similarity_boost: 0.80,
          style: 0.15,            // adds natural expressiveness
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!res.ok) {
    console.error("[TTS/elevenlabs] error:", res.status, await res.text());
    return null;
  }
  return res.arrayBuffer();
}

// ─── OpenAI TTS ───────────────────────────────────────────────────────────────

async function openaiTTS(text: string, lang: string): Promise<ArrayBuffer | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "tts-1-hd",
      input: text,
      voice: "nova",
      response_format: "mp3",
      speed: 0.9,
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

  const body: Record<string, unknown> = {
    model: "voxtral-mini-tts-2603",
    input: text,
    response_format: "mp3",
  };
  if (VOICE_IDS[lang]) body.voice_id = VOICE_IDS[lang];

  const res = await fetch("https://api.mistral.ai/v1/audio/speech", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error("[TTS/mistral] error:", res.status, await res.text());
    return null;
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("audio") || contentType.includes("octet")) {
    return res.arrayBuffer();
  }
  try {
    const json = await res.json();
    if (json.audio_data) {
      const buf = Buffer.from(json.audio_data, "base64");
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
    }
  } catch { /* not JSON */ }
  return null;
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { text, lang = "fr" } = await req.json();
  if (!text?.trim()) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  const langPrefix = lang.split(/[-_]/)[0].toLowerCase();
  const t = text.trim();

  const audio =
    (await elevenLabsTTS(t, langPrefix)) ??
    (await openaiTTS(t, langPrefix)) ??
    (await mistralTTS(t, langPrefix));

  if (audio) {
    return new NextResponse(audio, {
      headers: { "Content-Type": "audio/mpeg", ...CACHE_HEADERS },
    });
  }

  return NextResponse.json({ error: "No TTS provider available" }, { status: 503 });
}
