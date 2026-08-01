export type Difficulty = "easy" | "medium" | "hard";
export type Direction = "forward" | "both-ends";

export type Chain = {
  id: string;
  title?: string;
  difficulty: Difficulty;
  words: string[];
  direction: Direction;
};

/**
 * Curated chain library. Every consecutive pair forms a compound word or a
 * common two-word phrase (SUN + FLOWER = sunflower, FLOWER + POT = flowerpot).
 *
 * To add chains: append to this array and push. No redeploy dance, no DB
 * migration; Railway rebuilds on push and /api/chains serves the new set.
 */
const raw: Omit<Chain, "id">[] = [
  // ---------------- EASY ----------------
  { difficulty: "easy", direction: "forward", title: "Garden Party", words: ["SUN", "FLOWER", "POT", "HOLE", "PUNCH", "LINE"] },
  { difficulty: "easy", direction: "forward", title: "Workshop", words: ["FIRE", "WORK", "BENCH", "MARK", "DOWN", "TOWN"] },
  { difficulty: "easy", direction: "forward", title: "After the Storm", words: ["RAIN", "BOW", "TIE", "BREAKER", "DOWN", "LOAD"] },
  { difficulty: "easy", direction: "forward", title: "Sunday League", words: ["BASE", "BALL", "PARK", "WAY", "SIDE", "WALK"] },
  { difficulty: "easy", direction: "forward", title: "Cold Snap", words: ["SNOW", "MAN", "HOLE", "PUNCH", "BOWL", "GAME"] },
  { difficulty: "easy", direction: "forward", title: "Many Happy Returns", words: ["BIRTH", "DAY", "DREAM", "TEAM", "MATE"] },
  { difficulty: "easy", direction: "forward", title: "Lucky Break", words: ["HORSE", "SHOE", "LACE", "UP", "GRADE", "SCHOOL"] },
  { difficulty: "easy", direction: "forward", title: "Light as Air", words: ["BUTTER", "FLY", "PAPER", "BACK", "PACK", "AGE"] },
  { difficulty: "easy", direction: "forward", title: "Night Watch", words: ["MOON", "LIGHT", "HOUSE", "HOLD", "UP", "RIGHT"] },
  { difficulty: "easy", direction: "forward", title: "On the Boards", words: ["KEY", "BOARD", "WALK", "WAY", "POINT", "GUARD"] },
  { difficulty: "easy", direction: "forward", title: "Prime Time", words: ["FOOT", "BALL", "GAME", "SHOW", "CASE", "LOAD"] },
  { difficulty: "easy", direction: "forward", title: "After Dark", words: ["NIGHT", "FALL", "OUT", "SIDE", "KICK", "BOX"] },
  { difficulty: "easy", direction: "forward", title: "Marching Band", words: ["HAND", "BAG", "PIPE", "LINE", "BACK", "BONE"] },
  { difficulty: "easy", direction: "forward", title: "Small Sparks", words: ["TOOTH", "BRUSH", "FIRE", "FLY", "WHEEL", "CHAIR"] },
  { difficulty: "easy", direction: "forward", title: "Living Room", words: ["COFFEE", "TABLE", "TOP", "SPIN", "OFF", "SPRING"] },
  { difficulty: "easy", direction: "forward", title: "Detour", words: ["RAIL", "ROAD", "BLOCK", "HEAD", "LIGHT", "BULB"] },
  { difficulty: "easy", direction: "forward", title: "Low Tide", words: ["SEA", "SHELL", "FISH", "HOOK", "UP", "LIFT"] },
  { difficulty: "easy", direction: "forward", title: "Summer Off", words: ["CAR", "POOL", "SIDE", "BURN", "OUT", "BREAK"] },
  { difficulty: "easy", direction: "forward", title: "Recess", words: ["PLAY", "GROUND", "WORK", "SHOP", "LIFT", "OFF"] },
  { difficulty: "easy", direction: "forward", title: "Backyard", words: ["BLACK", "BIRD", "HOUSE", "WORK", "OUT", "SIDE"] },
  { difficulty: "easy", direction: "forward", title: "Daily Grind", words: ["HOME", "WORK", "OUT", "LAW", "SUIT", "CASE"] },
  { difficulty: "easy", direction: "forward", title: "Chalk Dust", words: ["CLASS", "ROOM", "MATE", "SHIP", "YARD", "STICK"] },

  // ---------------- MEDIUM ----------------
  { difficulty: "medium", direction: "forward", title: "First Meal", words: ["HEART", "BREAK", "FAST", "FOOD", "COURT", "YARD", "STICK"] },
  { difficulty: "medium", direction: "forward", title: "Cape and Cowl", words: ["SUPER", "GIRL", "SCOUT", "MASTER", "PIECE", "WORK", "HORSE"] },
  { difficulty: "medium", direction: "forward", title: "Print Shop", words: ["FIRE", "FLY", "PAPER", "WORK", "SHOP", "KEEPER", "SAKE"] },
  { difficulty: "medium", direction: "forward", title: "Overtime", words: ["GREEN", "LIGHT", "HOUSE", "HOLD", "OVER", "TIME", "LINE"] },
  { difficulty: "medium", direction: "forward", title: "Sit Down", words: ["WATER", "FALL", "BACK", "FIRE", "ARM", "CHAIR", "MAN"] },
  { difficulty: "medium", direction: "forward", title: "Homeroom", words: ["HIGH", "SCHOOL", "BUS", "BOY", "FRIEND", "SHIP", "YARD"] },
  { difficulty: "medium", direction: "forward", title: "Press Row", words: ["STAR", "FISH", "NET", "WORK", "BENCH", "PRESS", "BOX"] },
  { difficulty: "medium", direction: "forward", title: "Cutlery Drawer", words: ["SILVER", "WARE", "HOUSE", "FLY", "PAPER", "BACK", "PACK"] },
  { difficulty: "medium", direction: "forward", title: "Desk Job", words: ["SAND", "PAPER", "CLIP", "BOARD", "GAME", "NIGHT", "CAP"] },
  { difficulty: "medium", direction: "forward", title: "Bolt From the Blue", words: ["THUNDER", "BOLT", "ACTION", "FIGURE", "HEAD", "LINE", "UP"] },
  { difficulty: "medium", direction: "forward", title: "On Duty", words: ["LIFE", "GUARD", "RAIL", "ROAD", "SIDE", "SHOW", "DOWN"] },
  { difficulty: "medium", direction: "forward", title: "Paper Route", words: ["NEWS", "PAPER", "BOY", "SCOUT", "MASTER", "MIND", "SET"] },
  { difficulty: "medium", direction: "forward", title: "Wax and Wick", words: ["CANDLE", "STICK", "SHIFT", "KEY", "HOLE", "PUNCH", "LINE"] },
  { difficulty: "medium", direction: "forward", title: "Sweet Talk", words: ["SUGAR", "COAT", "TAIL", "GATE", "WAY", "SIDE", "KICK"] },
  { difficulty: "medium", direction: "forward", title: "Food Chain", words: ["DOG", "HOUSE", "PLANT", "FOOD", "CHAIN", "SAW", "DUST"] },
  { difficulty: "medium", direction: "forward", title: "High Roller", words: ["POST", "CARD", "SHARK", "TANK", "TOP", "HAT", "TRICK"] },
  { difficulty: "medium", direction: "forward", title: "Shelf Life", words: ["BOOK", "SHELF", "LIFE", "BOAT", "HOUSE", "FLY", "WHEEL"] },
  { difficulty: "medium", direction: "forward", title: "Uphill", words: ["RED", "HEAD", "PHONE", "BOOK", "MARK", "UP", "HILL"] },
  { difficulty: "medium", direction: "forward", title: "Old Country", words: ["WIND", "MILL", "STONE", "WALL", "PAPER", "CLIP", "ART"] },
  { difficulty: "medium", direction: "forward", title: "Wash Day", words: ["CROSS", "WORD", "PLAY", "GROUND", "HOG", "WASH", "CLOTH"] },
  { difficulty: "medium", direction: "forward", title: "Loose Ends", words: ["TIME", "TABLE", "SPOON", "FEED", "BACK", "LASH", "OUT"] },
  { difficulty: "medium", direction: "forward", title: "Departures", words: ["AIR", "PORT", "HOLE", "PUNCH", "BOWL", "GAME", "PLAN"] },
  { difficulty: "medium", direction: "forward", title: "Head Cold", words: ["STOP", "WATCH", "DOG", "HOUSE", "HOLD", "UP", "RIGHT"] },
  { difficulty: "medium", direction: "both-ends", title: "Both Ends: Sidewalk", words: ["SIDE", "WALK", "OVER", "COAT", "TAIL", "GATE", "CRASH"] },
  { difficulty: "medium", direction: "both-ends", title: "Both Ends: Breaking News", words: ["BACK", "GROUND", "BREAKING", "NEWS", "CAST", "AWAY", "SIDE"] },

  // ---------------- HARD ----------------
  { difficulty: "hard", direction: "forward", title: "Full Power", words: ["HORSE", "POWER", "HOUSE", "BOAT", "YARD", "ARM", "CHAIR", "LIFT"] },
  { difficulty: "hard", direction: "forward", title: "Cloudburst", words: ["FIRE", "BALL", "PARK", "BENCH", "MARK", "DOWN", "POUR", "OVER"] },
  { difficulty: "hard", direction: "forward", title: "Launch Pad", words: ["SPACE", "SHIP", "YARD", "STICK", "SHIFT", "KEY", "STONE", "WALL"] },
  { difficulty: "hard", direction: "forward", title: "Point Blank", words: ["MOON", "WALK", "WAY", "POINT", "BLANK", "CHECK", "BOOK", "CASE"] },
  { difficulty: "hard", direction: "forward", title: "Standstill", words: ["GOLD", "FISH", "TANK", "TOP", "SIDE", "KICK", "STAND", "STILL"] },
  { difficulty: "hard", direction: "forward", title: "Deep Field", words: ["BRAIN", "STORM", "WATER", "FALL", "OUT", "FIELD", "WORK", "BENCH"] },
  { difficulty: "hard", direction: "forward", title: "Rat Race", words: ["SUN", "BURN", "OUT", "BACK", "PACK", "RAT", "RACE", "TRACK"] },
  { difficulty: "hard", direction: "forward", title: "Open Road", words: ["SNOW", "MOBILE", "HOME", "RUN", "WAY", "SIDE", "BURN", "OUT"] },
  { difficulty: "hard", direction: "forward", title: "Two-Minute Drill", words: ["HEAD", "QUARTER", "BACK", "STAGE", "HAND", "BOOK", "SHELF", "LIFE"] },
  { difficulty: "hard", direction: "forward", title: "Track Record", words: ["LAND", "FILL", "IN", "SIDE", "TRACK", "RECORD", "BREAKER"] },
  { difficulty: "hard", direction: "forward", title: "Full Service", words: ["WHITE", "WASH", "BOARD", "ROOM", "SERVICE", "STATION", "WAGON"] },
  { difficulty: "hard", direction: "forward", title: "Sharp Edge", words: ["FIRE", "CRACKER", "JACK", "KNIFE", "EDGE", "WISE", "CRACK", "DOWN"] },
  { difficulty: "hard", direction: "forward", title: "Town Hall", words: ["WIND", "BREAKER", "DOWN", "TOWN", "HALL", "WAY", "POINT"] },
  { difficulty: "hard", direction: "forward", title: "Wormhole", words: ["HAND", "SHAKE", "DOWN", "PLAY", "BOOK", "WORM", "HOLE", "SAW"] },
  { difficulty: "hard", direction: "both-ends", title: "Both Ends: Scapegoat", words: ["LAND", "SCAPE", "GOAT", "CHEESE", "CAKE", "WALK", "OVER"] },
  { difficulty: "hard", direction: "both-ends", title: "Both Ends: Powerhouse", words: ["POWER", "PLAY", "MAKER", "SHIFT", "WORK", "FORCE", "FIELD"] },
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
