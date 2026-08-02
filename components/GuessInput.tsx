"use client";

import { useEffect, useRef } from "react";
import { CornerDownLeft } from "lucide-react";

/**
 * Lives inside the active word tile, so the player types where the word will
 * appear instead of hunting for a separate field at the bottom of the board.
 *
 * Rendered as one slot per letter, matching the unsolved tiles exactly, with a
 * transparent input on top capturing the typing. A centred text input drifted
 * the letters away from their blanks, which read as the hint landing on the
 * wrong slot.
 *
 * The revealed letters are a locked prefix: you only type what is still
 * missing, and backspace cannot eat the hint.
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
  const caret = Math.min(value.length, maxLength - 1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    const end = el.value.length;
    el.setSelectionRange(end, end);
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focusKey]);

  function keepPrefix(next: string) {
    const upper = next.toUpperCase().replace(/[^A-Z]/g, "");
    return upper.startsWith(locked) ? upper : locked + upper.replace(locked, "");
  }

  /** Typing always lands at the end, so the caret never sits inside the hint. */
  function toEnd() {
    const el = ref.current;
    if (!el) return;
    const end = el.value.length;
    el.setSelectionRange(end, end);
  }

  return (
    <div className="flex w-full items-center gap-2">
      <div className="relative min-w-0 flex-1">
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
            if (e.key === "Backspace" && value.length <= locked.length) e.preventDefault();
          }}
          onSelect={toEnd}
          onClick={toEnd}
          maxLength={maxLength}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck={false}
          enterKeyHint="go"
          aria-label={`Guess the word, ${maxLength} letters, starting with ${locked}`}
          className="absolute inset-0 z-10 h-full w-full cursor-text bg-transparent text-transparent caret-transparent outline-none"
        />
        <span className="flex items-end justify-center gap-1.5" aria-hidden="true">
          {Array.from({ length: maxLength }).map((_, i) => {
            const char = value[i] ?? null;
            const isLocked = i < locked.length;
            const isCaret = i === caret && value.length < maxLength;
            return (
              <span key={i} className="flex w-5 flex-col items-center sm:w-6">
                <span
                  className={`text-xl font-bold leading-none sm:text-2xl ${
                    char ? (isLocked ? "text-brand" : "") : "text-transparent"
                  }`}
                >
                  {char ?? "\u00A0"}
                </span>
                <span
                  className={`mt-1 h-0.5 w-full rounded ${
                    isLocked
                      ? "bg-brand/70"
                      : isCaret
                        ? "animate-pulse bg-brand"
                        : "bg-black/25 dark:bg-white/30"
                  }`}
                />
              </span>
            );
          })}
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
