/**
 * Slim navigation metadata — only id/title/emoji/type/requiredTopicId.
 * Import THIS in the learn list page (no content/exercises = smaller client bundle).
 * Import the full learning-path.ts only in lesson pages that need content.
 */

export interface LessonMeta {
  id: string;
  title: string;
  emoji: string;
  type: "alphabet" | "pronunciation" | "vocabulary" | "grammar" | "conversation" | "culture";
}

export interface TopicMeta {
  id: string;
  title: string;
  emoji: string;
  lessons: LessonMeta[];
  requiredTopicId?: string;
}

export const LEARNING_PATH_META: TopicMeta[] = [
  {
    id: "alphabet",
    title: "The French Alphabet",
    emoji: "🔤",
    lessons: [
      { id: "alphabet-1",     title: "Letters A-M",             emoji: "🅰️", type: "alphabet" },
      { id: "alphabet-2",     title: "Letters N-Z",             emoji: "🇿",  type: "alphabet" },
    ],
  },
  {
    id: "pronunciation",
    title: "French Sounds",
    emoji: "🔊",
    requiredTopicId: "alphabet",
    lessons: [
      { id: "sounds-vowels",     title: "Vowel Sounds",       emoji: "🗣️", type: "pronunciation" },
      { id: "sounds-consonants", title: "Consonant Rules",    emoji: "🤫", type: "pronunciation" },
    ],
  },
  {
    id: "greetings",
    title: "Greetings & Basics",
    emoji: "👋",
    requiredTopicId: "pronunciation",
    lessons: [
      { id: "greetings-hello", title: "Saying Hello & Goodbye",  emoji: "👋", type: "conversation" },
      { id: "greetings-intro", title: "Introducing Yourself",    emoji: "🙋", type: "conversation" },
    ],
  },
  {
    id: "numbers",
    title: "Numbers & Counting",
    emoji: "🔢",
    requiredTopicId: "greetings",
    lessons: [
      { id: "numbers-1-20",   title: "Numbers 1-20",    emoji: "1️⃣", type: "vocabulary" },
      { id: "numbers-21-100", title: "Numbers 21-100",  emoji: "💯", type: "vocabulary" },
    ],
  },
  {
    id: "essentials",
    title: "Essential Phrases",
    emoji: "🆘",
    requiredTopicId: "greetings",
    lessons: [
      { id: "essentials-survival", title: "Survival Phrases", emoji: "🆘", type: "conversation" },
    ],
  },
  {
    id: "articles-gender",
    title: "Articles & Gender",
    emoji: "⚤",
    requiredTopicId: "essentials",
    lessons: [
      { id: "articles-definite",   title: "The (Le, La, Les)",        emoji: "📎", type: "grammar" },
      { id: "articles-indefinite", title: "A / Some (Un, Une, Des)",   emoji: "🔘", type: "grammar" },
    ],
  },
  {
    id: "subject-pronouns",
    title: "Subject Pronouns & Être",
    emoji: "👤",
    requiredTopicId: "articles-gender",
    lessons: [
      { id: "pronouns-basic", title: "Subject Pronouns",         emoji: "👤", type: "grammar" },
      { id: "etre-verb",      title: "The Verb Être (To Be)",    emoji: "✨", type: "grammar" },
    ],
  },
  {
    id: "avoir-verb",
    title: "Avoir (To Have) & Expressions",
    emoji: "🤲",
    requiredTopicId: "subject-pronouns",
    lessons: [
      { id: "avoir-conjugation", title: "Conjugating Avoir", emoji: "🤲", type: "grammar" },
    ],
  },
  {
    id: "present-tense",
    title: "Present Tense (-er verbs)",
    emoji: "🏃",
    requiredTopicId: "avoir-verb",
    lessons: [
      { id: "er-verbs", title: "Regular -er Verbs", emoji: "🏃", type: "grammar" },
    ],
  },
  {
    id: "adjectives",
    title: "Adjectives & Descriptions",
    emoji: "🎨",
    requiredTopicId: "present-tense",
    lessons: [
      { id: "adjectives-basics", title: "How Adjectives Work", emoji: "🎨", type: "grammar" },
    ],
  },
  {
    id: "food-drinks",
    title: "Food & Drinks",
    emoji: "🍽️",
    requiredTopicId: "adjectives",
    lessons: [
      { id: "food-basics", title: "Common Food & Drinks", emoji: "🥐", type: "vocabulary" },
    ],
  },
  {
    id: "directions-places",
    title: "Directions & Places",
    emoji: "🗺️",
    requiredTopicId: "food-drinks",
    lessons: [
      { id: "places-city", title: "Places in the City", emoji: "🏙️", type: "vocabulary" },
    ],
  },
  {
    id: "time-days",
    title: "Time, Days & Dates",
    emoji: "📅",
    requiredTopicId: "directions-places",
    lessons: [
      { id: "time-telling", title: "Telling Time & Days", emoji: "🕐", type: "vocabulary" },
    ],
  },
  {
    id: "negation",
    title: "Negation (Saying No)",
    emoji: "🚫",
    requiredTopicId: "time-days",
    lessons: [
      { id: "negation-basics", title: "Ne...Pas and Beyond", emoji: "🚫", type: "grammar" },
    ],
  },
  {
    id: "questions",
    title: "Asking Questions",
    emoji: "❓",
    requiredTopicId: "negation",
    lessons: [
      { id: "questions-basics", title: "Question Words & Patterns", emoji: "❓", type: "grammar" },
    ],
  },
  {
    id: "past-tense",
    title: "Talking About the Past",
    emoji: "⏪",
    requiredTopicId: "questions",
    lessons: [
      { id: "passe-compose", title: "Passé Composé", emoji: "⏪", type: "grammar" },
    ],
  },
  {
    id: "future-plans",
    title: "Talking About the Future",
    emoji: "⏩",
    requiredTopicId: "past-tense",
    lessons: [
      { id: "near-future", title: "Near Future (aller + infinitive)", emoji: "⏩", type: "grammar" },
    ],
  },
];
