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

/**
 * Curated chain library. Every consecutive pair forms a compound word or a
 * common two-word phrase (WATER + FALL = waterfall, FALL + BACK = fallback).
 *
 * Every word is at least MIN_WORD_LENGTH letters. Short connectors like OUT,
 * WAY, UP and TOP are deliberately excluded: they make the blanks trivial and
 * the chains cheap. `npm run check:chains` fails the build if one slips in.
 *
 * To add chains: append to this array and push. No DB, no migration.
 */
const raw: Omit<Chain, "id">[] = [
  // ---------------- EASY ----------------
  { difficulty: "easy", direction: "forward", title: "Workshop", words: ["WATER", "FALL", "BACK", "FIRE", "WORK", "BENCH"] },
  { difficulty: "easy", direction: "forward", title: "Detour", words: ["RAIL", "ROAD", "BLOCK", "HEAD", "LIGHT", "HOUSE"] },
  { difficulty: "easy", direction: "forward", title: "Prime Time", words: ["FOOT", "BALL", "GAME", "SHOW", "CASE", "LOAD"] },
  { difficulty: "easy", direction: "forward", title: "Downtown", words: ["BOOK", "MARK", "DOWN", "TOWN", "HOUSE", "WORK"] },
  { difficulty: "easy", direction: "forward", title: "Desk Job", words: ["NEWS", "PAPER", "CLIP", "BOARD", "WALK", "OVER"] },
  { difficulty: "easy", direction: "forward", title: "Full Power", words: ["HORSE", "POWER", "HOUSE", "BOAT", "YARD", "STICK"] },
  { difficulty: "easy", direction: "forward", title: "Old Country", words: ["SAND", "STONE", "WALL", "PAPER", "WORK", "BENCH"] },
  { difficulty: "easy", direction: "forward", title: "First Meal", words: ["HEART", "BREAK", "FAST", "FOOD", "COURT", "YARD"] },
  { difficulty: "easy", direction: "forward", title: "On Duty", words: ["LIFE", "GUARD", "RAIL", "ROAD", "SIDE", "WALK"] },
  { difficulty: "easy", direction: "forward", title: "Overtime", words: ["MOON", "LIGHT", "HOUSE", "HOLD", "OVER", "TIME"] },
  { difficulty: "easy", direction: "forward", title: "Cold Snap", words: ["SNOW", "BALL", "PARK", "BENCH", "MARK", "DOWN"] },
  { difficulty: "easy", direction: "forward", title: "Full Service", words: ["BASE", "BALL", "ROOM", "SERVICE", "STATION", "WAGON"] },
  { difficulty: "easy", direction: "forward", title: "Showdown", words: ["GOLD", "FISH", "BOWL", "GAME", "SHOW", "DOWN"] },
  { difficulty: "easy", direction: "forward", title: "Food Chain", words: ["HOME", "TOWN", "HOUSE", "PLANT", "FOOD", "CHAIN"] },
  { difficulty: "easy", direction: "forward", title: "Recess", words: ["PLAY", "GROUND", "WORK", "HORSE", "SHOE", "LACE"] },
  { difficulty: "easy", direction: "forward", title: "Wormhole", words: ["CROSS", "WORD", "PLAY", "BOOK", "WORM", "HOLE"] },
  { difficulty: "easy", direction: "forward", title: "Groundwork", words: ["HAND", "SHAKE", "DOWN", "PLAY", "GROUND", "WORK"] },
  { difficulty: "easy", direction: "forward", title: "Millstone", words: ["WIND", "MILL", "STONE", "WALL", "PAPER", "BACK"] },
  { difficulty: "easy", direction: "forward", title: "Cutlery Drawer", words: ["SILVER", "WARE", "HOUSE", "PLANT", "FOOD", "COURT"] },
  { difficulty: "easy", direction: "forward", title: "Bolt From the Blue", words: ["THUNDER", "BOLT", "ACTION", "FIGURE", "HEAD", "LINE"] },
  { difficulty: "easy", direction: "forward", title: "Overcoat", words: ["POST", "CARD", "BOARD", "WALK", "OVER", "COAT"] },
  { difficulty: "easy", direction: "forward", title: "Loose Ends", words: ["TIME", "TABLE", "SPOON", "FEED", "BACK", "LASH"] },

  // ---------------- MEDIUM ----------------
  { difficulty: "medium", direction: "forward", title: "Cape and Cowl", words: ["SUPER", "GIRL", "SCOUT", "MASTER", "PIECE", "WORK", "HORSE"] },
  { difficulty: "medium", direction: "forward", title: "Deep Weather", words: ["BRAIN", "STORM", "WATER", "FALL", "BACK", "FIRE", "PLACE"] },
  { difficulty: "medium", direction: "forward", title: "Two-Minute Drill", words: ["HEAD", "QUARTER", "BACK", "STAGE", "HAND", "BOOK", "SHELF"] },
  { difficulty: "medium", direction: "forward", title: "Launch Pad", words: ["SPACE", "SHIP", "YARD", "STICK", "SHIFT", "WORK", "FORCE"] },
  { difficulty: "medium", direction: "forward", title: "Scapegoat", words: ["LAND", "SCAPE", "GOAT", "CHEESE", "CAKE", "WALK", "OVER"] },
  { difficulty: "medium", direction: "forward", title: "Wash Day", words: ["WHITE", "WASH", "BOARD", "ROOM", "SERVICE", "STATION", "WAGON"] },
  { difficulty: "medium", direction: "forward", title: "Downpour", words: ["SWEET", "HEART", "LAND", "MARK", "DOWN", "POUR", "OVER"] },
  { difficulty: "medium", direction: "forward", title: "Open Road", words: ["SNOW", "MOBILE", "HOME", "TOWN", "HOUSE", "BOAT", "YARD"] },
  { difficulty: "medium", direction: "forward", title: "Homeroom", words: ["CLASS", "ROOM", "SERVICE", "ROAD", "BLOCK", "HEAD", "LINE"] },
  { difficulty: "medium", direction: "forward", title: "Keepsake", words: ["SCOUT", "MASTER", "PIECE", "WORK", "SHOP", "KEEPER", "SAKE"] },
  { difficulty: "medium", direction: "forward", title: "Undergrowth", words: ["EARTH", "WORM", "WOOD", "LAND", "SLIDE", "SHOW", "ROOM"] },
  { difficulty: "medium", direction: "forward", title: "Driftwood", words: ["SNOW", "DRIFT", "WOOD", "WORK", "BENCH", "MARK", "DOWN"] },
  { difficulty: "medium", direction: "forward", title: "Wax and Wick", words: ["CANDLE", "STICK", "SHIFT", "WORK", "HORSE", "SHOE", "LACE"] },
  { difficulty: "medium", direction: "forward", title: "Power Play", words: ["POWER", "PLAY", "BOOK", "WORM", "HOLE", "PUNCH", "LINE"] },
  { difficulty: "medium", direction: "forward", title: "Lifetime", words: ["LIFE", "TIME", "PIECE", "WORK", "BENCH", "MARK", "DOWN"] },
  { difficulty: "medium", direction: "forward", title: "Background", words: ["BACK", "GROUND", "WORK", "HORSE", "POWER", "HOUSE", "BOAT"] },
  { difficulty: "medium", direction: "forward", title: "Punchline", words: ["DOWN", "PLAY", "BOOK", "WORM", "HOLE", "PUNCH", "LINE"] },
  { difficulty: "medium", direction: "forward", title: "Workload", words: ["FOOT", "BALL", "GAME", "SHOW", "CASE", "WORK", "LOAD"] },
  { difficulty: "medium", direction: "both-ends", title: "Both Ends: Tailgate", words: ["RAIN", "COAT", "TAIL", "GATE", "KEEPER", "SAKE"] },
  { difficulty: "medium", direction: "both-ends", title: "Both Ends: Showroom", words: ["LAND", "SLIDE", "SHOW", "ROOM", "MATE", "SHIP", "YARD"] },

  // ---------------- HARD ----------------
  { difficulty: "hard", direction: "forward", title: "Stick Shift", words: ["HEART", "BREAK", "FAST", "FOOD", "COURT", "YARD", "STICK", "SHIFT"] },
  { difficulty: "hard", direction: "forward", title: "Paper Route", words: ["NEWS", "PAPER", "WORK", "BENCH", "MARK", "DOWN", "TOWN", "HOUSE"] },
  { difficulty: "hard", direction: "forward", title: "Tablespoon", words: ["MOON", "LIGHT", "HOUSE", "HOLD", "OVER", "TIME", "TABLE", "SPOON"] },
  { difficulty: "hard", direction: "forward", title: "Phone Book", words: ["LIFE", "GUARD", "RAIL", "ROAD", "BLOCK", "HEAD", "PHONE", "BOOK"] },
  { difficulty: "hard", direction: "forward", title: "Courtyard", words: ["SILVER", "WARE", "HOUSE", "PLANT", "FOOD", "COURT", "YARD", "STICK"] },
  { difficulty: "hard", direction: "forward", title: "Cakewalk", words: ["GRAND", "FATHER", "LAND", "SCAPE", "GOAT", "CHEESE", "CAKE", "WALK"] },
  { difficulty: "hard", direction: "forward", title: "Backstage", words: ["THUNDER", "BOLT", "ACTION", "FIGURE", "HEAD", "QUARTER", "BACK", "STAGE"] },
  { difficulty: "hard", direction: "forward", title: "Coattail", words: ["WHITE", "WASH", "BOARD", "WALK", "OVER", "COAT", "TAIL", "GATE"] },
  { difficulty: "hard", direction: "forward", title: "Wordplay", words: ["CROSS", "WORD", "PLAY", "GROUND", "WORK", "SHOP", "KEEPER", "SAKE"] },
  { difficulty: "hard", direction: "forward", title: "Cloudburst", words: ["SNOW", "MOBILE", "HOME", "WORK", "BENCH", "MARK", "DOWN", "POUR"] },
  { difficulty: "hard", direction: "forward", title: "Shelf Life", words: ["HAND", "BOOK", "SHELF", "LIFE", "GUARD", "RAIL", "ROAD", "BLOCK"] },
  { difficulty: "hard", direction: "forward", title: "Service Road", words: ["POST", "CARD", "BOARD", "ROOM", "SERVICE", "ROAD", "BLOCK", "HEAD"] },
  { difficulty: "hard", direction: "forward", title: "Casework", words: ["STAR", "FISH", "BOWL", "GAME", "SHOW", "CASE", "WORK", "LOAD"] },
  { difficulty: "hard", direction: "forward", title: "Station Wagon", words: ["WOOD", "LAND", "SLIDE", "SHOW", "ROOM", "SERVICE", "STATION", "WAGON"] },
  { difficulty: "hard", direction: "both-ends", title: "Both Ends: Keepsake", words: ["HORSE", "POWER", "PLAY", "GROUND", "WORK", "SHOP", "KEEPER", "SAKE"] },
];

function slug(words: string[], i: number) {
  return `${words[0].toLowerCase()}-${words[words.length - 1].toLowerCase()}-${i}`;
}

export const CHAINS: Chain[] = raw.map((c, i) => ({ ...c, id: slug(c.words, i) }));

export function chainsByDifficulty(d?: Difficulty): Chain[] {
  return d ? CHAINS.filter((c) => c.difficulty === d) : CHAINS;
}

export function getChain(id: string): Chain | undefined {
  return CHAINS.find((c) => c.id === id);
}
