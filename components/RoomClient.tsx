"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check, Copy, Eye, Loader2, Play, RotateCw, Share2, Trophy } from "lucide-react";
import type { Difficulty } from "@/lib/chains";
import type { RoomView } from "@/lib/rooms";
import { playerId, savedName } from "@/lib/identity";
import { useSocket } from "@/lib/useSocket";
import { GuessInput } from "./GuessInput";

const SITE_URL = "https://playwordchains.com";
const DIFFICULTIES: { key: Difficulty; label: string }[] = [
  { key: "easy", label: "Easy" },
  { key: "medium", label: "Medium" },
  { key: "hard", label: "Hard" },
];

export function RoomClient({ code }: { code: string }) {
  const router = useRouter();
  const { socket, connected } = useSocket();
  const [room, setRoom] = useState<RoomView | null>(null);
  const [error, setError] = useState("");
  const [guess, setGuess] = useState("");
  const [shaking, setShaking] = useState(false);
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const me = useRef("");

  useEffect(() => {
    me.current = playerId();
  }, []);

  // Join (or rejoin) whenever the socket connects, so a refresh or a dropped
  // connection puts the player back in the same seat.
  useEffect(() => {
    if (!socket || !connected) return;
    socket.emit(
      "room:join",
      { code, playerId: playerId(), name: savedName() },
      (res: { ok: boolean; error?: string }) => {
        if (!res.ok) setError(res.error ?? "Could not join that game.");
      }
    );
  }, [socket, connected, code]);

  useEffect(() => {
    if (!socket) return;
    const onRoom = (view: RoomView) => {
      if (view.code === code) setRoom(view);
    };
    socket.on("room", onRoom);
    return () => {
      socket.off("room", onRoom);
    };
  }, [socket, code]);

  const game = room?.game ?? null;
  const myTurn = !!game && game.currentPlayerId === me.current && game.status === "active";
  const isHost = room?.hostId === me.current;
  const done = game?.status === "complete";

  useEffect(() => {
    if (game?.lastEvent?.type === "miss") {
      setShaking(true);
      const t = setTimeout(() => setShaking(false), 420);
      return () => clearTimeout(t);
    }
  }, [game?.lastEvent]);

  const submit = useCallback(() => {
    if (!socket || !myTurn || !guess.trim()) return;
    socket.emit("game:guess", { code, playerId: playerId(), guess });
    setGuess("");
  }, [socket, myTurn, guess, code]);

  const pass = useCallback(() => {
    if (!socket || !myTurn) return;
    socket.emit("game:pass", { code, playerId: playerId() });
    setGuess("");
  }, [socket, myTurn, code]);

  async function copy(what: "code" | "link") {
    const text = what === "code" ? code : `${SITE_URL}/online?code=${code}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(null), 1800);
    } catch {}
  }

  async function invite() {
    const text = `Join my Word Chains game. Room code ${code}.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Word Chains", text, url: `${SITE_URL}/online?code=${code}` });
      } else {
        await copy("link");
      }
    } catch {}
  }

  const banner = useMemo(() => {
    const e = game?.lastEvent;
    if (!e || !game) return null;
    const who = (i: number) => game.players[i]?.name ?? "Someone";
    if (e.type === "correct")
      return { tone: "good" as const, text: `${who(e.player)} got ${e.word} for ${e.points}` };
    if (e.type === "auto") return { tone: "warn" as const, text: `${e.word} revealed. No points.` };
    if (e.type === "miss")
      return { tone: "bad" as const, text: `${who(e.player)} missed. Letter ${e.revealed} revealed.` };
    return null;
  }, [game]);

  if (error) {
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-12 text-center">
        <p className="rounded-xl bg-red-500/10 px-3 py-3 text-sm font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
        <button
          type="button"
          onClick={() => router.push("/online")}
          className="mt-4 rounded-xl bg-brand px-5 py-3 font-semibold text-white transition hover:bg-brand-dark"
        >
          Back to Play online
        </button>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="mx-auto flex w-full max-w-xl items-center justify-center gap-2 px-4 py-16 text-sm text-black/40 dark:text-white/40">
        <Loader2 size={16} className="animate-spin" />
        Joining room {code}...
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-16 pt-4">
      {/* Room code header, always visible so anyone can read it out */}
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-ink px-4 py-3 text-white dark:bg-white/10">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
            Room code
          </p>
          <p className="text-2xl font-bold tracking-[0.3em]">{room.code}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => copy("code")}
            aria-label="Copy room code"
            className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 transition hover:bg-white/20"
          >
            {copied === "code" ? <Check size={16} className="text-chain" /> : <Copy size={16} />}
          </button>
          <button
            type="button"
            onClick={invite}
            className="flex items-center gap-1.5 rounded-xl bg-brand px-3 text-sm font-semibold transition hover:bg-brand-dark"
          >
            <Share2 size={15} />
            Invite
          </button>
        </div>
      </div>

      {!connected && (
        <p className="mt-3 rounded-xl bg-gold/20 px-3 py-2 text-center text-xs font-medium text-[#8a6d00] dark:text-gold">
          Reconnecting...
        </p>
      )}

      {/* Player rail */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {(game?.players ?? room.members.map((m) => ({ id: m.playerId, name: m.name, color: m.color, score: 0 }))).map(
          (p) => {
            const member = room.members.find((m) => m.playerId === p.id);
            const isTurn = game?.currentPlayerId === p.id && game?.status === "active";
            return (
              <div
                key={p.id}
                className={`rounded-2xl border px-3 py-2.5 transition ${
                  isTurn
                    ? "border-transparent bg-white shadow-[0_10px_30px_-16px_rgba(15,23,42,0.5)] dark:bg-white/10"
                    : "border-black/10 bg-white/60 dark:border-white/10 dark:bg-white/[0.03]"
                }`}
                style={isTurn ? { boxShadow: `inset 0 0 0 2px ${p.color}` } : undefined}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: p.color, opacity: member?.online === false ? 0.3 : 1 }}
                    aria-hidden="true"
                  />
                  <span className="truncate text-sm font-semibold">
                    {p.name}
                    {p.id === me.current && (
                      <span className="ml-1 text-[11px] font-medium text-black/40 dark:text-white/40">
                        you
                      </span>
                    )}
                  </span>
                </div>
                {/* No score before the game starts: a bold 0 next to the host
                    badge just reads as "0 host". */}
                <div className="mt-0.5 flex items-baseline gap-2">
                  {game && <span className="text-xl font-bold">{p.score}</span>}
                  {member?.online === false && (
                    <span className="text-[11px] text-black/35 dark:text-white/35">away</span>
                  )}
                  {room.hostId === p.id && (
                    <span className="text-[11px] font-semibold text-brand">host</span>
                  )}
                  {!game && room.hostId !== p.id && (
                    <span className="text-[11px] text-black/35 dark:text-white/35">ready</span>
                  )}
                </div>
              </div>
            );
          }
        )}
      </div>

      {/* ---------------- LOBBY ---------------- */}
      {!game && (
        <div className="mt-6 rounded-3xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/5">
          <h2 className="text-lg font-bold">Waiting for players</h2>
          <p className="mt-1 text-sm text-black/60 dark:text-white/60">
            {room.members.length < 2
              ? "Send the code to someone. You need at least 2 players."
              : `${room.members.length} in the room.`}
          </p>

          {isHost ? (
            <>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() =>
                      socket?.emit("room:difficulty", {
                        code,
                        playerId: playerId(),
                        difficulty: d.key,
                      })
                    }
                    aria-pressed={room.difficulty === d.key}
                    className={`rounded-xl border-2 px-3 py-2 text-sm font-semibold transition ${
                      room.difficulty === d.key
                        ? "border-brand bg-brand/5"
                        : "border-black/10 hover:border-brand/40 dark:border-white/10"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  socket?.emit(
                    "room:start",
                    { code, playerId: playerId() },
                    (res: { ok: boolean; error?: string }) => {
                      if (!res.ok) setError("");
                    }
                  )
                }
                disabled={room.members.length < 2}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-40"
              >
                <Play size={18} />
                Start game
              </button>
            </>
          ) : (
            <p className="mt-4 rounded-xl bg-mist px-3 py-2.5 text-center text-sm text-black/60 dark:bg-white/5 dark:text-white/60">
              Waiting for the host to start. Difficulty: {room.difficulty}.
            </p>
          )}
        </div>
      )}

      {/* ---------------- BOARD ---------------- */}
      {game && (
        <>
          <p className="mt-4 text-center text-sm text-black/60 dark:text-white/60">
            {done ? (
              "Chain complete"
            ) : myTurn ? (
              <span className="font-semibold text-brand">Your turn</span>
            ) : (
              <>
                Waiting on{" "}
                <span
                  className="font-semibold"
                  style={{ color: game.players[game.currentPlayer]?.color }}
                >
                  {game.players[game.currentPlayer]?.name}
                </span>
              </>
            )}
          </p>

          <div className="mt-4 flex flex-col gap-2">
            {game.words.map((shown, i) => {
              const isActive = i === game.currentIndex && !done;
              const given =
                i === 0 || (game.direction === "both-ends" && i === game.length - 1);
              const solved = game.solved[i];
              const blanks = game.lengths[i] - game.revealed[i];

              return (
                <div key={i} className="flex flex-col items-center gap-2">
                  {i > 0 && (
                    <ArrowRight
                      size={16}
                      className={`rotate-90 ${
                        isActive ? "text-brand" : "text-black/20 dark:text-white/20"
                      }`}
                      aria-hidden="true"
                    />
                  )}
                  <div
                    className={`relative flex min-h-16 w-full items-center justify-center rounded-2xl border-2 px-4 py-3 transition-colors ${
                      solved
                        ? given
                          ? "border-brand/40 bg-brand/5 dark:bg-brand/10"
                          : "border-chain/60 bg-chain/10"
                        : isActive
                          ? "border-brand bg-white shadow-[0_8px_28px_-12px_rgba(108,92,231,0.55)] dark:bg-white/5"
                          : "border-dashed border-black/15 bg-white/60 dark:border-white/15 dark:bg-white/[0.03]"
                    } ${shaking && isActive ? "wc-shake" : ""}`}
                  >
                    {isActive && myTurn ? (
                      <GuessInput
                        value={guess}
                        onChange={setGuess}
                        onSubmit={submit}
                        word={"?".repeat(game.lengths[i])}
                        revealed={0}
                        placeholderOverride={
                          shown + " _".repeat(Math.max(blanks, 0))
                        }
                        maxLengthOverride={game.lengths[i]}
                        focusKey={`${i}-${game.revealed[i]}`}
                      />
                    ) : solved ? (
                      <span className="text-xl font-bold tracking-[0.14em] sm:text-2xl">{shown}</span>
                    ) : (
                      <span className="flex items-end gap-1.5" aria-hidden="true">
                        {Array.from({ length: game.lengths[i] }).map((_, li) => (
                          <span key={li} className="flex w-5 flex-col items-center sm:w-6">
                            <span
                              className={`text-xl font-bold leading-none sm:text-2xl ${
                                li < game.revealed[i] ? "" : "text-transparent"
                              }`}
                            >
                              {li < game.revealed[i] ? shown[li] : " "}
                            </span>
                            <span className="mt-1 h-0.5 w-full rounded bg-black/25 dark:bg-white/30" />
                          </span>
                        ))}
                      </span>
                    )}

                    {solved && !given && (
                      <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-chain text-white shadow">
                        <Check size={14} strokeWidth={3} />
                      </span>
                    )}
                    {given && (
                      <span className="absolute -top-2.5 left-3 rounded bg-brand px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                        Given
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {banner && !done && (
            <p
              className={`wc-rise mt-4 rounded-xl px-3 py-2 text-center text-sm font-medium ${
                banner.tone === "good"
                  ? "bg-chain/15 text-chain"
                  : banner.tone === "warn"
                    ? "bg-gold/20 text-[#8a6d00] dark:text-gold"
                    : "bg-red-500/10 text-red-600 dark:text-red-400"
              }`}
              role="status"
              aria-live="polite"
            >
              {banner.text}
            </p>
          )}

          {!done && myTurn && (
            <button
              type="button"
              onClick={pass}
              className="mx-auto mt-5 flex items-center gap-1.5 rounded-xl border border-black/15 px-4 py-2.5 text-xs font-semibold text-black/60 transition hover:border-brand/50 hover:text-brand dark:border-white/20 dark:text-white/60"
            >
              <Eye size={14} />
              Stuck? Reveal a letter and pass
            </button>
          )}

          {done && game.summary && (
            <div className="wc-rise mt-6 rounded-3xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-2">
                <Trophy size={18} className="text-gold" />
                <h2 className="text-lg font-bold">Chain complete</h2>
              </div>
              <p className="mt-1 text-sm text-black/60 dark:text-white/60">
                {game.summary.winners.length > 1
                  ? `Tie: ${game.summary.winners.map((p) => p.name).join(" and ")}`
                  : `${game.summary.winners[0].name} wins`}
              </p>

              <ul className="mt-4 space-y-1.5">
                {game.summary.ranked.map((p) => (
                  <li key={p.id} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: p.color }}
                        aria-hidden="true"
                      />
                      {p.name}
                    </span>
                    <span className="font-bold">{p.score}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-wrap gap-2">
                {isHost && (
                  <button
                    type="button"
                    onClick={() => socket?.emit("room:next", { code, playerId: playerId() })}
                    className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
                  >
                    <RotateCw size={16} />
                    Next chain
                  </button>
                )}
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-xl border border-black/15 px-4 py-2.5 text-sm font-semibold transition hover:border-brand/50 dark:border-white/20"
                >
                  Leave
                </Link>
              </div>
              {!isHost && (
                <p className="mt-3 text-xs text-black/45 dark:text-white/45">
                  The host can deal another chain.
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
