export const dynamic = "force-dynamic";
import { Metadata } from "next";
import { GamesHubClient, type SerializedGame } from "@/components/games/GamesHubClient";

export const metadata: Metadata = {
  title: "Games — Lingova",
  description: "Practice vocabulary with fun games",
};

const GAMES: SerializedGame[] = [
  // Vocabulary
  { href: "/games/flashcards",      gameType: "FLASHCARDS",       iconName: "Layers",        title: "Flashcards",        desc: "Flip cards, test recall, build memory through spaced repetition",          difficulty: "A1", category: "vocabulary", filterCategory: "Vocabulary", xp: 20 },
  { href: "/games/true-false",      gameType: "TRUE_FALSE",       iconName: "CheckSquare",   title: "True or False",     desc: "Is the translation correct? Quick-fire judgement rounds",                  difficulty: "A1", category: "vocabulary", filterCategory: "Vocabulary", xp: 20 },
  { href: "/games/matching",        gameType: "MATCHING",         iconName: "Link2",         title: "Word Match",        desc: "Match target language words to English translations against the clock",    difficulty: "A2", category: "vocabulary", filterCategory: "Vocabulary", xp: 30 },
  { href: "/games/word-scramble",   gameType: "WORD_SCRAMBLE",    iconName: "Shuffle",       title: "Word Scramble",     desc: "Unscramble jumbled vocabulary words — race against your brain",            difficulty: "A2", category: "vocabulary", filterCategory: "Vocabulary", xp: 25 },
  { href: "/games/speed-typing",    gameType: "SPEED_TYPING",     iconName: "Keyboard",      title: "Speed Typing",      desc: "See the meaning, type the word — train muscle memory fast",                difficulty: "B1", category: "vocabulary", filterCategory: "Vocabulary", xp: 30 },
  { href: "/games/memory-palace",   gameType: "MEMORY_PALACE",    iconName: "Puzzle",        title: "Memory Palace",     desc: "Place words in virtual rooms — spatial memory that never fades",           difficulty: "B2", category: "vocabulary", filterCategory: "Vocabulary", xp: 50 },
  // Grammar
  { href: "/games/fill-blank",      gameType: "FILL_BLANK",       iconName: "PenLine",       title: "Fill the Blank",    desc: "Complete sentences — context makes vocabulary stick",                       difficulty: "A2", category: "grammar",    filterCategory: "Grammar",    xp: 25 },
  { href: "/games/sentence-builder",gameType: "SENTENCE_BUILDER", iconName: "AlignJustify",  title: "Sentence Builder",  desc: "Tap word tiles to assemble correct sentences — master grammar fast",        difficulty: "B1", category: "grammar",    filterCategory: "Grammar",    xp: 30 },
  { href: "/games/dialog-adventure",gameType: "DIALOG_ADVENTURE", iconName: "MessagesSquare",title: "Dialog Adventure",  desc: "Real scenarios, real conversations — café, train station, getting lost",   difficulty: "B1", category: "grammar",    filterCategory: "Grammar",    xp: 40 },
  { href: "/games/word-association",gameType: "WORD_ASSOCIATION", iconName: "Network",       title: "Word Association",  desc: "Tap all words related to the target word before the timer runs out",        difficulty: "A2", category: "grammar",    filterCategory: "Grammar",    xp: 35 },
  { href: "/games/error-detective", gameType: "ERROR_DETECTIVE",  iconName: "Search",        title: "Error Detective",   desc: "Find the grammar mistake in each sentence and correct it",                  difficulty: "B1", category: "grammar",    filterCategory: "Grammar",    xp: 35 },
  { href: "/games/tense-challenge", gameType: "TENSE_CHALLENGE",  iconName: "Clock",         title: "Tense Challenge",   desc: "Rewrite sentences in different tenses — the hardest grammar skill",         difficulty: "B1", category: "grammar",    filterCategory: "Grammar",    xp: 35 },
  // Listening
  { href: "/games/immersion",       gameType: "IMMERSION",        iconName: "Home",          title: "Immersion Room",    desc: "Find objects in a 3D room by listening to voice commands",                  difficulty: "A2", category: "listening",  filterCategory: "Listening",  xp: 40 },
  { href: "/games/listen-quiz",     gameType: "LISTEN_QUIZ",      iconName: "Headphones",    title: "Listen & Choose",   desc: "Hear the word spoken — pick the right translation from 4",                 difficulty: "B1", category: "listening",  filterCategory: "Listening",  xp: 35 },
  { href: "/games/dictation",       gameType: "DICTATION",        iconName: "Mic",           title: "Dictation",         desc: "Listen and type exactly what you hear — spelling and accents count",        difficulty: "A2", category: "listening",  filterCategory: "Listening",  xp: 35 },
  { href: "/games/story-audio",     gameType: "STORY_AUDIO",      iconName: "BookOpen",      title: "Story Audio",       desc: "Listen to a short story then answer comprehension questions",               difficulty: "B1", category: "listening",  filterCategory: "Listening",  xp: 35 },
  { href: "/games/speed-listening", gameType: "SPEED_LISTENING",  iconName: "Radio",         title: "Speed Listening",   desc: "Audio at 1.5× speed — bridge the gap to real conversation",                 difficulty: "B2", category: "listening",  filterCategory: "Listening",  xp: 50 },
  { href: "/games/accent-challenge",gameType: "ACCENT_CHALLENGE", iconName: "Mic2",          title: "Accent Challenge",  desc: "Same word, three accents — identify it across regional variations",         difficulty: "B1", category: "listening",  filterCategory: "Listening",  xp: 35 },
  // Immersive
  { href: "/games/interview",       gameType: "INTERVIEW",        iconName: "Briefcase",     title: "Job Interview",     desc: "Sit across a 3D interviewer — answer in your target language to get hired", difficulty: "B2", category: "immersive",  filterCategory: "Immersive",  xp: 40 },
  { href: "/games/city-explorer",   gameType: "CITY_EXPLORER",    iconName: "Map",           title: "City Explorer",     desc: "Walk a 2D city, find NPCs, answer their challenges — full RPG experience", difficulty: "B2", category: "immersive",  filterCategory: "Immersive",  xp: 50 },
  { href: "/games/city-3d",         gameType: "CITY_EXPLORER",    iconName: "Box",           title: "Word Blaster 3D",   desc: "Shoot the correct translation in a neon 3D arena",                          difficulty: "C1", category: "immersive",  filterCategory: "Immersive",  xp: 60 },
  { href: "/games/airport",         gameType: "AIRPORT",          iconName: "Plane",         title: "Airport",           desc: "Check in, pass security and board your flight — real conversations",        difficulty: "B1", category: "immersive",  filterCategory: "Immersive",  xp: 40 },
  { href: "/games/doctor-office",   gameType: "DOCTOR_OFFICE",    iconName: "Stethoscope",   title: "Doctor's Office",   desc: "Describe your symptoms, understand the diagnosis and pick up your prescription", difficulty: "B1", category: "immersive", filterCategory: "Immersive", xp: 40 },
  { href: "/games/market-bazaar",   gameType: "MARKET_BAZAAR",    iconName: "ShoppingBag",   title: "Market Bazaar",     desc: "Browse stalls, ask prices and haggle with vendors at the local market",     difficulty: "A2", category: "immersive",  filterCategory: "Immersive",  xp: 35 },
  { href: "/games/hotel",           gameType: "HOTEL",            iconName: "Hotel",         title: "Hotel",             desc: "Check in, order room service, and handle requests at a hotel",              difficulty: "B1", category: "immersive",  filterCategory: "Immersive",  xp: 40 },
];

export default function GamesPage() {
  return <GamesHubClient games={GAMES} />;
}
