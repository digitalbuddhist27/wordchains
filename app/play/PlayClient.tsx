"use client";

import { useCallback, useEffect, useState } from "react";
import { generateChain, type Chain, type Difficulty } from "@/lib/chains";
import { makePlayers } from "@/lib/game";
import { GameBoard } from "@/components/GameBoard";

export function PlayClient({
  difficulty,
  names,
}: {
  difficulty: Difficulty;
  names: string[];
}) {
  const [chain, setChain] = useState<Chain | null>(null);
  const [round, setRound] = useState(0);

  // Walked on the client so every "New chain" is a fresh generation with no
  // round trip, and the server render stays cacheable.
  const deal = useCallback(() => {
    setChain(generateChain(difficulty));
    setRound((r) => r + 1);
  }, [difficulty]);

  useEffect(() => {
    deal();
  }, [deal]);

  if (!chain) {
    return (
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-10 text-center text-sm text-black/40 dark:text-white/40">
        Building a chain...
      </main>
    );
  }

  return (
    <main className="flex-1">
      <p className="mx-auto mt-4 w-full max-w-xl px-4 text-center text-[11px] font-semibold uppercase tracking-widest text-black/35 dark:text-white/35">
        {chain.difficulty} · {chain.words.length} words
        {chain.direction === "both-ends" ? " · solve inward" : ""}
      </p>
      <GameBoard
        key={`${chain.id}-${round}`}
        chain={chain}
        mode={names.length > 1 ? "pass_and_play" : "solo"}
        players={makePlayers(names)}
        onReplay={deal}
      />
    </main>
  );
}
