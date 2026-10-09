/**
 * Screenshot prima/dopo dei siti concept per lo slider dei casi studio:
 * desktop 1600×900 e mobile 780×1392 (390×696 a 2x), in WebP in public/concept/<slug>/shots/.
 *
 * Prerequisiti: sito avviato in locale e foto/video già in locale.
 * Uso: BASE_URL=http://localhost:3000 npm run concept:shots
 */
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const SLUGS = ["lantern-pub", "pizzeria-brace", "trattoria-portico"];

let chromium;
try { ({ chromium } = await import("playwright")); }
catch { ({ chromium } = await import("/opt/node22/lib/node_modules/playwright/index.mjs")); }

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
for (const slug of SLUGS) {
  const dir = join(root, "public", "concept", slug, "shots");
  await mkdir(dir, { recursive: true });
  for (const version of ["prima", "dopo"]) {
    for (const [kind, viewport, scale] of [["desktop", { width: 1600, height: 900 }, 1], ["mobile", { width: 390, height: 696 }, 2]]) {
      const page = await browser.newPage({ viewport, deviceScaleFactor: scale, reducedMotion: "reduce" });
      await page.goto(`${BASE}/concept-demo/${slug}/${version}.html`, { waitUntil: "networkidle" });
      // La barra con la dicitura serve sul sito, non nello screenshot dello slider
      await page.evaluate(() => document.getElementById("db-concept-bar")?.remove());
      await page.waitForTimeout(1200);
      const png = await page.screenshot();
      const out = join(dir, `${version}-${kind}.webp`);
      await sharp(png).webp({ quality: 82 }).toFile(out);
      console.log("✓", out.replace(root + "/", ""));
      await page.close();
    }
  }
}
await browser.close();
