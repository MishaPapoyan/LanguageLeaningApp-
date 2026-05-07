import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── Static fallbacks ──────────────────────────────────────────────────────────

const FALLBACK: Record<string, object> = {
  fr: {
    venue: "hotel",
    title: "À l'hôtel",
    emoji: "🏨",
    setting: "Vous arrivez à l'hôtel Lumière à Paris après un long voyage. La réceptionniste vous accueille avec le sourire.",
    nodes: [
      {
        id: "n1",
        npc: "Réceptionniste",
        npcLine: "Bonsoir ! Bienvenue à l'hôtel Lumière. Vous avez une réservation ?",
        npcTranslation: "Good evening! Welcome to Hôtel Lumière. Do you have a reservation?",
        choices: [
          { text: "Oui, j'ai une réservation au nom de Dupont.", hint: "Yes, I have a reservation under Dupont.", correct: true,  feedback: "Très bien ! Je trouve votre dossier — chambre 204, non-fumeur." },
          { text: "Non, est-ce que vous avez des chambres libres ?", hint: "No, do you have any available rooms?", correct: true,  feedback: "Laissez-moi vérifier… Oui, une chambre double est disponible." },
          { text: "Je ne sais pas si j'ai réservé.", hint: "I don't know if I booked.", correct: false, feedback: "Je vais vérifier — votre nom, s'il vous plaît ?" },
        ],
      },
      {
        id: "n2",
        npc: "Réceptionniste",
        npcLine: "Votre chambre est au deuxième étage. Préférez-vous une vue sur le jardin ou sur la rue ?",
        npcTranslation: "Your room is on the second floor. Do you prefer a garden view or street view?",
        choices: [
          { text: "Je préférerais la vue sur le jardin, s'il vous plaît.", hint: "I'd prefer the garden view, please.", correct: true,  feedback: "Parfait ! La chambre 214 est pour vous." },
          { text: "Peu importe, n'importe laquelle convient.", hint: "It doesn't matter, either is fine.", correct: true,  feedback: "Dans ce cas, je vous donne la 206 — très calme." },
          { text: "Je veux la chambre la moins chère.", hint: "I want the cheapest room.", correct: false, feedback: "Toutes nos chambres sont au même tarif à cette saison." },
        ],
      },
      {
        id: "n3",
        npc: "Groom",
        npcLine: "Je peux monter vos bagages ? L'ascenseur est juste là.",
        npcTranslation: "Shall I take your luggage up? The lift is just there.",
        choices: [
          { text: "Oui, merci beaucoup, c'est très aimable.", hint: "Yes, thank you very much, that's very kind.", correct: true,  feedback: "Avec plaisir ! Je vous rejoins dans un instant." },
          { text: "Non merci, je peux m'en occuper moi-même.", hint: "No thank you, I can manage myself.", correct: true,  feedback: "Comme vous voulez ! Bonne soirée." },
          { text: "Je n'ai pas de pourboire pour vous.", hint: "I don't have a tip for you.", correct: false, feedback: "Ce n'est pas grave, monsieur. C'est mon plaisir de vous aider." },
        ],
      },
      {
        id: "n4",
        npc: "Service en chambre",
        npcLine: "Bonsoir, service en chambre. Que désirez-vous ?",
        npcTranslation: "Good evening, room service. What would you like?",
        choices: [
          { text: "Je voudrais commander un sandwich et une bouteille d'eau, s'il vous plaît.", hint: "I'd like to order a sandwich and a bottle of water, please.", correct: true,  feedback: "Très bien ! Comptez vingt minutes environ." },
          { text: "Pouvez-vous m'apporter des serviettes supplémentaires ?", hint: "Could you bring me extra towels?", correct: true,  feedback: "Bien sûr, je vous les apporte dans dix minutes." },
          { text: "Il y a un problème avec la télévision.", hint: "There's a problem with the television.", correct: false, feedback: "Je vais appeler la maintenance — quel est le problème exactement ?" },
        ],
      },
      {
        id: "n5",
        npc: "Réceptionniste",
        npcLine: "Bonjour ! Comment s'est passée votre nuit ? Vous souhaitez prolonger votre séjour ?",
        npcTranslation: "Good morning! How was your night? Would you like to extend your stay?",
        choices: [
          { text: "Très bien, merci. Non, je vais régler ma note ce matin.", hint: "Very well, thank you. No, I'll settle my bill this morning.", correct: true,  feedback: "Très bien ! Je prépare votre facture. Avez-vous consommé au minibar ?" },
          { text: "Oui, je voudrais rester une nuit de plus.", hint: "Yes, I'd like to stay one more night.", correct: true,  feedback: "Pas de problème, je prolonge votre réservation." },
          { text: "La chambre était bruyante et le lit inconfortable.", hint: "The room was noisy and the bed uncomfortable.", correct: false, feedback: "Je suis vraiment désolée. Nous allons en tenir compte pour améliorer nos services." },
        ],
      },
    ],
  },

  es: {
    venue: "hotel",
    title: "En el hotel",
    emoji: "🏨",
    setting: "Llegas al Hotel Gran Vía en Madrid tras un largo viaje. La recepcionista te recibe con una sonrisa.",
    nodes: [
      {
        id: "n1",
        npc: "Recepcionista",
        npcLine: "¡Buenas noches! Bienvenido al Hotel Gran Vía. ¿Tiene reserva?",
        npcTranslation: "Good evening! Welcome to Hotel Gran Vía. Do you have a reservation?",
        choices: [
          { text: "Sí, tengo una reserva a nombre de García.", hint: "Yes, I have a reservation under García.", correct: true,  feedback: "¡Perfecto! Le asigno la habitación 305, no fumadores." },
          { text: "No, ¿tienen habitaciones disponibles?", hint: "No, do you have available rooms?", correct: true,  feedback: "Déjeme comprobar… Sí, tenemos una doble libre." },
          { text: "No sé si he reservado.", hint: "I'm not sure if I booked.", correct: false, feedback: "Voy a buscarlo — ¿su nombre, por favor?" },
        ],
      },
      {
        id: "n2",
        npc: "Recepcionista",
        npcLine: "Su habitación está en la tercera planta. ¿Prefiere vista al jardín o a la calle?",
        npcTranslation: "Your room is on the third floor. Do you prefer a garden view or street view?",
        choices: [
          { text: "Prefiero la vista al jardín, por favor.", hint: "I prefer the garden view, please.", correct: true,  feedback: "¡Estupendo! La habitación 312 es perfecta para usted." },
          { text: "Me da igual, cualquiera está bien.", hint: "I don't mind, either is fine.", correct: true,  feedback: "En ese caso le doy la 308 — muy tranquila." },
          { text: "Quiero la habitación más barata.", hint: "I want the cheapest room.", correct: false, feedback: "Todas nuestras habitaciones tienen el mismo precio en temporada alta." },
        ],
      },
      {
        id: "n3",
        npc: "Botones",
        npcLine: "¿Le subo el equipaje? El ascensor está justo aquí.",
        npcTranslation: "Shall I take your luggage up? The lift is right here.",
        choices: [
          { text: "Sí, muchas gracias, es muy amable.", hint: "Yes, thank you very much, that's very kind.", correct: true,  feedback: "¡Con mucho gusto! Le alcanzo en un momento." },
          { text: "No, gracias, puedo con ello.", hint: "No thanks, I can manage.", correct: true,  feedback: "Como prefiera. ¡Que descanse!" },
          { text: "No tengo propina para usted.", hint: "I don't have a tip for you.", correct: false, feedback: "No se preocupe, es un placer ayudarle." },
        ],
      },
      {
        id: "n4",
        npc: "Servicio de habitaciones",
        npcLine: "Buenas noches, servicio de habitaciones. ¿En qué le puedo ayudar?",
        npcTranslation: "Good evening, room service. How can I help you?",
        choices: [
          { text: "Quisiera pedir un bocadillo y una botella de agua, por favor.", hint: "I'd like to order a sandwich and a bottle of water, please.", correct: true,  feedback: "Por supuesto. En unos veinte minutos se lo subimos." },
          { text: "¿Pueden traerme toallas adicionales?", hint: "Could you bring me extra towels?", correct: true,  feedback: "Claro que sí, en diez minutos se las llevamos." },
          { text: "Hay un problema con la televisión.", hint: "There's a problem with the TV.", correct: false, feedback: "Llamaré a mantenimiento — ¿cuál es el problema exactamente?" },
        ],
      },
      {
        id: "n5",
        npc: "Recepcionista",
        npcLine: "¡Buenos días! ¿Qué tal la noche? ¿Desea prolongar su estancia?",
        npcTranslation: "Good morning! How was your night? Would you like to extend your stay?",
        choices: [
          { text: "Muy bien, gracias. No, voy a hacer el check-out esta mañana.", hint: "Very well, thanks. No, I'll check out this morning.", correct: true,  feedback: "De acuerdo, preparo su factura. ¿Ha consumido algo del minibar?" },
          { text: "Sí, me gustaría quedarme una noche más.", hint: "Yes, I'd like to stay one more night.", correct: true,  feedback: "Sin problema, ampliamos su reserva." },
          { text: "La habitación era ruidosa y la cama incómoda.", hint: "The room was noisy and the bed uncomfortable.", correct: false, feedback: "Lo sentimos mucho. Tomaremos nota para mejorar." },
        ],
      },
    ],
  },

  en: {
    venue: "hotel",
    title: "At the Hotel",
    emoji: "🏨",
    setting: "You've just arrived at The Langham Hotel in London after a long journey. The receptionist greets you at the front desk.",
    nodes: [
      {
        id: "n1",
        npc: "Receptionist",
        npcLine: "Good evening and welcome to The Langham. Do you have a reservation with us?",
        npcTranslation: "'With us' is a polite phrase used in formal service contexts.",
        choices: [
          { text: "Yes, I have a booking under the name Johnson.", hint: "", correct: true,  feedback: "Wonderful — I can see your reservation. Room 412, non-smoking. Here's your key card." },
          { text: "No, I'm afraid I don't. Do you have any rooms available?", hint: "", correct: true,  feedback: "Let me check availability… You're in luck — we have a deluxe double." },
          { text: "I'm not sure whether I booked or not.", hint: "", correct: false, feedback: "Not to worry — could I take your name and I'll search the system?" },
        ],
      },
      {
        id: "n2",
        npc: "Receptionist",
        npcLine: "Your room is on the fourth floor. Would you prefer a city view or a courtyard view?",
        npcTranslation: "'Would you prefer…?' is a polite way to offer a choice.",
        choices: [
          { text: "A courtyard view would be lovely, thank you.", hint: "", correct: true,  feedback: "Excellent choice — it's much quieter. Here is your key card for room 403." },
          { text: "Either is fine with me — whichever is easiest.", hint: "", correct: true,  feedback: "In that case I'll give you 412 — it has a beautiful view of the city." },
          { text: "I want the cheapest room you have.", hint: "", correct: false, feedback: "All our rooms are the same rate at this time of year. Shall I assign you one?" },
        ],
      },
      {
        id: "n3",
        npc: "Concierge",
        npcLine: "Good evening! Shall I arrange for your luggage to be taken up? The lift is just to your right.",
        npcTranslation: "'Shall I arrange…?' is a very formal, polite offer — common in luxury hotels.",
        choices: [
          { text: "Yes please, that would be very helpful — thank you.", hint: "", correct: true,  feedback: "My pleasure! I'll have it brought up right away." },
          { text: "Thank you, but I'm happy to manage it myself.", hint: "", correct: true,  feedback: "Of course — enjoy your stay!" },
          { text: "Only if you don't expect a tip.", hint: "", correct: false, feedback: "Gratuities are entirely at your discretion, sir. Allow me to help you." },
        ],
      },
      {
        id: "n4",
        npc: "Room Service",
        npcLine: "Good evening, room service. How may I assist you?",
        npcTranslation: "'How may I assist you?' — very formal. 'How can I help?' is more casual.",
        choices: [
          { text: "I'd like to order a club sandwich and a pot of tea, please.", hint: "", correct: true,  feedback: "Certainly — that'll be with you in approximately twenty minutes." },
          { text: "Could I have some extra towels sent up, please?", hint: "", correct: true,  feedback: "Of course — I'll have housekeeping bring those up straight away." },
          { text: "The heating in my room doesn't seem to be working.", hint: "", correct: false, feedback: "I do apologise — I'll transfer you to maintenance immediately." },
        ],
      },
      {
        id: "n5",
        npc: "Receptionist",
        npcLine: "Good morning! I hope you slept well. Will you be checking out today, or would you like to extend your stay?",
        npcTranslation: "'I hope you slept well' — a polite, warm greeting used in hospitality.",
        choices: [
          { text: "Yes, I'll be checking out this morning. Could I have my bill, please?", hint: "", correct: true,  feedback: "Of course — I'll prepare your invoice. Did you use the minibar at all?" },
          { text: "Actually, I'd love to stay one more night if that's possible.", hint: "", correct: true,  feedback: "Let me check availability… Yes, we can extend your stay. No problem at all." },
          { text: "The room was far too noisy and the bed was dreadful.", hint: "", correct: false, feedback: "I'm terribly sorry to hear that. I'll note your feedback — please allow me to offer a discount." },
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

  const prompt = `Generate an immersive hotel check-in conversation scenario for a ${language} language learner at ${level} level.

Return ONLY valid JSON (no markdown) with this exact structure:
{
  "venue": "hotel",
  "title": "string — venue title in ${language}",
  "emoji": "🏨",
  "setting": "string — 2-sentence scene description in English",
  "nodes": [
    {
      "id": "n1",
      "npc": "string — NPC role",
      "npcLine": "string — what the NPC says in ${language}",
      "npcTranslation": "string — English translation or language note",
      "choices": [
        { "text": "string — response in ${language}", "hint": "string — English hint", "correct": true, "feedback": "string — NPC reaction in ${language}" },
        { "text": "string — response in ${language}", "hint": "string — English hint", "correct": false, "feedback": "string — NPC reaction in ${language}" },
        { "text": "string — response in ${language}", "hint": "string — English hint", "correct": false, "feedback": "string — NPC reaction in ${language}" }
      ]
    }
  ]
}

Generate 5 nodes covering: arrival/check-in, room preference, luggage/concierge, room service order, check-out.
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
        gameType:  "HOTEL",
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
    console.error("[hotel POST]", e);
  }

  return NextResponse.json({ xpEarned });
}
