import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = site.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#1b1a18",
          color: "#ece6da",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "0 88px 56px",
          }}
        >
          <div style={{ fontSize: 88, letterSpacing: "-0.03em", lineHeight: 1 }}>{site.name}</div>
          <div style={{ marginTop: 24, fontSize: 30, lineHeight: 1.4, color: "#a39e94", maxWidth: 900 }}>
            {site.tagline}
          </div>
        </div>
        <div style={{ height: 1, background: "rgba(236,230,218,0.3)" }} />
        <div style={{ height: 170, background: "#0f1518" }} />
      </div>
    ),
    size,
  );
}
