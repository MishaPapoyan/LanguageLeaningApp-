#!/usr/bin/env node
/**
 * Guards against romanized Armenian regressions in lib/i18n.ts.
 * Fails (exit 1) if any `hy` value is majority-Latin alphabetic
 * (i.e. Armenian written in Latin letters like "Makardak").
 * Brand/loanwords and pure-variable strings are allowlisted.
 *
 * Run: npm run check:i18n
 */
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../lib/i18n.ts", import.meta.url), "utf8");
const lines = src.split("\n");
const start = lines.findIndex((l) => l.startsWith("const hy"));
const end = lines.findIndex((l, i) => i > start && l.startsWith("};"));

// Substrings that legitimately contain Latin — ignore the whole value if present.
const ALLOW = ["lingova", "@", "xp", "ai", " ok", "http", "://"];
const KEY_RE = /^\s*(\w+):\s*"(.*)",?\s*$/;
const ARMENIAN = /[԰-֏]/;
const LATIN = /[A-Za-z]/;

const violations = [];
for (let i = start + 1; i < end; i++) {
  const m = KEY_RE.exec(lines[i]);
  if (!m) continue;
  const [, key, val] = m;
  const low = val.toLowerCase();
  if (ALLOW.some((a) => low.includes(a))) continue;
  // Strip {var} placeholders — their names are code, not translatable text.
  const bare = val.replace(/\{[^}]*\}/g, "");
  const letters = [...bare].filter((c) => /[A-Za-z԰-֏]/.test(c));
  if (letters.length < 3) continue; // pure {vars}/symbols/digits
  const latin = letters.filter((c) => LATIN.test(c)).length;
  const armenian = letters.filter((c) => ARMENIAN.test(c)).length;
  // Romanized = mostly Latin and essentially no Armenian script.
  if (latin / letters.length > 0.5 && armenian === 0) {
    violations.push(`  ${key}  →  "${val}"`);
  }
}

if (violations.length) {
  console.error(
    `\n✗ ${violations.length} romanized (Latin) Armenian value(s) in lib/i18n.ts.\n` +
      `  Armenian UI must use Armenian script (Մակարդակ, not "Makardak").\n` +
      violations.join("\n") +
      "\n"
  );
  process.exit(1);
}
console.log("✓ i18n: no romanized Armenian values.");
