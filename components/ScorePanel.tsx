"use client";

import type { Player } from "@/lib/game";

export function ScorePanel({
  players,
  currentPlayer,
  streak,
  solo,
}: {
  players: Player[];
  currentPlayer: number;
  streak: number;
  solo: boolean;
}) {
  if (solo) {
    const p = players[0];
    return (
      <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-black/45 dark:text-white/45">
            Score
          </p>
          <p className="text-2xl font-bold text-chain">{p.score}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-black/45 dark:text-white/45">
            Streak
          </p>
          <p className="text-2xl font-bold">{streak}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {players.map((p, i) => {
        const active = i === currentPlayer;
        return (
          <div
            key={p.id}
            className={`rounded-2xl border px-3 py-2.5 transition ${
              active
                ? "border-transparent bg-white shadow-[0_10px_30px_-16px_rgba(15,23,42,0.5)] dark:bg-white/10"
                : "border-black/10 bg-white/60 dark:border-white/10 dark:bg-white/[0.03]"
            }`}
            style={active ? { boxShadow: `inset 0 0 0 2px ${p.color}` } : undefined}
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: p.color }}
                aria-hidden="true"
              />
              <span className="truncate text-sm font-semibold">{p.name}</span>
            </div>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className="text-xl font-bold">{p.score}</span>
              {active && streak > 1 && (
                <span className="text-[11px] font-semibold text-chain">{streak} in a row</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
