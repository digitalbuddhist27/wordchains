import { NextResponse } from "next/server";
import { isRealWord } from "@/lib/dictionary";

/**
 * Local play asks this before charging a miss. Only called when the guess did
 * NOT match the answer, so a correct guess never waits on the network.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get("w") ?? "";
  return NextResponse.json({ word: word.toUpperCase(), valid: isRealWord(word) });
}
