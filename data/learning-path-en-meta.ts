/**
 * English learning path navigation metadata.
 * Same shape as learning-path-meta.ts (French) and learning-path-es-meta.ts (Spanish).
 */

import type { TopicMeta } from "./learning-path-meta";

export const LEARNING_PATH_META_EN: TopicMeta[] = [
  // ── Phase 1: The Basics ───────────────────────────────────────────────
  {
    id: "alphabet",
    title: "The English Alphabet",
    emoji: "🔤",
    lessons: [
      { id: "en-alphabet-1", title: "Letters A–M", emoji: "🅰️", type: "alphabet" },
      { id: "en-alphabet-2", title: "Letters N–Z", emoji: "🇿",  type: "alphabet" },
    ],
  },
  {
    id: "pronunciation",
    title: "English Sounds & Phonics",
    emoji: "🔊",
    requiredTopicId: "alphabet",
    lessons: [
      { id: "en-sounds-vowels",     title: "Short & Long Vowels",   emoji: "🗣️", type: "pronunciation" },
      { id: "en-sounds-consonants", title: "Tricky Consonant Rules", emoji: "🤫", type: "pronunciation" },
    ],
  },
  {
    id: "greetings",
    title: "Greetings & Introductions",
    emoji: "👋",
    requiredTopicId: "pronunciation",
    lessons: [
      { id: "en-greetings-hello", title: "Saying Hello & Goodbye",  emoji: "👋", type: "conversation" },
      { id: "en-greetings-intro", title: "Introducing Yourself",    emoji: "🙋", type: "conversation" },
    ],
  },
  {
    id: "numbers",
    title: "Numbers & Counting",
    emoji: "🔢",
    requiredTopicId: "greetings",
    lessons: [
      { id: "en-numbers-1-20",   title: "Numbers 1–20",   emoji: "1️⃣", type: "vocabulary" },
      { id: "en-numbers-21-100", title: "Numbers 21–100", emoji: "💯", type: "vocabulary" },
    ],
  },
  {
    id: "essentials",
    title: "Survival Phrases",
    emoji: "🆘",
    requiredTopicId: "greetings",
    lessons: [
      { id: "en-essentials", title: "Must-Know Phrases", emoji: "🆘", type: "conversation" },
    ],
  },
  // ── Phase 2: Core Grammar ─────────────────────────────────────────────
  {
    id: "articles",
    title: "Articles — A, An & The",
    emoji: "📎",
    requiredTopicId: "essentials",
    lessons: [
      { id: "en-articles-indefinite", title: "A and An",       emoji: "📎", type: "grammar" },
      { id: "en-articles-definite",   title: "The — when to use it", emoji: "🔘", type: "grammar" },
    ],
  },
  {
    id: "pronouns-be",
    title: "Pronouns & To Be",
    emoji: "👤",
    requiredTopicId: "articles",
    lessons: [
      { id: "en-pronouns-subject", title: "Subject Pronouns (I, You, He…)", emoji: "👤", type: "grammar" },
      { id: "en-verb-be",          title: "The Verb To Be",                  emoji: "✨", type: "grammar" },
    ],
  },
  {
    id: "have-do",
    title: "Have & Do — Key Verbs",
    emoji: "🤲",
    requiredTopicId: "pronouns-be",
    lessons: [
      { id: "en-verb-have", title: "To Have — conjugation & use", emoji: "🤲", type: "grammar" },
      { id: "en-verb-do",   title: "To Do — as main & helper verb", emoji: "🔧", type: "grammar" },
    ],
  },
  {
    id: "present-simple",
    title: "Present Simple Tense",
    emoji: "🏃",
    requiredTopicId: "have-do",
    lessons: [
      { id: "en-present-simple", title: "Regular Verbs in Present", emoji: "🏃", type: "grammar" },
    ],
  },
  {
    id: "adjectives",
    title: "Adjectives & Descriptions",
    emoji: "🎨",
    requiredTopicId: "present-simple",
    lessons: [
      { id: "en-adjectives", title: "Describing People & Things", emoji: "🎨", type: "grammar" },
    ],
  },
  {
    id: "negation",
    title: "Negation — Saying No",
    emoji: "🚫",
    requiredTopicId: "adjectives",
    lessons: [
      { id: "en-negation", title: "Don't, Doesn't, Isn't…", emoji: "🚫", type: "grammar" },
    ],
  },
  {
    id: "questions",
    title: "Asking Questions",
    emoji: "❓",
    requiredTopicId: "negation",
    lessons: [
      { id: "en-questions", title: "Wh-Questions & Yes/No", emoji: "❓", type: "grammar" },
    ],
  },
  // ── Phase 3: Real World ───────────────────────────────────────────────
  {
    id: "food-drinks",
    title: "Food & Drinks",
    emoji: "🍽️",
    requiredTopicId: "questions",
    lessons: [
      { id: "en-food", title: "Common Food & Restaurants", emoji: "🥐", type: "vocabulary" },
    ],
  },
  {
    id: "directions",
    title: "Directions & Places",
    emoji: "🗺️",
    requiredTopicId: "food-drinks",
    lessons: [
      { id: "en-directions", title: "Places in the City", emoji: "🏙️", type: "vocabulary" },
    ],
  },
  {
    id: "time-days",
    title: "Time, Days & Dates",
    emoji: "📅",
    requiredTopicId: "directions",
    lessons: [
      { id: "en-time", title: "Telling Time & Days of the Week", emoji: "🕐", type: "vocabulary" },
    ],
  },
  {
    id: "past-simple",
    title: "Past Simple Tense",
    emoji: "⏪",
    requiredTopicId: "time-days",
    lessons: [
      { id: "en-past-regular",   title: "Regular Verbs in Past (-ed)", emoji: "⏪", type: "grammar" },
      { id: "en-past-irregular", title: "Irregular Verbs (go→went…)",  emoji: "⚡", type: "grammar" },
    ],
  },
  {
    id: "future",
    title: "Talking About the Future",
    emoji: "⏩",
    requiredTopicId: "past-simple",
    lessons: [
      { id: "en-future-going-to", title: "Going to — plans",         emoji: "📅", type: "grammar" },
      { id: "en-future-will",     title: "Will — predictions & offers", emoji: "⏩", type: "grammar" },
    ],
  },
];
