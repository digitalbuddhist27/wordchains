"use client";

import { useEffect, useState } from "react";
import { Lightbulb, Link2, Search, X } from "lucide-react";

const SEEN = "wc-seen-rules";

const STEPS = [
  {
    icon: Link2,
    color: "#22C55E",
    title: "Each word is the second half of a phrase from the last.",
    body: "WATER then FALL (waterfall), then BACK (fallback), and on down the chain.",
  },
  {
    icon: Lightbulb,
    color: "#6C5CE7",
    title: "Keep the chain going as long as you can.",
    body: "Guess right and you keep your turn, straight into the next word.",
  },
  {
    icon: Search,
    color: "#6C5CE7",
    title: "Stuck? Reveal a letter, then your turn is over.",
    body: "Each miss exposes one more letter and hands the chain to the next player.",
  },
];

export function HowToPlay({ auto = false }: { auto?: boolean }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!auto) return;
    try {
      if (!localStorage.getItem(SEEN)) setOpen(true);
    } catch {}
  }, [auto]);

  function close() {
    setOpen(false);
    try {
      localStorage.setItem(SEEN, "1");
    } catch {}
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-semibold text-brand underline-offset-4 hover:underline"
      >
        How to play
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-end bg-black/45 p-0 backdrop-blur-sm sm:place-items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="How to play Word Chains"
          onClick={close}
        >
          <div
            className="wc-rise w-full max-w-md rounded-t-3xl bg-white p-6 dark:bg-[#141a30] sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">How to play</h2>
                <p className="mt-1 text-sm text-chain">One word leads to the next.</p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="grid h-9 w-9 place-items-center rounded-lg text-black/50 transition hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <ul className="mt-5 space-y-4">
              {STEPS.map((s) => (
                <li key={s.title} className="flex gap-3">
                  <s.icon size={22} style={{ color: s.color }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">{s.title}</p>
                    <p className="mt-0.5 text-sm text-black/55 dark:text-white/55">{s.body}</p>
                  </div>
                </li>
              ))}
            </ul>

            <p className="mt-5 rounded-xl bg-mist px-3 py-2.5 text-xs text-black/60 dark:bg-white/5 dark:text-white/60">
              Scoring: a word is worth its letter count, minus one point for every extra letter you
              had revealed. Solve on the first letter for the full value.
            </p>

            <button
              type="button"
              onClick={close}
              className="mt-5 w-full rounded-xl bg-brand py-3 font-semibold text-white transition hover:bg-brand-dark"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
