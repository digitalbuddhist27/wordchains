import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Word Chains",
    short_name: "Word Chains",
    description: "One word leads to the next. A word-association chain game.",
    start_url: "/",
    display: "standalone",
    background_color: "#0F172A",
    theme_color: "#6C5CE7",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
