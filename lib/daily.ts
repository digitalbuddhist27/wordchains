import { generateSeeded, type Chain, type Difficulty } from "./chains";

/** Days since the Word Chains epoch (2026-08-01), in UTC. */
export function dailyNumber(date = new Date()) {
  const epoch = Date.UTC(2026, 7, 1);
  const today = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Math.floor((today - epoch) / 86_400_000) + 1;
}

export function dailyKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

/** Difficulty rotates so the daily is not always the same shape. */
export function dailyDifficulty(n = dailyNumber()): Difficulty {
  return (["easy", "medium", "easy", "hard", "medium", "easy", "medium"] as const)[n % 7];
}

/**
 * Walked from a seed derived from the day number, so every player gets the same
 * chain on the same day without storing anything.
 */
export function dailyChain(date = new Date()): Chain {
  const n = dailyNumber(date);
  const difficulty = dailyDifficulty(n);
  const chain = generateSeeded(difficulty, n * 2654435761);
  if (!chain) throw new Error(`daily chain ${n} could not be generated`);
  return { ...chain, direction: "forward", title: `Daily Chain #${n}` };
}
