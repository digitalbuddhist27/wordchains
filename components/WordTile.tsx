"use client";

import { Check } from "lucide-react";
import { letterSlots } from "@/lib/game";

type Props = {
  word: string;
  revealed: number;
  solved: boolean;
  active: boolean;
  given: boolean;
  shaking: boolean;
  justSolved: boolean;
  position: number;
};

export function WordTile({
  word,
  revealed,
  solved,
  active,
  given,
  shaking,
  justSolved,
  position,
}: Props) {
  const slots = letterSlots(word, revealed, solved);

  const label = solved
    ? `Word ${position}: ${word}, solved`
    : `Word ${position}: ${word.length} letters, ${revealed} revealed, starts with ${word.slice(0, revealed)}`;

  const base =
    "relative flex min-h-16 w-full items-center justify-center gap-1 rounded-2xl border-2 px-4 py-3 transition-colors";

  const tone = solved
    ? given
      ? "border-brand/40 bg-brand/5 dark:bg-brand/10"
      : "border-chain/60 bg-chain/10"
    : active
      ? "border-brand bg-white shadow-[0_8px_28px_-12px_rgba(108,92,231,0.55)] dark:bg-white/5"
      : "border-dashed border-black/15 bg-white/60 dark:border-white/15 dark:bg-white/[0.03]";

  return (
    <div
      className={`${base} ${tone} ${shaking ? "wc-shake" : ""} ${justSolved ? "wc-flip" : ""}`}
      aria-label={label}
      aria-current={active ? "step" : undefined}
    >
      {solved ? (
        <span className="text-xl font-bold tracking-[0.14em] sm:text-2xl">{word}</span>
      ) : (
        <span className="flex items-end gap-1.5" aria-hidden="true">
          {slots.map((s) => (
            <span key={s.key} className="flex w-5 flex-col items-center sm:w-6">
              <span
                className={`text-xl font-bold leading-none sm:text-2xl ${
                  s.char ? "" : "text-transparent"
                } ${s.char && s.key === revealed - 1 && revealed > 1 ? "wc-pop text-brand" : ""}`}
              >
                {s.char ?? " "}
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
  );
}
