import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── Static fallback ───────────────────────────────────────────────────────────

const FALLBACK: Record<string, object> = {
  fr: {
    venue: "airport",
    title: "À l'aéroport",
    emoji: "✈️",
    setting: "Vous arrivez à l'aéroport Charles de Gaulle pour prendre votre vol pour Paris. L'agent d'enregistrement vous accueille.",
    nodes: [
      {
        id: "n1",
        npc: "Agent d'enregistrement",
        npcLine: "Bonjour ! Votre passeport et votre billet, s'il vous plaît.",
        npcTranslation: "Hello! Your passport and ticket, please.",
        choices: [
          { text: "Les voici, merci.", hint: "Here they are, thank you.", correct: true,  feedback: "Merci ! Destination : Paris." },
          { text: "Je n'ai pas de passeport.", hint: "I don't have a passport.", correct: false, feedback: "Vous ne pouvez pas embarquer sans passeport !" },
          { text: "Pourquoi ?", hint: "Why?", correct: false, feedback: "C'est obligatoire pour tous les vols internationaux." },
        ],
      },
      {
        id: "n2",
        npc: "Agent d'enregistrement",
        npcLine: "Avez-vous des bagages à enregistrer ?",
        npcTranslation: "Do you have any luggage to check in?",
        choices: [
          { text: "Oui, j'ai une valise.", hint: "Yes, I have one suitcase.", correct: true,  feedback: "Posez-la sur le tapis, s'il vous plaît." },
          { text: "Non, j'ai seulement un sac à main.", hint: "No, I only have a handbag.", correct: true,  feedback: "Parfait, vous pouvez passer directement à la sécurité." },
          { text: "Je ne sais pas.", hint: "I don't know.", correct: false, feedback: "Vous devez vérifier vos bagages avant de passer !" },
        ],
      },
      {
        id: "n3",
        npc: "Agent de sécurité",
        npcLine: "Retirez votre veste et posez vos affaires dans le bac.",
        npcTranslation: "Remove your jacket and place your belongings in the tray.",
        choices: [
          { text: "D'accord, voici mes affaires.", hint: "Okay, here are my things.", correct: true,  feedback: "Très bien, vous pouvez passer." },
          { text: "Non, je garde ma veste.", hint: "No, I'm keeping my jacket.", correct: false, feedback: "C'est obligatoire pour le contrôle de sécurité." },
          { text: "Est-ce vraiment nécessaire ?", hint: "Is that really necessary?", correct: false, feedback: "Oui, c'est le règlement de l'aéroport." },
        ],
      },
      {
        id: "n4",
        npc: "Hôtesse de l'air",
        npcLine: "Votre carte d'embarquement, s'il vous plaît. Quelle est votre place ?",
        npcTranslation: "Your boarding pass, please. What is your seat?",
        choices: [
          { text: "J'ai le siège 14A, côté fenêtre.", hint: "I have seat 14A, window side.", correct: true,  feedback: "Bienvenue à bord ! Bon voyage !" },
          { text: "Je l'ai perdue.", hint: "I lost it.", correct: false, feedback: "Vous devez retourner à l'enregistrement pour en avoir un autre." },
          { text: "Je veux changer de siège.", hint: "I want to change my seat.", correct: false, feedback: "Les changements de siège se font à l'enregistrement." },
        ],
      },
      {
        id: "n5",
        npc: "Agent à la porte",
        npcLine: "Le vol est en retard d'une heure. Avez-vous besoin d'aide ?",
        npcTranslation: "The flight is one hour late. Do you need any help?",
        choices: [
          { text: "Non merci, je vais attendre au salon.", hint: "No thanks, I'll wait in the lounge.", correct: true,  feedback: "D'accord, bon courage !" },
          { text: "Oui, pouvez-vous m'indiquer un café ?", hint: "Yes, can you show me a café?", correct: true,  feedback: "Bien sûr ! Il y en a un juste là-bas." },
          { text: "C'est scandaleux ! Je veux un remboursement.", hint: "This is outrageous! I want a refund.", correct: false, feedback: "Pour un retard d'une heure, aucun remboursement n'est prévu." },
        ],
      },
    ],
  },
  es: {
    venue: "airport",
    title: "En el aeropuerto",
    emoji: "✈️",
    setting: "Llegas al aeropuerto de Madrid para tomar tu vuelo. El agente de facturación te saluda.",
    nodes: [
      {
        id: "n1",
        npc: "Agente de facturación",
        npcLine: "¡Buenos días! Su pasaporte y su billete, por favor.",
        npcTranslation: "Good morning! Your passport and ticket, please.",
        choices: [
          { text: "Aquí los tiene, gracias.", hint: "Here they are, thank you.", correct: true,  feedback: "¡Gracias! Destino: Madrid." },
          { text: "No tengo pasaporte.", hint: "I don't have a passport.", correct: false, feedback: "¡No puede embarcar sin pasaporte!" },
          { text: "¿Por qué lo necesita?", hint: "Why do you need it?", correct: false, feedback: "Es obligatorio para todos los vuelos." },
        ],
      },
      {
        id: "n2",
        npc: "Agente de facturación",
        npcLine: "¿Tiene equipaje para facturar?",
        npcTranslation: "Do you have luggage to check in?",
        choices: [
          { text: "Sí, tengo una maleta.", hint: "Yes, I have a suitcase.", correct: true,  feedback: "Póngala en la cinta, por favor." },
          { text: "No, solo tengo equipaje de mano.", hint: "No, I only have carry-on.", correct: true,  feedback: "Perfecto, puede ir directamente a seguridad." },
          { text: "No lo sé.", hint: "I don't know.", correct: false, feedback: "Debe saberlo antes de pasar por el control." },
        ],
      },
      {
        id: "n3",
        npc: "Agente de seguridad",
        npcLine: "Retire su chaqueta y coloque sus objetos en la bandeja.",
        npcTranslation: "Remove your jacket and place your items in the tray.",
        choices: [
          { text: "De acuerdo, aquí están mis cosas.", hint: "Alright, here are my things.", correct: true,  feedback: "Muy bien, puede pasar." },
          { text: "No quiero quitarme la chaqueta.", hint: "I don't want to remove my jacket.", correct: false, feedback: "Es obligatorio en el control de seguridad." },
          { text: "¿Es necesario?", hint: "Is it necessary?", correct: false, feedback: "Sí, es el reglamento del aeropuerto." },
        ],
      },
      {
        id: "n4",
        npc: "Auxiliar de vuelo",
        npcLine: "Su tarjeta de embarque, por favor. ¿Cuál es su asiento?",
        npcTranslation: "Your boarding pass, please. What is your seat?",
        choices: [
          { text: "Tengo el asiento 14A, ventanilla.", hint: "I have seat 14A, window.", correct: true,  feedback: "¡Bienvenido a bordo! ¡Buen viaje!" },
          { text: "La perdí.", hint: "I lost it.", correct: false, feedback: "Debe volver a facturación para conseguir otra." },
          { text: "Quiero cambiar de asiento.", hint: "I want to change seats.", correct: false, feedback: "Los cambios se hacen en facturación." },
        ],
      },
    ],
  },
  en: {
    venue: "airport",
    title: "At the Airport",
    emoji: "✈️",
    setting: "You've arrived at Heathrow Airport to catch your flight to New York. The check-in agent greets you at the desk.",
    nodes: [
      {
        id: "n1",
        npc: "Check-in Agent",
        npcLine: "Good morning! Could I see your passport and booking reference, please?",
        npcTranslation: "A polite request — 'Could I see…?' is more formal than 'Can I see…?'",
        choices: [
          { text: "Of course, here you are. I also have my boarding pass on my phone.", hint: "", correct: true,  feedback: "Perfect! Let me just check your details." },
          { text: "I don't have my passport with me.", hint: "", correct: false, feedback: "Unfortunately you can't fly without a valid passport." },
          { text: "Why do you need to see it?", hint: "", correct: false, feedback: "Passport checks are required for all international flights." },
        ],
      },
      {
        id: "n2",
        npc: "Check-in Agent",
        npcLine: "Do you have any luggage to check in today?",
        npcTranslation: "'Check in' (luggage) = hand it to the airline to store in the hold.",
        choices: [
          { text: "Yes, I have one suitcase to check in, please.", hint: "", correct: true,  feedback: "Great — please place it on the belt. It's 18 kg, well within the limit!" },
          { text: "No, I'm only travelling with hand luggage.", hint: "", correct: true,  feedback: "No problem — head straight through to security." },
          { text: "I'm not sure what I have.", hint: "", correct: false, feedback: "You'll need to check before proceeding — excess baggage fees can be costly!" },
        ],
      },
      {
        id: "n3",
        npc: "Security Officer",
        npcLine: "Please remove your shoes, belt, and any liquids, and place them in the tray.",
        npcTranslation: "'Please remove…' is a polite imperative used in formal/public settings.",
        choices: [
          { text: "Of course — here's my bag and my laptop in a separate tray.", hint: "", correct: true,  feedback: "Thank you — you can collect your belongings on the other side." },
          { text: "Do I really have to take my shoes off?", hint: "", correct: false, feedback: "Yes — it's a security requirement for all passengers." },
          { text: "I'd rather not — I'm in a hurry.", hint: "", correct: false, feedback: "I'm afraid this is mandatory. We'll be as quick as we can." },
        ],
      },
      {
        id: "n4",
        npc: "Gate Agent",
        npcLine: "Good afternoon! Could you present your boarding pass and passport, please?",
        npcTranslation: "'Present' here means 'show'. A formal, professional word choice.",
        choices: [
          { text: "Certainly, here they are. I'm in seat 22B.", hint: "", correct: true,  feedback: "Welcome aboard! Enjoy your flight to New York." },
          { text: "I think I left my boarding pass at check-in.", hint: "", correct: false, feedback: "You'll need to go back to the desk — boarding can't proceed without it." },
          { text: "Can I upgrade to business class?", hint: "", correct: false, feedback: "Upgrades are handled at check-in, not at the gate. I'm afraid it's too late." },
        ],
      },
      {
        id: "n5",
        npc: "Flight Attendant",
        npcLine: "The flight has been delayed by forty minutes. Is there anything I can get you while you wait?",
        npcTranslation: "'Is there anything I can get you?' — a polite offer, very common in service contexts.",
        choices: [
          { text: "Yes, please — a glass of water would be great, thank you.", hint: "", correct: true,  feedback: "Of course! I'll bring that right away." },
          { text: "No thank you, I'm fine for now.", hint: "", correct: true,  feedback: "Not a problem. Just let me know if you need anything." },
          { text: "This is unacceptable! I want a full refund.", hint: "", correct: false, feedback: "I understand your frustration — please speak with our customer service team." },
        ],
      },
    ],
  },
};

