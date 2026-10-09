/**
 * Scarica da Pexels (licenza gratuita, uso commerciale consentito) le foto e i video dei concept,
 * li ottimizza e li salva in public/concept/<slug>/. Scrive i crediti in concept-redesign/CREDITS.md
 * e l'elenco dei file in concept-redesign/assets.json.
 *
 * Prerequisiti:
 *  - variabile PEXELS_API_KEY (chiave gratuita da https://www.pexels.com/api/)
 *  - rete aperta verso api.pexels.com, images.pexels.com, videos.pexels.com
 *  - ffmpeg (variabile FFMPEG_PATH se non è nel PATH)
 * Uso: npm run concept:assets            (salta i file già scaricati)
 *      FORCE=1 npm run concept:assets    (riscarica tutto)
 *
 * Per ogni foto produce:
 *  - <nome>-640.webp, <nome>-1024.webp, <nome>-1600.webp  → per i siti "dopo" (srcset)
 *  - <nome>-full.jpg (originale pesante, ~3000px)          → per i siti "prima", lenti di proposito
 * Per ogni video: <nome>.mp4 (H.264) e <nome>.webm (VP9), 720p, 10 s, senza audio, < 3 MB, più <nome>-poster.webp.
 */
import { execFileSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const KEY = process.env.PEXELS_API_KEY;
const FFMPEG = process.env.FFMPEG_PATH ?? "ffmpeg";
const FORCE = process.env.FORCE === "1";
const WIDTHS = [640, 1024, 1600];
const MAX_VIDEO_BYTES = 3 * 1024 * 1024;

/** Cosa serve a ogni concept. alt: testo alternativo in italiano. */
export const MANIFEST = {
  "lantern-pub": {
    photos: [
      { name: "interno", query: "cozy pub interior warm light", orientation: "landscape", alt: "Interno di un pub con luci calde e banco in legno" },
      { name: "dehors", query: "outdoor terrace string lights evening bar", orientation: "landscape", alt: "Tavoli all'aperto illuminati da lucine la sera" },
      { name: "spine", query: "beer taps bar", orientation: "landscape", alt: "Spine di birra sul bancone" },
      { name: "bicchieri", query: "glasses of different beers", orientation: "landscape", alt: "Bicchieri di birre di colori diversi" },
      { name: "pinta", query: "pint of beer on table", orientation: "landscape", alt: "Una pinta di birra chiara sul tavolo" },
    ],
    video: { name: "hero", query: "pouring beer slow motion", alt: "Birra spillata al rallentatore" },
  },
  "pizzeria-brace": {
    photos: [
      { name: "margherita", query: "pizza margherita top view", orientation: "landscape", alt: "Pizza margherita vista dall'alto" },
      { name: "forno", query: "wood fired pizza oven fire", orientation: "landscape", alt: "Forno a legna acceso con le fiamme" },
      { name: "pala", query: "pizza peel oven", orientation: "landscape", alt: "Pala che inforna una pizza nel forno a legna" },
      { name: "asporto", query: "pizza box takeaway", orientation: "landscape", alt: "Pizze da asporto nei cartoni" },
      { name: "ig-1", query: "neapolitan pizza", orientation: "square", alt: "Pizza napoletana appena sfornata" },
      { name: "ig-2", query: "pizza slice cheese", orientation: "square", alt: "Fetta di pizza con mozzarella filante" },
      { name: "ig-3", query: "pizza dough hands", orientation: "square", alt: "Mani che stendono l'impasto della pizza" },
    ],
    video: { name: "hero", query: "pizza wood fired oven", alt: "Pizza che cuoce nel forno a legna" },
  },
  "trattoria-portico": {
    photos: [
      { name: "sala", query: "traditional italian trattoria dining room", orientation: "landscape", alt: "La sala della trattoria apparecchiata" },
      { name: "tagliatelle", query: "tagliatelle bolognese ragu", orientation: "landscape", alt: "Piatto di tagliatelle al ragù" },
      { name: "tortellini", query: "tortellini", orientation: "landscape", alt: "Tortellini fatti a mano" },
      { name: "sfoglia", query: "fresh pasta rolling pin", orientation: "landscape", alt: "Sfoglia tirata col mattarello" },
      { name: "portico", query: "bologna porticoes night", orientation: "landscape", alt: "Portico di Bologna la sera" },
    ],
    video: { name: "hero", query: "hands rolling pasta dough", alt: "Mani che tirano la sfoglia col mattarello" },
  },
};

async function pexels(path) {
  const res = await fetch(`https://api.pexels.com${path}`, { headers: { Authorization: KEY } });
  if (!res.ok) throw new Error(`Pexels ${res.status} su ${path}`);
  return res.json();
}

async function download(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${res.status} ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

const used = new Set();

async function photo(slug, p, dir) {
  const files = [...WIDTHS.map((w) => `${p.name}-${w}.webp`), `${p.name}-full.jpg`];
  const data = await pexels(`/v1/search?query=${encodeURIComponent(p.query)}&orientation=${p.orientation}&per_page=15&locale=it-IT`);
  const pick = data.photos.find((ph) => !used.has(ph.id));
  if (!pick) throw new Error(`nessuna foto per "${p.query}"`);
  used.add(pick.id);
  if (FORCE || !files.every((f) => existsSync(join(dir, f)))) {
    const original = await download(pick.src.original);
    // "prima": l'originale ridotto a 3000px ma pesante (qualità alta, niente WebP)
    await sharp(original).resize({ width: 3000, withoutEnlargement: true }).jpeg({ quality: 92 }).toFile(join(dir, `${p.name}-full.jpg`));
    for (const w of WIDTHS) await sharp(original).resize({ width: w, withoutEnlargement: true }).webp({ quality: 74 }).toFile(join(dir, `${p.name}-${w}.webp`));
  }
  const meta = await sharp(join(dir, `${p.name}-1600.webp`)).metadata();
  return {
    kind: "photo", slug, name: p.name, alt: p.alt, files, width: meta.width, height: meta.height,
    credit: { author: pick.photographer, authorUrl: pick.photographer_url, source: pick.url },
  };
}

function ffmpeg(args) { execFileSync(FFMPEG, ["-y", "-loglevel", "error", ...args], { stdio: "inherit" }); }

async function video(slug, v, dir) {
  const mp4 = join(dir, `${v.name}.mp4`), webm = join(dir, `${v.name}.webm`), poster = join(dir, `${v.name}-poster.webp`);
  const data = await pexels(`/videos/search?query=${encodeURIComponent(v.query)}&orientation=landscape&per_page=15`);
  const pick = data.videos.find((x) => x.duration >= 10 && x.video_files.some((f) => f.width >= 1280));
  if (!pick) throw new Error(`nessun video per "${v.query}"`);
  if (FORCE || ![mp4, webm, poster].every(existsSync)) {
    const file = pick.video_files.filter((f) => f.width >= 1280 && f.file_type === "video/mp4").sort((a, b) => a.width - b.width)[0];
    const src = join(dir, `${v.name}-source.mp4`);
    await writeFile(src, await download(file.link));
    for (const crf of [28, 32, 36]) {
      ffmpeg(["-ss", "1", "-t", "10", "-i", src, "-an", "-vf", "scale=-2:720,fps=25", "-c:v", "libx264", "-preset", "slow", "-crf", String(crf), "-pix_fmt", "yuv420p", "-movflags", "+faststart", mp4]);
      if (statSync(mp4).size < MAX_VIDEO_BYTES) break;
    }
    for (const crf of [38, 42, 46]) {
      ffmpeg(["-ss", "1", "-t", "10", "-i", src, "-an", "-vf", "scale=-2:720,fps=25", "-c:v", "libvpx-vp9", "-crf", String(crf), "-b:v", "0", "-row-mt", "1", webm]);
      if (statSync(webm).size < MAX_VIDEO_BYTES) break;
    }
    const frame = join(dir, `${v.name}-poster.png`);
    ffmpeg(["-i", mp4, "-frames:v", "1", frame]);
    await sharp(frame).webp({ quality: 78 }).toFile(poster);
    execFileSync("rm", ["-f", src, frame]);
  }
  return {
    kind: "video", slug, name: v.name, alt: v.alt, files: [`${v.name}.mp4`, `${v.name}.webm`, `${v.name}-poster.webp`],
    sizes: { mp4: statSync(mp4).size, webm: statSync(webm).size },
    credit: { author: pick.user?.name, authorUrl: pick.user?.url, source: pick.url },
  };
}

if (!KEY) {
  console.error("Manca PEXELS_API_KEY: crea una chiave gratuita su https://www.pexels.com/api/ e aggiungila alle variabili d'ambiente.");
  process.exit(1);
}

const all = [];
for (const [slug, m] of Object.entries(MANIFEST)) {
  const dir = join(root, "public", "concept", slug, "media");
  await mkdir(dir, { recursive: true });
  for (const p of m.photos) { console.log(`→ ${slug}/${p.name}`); all.push(await photo(slug, p, dir)); }
  console.log(`→ ${slug}/video`); all.push(await video(slug, m.video, dir));
}

await writeFile(join(here, "assets.json"), JSON.stringify(all, null, 2) + "\n");
const credits = ["# Crediti foto e video dei concept", "", "Tutto da [Pexels](https://www.pexels.com), licenza gratuita con uso commerciale consentito (https://www.pexels.com/license/).", ""]
  .concat(Object.keys(MANIFEST).flatMap((slug) => [`## ${slug}`, "", ...all.filter((a) => a.slug === slug).map((a) =>
    `- \`public/concept/${slug}/media/${a.files[0].replace(/-640\.webp$/, "-*")}\`: ${a.alt}. Di [${a.credit.author}](${a.credit.authorUrl}), [fonte](${a.credit.source})`), ""]));
await writeFile(join(here, "CREDITS.md"), credits.join("\n"));
console.log("✓ assets.json e CREDITS.md aggiornati. Ora controlla le foto (niente volti in primo piano, niente insegne o loghi reali).");
