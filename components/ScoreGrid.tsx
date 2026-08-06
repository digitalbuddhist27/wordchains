"use client";

import type { WordGrade } from "@/lib/game";

/**
 * The same result the player shares, drawn on screen so the colours are
 * learnable rather than arbitrary. One bar per word stacked top to bottom, the
 * way the board reads, with each bar as long as its word and coloured by how
 * much of it had to be shown as a fraction of its length. That normalisation is
 * what lets a 4-letter word and a 6-letter word be judged on the same scale.
 */
const TONE: Record<WordGrade, { bg: string; label: string }> = {
  given: { bg: "bg-black/15 dark:bg-white/20", label: "given" },
  clean: { bg: "bg-chain", label: "no hints" },
  light: { bg: "bg-sky", label: "a peek" },
  medium: { bg: "bg-gold", label: "half shown" },
  heavy: { bg: "bg-orange-500", label: "most shown" },
  failed: { bg: "bg-red-500", label: "never got it" },
};

const LEGEND: WordGrade[] = ["clean", "light", "medium", "heavy", "failed"];

export function ScoreGrid({ grades }: { grades: { word: string; grade: WordGrade }[] }) {
  return (
    <div>
      <div className="flex flex-col gap-1">
        {grades.map((g, i) => (
          <span key={i} className="flex gap-1" aria-label={`${g.word}: ${TONE[g.grade].label}`}>
            {Array.from({ length: g.word.length }).map((_, j) => (
              <span key={j} className={`h-4 w-4 rounded-sm ${TONE[g.grade].bg}`} />
            ))}
          </span>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        {LEGEND.map((g) => (
          <span
            key={g}
            className="flex items-center gap-1.5 text-[11px] text-black/50 dark:text-white/50"
          >
            <span className={`h-2.5 w-2.5 rounded-sm ${TONE[g].bg}`} aria-hidden="true" />
            {TONE[g].label}
          </span>
        ))}
      </div>
    </div>
  );
}
