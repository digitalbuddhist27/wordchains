import { generateChain, type Chain, type Difficulty } from "./chains";
import {
  initGame,
  miss,
  submitGuess,
  summarize,
  PLAYER_COLORS,
  type GameState,
  type Player,
} from "./game";

/** No O/0/I/1 — codes get read aloud and typed from a text message. */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 4;
const MAX_PLAYERS = 8;
const ROOM_TTL_MS = 6 * 60 * 60 * 1000;
/** Sweep runs often enough that a backgrounded phone always finds its room. */
export const SWEEP_EVERY_MS = 30 * 60 * 1000;

export type Member = {
  playerId: string;
  name: string;
  color: string;
  socketId: string | null;
  online: boolean;
};

/**
 * A round deals ONE chain to the whole room, but every player gets their own
 * board and races through it independently. Nobody waits for a turn, and
 * "fewest errors / most points" only compares fairly on identical words.
 */
export type Round = {
  chain: Chain;
  boards: Map<string, GameState>;
};

export const ROUND_OPTIONS = [1, 5, 10] as const;
export type RoundCount = (typeof ROUND_OPTIONS)[number];

export type Totals = { score: number; errors: number };

export type Room = {
  code: string;
  hostId: string;
  difficulty: Difficulty;
  totalRounds: RoundCount;
  roundNumber: number;
  members: Member[];
  round: Round | null;
  /** Running match totals, so a finished round's score is never lost. */
  totals: Map<string, Totals>;
  /** Every word spent this match. Nothing repeats across rounds. */
  usedWords: Set<string>;
  matchOver: boolean;
  createdAt: number;
  touchedAt: number;
};

/**
 * In-memory room store. Word Chains runs as a single Railway instance, so one
 * process owns every room; if this ever scales horizontally this is the piece
 * that moves to Redis.
 */
const rooms = new Map<string, Room>();

function randomCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return rooms.has(code) ? randomCode() : code;
}

function pickChain(difficulty: Difficulty, exclude: ReadonlySet<string>): Chain {
  const chain = generateChain(difficulty, { exclude });
  if (!chain) throw new Error(`could not generate a ${difficulty} chain`);
  return chain;
}

function touch(room: Room) {
  room.touchedAt = Date.now();
}

export function sweepRooms() {
  const cutoff = Date.now() - ROOM_TTL_MS;
  for (const [code, room] of rooms) {
    if (room.touchedAt < cutoff) rooms.delete(code);
  }
}

export function getRoom(code: string): Room | undefined {
  return rooms.get(code.toUpperCase());
}

export function createRoom(
  playerId: string,
  name: string,
  difficulty: Difficulty,
  socketId: string,
  totalRounds: RoundCount = 5
): Room {
  const code = randomCode();
  const room: Room = {
    code,
    hostId: playerId,
    difficulty,
    totalRounds,
    roundNumber: 0,
    members: [{ playerId, name, color: PLAYER_COLORS[0], socketId, online: true }],
    round: null,
    totals: new Map(),
    usedWords: new Set(),
    matchOver: false,
    createdAt: Date.now(),
    touchedAt: Date.now(),
  };
  rooms.set(code, room);
  return room;
}

export type JoinResult = { ok: true; room: Room } | { ok: false; error: string };

export function joinRoom(
  code: string,
  playerId: string,
  name: string,
  socketId: string
): JoinResult {
  const room = getRoom(code);
  if (!room) return { ok: false, error: "No game with that code." };

  const existing = room.members.find((m) => m.playerId === playerId);
  if (existing) {
    // Rejoin: same player coming back from a refresh or a dropped connection.
    existing.socketId = socketId;
    existing.online = true;
    if (name.trim()) existing.name = name.trim().slice(0, 14);
    touch(room);
    return { ok: true, room };
  }

  if (room.round) return { ok: false, error: "That game has already started." };
  if (room.members.length >= MAX_PLAYERS) return { ok: false, error: "That game is full." };

  room.members.push({
    playerId,
    name: name.trim().slice(0, 14) || `Player ${room.members.length + 1}`,
    color: PLAYER_COLORS[room.members.length % PLAYER_COLORS.length],
    socketId,
    online: true,
  });
  touch(room);
  return { ok: true, room };
}

