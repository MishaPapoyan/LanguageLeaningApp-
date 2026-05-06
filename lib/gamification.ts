import { prisma } from "@/lib/prisma";
import { XP_REWARDS, getLevelFromXp, BADGES } from "@/types";

export async function awardXp(
  userId: string,
  amount: number,
  skillType?: "vocabulary" | "grammar" | "speaking"
) {
  // CRIT-2: Use atomic increment to prevent race conditions.
  // Old code read xp then wrote newXp = xp + amount — concurrent requests
  // would both read the same value and one write would be lost.
  const progress = await prisma.progress.upsert({
    where: { userId },
    create: {
      userId,
      xp: amount,
      level: getLevelFromXp(amount),
      streak: 0,
      skillTree: { vocabulary: 0, grammar: 0, speaking: 0 },
      weeklyXp: {},
    },
    update: { xp: { increment: amount } }, // atomic — safe under concurrent writes
  });

  // progress.xp is already the post-increment value from Prisma
  const newXp = progress.xp;
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
      level: newLevel,
      lastActive: new Date(),
      skillTree,
      weeklyXp,
      badges: { push: newBadges },
    },
  });

  return { xp: newXp, level: updated.level, newBadges };
}

export async function updateStreak(userId: string): Promise<number> {
  const progress = await prisma.progress.findUnique({ where: { userId } });
  if (!progress) return 1;

  const now = new Date();
  const last = new Date(progress.lastActive);

  // LOW-10: Compare by calendar day (UTC) to avoid midnight edge cases.
  const nowUtcDay  = Date.UTC(now.getFullYear(),  now.getMonth(),  now.getDate());
  const lastUtcDay = Date.UTC(last.getFullYear(), last.getMonth(), last.getDate());
  const dayDiff = Math.round((nowUtcDay - lastUtcDay) / 86_400_000);

  // Keep the 36h grace period: if it's been 2 calendar days but < 36 clock hours,
  // still count as consecutive (protects late-night → early-morning users).
  const hoursSince = (now.getTime() - last.getTime()) / 3_600_000;

  let newStreak = progress.streak;
  let shieldUsed = false;
  let newShields = progress.streakShields ?? 0;

  if (dayDiff === 0) {
    // Same calendar day — streak unchanged
  } else if (dayDiff === 1 || (dayDiff === 2 && hoursSince < 36)) {
    // Next day, or within grace window — increment
    newStreak = progress.streak + 1;
  } else {
    // Missed more than one day — use a shield if available, otherwise reset
    if (newShields > 0) {
      newShields -= 1;
      shieldUsed = true;
      // Keep the current streak — shield absorbed the break
      // But don't increment (they didn't actually play yesterday)
    } else {
      newStreak = 1;
    }
  }

  // Award a shield every 7-day streak milestone (7, 14, 21 …)
  const isNowAt = newStreak % 7;
  if (!shieldUsed && newStreak > progress.streak && isNowAt === 0 && newStreak > 0) {
    newShields = Math.min(newShields + 1, 3); // cap at 3 shields
  }

  await prisma.progress.update({
    where: { userId },
    data: { streak: newStreak, streakShields: newShields, lastActive: now },
  });

  // Award streak XP if a new day was registered (not shield-saved days)
  if (!shieldUsed && newStreak > progress.streak) {
    await awardXp(userId, XP_REWARDS.dailyStreak);
  }

  return newStreak;
}

/** Consume one streak shield manually (called from API route when user taps "Use shield"). */
export async function useStreakShield(userId: string): Promise<{ ok: boolean; shields: number }> {
  const progress = await prisma.progress.findUnique({ where: { userId } });
  if (!progress || (progress.streakShields ?? 0) === 0) return { ok: false, shields: 0 };

  const updated = await prisma.progress.update({
    where: { userId },
    data: { streakShields: { decrement: 1 } },
  });

  return { ok: true, shields: updated.streakShields ?? 0 };
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
