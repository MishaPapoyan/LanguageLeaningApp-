import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { frenchVocabulary } from "../data/french-vocabulary";
import { frenchStories } from "../data/french-stories";
import { spanishVocabulary } from "../data/spanish-vocabulary";
import { spanishStories } from "../data/spanish-stories";
import { englishVocabulary } from "../data/english-vocabulary";
import { englishStories } from "../data/english-stories";

const prisma = new PrismaClient();

// ── Armenian overlays (generated via `npm run i18n:gen-hy`) ───────────────────
// Keyed by "<lang>:<word lowercased>". Absent → English fallback at runtime.
interface HyOverlay { translationHy: string; definitionHy: string }
const HY_PATH = resolve(__dirname, "../data/overlays-hy.json");
const HY: Record<string, HyOverlay> = existsSync(HY_PATH)
  ? JSON.parse(readFileSync(HY_PATH, "utf8"))
  : {};
const hy = (lang: string, word: string): Partial<HyOverlay> =>
  HY[`${lang}:${word.toLowerCase()}`] ?? {};

async function main() {
  console.log("🌱 Seeding database...");
  console.log(`🇦🇲 ${Object.keys(HY).length} Armenian overlays loaded`);

  // 1. Seed vocabulary words (bulk)
  console.log("📚 Seeding French vocabulary...");

  await prisma.word.createMany({
    data: frenchVocabulary.map((vocab) => ({
      word: vocab.word,
      translation: vocab.translation,
      definition: vocab.definition,
      exampleFr: vocab.exampleFr,
      exampleEn: vocab.exampleEn,
      miniStory: vocab.miniStory,
      category: vocab.category,
      difficulty: vocab.difficulty,
      imageEmoji: vocab.imageEmoji,
      language: "fr",
      ...hy("fr", vocab.word),
    })),
    skipDuplicates: true,
  });

  // Seed Spanish vocabulary
  console.log("🇪🇸 Seeding Spanish vocabulary...");
  await prisma.word.createMany({
    data: spanishVocabulary.map((vocab) => ({
      word: vocab.word,
      translation: vocab.translation,
      definition: vocab.definition,
      exampleFr: vocab.exampleFr,
      exampleEn: vocab.exampleEn,
      miniStory: vocab.miniStory,
      category: vocab.category,
      difficulty: vocab.difficulty,
      imageEmoji: vocab.imageEmoji,
      language: "es",
      ...hy("es", vocab.word),
    })),
    skipDuplicates: true,
  });

  // Seed English vocabulary
  console.log("🇬🇧 Seeding English vocabulary...");
  await prisma.word.createMany({
    data: englishVocabulary.map((vocab) => ({
      word: vocab.word,
      translation: vocab.translation,
      definition: vocab.definition,
      exampleFr: vocab.exampleFr,
      exampleEn: vocab.exampleEn,
      miniStory: vocab.miniStory,
      category: vocab.category,
      difficulty: vocab.difficulty,
      imageEmoji: vocab.imageEmoji,
      language: "en",
      ...hy("en", vocab.word),
    })),
    skipDuplicates: true,
  });

  // Build per-language word maps for story references
  const frWords = await prisma.word.findMany({ where: { language: "fr" }, select: { id: true, word: true } });
  const esWords = await prisma.word.findMany({ where: { language: "es" }, select: { id: true, word: true } });
  const enWords = await prisma.word.findMany({ where: { language: "en" }, select: { id: true, word: true } });
  const wordMapFr: Record<string, string> = {};
  const wordMapEs: Record<string, string> = {};
  const wordMapEn: Record<string, string> = {};
  for (const w of frWords) wordMapFr[w.word.toLowerCase()] = w.id;
  for (const w of esWords) wordMapEs[w.word.toLowerCase()] = w.id;
  for (const w of enWords) wordMapEn[w.word.toLowerCase()] = w.id;

  const totalWords = await prisma.word.count();
  console.log(`✅ Seeded ${totalWords} vocabulary words total`);

  // 2. Seed stories — French
  console.log("📖 Seeding French stories...");

  for (const storyEntry of frenchStories) {
    const existing = await prisma.story.findFirst({ where: { title: storyEntry.title, language: "fr" } });
    if (existing) { console.log(`  ↷ Skipped existing: "${storyEntry.title}"`); continue; }
    const story = await prisma.story.create({
      data: {
        title: storyEntry.title,
        description: storyEntry.description,
        content: storyEntry.content as any,
        difficulty: storyEntry.difficulty,
        chapter: storyEntry.chapter,
        imageEmoji: storyEntry.imageEmoji,
        language: "fr",
        quizzes: {
          create: storyEntry.quizzes.map((q) => ({
            question: q.question,
            options: q.options,
            answer: q.answer,
          })),
        },
        words: {
          create: storyEntry.highlightedWords
            .filter((w) => wordMapFr[w.toLowerCase()])
            .map((w) => ({ wordId: wordMapFr[w.toLowerCase()] })),
        },
      },
    });
    console.log(`  ✅ Created story: "${story.title}"`);
  }

  // Seed Spanish stories
  console.log("📖 Seeding Spanish stories...");

  for (const storyEntry of spanishStories) {
    const existing = await prisma.story.findFirst({ where: { title: storyEntry.title, language: "es" } });
    if (existing) { console.log(`  ↷ Skipped existing: "${storyEntry.title}"`); continue; }
    const story = await prisma.story.create({
      data: {
        title: storyEntry.title,
        description: storyEntry.description,
        content: storyEntry.content as any,
        difficulty: storyEntry.difficulty,
        chapter: storyEntry.chapter,
        imageEmoji: storyEntry.imageEmoji,
        language: "es",
        quizzes: {
          create: storyEntry.quizzes.map((q) => ({
            question: q.question,
            options: q.options,
            answer: q.answer,
          })),
        },
        words: {
          create: storyEntry.highlightedWords
            .filter((w) => wordMapEs[w.toLowerCase()])
            .map((w) => ({ wordId: wordMapEs[w.toLowerCase()] })),
        },
      },
    });
    console.log(`  ✅ Created story: "${story.title}"`);
  }

  // Seed English stories
  console.log("📖 Seeding English stories...");

  for (const storyEntry of englishStories) {
    const existing = await prisma.story.findFirst({ where: { title: storyEntry.title, language: "en" } });
    if (existing) { console.log(`  ↷ Skipped existing: "${storyEntry.title}"`); continue; }
    const story = await prisma.story.create({
      data: {
        title: storyEntry.title,
        description: storyEntry.description,
        content: storyEntry.content as any,
        difficulty: storyEntry.difficulty,
        chapter: storyEntry.chapter,
        imageEmoji: storyEntry.imageEmoji,
        language: "en",
        quizzes: {
          create: storyEntry.quizzes.map((q) => ({
            question: q.question,
            options: q.options,
            answer: q.answer,
          })),
        },
        words: {
          create: storyEntry.highlightedWords
            .filter((w) => wordMapEn[w.toLowerCase()])
            .map((w) => ({ wordId: wordMapEn[w.toLowerCase()] })),
        },
      },
    });
    console.log(`  ✅ Created story: "${story.title}"`);
  }

  // 3. Create demo users
  console.log("👤 Creating demo users...");

  const hashedPassword = await bcrypt.hash("demo123", 12);

  const student = await prisma.user.upsert({
    where: { email: "student@demo.com" },
    create: {
      email: "student@demo.com",
      name: "Demo Student",
      password: hashedPassword,
      role: "STUDENT",
      progress: {
        create: {
          xp: 150,
          level: 2,
          streak: 3,
          badges: ["first_story", "streak_3"],
          skillTree: { vocabulary: 20, grammar: 15, speaking: 10 },
          weeklyXp: {},
        },
      },
    },
    update: {},
  });

  const teacher = await prisma.user.upsert({
    where: { email: "teacher@demo.com" },
    create: {
      email: "teacher@demo.com",
      name: "Demo Teacher",
      password: hashedPassword,
      role: "TEACHER",
      progress: {
        create: {
          xp: 500,
          level: 4,
          streak: 7,
          badges: ["streak_7", "words_50"],
          skillTree: { vocabulary: 60, grammar: 55, speaking: 40 },
          weeklyXp: {},
        },
      },
    },
    update: {},
  });

  console.log(`  ✅ Student: student@demo.com / demo123`);
  console.log(`  ✅ Teacher: teacher@demo.com / demo123`);

  // 4. Create a demo group (idempotent by inviteCode)
  const existingGroup = await prisma.group.findUnique({ where: { inviteCode: "DEMO2024" } });
  if (!existingGroup) {
    const group = await prisma.group.create({
      data: {
        name: "Language Beginners A",
        teacherId: teacher.id,
        inviteCode: "DEMO2024",
        members: { create: { userId: student.id } },
      },
    });
    console.log(`  ✅ Created class: "${group.name}"`);
  } else {
    console.log(`  ↷ Skipped existing class: "${existingGroup.name}"`);
  }

  console.log("\n🎉 Seeding complete!");
  console.log("\nDemo accounts:");
  console.log("  Student: student@demo.com / demo123");
  console.log("  Teacher: teacher@demo.com / demo123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
