import { NextRequest, NextResponse } from "next/server";

// POST /api/pronunciation/tts
// Body: { text: string, lang?: string }
// Returns audio/mpeg binary so the client can play it directly via a Blob URL

export async function POST(req: NextRequest) {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Mistral API key not configured" }, { status: 503 });
  }

  const { text, lang = "fr" } = await req.json();
  if (!text?.trim()) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  // Language-specific native speaker voices
  const VOICE_IDS: Record<string, string> = {
    fr: "a249eaff-1b96-4ce2-a3e7-b2c9b43c4b9a", // French native
    es: "0a4aa596-c999-4922-afae-9fb3a2d85e9e", // Spanish native
  };
  const langPrefix = (lang ?? "fr").split(/[-_]/)[0].toLowerCase();
  // Use language voice if available, otherwise omit voice_id for auto-selection
  const voiceId = VOICE_IDS[langPrefix];

  const body: Record<string, unknown> = {
    model: "voxtral-mini-tts-2603",
    input: text,
    response_format: "mp3",
  };
  if (voiceId) body.voice_id = voiceId;

  const res = await fetch("https://api.mistral.ai/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Mistral TTS error:", err);
    return NextResponse.json({ error: "TTS request failed" }, { status: 502 });
  }

  const { audio_data } = await res.json();
  const audioBuffer = Buffer.from(audio_data, "base64");

  return new NextResponse(audioBuffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": String(audioBuffer.byteLength),
      // Cache aggressively — same text always produces the same audio
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
