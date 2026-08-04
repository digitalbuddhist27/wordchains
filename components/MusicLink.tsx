/**
 * The persistent footer every 27 game carries, matching Initials and Six Degrees:
 * a quiet row of pills. "More Games" points back at the hub; Word Chains sits on
 * its own domain, so that link has to be absolute.
 */

const pill =
  "inline-block rounded-full border border-black/15 px-4 py-1.5 text-xs font-medium tracking-[0.04em] text-black/50 transition hover:border-black/60 hover:text-black active:scale-[0.97] dark:border-white/20 dark:text-white/50 dark:hover:border-white dark:hover:text-white";

export function MusicLink() {
  return (
    <footer className="flex flex-col items-center gap-2.5 px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-3">
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <a href="https://games.27productions.com" className={pill}>
          More Games
        </a>
        <a
          href="https://links.27productions.com/blake-ian"
          target="_blank"
          rel="noopener noreferrer"
          className={pill}
        >
          Listen To My Music
        </a>
      </div>
    </footer>
  );
}
