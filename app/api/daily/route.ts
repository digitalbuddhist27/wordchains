import { NextResponse } from "next/server";
import { dailyChain, dailyKey, dailyNumber } from "@/lib/daily";

export const revalidate = 3600;

export async function GET() {
  return NextResponse.json({
    number: dailyNumber(),
    date: dailyKey(),
    chain: dailyChain(),
  });
}
