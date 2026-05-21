import { ImageResponse } from "next/og";

export const runtime     = "edge";
export const alt         = "Dieci Bottega — Siti web professionali per PMI italiane";
export const size        = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#E63B2E",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "80px",
          fontFamily: "Arial Black, Arial",
          position: "relative",
        }}
      >
        {/* Subtle grid texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(244,239,230,0.06) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Tag */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", zIndex: 1 }}>
          <div style={{ width: "32px", height: "1px", background: "rgba(244,239,230,0.35)" }} />
          <span
            style={{
              color: "rgba(244,239,230,0.45)",
              fontSize: "12px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontFamily: "monospace",
            }}
          >
            MICRO-AGENZIA DIGITALE · BOLOGNA · EST. 2026
          </span>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", zIndex: 1 }}>
          <div
            style={{
              color: "#F4EFE6",
              fontSize: "96px",
              fontWeight: 900,
              lineHeight: 0.88,
              letterSpacing: "-0.04em",
              textTransform: "uppercase",
            }}
          >
            IL SITO<br />
            CHE TI<br />
            SERVE.
          </div>
          <div
            style={{
              color: "rgba(244,239,230,0.65)",
              fontSize: "30px",
              fontStyle: "italic",
              fontFamily: "Georgia, serif",
              lineHeight: 1.3,
            }}
          >
            In dieci giorni. Da 800€.
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            zIndex: 1,
            borderTop: "1px solid rgba(244,239,230,0.15)",
            paddingTop: "32px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              style={{
                color: "#F4EFE6",
                fontSize: "18px",
                fontWeight: 900,
                letterSpacing: "-0.01em",
                textTransform: "uppercase",
              }}
            >
              DIECI BOTTEGA®
            </span>
            <span style={{ color: "rgba(244,239,230,0.25)", fontSize: "14px" }}>·</span>
            <span
              style={{
                color: "rgba(244,239,230,0.45)",
                fontSize: "14px",
                fontFamily: "monospace",
                letterSpacing: "0.06em",
              }}
            >
              diecibottega.it
            </span>
          </div>
          <div
            style={{
              display: "flex",
              gap: "24px",
              color: "rgba(244,239,230,0.35)",
              fontSize: "12px",
              fontFamily: "monospace",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            <span>SITI VETRINA</span>
            <span>·</span>
            <span>LANDING PAGE</span>
            <span>·</span>
            <span>AUTOMAZIONI</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
