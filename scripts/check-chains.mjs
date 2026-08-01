/**
 * Guards the chain library. Run by `npm run check:chains`, which `npm run build`
 * depends on, so a bad chain fails the build instead of reaching players.
 *
 * Checks: minimum word length, no repeated word inside one chain, and no
 * duplicate chains.
 */
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../lib/chains.ts", import.meta.url), "utf8");

const MIN = Number(src.match(/MIN_WORD_LENGTH = (\d+)/)?.[1] ?? 4);
const rows = [...src.matchAll(/words: \[([^\]]+)\]/g)].map((m) =>
  m[1].split(",").map((w) => w.trim().replace(/"/g, ""))
);

if (rows.length === 0) {
  console.error("check:chains — found no chains to check");
  process.exit(1);
}

const errors = [];
const seen = new Map();

for (const words of rows) {
  const label = words.join(" > ");

  const short = words.filter((w) => w.length < MIN);
  if (short.length) errors.push(`under ${MIN} letters (${short.join(", ")}): ${label}`);

  const dupes = words.filter((w, i) => words.indexOf(w) !== i);
  if (dupes.length) errors.push(`repeats ${[...new Set(dupes)].join(", ")}: ${label}`);

  const key = words.join("|");
  if (seen.has(key)) errors.push(`duplicate chain: ${label}`);
  seen.set(key, true);
}

if (errors.length) {
  console.error(`check:chains FAILED (${errors.length})`);
  for (const e of errors) console.error("  " + e);
  process.exit(1);
}

const total = rows.reduce((n, w) => n + w.length, 0);
console.log(`check:chains OK — ${rows.length} chains, ${total} words, all >= ${MIN} letters`);
