"use client";

import { useState, useEffect } from "react";
import { SpeakButton } from "@/components/ui/SpeakButton";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────────

interface DialogChoice {
  text: string;        // what the player says (in target language)
  hint: string;        // English translation hint
  correct: boolean;
  response: string;    // NPC reaction shown after choice
}

interface DialogNode {
  id: string;
  npc: string;         // NPC name
  npcLine: string;     // what NPC says
  npcTranslation: string;
  choices: DialogChoice[];
}

interface Scene {
  id: string;
  title: string;
  emoji: string;
  setting: string;     // short scene description
  nodes: DialogNode[];
}

// ─── Scenes data ─────────────────────────────────────────────────────────────

const SCENES: Record<string, Scene[]> = {
  en: [
    {
      id: "en-cafe",
      title: "At the Coffee Shop",
      emoji: "☕",
      setting: "You walk into a busy coffee shop in London. The barista greets you.",
      nodes: [
        {
          id: "n1",
          npc: "Barista",
          npcLine: "Hi there! What can I get for you today?",
          npcTranslation: "Friendly greeting — they want your order.",
          choices: [
            { text: "A large latte, please.", hint: "Polite order with 'please'.", correct: true,  response: "Coming right up! One large latte for you." },
            { text: "Give me all the coffee.", hint: "Demanding — not polite.", correct: false, response: "Ha! I like your style, but let's start with one! 😄" },
            { text: "I don't drink coffee.", hint: "Odd reply to a coffee shop greeting.", correct: false, response: "We also have tea and juice — what would you like?" },
          ],
        },
        {
          id: "n2",
          npc: "Barista",
          npcLine: "Would you like anything to eat with that?",
          npcTranslation: "Offering a snack alongside your drink.",
          choices: [
            { text: "Yes, a blueberry muffin please.", hint: "Polite food order.", correct: true,  response: "Great choice! Freshly baked this morning." },
            { text: "No, I hate food.", hint: "Strange and rude response.", correct: false, response: "Oh… okay then. Enjoy your latte! 😬" },
            { text: "Just bring me everything on the menu.", hint: "Unreasonable request.", correct: false, response: "That would be quite a lot! 😂" },
          ],
        },
        {
          id: "n3",
          npc: "Barista",
          npcLine: "That's six pounds fifty, please.",
          npcTranslation: "Telling you the total cost.",
          choices: [
            { text: "Here you go. Keep the change!", hint: "Paying and leaving a tip.", correct: true,  response: "Thank you so much! Enjoy your coffee! ☕" },
            { text: "That's way too expensive!", hint: "Complaining about the price.", correct: false, response: "London prices, I'm afraid! 😅" },
            { text: "I have no money at all.", hint: "Can't pay.", correct: false, response: "Oh dear… would you like to wash some dishes? 😂" },
          ],
        },
      ],
    },
    {
      id: "en-hotel",
      title: "Checking into a Hotel",
      emoji: "🏨",
      setting: "You arrive at a hotel in Edinburgh. The receptionist is at the front desk.",
      nodes: [
        {
          id: "n1",
          npc: "Receptionist",
          npcLine: "Good evening! Do you have a reservation?",
          npcTranslation: "Asking if you booked in advance.",
          choices: [
            { text: "Yes, I have a booking under the name Smith.", hint: "Giving your name for the reservation.", correct: true,  response: "Wonderful, I'll look that up for you." },
            { text: "I don't know what a reservation is.", hint: "Confused response.", correct: false, response: "It's a booking — did you book online or by phone?" },
            { text: "No, I'll just sleep here in the lobby.", hint: "Silly response.", correct: false, response: "I'm afraid that's not quite how it works! 😅" },
          ],
        },
        {
          id: "n2",
          npc: "Receptionist",
          npcLine: "How many nights will you be staying?",
          npcTranslation: "Asking about the length of your stay.",
          choices: [
            { text: "Three nights, please.", hint: "Clear answer about your stay.", correct: true,  response: "Perfect. I'll put you in room 204 on the second floor." },
            { text: "I'll stay until you ask me to leave.", hint: "Vague, unhelpful answer.", correct: false, response: "We'll need a number of nights for billing… 😄" },
            { text: "What is a night?", hint: "Very confused response.", correct: false, response: "It's… the dark part of the day. 12 hours? 😮" },
          ],
        },
        {
          id: "n3",
          npc: "Receptionist",
          npcLine: "Here's your key card. Breakfast is served from 7am.",
          npcTranslation: "Giving you your room key and info about breakfast.",
          choices: [
            { text: "Thank you! Could you tell me where the lift is?", hint: "Polite follow-up question.", correct: true,  response: "Of course! It's just round the corner on the left." },
            { text: "I don't like key cards.", hint: "Unhelpful complaint.", correct: false, response: "Unfortunately that's all we have — enjoy your stay! 🗝️" },
            { text: "What is breakfast?", hint: "Very confused response.", correct: false, response: "The morning meal... eggs, toast, coffee? 😄" },
          ],
        },
      ],
    },
    {
      id: "en-directions",
      title: "Asking for Directions",
      emoji: "🗺️",
      setting: "You're lost in Manchester. You stop a friendly local for help.",
      nodes: [
        {
          id: "n1",
          npc: "Local",
          npcLine: "You look a bit lost — can I help you?",
          npcTranslation: "Offering to help you find your way.",
          choices: [
            { text: "Yes please! How do I get to the train station?", hint: "Polite request for directions.", correct: true,  response: "Sure! Go straight on and turn left at the traffic lights." },
            { text: "No, I'm a ghost.", hint: "Very strange response.", correct: false, response: "A ghost who asks directions — that's a first! 👻" },
            { text: "I'm looking for the internet.", hint: "Confused response.", correct: false, response: "You'll find that on your phone… 📱😄" },
          ],
        },
        {
          id: "n2",
          npc: "Local",
          npcLine: "Is this your first time in Manchester?",
          npcTranslation: "Making friendly conversation.",
          choices: [
            { text: "Yes, it's a fantastic city!", hint: "Positive, friendly reply.", correct: true,  response: "It is! You should visit the Northern Quarter — it's brilliant." },
            { text: "No, I was born here but I forgot everything.", hint: "Odd response.", correct: false, response: "That's... quite the memory problem! 😄" },
            { text: "I have no idea where I am.", hint: "Confused but honest response.", correct: false, response: "You're in Manchester! City of music and football! ⚽" },
          ],
        },
        {
          id: "n3",
          npc: "Local",
          npcLine: "Would you like me to walk you to the station?",
          npcTranslation: "Offering to guide you personally.",
          choices: [
            { text: "That's so kind of you, thank you!", hint: "Grateful, polite acceptance.", correct: true,  response: "My pleasure! It's just a five-minute walk." },
            { text: "No, strangers scare me.", hint: "Unhelpful, slightly rude.", correct: false, response: "Fair enough! Just follow the signs then. 😊" },
            { text: "How much do you charge?", hint: "Odd — locals don't charge for directions.", correct: false, response: "Nothing at all — just being friendly! 😄" },
          ],
        },
      ],
    },
  ],
  fr: [
    {
      id: "fr-cafe",
      title: "At the Café",
      emoji: "☕",
      setting: "You walk into a cozy Parisian café. The waiter approaches.",
      nodes: [
        {
          id: "n1",
          npc: "Waiter",
          npcLine: "Bonjour ! Vous désirez quelque chose ?",
          npcTranslation: "Hello! Would you like something?",
          choices: [
            { text: "Un café, s'il vous plaît.", hint: "A coffee, please.", correct: true,  response: "Très bien ! Un café pour vous." },
            { text: "Je veux de l'argent.", hint: "I want money.", correct: false, response: "Pardon ?! 😳 Ce n'est pas normal…" },
            { text: "Je ne parle pas français.", hint: "I don't speak French.", correct: false, response: "Mais… vous parlez très bien ! 😅" },
          ],
        },
        {
          id: "n2",
          npc: "Waiter",
          npcLine: "Vous voulez aussi quelque chose à manger ?",
          npcTranslation: "Would you also like something to eat?",
          choices: [
            { text: "Oui, un croissant s'il vous plaît.", hint: "Yes, a croissant please.", correct: true,  response: "Excellent choix ! Je reviens tout de suite." },
            { text: "Non, je déteste la nourriture.", hint: "No, I hate food.", correct: false, response: "Oh là là… Bon appétit quand même ? 😬" },
            { text: "Donnez-moi tout !", hint: "Give me everything!", correct: false, response: "Euh… c'est un peu beaucoup pour un café ! 😂" },
          ],
        },
        {
          id: "n3",
          npc: "Waiter",
          npcLine: "Ça fait cinq euros, s'il vous plaît.",
          npcTranslation: "That'll be five euros, please.",
          choices: [
            { text: "Voilà, merci beaucoup !", hint: "Here you go, thank you very much!", correct: true,  response: "Merci à vous ! Bonne journée ! ☀️" },
            { text: "C'est trop cher !", hint: "That's too expensive!", correct: false, response: "C'est le prix normal à Paris, monsieur… 😅" },
            { text: "Je n'ai pas d'argent.", hint: "I have no money.", correct: false, response: "Alors il faut faire la vaisselle ! 😂" },
          ],
        },
      ],
    },
    {
      id: "fr-train",
      title: "At the Train Station",
      emoji: "🚉",
      setting: "You're at Gare du Nord. You need to buy a ticket.",
      nodes: [
        {
          id: "n1",
          npc: "Agent",
          npcLine: "Bonjour, je peux vous aider ?",
          npcTranslation: "Hello, can I help you?",
          choices: [
            { text: "Oui, un billet pour Lyon s'il vous plaît.", hint: "Yes, a ticket to Lyon please.", correct: true,  response: "Bien sûr ! Aller simple ou aller-retour ?" },
            { text: "Où sont les toilettes ?", hint: "Where are the toilets?", correct: false, response: "Euh… au fond à droite. Mais c'est un guichet ici ! 😄" },
            { text: "Je cherche mon chien.", hint: "I'm looking for my dog.", correct: false, response: "Les animaux sont en zone B… mais c'est une gare, pas un parc ! 🐕" },
          ],
        },
        {
          id: "n2",
          npc: "Agent",
          npcLine: "Aller simple ou aller-retour ?",
          npcTranslation: "One way or round trip?",
          choices: [
            { text: "Aller-retour, s'il vous plaît.", hint: "Round trip, please.", correct: true,  response: "Parfait. Le prochain train part à 14h30." },
            { text: "Aller simple dans les deux sens.", hint: "One way in both directions.", correct: false, response: "C'est… exactement un aller-retour ! 😂" },
            { text: "Je ne sais pas encore.", hint: "I don't know yet.", correct: false, response: "Prenez votre temps, il y a une file derrière vous… ⏰" },
          ],
        },
        {
          id: "n3",
          npc: "Agent",
          npcLine: "Votre train part dans dix minutes. Bon voyage !",
          npcTranslation: "Your train leaves in ten minutes. Have a good trip!",
          choices: [
            { text: "Merci beaucoup ! Au revoir !", hint: "Thank you very much! Goodbye!", correct: true,  response: "Au revoir et bon voyage ! 🚄" },
            { text: "Dix minutes ? C'est long !", hint: "Ten minutes? That's long!", correct: false, response: "On dit « vite » à Paris… 😄" },
            { text: "Je préfère marcher.", hint: "I prefer to walk.", correct: false, response: "C'est à 500km… bonne chance ! 🚶‍♂️" },
          ],
        },
      ],
    },
    {
      id: "fr-lost",
      title: "Getting Lost",
      emoji: "🗺️",
      setting: "You're lost in Paris. You stop a local to ask for directions.",
      nodes: [
        {
          id: "n1",
          npc: "Parisien",
          npcLine: "Vous avez l'air perdu. Vous cherchez quelque chose ?",
          npcTranslation: "You look lost. Are you looking for something?",
          choices: [
            { text: "Oui ! Où est la Tour Eiffel ?", hint: "Yes! Where is the Eiffel Tower?", correct: true,  response: "C'est tout droit, puis à gauche. Dix minutes à pied !" },
            { text: "Non, je suis un fantôme.", hint: "No, I'm a ghost.", correct: false, response: "Un fantôme qui parle français… intéressant ! 👻" },
            { text: "Je cherche Internet.", hint: "I'm looking for the internet.", correct: false, response: "C'est dans votre téléphone, je crois… 📱😄" },
          ],
        },
        {
          id: "n2",
          npc: "Parisien",
          npcLine: "C'est la première fois à Paris ?",
          npcTranslation: "Is this your first time in Paris?",
          choices: [
            { text: "Oui, c'est magnifique ici !", hint: "Yes, it's beautiful here!", correct: true,  response: "Paris est toujours belle ! Bonne visite !" },
            { text: "Non, j'habite ici depuis toujours.", hint: "No, I've always lived here.", correct: false, response: "Alors pourquoi vous êtes perdu ? 😏" },
            { text: "Je ne sais pas ce qu'est Paris.", hint: "I don't know what Paris is.", correct: false, response: "C'est… assez unique comme réponse ! 😂" },
          ],
        },
        {
          id: "n3",
          npc: "Parisien",
          npcLine: "Vous voulez que je vous accompagne ?",
          npcTranslation: "Would you like me to walk you there?",
          choices: [
            { text: "C'est très gentil, merci !", hint: "That's very kind, thank you!", correct: true,  response: "Avec plaisir ! Suivez-moi !" },
            { text: "Non, j'ai peur des Parisiens.", hint: "No, I'm afraid of Parisians.", correct: false, response: "On n'est pas si méchants, vous savez… 😂" },
            { text: "Je vous paie combien ?", hint: "How much do I pay you?", correct: false, response: "C'est gratuit ! On est à Paris, pas dans un taxi ! 😄" },
          ],
        },
      ],
    },
  ],

  es: [
    {
      id: "es-cafe",
      title: "En el Café",
      emoji: "☕",
      setting: "You walk into a café in Madrid. The waiter comes over.",
      nodes: [
        {
          id: "n1",
          npc: "Camarero",
          npcLine: "¡Buenos días! ¿Qué le pongo?",
          npcTranslation: "Good morning! What can I get you?",
          choices: [
            { text: "Un café con leche, por favor.", hint: "A coffee with milk, please.", correct: true,  response: "¡Enseguida! Un café con leche." },
            { text: "Quiero todo el dinero.", hint: "I want all the money.", correct: false, response: "¡Esto es un café, no un banco! 😳" },
            { text: "No hablo español.", hint: "I don't speak Spanish.", correct: false, response: "Pues lo habla muy bien… 😅" },
          ],
        },
        {
          id: "n2",
          npc: "Camarero",
          npcLine: "¿Desea también algo para comer?",
          npcTranslation: "Would you also like something to eat?",
          choices: [
            { text: "Sí, una tostada por favor.", hint: "Yes, a toast please.", correct: true,  response: "¡Perfecto! Tostada con tomate, ¿verdad?" },
            { text: "No, odio la comida.", hint: "No, I hate food.", correct: false, response: "¡Qué pena! La comida española es la mejor… 😄" },
            { text: "Tráigame todo el menú.", hint: "Bring me the whole menu.", correct: false, response: "¡Eso sería mucho para el desayuno! 😂" },
          ],
        },
        {
          id: "n3",
          npc: "Camarero",
          npcLine: "Son cuatro euros, por favor.",
          npcTranslation: "That'll be four euros, please.",
          choices: [
            { text: "Aquí tiene. ¡Muchas gracias!", hint: "Here you go. Thank you very much!", correct: true,  response: "¡Gracias a usted! ¡Hasta pronto! ☀️" },
            { text: "¡Es demasiado caro!", hint: "That's too expensive!", correct: false, response: "Es precio normal en Madrid… 😅" },
            { text: "No tengo dinero.", hint: "I have no money.", correct: false, response: "¡Entonces hay que fregar los platos! 😂" },
          ],
        },
      ],
    },
    {
      id: "es-market",
      title: "At the Market",
      emoji: "🛒",
      setting: "You're at a local market in Barcelona. A vendor calls you over.",
      nodes: [
        {
          id: "n1",
          npc: "Vendor",
          npcLine: "¡Hola! ¿Qué busca usted hoy?",
          npcTranslation: "Hello! What are you looking for today?",
          choices: [
            { text: "Busco tomates frescos.", hint: "I'm looking for fresh tomatoes.", correct: true,  response: "¡Los mejores tomates de Barcelona! Aquí los tiene." },
            { text: "Busco la felicidad.", hint: "I'm looking for happiness.", correct: false, response: "Jaja… ¡pruebe con los tomates! 🍅😄" },
            { text: "No busco nada, solo miro.", hint: "I'm not looking for anything, just browsing.", correct: false, response: "¡Pero mire qué frescos están estos tomates! 😄" },
          ],
        },
        {
          id: "n2",
          npc: "Vendor",
          npcLine: "¿Cuántos kilos quiere?",
          npcTranslation: "How many kilos do you want?",
          choices: [
            { text: "Un kilo, por favor.", hint: "One kilo, please.", correct: true,  response: "¡Perfecto! Un kilo de tomates frescos." },
            { text: "Quiero un millón de kilos.", hint: "I want a million kilos.", correct: false, response: "¡Necesita un camión entonces! 🚛😂" },
            { text: "¿Qué es un kilo?", hint: "What is a kilo?", correct: false, response: "Es… la unidad de peso básica. 😄" },
          ],
        },
        {
          id: "n3",
          npc: "Vendor",
          npcLine: "Son dos euros. ¿Algo más?",
          npcTranslation: "That's two euros. Anything else?",
          choices: [
            { text: "No gracias, eso es todo. ¡Adiós!", hint: "No thanks, that's all. Goodbye!", correct: true,  response: "¡Hasta luego! ¡Buen provecho! 🍅" },
            { text: "Sí, quiero el mercado entero.", hint: "Yes, I want the whole market.", correct: false, response: "¡Eso sí que es hacer la compra! 😂" },
            { text: "¿Me da un descuento?", hint: "Can you give me a discount?", correct: false, response: "¡Ya es el mejor precio de Barcelona! 😅" },
          ],
        },
      ],
    },
    {
      id: "es-lost",
      title: "Getting Lost",
      emoji: "🗺️",
      setting: "You're lost in Seville. You ask a local for help.",
      nodes: [
        {
          id: "n1",
          npc: "Local",
          npcLine: "Parece usted perdido. ¿Le puedo ayudar?",
          npcTranslation: "You look lost. Can I help you?",
          choices: [
            { text: "Sí, ¿dónde está la Catedral?", hint: "Yes, where is the Cathedral?", correct: true,  response: "¡Todo recto y a la derecha! Son cinco minutos." },
            { text: "No, soy un fantasma.", hint: "No, I'm a ghost.", correct: false, response: "Un fantasma muy educado… ¡buenas tardes! 👻" },
            { text: "Estoy buscando Internet.", hint: "I'm looking for the internet.", correct: false, response: "Está en su móvil, creo… 📱😄" },
          ],
        },
        {
          id: "n2",
          npc: "Local",
          npcLine: "¿Es su primera vez en Sevilla?",
          npcTranslation: "Is this your first time in Seville?",
          choices: [
            { text: "Sí, ¡es una ciudad preciosa!", hint: "Yes, it's a beautiful city!", correct: true,  response: "¡La más bonita de España! ¡Bienvenido!" },
            { text: "No, nací aquí pero no recuerdo nada.", hint: "No, I was born here but don't remember anything.", correct: false, response: "Vaya memoria… 😄" },
            { text: "No sé dónde estoy.", hint: "I don't know where I am.", correct: false, response: "¡Está en Sevilla! ¡La ciudad del sol! ☀️" },
          ],
        },
        {
          id: "n3",
          npc: "Local",
          npcLine: "¿Quiere que le acompañe hasta la Catedral?",
          npcTranslation: "Would you like me to walk you to the Cathedral?",
          choices: [
            { text: "¡Qué amable! Muchas gracias.", hint: "How kind! Thank you very much.", correct: true,  response: "¡Con mucho gusto! Por aquí, por favor." },
            { text: "No, tengo miedo.", hint: "No, I'm scared.", correct: false, response: "¡No muerdo! Solo soy un sevillano amable 😂" },
            { text: "¿Cuánto me cobra?", hint: "How much do you charge?", correct: false, response: "¡Es gratis! En Sevilla somos así de simpáticos 😊" },
          ],
        },
      ],
    },
  ],
};

