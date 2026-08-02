import { SiteHeader } from "@/components/SiteHeader";
import { PlayClient } from "./PlayClient";
import type { Difficulty } from "@/lib/chains";

export const metadata = { title: "Play" };

const VALID: Difficulty[] = ["easy", "medium", "hard"];

export default async function PlayPage({
  searchParams,
}: {
  searchParams: Promise<{ difficulty?: string; players?: string }>;
}) {
  const sp = await searchParams;
  const difficulty = (VALID as string[]).includes(sp.difficulty ?? "")
    ? (sp.difficulty as Difficulty)
    : "easy";

  const names = (sp.players ?? "Player 1")
    .split("|")
    .map((n) => n.trim())
    .filter(Boolean)
    .slice(0, 6);

  return (
    <>
      <SiteHeader />
      <PlayClient difficulty={difficulty} names={names.length ? names : ["Player 1"]} />
    </>
  );
}
