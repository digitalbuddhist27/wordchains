"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import type { Difficulty } from "@/lib/chains";

const DIFFICULTIES: { key: Difficulty; label: string; hint: string }[] = [
  { key: "easy", label: "Easy", hint: "6 words, everyday links" },
  { key: "medium", label: "Medium", hint: "7 words, a little sideways" },
  { key: "hard", label: "Hard", hint: "8 words, no mercy" },
];

export function SetupPanel({ chainCount }: { chainCount: number }) {
  const router = useRouter();
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [names, setNames] = useState<string[]>(["Player 1"]);

  const solo = names.length === 1;

  function setCount(n: number) {
    const next = Math.min(Math.max(n, 1), 6);
    setNames((prev) =>
      Array.from({ length: next }, (_, i) => prev[i] ?? `Player ${i + 1}`)
    );
  }

  function start() {
    const params = new URLSearchParams({
      difficulty,
      players: names.map((n, i) => n.trim() || `Player ${i + 1}`).join("|"),
    });
    router.push(`/play?${params.toString()}`);
  }

  return (
    <section className="mt-4 rounded-3xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/5">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-black/45 dark:text-white/45">
        New game
      </h2>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {DIFFICULTIES.map((d) => (
          <button
            key={d.key}
            type="button"
            onClick={() => setDifficulty(d.key)}
            aria-pressed={difficulty === d.key}
            className={`rounded-2xl border-2 px-3 py-2.5 text-left transition ${
              difficulty === d.key
                ? "border-brand bg-brand/5"
                : "border-black/10 hover:border-brand/40 dark:border-white/10"
            }`}
          >
            <span className="block text-sm font-semibold">{d.label}</span>
            <span className="mt-0.5 block text-[11px] leading-tight text-black/45 dark:text-white/45">
              {d.hint}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Players</p>
          <p className="text-[11px] text-black/45 dark:text-white/45">
            {solo ? "Solo practice" : "Pass and play on one device"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCount(names.length - 1)}
            disabled={names.length <= 1}
            aria-label="Remove a player"
            className="grid h-9 w-9 place-items-center rounded-xl border border-black/15 transition disabled:opacity-30 dark:border-white/20"
          >
            <Minus size={16} />
          </button>
          <span className="w-6 text-center text-lg font-bold">{names.length}</span>
          <button
            type="button"
            onClick={() => setCount(names.length + 1)}
            disabled={names.length >= 6}
            aria-label="Add a player"
            className="grid h-9 w-9 place-items-center rounded-xl border border-black/15 transition disabled:opacity-30 dark:border-white/20"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {!solo && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {names.map((n, i) => (
            <div key={i}>
              <label htmlFor={`player-${i}`} className="sr-only">
                Player {i + 1} name
              </label>
              <input
                id={`player-${i}`}
                value={n}
                onChange={(e) =>
                  setNames((prev) => prev.map((v, vi) => (vi === i ? e.target.value : v)))
                }
                maxLength={14}
                className="w-full rounded-xl border border-black/10 bg-mist px-3 py-2 text-sm outline-none transition focus:border-brand dark:border-white/10 dark:bg-white/5"
              />
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={start}
        className="mt-5 w-full rounded-xl bg-brand py-3.5 font-semibold text-white transition hover:bg-brand-dark"
      >
        Start chain
      </button>
      <p className="mt-2 text-center text-[11px] text-black/40 dark:text-white/40">
        Pulled at random from {chainCount} curated chains.
      </p>
    </section>
  );
}
