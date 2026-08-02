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

export type Member = {
  playerId: string;
  name: string;
  color: string;
  socketId: string | null;
  online: boolean;
};

export type Room = {
  code: string;
  hostId: string;
  difficulty: Difficulty;
  members: Member[];
  state: GameState | null;
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

function pickChain(difficulty: Difficulty): Chain {
  const chain = generateChain(difficulty);
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
  socketId: string
): Room {
  const code = randomCode();
  const room: Room = {
    code,
    hostId: playerId,
    difficulty,
    members: [{ playerId, name, color: PLAYER_COLORS[0], socketId, online: true }],
    state: null,
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

  if (room.state) return { ok: false, error: "That game has already started." };
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

  if (room.state) {
    // Mid-game: keep their score on the board, just mark them gone.
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
    // Nobody left in a lobby that never started: drop it.
    if (!room.state && room.members.every((x) => !x.online)) {
      rooms.delete(room.code);
      continue;
    }
    affected.push(room);
  }
  return affected;
}

export function setDifficulty(code: string, playerId: string, difficulty: Difficulty) {
  const room = getRoom(code);
  if (!room || room.hostId !== playerId || room.state) return room;
  room.difficulty = difficulty;
  touch(room);
  return room;
}

export function startGame(code: string, playerId: string): JoinResult {
  const room = getRoom(code);
  if (!room) return { ok: false, error: "No game with that code." };
  if (room.hostId !== playerId) return { ok: false, error: "Only the host can start." };
  if (room.members.length < 2) return { ok: false, error: "Need at least 2 players." };

  const players: Player[] = room.members.map((m) => ({
    id: m.playerId,
    name: m.name,
    color: m.color,
    score: 0,
  }));
  room.state = initGame(pickChain(room.difficulty), "pass_and_play", players);
  touch(room);
  return { ok: true, room };
}

/** Deal a fresh chain to the same table. */
export function nextChain(code: string, playerId: string): JoinResult {
  const room = getRoom(code);
  if (!room) return { ok: false, error: "No game with that code." };
  if (room.hostId !== playerId) return { ok: false, error: "Only the host can deal again." };

  const players: Player[] = room.members.map((m) => ({
    id: m.playerId,
    name: m.name,
    color: m.color,
    score: 0,
  }));
  room.state = initGame(pickChain(room.difficulty), "pass_and_play", players);
  touch(room);
  return { ok: true, room };
}

function isTheirTurn(room: Room, playerId: string) {
  const s = room.state;
  return !!s && s.status === "active" && s.players[s.currentPlayer]?.id === playerId;
}

export function playGuess(code: string, playerId: string, text: string): JoinResult {
  const room = getRoom(code);
  if (!room || !room.state) return { ok: false, error: "That game is not running." };
  if (!isTheirTurn(room, playerId)) return { ok: false, error: "Not your turn." };
  room.state = submitGuess(room.state, text);
  touch(room);
  return { ok: true, room };
}

export function playPass(code: string, playerId: string): JoinResult {
  const room = getRoom(code);
  if (!room || !room.state) return { ok: false, error: "That game is not running." };
  if (!isTheirTurn(room, playerId)) return { ok: false, error: "Not your turn." };
  room.state = miss(room.state);
  touch(room);
  return { ok: true, room };
}

/**
 * What every client in the room receives. Unsolved words are stripped to their
 * revealed prefix and length, so the answers never reach a player's browser.
 */
export function publicView(room: Room) {
  const s = room.state;
  return {
    code: room.code,
    hostId: room.hostId,
    difficulty: room.difficulty,
    members: room.members.map((m) => ({
      playerId: m.playerId,
      name: m.name,
      color: m.color,
      online: m.online,
    })),
    game: s
      ? {
          direction: s.chain.direction,
          length: s.chain.words.length,
          words: s.chain.words.map((w, i) =>
            s.solved[i] ? w : w.slice(0, s.revealed[i])
          ),
          lengths: s.chain.words.map((w) => w.length),
          revealed: s.revealed,
          solved: s.solved,
          players: s.players,
          currentPlayer: s.currentPlayer,
          currentIndex: s.currentIndex,
          currentPlayerId: s.players[s.currentPlayer]?.id ?? null,
          turnStreak: s.turnStreak,
          status: s.status,
          lastEvent: s.lastEvent,
          summary: s.status === "complete" ? summarize(s) : null,
        }
      : null,
  };
}

export type RoomView = ReturnType<typeof publicView>;
