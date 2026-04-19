/**
 * Spanish learning path navigation metadata.
 * Mirrors the French version (learning-path-meta.ts) structure so the learn page
 * can swap between them based on the user's targetLanguage.
 */

import type { TopicMeta } from "./learning-path-meta";

export const LEARNING_PATH_META_ES: TopicMeta[] = [
  {
    id: "alphabet",
    title: "El Alfabeto Español",
    emoji: "🔤",
    lessons: [
      { id: "alphabet-1", title: "Letras A-M", emoji: "🅰️", type: "alphabet" },
      { id: "alphabet-2", title: "Letras N-Z", emoji: "🇿", type: "alphabet" },
    ],
  },
  {
    id: "pronunciation",
    title: "Sonidos del Español",
    emoji: "🔊",
    requiredTopicId: "alphabet",
    lessons: [
      { id: "sounds-vowels",     title: "Sonidos de Vocales", emoji: "🗣️", type: "pronunciation" },
      { id: "sounds-consonants", title: "Reglas de Consonantes", emoji: "🤫", type: "pronunciation" },
    ],
  },
  {
    id: "greetings",
    title: "Saludos y Básicos",
    emoji: "👋",
    requiredTopicId: "pronunciation",
    lessons: [
      { id: "greetings-hello", title: "Saludar y Despedirse", emoji: "👋", type: "conversation" },
      { id: "greetings-intro", title: "Presentarse", emoji: "🙋", type: "conversation" },
    ],
  },
  {
    id: "numbers",
    title: "Números y Conteo",
    emoji: "🔢",
    requiredTopicId: "greetings",
    lessons: [
      { id: "numbers-1-20",   title: "Números 1-20",    emoji: "1️⃣", type: "vocabulary" },
      { id: "numbers-21-100", title: "Números 21-100",  emoji: "💯", type: "vocabulary" },
    ],
  },
  {
    id: "essentials",
    title: "Frases Esenciales",
    emoji: "🆘",
    requiredTopicId: "greetings",
    lessons: [
      { id: "essentials-survival", title: "Frases de Supervivencia", emoji: "🆘", type: "conversation" },
    ],
  },
  {
    id: "articles-gender",
    title: "Artículos y Género",
    emoji: "⚤",
    requiredTopicId: "essentials",
    lessons: [
      { id: "articles-definite",   title: "El / La / Los / Las",     emoji: "📎", type: "grammar" },
      { id: "articles-indefinite", title: "Un / Una / Unos / Unas",  emoji: "🔘", type: "grammar" },
    ],
  },
  {
    id: "subject-pronouns",
    title: "Pronombres y Ser",
    emoji: "👤",
    requiredTopicId: "articles-gender",
    lessons: [
      { id: "pronouns-basic", title: "Pronombres Personales",     emoji: "👤", type: "grammar" },
      { id: "ser-verb",       title: "El Verbo Ser",              emoji: "✨", type: "grammar" },
    ],
  },
  {
    id: "estar-verb",
    title: "Estar (To Be) y Expresiones",
    emoji: "🤲",
    requiredTopicId: "subject-pronouns",
    lessons: [
      { id: "estar-conjugation", title: "Conjugando Estar", emoji: "🤲", type: "grammar" },
    ],
  },
  {
    id: "present-tense",
    title: "Presente (verbos -ar/-er/-ir)",
    emoji: "🏃",
    requiredTopicId: "estar-verb",
    lessons: [
      { id: "regular-verbs", title: "Verbos Regulares", emoji: "🏃", type: "grammar" },
    ],
  },
  {
    id: "adjectives",
    title: "Adjetivos y Descripciones",
    emoji: "🎨",
    requiredTopicId: "present-tense",
    lessons: [
      { id: "adjectives-basics", title: "Cómo Funcionan los Adjetivos", emoji: "🎨", type: "grammar" },
    ],
  },
  {
    id: "food-drinks",
    title: "Comida y Bebidas",
    emoji: "🍽️",
    requiredTopicId: "adjectives",
    lessons: [
      { id: "food-basics", title: "Comida y Bebidas Comunes", emoji: "🥘", type: "vocabulary" },
    ],
  },
  {
    id: "directions-places",
    title: "Direcciones y Lugares",
    emoji: "🗺️",
    requiredTopicId: "food-drinks",
    lessons: [
      { id: "places-city", title: "Lugares de la Ciudad", emoji: "🏙️", type: "vocabulary" },
    ],
  },
  {
    id: "time-days",
    title: "Hora, Días y Fechas",
    emoji: "📅",
    requiredTopicId: "directions-places",
    lessons: [
      { id: "time-telling", title: "Decir la Hora y los Días", emoji: "🕐", type: "vocabulary" },
    ],
  },
  {
    id: "negation",
    title: "Negación (Decir No)",
    emoji: "🚫",
    requiredTopicId: "time-days",
    lessons: [
      { id: "negation-basics", title: "No y Más Allá", emoji: "🚫", type: "grammar" },
    ],
  },
  {
    id: "questions",
    title: "Hacer Preguntas",
    emoji: "❓",
    requiredTopicId: "negation",
    lessons: [
      { id: "questions-basics", title: "Palabras Interrogativas", emoji: "❓", type: "grammar" },
    ],
  },
  {
    id: "past-tense",
    title: "Hablar del Pasado",
    emoji: "⏪",
    requiredTopicId: "questions",
    lessons: [
      { id: "preterito", title: "Pretérito Indefinido", emoji: "⏪", type: "grammar" },
    ],
  },
  {
    id: "future-plans",
    title: "Hablar del Futuro",
    emoji: "⏩",
    requiredTopicId: "past-tense",
    lessons: [
      { id: "near-future", title: "Futuro Próximo (ir a + infinitivo)", emoji: "⏩", type: "grammar" },
    ],
  },
];
