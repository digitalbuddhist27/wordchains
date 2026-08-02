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

/**
 * Depth-first walk of the graph. Backtracks out of dead ends, and never reuses
 * a word inside one chain, so a chain reads as a real progression.
 */
function walk(start: string, length: number, tier: Tier, rng: Rng): string[] | null {
  const adjacency = ADJACENCY[tier];
  const path = [start];
  const used = new Set([start]);

  function step(): boolean {
    if (path.length === length) return true;
    const next = adjacency.get(path[path.length - 1]);
    if (!next) return false;
    for (const word of shuffled(next, rng)) {
      if (used.has(word)) continue;
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

/** Builds one chain. Returns null only if the graph genuinely cannot supply one. */
export function generateChain(difficulty: Difficulty, rng: Rng = Math.random): Chain | null {
  const rules = RULES[difficulty];

  for (const tier of [rules.maxTier, 2, 3] as Tier[]) {
    for (const start of shuffled(STARTS[tier], rng)) {
      const words = walk(start, rules.length, tier, rng);
      if (!words) continue;
      return {
        id: words.join("-").toLowerCase(),
        difficulty,
        words,
        direction: rng() < rules.bothEndsChance ? "both-ends" : "forward",
      };
    }
  }
  return null;
}

/** Same chain for everyone on a given day. */
export function generateSeeded(difficulty: Difficulty, seed: number): Chain | null {
  return generateChain(difficulty, mulberry32(seed));
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
