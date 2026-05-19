import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { groq } from "@/lib/claude";

export const runtime = "nodejs";

const VALID_LANGS = new Set(["fr", "es", "en", "hy", "de", "it", "pt", "ru", "ja", "ko", "zh"]);

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("audio") as File | null;
  const lang = (formData.get("lang") as string | null) ?? "fr";

  if (!file || file.size === 0) {
    return NextResponse.json({ error: "No audio provided" }, { status: 400 });
  }

  const langPrefix = lang.split(/[-_]/)[0].toLowerCase();
  const language   = VALID_LANGS.has(langPrefix) ? langPrefix : undefined;

  try {
    const transcription = await groq.audio.transcriptions.create({
      file,
      model: "whisper-large-v3-turbo",
      ...(language ? { language } : {}),
      response_format: "json",
      temperature: 0,
    });

    return NextResponse.json({ text: transcription.text?.trim() ?? "" });
  } catch (err) {
    console.error("[transcribe] Groq Whisper error:", err);
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
  }
}
