import Link from "next/link";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { HowToPlay } from "./HowToPlay";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-black/5 bg-mist/85 backdrop-blur dark:border-white/10 dark:bg-[#0b1020]/85">
      <div className="mx-auto flex w-full max-w-xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" aria-label="Word Chains home">
          <Logo size={34} textClass="text-lg" />
        </Link>
        <div className="flex items-center gap-3">
          <HowToPlay />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
