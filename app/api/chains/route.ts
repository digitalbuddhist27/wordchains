import { NextResponse } from "next/server";
import { generateChain, graphStats, type Difficulty } from "@/lib/chains";

const VALID: Difficulty[] = ["easy", "medium", "hard"];

/**
 * Generates chains on demand rather than serving a fixed library.
 * /api/chains?difficulty=hard&count=5
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const d = searchParams.get("difficulty");
  const difficulty: Difficulty = (VALID as string[]).includes(d ?? "")
    ? (d as Difficulty)
    : "easy";
  const count = Math.min(Math.max(Number(searchParams.get("count") ?? 1) || 1, 1), 25);

  const chains = Array.from({ length: count }, () => generateChain(difficulty)).filter(Boolean);

  return NextResponse.json({
    difficulty,
    count: chains.length,
    graph: graphStats(),
    chains,
  });
}