// ─── Component ────────────────────────────────────────────────────────────────

export function DialogAdventure({ targetLang }: { targetLang: string }) {
  const lang = (["fr","es","en"].includes(targetLang) ? targetLang : "fr") as "fr" | "es" | "en";
  const scenes = SCENES[lang];

  const [sceneIdx, setSceneIdx] = useState(0);
  const [nodeIdx, setNodeIdx]   = useState(0);
  const [picked, setPicked]     = useState<number | null>(null);
  const [score, setScore]       = useState(0);
  const [finished, setFinished] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [totalNodes] = useState(() => scenes.reduce((sum, s) => sum + s.nodes.length, 0));
  const [nodesPlayed, setNodesPlayed] = useState(0);

  const scene = scenes[sceneIdx];
  const node  = scene?.nodes[nodeIdx];

  // Shuffle choices every time a new node loads so correct answer isn't always first
  const [shuffledChoices, setShuffledChoices] = useState<DialogChoice[]>([]);
  useEffect(() => {
    if (node) {
      setShuffledChoices([...node.choices].sort(() => Math.random() - 0.5));
    }
  }, [sceneIdx, nodeIdx]);

  const handleChoice = (idx: number) => {
    if (picked !== null) return;
    setPicked(idx);
    const choice = shuffledChoices[idx];
    if (choice.correct) setScore((s) => s + 1);
  };

  const handleNext = () => {
    const nextNode  = nodeIdx + 1;
    const played    = nodesPlayed + 1;
    setNodesPlayed(played);
    setPicked(null);

    if (nextNode < scene.nodes.length) {
      setNodeIdx(nextNode);
    } else {
      const nextScene = sceneIdx + 1;
      if (nextScene < scenes.length) {
        setSceneIdx(nextScene);
        setNodeIdx(0);
      } else {
        // All scenes done
        setFinished(true);
        fetch("/api/games/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameType: "DIALOG_ADVENTURE", score, wordsUsed: [] }),
        })
          .then((r) => r.json())
          .then((d) => {
            setXpEarned(d.xpEarned ?? 15);
            window.dispatchEvent(new CustomEvent("xp-updated"));
          })
          .catch(() => {});
      }
    }
  };

  if (finished) {
    const pct = Math.round((score / totalNodes) * 100);
    return (
      <div style={{ maxWidth: 520, textAlign: "center" }}>
        <div className="card" style={{ padding: "40px 28px" }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>{pct === 100 ? "🏆" : pct >= 66 ? "🎉" : "💪"}</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", margin: "0 0 8px" }}>Adventure Complete!</h2>
          <p style={{ fontSize: 14, color: "var(--text-2)", margin: "0 0 20px" }}>
            <strong style={{ color: "var(--accent)" }}>{score}/{totalNodes}</strong> correct choices · {pct}%
          </p>
          {xpEarned > 0 && (
            <div style={{ padding: "10px 16px", borderRadius: 12, background: "var(--accent-dim)", marginBottom: 20, fontSize: 14, fontWeight: 700, color: "var(--accent)" }}>
              +{xpEarned} XP earned!
            </div>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => window.location.reload()} className="btn-primary" style={{ flex: 1 }}>
              Play again
            </button>
            <Link href="/games" className="btn-outline" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
              All games
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!node) return null;

  const choice = picked !== null ? shuffledChoices[picked] : null;
  const pctDone = (nodesPlayed / totalNodes) * 100;

  return (
    <div style={{ maxWidth: 560 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>{scene.emoji}</span>
          <div>
            <p style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", margin: 0 }}>{scene.title}</p>
            <p style={{ fontSize: 12, color: "var(--text-3)", margin: 0 }}>
              Scene {sceneIdx + 1}/{scenes.length} · Exchange {nodeIdx + 1}/{scene.nodes.length}
            </p>
          </div>
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--green)" }}>✓ {score}</span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 5, background: "var(--surface-3)", borderRadius: 999, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ height: "100%", width: `${pctDone}%`, background: "linear-gradient(90deg,var(--accent),var(--accent-2))", borderRadius: 999, transition: "width 0.4s ease" }} />
      </div>

      {/* Scene setting (first node only) */}
      {nodeIdx === 0 && (
        <div style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", marginBottom: 16, fontSize: 13, color: "var(--text-2)", fontStyle: "italic" }}>
          📍 {scene.setting}
        </div>
      )}

      {/* NPC speech bubble */}
      <div className="card" style={{ padding: "20px 22px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", margin: 0 }}>
            {node.npc}
          </p>
          <SpeakButton text={node.npcLine} lang={lang} size={13} />
        </div>
        <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", margin: "0 0 6px", lineHeight: 1.4 }}>
          "{node.npcLine}"
        </p>
        <p style={{ fontSize: 12, color: "var(--text-3)", margin: 0 }}>
          {node.npcTranslation}
        </p>
      </div>

      {/* Choices */}
      {picked === null ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-3)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Your response:
          </p>
          {shuffledChoices.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                onClick={() => handleChoice(i)}
                style={{
                  flex: 1,
                  textAlign: "left",
                  padding: "14px 18px",
                  borderRadius: 12,
                  border: "1.5px solid var(--border-md)",
                  background: "var(--surface-2)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                  e.currentTarget.style.background = "var(--accent-dim)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-md)";
                  e.currentTarget.style.background = "var(--surface-2)";
                }}
              >
                <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: "0 0 3px" }}>
                  {c.text}
                </p>
                <p style={{ fontSize: 12, color: "var(--text-3)", margin: 0 }}>
                  {c.hint}
                </p>
              </button>
              <SpeakButton text={c.text} lang={lang} size={13} />
            </div>
          ))}
        </div>
      ) : (
        <div>
          {/* Result */}
          <div style={{
            padding: "16px 18px",
            borderRadius: 12,
            border: `1.5px solid ${choice!.correct ? "var(--green)" : "var(--red)"}`,
            background: choice!.correct ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
            marginBottom: 12,
          }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: choice!.correct ? "var(--green)" : "var(--red)", margin: "0 0 6px" }}>
              {choice!.correct ? "✓ Great choice!" : "✗ Not quite…"}
            </p>
            <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", margin: "0 0 4px" }}>
              {node.npc}: "{choice!.response}"
            </p>
            {!choice!.correct && (
              <p style={{ fontSize: 12, color: "var(--text-2)", margin: "6px 0 0" }}>
                Best answer: <strong style={{ color: "var(--green)" }}>{node.choices.find((c) => c.correct)?.text}</strong>
              </p>
            )}
          </div>

          <button
            onClick={handleNext}
            className="btn-primary"
            style={{ width: "100%" }}
          >
            {nodeIdx + 1 < scene.nodes.length
              ? "Next →"
              : sceneIdx + 1 < scenes.length
              ? `Next Scene: ${scenes[sceneIdx + 1].emoji} ${scenes[sceneIdx + 1].title} →`
              : "See Results 🏆"}
          </button>
        </div>
      )}
    </div>
  );
}
