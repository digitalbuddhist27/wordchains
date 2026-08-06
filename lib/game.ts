import type { Chain } from "./chains";

export type Mode = "solo" | "pass_and_play" | "daily";

export type Player = {
  id: string;
  name: string;
  color: string;
  score: number;
};

export type GameState = {
  chain: Chain;
  mode: Mode;
  players: Player[];
  currentPlayer: number;
  /** index of the word currently being guessed */
  currentIndex: number;
  /** how many leading letters are exposed for each word */
  revealed: number[];
  solved: boolean[];
  /** which player solved each word (null = given or auto-revealed) */
  solvedBy: (number | null)[];
  /** letters exposed at the moment each word was solved (for scoring/share) */
  hintsUsed: (number | null)[];
  status: "active" | "complete";
  lastEvent: GameEvent | null;
  turnStreak: number;
  /** Misses, including passes. Every one exposed a letter. */
  errors: number;
};

export type GameEvent =
  | { type: "correct"; index: number; word: string; points: number; player: number }
  | { type: "invalid"; guess: string }
  | { type: "miss"; index: number; guess: string; player: number; revealed: number }
  | { type: "auto"; index: number; word: string }
  | { type: "complete" };

export const PLAYER_COLORS = ["#6C5CE7", "#22C55E", "#FACC15", "#7DD3FC", "#F472B6", "#FB923C"];

export function scoreFor(word: string, lettersRevealed: number) {
  return Math.max(word.length - (lettersRevealed - 1), 1);
}

export function makePlayers(names: string[]): Player[] {
  return names.map((name, i) => ({
    id: `p${i}`,
    name: name.trim() || `Player ${i + 1}`,
    color: PLAYER_COLORS[i % PLAYER_COLORS.length],
    score: 0,
  }));
}

export function initGame(chain: Chain, mode: Mode, players: Player[]): GameState {
  const n = chain.words.length;
  const revealed = chain.words.map((w, i) => (i === 0 ? w.length : 1));
  const solved = chain.words.map((_, i) => i === 0);
  const solvedBy: (number | null)[] = chain.words.map(() => null);
  const hintsUsed: (number | null)[] = chain.words.map(() => null);

  if (chain.direction === "both-ends") {
    revealed[n - 1] = chain.words[n - 1].length;
    solved[n - 1] = true;
  }

  return {
    chain,
    mode,
    players,
    currentPlayer: 0,
    currentIndex: firstUnsolved(solved, 0),
    revealed,
    solved,
    solvedBy,
    hintsUsed,
    status: "active",
    lastEvent: null,
    turnStreak: 0,
    errors: 0,
  };
}

function firstUnsolved(solved: boolean[], from: number) {
  for (let i = from; i < solved.length; i++) if (!solved[i]) return i;
  return -1;
}

function normalize(s: string) {
  return s.trim().toUpperCase().replace(/[^A-Z]/g, "");
}

/** Advance to the next unsolved word, or mark the game complete. */
function advance(state: GameState): GameState {
  const next = firstUnsolved(state.solved, state.currentIndex);
  if (next === -1) {
    return { ...state, currentIndex: -1, status: "complete", lastEvent: { type: "complete" } };
  }
  return { ...state, currentIndex: next };
}

/**
 * `isWord` decides whether a wrong guess was at least a real English word.
 * Nonsense is rejected outright: no letter revealed, no error charged, because
 * a typo should not cost a hint. Omit it and every wrong guess counts as a miss.
 */
export function submitGuess(
  state: GameState,
  guess: string,
  isWord?: (w: string) => boolean
): GameState {
  if (state.status !== "active" || state.currentIndex < 0) return state;

  const i = state.currentIndex;
  const word = state.chain.words[i];
  const clean = normalize(guess);

  if (clean !== word && isWord && !isWord(clean)) {
    return { ...state, lastEvent: { type: "invalid", guess: clean } };
  }

  if (clean && clean === word) {
    const points = scoreFor(word, state.revealed[i]);
    const players = state.players.map((p, pi) =>
      pi === state.currentPlayer ? { ...p, score: p.score + points } : p
    );
    const revealed = [...state.revealed];
    revealed[i] = word.length;
    const solved = [...state.solved];
    solved[i] = true;
    const solvedBy = [...state.solvedBy];
    solvedBy[i] = state.currentPlayer;
    const hintsUsed = [...state.hintsUsed];
    hintsUsed[i] = state.revealed[i];

    const next: GameState = {
      ...state,
      players,
      revealed,
      solved,
      solvedBy,
      hintsUsed,
      turnStreak: state.turnStreak + 1,
      lastEvent: { type: "correct", index: i, word, points, player: state.currentPlayer },
    };
    const advanced = advance(next);
    // keep the "correct" event visible even when the chain just completed
    return advanced.status === "complete" ? { ...advanced, lastEvent: next.lastEvent } : advanced;
  }

  return miss(state, clean);
}

