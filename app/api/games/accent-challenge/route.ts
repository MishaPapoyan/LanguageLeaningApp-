import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { groq } from "@/lib/claude";
import { prisma } from "@/lib/prisma";
import { awardXp, updateStreak } from "@/lib/gamification";
import { GameType } from "@prisma/client";

// Regional accent voice profiles — ElevenLabs voice IDs per region
// Each entry: { region, label, flag, voiceId }
const ACCENT_VOICES: Record<string, Array<{ region: string; label: string; flag: string; voiceId: string }>> = {
  fr: [
    { region: "paris",  label: "Parisian French",  flag: "🇫🇷", voiceId: "cgSgspJ2msm6clMCkdW9" },
    { region: "quebec", label: "Quebec French",    flag: "🇨🇦", voiceId: "21m00Tcm4TlvDq8ikWAM" },
    { region: "belge",  label: "Belgian French",   flag: "🇧🇪", voiceId: "EXAVITQu4vr4xnSDxMaL" },
  ],
  es: [
    { region: "spain",   label: "Castilian Spanish", flag: "🇪🇸", voiceId: "EXAVITQu4vr4xnSDxMaL" },
    { region: "mexico",  label: "Mexican Spanish",   flag: "🇲🇽", voiceId: "21m00Tcm4TlvDq8ikWAM" },
    { region: "arg",     label: "Argentine Spanish", flag: "🇦🇷", voiceId: "cgSgspJ2msm6clMCkdW9" },
  ],
};

const WORD_LEVELS: Record<string, Record<string, string[]>> = {
  fr: {
    "A2": ["bonjour","merci","maison","voiture","partir","manger","eau","rouge","petit","grand"],
    "B1": ["grenouille","feuille","équilibre","parapluie","deuxième","ailleurs","cueillir","œuvre"],
    "B2": ["accueil","écureuil","portefeuille","millefeuille","grenouille","ennui","recueil"],
  },
  es: {
    "A2": ["gracias","casa","coche","comer","agua","rojo","pequeño","grande","hola","bien"],
    "B1": ["paraguas","equilibrio","murciélago","ciempiés","ferrocarril","desarrollar"],
    "B2": ["desenvolvimiento","circunstancia","extraordinario","vulnerabilidad"],
  },
};

function getWordList(language: string, level: string): string[] {
  const lang = WORD_LEVELS[language] ?? WORD_LEVELS.fr;
  return lang[level] ?? lang.B1 ?? Object.values(lang)[0];
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const language = searchParams.get("language") ?? session.user.targetLanguage ?? "fr";
  const level    = searchParams.get("level") ?? "B1";

  const voices = ACCENT_VOICES[language] ?? ACCENT_VOICES.fr;
  const wordList = getWordList(language, level);

  // Pick 10 random words for 10 rounds
  const shuffled = [...wordList].sort(() => Math.random() - 0.5);
  const rounds = shuffled.slice(0, Math.min(10, shuffled.length));

  // Generate distractors via Groq
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Generate word options for accent challenge game. Return ONLY valid JSON." },
        {
          role: "user",
          content: `For each target word, generate 3 distractor words that sound similar or are at the same vocabulary level in ${language}.
Target words: ${JSON.stringify(rounds)}
CEFR level: ${level}

Return JSON:
{
  "rounds": [
    {
      "word": "target word",
      "options": ["target word", "distractor1", "distractor2", "distractor3"]
    }
  ]
}

Rules: options[0] is always the correct target word. Distractors should sound similar or be plausible alternatives.`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const data = JSON.parse(raw);

    if (!Array.isArray(data.rounds) || data.rounds.length === 0) {
      // Simple fallback
      return NextResponse.json({
        voices,
        rounds: rounds.map((word) => ({
          word,
          options: [word, word + "s", word.slice(0, -1), word + "e"].slice(0, 4),
        })),
      });
    }

    return NextResponse.json({ voices, rounds: data.rounds });
  } catch (err) {
    console.error("[accent-challenge GET]", err);
    return NextResponse.json({
      voices,
      rounds: rounds.map((word) => ({ word, options: [word, word + "s", word.slice(0, -1) || word, word + "e"] })),
    });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const { score } = await req.json();
  const pct = Math.max(0, Math.min(100, Math.round(score)));
  const xpEarned = pct >= 90 ? 50 : pct >= 70 ? 35 : pct >= 50 ? 20 : 10;

  try {
    const gameScore = await prisma.gameScore.create({
      data: { userId, gameType: GameType.ACCENT_CHALLENGE, score: pct, wordsUsed: [], xpEarned, playedAt: new Date() },
    });
    await awardXp(userId, xpEarned, "vocabulary");
    await updateStreak(userId);
    return NextResponse.json({ gameScore, xpEarned });
  } catch (err) {
    console.error("[accent-challenge POST]", err);
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
}
