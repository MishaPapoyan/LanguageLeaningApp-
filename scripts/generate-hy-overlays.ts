/**
 * One-off (resumable) generator for Armenian word overlays.
 *
 * Reads the canonical vocab source files, asks Groq to translate each word's
 * English `translation` + `definition` into Armenian, and writes the result
 * into data/overlays-hy.json keyed by "<lang>:<word lowercased>".
 *
 * - Idempotent & resumable: words already present in the JSON are skipped, and
 *   the file is flushed after every batch so an interrupted run loses nothing.
 * - Does NOT mutate the hand-written vocab files — the single JSON is easy to
 *   review/spot-check before it is merged at seed time.
 *
 * Run:  npm run i18n:gen-hy
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import Groq from "groq-sdk";
import { frenchVocabulary } from "../data/french-vocabulary";
import { spanishVocabulary } from "../data/spanish-vocabulary";
import { englishVocabulary } from "../data/english-vocabulary";

// ── Minimal .env loader (no dotenv dependency in this repo) ───────────────────
const envPath = resolve(__dirname, "../.env");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

if (!process.env.GROQ_API_KEY) {
  console.error("✗ GROQ_API_KEY not found in environment or .env");
  process.exit(1);
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = "llama-3.3-70b-versatile";
const BATCH = 6;

const OUT = resolve(__dirname, "../data/overlays-hy.json");

interface Overlay {
  translationHy: string;
  definitionHy: string;
}
type OverlayMap = Record<string, Overlay>;

interface Src {
  lang: string;
  word: string;
  translation: string;
  definition: string;
}

const SOURCES: Src[] = [
  ...frenchVocabulary.map((v) => ({ lang: "fr", word: v.word, translation: v.translation, definition: v.definition })),
  ...spanishVocabulary.map((v) => ({ lang: "es", word: v.word, translation: v.translation, definition: v.definition })),
  ...englishVocabulary.map((v) => ({ lang: "en", word: v.word, translation: v.translation, definition: v.definition })),
];

const key = (lang: string, word: string) => `${lang}:${word.toLowerCase()}`;

function load(): OverlayMap {
  if (!existsSync(OUT)) return {};
  try {
    return JSON.parse(readFileSync(OUT, "utf8")) as OverlayMap;
  } catch {
    return {};
  }
}

function flush(map: OverlayMap) {
  const sorted = Object.fromEntries(Object.entries(map).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(OUT, JSON.stringify(sorted, null, 2) + "\n", "utf8");
}

async function translateBatch(items: Src[]): Promise<Record<number, Overlay>> {
  const list = items
    .map((it, i) => `${i}. word="${it.word}" | en_translation="${it.translation}" | en_definition="${it.definition}"`)
    .join("\n");

  const completion = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are a professional translator into Eastern Armenian. " +
          "Translate language-learning glosses naturally and concisely. " +
          "Use proper Armenian script only (never Latin/romanized). Return ONLY valid JSON.",
      },
      {
        role: "user",
        content: `For each item, translate the English translation and definition into Armenian.
Keep the translation short (a word or short phrase, like a dictionary gloss).
Keep the definition one concise sentence.

Items:
${list}

Return JSON exactly in this shape:
{ "items": [ { "i": 0, "translationHy": "...", "definitionHy": "..." }, ... ] }`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw);
  const out: Record<number, Overlay> = {};
  for (const r of parsed.items ?? []) {
    if (typeof r.i === "number" && r.translationHy && r.definitionHy) {
      out[r.i] = { translationHy: String(r.translationHy).trim(), definitionHy: String(r.definitionHy).trim() };
    }
  }
  return out;
}

async function main() {
  const map = load();
  const todo = SOURCES.filter((s) => !map[key(s.lang, s.word)]);

  console.log(`📖 ${SOURCES.length} source words · ${SOURCES.length - todo.length} already done · ${todo.length} to translate`);
  if (todo.length === 0) {
    console.log("✓ Nothing to do — overlays-hy.json is complete.");
    return;
  }

  let done = 0;
  for (let i = 0; i < todo.length; i += BATCH) {
    const batch = todo.slice(i, i + BATCH);
    try {
      const res = await translateBatch(batch);
      for (let j = 0; j < batch.length; j++) {
        const r = res[j];
        if (r) map[key(batch[j].lang, batch[j].word)] = r;
      }
      flush(map);
      done += Object.keys(res).length;
      console.log(`  ✓ batch ${i / BATCH + 1}: +${Object.keys(res).length}  (total ${done}/${todo.length})`);
    } catch (err) {
      console.error(`  ✗ batch ${i / BATCH + 1} failed:`, (err as Error).message);
      console.error("    (progress saved — re-run the script to resume)");
    }
  }

  console.log(`✅ Done. ${done} new overlays written to data/overlays-hy.json`);
}

main();
