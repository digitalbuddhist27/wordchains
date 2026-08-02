import { createServer } from "node:http";
import next from "next";
import { Server as SocketServer } from "socket.io";
import type { Difficulty } from "./lib/chains";
import {
  createRoom,
  joinRoom,
  leaveRoom,
  markOffline,
  nextChain,
  playGuess,
  playPass,
  publicView,
  setDifficulty,
  startGame,
  sweepRooms,
  SWEEP_EVERY_MS,
  getRoom,
} from "./lib/rooms";

const port = parseInt(process.env.PORT || "3140", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const VALID: Difficulty[] = ["easy", "medium", "hard"];
const asDifficulty = (d: unknown): Difficulty =>
  (VALID as string[]).includes(String(d)) ? (d as Difficulty) : "easy";

type Ack = (res: { ok: boolean; error?: string; code?: string }) => void;
const ok = (fn: unknown, payload: { ok: boolean; error?: string; code?: string }) => {
  if (typeof fn === "function") (fn as Ack)(payload);
};

app.prepare().then(() => {
  const server = createServer((req, res) => handle(req, res));
  const io = new SocketServer(server, { path: "/api/socket" });

  // Each member gets their own view: their board in full, everyone else as
  // standings only, so no player's progress leaks answers to the room.
  const broadcast = (code: string) => {
    const room = getRoom(code);
    if (!room) return;
    for (const m of room.members) {
      if (m.socketId) io.to(m.socketId).emit("room", publicView(room, m.playerId));
    }
  };

  io.on("connection", (socket) => {
    let joinedCode: string | null = null;

    socket.on("room:create", ({ playerId, name, difficulty }, ack) => {
      if (!playerId) return ok(ack, { ok: false, error: "Missing player id." });
      const room = createRoom(playerId, String(name || "Host").slice(0, 14), asDifficulty(difficulty), socket.id);
      joinedCode = room.code;
      socket.join(room.code);
      ok(ack, { ok: true, code: room.code });
      broadcast(room.code);
    });

    socket.on("room:join", ({ code, playerId, name }, ack) => {
      if (!playerId || !code) return ok(ack, { ok: false, error: "Missing code or player id." });
      const res = joinRoom(String(code).toUpperCase(), playerId, String(name || ""), socket.id);
      if (!res.ok) return ok(ack, { ok: false, error: res.error });
      joinedCode = res.room.code;
      socket.join(res.room.code);
      ok(ack, { ok: true, code: res.room.code });
      broadcast(res.room.code);
    });

    socket.on("room:difficulty", ({ code, playerId, difficulty }) => {
      setDifficulty(String(code), playerId, asDifficulty(difficulty));
      broadcast(String(code));
    });

    socket.on("room:start", ({ code, playerId }, ack) => {
      const res = startGame(String(code), playerId);
      ok(ack, res.ok ? { ok: true } : { ok: false, error: res.error });
      broadcast(String(code));
    });

    socket.on("room:next", ({ code, playerId }, ack) => {
      const res = nextChain(String(code), playerId);
      ok(ack, res.ok ? { ok: true } : { ok: false, error: res.error });
      broadcast(String(code));
    });

    socket.on("game:guess", ({ code, playerId, guess }, ack) => {
      const res = playGuess(String(code), playerId, String(guess || ""));
      ok(ack, res.ok ? { ok: true } : { ok: false, error: res.error });
      broadcast(String(code));
    });

    socket.on("game:pass", ({ code, playerId }, ack) => {
      const res = playPass(String(code), playerId);
      ok(ack, res.ok ? { ok: true } : { ok: false, error: res.error });
      broadcast(String(code));
    });

    socket.on("room:leave", ({ code, playerId }) => {
      leaveRoom(String(code), playerId);
      socket.leave(String(code));
      joinedCode = null;
      broadcast(String(code));
    });

    socket.on("disconnect", () => {
      for (const room of markOffline(socket.id)) broadcast(room.code);
      joinedCode = null;
    });
  });

  setInterval(sweepRooms, SWEEP_EVERY_MS).unref();

  server.listen(port, () => {
    console.log(`Word Chains listening on :${port} (${dev ? "dev" : "production"})`);
  });
});
