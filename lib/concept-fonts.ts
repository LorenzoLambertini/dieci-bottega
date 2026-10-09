/** Caratteri dei brand concept, caricati solo nelle pagine /concept. */
import type { CSSProperties } from "react";
import { Archivo_Black, Bricolage_Grotesque, IBM_Plex_Mono, Newsreader } from "next/font/google";

const lantern = Bricolage_Grotesque({ subsets: ["latin"], axes: ["wdth"], variable: "--font-lantern", display: "swap", preload: false });
const braceDisplay = Archivo_Black({ subsets: ["latin"], weight: "400", variable: "--font-brace", display: "swap", preload: false });
const braceMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-brace-mono", display: "swap", preload: false });
const portico = Newsreader({ subsets: ["latin"], axes: ["opsz"], style: ["normal", "italic"], variable: "--font-portico", display: "swap", preload: false });

export const conceptFontVars = [lantern.variable, braceDisplay.variable, braceMono.variable, portico.variable].join(" ");

/** Stile del nome/titoli per ogni brand (famiglia e impostazioni dal brand book). */
export const BRAND_TYPE: Record<string, { display: CSSProperties; text: CSSProperties }> = {
  "lantern-pub": {
    display: { fontFamily: "var(--font-lantern)", fontWeight: 800, fontVariationSettings: "'wdth' 75", letterSpacing: "-0.02em", lineHeight: 0.9 },
    text: { fontFamily: "var(--font-lantern)", fontWeight: 400 },
  },
  "pizzeria-brace": {
    display: { fontFamily: "var(--font-brace)", textTransform: "uppercase", letterSpacing: "0.02em", lineHeight: 0.9 },
    text: { fontFamily: "var(--font-brace-mono)", fontWeight: 400 },
  },
  "trattoria-portico": {
    display: { fontFamily: "var(--font-portico)", fontWeight: 300, fontVariationSettings: "'opsz' 72", letterSpacing: "-0.01em", lineHeight: 1 },
    text: { fontFamily: "var(--font-portico)", fontWeight: 400 },
  },
};
