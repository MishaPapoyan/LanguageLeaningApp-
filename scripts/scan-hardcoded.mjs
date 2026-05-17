#!/usr/bin/env node
/**
 * Deterministic hardcoded-English scanner (no AI, no sub-agents).
 * Finds user-facing English in .tsx that is NOT wrapped in t(...):
 *   - JSX text nodes  > Some Text <
 *   - user-facing string props: placeholder / title / aria-label / alt
 * Skips the noise categories (className/style/href/key/console/etc.)
 * and skips data/ (learning material — handled by the content policy).
 *
 * Output: .i18n-audit/scan.md  (inventory grouped by file, ranked).
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const DIRS = ["app", "components"];
const SKIP_DIR = /(^|\/)(node_modules|\.next|\.git|generated)(\/|$)/;

function walk(dir, acc = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (SKIP_DIR.test(p.replace(/\\/g, "/"))) continue;
    const s = statSync(p);
    if (s.isDirectory()) walk(p, acc);
    else if (p.endsWith(".tsx")) acc.push(p);
  }
  return acc;
}

// A string is "UI English" if it has >=2 consecutive ASCII letters and a space
// or is a capitalized word, and is not obviously code.
const looksEnglish = (s) => {
  const t = s.trim();
  if (t.length < 2) return false;
  if (!/[A-Za-z]{2}/.test(t)) return false;
  if (/^[a-z]+([A-Z][a-z]*)+$/.test(t)) return false; // camelCase ident
  if (/^[A-Z0-9_]+$/.test(t)) return false; // CONST
  if (/^(https?:|\/|#|\.|@|var\(|--|rgb|oklch|px|em|rem)/.test(t)) return false;
  if (/^\{.*\}$/.test(t)) return false; // pure {expr}
  return true;
};

const files = DIRS.flatMap((d) => {
  try { return walk(join(ROOT, d)); } catch { return []; }
});

let report = ["# Hardcoded-English scan (deterministic)", ""];
let grand = 0;
const perFile = [];

for (const f of files.sort()) {
  const txt = readFileSync(f, "utf8");
  const lines = txt.split("\n");
  const hits = [];
  lines.forEach((ln, i) => {
    if (/\bt\(\s*locale/.test(ln)) return; // already translated on this line
    // JSX text node: >Text<
    let m;
    const jsx = /> *([^<>{}\n][^<>{}\n]*?) *</g;
    while ((m = jsx.exec(ln))) {
      const s = m[1].trim();
      if (looksEnglish(s) && /[A-Za-z]/.test(s[0] ?? "")) hits.push([i + 1, "jsx", s]);
    }
    // user-facing string props
    const prop = /\b(placeholder|title|aria-label|alt)\s*=\s*"([^"]+)"/g;
    while ((m = prop.exec(ln))) {
      if (looksEnglish(m[2])) hits.push([i + 1, m[1], m[2]]);
    }
  });
  if (hits.length) {
    grand += hits.length;
    const rel = relative(ROOT, f).replace(/\\/g, "/");
    perFile.push([rel, hits]);
  }
}

perFile.sort((a, b) => b[1].length - a[1].length);
report.push(`**${grand} candidate strings across ${perFile.length} files** (ranked by count).`, "");
report.push("Heuristic — review before sweeping. Skips already-`t()` lines, data/, code-ish strings.", "");
for (const [rel, hits] of perFile) {
  report.push(`### ${rel}  · ${hits.length}`);
  report.push("| line | kind | string |", "|---|---|---|");
  for (const [ln, kind, s] of hits) {
    report.push(`| ${ln} | ${kind} | ${s.replace(/\|/g, "\\|").slice(0, 100)} |`);
  }
  report.push("");
}

mkdirSync(join(ROOT, ".i18n-audit"), { recursive: true });
writeFileSync(join(ROOT, ".i18n-audit", "scan.md"), report.join("\n"), "utf8");
console.log(`scan: ${grand} candidates / ${perFile.length} files -> .i18n-audit/scan.md`);
