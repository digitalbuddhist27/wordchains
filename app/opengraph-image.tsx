import { ImageResponse } from "next/og";
import { markDataUri } from "@/lib/mark";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Word Chains: one word leads to the next.";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0F172A",
          fontFamily: "sans-serif",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={markDataUri(380)} width={380} height={251} alt="" />
        <div style={{ display: "flex", marginTop: 24, fontSize: 92, fontWeight: 700 }}>
          <span style={{ color: "#FFFFFF" }}>Word</span>
          <span style={{ color: "#6C5CE7" }}>&nbsp;Chains</span>
        </div>
        <div style={{ marginTop: 8, fontSize: 36, color: "#22C55E" }}>
          One word leads to the next.
        </div>
        <div style={{ marginTop: 28, fontSize: 26, color: "rgba(255,255,255,0.5)" }}>
          playwordchains.com
        </div>
      </div>
    ),
    size
  );
}
