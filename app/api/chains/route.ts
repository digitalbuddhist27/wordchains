import { NextResponse } from "next/server";
import { CHAINS, chainsByDifficulty, type Difficulty } from "@/lib/chains";

const VALID: Difficulty[] = ["easy", "medium", "hard"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const d = searchParams.get("difficulty");
  const difficulty = (VALID as string[]).includes(d ?? "") ? (d as Difficulty) : undefined;
  const chains = chainsByDifficulty(difficulty);

  return NextResponse.json({
    total: CHAINS.length,
    count: chains.length,
    difficulty: difficulty ?? "all",
    chains,
  });
}