/** Wrong guess, explicit pass, or a timeout. */
export function miss(state: GameState, guess = ""): GameState {
  if (state.status !== "active" || state.currentIndex < 0) return state;

  const i = state.currentIndex;
  const word = state.chain.words[i];
  const revealed = [...state.revealed];
  revealed[i] = Math.min(revealed[i] + 1, word.length);

  let solved = state.solved;
  let hintsUsed = state.hintsUsed;
  let event: GameEvent = {
    type: "miss",
    index: i,
    guess,
    player: state.currentPlayer,
    revealed: revealed[i],
  };

  // Safety valve: every letter exposed and still unsolved -> auto-reveal, no points.
  if (revealed[i] >= word.length) {
    solved = [...state.solved];
    solved[i] = true;
    hintsUsed = [...state.hintsUsed];
    hintsUsed[i] = word.length;
    event = { type: "auto", index: i, word };
  }

  const nextPlayer = (state.currentPlayer + 1) % state.players.length;
  const next: GameState = {
    ...state,
    revealed,
    solved,
    hintsUsed,
    currentPlayer: nextPlayer,
    turnStreak: 0,
    errors: state.errors + 1,
    lastEvent: event,
  };
  const advanced = advance(next);
  return advanced.status === "complete" ? { ...advanced, lastEvent: event } : advanced;
}

/** Display string for a word: revealed letters, then blanks. */
export function letterSlots(word: string, revealed: number, solved: boolean) {
  return word.split("").map((ch, i) => ({
    char: solved || i < revealed ? ch : null,
    key: i,
  }));
}

export function summarize(state: GameState) {
  const words = state.chain.words;
  const guessable = words
    .map((w, i) => ({ w, i }))
    .filter(({ i }) => state.hintsUsed[i] !== null);

  const totalHints = guessable.reduce((sum, { i }) => sum + (state.hintsUsed[i] ?? 0), 0);
  const firstTry = guessable.filter(({ i }) => state.hintsUsed[i] === 1);
  const best = [...guessable]
    .filter(({ i }) => state.solvedBy[i] !== null)
    .sort((a, b) => scoreFor(b.w, state.hintsUsed[b.i]!) - scoreFor(a.w, state.hintsUsed[a.i]!))[0];

  const ranked = [...state.players].sort((a, b) => b.score - a.score);
  const topScore = ranked[0]?.score ?? 0;
  const winners = ranked.filter((p) => p.score === topScore);

  return {
    totalScore: state.players.reduce((s, p) => s + p.score, 0),
    errors: state.errors,
    totalHints,
    cleanSolves: firstTry.length,
    guessableCount: guessable.length,
    mvpWord: best?.w ?? null,
    ranked,
    winners,
  };
}

/**
 * How much of each word the player had to be shown, normalised so words of
 * different lengths compare fairly.
 *
 * exposure = (letters shown - 1) / (letters you had to guess)
 *   0 = solved off the free first letter alone
 *   1 = never got it, the whole word was revealed
 *
 * The old version bucketed on the raw letter count, so 3 letters shown on a
 * 4-letter word (75% given away) scored the same as 3 on an 8-letter word
 * (25%). Same colour, wildly different achievement.
 */
export type WordGrade = "given" | "clean" | "light" | "medium" | "heavy" | "failed";

/** One word's grade from how many letters it had to show. Shared by the board
 *  tiles, the end-of-chain grid and the shared emoji, so they can never drift. */
export function gradeWord(word: string, shown: number | null): WordGrade {
  if (shown === null) return "given";
  if (shown >= word.length) return "failed";

  const guessable = Math.max(word.length - 1, 1);
  const exposure = (shown - 1) / guessable;
  if (exposure === 0) return "clean";
  if (exposure <= 1 / 3) return "light";
  if (exposure <= 2 / 3) return "medium";
  return "heavy";
}

export function gradeWords(state: GameState): { word: string; grade: WordGrade }[] {
  return state.chain.words.map((word, i) => ({
    word,
    grade: gradeWord(word, state.hintsUsed[i]),
  }));
}

const GRADE_SQUARE: Record<WordGrade, string> = {
  given: "⬜",
  clean: "🟩",
  light: "🟦",
  medium: "🟨",
  heavy: "🟧",
  failed: "🟥",
};

/**
 * Spoiler-free result, one BAR per word you actually played, stacked top to
 * bottom so it reads like the board. Each bar is as long as its word and
 * coloured by how much of it you had to be shown.
 *
 * Given words are left out: they were never scored, so a colourless row for
 * them said nothing. (Both-ends chains hand you the last word too, so this can
 * trim from either end.)
 */
export function shareGrid(state: GameState) {
  return gradeWords(state)
    .filter(({ grade }) => grade !== "given")
    .map(({ word, grade }) => GRADE_SQUARE[grade].repeat(word.length))
    .join("\n");
}

export { GRADE_SQUARE };
