import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { groq } from "@/lib/claude";
import { prisma } from "@/lib/prisma";
import { awardXp, updateStreak } from "@/lib/gamification";
import { GameType } from "@prisma/client";

interface TenseQuestion {
  sourceSentence: string;
  targetTense: string;
  correctAnswer: string;
  conjugationExplanation: string;
  stepByStep: string[];
}

const TENSE_MAP: Record<string, string[]> = {
  A2: ["near future (aller + infinitif)", "passé composé"],
  B1: ["passé composé", "imparfait", "futur simple"],
  B2: ["conditionnel présent", "subjonctif présent", "plus-que-parfait"],
  C1: ["conditionnel passé", "subjonctif imparfait", "passé antérieur"],
  C2: ["conditionnel passé", "subjonctif passé", "passé antérieur"],
};

const TENSE_MAP_ES: Record<string, string[]> = {
  A2: ["futuro próximo (ir a + infinitivo)", "pretérito indefinido"],
  B1: ["pretérito perfecto", "pretérito imperfecto", "futuro simple"],
  B2: ["condicional simple", "presente de subjuntivo", "pluscuamperfecto"],
  C1: ["condicional compuesto", "imperfecto de subjuntivo", "futuro perfecto"],
  C2: ["condicional compuesto", "subjuntivo imperfecto", "futuro perfecto"],
};

const FALLBACK: Record<string, TenseQuestion[]> = {
  fr: [
    { sourceSentence: "Je mange une pomme.", targetTense: "Passé composé", correctAnswer: "J'ai mangé une pomme.", conjugationExplanation: "Use avoir + past participle for passé composé with manger.", stepByStep: ["Infinitive: manger", "Remove -er: mang-", "Add past participle ending: mangé", "Add avoir auxiliary: j'ai", "Result: j'ai mangé une pomme"] },
    { sourceSentence: "Elle travaille au bureau.", targetTense: "Imparfait", correctAnswer: "Elle travaillait au bureau.", conjugationExplanation: "Imparfait is formed from the nous present stem + imparfait endings.", stepByStep: ["Present tense nous form: travaillons", "Remove -ons: travaill-", "Add imparfait ending for elle: -ait", "Result: elle travaillait au bureau"] },
    { sourceSentence: "Nous allons au cinéma.", targetTense: "Futur simple", correctAnswer: "Nous irons au cinéma.", conjugationExplanation: "Aller has an irregular futur stem: ir-", stepByStep: ["Verb: aller (irregular)", "Futur stem: ir-", "Add futur ending for nous: -ons", "Result: nous irons au cinéma"] },
  ],
  es: [
    { sourceSentence: "Como una manzana.", targetTense: "Pretérito indefinido", correctAnswer: "Comí una manzana.", conjugationExplanation: "Regular -er verb preterite: replace -er with -í for yo.", stepByStep: ["Infinitive: comer", "Remove -er: com-", "Add preterite ending for yo: -í", "Result: comí una manzana"] },
    { sourceSentence: "Ella trabaja en la oficina.", targetTense: "Pretérito imperfecto", correctAnswer: "Ella trabajaba en la oficina.", conjugationExplanation: "Regular -ar verb imperfect: replace -ar with -aba for ella.", stepByStep: ["Infinitive: trabajar", "Remove -ar: trabaj-", "Add imperfect ending for ella: -aba", "Result: ella trabajaba en la oficina"] },
  ],
};

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const language = searchParams.get("language") ?? session.user.targetLanguage ?? "fr";
  const level    = searchParams.get("level") ?? "B1";
  const tenseList = language === "es" ? (TENSE_MAP_ES[level] ?? TENSE_MAP_ES.B1) : (TENSE_MAP[level] ?? TENSE_MAP.B1);
  const targetTense = tenseList[Math.floor(Math.random() * tenseList.length)];

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You generate tense transformation exercises for language learning. Return ONLY valid JSON." },
        {
          role: "user",
          content: `Generate 8 tense transformation sentences in ${language} at CEFR level ${level}.
Each sentence is in the present tense. The student must rewrite it in: ${targetTense}.

Return JSON:
{
  "targetTense": "${targetTense}",
  "sentences": [
    {
      "sourceSentence": "Present tense sentence",
      "targetTense": "${targetTense}",
      "correctAnswer": "Correctly transformed sentence",
      "conjugationExplanation": "Brief explanation in English",
      "stepByStep": ["Step 1", "Step 2", "Step 3", "Step 4", "Final result"]
    }
  ]
}

Requirements:
- sourceSentence must be a valid, natural present tense sentence
- correctAnswer must be perfectly grammatically correct
- stepByStep: 3-5 clear steps showing the transformation
- Level ${level}: use vocabulary appropriate for this CEFR level
- Vary the subjects (je, tu, il/elle, nous, vous, ils/elles)
- Include both regular and (for higher levels) irregular verbs`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const data = JSON.parse(raw);

    if (!Array.isArray(data.sentences) || data.sentences.length < 4) {
      return NextResponse.json({ targetTense, sentences: FALLBACK[language] ?? FALLBACK.fr });
    }

    return NextResponse.json({ targetTense: data.targetTense ?? targetTense, sentences: data.sentences });
  } catch (err) {
    console.error("[tense-challenge GET]", err);
    return NextResponse.json({ targetTense, sentences: FALLBACK[language] ?? FALLBACK.fr });
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
      data: { userId, gameType: GameType.TENSE_CHALLENGE, score: pct, wordsUsed: [], xpEarned, playedAt: new Date() },
    });
    await awardXp(userId, xpEarned, "vocabulary");
    await updateStreak(userId);
    return NextResponse.json({ gameScore, xpEarned });
  } catch (err) {
    console.error("[tense-challenge POST]", err);
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
}