export function leaveRoom(code: string, playerId: string): Room | undefined {
  const room = getRoom(code);
  if (!room) return;

  if (room.round) {
    // Mid-round: keep their board and score, just mark them gone.
    const m = room.members.find((x) => x.playerId === playerId);
    if (m) {
      m.online = false;
      m.socketId = null;
    }
  } else {
    room.members = room.members.filter((m) => m.playerId !== playerId);
    if (room.members.length === 0) {
      rooms.delete(room.code);
      return undefined;
    }
    if (room.hostId === playerId) room.hostId = room.members[0].playerId;
  }
  touch(room);
  return room;
}

export function markOffline(socketId: string): Room[] {
  const affected: Room[] = [];
  for (const room of rooms.values()) {
    const m = room.members.find((x) => x.socketId === socketId);
    if (!m) continue;
    m.online = false;
    m.socketId = null;
    touch(room);
    // Do NOT delete an empty lobby here. Backgrounding Safari drops the
    // socket, and a host who was alone in the room would come back to
    // "no game with that code". Rooms only go away on the TTL sweep.
    affected.push(room);
  }
  return affected;
}

export function setDifficulty(code: string, playerId: string, difficulty: Difficulty) {
  const room = getRoom(code);
  if (!room || room.hostId !== playerId || room.round) return room;
  room.difficulty = difficulty;
  touch(room);
  return room;
}

export function startGame(code: string, playerId: string): JoinResult {
  const room = getRoom(code);
  if (!room) return { ok: false, error: "No game with that code." };
  if (room.hostId !== playerId) return { ok: false, error: "Only the host can start." };
  if (room.members.length < 2) return { ok: false, error: "Need at least 2 players." };

  room.roundNumber = 0;
  room.totals = new Map();
  room.usedWords = new Set();
  room.matchOver = false;
  deal(room);
  touch(room);
  return { ok: true, room };
}

/** One chain, one independent board per player. */
function deal(room: Room) {
  const chain = pickChain(room.difficulty, room.usedWords);
  for (const w of chain.words) room.usedWords.add(w);

  const boards = new Map<string, GameState>();
  for (const m of room.members) {
    const player: Player = { id: m.playerId, name: m.name, color: m.color, score: 0 };
    boards.set(m.playerId, initGame(chain, "solo", [player]));
    if (!room.totals.has(m.playerId)) room.totals.set(m.playerId, { score: 0, errors: 0 });
  }
  room.round = { chain, boards };
  room.roundNumber += 1;
}

/** Fold the round that just ended into the match totals. */
function bankRound(room: Room) {
  if (!room.round) return;
  for (const [id, board] of room.round.boards) {
    const t = room.totals.get(id) ?? { score: 0, errors: 0 };
    room.totals.set(id, {
      score: t.score + (board.players[0]?.score ?? 0),
      errors: t.errors + board.errors,
    });
  }
}

/** Bank the finished round and deal the next one, or end the match. */
export function nextChain(code: string, playerId: string): JoinResult {
  const room = getRoom(code);
  if (!room) return { ok: false, error: "No game with that code." };
  if (room.hostId !== playerId) return { ok: false, error: "Only the host can deal again." };
  if (room.matchOver) return { ok: false, error: "That match is finished." };

  bankRound(room);
  if (room.roundNumber >= room.totalRounds) {
    room.matchOver = true;
    room.round = null;
    touch(room);
    return { ok: true, room };
  }
  deal(room);
  touch(room);
  return { ok: true, room };
}

/** Start a whole new match at the same table. */
export function newMatch(code: string, playerId: string): JoinResult {
  const room = getRoom(code);
  if (!room) return { ok: false, error: "No game with that code." };
  if (room.hostId !== playerId) return { ok: false, error: "Only the host can start a match." };
  room.roundNumber = 0;
  room.totals = new Map();
  room.usedWords = new Set();
  room.matchOver = false;
  deal(room);
  touch(room);
  return { ok: true, room };
}

