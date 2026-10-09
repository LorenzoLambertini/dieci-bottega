/**
 * Misura i siti concept con Lighthouse (mobile), 3 passaggi per pagina, e tiene la mediana.
 * Scrive concept-redesign/metriche.json e lib/concept-metrics.ts (usato dalle pagine /concept/<slug>).
 *
 * Prerequisiti: sito avviato in locale (npm run dev o npm start) e foto/video già in locale.
 * Uso: BASE_URL=http://localhost:3000 npm run concept:measure
 * Opzionale: CHROME_PATH (di default il Chromium di Playwright), RUNS (default 3).
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const RUNS = Number(process.env.RUNS ?? 3);
const CHROME = process.env.CHROME_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const SLUGS = ["lantern-pub", "pizzeria-brace", "trattoria-portico"];

const median = (xs) => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };

function runOnce(url) {
  const dir = mkdtempSync(join(tmpdir(), "lh-"));
  const out = join(dir, "r.json");
  execFileSync("npx", ["-y", "lighthouse@13", url, "--quiet", "--output=json", `--output-path=${out}`,
    "--only-categories=performance,accessibility,best-practices,seo",
    // Le demo sono in noindex apposta (solo i casi studio vanno su Google): quel controllo non conta
    "--skip-audits=is-crawlable",
    "--chrome-flags=--headless=new --no-sandbox --disable-gpu"], { stdio: "inherit", env: { ...process.env, CHROME_PATH: CHROME } });
  const r = JSON.parse(readFileSync(out, "utf8"));
  rmSync(dir, { recursive: true, force: true });
  const a = r.audits, c = r.categories;
  const items = a["network-requests"]?.details?.items ?? [];
  return {
    performance: Math.round(c.performance.score * 100),
    accessibility: Math.round(c.accessibility.score * 100),
    bestPractices: Math.round(c["best-practices"].score * 100),
    seo: Math.round(c.seo.score * 100),
    lcp: Math.round(a["largest-contentful-paint"].numericValue),
    cls: Number(a["cumulative-layout-shift"].numericValue.toFixed(3)),
    tbt: Math.round(a["total-blocking-time"].numericValue),
    bytes: Math.round(a["total-byte-weight"].numericValue),
    requests: items.length,
  };
}

function measure(url) {
  const runs = Array.from({ length: RUNS }, (_, i) => { console.log(`→ ${url} (${i + 1}/${RUNS})`); return runOnce(url); });
  const keys = Object.keys(runs[0]);
  return Object.fromEntries(keys.map((k) => [k, median(runs.map((r) => r[k]))]));
}

const result = { measuredAt: new Date().toISOString(), tool: "Lighthouse 13, mobile, mediana di " + RUNS + " (escluso il controllo is-crawlable: le demo sono noindex di proposito)", pages: {} };
for (const slug of SLUGS) {
  result.pages[slug] = {
    prima: measure(`${BASE}/concept-demo/${slug}/prima.html`),
    dopo: measure(`${BASE}/concept-demo/${slug}/dopo.html`),
  };
}
writeFileSync(join(here, "metriche.json"), JSON.stringify(result, null, 2) + "\n");

const ts = readFileSync(join(root, "lib", "concept-metrics.ts"), "utf8").replace(
  /export const CONCEPT_METRICS[\s\S]*$/,
  `export const CONCEPT_METRICS: Record<string, ConceptMetrics> = ${JSON.stringify(
    Object.fromEntries(Object.entries(result.pages).map(([k, v]) => [k, { measuredAt: result.measuredAt, ...v }])), null, 2)};\n`,
);
writeFileSync(join(root, "lib", "concept-metrics.ts"), ts);
console.log("✓ concept-redesign/metriche.json e lib/concept-metrics.ts aggiornati");
