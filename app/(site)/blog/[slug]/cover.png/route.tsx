/**
 * Immagine di copertina/anteprima social dell'articolo (WhatsApp, Facebook, LinkedIn, Google):
 * /blog/<slug>/cover.png, stessa grafica della copertina nella pagina.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { getPost, POSTS } from "@/lib/blog";
import { COVER_COLORS } from "@/components/blog/BlogCover";

const size = { width: 1200, height: 630 };

export const dynamic = "force-static";

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getPost(slug);
  const cover = p?.cover ?? { glyph: "10", variant: "rosewood" as const };
  const c = COVER_COLORS[cover.variant];
  const title = p?.title ?? "Il blog di Dieci Bottega";
  // Archivo Black, il carattere dei titoli del sito (SIL Open Font License)
  const archivo = await readFile(path.join(process.cwd(), "lib/blog/fonts/archivo-black-latin.woff"));
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: c.bg, color: c.fg, fontFamily: "Archivo" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle at 1px 1px, ${c.dots} 1px, transparent 0)`, backgroundSize: "40px 40px" }} />
        <div style={{ position: "absolute", left: 60, right: 60, top: 56, display: "flex", justifyContent: "space-between", fontSize: 18, letterSpacing: 3, color: c.muted, fontFamily: "monospace", textTransform: "uppercase" }}>
          <span>— Dieci Bottega · Blog</span>
          <span>{p?.category ?? ""}</span>
        </div>
        <div style={{ position: "absolute", right: 50, top: 70, fontSize: cover.glyph.length > 2 ? 230 : 330, fontWeight: 900, letterSpacing: -14, color: c.glyph, lineHeight: 1 }}>
          {cover.glyph}
        </div>
        <div style={{ position: "absolute", left: 60, right: 60, bottom: 56, display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: title.length > 60 ? 50 : 60, fontWeight: 900, lineHeight: 1, letterSpacing: -2, textTransform: "uppercase", maxWidth: 1000 }}>{title}</div>
          <div style={{ fontSize: 18, letterSpacing: 3, color: c.muted, fontFamily: "monospace", textTransform: "uppercase" }}>diecibottega.it/blog</div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Archivo", data: archivo, weight: 900, style: "normal" }] }
  );
}
