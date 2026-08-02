"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogIn, Plus } from "lucide-react";
import type { Difficulty } from "@/lib/chains";
import { playerId, savedName, saveName } from "@/lib/identity";
import { useSocket } from "@/lib/useSocket";

const ROUNDS = [1, 5, 10] as const;

const DIFFICULTIES: { key: Difficulty; label: string }[] = [
  { key: "easy", label: "Easy" },
  { key: "medium", label: "Medium" },
  { key: "hard", label: "Hard" },
];

export function OnlineLobbyEntry({ initialCode = "" }: { initialCode?: string }) {
  const router = useRouter();
  const { socket, connected } = useSocket();
  const [name, setName] = useState("");
  const [code, setCode] = useState(initialCode);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [rounds, setRounds] = useState<number>(5);
  const [busy, setBusy] = useState<"create" | "join" | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(savedName());
  }, []);

  function create() {
    if (!socket || busy) return;
    const trimmed = name.trim();
    if (!trimmed) return setError("Enter your name first.");
    setError("");
    setBusy("create");
    saveName(trimmed);
    socket.emit(
      "room:create",
      { playerId: playerId(), name: trimmed, difficulty, rounds },
      (res: { ok: boolean; code?: string; error?: string }) => {
        setBusy(null);
        if (res.ok && res.code) router.push(`/room/${res.code}`);
        else setError(res.error ?? "Could not create the game.");
      }
    );
  }

  function join() {
    if (!socket || busy) return;
    const trimmed = name.trim();
    if (!trimmed) return setError("Enter your name first.");
    if (code.trim().length !== 4) return setError("Room codes are 4 characters.");
    setError("");
    setBusy("join");
    saveName(trimmed);
    socket.emit(
      "room:join",
      { code: code.trim().toUpperCase(), playerId: playerId(), name: trimmed },
      (res: { ok: boolean; code?: string; error?: string }) => {
        setBusy(null);
        if (res.ok && res.code) router.push(`/room/${res.code}`);
        else setError(res.error ?? "Could not join that game.");
      }
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Play online</h1>
      <p className="mt-1 text-sm text-black/60 dark:text-white/60">
        Everyone plays from their own phone. Share the room code and take turns down the chain.
      </p>

      <div className="mt-5">
        <label htmlFor="name" className="text-sm font-semibold">
          Your name
        </label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={14}
          placeholder="Blake"
          className="mt-1.5 w-full rounded-xl border-2 border-black/10 bg-white px-4 py-3 outline-none transition focus:border-brand dark:border-white/15 dark:bg-white/5"
        />
      </div>

      <section className="mt-6 rounded-3xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-black/45 dark:text-white/45">
          Start a new game
        </h2>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.key}
              type="button"
              onClick={() => setDifficulty(d.key)}
              aria-pressed={difficulty === d.key}
              className={`rounded-xl border-2 px-3 py-2 text-sm font-semibold transition ${
                difficulty === d.key
                  ? "border-brand bg-brand/5"
                  : "border-black/10 hover:border-brand/40 dark:border-white/10"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
        <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-black/45 dark:text-white/45">
          Rounds
        </p>
        <div className="mt-1.5 grid grid-cols-3 gap-2">
          {ROUNDS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRounds(r)}
              aria-pressed={rounds === r}
              className={`rounded-xl border-2 px-3 py-2 text-sm font-semibold transition ${
                rounds === r
                  ? "border-brand bg-brand/5"
                  : "border-black/10 hover:border-brand/40 dark:border-white/10"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={create}
          disabled={!connected || busy !== null}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-40"
        >
          {busy === "create" ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
          Create game
        </button>
      </section>

      <section className="mt-4 rounded-3xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-black/45 dark:text-white/45">
          Join with a code
        </h2>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4))}
          placeholder="ABCD"
          inputMode="text"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          aria-label="Room code"
          className="mt-3 w-full rounded-xl border-2 border-black/10 bg-white px-4 py-3 text-center text-2xl font-bold uppercase tracking-[0.5em] outline-none transition focus:border-brand dark:border-white/15 dark:bg-white/5"
        />
        <button
          type="button"
          onClick={join}
          disabled={!connected || busy !== null}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-brand py-3.5 font-semibold text-brand transition hover:bg-brand/5 disabled:opacity-40"
        >
          {busy === "join" ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
          Join game
        </button>
      </section>

      {error && (
        <p className="wc-rise mt-4 rounded-xl bg-red-500/10 px-3 py-2 text-center text-sm font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {!connected && (
        <p className="mt-4 text-center text-xs text-black/40 dark:text-white/40">
          Connecting...
        </p>
      )}
    </div>
  );
}
