import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { groq } from "@/lib/claude";
import { prisma } from "@/lib/prisma";
import { awardXp, updateStreak } from "@/lib/gamification";
import { GameType } from "@prisma/client";

// Static fallback sets by language + CEFR level
const FALLBACK: Record<string, Record<string, { targetWord: string; words: string[]; correctIndices: number[] }[]>> = {
  fr: {
    A1: [
      { targetWord: "cuisine", words: ["four","livre","cuillère","liberté","poêle","bibliothèque","chef","triste","recette","montagne","chaise","soleil","table","fleur","couteau","arbre"], correctIndices: [0,2,4,6,8,12,14] },
      { targetWord: "famille", words: ["père","nuage","mère","avion","frère","banque","sœur","désert","cousin","musique","oncle","tante","chien","chat","jardin","oiseau"], correctIndices: [0,2,4,6,8,10,11] },
    ],
    B1: [
      { targetWord: "voyage", words: ["passeport","coucher","valise","cuisine","aéroport","rêve","billet","étude","hôtel","montagne","carte","nuage","itinéraire","musique","frontière","forêt"], correctIndices: [0,2,4,6,8,10,12,14] },
    ],
  },
  es: {
    A1: [
      { targetWord: "cocina", words: ["horno","libro","cuchara","libertad","sartén","biblioteca","chef","triste","receta","montaña","silla","sol","mesa","flor","cuchillo","árbol"], correctIndices: [0,2,4,6,8,12,14] },
    ],
    B1: [
      { targetWord: "viaje", words: ["pasaporte","dormir","maleta","cocina","aeropuerto","sueño","billete","estudio","hotel","montaña","mapa","nube","itinerario","música","frontera","bosque"], correctIndices: [0,2,4,6,8,10,12,14] },
    ],
  },
};

function getFallback(language: string, level: string) {
  const langSets = FALLBACK[language] ?? FALLBACK.fr;
  const levelSets = langSets[level] ?? langSets.B1 ?? Object.values(langSets)[0];
  return levelSets[Math.floor(Math.random() * levelSets.length)];
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const language = searchParams.get("language") ?? session.user.targetLanguage ?? "fr";
  const level    = searchParams.get("level") ?? "B1";

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You generate word association sets for language learning. Return ONLY valid JSON, no markdown.`,
        },
        {
          role: "user",
          content: `Generate a word association set for ${language} language learners at CEFR level ${level}.
Pick a concrete, interesting target word. Create a 4x4 grid of 16 words — mix of 5-8 words semantically related to the target word and the rest unrelated distractors.
The unrelated words should be plausible vocabulary at this level but clearly from different semantic categories.

Return JSON exactly:
{
  "targetWord": "string",
  "words": ["word1","word2",...16 words total],
  "correctIndices": [0,3,7,...indices of the related words],
  "timeLimit": 60
}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const data = JSON.parse(raw);

    if (!data.targetWord || !Array.isArray(data.words) || data.words.length !== 16 || !Array.isArray(data.correctIndices)) {
      return NextResponse.json(getFallback(language, level));
    }

    return NextResponse.json({ ...data, timeLimit: data.timeLimit ?? 60 });
  } catch (err) {
    console.error("[word-association] Groq error:", err);
    return NextResponse.json(getFallback(language, level));
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const { score, wordsUsed, newWords } = await req.json();

  const pct = Math.max(0, Math.min(100, Math.round(score)));
  const xpEarned = pct >= 90 ? 50 : pct >= 70 ? 35 : pct >= 50 ? 20 : 10;

  try {
    const gameScore = await prisma.gameScore.create({
      data: { userId, gameType: GameType.WORD_ASSOCIATION, score: pct, wordsUsed: wordsUsed ?? [], xpEarned, playedAt: new Date() },
    });
    await awardXp(userId, xpEarned, "vocabulary");
    await updateStreak(userId);

    // Auto-save newly encountered words
    if (newWords && newWords.length > 0) {
      const existingWords = await prisma.word.findMany({ where: { word: { in: newWords }, language: session.user.targetLanguage ?? "fr" }, select: { id: true } });
      if (existingWords.length > 0) {
        await prisma.savedWord.createMany({
          data: existingWords.map((w) => ({ userId, wordId: w.id })),
          skipDuplicates: true,
        });
      }
    }

    return NextResponse.json({ gameScore, xpEarned });
  } catch (err) {
    console.error("[word-association POST]", err);
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
}
