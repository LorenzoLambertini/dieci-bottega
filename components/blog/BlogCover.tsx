/**
 * Copertina degli articoli in stile Dieci Bottega: colore pieno del brand, simbolo
 * gigante, texture a puntini. Stessa grafica dell'immagine di anteprima social
 * (app/(site)/blog/[slug]/opengraph-image.tsx).
 */
import type { BlogPost } from "@/lib/blog/types";

export const COVER_COLORS = {
  rosewood: { bg: "#E63B2E", fg: "#F4EFE6", glyph: "#F4EFE6", muted: "rgba(244,239,230,0.55)", dots: "rgba(244,239,230,0.10)" },
  obsidian: { bg: "#1A1414", fg: "#F4EFE6", glyph: "#E63B2E", muted: "rgba(244,239,230,0.45)", dots: "rgba(244,239,230,0.07)" },
  ivory: { bg: "#F4EFE6", fg: "#1A1414", glyph: "#E63B2E", muted: "rgba(26,20,20,0.45)", dots: "rgba(26,20,20,0.08)" },
} as const;

export function BlogCover({ post, title = false, className = "" }: { post: Pick<BlogPost, "cover" | "category" | "title">; title?: boolean; className?: string }) {
  const c = COVER_COLORS[post.cover.variant];
  return (
    <div
      className={`relative w-full aspect-[1200/630] overflow-hidden select-none ${post.cover.variant === "ivory" ? "ring-1 ring-inset ring-obsidian/15" : ""} ${className}`}
      style={{ background: c.bg, color: c.fg, containerType: "inline-size" }}
      aria-hidden
    >
      <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, ${c.dots} 1px, transparent 0)`, backgroundSize: "3.3cqw 3.3cqw" }} />
      <div className="absolute left-[5cqw] right-[5cqw] top-[5cqw] flex items-center justify-between font-mono uppercase" style={{ fontSize: "1.5cqw", letterSpacing: "0.16em", color: c.muted }}>
        <span className="flex items-center gap-[1.2cqw]">
          <span className="block h-px" style={{ width: "3cqw", background: c.muted }} />
          Dieci Bottega · Blog
        </span>
        <span>{post.category}</span>
      </div>
      <div
        className="absolute font-archivo font-black leading-none"
        style={{ right: "4cqw", bottom: title ? "20cqw" : "3cqw", fontSize: post.cover.glyph.length > 2 ? "22cqw" : "32cqw", letterSpacing: "-0.06em", color: c.glyph }}
      >
        {post.cover.glyph}
      </div>
      {post.cover.label && !title && (
        <div className="absolute left-[5cqw] bottom-[5cqw] font-mono uppercase" style={{ fontSize: "1.6cqw", letterSpacing: "0.14em", color: c.muted }}>
          {post.cover.label}
        </div>
      )}
      {title && (
        <div className="absolute left-[5cqw] right-[5cqw] bottom-[5cqw] font-archivo font-black uppercase" style={{ fontSize: "4.6cqw", lineHeight: 0.98, letterSpacing: "-0.03em" }}>
          {post.title}
        </div>
      )}
    </div>
  );
}
