import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── Static fallback ───────────────────────────────────────────────────────────

const FALLBACK: Record<string, object> = {
  fr: {
    venue: "market-bazaar",
    title: "Au marché",
    emoji: "🛒",
    setting: "Vous vous promenez dans un marché animé à Paris. Les marchands proposent fromages, fruits, fleurs et vêtements. C'est votre chance de pratiquer votre français !",
    nodes: [
      {
        id: "n1",
        npc: "Marchand de fruits",
        npcLine: "Bonjour ! Vous désirez ? Regardez mes fraises, elles sont magnifiques aujourd'hui !",
        npcTranslation: "Hello! What would you like? Look at my strawberries, they're beautiful today!",
        choices: [
          { text: "Bonjour ! Je voudrais un kilo de fraises, s'il vous plaît.", hint: "Hello! I'd like a kilo of strawberries, please.", correct: true,  feedback: "Excellente idée ! Elles sont très sucrées aujourd'hui." },
          { text: "Non merci, je n'aime pas les fraises.", hint: "No thanks, I don't like strawberries.", correct: true,  feedback: "D'accord ! J'ai aussi des pommes et des poires." },
          { text: "Donnez-moi tout ce que vous avez.", hint: "Give me everything you have.", correct: false, feedback: "Tout ? Ça ferait très cher ! 😄" },
        ],
      },
      {
        id: "n2",
        npc: "Marchand de fruits",
        npcLine: "Ça fait trois euros cinquante. Vous avez la monnaie ?",
        npcTranslation: "That's three euros fifty. Do you have change?",
        choices: [
          { text: "Oui, voilà exactement trois euros cinquante.", hint: "Yes, here's exactly three fifty.", correct: true,  feedback: "Merci beaucoup ! Bonne journée !" },
          { text: "Je n'ai qu'un billet de vingt euros.", hint: "I only have a twenty euro note.", correct: true,  feedback: "Pas de problème, je vous rends la monnaie." },
          { text: "C'est trop cher, je ne paie pas.", hint: "That's too expensive, I won't pay.", correct: false, feedback: "Monsieur/Madame, c'est le prix normal du marché !" },
        ],
      },
      {
        id: "n3",
        npc: "Fromagère",
        npcLine: "Bonjour ! Vous cherchez quelque chose en particulier ?",
        npcTranslation: "Hello! Are you looking for something in particular?",
        choices: [
          { text: "Oui, je cherche un bon fromage pour ce soir.", hint: "Yes, I'm looking for a good cheese for tonight.", correct: true,  feedback: "Pour ce soir ? Je vous conseille ce camembert, il est parfait !" },
          { text: "Non, je regarde juste.", hint: "No, I'm just looking.", correct: true,  feedback: "Pas de souci, prenez votre temps !" },
          { text: "Je veux du fromage anglais.", hint: "I want English cheese.", correct: false, feedback: "Ici on vend uniquement des fromages français ! 🧀" },
        ],
      },
      {
        id: "n4",
        npc: "Fromagère",
        npcLine: "Ce camembert vient de Normandie. Voulez-vous goûter ?",
        npcTranslation: "This camembert comes from Normandy. Would you like to taste it?",
        choices: [
          { text: "Oui, avec plaisir ! Merci.", hint: "Yes, with pleasure! Thank you.", correct: true,  feedback: "Voilà ! Qu'est-ce que vous en pensez ?" },
          { text: "Non merci, je suis végétalien.", hint: "No thanks, I'm vegan.", correct: true,  feedback: "Je comprends ! J'ai des alternatives végétales ici." },
          { text: "Je préfère le goûter chez moi d'abord.", hint: "I prefer to taste it at home first.", correct: false, feedback: "Mais l'idée de la dégustation est justement de goûter ici ! 😅" },
        ],
      },
      {
        id: "n5",
        npc: "Fleuriste",
        npcLine: "Bonjour ! Ces roses sont en promotion aujourd'hui — dix euros le bouquet !",
        npcTranslation: "Hello! These roses are on sale today — ten euros a bunch!",
        choices: [
          { text: "Super ! Je prends un bouquet pour ma mère.", hint: "Great! I'll take a bunch for my mother.", correct: true,  feedback: "Comme c'est gentil ! Elle sera ravie !" },
          { text: "C'est encore trop cher. Vous faites un rabais ?", hint: "Still too expensive. Can you give a discount?", correct: true,  feedback: "Pour vous, je fais huit euros. C'est mon dernier prix !" },
          { text: "Je déteste les fleurs.", hint: "I hate flowers.", correct: false, feedback: "Oh… dommage ! Elles sont pourtant magnifiques 🌹" },
        ],
      },
    ],
  },
  es: {
    venue: "market-bazaar",
    title: "En el mercado",
    emoji: "🛒",
    setting: "Estás paseando por un mercado animado en Madrid. Los vendedores ofrecen quesos, frutas, flores y ropa. ¡Es tu oportunidad de practicar el español!",
    nodes: [
      {
        id: "n1",
        npc: "Frutero",
        npcLine: "¡Buenos días! ¿Qué desea? ¡Mire mis fresas, están preciosas hoy!",
        npcTranslation: "Good morning! What would you like? Look at my strawberries, they're beautiful today!",
        choices: [
          { text: "¡Buenos días! Quiero un kilo de fresas, por favor.", hint: "Good morning! I'd like a kilo of strawberries, please.", correct: true,  feedback: "¡Buena elección! Están muy dulces hoy." },
          { text: "No gracias, no me gustan las fresas.", hint: "No thanks, I don't like strawberries.", correct: true,  feedback: "¡De acuerdo! También tengo manzanas y peras." },
          { text: "Deme todo lo que tiene.", hint: "Give me everything you have.", correct: false, feedback: "¿Todo? ¡Saldría muy caro! 😄" },
        ],
      },
      {
        id: "n2",
        npc: "Frutero",
        npcLine: "Son tres euros y medio. ¿Tiene cambio?",
        npcTranslation: "That's three euros fifty. Do you have change?",
        choices: [
          { text: "Sí, aquí tiene exactamente tres con cincuenta.", hint: "Yes, here's exactly three fifty.", correct: true,  feedback: "¡Muchas gracias! ¡Buen día!" },
          { text: "Solo tengo un billete de veinte.", hint: "I only have a twenty euro note.", correct: true,  feedback: "No hay problema, le doy el cambio." },
          { text: "Es demasiado caro, no lo pago.", hint: "That's too expensive, I won't pay.", correct: false, feedback: "¡Señor/Señora, es el precio normal del mercado!" },
        ],
      },
      {
        id: "n3",
        npc: "Quesera",
        npcLine: "¡Hola! ¿Busca algo en particular?",
        npcTranslation: "Hello! Are you looking for something in particular?",
        choices: [
          { text: "Sí, busco un buen queso para esta noche.", hint: "Yes, I'm looking for a good cheese for tonight.", correct: true,  feedback: "¿Para esta noche? Le recomiendo este manchego, ¡está perfecto!" },
          { text: "No, solo estoy mirando.", hint: "No, I'm just looking.", correct: true,  feedback: "¡Sin problema, tómese su tiempo!" },
          { text: "Quiero queso inglés.", hint: "I want English cheese.", correct: false, feedback: "¡Aquí solo vendemos quesos españoles! 🧀" },
        ],
      },
      {
        id: "n4",
        npc: "Quesera",
        npcLine: "Este manchego viene de La Mancha. ¿Quiere probarlo?",
        npcTranslation: "This manchego comes from La Mancha. Would you like to try it?",
        choices: [
          { text: "¡Sí, con mucho gusto! Gracias.", hint: "Yes, with pleasure! Thank you.", correct: true,  feedback: "¡Aquí tiene! ¿Qué le parece?" },
          { text: "No gracias, soy vegano.", hint: "No thanks, I'm vegan.", correct: true,  feedback: "¡Entiendo! Tengo alternativas vegetales aquí." },
          { text: "Prefiero probarlo en casa primero.", hint: "I prefer to taste it at home first.", correct: false, feedback: "¡Pero la idea de la degustación es probar aquí mismo! 😅" },
        ],
      },
      {
        id: "n5",
        npc: "Florista",
        npcLine: "¡Hola! Estas rosas están en oferta hoy — ¡diez euros el ramo!",
        npcTranslation: "Hello! These roses are on sale today — ten euros a bunch!",
        choices: [
          { text: "¡Qué bien! Me llevo un ramo para mi madre.", hint: "Great! I'll take a bunch for my mother.", correct: true,  feedback: "¡Qué detalle tan bonito! Le va a encantar." },
          { text: "Sigue siendo caro. ¿Me hace un descuento?", hint: "Still too expensive. Can you give a discount?", correct: true,  feedback: "Para usted, ocho euros. ¡Es mi último precio!" },
          { text: "Odio las flores.", hint: "I hate flowers.", correct: false, feedback: "Vaya… ¡Son preciosas de todas formas! 🌹" },
        ],
      },
    ],
  },
};

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const language = searchParams.get("language") ?? "fr";
  const level    = searchParams.get("level") ?? "B1";

  const prompt = `Generate a lively market/bazaar conversation scenario for a ${language} language learner at ${level} level.

Return ONLY valid JSON (no markdown) with this exact structure:
{
  "venue": "market-bazaar",
  "title": "string — venue title in ${language}",
  "emoji": "🛒",
  "setting": "string — 2-sentence scene description in English",
  "nodes": [
    {
      "id": "n1",
      "npc": "string — NPC role (e.g. fruit vendor, cheese merchant, florist)",
      "npcLine": "string — what the NPC says in ${language}",
      "npcTranslation": "string — English translation",
      "choices": [
        { "text": "string — response in ${language}", "hint": "string — English hint", "correct": true, "feedback": "string — NPC reaction in ${language}" },
        { "text": "string — response in ${language}", "hint": "string — English hint", "correct": false, "feedback": "string — NPC reaction in ${language}" },
        { "text": "string — response in ${language}", "hint": "string — English hint", "correct": false, "feedback": "string — NPC reaction in ${language}" }
      ]
    }
  ]
}

Generate 5 nodes covering interactions with different market stalls: greeting a vendor, asking for items, inquiring about prices, tasting/sampling, and paying or bargaining.
Each node has exactly 3 choices — only 1 marked correct: true.
Use natural ${language} appropriate for ${level} level. Keep the tone lively and fun.`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });
    const raw = completion.choices[0].message.content ?? "{}";
    const data = JSON.parse(raw);
    if (!data.nodes?.length) throw new Error("empty");
    return NextResponse.json(data);
  } catch {
    const fallback = FALLBACK[language] ?? FALLBACK.fr;
    return NextResponse.json(fallback);
  }
}

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ xpEarned: 10 });

  const { score } = await req.json();
  const xpEarned = score >= 90 ? 50 : score >= 70 ? 35 : score >= 50 ? 20 : 10;

  try {
    await prisma.gameScore.create({
      data: {
        userId:    session.user.id,
        gameType:  "MARKET_BAZAAR",
        score,
        wordsUsed: [],
        xpEarned,
        playedAt:  new Date(),
      },
    });
    await prisma.progress.upsert({
      where:  { userId: session.user.id },
      create: { userId: session.user.id, xp: xpEarned },
      update: { xp: { increment: xpEarned }, lastActive: new Date() },
    });
  } catch (e) {
    console.error("[market-bazaar POST]", e);
  }

  return NextResponse.json({ xpEarned });
}
