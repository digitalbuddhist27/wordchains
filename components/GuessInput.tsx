"use client";

import { useEffect, useRef } from "react";
import { CornerDownLeft } from "lucide-react";

/**
 * Lives inside the active word tile, so the player types where the word will
 * appear instead of hunting for a separate field at the bottom of the board.
 * Empty state shows the revealed letters plus a blank per remaining letter.
 */
export function GuessInput({
  value,
  onChange,
  onSubmit,
  word,
  revealed,
  focusKey,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  word: string;
  revealed: number;
  /** Changing this re-focuses the field (new word, or turn handoff). */
  focusKey: string;
}) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focusKey]);

  const hint = word.slice(0, revealed) + " _".repeat(Math.max(word.length - revealed, 0));

  return (
    <div className="flex w-full items-center gap-2">
      <label htmlFor="guess" className="sr-only">
        Guess word {word.length} letters, starting with {word.slice(0, revealed)}
      </label>
      <input
        id="guess"
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSubmit();
          }
        }}
        maxLength={word.length}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="characters"
        spellCheck={false}
        enterKeyHint="go"
        placeholder={hint}
        className="min-w-0 flex-1 bg-transparent text-center text-xl font-bold uppercase tracking-[0.14em] outline-none placeholder:text-black/25 dark:placeholder:text-white/25 sm:text-2xl"
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={!value.trim()}
        aria-label="Submit guess"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand text-white transition hover:bg-brand-dark disabled:opacity-25"
      >
        <CornerDownLeft size={16} />
      </button>
    </div>
  );
}
