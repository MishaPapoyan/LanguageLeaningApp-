import { prisma } from "@/lib/prisma";
import { XP_REWARDS, getLevelFromXp, BADGES } from "@/types";

export async function awardXp(
  userId: string,
  amount: number,
  skillType?: "vocabulary" | "grammar" | "speaking"
) {
  const progress = await prisma.progress.upsert({
    where: { userId },
    create: {
      userId,
      xp: amount,
      level: 1,
      streak: 1,
      skillTree: { vocabulary: 0, grammar: 0, speaking: 0 },
      weeklyXp: {},
    },
    update: {},
  });

  const newXp = progress.xp + amount;
  const newLevel = getLevelFromXp(newXp);

  // Update weekly XP
  const weekKey = getWeekKey();
  const weeklyXp = (progress.weeklyXp as Record<string, number>) || {};
  weeklyXp[weekKey] = (weeklyXp[weekKey] || 0) + amount;

  // Update skill tree
  const skillTree = (progress.skillTree as Record<string, number>) || {
    vocabulary: 0,
    grammar: 0,
    speaking: 0,
  };
  if (skillType) {
    skillTree[skillType] = Math.min(100, (skillTree[skillType] || 0) + Math.ceil(amount / 5));
  }

  // Check and award badges
  const newBadges = await checkBadges(userId, newXp, newLevel, progress.badges);

  const updated = await prisma.progress.update({
    where: { userId },
    data: {
      xp: newXp,
      level: newLevel,
      lastActive: new Date(),
      skillTree,
      weeklyXp,
      badges: { push: newBadges },
    },
  });

  return { xp: updated.xp, level: updated.level, newBadges };
}

export async function updateStreak(userId: string): Promise<number> {
  const progress = await prisma.progress.findUnique({ where: { userId } });
  if (!progress) return 1;

  const now = new Date();
  const last = new Date(progress.lastActive);
  const hoursSince = (now.getTime() - last.getTime()) / (1000 * 60 * 60);

  let newStreak = progress.streak;

  if (hoursSince < 36) {
    // Within grace period - maintain or increment streak
    const daysSince = Math.floor(hoursSince / 24);
    if (daysSince >= 1) {
      newStreak = progress.streak + 1;
    }
  } else {
    // Streak broken
    newStreak = 1;
  }

  await prisma.progress.update({
    where: { userId },
    data: { streak: newStreak, lastActive: now },
  });

  // Award streak XP if new day
  if (newStreak > progress.streak) {
    await awardXp(userId, XP_REWARDS.dailyStreak);
  }

  return newStreak;
}

async function checkBadges(
  userId: string,
  xp: number,
  level: number,
  existingBadges: string[]
): Promise<string[]> {
  const newBadges: string[] = [];
  const existing = new Set(existingBadges);

  // ── Level badge (no DB query needed) ─────────────────────────────────────
  if (level >= 5 && !existing.has("level_5")) newBadges.push("level_5");

  // ── Word badges — only query if at least one word badge is still unearned ─
  const needsWordQuery = !existing.has("words_10") || !existing.has("words_50");
  if (needsWordQuery) {
    const wordCount = await prisma.savedWord.count({ where: { userId } });
    if (wordCount >= 10 && !existing.has("words_10")) newBadges.push("words_10");
    if (wordCount >= 50 && !existing.has("words_50")) newBadges.push("words_50");
  }

  // ── Story badges — only query if at least one story badge is still unearned
  const needsStoryQuery = !existing.has("first_story") || !existing.has("all_stories");
  if (needsStoryQuery) {
    const completedStories = await prisma.storyProgress.count({
      where: { userId, completed: true },
    });
    if (completedStories >= 1 && !existing.has("first_story")) newBadges.push("first_story");

    if (!existing.has("all_stories")) {
      const totalStories = await prisma.story.count();
      if (completedStories >= totalStories && totalStories > 0) {
        newBadges.push("all_stories");
      }
    }
  }

  // ── Tutor badge — only query if not yet earned ────────────────────────────
  if (!existing.has("tutor_first")) {
    const tutorCount = await prisma.aiInteraction.count({ where: { userId } });
    if (tutorCount >= 1) newBadges.push("tutor_first");
  }

  // ── Game badge — only query if not yet earned ─────────────────────────────
  if (!existing.has("game_10")) {
    const gameCount = await prisma.gameScore.count({ where: { userId } });
    if (gameCount >= 10) newBadges.push("game_10");
  }

  return newBadges;
}

function getWeekKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const week = getWeekNumber(now);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
