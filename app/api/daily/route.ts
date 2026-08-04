import { NextResponse } from "next/server";
import {
  DAILY_TIMEZONE,
  dailyChain,
  dailyKey,
  dailyNumber,
  secondsUntilRollover,
} from "@/lib/daily";

export const revalidate = 60;

export async function GET() {
  return NextResponse.json({
    number: dailyNumber(),
    date: dailyKey(),
    timezone: DAILY_TIMEZONE,
    secondsUntilNext: secondsUntilRollover(),
    chain: dailyChain(),
  });
}
