import { LINKS, type Tier } from "./links";

export type Difficulty = "easy" | "medium" | "hard";
export type Direction = "forward" | "both-ends";

export type Chain = {
  id: string;
  title?: string;
  difficulty: Difficulty;
  words: string[];
  direction: Direction;
};

/** No word shorter than this may appear in a chain. */
export const MIN_WORD_LENGTH = 4;

type Rules = { length: number; maxTier: Tier; bothEndsChance: number };

const RULES: Record<Difficulty, Rules> = {
  easy: { length: 6, maxTier: 1, bothEndsChance: 0 },
  medium: { length: 7, maxTier: 2, bothEndsChance: 0.15 },
  hard: { length: 8, maxTier: 3, bothEndsChance: 0.25 },
};

/** from -> [to, ...] per tier ceiling, built once at module load. */
const ADJACENCY: Record<Tier, Map<string, string[]>> = {
  1: new Map(),
  2: new Map(),
  3: new Map(),
};

for (const [from, to, tier] of LINKS) {
  for (const ceiling of [1, 2, 3] as Tier[]) {
    if (tier <= ceiling) {
      const list = ADJACENCY[ceiling].get(from);
      if (list) list.push(to);
      else ADJACENCY[ceiling].set(from, [to]);
    }
  }
}

const STARTS: Record<Tier, string[]> = {
  1: [...ADJACENCY[1].keys()],
  2: [...ADJACENCY[2].keys()],
  3: [...ADJACENCY[3].keys()],
};

/**
 * How many ways out a word has. Hub words like OVER, WORK and HOUSE have many,
 * so an unweighted walk funnels through them and every chain starts to look the
 * same. Exploration order is weighted against them.
 */
const OUT_DEGREE = new Map<string, number>();
for (const [from] of LINKS) OUT_DEGREE.set(from, (OUT_DEGREE.get(from) ?? 0) + 1);

function spreadWeight(word: string) {
  return 1 / Math.pow(1 + (OUT_DEGREE.get(word) ?? 0), 0.9);
}

/** Small deterministic PRNG so the Daily Chain is the same for everyone. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rng = () => number;

function shuffled<T>(items: readonly T[], rng: Rng): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Random order, but rarer words come up first far more often than hubs. */
function spreadOrder(words: readonly string[], rng: Rng): string[] {
  const pool = words.map((w) => ({ w, weight: spreadWeight(w) }));
  const out: string[] = [];
  while (pool.length) {
    let total = 0;
    for (const p of pool) total += p.weight;
    let roll = rng() * total;
    let picked = pool.length - 1;
    for (let i = 0; i < pool.length; i++) {
      roll -= pool[i].weight;
      if (roll <= 0) {
        picked = i;
        break;
      }
    }
    out.push(pool[picked].w);
    pool.splice(picked, 1);
  }
  return out;
}

/**
 * Depth-first walk of the graph. Backtracks out of dead ends, and never reuses
 * a word inside one chain, so a chain reads as a real progression.
 */
function walk(
  start: string,
  length: number,
  tier: Tier,
  rng: Rng,
  exclude: ReadonlySet<string>
): string[] | null {
  const adjacency = ADJACENCY[tier];
  const path = [start];
  const used = new Set([start]);

  function step(): boolean {
    if (path.length === length) return true;
    const next = adjacency.get(path[path.length - 1]);
    if (!next) return false;
    for (const word of spreadOrder(next, rng)) {
      if (used.has(word) || exclude.has(word)) continue;
      path.push(word);
      used.add(word);
      if (step()) return true;
      path.pop();
      used.delete(word);
    }
    return false;
  }

  return step() ? path : null;
}

export type GenerateOptions = {
  /** Words already spent this match. Nothing repeats inside one match. */
  exclude?: ReadonlySet<string>;
  rng?: Rng;
};

const NONE: ReadonlySet<string> = new Set();

/**
 * Builds one chain. Tries hard to honour `exclude`, then relaxes it rather than
 * failing, so a long match can never dead-end on an empty board.
 */
export function generateChain(
  difficulty: Difficulty,
  rngOrOptions: Rng | GenerateOptions = Math.random
): Chain | null {
  const options: GenerateOptions =
    typeof rngOrOptions === "function" ? { rng: rngOrOptions } : rngOrOptions;
  const rng = options.rng ?? Math.random;
  const rules = RULES[difficulty];

  for (const exclude of [options.exclude ?? NONE, NONE]) {
    for (const tier of [rules.maxTier, 2, 3] as Tier[]) {
      for (const start of spreadOrder(STARTS[tier], rng)) {
        if (exclude.has(start)) continue;
        const words = walk(start, rules.length, tier, rng, exclude);
        if (!words) continue;
        return {
          id: words.join("-").toLowerCase(),
          difficulty,
          words,
          direction: rng() < rules.bothEndsChance ? "both-ends" : "forward",
        };
      }
    }
    if (exclude === NONE) break;
  }
  return null;
}

/** Same chain for everyone on a given day. */
export function generateSeeded(difficulty: Difficulty, seed: number): Chain | null {
  return generateChain(difficulty, { rng: mulberry32(seed) });
}

export function chainLength(difficulty: Difficulty) {
  return RULES[difficulty].length;
}

/** Graph stats, for the validator and the API. */
export function graphStats() {
  const words = new Set<string>();
  for (const [from, to] of LINKS) {
    words.add(from);
    words.add(to);
  }
  return { links: LINKS.length, words: words.size, startWords: STARTS[3].length };
}
