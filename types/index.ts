import { Difficulty, GameType, Role } from "@prisma/client";

export type { Role, Difficulty, GameType };

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: Role;
  targetLanguage: string;
  nativeLanguage: string;
}

export interface ProgressData {
  xp: number;
  level: number;
  streak: number;
  lastActive: string;
  badges: string[];
  skillTree: SkillTree;
  weeklyXp: Record<string, number>;
}

export interface SkillTree {
  vocabulary: number;
  grammar: number;
  speaking: number;
}

export interface StoryContent {
  paragraphs: StoryParagraph[];
}

export interface StoryParagraph {
  text: string;
  highlights: WordHighlight[];
}

export interface WordHighlight {
  word: string;
  wordId: string;
  startIndex: number;
  endIndex: number;
}

export interface WordData {
  id: string;
  word: string;
  translation: string;
  definition: string;
  exampleFr: string;
  exampleEn: string;
  miniStory: string | null;
  category: string;
  difficulty: Difficulty;
  imageEmoji: string;
  isSaved?: boolean;
  masteryLevel?: number;
}

export interface StoryData {
  id: string;
  title: string;
  description: string;
  content: StoryContent;
  difficulty: Difficulty;
  chapter: number;
  imageEmoji: string;
  language: string;
  words: WordData[];
  quizzes: QuizData[];
  userProgress?: {
    completed: boolean;
    score: number;
    xpEarned: number;
  };
}

export interface QuizData {
  id: string;
  question: string;
  options: string[];
  answer: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface TutorFeedback {
  grammarScore: number;
  accuracyPct: number;
  strengths: string[];
  corrections: Array<{
    original: string;
    corrected: string;
    rule: string;
  }>;
  recommendation: string;
}

export interface GameScoreData {
  gameType: GameType;
  score: number;
  wordsUsed: string[];
  xpEarned: number;
}

export type TutorScenario = "waiter" | "traveler" | "teacher" | "free";

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
}

export const BADGES: Badge[] = [
  { id: "first_story",   name: "Story Starter",        description: "Complete your first story",              emoji: "📖", color: "blue" },
  { id: "streak_3",      name: "Streak Starter",        description: "Maintain a 3-day streak",                emoji: "🔥", color: "orange" },
  { id: "streak_7",      name: "Streak Hero",           description: "Maintain a 7-day streak",                emoji: "🔥", color: "red" },
  { id: "words_10",      name: "Word Collector",        description: "Save 10 words",                          emoji: "📚", color: "purple" },
  { id: "words_50",      name: "Word Hoarder",          description: "Save 50 words",                          emoji: "📚", color: "indigo" },
  { id: "tutor_first",   name: "Conversation Starter",  description: "Complete your first AI tutor session",   emoji: "🤖", color: "green" },
  { id: "quiz_perfect",  name: "Quiz Master",           description: "Get a perfect score on a quiz",          emoji: "⭐", color: "yellow" },
  { id: "level_5",       name: "Rising Star",           description: "Reach Level 5",                          emoji: "⚡", color: "yellow" },
  { id: "level_10",      name: "Apprentice",            description: "Reach Level 10",                         emoji: "🎓", color: "blue" },
  { id: "level_20",      name: "Fluent Speaker",        description: "Reach Level 20",                         emoji: "💬", color: "cyan" },
  { id: "level_30",      name: "Advanced Learner",      description: "Reach Level 30",                         emoji: "🏅", color: "gold" },
  { id: "level_50",      name: "Language Master",        description: "Reach Level 50 — the pinnacle!",         emoji: "👑", color: "gold" },
  { id: "game_10",       name: "Game On",               description: "Play 10 games",                          emoji: "🎮", color: "pink" },
  { id: "all_stories",   name: "Story Finisher",        description: "Complete all stories",                   emoji: "🏆", color: "gold" },
];

// ─── Level System ──────────────────────────────────────────────────────────────
// 50 total levels. Threshold scales as 100 * (n-1)^1.5 so early levels are fast
// and later ones require sustained engagement.

export interface LevelMilestone {
  level: number;
  badgeId: string;
  title: string;
  reward: string;
  unlocksFeature?: string;
}

export const LEVEL_MILESTONES: LevelMilestone[] = [
  { level: 3,  badgeId: "tutor_first",  title: "First Words",       reward: "+50 XP bonus",               unlocksFeature: "ai_tutor" },
  { level: 5,  badgeId: "level_5",      title: "Rising Star",       reward: "All game modes unlocked",     unlocksFeature: "all_games" },
  { level: 10, badgeId: "level_10",     title: "Apprentice",        reward: "Advanced story chapters",     unlocksFeature: "advanced_stories" },
  { level: 15, badgeId: "streak_7",     title: "Dedicated",         reward: "2× XP weekends",              unlocksFeature: "double_xp_weekend" },
  { level: 20, badgeId: "level_20",     title: "Fluent Speaker",    reward: "Custom scenarios in Tutor",   unlocksFeature: "custom_scenarios" },
  { level: 25, badgeId: "words_50",     title: "Vocabulary King",   reward: "Mastery tracking unlocked",   unlocksFeature: "mastery_tracking" },
  { level: 30, badgeId: "level_30",     title: "Advanced Learner",  reward: "Grammar deep-dive mode",      unlocksFeature: "grammar_mode" },
  { level: 40, badgeId: "quiz_perfect", title: "Scholar",           reward: "Leaderboard title badge",     unlocksFeature: "title_badge" },
  { level: 50, badgeId: "level_50",     title: "Language Master",   reward: "Exclusive crown avatar frame", unlocksFeature: "master_frame" },
];

// XP thresholds for each level (1-indexed: threshold[0] = level 1 threshold)
export function getLevelThreshold(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(100 * Math.pow(level - 1, 1.5));
}

export function getLevelFromXp(xp: number): number {
  let level = 1;
  while (getLevelThreshold(level + 1) <= xp) {
    level++;
    if (level >= 50) break;
  }
  return level;
}

export function getXpProgress(xp: number): { level: number; current: number; needed: number; pct: number } {
  const level = getLevelFromXp(xp);
  const current = xp - getLevelThreshold(level);
  const needed = getLevelThreshold(level + 1) - getLevelThreshold(level);
  return { level, current, needed, pct: Math.round((current / needed) * 100) };
}

export function getNextMilestone(level: number): LevelMilestone | null {
  return LEVEL_MILESTONES.find((m) => m.level > level) ?? null;
}

// Is a feature unlocked for this level?
export function isFeatureUnlocked(feature: string, level: number): boolean {
  const milestone = LEVEL_MILESTONES.find((m) => m.unlocksFeature === feature);
  if (!milestone) return true; // no lock defined → open
  return level >= milestone.level;
}

export const XP_REWARDS = {
  completeStory: 50,
  perfectQuiz: 30,
  quizAnswer: 5,
  saveWord: 2,
  tutorSession: 25,
  gameWin: 20,
  gamePlay: 10,
  dailyStreak: 10,
} as const;
