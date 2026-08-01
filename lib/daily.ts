import { CHAINS, type Chain } from "./chains";

/** Days since the Word Chains epoch (2026-08-01), in UTC. */
export function dailyNumber(date = new Date()) {
  const epoch = Date.UTC(2026, 7, 1);
  const today = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Math.floor((today - epoch) / 86_400_000) + 1;
}

export function dailyKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

/**
 * Deterministic pick so every player gets the same chain on the same day.
 * A prime stride walks the whole library before repeating.
 */
export function dailyChain(date = new Date()): Chain {
  const n = dailyNumber(date);
  return CHAINS[(n * 17) % CHAINS.length];
}
