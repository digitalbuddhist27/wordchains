import { generateSeeded, type Chain, type Difficulty } from "./chains";

/**
 * The Daily Chain rolls over at midnight Eastern, not UTC. UTC midnight is 8pm
 * the previous evening in New York, so the "new" puzzle used to land during
 * dinner the day before.
 */
export const DAILY_TIMEZONE = "America/New_York";

const EPOCH = Date.UTC(2026, 7, 1); // 2026-08-01, day 1

/** The calendar date in Eastern time, as a UTC timestamp of that Y/M/D. */
function easternDay(date: Date) {
  const [y, m, d] = new Intl.DateTimeFormat("en-CA", {
    timeZone: DAILY_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .split("-")
    .map(Number);
  return Date.UTC(y, m - 1, d);
}

/** Days since the Word Chains epoch, counted in Eastern time. */
export function dailyNumber(date = new Date()) {
  return Math.floor((easternDay(date) - EPOCH) / 86_400_000) + 1;
}

export function dailyKey(date = new Date()) {
  return new Date(easternDay(date)).toISOString().slice(0, 10);
}

/** Seconds until the next Eastern midnight, so the page revalidates on time. */
export function secondsUntilRollover(date = new Date()) {
  const [h, m, sec] = new Intl.DateTimeFormat("en-GB", {
    timeZone: DAILY_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
    .format(date)
    .split(":")
    .map(Number);
  const elapsed = h * 3600 + m * 60 + sec;
  return Math.max(60, 86_400 - elapsed);
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
