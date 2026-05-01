import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { groq } from "@/lib/claude";
import { prisma } from "@/lib/prisma";
import { awardXp, updateStreak } from "@/lib/gamification";
import { GameType } from "@prisma/client";

interface SentenceData {
  sentence: string;
  segments: string[];
  errorIndex: number;
  correction: string;
  explanation: string;
  grammarRule: string;
  options?: string[];
}

const FALLBACK: Record<string, SentenceData[]> = {
  fr: [
    { sentence: "Hier, je suis allé au magasin et j'ai acheter du pain.", segments: ["Hier,", "je suis allé", "au magasin", "et", "j'ai", "acheter", "du pain."], errorIndex: 5, correction: "acheté", explanation: "After 'avoir' auxiliary, use the past participle (-é), not the infinitive (-er).", grammarRule: "Passé composé: auxiliaire + participe passé", options: ["acheté", "achètera", "achetais", "achetant"] },
    { sentence: "Elle a beaucoup des amis dans sa classe.", segments: ["Elle", "a beaucoup", "des amis", "dans", "sa classe."], errorIndex: 1, correction: "a beaucoup d'", explanation: "'Beaucoup de' is used before a noun. 'Des' changes to 'de' after a quantity expression.", grammarRule: "Expressions de quantité + de", options: ["a beaucoup d'", "a beaucoup les", "a très des", "a plus les"] },
    { sentence: "Nous sommes arrivés hier et nous avons mangés au restaurant.", segments: ["Nous sommes arrivés", "hier", "et", "nous avons", "mangés", "au restaurant."], errorIndex: 4, correction: "mangé", explanation: "Past participle with 'avoir' does NOT agree with the subject. 'Mangé' stays invariable.", grammarRule: "Accord du participe passé avec avoir", options: ["mangé", "mangeant", "manges", "mangerons"] },
  ],
  es: [
    { sentence: "Ayer, yo fui a la tienda y he comprar pan.", segments: ["Ayer,", "yo fui", "a la tienda", "y", "he", "comprar", "pan."], errorIndex: 5, correction: "comprado", explanation: "After 'haber' auxiliary, use the past participle (-ado/-ido), not the infinitive.", grammarRule: "Pretérito perfecto: haber + participio", options: ["comprado", "comprará", "compraba", "comprando"] },
    { sentence: "Ella tiene muchos de amigos en su clase.", segments: ["Ella", "tiene muchos", "de amigos", "en", "su clase."], errorIndex: 2, correction: "amigos", explanation: "'Muchos' directly precedes the noun. No 'de' is needed (unlike French 'beaucoup de').", grammarRule: "Cuantificadores en español", options: ["amigos", "los amigos", "un amigo", "unos amigos"] },
  ],
  en: [
    { sentence: "She don't like eating vegetables.", segments: ["She", "don't", "like", "eating vegetables."], errorIndex: 1, correction: "doesn't", explanation: "Third-person singular (she/he/it) uses 'doesn't', not 'don't'.", grammarRule: "Subject-verb agreement", options: ["doesn't", "don't", "didn't", "won't"] },
    { sentence: "Yesterday I have seen a great film.", segments: ["Yesterday", "I", "have seen", "a great film."], errorIndex: 2, correction: "saw", explanation: "'Yesterday' signals simple past, not present perfect. Use 'saw' instead of 'have seen'.", grammarRule: "Simple past vs present perfect", options: ["saw", "have seen", "had seen", "was seeing"] },
    { sentence: "He is more taller than his brother.", segments: ["He", "is", "more taller", "than his brother."], errorIndex: 2, correction: "taller", explanation: "Don't use 'more' with short adjectives that already take '-er'. Say 'taller', not 'more taller'.", grammarRule: "Comparative adjectives", options: ["taller", "more tall", "most tall", "tallest"] },
  ],
};

function getFallbackSet(language: string): SentenceData[] {
  return FALLBACK[language] ?? FALLBACK.fr;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const language = searchParams.get("language") ?? session.user.targetLanguage ?? "fr";
  const level    = searchParams.get("level") ?? "B1";
  const count    = 10;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You generate grammar error detection exercises for language learning. Return ONLY valid JSON." },
        {
          role: "user",
          content: `Generate ${count} sentences in ${language} for CEFR level ${level} learners. Each sentence has exactly ONE grammar mistake.

Return JSON:
{
  "sentences": [
    {
      "sentence": "full sentence with the error",
      "segments": ["word/phrase1", "word/phrase2", ...split into logical clickable chunks],
      "errorIndex": <index of the wrong segment in segments array>,
      "correction": "the correct word/phrase to replace the wrong segment",
      "explanation": "clear explanation in English of why it is wrong and what the rule is",
      "grammarRule": "short rule name (e.g. 'Passé composé agreement')",
      "options": ["correction", "wrong1", "wrong2", "wrong3"]
    }
  ]
}

Rules:
- Each sentence must be natural and grammatically correct except for exactly one error
- For ${level} level: ${level === "A2" ? "wrong verb endings, missing articles, gender agreement" : level === "B1" ? "tense choice errors, wrong prepositions, reflexive verbs" : level === "B2" ? "subjunctive vs indicative, passive voice, complex agreement" : "register errors, subtle collocations, complex syntax"}
- Segments should be logical word groups (not single letters)
- options[0] is always the correction, options 1-3 are plausible wrong alternatives
- explanation should be in English, clear for a language learner`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const data = JSON.parse(raw);

    if (!Array.isArray(data.sentences) || data.sentences.length === 0) {
      return NextResponse.json({ sentences: getFallbackSet(language) });
    }

    // Validate each sentence
    const valid = data.sentences.filter((s: SentenceData) =>
      s.sentence && Array.isArray(s.segments) && typeof s.errorIndex === "number" &&
      s.errorIndex >= 0 && s.errorIndex < s.segments.length && s.correction && s.explanation
    );

    return NextResponse.json({ sentences: valid.length >= 5 ? valid : getFallbackSet(language) });
  } catch (err) {
    console.error("[error-detective GET]", err);
    return NextResponse.json({ sentences: getFallbackSet(language) });
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
      data: { userId, gameType: GameType.ERROR_DETECTIVE, score: pct, wordsUsed: [], xpEarned, playedAt: new Date() },
    });
    await awardXp(userId, xpEarned, "vocabulary");
    await updateStreak(userId);
    return NextResponse.json({ gameScore, xpEarned });
  } catch (err) {
    console.error("[error-detective POST]", err);
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
}
