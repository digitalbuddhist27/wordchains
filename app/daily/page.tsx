import { SiteHeader } from "@/components/SiteHeader";
import { GameBoard } from "@/components/GameBoard";
import { makePlayers } from "@/lib/game";
import { dailyChain, dailyNumber } from "@/lib/daily";

export const metadata = { title: "Daily Chain" };

// One chain per Eastern day. Revalidate every minute so midnight Eastern
// rollover shows up promptly rather than up to an hour late.
export const revalidate = 60;

export default function DailyPage() {
  const chain = dailyChain();
  const n = dailyNumber();

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto mt-4 w-full max-w-xl px-4 text-center">
          <h1 className="text-xl font-bold">Daily Chain #{n}</h1>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-black/35 dark:text-white/35">
            {chain.difficulty} · {chain.words.length} words · same for everyone today
          </p>
        </div>
        <GameBoard
          chain={chain}
          mode="daily"
          players={makePlayers(["You"])}
          shareTitle={`Word Chains #${n}`}
        />
      </main>
    </>
  );
}
