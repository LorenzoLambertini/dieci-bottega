/**
 * Genera gli screenshot statici dei lavori in /public/lavori/ (WebP, solo above the fold).
 *
 * Uso (Playwright non è una dipendenza del progetto):
 *   npm i -g playwright && npx playwright install chromium
 *   NODE_PATH="$(npm root -g)" node scripts/screenshot-lavori.mjs
 *
 * Con --placeholder genera segnaposto brand-allineati negli stessi percorsi
 * (utile se i siti non sono raggiungibili).
 */
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import path from "node:path";

// require() (non import) così NODE_PATH trova anche un playwright installato globalmente
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const sharp = require("sharp");

const OUT = path.join(process.cwd(), "public", "lavori");
const DESKTOP = { width: 1440, height: 900 };
const MOBILE  = { width: 390,  height: 844 };

// Virtus: solo la home. MAI la sezione Staff & Contatti (telefoni ed email personali).
const SHOTS = [
  { file: "villa-pet-sitter/prima-desktop.webp", url: "https://villapetsitter.eu",               vp: DESKTOP },
  { file: "villa-pet-sitter/prima-mobile.webp",  url: "https://villapetsitter.eu",               vp: MOBILE  },
  { file: "villa-pet-sitter/dopo-desktop.webp",  url: "https://villa-pet-sitter.vercel.app",     vp: DESKTOP },
  { file: "villa-pet-sitter/dopo-mobile.webp",   url: "https://villa-pet-sitter.vercel.app",     vp: MOBILE  },
  { file: "virtus-welcome-kit/desktop.webp",     url: "https://virtus-welcome-kit.vercel.app",   vp: DESKTOP },
  { file: "lambo/desktop.webp",                  url: "https://djlambogiulio.vercel.app",        vp: DESKTOP },
];

const placeholder = process.argv.includes("--placeholder");

function placeholderHtml({ file, url, vp }) {
  const mobile = vp.width < 600;
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;width:${vp.width}px;height:${vp.height}px;
    background:#1A1414;color:#F4EFE6;display:flex;flex-direction:column;justify-content:center;
    align-items:center;gap:${mobile ? 14 : 22}px;font-family:monospace;text-align:center">
    <div style="letter-spacing:.14em;text-transform:uppercase;color:#E63B2E;font-size:${mobile ? 12 : 16}px">◆ Screenshot in arrivo</div>
    <div style="font-family:sans-serif;font-weight:900;text-transform:uppercase;letter-spacing:-.03em;font-size:${mobile ? 30 : 64}px;padding:0 24px">${url.replace("https://", "")}</div>
    <div style="opacity:.45;letter-spacing:.12em;font-size:${mobile ? 11 : 14}px">${file} · ${vp.width}×${vp.height}</div>
  </body></html>`;
}

const browser = await chromium.launch();
for (const shot of SHOTS) {
  const page = await browser.newPage({
    viewport: shot.vp,
    deviceScaleFactor: 1,
    isMobile: shot.vp === MOBILE,
    hasTouch: shot.vp === MOBILE,
  });
  if (placeholder) {
    await page.setContent(placeholderHtml(shot));
  } else {
    await page.goto(shot.url, { waitUntil: "networkidle", timeout: 60_000 });
    await page.waitForTimeout(1500); // animazioni d'ingresso
  }
  const png = await page.screenshot({ fullPage: false });
  const dest = path.join(OUT, shot.file);
  await mkdir(path.dirname(dest), { recursive: true });
  await sharp(png).webp({ quality: 80 }).toFile(dest);
  console.log("✓", shot.file);
  await page.close();
}
await browser.close();
