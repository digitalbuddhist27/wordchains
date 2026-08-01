import Link from "next/link";
import { CalendarDays, Users } from "lucide-react";
import { LogoMark, Wordmark } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HowToPlay } from "@/components/HowToPlay";
import { SetupPanel } from "@/components/SetupPanel";
import { dailyNumber } from "@/lib/daily";
import { CHAINS } from "@/lib/chains";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 pb-16 pt-5">
      <div className="flex justify-end gap-3">
        <HowToPlay auto />
        <ThemeToggle />
      </div>

      <div className="mt-6 flex flex-col items-center text-center">
        <LogoMark size={132} />
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          <Wordmark />
        </h1>
        <p className="mt-2 text-lg font-medium text-chain">One word leads to the next.</p>
        <p className="mt-3 max-w-sm text-sm text-black/60 dark:text-white/60">
          Get one word, then guess the next word that completes a common phrase. Miss, get a hint,
          and pass the chain.
        </p>
      </div>

      <Link
        href="/daily"
        className="mt-8 flex items-center gap-4 rounded-3xl bg-ink p-5 text-white transition hover:bg-ink/90 dark:bg-white/10 dark:hover:bg-white/15"
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand">
          <CalendarDays size={20} />
        </span>
        <span className="flex-1">
          <span className="block font-semibold">Daily Chain</span>
          <span className="block text-sm text-white/60">
            Chain #{dailyNumber()}. Same puzzle for everyone today.
          </span>
        </span>
        <span className="text-sm font-semibold text-chain">Play</span>
      </Link>

      <Link
        href="/online"
        className="mt-3 flex items-center gap-4 rounded-3xl border-2 border-brand/30 bg-white p-5 transition hover:border-brand dark:bg-white/5"
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-chain">
          <Users size={20} className="text-white" />
        </span>
        <span className="flex-1">
          <span className="block font-semibold">Play online</span>
          <span className="block text-sm text-black/55 dark:text-white/55">
            Room code, everyone on their own phone.
          </span>
        </span>
        <span className="text-sm font-semibold text-brand">Start</span>
      </Link>

      <SetupPanel chainCount={CHAINS.length} />
    </main>
  );
}
