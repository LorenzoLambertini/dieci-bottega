/**
 * Genera i siti demo dei concept in public/concept-demo/<slug>/{prima,dopo}.html
 * partendo dai sorgenti in concept-redesign/{prima,dopo}/.
 *
 * Aggiunge a ogni pagina, senza toccarne design e funzioni:
 *  - <meta name="robots" content="noindex"> (Google indicizza solo i casi studio)
 *  - la dicitura ben visibile in alto "Concept non commissionato…" con il link al caso studio
 *
 * Uso: npm run concept:demos   (rilanciarlo dopo ogni modifica ai sorgenti)
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

const DEMOS = [
  { slug: "lantern-pub", file: "lantern-pub", name: "The Lantern Pub" },
  { slug: "pizzeria-brace", file: "pizzeria-brace", name: "Pizzeria Brace" },
  { slug: "trattoria-portico", file: "trattoria-portico", name: "Trattoria del Portico" },
];

const DISCLAIMER = "Concept non commissionato. Attività di fantasia, nessun rapporto con locali reali.";

function banner(slug, version) {
  const other = version === "prima" ? "dopo" : "prima";
  return `
<div id="db-concept-bar" role="note" style="position:sticky;top:0;z-index:2147483000;display:flex;flex-wrap:wrap;gap:4px 14px;align-items:center;justify-content:center;padding:7px 14px;background:#1A1414;color:#F4EFE6;font:500 12px/1.35 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.04em;text-align:center">
  <strong style="color:#F2B8A2;font-weight:600">${version === "prima" ? "PRIMA" : "DOPO"} · ${DISCLAIMER}</strong>
  <span><a href="/concept/${slug}" style="color:#F4EFE6">Il caso studio di Dieci Bottega</a> · <a href="/concept/${slug}/${other}" style="color:#F4EFE6">Vedi il ${other}</a></span>
</div>
<script>(function(){var b=document.getElementById('db-concept-bar');function s(){document.documentElement.style.setProperty('--db-concept-bar',b.offsetHeight+'px')}s();addEventListener('resize',s)})();</script>`;
}

/** Header fissati in alto nei sorgenti: vanno spostati sotto la barra della dicitura. */
const EXTRA_CSS = {
  "dopo:lantern-pub": ".top{top:var(--db-concept-bar,0px)!important}",
};

async function build(demo, version) {
  const src = join(here, version, `${version}-${demo.file}.html`);
  let html = await readFile(src, "utf8");
  const head = `<meta name="robots" content="noindex, nofollow">\n<link rel="canonical" href="https://diecibottega.it/concept/${demo.slug}">` +
    (EXTRA_CSS[`${version}:${demo.slug}`] ? `\n<style>${EXTRA_CSS[`${version}:${demo.slug}`]}</style>` : "");
  html = html.replace(/<head>/i, `<head>\n${head}`);
  html = html.replace(/<body([^>]*)>/i, (m) => `${m}${banner(demo.slug, version)}`);
  const out = join(root, "public", "concept-demo", demo.slug, `${version}.html`);
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, html);
  return out;
}

for (const d of DEMOS) for (const v of ["prima", "dopo"]) console.log("✓", (await build(d, v)).replace(root + "/", ""));