// ── Shuffle choices in all nodes so the correct answer isn't always first ──────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function shuffleChoices(data: any): any {
  if (!data?.nodes) return data;
  return {
    ...data,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nodes: data.nodes.map((node: any) => ({
      ...node,
      choices: [...node.choices].sort(() => Math.random() - 0.5),
    })),
  };
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const language = searchParams.get("language") ?? "fr";
  const level    = searchParams.get("level") ?? "B1";

  const prompt = `Generate an immersive airport conversation scenario for a ${language} language learner at ${level} level.

Return ONLY valid JSON (no markdown) with this exact structure:
{
  "venue": "airport",
  "title": "string — venue title in ${language}",
  "emoji": "✈️",
  "setting": "string — 2-sentence scene description in English",
  "nodes": [
    {
      "id": "n1",
      "npc": "string — NPC role",
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

Generate 5 nodes covering: check-in, baggage drop, security, boarding gate, onboard greeting.
Each node has exactly 3 choices — only 1 marked correct: true.
Use natural ${language} appropriate for ${level} level. Keep NPC lines concise.`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });
    const raw = completion.choices[0].message.content ?? "{}";
    const data = JSON.parse(raw);
    if (!data.nodes?.length) throw new Error("empty");
    return NextResponse.json(shuffleChoices(data));
  } catch {
    const fallback = FALLBACK[language] ?? FALLBACK.fr;
    return NextResponse.json(shuffleChoices(fallback));
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
        gameType:  "AIRPORT",
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
    console.error("[airport POST]", e);
  }

  return NextResponse.json({ xpEarned });
}
