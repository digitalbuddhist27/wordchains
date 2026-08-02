"use client";

import { useEffect, useRef } from "react";
import { CornerDownLeft } from "lucide-react";

/**
 * Lives inside the active word tile, so the player types where the word will
 * appear instead of hunting for a separate field at the bottom of the board.
 *
 * The revealed letters stay in the field as a locked prefix: you only type the
 * letters that are still missing, and backspacing cannot eat the hint.
 */
export function GuessInput({
  value,
  onChange,
  onSubmit,
  word,
  revealed,
  focusKey,
  lockedPrefix,
  maxLengthOverride,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  word: string;
  revealed: number;
  /** Changing this re-focuses the field (new word, or another letter revealed). */
  focusKey: string;
  /** Letters already exposed. Always kept at the front of the value. */
  lockedPrefix?: string;
  maxLengthOverride?: number;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const locked = (lockedPrefix ?? word.slice(0, revealed)).toUpperCase();
  const maxLength = maxLengthOverride ?? word.length;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    // Put the caret after the locked letters, never inside them.
    const end = el.value.length;
    el.setSelectionRange(end, end);
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focusKey]);

  function keepPrefix(next: string) {
    const upper = next.toUpperCase().replace(/[^A-Z]/g, "");
    return upper.startsWith(locked) ? upper : locked + upper.replace(locked, "");
  }

  function guardCaret() {
    const el = ref.current;
    if (!el) return;
    if ((el.selectionStart ?? 0) < locked.length) {
      el.setSelectionRange(locked.length, Math.max(el.selectionEnd ?? 0, locked.length));
    }
  }

  const typed = value.length;

  return (
    <div className="flex w-full items-center gap-2">
      <label htmlFor="guess" className="sr-only">
        Guess the word, {maxLength} letters, starting with {locked}
      </label>
      <div className="min-w-0 flex-1">
        <input
          id="guess"
          ref={ref}
          value={value}
          onChange={(e) => onChange(keepPrefix(e.target.value).slice(0, maxLength))}
          onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSubmit();
            return;
          }
          // Block deleting into the revealed letters.
          const el = e.currentTarget;
          const start = el.selectionStart ?? 0;
          const end = el.selectionEnd ?? 0;
          if (e.key === "Backspace" && start <= locked.length && start === end) e.preventDefault();
          if (e.key === "Delete" && start < locked.length) e.preventDefault();
          }}
          onSelect={guardCaret}
          onClick={guardCaret}
          maxLength={maxLength}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck={false}
          enterKeyHint="go"
          className="w-full bg-transparent text-center text-xl font-bold uppercase tracking-[0.14em] outline-none sm:text-2xl"
        />
        {/* One dash per letter, so the word length stays visible while typing. */}
        <span className="mt-1 flex justify-center gap-1.5" aria-hidden="true">
          {Array.from({ length: maxLength }).map((_, i) => (
            <span
              key={i}
              className={`h-0.5 w-5 rounded sm:w-6 ${
                i < locked.length
                  ? "bg-brand/70"
                  : i < typed
                    ? "bg-black/60 dark:bg-white/70"
                    : "bg-black/25 dark:bg-white/30"
              }`}
            />
          ))}
        </span>
      </div>
      <button
        type="button"
        onClick={onSubmit}
        disabled={value.length <= locked.length}
        aria-label="Submit guess"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand text-white transition hover:bg-brand-dark disabled:opacity-25"
      >
        <CornerDownLeft size={16} />
      </button>
    </div>
  );
}
