import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { groq } from "@/lib/claude";
import { prisma } from "@/lib/prisma";
import { awardXp, updateStreak } from "@/lib/gamification";
import { GameType } from "@prisma/client";

const COMPLEXITY: Record<string, string> = {
  A1: "4-5 simple words, common vocabulary, no complex sounds. Example: 'Le chat mange du pain.'",
  A2: "6-8 words, everyday vocabulary, basic verb conjugations",
  B1: "8-12 words, tense variety, words with tricky silent letters or liaisons",
  B2: "12-16 words, complex syntax, vocabulary with multiple accent options",
  C1: "Long complex sentences, subordinate clauses, advanced vocabulary",
  C2: "Long complex sentences, subordinate clauses, fast natural speech pace",
};

const FALLBACK: Record<string, string[]> = {
  fr: [
    "Le chat mange du pain.", "Elle va au marché ce matin.", "Nous aimons beaucoup le café.",
    "Il fait beau aujourd'hui.", "Les enfants jouent dans le jardin.", "J'ai acheté du lait hier.",
    "Elle est partie très tôt ce matin.", "Nous avons mangé une excellente pizza.",
  ],
  es: [
    "El gato come pan.", "Ella va al mercado esta mañana.", "Nos gusta mucho el café.",
    "Hace buen tiempo hoy.", "Los niños juegan en el jardín.", "Compré leche ayer.",
  ],
};

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const language = searchParams.get("language") ?? session.user.targetLanguage ?? "fr";
  const level    = searchParams.get("level") ?? "B1";
  const complexity = COMPLEXITY[level] ?? COMPLEXITY.B1;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You generate dictation sentences for language learning. Return ONLY valid JSON." },
        {
          role: "user",
          content: `Generate 8 dictation sentences in ${language} for CEFR level ${level}.
Complexity guide: ${complexity}

Return JSON: { "sentences": ["sentence1", "sentence2", ...8 sentences] }

Rules:
- Each sentence must be natural, grammatically correct
- Vary the sentence structures and vocabulary
- No dialogue markers or quotation marks
- Plain sentences only`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const data = JSON.parse(raw);

    if (!Array.isArray(data.sentences) || data.sentences.length < 4) {
      return NextResponse.json({ sentences: FALLBACK[language] ?? FALLBACK.fr });
    }

    return NextResponse.json({ sentences: data.sentences.slice(0, 8) });
  } catch (err) {
    console.error("[dictation GET]", err);
    return NextResponse.json({ sentences: FALLBACK[language] ?? FALLBACK.fr });
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
      data: { userId, gameType: GameType.DICTATION, score: pct, wordsUsed: [], xpEarned, playedAt: new Date() },
    });
    await awardXp(userId, xpEarned, "vocabulary");
    await updateStreak(userId);
    return NextResponse.json({ gameScore, xpEarned });
  } catch (err) {
    console.error("[dictation POST]", err);
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
}
