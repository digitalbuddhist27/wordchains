import { WORD_LIST } from "./word-list";

/**
 * Server-side only. The list is ~400KB, far too heavy to ship to a phone, so
 * the client never imports this: local play asks /api/validate, and online play
 * is already evaluated on the server.
 */
let cache: Set<string> | null = null;

function words() {
  if (!cache) cache = new Set(WORD_LIST.split(" "));
  return cache;
}

export function isRealWord(guess: string) {
  const clean = guess.trim().toLowerCase().replace(/[^a-z]/g, "");
  if (clean.length < 2) return false;
  return words().has(clean);
}

export function dictionarySize() {
  return words().size;
}
