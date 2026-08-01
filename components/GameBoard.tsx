"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, RotateCw, Share2, Trophy } from "lucide-react";
import { GuessInput } from "./GuessInput";

const SITE_URL = "https://playwordchains.com";
import type { Chain } from "@/lib/chains";
import {
  initGame,
  miss,
  shareGrid,
  submitGuess,
  summarize,
  type GameState,
  type Mode,
  type Player,
} from "@/lib/game";
import { WordTile } from "./WordTile";
import { ScorePanel } from "./ScorePanel";

type Props = {
  chain: Chain;
  mode: Mode;
  players: Player[];
  /** Wordle-style share line for the Daily Chain. */
  shareTitle?: string;
  onReplay?: () => void;
};

export function GameBoard({ chain, mode, players, shareTitle, onReplay }: Props) {
  const [state, setState] = useState<GameState>(() => initGame(chain, mode, players));
  const [guess, setGuess] = useState("");
  const [shaking, setShaking] = useState(false);
  const [flash, setFlash] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const boardEndRef = useRef<HTMLDivElement>(null);

  const solo = state.players.length === 1;
  const active = state.currentIndex;
  const done = state.status === "complete";

  useEffect(() => {
    const e = state.lastEvent;
    if (!e) return;
    if (e.type === "miss") {
      setShaking(true);
      const t = setTimeout(() => setShaking(false), 420);
      return () => clearTimeout(t);
    }
    if (e.type === "correct") {
      setFlash(e.index);
      const t = setTimeout(() => setFlash(null), 470);
      return () => clearTimeout(t);
    }
  }, [state.lastEvent]);

  useEffect(() => {
    if (done) boardEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [done]);

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!guess.trim() || done) return;
    setState((s) => submitGuess(s, guess));
    setGuess("");
  }

  function handlePass() {
    if (done) return;
    setState((s) => miss(s));
    setGuess("");
  }

  const summary = useMemo(() => summarize(state), [state]);
  const currentPlayer = state.players[state.currentPlayer];

  const banner = (() => {
    const e = state.lastEvent;
    if (!e) return null;
    if (e.type === "correct")
      return { tone: "good" as const, text: `${e.word} for ${e.points} ${e.points === 1 ? "point" : "points"}` };
    if (e.type === "auto")
      return { tone: "warn" as const, text: `${e.word} revealed. Nobody scored that one.` };
    if (e.type === "miss")
      return {
        tone: "bad" as const,
        text: solo
          ? `Not it. Letter ${e.revealed} revealed.`
          : `Not it. Letter ${e.revealed} revealed, over to ${state.players[state.currentPlayer].name}.`,
      };
    return null;
  })();

  async function share() {
    const grid = shareGrid(state);
    const text = `${shareTitle ?? "Word Chains"}\n${grid}\n${summary.totalScore} pts, ${summary.totalHints} letters used`;
    try {
      // Pass url separately so the OS attaches a real link and renders the
      // OpenGraph card. A bare domain in the text body stays unclickable.
      if (navigator.share) {
        await navigator.share({ title: "Word Chains", text, url: SITE_URL });
      } else {
        await navigator.clipboard.writeText(`${text}\n${SITE_URL}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      }
    } catch {
      /* user dismissed the share sheet */
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-28 pt-4 sm:pb-8">
      <ScorePanel
        players={state.players}
        currentPlayer={state.currentPlayer}
        streak={state.turnStreak}
        solo={solo}
      />

      {!done && (
        <p className="mt-4 text-center text-sm text-black/60 dark:text-white/60">
          {solo ? (
            <>Guess the word that completes the phrase.</>
          ) : (
            <>
              <span className="font-semibold" style={{ color: currentPlayer.color }}>
                {currentPlayer.name}
              </span>{" "}
              is up.
            </>
          )}
        </p>
      )}

      <div className="mt-4 flex flex-col gap-2">
        {chain.words.map((w, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            {i > 0 && (
              <ArrowRight
                size={16}
                className={`rotate-90 ${i === active ? "text-brand" : "text-black/20 dark:text-white/20"}`}
                aria-hidden="true"
              />
            )}
            <WordTile
              word={w}
              revealed={state.revealed[i]}
              solved={state.solved[i]}
              active={i === active}
              given={
                i === 0 || (chain.direction === "both-ends" && i === chain.words.length - 1)
              }
              shaking={shaking && i === active}
              justSolved={flash === i}
              position={i + 1}
            >
              {i === active && !done ? (
                <GuessInput
                  value={guess}
                  onChange={setGuess}
                  onSubmit={handleSubmit}
                  word={w}
                  revealed={state.revealed[i]}
                  focusKey={`${i}-${state.currentPlayer}-${state.revealed[i]}`}
                />
              ) : null}
            </WordTile>
          </div>
        ))}
        <div ref={boardEndRef} />
      </div>

      {banner && !done && (
        <p
          className={`wc-rise mt-4 rounded-xl px-3 py-2 text-center text-sm font-medium ${
            banner.tone === "good"
              ? "bg-chain/15 text-chain"
              : banner.tone === "warn"
                ? "bg-gold/20 text-[#8a6d00] dark:text-gold"
                : "bg-red-500/10 text-red-600 dark:text-red-400"
          }`}
          role="status"
          aria-live="polite"
        >
          {banner.text}
        </p>
      )}

      {done ? (
        <div className="wc-rise mt-6 rounded-3xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-gold" />
            <h2 className="text-lg font-bold">Chain complete</h2>
          </div>

          {!solo && (
            <p className="mt-1 text-sm text-black/60 dark:text-white/60">
              {summary.winners.length > 1
                ? `Tie: ${summary.winners.map((p) => p.name).join(" and ")}`
                : `${summary.winners[0].name} wins`}
            </p>
          )}

          <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-black/45 dark:text-white/45">
                Score
              </dt>
              <dd className="text-2xl font-bold text-chain">{summary.totalScore}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-black/45 dark:text-white/45">
                Letters
              </dt>
              <dd className="text-2xl font-bold">{summary.totalHints}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-black/45 dark:text-white/45">
                No hints
              </dt>
              <dd className="text-2xl font-bold">
                {summary.cleanSolves}
                <span className="text-base text-black/40 dark:text-white/40">
                  /{summary.guessableCount}
                </span>
              </dd>
            </div>
          </dl>

          {!solo && (
            <ul className="mt-4 space-y-1.5">
              {summary.ranked.map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: p.color }}
                      aria-hidden="true"
                    />
                    {p.name}
                  </span>
                  <span className="font-bold">{p.score}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={share}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
            >
              <Share2 size={16} />
              {copied ? "Copied" : "Share result"}
            </button>
            {onReplay && (
              <button
                type="button"
                onClick={onReplay}
                className="inline-flex items-center gap-2 rounded-xl border border-black/15 px-4 py-2.5 text-sm font-semibold transition hover:border-brand/50 dark:border-white/20"
              >
                <RotateCw size={16} />
                New chain
              </button>
            )}
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-black/15 px-4 py-2.5 text-sm font-semibold transition hover:border-brand/50 dark:border-white/20"
            >
              Home
            </Link>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handlePass}
          className="mx-auto mt-5 flex items-center gap-1.5 rounded-xl border border-black/15 px-4 py-2.5 text-xs font-semibold text-black/60 transition hover:border-brand/50 hover:text-brand dark:border-white/20 dark:text-white/60"
        >
          <Eye size={14} />
          Stuck? Reveal a letter{solo ? "" : " and pass"}
        </button>
      )}
    </div>
  );
}
