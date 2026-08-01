import * as React from "react";

/**
 * Word Chains mark: two rounded speech-bubble links, joined by a bar that
 * breaks through both facing edges. Rebuilt as vector from the brand sheet.
 */
export function LogoMark({
  size = 40,
  className = "",
  green = "#22C55E",
  purple = "#6C5CE7",
}: {
  size?: number;
  className?: string;
  green?: string;
  purple?: string;
}) {
  return (
    <svg
      width={size}
      height={(size * 132) / 200}
      viewBox="0 0 200 132"
      fill="none"
      className={className}
      role="img"
      aria-label="Word Chains"
    >
      {/* left bubble, gap on its right edge for the connector */}
      <path
        d="M60 12H34C21.85 12 12 21.85 12 34v30c0 12.15 9.85 22 22 22h1.5l-6 20 26-20H60"
        stroke={green}
        strokeWidth="13"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M60 12h6c12.15 0 22 9.85 22 22v6" stroke={green} strokeWidth="13" strokeLinecap="round" />
      <path d="M88 60v4c0 12.15-9.85 22-22 22h-6" stroke={green} strokeWidth="13" strokeLinecap="round" />

      {/* right bubble, gap on its left edge */}
      <path
        d="M140 12h26c12.15 0 22 9.85 22 22v30c0 12.15-9.85 22-22 22h-1.5l6 20-26-20h-4.5"
        stroke={purple}
        strokeWidth="13"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M140 12h-6c-12.15 0-22 9.85-22 22v6" stroke={purple} strokeWidth="13" strokeLinecap="round" />
      <path d="M112 60v4c0 12.15 9.85 22 22 22h6" stroke={purple} strokeWidth="13" strokeLinecap="round" />

      {/* connector */}
      <rect x="82" y="43" width="36" height="15" rx="7.5" fill={purple} />

      {/* w */}
      <path
        d="M32 38l7 24 8-17 8 17 7-24"
        stroke={green}
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* c */}
      <path
        d="M166 40a15 15 0 100 22"
        stroke={purple}
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-bold tracking-tight ${className}`}>
      <span className="text-ink dark:text-white">Word</span>
      <span className="text-brand"> Chains</span>
    </span>
  );
}

export function Logo({ size = 36, textClass = "text-xl" }: { size?: number; textClass?: string }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} />
      <Wordmark className={textClass} />
    </span>
  );
}
