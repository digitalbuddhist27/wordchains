/**
 * Guards the link graph. Run by `npm run check:chains`, which `npm run build`
 * depends on, so a bad link fails the build instead of reaching players.
 *
 * Checks: minimum word length, no self-links, no duplicate pairs, and that the
 * graph can actually produce a full chain at every difficulty.
 */
import { readFileSync } from "node:fs";

const linksSrc = readFileSync(new URL("../lib/links.ts", import.meta.url), "utf8");
const chainsSrc = readFileSync(new URL("../lib/chains.ts", import.meta.url), "utf8");

const MIN = Number(chainsSrc.match(/MIN_WORD_LENGTH = (\d+)/)?.[1] ?? 4);
const MAX = Number(chainsSrc.match(/MAX_WORD_LENGTH = (\d+)/)?.[1] ?? 6);
// Per-difficulty ceilings, read straight out of RULES so they cannot drift.
const RULE_RE = /(easy|medium|hard):\s*\{[^}]*length:\s*(\d+)[^}]*maxTier:\s*(\d+)[^}]*maxWord:\s*(\d+)/g;
const RULES = [...chainsSrc.matchAll(RULE_RE)].map((m) => ({
  name: m[1],
  length: Number(m[2]),
  tier: Number(m[3]),
  maxWord: Number(m[4]),
}));
const pairs = [...linksSrc.matchAll(/\["([A-Z]+)", "([A-Z]+)", ([123])\]/g)].map((m) => [
  m[1],
  m[2],
  Number(m[3]),
]);

const errors = [];
if (pairs.length === 0) errors.push("found no links to check");

const seen = new Set();
for (const [from, to, tier] of pairs) {
  if (from.length < MIN) errors.push(`"${from}" is under ${MIN} letters (${from} + ${to})`);
  if (to.length < MIN) errors.push(`"${to}" is under ${MIN} letters (${from} + ${to})`);
  if (from.length > MAX) errors.push(`"${from}" is over ${MAX} letters (${from} + ${to})`);
  if (to.length > MAX) errors.push(`"${to}" is over ${MAX} letters (${from} + ${to})`);
  if (from === to) errors.push(`self-link: ${from} + ${to}`);
  if (![1, 2, 3].includes(tier)) errors.push(`bad tier ${tier} on ${from} + ${to}`);
  const key = `${from}>${to}`;
  if (seen.has(key)) errors.push(`duplicate pair: ${from} + ${to}`);
  seen.add(key);
}

// Can the graph actually walk a full chain at each difficulty?
const adjacency = new Map();
for (const [from, to, tier] of pairs) {
  for (const ceiling of [1, 2, 3]) {
    if (tier > ceiling) continue;
    const k = `${ceiling}:${from}`;
    adjacency.set(k, [...(adjacency.get(k) ?? []), to]);
  }
}

function longestFrom(start, ceiling, maxWord, used = new Set()) {
  used.add(start);
  let best = 1;
  for (const next of adjacency.get(`${ceiling}:${start}`) ?? []) {
    if (used.has(next) || next.length > maxWord) continue;
    best = Math.max(best, 1 + longestFrom(next, ceiling, maxWord, used));
    if (best > 12) break;
  }
  used.delete(start);
  return best;
}

const reachable = {};
for (const { name, length, tier, maxWord } of RULES) {
  const starts = [
    ...new Set(
      pairs.filter(([f, , t]) => t <= tier && f.length <= maxWord).map(([f]) => f)
    ),
  ];
  const ok = starts.filter((s) => longestFrom(s, tier, maxWord) >= length);
  reachable[name] = ok.length;
  if (ok.length === 0) {
    errors.push(
      `graph cannot build a ${length}-word ${name} chain at tier <= ${tier} with words <= ${maxWord} letters`
    );
  }
}

if (errors.length) {
  console.error(`check:chains FAILED (${errors.length})`);
  for (const e of errors.slice(0, 40)) console.error("  " + e);
  process.exit(1);
}

const words = new Set(pairs.flatMap(([f, t]) => [f, t]));
console.log(
  `check:chains OK — ${pairs.length} links, ${words.size} words, all ${MIN}-${MAX} letters. ` +
    RULES.map((r) => `${r.name} ${reachable[r.name]} starts (<=${r.maxWord})`).join(", ") +
    "."
);
