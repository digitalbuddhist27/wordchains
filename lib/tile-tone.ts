import type { WordGrade } from "./game";

/**
 * How a solved tile is painted. A tile turns the colour of its result rather
 * than always going green, so the board reads like the end-of-chain grid: you
 * can see at a glance which words you got cold and which you had to be shown.
 */
export const TILE_TONE: Record<WordGrade, string> = {
  given: "border-brand/40 bg-brand/5 dark:bg-brand/10",
  clean: "border-chain/60 bg-chain/10",
  light: "border-sky bg-sky/15",
  medium: "border-gold/70 bg-gold/15",
  heavy: "border-orange-500/60 bg-orange-500/10",
  failed: "border-red-500/60 bg-red-500/10",
};

/** The little check badge on a solved tile takes the same colour. */
export const BADGE_TONE: Record<WordGrade, string> = {
  given: "bg-brand",
  clean: "bg-chain",
  light: "bg-sky",
  medium: "bg-gold",
  heavy: "bg-orange-500",
  failed: "bg-red-500",
};
