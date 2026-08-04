"use client";

import type { WordGrade } from "@/lib/game";

/**
 * The same grid the player shares, drawn on screen so the colours are
 * learnable rather than arbitrary. One tile per word, coloured by how much of
 * the word had to be shown as a fraction of its length, so a 4-letter word and
 * a 9-letter word are judged on the same scale.
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
      <div className="flex flex-wrap gap-1.5">
        {grades.map((g, i) => (
          <span
            key={i}
            className={`h-6 w-6 rounded ${TONE[g.grade].bg}`}
            title={`${g.word}: ${TONE[g.grade].label}`}
            aria-label={`${g.word}, ${TONE[g.grade].label}`}
          />
        ))}
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
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
