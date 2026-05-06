import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { groq } from "@/lib/claude";
import { prisma } from "@/lib/prisma";
import { awardXp, updateStreak } from "@/lib/gamification";
import { GameType } from "@prisma/client";

const SCRIPT_TYPES: Record<string, string> = {
  B1: "simple phone message or weather forecast, clear and direct",
  B2: "news bulletin or podcast snippet, moderate complexity",
  C1: "interview or debate excerpt, complex vocabulary",
  C2: "academic lecture or documentary excerpt, sophisticated language",
};

const COMMON_QUESTIONS = [
  { question: "What will the weather be like on Saturday?", options: ["Rainy", "Sunny", "Cloudy", "Snowy"], correctIndex: 1 },
  { question: "What temperature is expected on Saturday?", options: ["10 degrees", "15 degrees", "20 degrees", "25 degrees"], correctIndex: 2 },
  { question: "What will happen Sunday afternoon?", options: ["Sun and heat", "Snow and ice", "Clouds and possible rain", "Strong winds"], correctIndex: 2 },
  { question: "What does the forecast suggest you bring on Sunday?", options: ["Sunscreen", "An umbrella", "A hat", "A jacket"], correctIndex: 1 },
  { question: "Overall, how are temperatures described?", options: ["Very cold", "Freezing", "Very hot", "Mild for the season"], correctIndex: 3 },
];

const FALLBACK_BY_LANG: Record<string, { transcript: string; contentType: string; questions: typeof COMMON_QUESTIONS }> = {
  fr: {
    transcript: "Bonjour et bienvenue sur Radio Météo. Voici la météo pour ce week-end. Samedi, il fera beau dans tout le pays avec des températures autour de vingt degrés. Dimanche, des nuages arriveront par l'ouest et des pluies sont possibles l'après-midi. Les températures resteront douces pour la saison. Pensez à prendre votre parapluie dimanche. Bonne journée à tous.",
    contentType: "weather forecast",
    questions: COMMON_QUESTIONS,
  },
  es: {
    transcript: "Buenos días y bienvenidos a Radio Tiempo. Aquí está el pronóstico para este fin de semana. El sábado hará buen tiempo en todo el país, con temperaturas alrededor de veinte grados. El domingo llegarán nubes desde el oeste y son posibles lluvias por la tarde. Las temperaturas se mantendrán suaves para la estación. No olviden llevar el paraguas el domingo. ¡Buen día a todos!",
    contentType: "weather forecast",
    questions: COMMON_QUESTIONS,
  },
  en: {
    transcript: "Good morning and welcome to Weather Radio. Here is the forecast for this weekend. On Saturday, it will be sunny across the whole country, with temperatures around twenty degrees. On Sunday, clouds will arrive from the west and rain is possible in the afternoon. Temperatures will remain mild for the season. Remember to take your umbrella on Sunday. Have a good day, everyone.",
    contentType: "weather forecast",
    questions: COMMON_QUESTIONS,
  },
};

function getFallback(lang: string) {
  return FALLBACK_BY_LANG[lang] ?? FALLBACK_BY_LANG.fr;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const language = searchParams.get("language") ?? session.user.targetLanguage ?? "fr";
  const level    = searchParams.get("level") ?? "B1";

  // Block A1/A2
  if (level === "A1" || level === "A2") {
    return NextResponse.json({ locked: true, message: "Speed Listening unlocks at B1. Keep learning!" });
  }

  const scriptType = SCRIPT_TYPES[level] ?? SCRIPT_TYPES.B1;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You generate listening comprehension audio scripts for language learners. Return ONLY valid JSON." },
        {
          role: "user",
          content: `Generate a ${language} listening script for CEFR level ${level} learners.
Type: ${scriptType}
Length: 60-80 words (this will be played at 1.5x speed, so it should feel like 90-120 words at normal speed)

Return JSON:
{
  "transcript": "Full script text in ${language}",
  "contentType": "weather forecast|phone message|news|podcast|conversation",
  "questions": [
    {
      "question": "Comprehension question in English",
      "options": ["option1", "option2", "option3", "option4"],
      "correctIndex": 0
    }
  ]
}

Requirements:
- Exactly 5 comprehension questions
- Questions in English, script in ${language}
- Natural, flowing language as if actually spoken
- Questions test main ideas, details, and inferences`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const data = JSON.parse(raw);

    if (!data.transcript || !Array.isArray(data.questions) || data.questions.length < 4) {
      return NextResponse.json(getFallback(language));
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[speed-listening GET]", err);
    return NextResponse.json(getFallback(language));
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
      data: { userId, gameType: GameType.SPEED_LISTENING, score: pct, wordsUsed: [], xpEarned, playedAt: new Date() },
    });
    await awardXp(userId, xpEarned, "vocabulary");
    await updateStreak(userId);
    return NextResponse.json({ gameScore, xpEarned });
  } catch (err) {
    console.error("[speed-listening POST]", err);
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
}
