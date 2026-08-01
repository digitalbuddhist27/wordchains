# Word Chains

A word-association chain game. One word leads to the next.

Live: https://playwordchains.com

## How it works
Every consecutive pair of words in a chain forms a compound word or common
two-word phrase (SUN + FLOWER, FLOWER + POT). Only the first word is given.
Guess right and you keep your turn; miss and one more letter is revealed and
the chain passes to the next player.

## Modes
- Solo practice
- Pass and play (2 to 6 players, one device)
- Daily Chain (same puzzle for everyone, spoiler-free share card)

## Stack
Next.js 16 (App Router) + Tailwind v4. No database: the chain library lives in
`lib/chains.ts` and ships with the build, and session state is client-side.

## Adding chains
Append to the array in `lib/chains.ts` and push. Railway rebuilds on push and
`/api/chains` serves the new set.

## Local dev
    npm install
    npm run dev -- --port 3140