export function setRounds(code: string, playerId: string, totalRounds: RoundCount) {
  const room = getRoom(code);
  if (!room || room.hostId !== playerId || room.round) return room;
  room.totalRounds = totalRounds;
  touch(room);
  return room;
}

function boardFor(room: Room, playerId: string) {
  return room.round?.boards.get(playerId) ?? null;
}

export function playGuess(code: string, playerId: string, text: string): JoinResult {
  const room = getRoom(code);
  const board = room ? boardFor(room, playerId) : null;
  if (!room || !room.round || !board) return { ok: false, error: "That game is not running." };
  room.round.boards.set(playerId, submitGuess(board, text));
  touch(room);
  return { ok: true, room };
}

export function playPass(code: string, playerId: string): JoinResult {
  const room = getRoom(code);
  const board = room ? boardFor(room, playerId) : null;
  if (!room || !room.round || !board) return { ok: false, error: "That game is not running." };
  room.round.boards.set(playerId, miss(board));
  touch(room);
  return { ok: true, room };
}

/**
 * Built per player. A player sees their OWN board in full and only aggregate
 * progress for everyone else, so one player's solved words never leak the
 * answers to the rest of the room. Unsolved words on your own board are still
 * stripped to their revealed prefix.
 */
export function publicView(room: Room, forPlayerId: string) {
  const round = room.round;
  const mine = round?.boards.get(forPlayerId) ?? null;

  const standings = round
    ? room.members
        .map((m) => {
          const b = round.boards.get(m.playerId);
          const solvedCount = b ? b.solved.filter(Boolean).length : 0;
          return {
            playerId: m.playerId,
            name: m.name,
            color: m.color,
            online: m.online,
            score: b?.players[0]?.score ?? 0,
            errors: b?.errors ?? 0,
            solvedCount,
            total: round.chain.words.length,
            done: b?.status === "complete",
          };
        })
        .sort((a, b) => b.score - a.score || a.errors - b.errors)
    : [];

  // Match totals include the round in progress, so the top scoreboard is live.
  const matchTotals = room.members.map((m) => {
    const banked = room.totals.get(m.playerId) ?? { score: 0, errors: 0 };
    const live = round?.boards.get(m.playerId);
    return {
      playerId: m.playerId,
      name: m.name,
      color: m.color,
      online: m.online,
      score: banked.score + (live?.players[0]?.score ?? 0),
      errors: banked.errors + (live?.errors ?? 0),
    };
  });
  matchTotals.sort((a, b) => b.score - a.score || a.errors - b.errors);

  return {
    code: room.code,
    hostId: room.hostId,
    difficulty: room.difficulty,
    totalRounds: room.totalRounds,
    roundNumber: room.roundNumber,
    matchOver: room.matchOver,
    matchTotals,
    members: room.members.map((m) => ({
      playerId: m.playerId,
      name: m.name,
      color: m.color,
      online: m.online,
    })),
    round: round
      ? {
          direction: round.chain.direction,
          length: round.chain.words.length,
          lengths: round.chain.words.map((w) => w.length),
          standings,
          everyoneDone: standings.filter((s) => s.online).every((s) => s.done),
          me: mine
            ? {
                words: mine.chain.words.map((w, i) =>
                  mine.solved[i] ? w : w.slice(0, mine.revealed[i])
                ),
                revealed: mine.revealed,
                solved: mine.solved,
                currentIndex: mine.currentIndex,
                score: mine.players[0]?.score ?? 0,
                errors: mine.errors,
                streak: mine.turnStreak,
                status: mine.status,
                lastEvent: mine.lastEvent,
                summary: mine.status === "complete" ? summarize(mine) : null,
              }
            : null,
        }
      : null,
  };
}

export type RoomView = ReturnType<typeof publicView>;
