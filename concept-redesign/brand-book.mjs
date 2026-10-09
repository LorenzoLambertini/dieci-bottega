/**
 * Brand book in PDF per ogni concept (dati in concept-redesign/brands.json).
 * Output: public/concept/<slug>/brand-identity.pdf (+ anteprima copertina .webp)
 * Uso: npm run concept:brand
 */
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const BRANDS = JSON.parse(await readFile(join(here, "brands.json"), "utf8"));
const DISCLAIMER = "Concept non commissionato. Attività di fantasia, nessun rapporto con locali reali.";

let chromium;
try { ({ chromium } = await import("playwright")); }
catch { ({ chromium } = await import("/opt/node22/lib/node_modules/playwright/index.mjs")); }

/**
 * Font Google incorporati nel PDF (base64): il browser headless non passa sempre dal proxy,
 * curl sì. Così il PDF ha i caratteri giusti anche offline.
 */
const fontCache = new Map();
function curl(url, binary = false) {
  return execFileSync("curl", ["-sSL", "--max-time", "30", "-A", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36", url], { encoding: binary ? "buffer" : "utf8", maxBuffer: 50 * 1024 * 1024 });
}
function embeddedFonts(query) {
  if (fontCache.has(query)) return fontCache.get(query);
  let css = curl(`https://fonts.googleapis.com/css2?family=${query}&display=block`);
  // tiene solo i blocchi "latin" (niente cirillico, greco, vietnamita...) per un PDF leggero
  css = css.split("/* ").filter((blk) => !blk.trim() || blk.startsWith("latin */")).map((b) => (b.startsWith("latin */") ? "/* " + b : b)).join("");
  css = css.replace(/url\((https:[^)]+)\)/g, (_, u) => `url(data:font/woff2;base64,${curl(u, true).toString("base64")})`);
  fontCache.set(query, css);
  return css;
}

/** Varianti del simbolo: colori sostituiti per fondo chiaro / scuro. */
const MARK_ON_LIGHT = { "lantern-pub": { "#E8A33D' stroke": "#10291F' stroke" }, "trattoria-portico": { "#EDE6DA": "#18212E" } };
const MARK_ON_DARK = { "pizzeria-brace": { "#24170F": "#EFE7D8" } };
const variant = (svg, map = {}) => Object.entries(map).reduce((s, [a, b]) => s.split(a).join(b), svg);

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(", ");
const lum = (hex) => { const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ink = (hex) => (lum(hex) > 0.55 ? "#1A1414" : "#FFFFFF");
const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const rl = (hex) => { const [r, g, b] = [1, 3, 5].map((i) => lin(parseInt(hex.slice(i, i + 2), 16) / 255)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const contrast = (a, b) => { const [x, y] = [rl(a), rl(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
/** Simbolo a un solo colore (per fondi accesi) */
const mono = (svg, color) => svg.replace(/#[0-9A-Fa-f]{6}/g, color);
/** Colore del biglietto da visita: una tinta di contrasto, diversa dal fondo pagina */
const CARD = { "lantern-pub": "#173B2C", "pizzeria-brace": "#3A2618", "trattoria-portico": "#223044" };

function html(slug, b) {
  const [c0, c1, c2, c3, c4] = b.palette.map((p) => p.hex);
  const dark = lum(b.palette[0].hex) < 0.3 ? b.palette[0].hex : b.palette.find((p) => lum(p.hex) < 0.2).hex;
  const light = b.palette.reduce((a, p) => (lum(p.hex) > lum(a) ? p.hex : a), "#000000");
  const accent = b.palette.find((p) => /Azioni/.test(p.role)).hex;
  const markDark = variant(b.logo.mark, MARK_ON_DARK[slug]);
  const markLight = variant(b.logo.mark, MARK_ON_LIGHT[slug]);
  // etichette e dettagli in accento solo se leggibili sul fondo, altrimenti il colore scuro del brand
  const acc = (bg) => (contrast(accent, bg) >= 3 ? accent : dark);
  const markOnAccent = lum(accent) > 0.5 ? mono(b.logo.mark, dark) : markDark;
  const card = CARD[slug];
  const display = b.fonts[0].css, body = b.fonts[1].css;
  const logo = (mark, color, size) => `<div class="logo" style="color:${color}"><span class="mk" style="height:${size}px">${mark}</span><span style="${b.logo.wordmarkStyle};font-size:${size * 0.95}px;line-height:1">${esc(b.logo.wordmark)}</span></div>`;
  const foot = (n, bg) => `<footer style="color:${ink(bg)}"><span>${esc(b.fullName)} · Brand identity</span><span>${DISCLAIMER}</span><span>${String(n).padStart(2, "0")}</span></footer>`;
  const label = (t, color) => `<p class="lbl" style="color:${color}">${esc(t)}</p>`;

  return `<!doctype html><html lang="it"><head><meta charset="utf-8">
<style>${embeddedFonts(`${b.googleFonts}&family=JetBrains+Mono:wght@500`)}

@page{size:297mm 210mm;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
body{${body};-webkit-print-color-adjust:exact;print-color-adjust:exact}
section{width:297mm;height:210mm;position:relative;overflow:hidden;padding:18mm 20mm 22mm;page-break-after:always;display:flex;flex-direction:column}
section:last-child{page-break-after:auto}
.lbl{font-family:'JetBrains Mono',monospace;font-size:9pt;letter-spacing:.12em;text-transform:uppercase;margin-bottom:6mm}
h1,h2{${display};line-height:.92}
h2{font-size:34pt;margin-bottom:8mm}
p{font-size:11pt;line-height:1.5}
footer{position:absolute;left:20mm;right:20mm;bottom:9mm;display:flex;justify-content:space-between;gap:10mm;font-family:'JetBrains Mono',monospace;font-size:7pt;letter-spacing:.08em;text-transform:uppercase;opacity:.6}
.logo{display:flex;align-items:center;gap:.35em}
.mk{display:inline-flex}.mk svg{height:100%;width:auto}
.grid{display:grid;gap:7mm}
.card{padding:7mm;border-radius:3mm}
ul{list-style:none}
li{font-size:10.5pt;line-height:1.45;padding:2.2mm 0;border-bottom:.3mm solid currentColor;border-color:rgba(127,127,127,.25)}
.sw{border-radius:3mm;padding:5mm;display:flex;flex-direction:column;justify-content:space-between;min-height:44mm}
.sw b{${display};font-size:16pt}
.mono{font-family:'JetBrains Mono',monospace;font-size:8.5pt;letter-spacing:.04em}
</style></head><body>

<section style="background:${dark};color:${light};justify-content:space-between">
  ${label("Brand identity · 2026", accent)}
  <div>${logo(markDark, light, 92)}<p style="margin-top:10mm;font-size:16pt;max-width:150mm;opacity:.85">${esc(b.tagline)}</p></div>
  <div style="display:flex;justify-content:space-between;align-items:end">
    <p class="mono" style="opacity:.7">${esc(b.descriptor)}</p>
    <p class="mono" style="opacity:.7;text-align:right">Progetto di Dieci Bottega · diecibottega.it<br>${DISCLAIMER}</p>
  </div>
</section>

<section style="background:${light};color:${dark}">
  ${label("01 · Essenza", acc(light))}
  <h2 style="max-width:200mm">${esc(b.tagline)}</h2>
  <p style="font-size:14pt;max-width:210mm;margin-bottom:12mm">${esc(b.essence)}</p>
  <div class="grid" style="grid-template-columns:repeat(3,1fr);margin-top:auto">
    ${b.values.map((v, i) => `<div class="card" style="background:${i === 1 ? dark : "transparent"};color:${i === 1 ? light : dark};border:.4mm solid ${dark}"><p class="lbl" style="color:${i === 1 ? acc(dark) : acc(light)};margin-bottom:3mm">Valore ${i + 1}</p><p style="${display};font-size:20pt;margin-bottom:3mm">${esc(v.title)}</p><p>${esc(v.text)}</p></div>`).join("")}
  </div>
  ${foot(2, light)}
</section>

<section style="background:${light};color:${dark}">
  ${label("02 · Logo", acc(light))}
  <div class="grid" style="grid-template-columns:1.2fr 1fr 1fr;flex:1">
    <div class="card" style="background:${dark};display:flex;align-items:center;justify-content:center">${logo(markDark, light, 54)}</div>
    <div class="card" style="border:.4mm solid ${dark};display:flex;align-items:center;justify-content:center">${logo(markLight, dark, 40)}</div>
    <div class="card" style="background:${accent};display:flex;align-items:center;justify-content:center"><span class="mk" style="height:70px">${markOnAccent}</span></div>
  </div>
  <div class="grid" style="grid-template-columns:1fr 1fr;margin-top:8mm">
    <div><p style="${display};font-size:16pt;margin-bottom:3mm">L'idea</p><p>${esc(b.logo.concept)}</p></div>
    <div><p style="${display};font-size:16pt;margin-bottom:1mm">Regole d'uso</p><ul>${b.logo.rules.map((r) => `<li>${esc(r)}</li>`).join("")}</ul></div>
  </div>
  ${foot(3, light)}
</section>

<section style="background:${light};color:${dark}">
  ${label("03 · Palette", acc(light))}
  <div class="grid" style="grid-template-columns:repeat(3,1fr)">
    ${b.palette.map((p) => `<div class="sw" style="background:${p.hex};color:${ink(p.hex)};${lum(p.hex) > 0.85 ? `border:.4mm solid ${dark}33` : ""}"><b>${esc(p.name)}</b><div><p class="mono">${p.hex} · RGB ${rgb(p.hex)}</p><p style="font-size:9.5pt;margin-top:1.5mm;opacity:.85">${esc(p.role)}</p></div></div>`).join("")}
  </div>
  <p class="lbl" style="color:${dark};opacity:.6;margin:8mm 0 3mm">Proporzioni d'uso</p>
  <div style="display:flex;height:9mm;border-radius:2mm;overflow:hidden;border:.3mm solid ${dark}33">${b.palette.map((p) => `<div style="flex:${p.share};background:${p.hex}"></div>`).join("")}</div>
  ${foot(4, light)}
</section>

<section style="background:${dark};color:${light}">
  ${label("04 · Tipografia", accent)}
  ${b.fonts.map((f, i) => `<div style="margin-bottom:10mm;padding-bottom:8mm;border-bottom:.3mm solid ${light}33">
    <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4mm"><p class="mono" style="color:${accent}">${esc(f.role)}</p><p class="mono" style="opacity:.7">${esc(f.family)} · ${esc(f.spec)}</p></div>
    <p style="${f.css};font-size:${i === 0 ? 46 : 18}pt;line-height:${i === 0 ? 0.95 : 1.4}">${esc(f.sample)}</p>
    ${i === 0 ? `<p style="${f.css};font-size:18pt;opacity:.7;margin-top:4mm">Aa Bb Cc Dd Ee 0123456789 € &amp; ?!</p>` : ""}
  </div>`).join("")}
  <p class="mono" style="opacity:.7">Font gratuiti Google Fonts (licenza OFL): ${[...new Set(b.fonts.map((f) => f.family))].join(", ")}.</p>
  ${foot(5, dark)}
</section>

<section style="background:${light};color:${dark}">
  ${label("05 · Tono di voce", acc(light))}
  <div class="grid" style="grid-template-columns:1.1fr 1fr;flex:1">
    <div>
      <p style="${display};font-size:24pt;margin-bottom:4mm">${b.tone.personality.map(esc).join(" · ")}</p>
      <p style="font-size:12pt;margin-bottom:8mm">${esc(b.tone.description)}</p>
      <div class="grid" style="grid-template-columns:1fr 1fr;gap:6mm">
        <div><p class="lbl" style="color:${acc(light)};margin-bottom:1mm">Sì</p><ul>${b.tone.do.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>
        <div><p class="lbl" style="color:${dark};opacity:.6;margin-bottom:1mm">No</p><ul>${b.tone.dont.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>
      </div>
    </div>
    <div class="grid" style="align-content:start;gap:5mm">
      ${b.tone.examples.map((e) => `<div class="card" style="background:${dark};color:${light}"><p class="lbl" style="color:${accent};margin-bottom:2mm">${esc(e.context)}</p><p style="font-size:12pt">“${esc(e.text)}”</p></div>`).join("")}
    </div>
  </div>
  ${foot(6, light)}
</section>

<section style="background:${light};color:${dark}">
  ${label("06 · Immagini e applicazioni", acc(light))}
  <p style="font-size:12pt;max-width:220mm;margin-bottom:8mm">${esc(b.imagery)}</p>
  <div class="grid" style="grid-template-columns:52mm 1fr 62mm;align-items:center;flex:1">
    <div style="width:52mm;height:52mm;border-radius:50%;background:${dark};display:flex;align-items:center;justify-content:center"><span class="mk" style="height:90px">${markDark}</span></div>
    <div class="card" style="background:${card};color:${light};height:58mm;display:flex;flex-direction:column;justify-content:space-between;max-width:100mm;margin:auto">
      ${logo(markDark, light, 26)}
      <p class="mono" style="opacity:.8">${esc(b.descriptor)}<br>Via di fantasia 1, Bologna</p>
    </div>
    <div style="width:62mm;height:62mm;background:${accent};color:${ink(accent)};padding:6mm;display:flex;flex-direction:column;justify-content:space-between;border-radius:2mm">
      <span class="mk" style="height:26px">${markOnAccent}</span>
      <p style="${display};font-size:19pt;line-height:1">${esc(b.tagline)}</p>
    </div>
  </div>
  <div style="display:flex;gap:4mm;flex-wrap:wrap;margin-top:6mm">${b.applications.map((a) => `<span class="mono" style="border:.3mm solid ${dark};padding:2mm 3mm;border-radius:10mm">${esc(a)}</span>`).join("")}</div>
  <p class="mono" style="opacity:.55;margin-top:3mm">Sottobicchiere / adesivo · biglietto da visita · post social</p>
  ${foot(7, light)}
</section>

<section style="background:${dark};color:${light};justify-content:space-between">
  ${logo(markDark, light, 40)}
  <div>
    <p style="${display};font-size:30pt;max-width:220mm">${esc(b.tagline)}</p>
    <p style="margin-top:8mm;max-width:200mm;opacity:.8">Brand identity e sito progettati da Dieci Bottega come concept non commissionato. Contenuti realizzati con assistenza AI e rivisti da noi.</p>
  </div>
  <div style="display:flex;justify-content:space-between;align-items:end">
    <p class="mono" style="color:${accent}">${DISCLAIMER}</p>
    <p class="mono" style="opacity:.7">diecibottega.it/concept/${slug}</p>
  </div>
</section>
</body></html>`;
}

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
for (const [slug, b] of Object.entries(BRANDS)) {
  const dir = join(root, "public", "concept", slug);
  await mkdir(dir, { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1123, height: 794 } });
  await page.setContent(html(slug, b), { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const out = join(dir, "brand-identity.pdf");
  await page.pdf({ path: out, width: "297mm", height: "210mm", printBackground: true, preferCSSPageSize: true });
  const cover = await page.screenshot({ clip: { x: 0, y: 0, width: 1123, height: 794 } });
  await sharp(cover).resize(1200).webp({ quality: 82 }).toFile(join(dir, "brand-cover.webp"));
  if (process.env.PREVIEW_DIR) {
    const secs = await page.$$("section");
    for (let i = 0; i < secs.length; i++) await secs[i].screenshot({ path: join(process.env.PREVIEW_DIR, `${slug}-${i + 1}.png`) });
  }
  console.log("✓", out.replace(root + "/", ""));
  await page.close();
}
await browser.close();
