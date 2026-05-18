/**
 * Backfills Armenian overlays onto Word rows that already exist in the DB.
 *
 * `prisma.word.createMany({ skipDuplicates })` in the seed never UPDATES
 * existing rows, so after generating data/overlays-hy.json this script pushes
 * translationHy / definitionHy into rows that are missing them.
 *
 * Safe to run repeatedly. Run:  npm run i18n:backfill-hy
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const OUT = resolve(__dirname, "../data/overlays-hy.json");

interface Overlay {
  translationHy: string;
  definitionHy: string;
}

async function main() {
  if (!existsSync(OUT)) {
    console.error("✗ data/overlays-hy.json not found — run `npm run i18n:gen-hy` first.");
    process.exit(1);
  }
  const map = JSON.parse(readFileSync(OUT, "utf8")) as Record<string, Overlay>;
  const keys = Object.keys(map);
  console.log(`📦 ${keys.length} overlays loaded`);

  let updated = 0;
  let skipped = 0;

  for (const k of keys) {
    const sep = k.indexOf(":");
    const lang = k.slice(0, sep);
    const word = k.slice(sep + 1);
    const { translationHy, definitionHy } = map[k];

    // Match case-insensitively on word within the language; only fill rows
    // that don't already have an Armenian overlay.
    const res = await prisma.word.updateMany({
      where: {
        language: lang,
        word: { equals: word, mode: "insensitive" },
        translationHy: null,
      },
      data: { translationHy, definitionHy },
    });
    if (res.count > 0) updated += res.count;
    else skipped++;
  }

  console.log(`✅ Backfill complete — ${updated} rows updated, ${skipped} already populated / not found`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
