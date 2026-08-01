import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeScript } from "@/components/ThemeToggle";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const SITE = "https://playwordchains.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Word Chains: One word leads to the next.",
    template: "%s · Word Chains",
  },
  description:
    "Get one word, then guess the next word that completes a common phrase. Miss, get a hint, and pass the chain. Solo, pass-and-play, or the Daily Chain.",
  applicationName: "Word Chains",
  keywords: ["word game", "word chain", "compound words", "party game", "daily puzzle"],
  openGraph: {
    type: "website",
    siteName: "Word Chains",
    url: SITE,
    title: "Word Chains: One word leads to the next.",
    description:
      "Get one word, then guess the next word that completes a common phrase. Miss, get a hint, and pass the chain.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Word Chains" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Word Chains: One word leads to the next.",
    description:
      "Get one word, then guess the next word that completes a common phrase. Miss, get a hint, and pass the chain.",
    images: ["/opengraph-image"],
  },
};

export const viewport: Viewport = {
  themeColor: "#6C5CE7",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full font-sans flex flex-col">{children}</body>
    </html>
  );
}
