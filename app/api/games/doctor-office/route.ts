import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── Static fallback ───────────────────────────────────────────────────────────

const FALLBACK: Record<string, object> = {
  fr: {
    venue: "doctor-office",
    title: "Chez le médecin",
    emoji: "🏥",
    setting: "Vous n'êtes pas en bonne santé et vous avez rendez-vous avec le Dr. Moreau. La secrétaire vous accueille à la réception.",
    nodes: [
      {
        id: "n1",
        npc: "Secrétaire",
        npcLine: "Bonjour ! Vous avez rendez-vous ?",
        npcTranslation: "Hello! Do you have an appointment?",
        choices: [
          { text: "Oui, j'ai rendez-vous à quinze heures.", hint: "Yes, I have an appointment at 3 p.m.", correct: true,  feedback: "Très bien, asseyez-vous s'il vous plaît." },
          { text: "Non, je veux voir le médecin maintenant.", hint: "No, I want to see the doctor now.", correct: false, feedback: "Sans rendez-vous, vous devrez attendre longtemps." },
          { text: "Je ne sais pas.", hint: "I don't know.", correct: false, feedback: "Vous devez appeler pour vérifier votre rendez-vous." },
        ],
      },
      {
        id: "n2",
        npc: "Dr. Moreau",
        npcLine: "Bonjour ! Qu'est-ce qui vous amène aujourd'hui ?",
        npcTranslation: "Hello! What brings you here today?",
        choices: [
          { text: "J'ai mal à la gorge et de la fièvre depuis deux jours.", hint: "I have a sore throat and a fever for two days.", correct: true,  feedback: "Je vois. Ouvrez la bouche s'il vous plaît." },
          { text: "Je me sens très bien, merci.", hint: "I feel very well, thank you.", correct: false, feedback: "Alors pourquoi êtes-vous ici ? 🤔" },
          { text: "Je veux des médicaments.", hint: "I want medicine.", correct: false, feedback: "Il faut d'abord expliquer vos symptômes !" },
        ],
      },
      {
        id: "n3",
        npc: "Dr. Moreau",
        npcLine: "Depuis quand avez-vous ces symptômes ? Avez-vous pris des médicaments ?",
        npcTranslation: "How long have you had these symptoms? Have you taken any medicine?",
        choices: [
          { text: "Depuis hier soir. Non, je n'ai rien pris.", hint: "Since last night. No, I haven't taken anything.", correct: true,  feedback: "D'accord, je vais vous examiner." },
          { text: "Je ne me souviens pas.", hint: "I don't remember.", correct: false, feedback: "Essayez de vous souvenir, c'est important pour le diagnostic." },
          { text: "J'ai pris beaucoup d'aspirine.", hint: "I took a lot of aspirin.", correct: false, feedback: "Combien exactement ? Ce n'est pas recommandé sans avis médical." },
        ],
      },
      {
        id: "n4",
        npc: "Dr. Moreau",
        npcLine: "Vous avez une angine. Je vais vous prescrire des antibiotiques. Êtes-vous allergique à la pénicilline ?",
        npcTranslation: "You have tonsillitis. I'll prescribe antibiotics. Are you allergic to penicillin?",
        choices: [
          { text: "Non, je ne suis pas allergique.", hint: "No, I'm not allergic.", correct: true,  feedback: "Très bien. Prenez ce médicament trois fois par jour." },
          { text: "Oui, je suis allergique à la pénicilline.", hint: "Yes, I'm allergic to penicillin.", correct: true,  feedback: "Merci de me le dire ! Je vais vous prescrire autre chose." },
          { text: "Je ne sais pas si je suis allergique.", hint: "I don't know if I'm allergic.", correct: false, feedback: "Il faut vérifier — c'est très important pour votre sécurité." },
        ],
      },
      {
        id: "n5",
        npc: "Pharmacien",
        npcLine: "Bonjour ! Vous avez une ordonnance ?",
        npcTranslation: "Hello! Do you have a prescription?",
        choices: [
          { text: "Oui, voici mon ordonnance.", hint: "Yes, here is my prescription.", correct: true,  feedback: "Très bien ! Je vous prépare ça tout de suite." },
          { text: "Non, je veux juste des vitamines.", hint: "No, I just want vitamins.", correct: false, feedback: "Les antibiotiques nécessitent une ordonnance obligatoire." },
          { text: "Le médecin me l'a donné, mais je l'ai perdue.", hint: "The doctor gave it to me, but I lost it.", correct: false, feedback: "Vous devrez retourner chez le médecin pour en avoir une autre." },
        ],
      },
    ],
  },
  es: {
    venue: "doctor-office",
    title: "En el médico",
    emoji: "🏥",
    setting: "No te encuentras bien y tienes cita con el Dr. García. La recepcionista te saluda.",
    nodes: [
      {
        id: "n1",
        npc: "Recepcionista",
        npcLine: "¡Buenos días! ¿Tiene cita?",
        npcTranslation: "Good morning! Do you have an appointment?",
        choices: [
          { text: "Sí, tengo cita a las tres.", hint: "Yes, I have an appointment at three.", correct: true,  feedback: "Muy bien, siéntese por favor." },
          { text: "No, quiero ver al médico ahora.", hint: "No, I want to see the doctor now.", correct: false, feedback: "Sin cita tendrá que esperar mucho tiempo." },
          { text: "No lo sé.", hint: "I don't know.", correct: false, feedback: "Debe llamar para verificar su cita." },
        ],
      },
      {
        id: "n2",
        npc: "Dr. García",
        npcLine: "¡Hola! ¿Qué le trae por aquí hoy?",
        npcTranslation: "Hello! What brings you here today?",
        choices: [
          { text: "Me duele la garganta y tengo fiebre desde dos días.", hint: "My throat hurts and I've had a fever for two days.", correct: true,  feedback: "Entiendo. Abra la boca, por favor." },
          { text: "Me encuentro muy bien, gracias.", hint: "I feel very well, thank you.", correct: false, feedback: "Entonces, ¿por qué está aquí? 🤔" },
          { text: "Quiero medicamentos.", hint: "I want medicine.", correct: false, feedback: "¡Primero debe explicar sus síntomas!" },
        ],
      },
      {
        id: "n3",
        npc: "Dr. García",
        npcLine: "¿Desde cuándo tiene estos síntomas? ¿Ha tomado algún medicamento?",
        npcTranslation: "How long have you had these symptoms? Have you taken any medicine?",
        choices: [
          { text: "Desde ayer por la noche. No, no he tomado nada.", hint: "Since last night. No, I haven't taken anything.", correct: true,  feedback: "De acuerdo, voy a examinarle." },
          { text: "No me acuerdo.", hint: "I don't remember.", correct: false, feedback: "Intente recordar, es importante para el diagnóstico." },
          { text: "He tomado mucho ibuprofeno.", hint: "I've taken a lot of ibuprofen.", correct: false, feedback: "¿Cuánto exactamente? No se recomienda sin consejo médico." },
        ],
      },
      {
        id: "n4",
        npc: "Dr. García",
        npcLine: "Tiene anginas. Le voy a recetar antibióticos. ¿Es alérgico a la penicilina?",
        npcTranslation: "You have tonsillitis. I'll prescribe antibiotics. Are you allergic to penicillin?",
        choices: [
          { text: "No, no soy alérgico.", hint: "No, I'm not allergic.", correct: true,  feedback: "Perfecto. Tome este medicamento tres veces al día." },
          { text: "Sí, soy alérgico a la penicilina.", hint: "Yes, I'm allergic to penicillin.", correct: true,  feedback: "¡Gracias por decírmelo! Le recetaré otra cosa." },
          { text: "No sé si soy alérgico.", hint: "I don't know if I'm allergic.", correct: false, feedback: "Hay que verificarlo — es muy importante para su seguridad." },
        ],
      },
      {
        id: "n5",
        npc: "Farmacéutico",
        npcLine: "¡Buenas! ¿Tiene receta?",
        npcTranslation: "Hello! Do you have a prescription?",
        choices: [
          { text: "Sí, aquí está mi receta.", hint: "Yes, here is my prescription.", correct: true,  feedback: "¡Perfecto! Se la preparo enseguida." },
          { text: "No, solo quiero vitaminas.", hint: "No, I just want vitamins.", correct: false, feedback: "Los antibióticos requieren receta obligatoria." },
          { text: "El médico me la dio pero la perdí.", hint: "The doctor gave it to me but I lost it.", correct: false, feedback: "Tendrá que volver al médico para conseguir otra." },
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

  const prompt = `Generate a doctor's office conversation scenario for a ${language} language learner at ${level} level.

Return ONLY valid JSON (no markdown) with this exact structure:
{
  "venue": "doctor-office",
  "title": "string — venue title in ${language}",
  "emoji": "🏥",
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

Generate 5 nodes covering: receptionist check-in, describing symptoms to doctor, answering doctor questions, receiving diagnosis/prescription, pharmacy pickup.
Each node has exactly 3 choices — only 1 marked correct: true (unless both first two choices are valid, then mark 2 correct).
Use natural ${language} appropriate for ${level} level.`;

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
        gameType:  "DOCTOR_OFFICE",
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
    console.error("[doctor-office POST]", e);
  }

  return NextResponse.json({ xpEarned });
}
