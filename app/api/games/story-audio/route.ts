import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { groq } from "@/lib/claude";
import { prisma } from "@/lib/prisma";
import { awardXp, updateStreak } from "@/lib/gamification";
import { GameType } from "@prisma/client";

const COMPLEXITY: Record<string, { words: number; desc: string }> = {
  A1: { words: 150, desc: "Very simple present tense story, concrete events, 2-3 characters maximum" },
  A2: { words: 180, desc: "Mix of present and past, everyday situations, some descriptive language" },
  B1: { words: 200, desc: "Narrative with a complication and resolution, past tenses, implied emotions" },
  B2: { words: 220, desc: "Complex plot with multiple characters, time jumps, abstract themes" },
  C1: { words: 240, desc: "Subtle narrative, sophisticated vocabulary, complex character motivations" },
  C2: { words: 250, desc: "Literary quality, unreliable narrator possibility, advanced vocabulary" },
};

const FALLBACK_BY_LANG: Record<string, object> = {
  fr: {
    title: "Le Chat de la Voisine",
    genre: "everyday life",
    transcript: "Marie habitait dans un petit appartement au troisième étage. Un matin, elle a entendu un bruit étrange venant du balcon. Elle a ouvert la porte et a trouvé un chat orange assis sur sa chaise. Le chat la regardait avec ses grands yeux verts. Marie n'aimait pas les animaux, mais ce chat semblait très gentil. Elle lui a donné un peu de lait et il a commencé à ronronner. Le soir, la voisine du dessus a frappé à la porte. Elle cherchait son chat, Minou. Marie a souri et a rendu le chat à sa propriétaire. Mais pendant toute la nuit, elle a pensé à Minou et à ses yeux verts.",
    questions: [
      { question: "Where did Marie find the cat?", options: ["On her balcony", "In the hallway", "In the kitchen", "At the front door"], correctIndex: 0 },
      { question: "What color was the cat?", options: ["Black", "White", "Orange", "Grey"], correctIndex: 2 },
      { question: "What did Marie give the cat?", options: ["Water", "Fish", "Milk", "Food"], correctIndex: 2 },
      { question: "Who came looking for the cat?", options: ["A neighbor from downstairs", "The neighbor from upstairs", "A stranger", "Her friend"], correctIndex: 1 },
      { question: "What did Marie think about that night?", options: ["The neighbor", "The milk", "Minou and his green eyes", "Her apartment"], correctIndex: 2 },
    ],
    vocabulary: [
      { word: "ronronner", definition: "to purr" },
      { word: "propriétaire", definition: "owner" },
      { word: "étrange", definition: "strange" },
      { word: "balcon", definition: "balcony" },
    ],
  },
  es: {
    title: "El Gato de la Vecina",
    genre: "everyday life",
    transcript: "María vivía en un pequeño apartamento en el tercer piso. Una mañana, oyó un ruido extraño que venía del balcón. Abrió la puerta y encontró un gato naranja sentado en su silla. El gato la miraba con sus grandes ojos verdes. A María no le gustaban los animales, pero ese gato parecía muy amable. Le dio un poco de leche y comenzó a ronronear. Por la noche, la vecina de arriba llamó a la puerta. Buscaba a su gato, Minino. María sonrió y devolvió el gato a su dueña. Pero durante toda la noche, pensó en Minino y en sus ojos verdes.",
    questions: [
      { question: "Where did María find the cat?", options: ["On her balcony", "In the hallway", "In the kitchen", "At the front door"], correctIndex: 0 },
      { question: "What color was the cat?", options: ["Black", "White", "Orange", "Grey"], correctIndex: 2 },
      { question: "What did María give the cat?", options: ["Water", "Fish", "Milk", "Food"], correctIndex: 2 },
      { question: "Who came looking for the cat?", options: ["A neighbor from downstairs", "The neighbor from upstairs", "A stranger", "Her friend"], correctIndex: 1 },
      { question: "What did María think about that night?", options: ["The neighbor", "The milk", "Minino and his green eyes", "Her apartment"], correctIndex: 2 },
    ],
    vocabulary: [
      { word: "ronronear", definition: "to purr" },
      { word: "dueña", definition: "owner (female)" },
      { word: "extraño", definition: "strange" },
      { word: "balcón", definition: "balcony" },
    ],
  },
  en: {
    title: "The Neighbour's Cat",
    genre: "everyday life",
    transcript: "Mary lived in a small flat on the third floor. One morning, she heard a strange noise coming from the balcony. She opened the door and found an orange cat sitting on her chair. The cat looked at her with its big green eyes. Mary didn't like animals, but this cat seemed very gentle. She gave it a little milk and it began to purr. In the evening, the neighbour from upstairs knocked on the door. She was looking for her cat, Whiskers. Mary smiled and returned the cat to its owner. But all night long, she thought about Whiskers and its green eyes.",
    questions: [
      { question: "Where did Mary find the cat?", options: ["On her balcony", "In the hallway", "In the kitchen", "At the front door"], correctIndex: 0 },
      { question: "What colour was the cat?", options: ["Black", "White", "Orange", "Grey"], correctIndex: 2 },
      { question: "What did Mary give the cat?", options: ["Water", "Fish", "Milk", "Food"], correctIndex: 2 },
      { question: "Who came looking for the cat?", options: ["A neighbour from downstairs", "The neighbour from upstairs", "A stranger", "Her friend"], correctIndex: 1 },
      { question: "What did Mary think about that night?", options: ["The neighbour", "The milk", "Whiskers and its green eyes", "Her flat"], correctIndex: 2 },
    ],
    vocabulary: [
      { word: "purr", definition: "the soft sound a happy cat makes" },
      { word: "owner", definition: "the person who owns something" },
      { word: "strange", definition: "unusual or unfamiliar" },
      { word: "balcony", definition: "a small platform outside an upper-floor window" },
    ],
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
  const { words, desc } = COMPLEXITY[level] ?? COMPLEXITY.B1;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You generate short audio stories for language learners. Return ONLY valid JSON." },
        {
          role: "user",
          content: `Generate a short ${language} story for CEFR level ${level} language learners.
Story requirements: ${desc}. Length: approximately ${words} words. Must have a clear beginning, middle, and end.
Genres: choose one of [adventure, mystery, everyday life, travel, romance, comedy]

Return JSON:
{
  "title": "Story title",
  "genre": "genre",
  "transcript": "Full story text in ${language}",
  "questions": [
    {
      "question": "Comprehension question in English",
      "options": ["option1", "option2", "option3", "option4"],
      "correctIndex": 0
    }
  ],
  "vocabulary": [
    { "word": "key word from story", "definition": "English definition" }
  ]
}

Requirements:
- Exactly 5 comprehension questions (who, what, why, sequence, inference types)
- 4-6 vocabulary items (most important/interesting words from the story)
- Questions in English, story in ${language}
- correctIndex is 0-3 (index of correct option)`,
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
    console.error("[story-audio GET]", err);
    return NextResponse.json(getFallback(language));
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const { score, newWords } = await req.json();
  const pct = Math.max(0, Math.min(100, Math.round(score)));
  const xpEarned = pct >= 90 ? 50 : pct >= 70 ? 35 : pct >= 50 ? 20 : 10;

  try {
    const gameScore = await prisma.gameScore.create({
      data: { userId, gameType: GameType.STORY_AUDIO, score: pct, wordsUsed: [], xpEarned, playedAt: new Date() },
    });
    await awardXp(userId, xpEarned, "vocabulary");
    await updateStreak(userId);

    if (newWords?.length > 0) {
      const existing = await prisma.word.findMany({ where: { word: { in: newWords }, language: session.user.targetLanguage ?? "fr" }, select: { id: true } });
      if (existing.length > 0) {
        await prisma.savedWord.createMany({ data: existing.map((w) => ({ userId, wordId: w.id })), skipDuplicates: true });
      }
    }

    return NextResponse.json({ gameScore, xpEarned });
  } catch (err) {
    console.error("[story-audio POST]", err);
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
}
