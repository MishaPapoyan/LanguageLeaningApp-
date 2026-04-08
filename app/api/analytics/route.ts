import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const cacheKey = `analytics:${userId}`;

  // Serve from Redis cache if available (60s TTL)
  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return new NextResponse(cached, {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "private, s-maxage=60, stale-while-revalidate=120",
            "X-Cache": "HIT",
          },
        });
      }
    } catch {
      // Redis unavailable — fall through to compute
    }
  }

  const [
    progress,
    user,
    savedWords,
    savedWordsWithWord,
    storyProgressAll,
    gameScoresAll,
    aiInteractionsAll,
    totalStories,
    totalWords,
  ] = await Promise.all([
    prisma.progress.findUnique({ where: { userId } }),
    prisma.user.findUnique({ where: { id: userId }, select: { createdAt: true } }),
    prisma.savedWord.count({ where: { userId } }),
    prisma.savedWord.findMany({
      where: { userId },
      include: { word: { select: { category: true, difficulty: true, word: true } } },
      orderBy: { addedAt: "desc" },
    }),
    prisma.storyProgress.findMany({
      where: { userId },
      include: { story: { select: { title: true, difficulty: true, chapter: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.gameScore.findMany({
      where: { userId },
      orderBy: { playedAt: "desc" },
    }),
    prisma.aiInteraction.findMany({
      where: { userId },
      select: { id: true, scenario: true, xpEarned: true, createdAt: true, feedback: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.story.count(),
    prisma.word.count(),
  ]);

  // --- Compute derived analytics ---

  // 1. Activity timeline (last 30 days)
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const dailyActivity: Record<string, { xp: number; games: number; stories: number; words: number; tutor: number }> = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    dailyActivity[key] = { xp: 0, games: 0, stories: 0, words: 0, tutor: 0 };
  }

  // Fill game activity
  for (const g of gameScoresAll) {
    const key = g.playedAt.toISOString().split("T")[0];
    if (dailyActivity[key]) {
      dailyActivity[key].games++;
      dailyActivity[key].xp += g.xpEarned;
    }
  }

  // Fill story activity
  for (const s of storyProgressAll) {
    const key = s.createdAt.toISOString().split("T")[0];
    if (dailyActivity[key]) {
      dailyActivity[key].stories++;
      dailyActivity[key].xp += s.xpEarned;
    }
  }

  // Fill word saves
  for (const w of savedWordsWithWord) {
    const key = w.addedAt.toISOString().split("T")[0];
    if (dailyActivity[key]) {
      dailyActivity[key].words++;
    }
  }

  // Fill tutor sessions
  for (const t of aiInteractionsAll) {
    const key = t.createdAt.toISOString().split("T")[0];
    if (dailyActivity[key]) {
      dailyActivity[key].tutor++;
      dailyActivity[key].xp += t.xpEarned;
    }
  }

  // 2. Game stats breakdown
  const gamesByType: Record<string, { played: number; totalScore: number; totalXp: number; bestScore: number }> = {};
  for (const g of gameScoresAll) {
    const t = g.gameType;
    if (!gamesByType[t]) gamesByType[t] = { played: 0, totalScore: 0, totalXp: 0, bestScore: 0 };
    gamesByType[t].played++;
    gamesByType[t].totalScore += g.score;
    gamesByType[t].totalXp += g.xpEarned;
    gamesByType[t].bestScore = Math.max(gamesByType[t].bestScore, g.score);
  }

  // Game score trend (last 20 games)
  const gameScoreTrend = gameScoresAll.slice(0, 20).reverse().map((g) => ({
    date: g.playedAt.toISOString().split("T")[0],
    score: g.score,
    type: g.gameType,
    xp: g.xpEarned,
  }));

  // 3. Vocabulary breakdown by category & difficulty
  const vocabByCategory: Record<string, number> = {};
  const vocabByDifficulty: Record<string, number> = {};
  const vocabByMastery: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  for (const sw of savedWordsWithWord) {
    const cat = sw.word.category;
    vocabByCategory[cat] = (vocabByCategory[cat] || 0) + 1;
    const diff = sw.word.difficulty;
    vocabByDifficulty[diff] = (vocabByDifficulty[diff] || 0) + 1;
    const mastery = Math.min(sw.masteryLevel, 5);
    vocabByMastery[mastery] = (vocabByMastery[mastery] || 0) + 1;
  }

  // Words added per week (last 8 weeks)
  const wordsPerWeek: { week: string; count: number }[] = [];
  for (let i = 0; i < 8; i++) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - i * 7);
    const count = savedWordsWithWord.filter(
      (w) => w.addedAt >= weekStart && w.addedAt < weekEnd
    ).length;
    const label = i === 0 ? "This week" : `${i}w ago`;
    wordsPerWeek.push({ week: label, count });
  }

  // 4. AI Tutor analytics
  const tutorByScenario: Record<string, { count: number; totalXp: number }> = {};
  let tutorTotalGrammar = 0;
  let tutorTotalAccuracy = 0;
  let tutorWithFeedback = 0;

  for (const t of aiInteractionsAll) {
    const s = t.scenario;
    if (!tutorByScenario[s]) tutorByScenario[s] = { count: 0, totalXp: 0 };
    tutorByScenario[s].count++;
    tutorByScenario[s].totalXp += t.xpEarned;

    if (t.feedback && typeof t.feedback === "object") {
      const fb = t.feedback as Record<string, unknown>;
      if (typeof fb.grammarScore === "number") {
        tutorTotalGrammar += fb.grammarScore;
        tutorWithFeedback++;
      }
      if (typeof fb.accuracyPct === "number") {
        tutorTotalAccuracy += fb.accuracyPct;
      }
    }
  }

  // 5. Story analytics
  const completedStoryIds = storyProgressAll.filter((s) => s.completed);
  const storyAvgScore = completedStoryIds.length > 0
    ? Math.round(completedStoryIds.reduce((sum, s) => sum + s.score, 0) / completedStoryIds.length)
    : 0;
  const storiesByDifficulty: Record<string, { total: number; completed: number }> = {};
  for (const sp of storyProgressAll) {
    const diff = sp.story.difficulty;
    if (!storiesByDifficulty[diff]) storiesByDifficulty[diff] = { total: 0, completed: 0 };
    storiesByDifficulty[diff].total++;
    if (sp.completed) storiesByDifficulty[diff].completed++;
  }

  // 6. XP sources breakdown
  const xpFromGames = gameScoresAll.reduce((s, g) => s + g.xpEarned, 0);
  const xpFromStories = storyProgressAll.reduce((s, sp) => s + sp.xpEarned, 0);
  const xpFromTutor = aiInteractionsAll.reduce((s, t) => s + t.xpEarned, 0);
  const xpFromWords = savedWords * 2; // saveWord = 2 XP each
  const xpTotal = progress?.xp ?? 0;
  const xpFromOther = Math.max(0, xpTotal - xpFromGames - xpFromStories - xpFromTutor - xpFromWords);

  // 7. Streaks & consistency
  const activeDays = new Set<string>();
  for (const g of gameScoresAll) activeDays.add(g.playedAt.toISOString().split("T")[0]);
  for (const s of storyProgressAll) activeDays.add(s.createdAt.toISOString().split("T")[0]);
  for (const t of aiInteractionsAll) activeDays.add(t.createdAt.toISOString().split("T")[0]);
  for (const w of savedWordsWithWord) activeDays.add(w.addedAt.toISOString().split("T")[0]);

  const daysActive = activeDays.size;
  const daysSinceJoin = user
    ? Math.max(1, Math.ceil((now.getTime() - user.createdAt.getTime()) / (24 * 60 * 60 * 1000)))
    : 1;
  const consistencyPct = Math.min(100, Math.round((daysActive / daysSinceJoin) * 100));

  // Activity heatmap (last 30 days)
  const heatmap = Object.entries(dailyActivity)
    .map(([date, data]) => ({
      date,
      total: data.games + data.stories + data.words + data.tutor,
      xp: data.xp,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // 8. Milestones & projections
  const weeklyXp = (progress?.weeklyXp as Record<string, number>) ?? {};
  const recentWeeklyXps = Object.values(weeklyXp).slice(-4);
  const avgWeeklyXp = recentWeeklyXps.length > 0
    ? Math.round(recentWeeklyXps.reduce((s, v) => s + v, 0) / recentWeeklyXps.length)
    : 0;

  const payload = {
    overview: {
      totalXp: xpTotal,
      level: progress?.level ?? 1,
      streak: progress?.streak ?? 0,
      daysActive,
      daysSinceJoin,
      consistencyPct,
      avgWeeklyXp,
      memberSince: user?.createdAt ?? now,
      badges: progress?.badges ?? [],
      skillTree: (progress?.skillTree as Record<string, number>) ?? { vocabulary: 0, grammar: 0, speaking: 0 },
      weeklyXp,
    },
    xpBreakdown: {
      games: xpFromGames,
      stories: xpFromStories,
      tutor: xpFromTutor,
      words: xpFromWords,
      streaks: xpFromOther,
      total: xpTotal,
    },
    vocabulary: {
      total: savedWords,
      totalAvailable: totalWords,
      byCategory: vocabByCategory,
      byDifficulty: vocabByDifficulty,
      byMastery: vocabByMastery,
      perWeek: wordsPerWeek.reverse(),
      recentWords: savedWordsWithWord.slice(0, 10).map((sw) => ({
        word: sw.word.word,
        category: sw.word.category,
        mastery: sw.masteryLevel,
        addedAt: sw.addedAt,
      })),
    },
    stories: {
      completed: completedStoryIds.length,
      total: totalStories,
      avgScore: storyAvgScore,
      byDifficulty: storiesByDifficulty,
      totalXpEarned: xpFromStories,
      recent: storyProgressAll.slice(0, 5).map((sp) => ({
        title: sp.story.title,
        score: sp.score,
        completed: sp.completed,
        date: sp.createdAt,
      })),
    },
    games: {
      totalPlayed: gameScoresAll.length,
      byType: gamesByType,
      totalXpEarned: xpFromGames,
      scoreTrend: gameScoreTrend,
      avgScore: gameScoresAll.length > 0
        ? Math.round(gameScoresAll.reduce((s, g) => s + g.score, 0) / gameScoresAll.length)
        : 0,
      bestScore: gameScoresAll.length > 0 ? Math.max(...gameScoresAll.map((g) => g.score)) : 0,
    },
    tutor: {
      totalSessions: aiInteractionsAll.length,
      byScenario: tutorByScenario,
      avgGrammarScore: tutorWithFeedback > 0 ? Math.round(tutorTotalGrammar / tutorWithFeedback) : null,
      avgAccuracy: tutorWithFeedback > 0 ? Math.round(tutorTotalAccuracy / tutorWithFeedback) : null,
      totalXpEarned: xpFromTutor,
    },
    activity: {
      daily: Object.entries(dailyActivity)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      heatmap,
    },
  };

  // Store in Redis cache (60s TTL), fire-and-forget
  if (redis) {
    redis.setex(cacheKey, 60, JSON.stringify(payload)).catch(() => {/* ignore */});
  }

  const res = NextResponse.json(payload);
  res.headers.set("Cache-Control", "private, s-maxage=60, stale-while-revalidate=120");
  res.headers.set("X-Cache", "MISS");
  return res;
}
