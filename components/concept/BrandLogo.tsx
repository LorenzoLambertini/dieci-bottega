import type { ConceptBrand } from "@/lib/concept-brands";
import { BRAND_TYPE } from "@/lib/concept-fonts";

/** Simbolo del brand (SVG dal brand book, colore da currentColor). */
export function BrandMark({ brand, height, className = "" }: { brand: ConceptBrand; height: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 [&>svg]:w-full [&>svg]:h-full ${className}`}
      style={{ height, width: Math.round(height * brand.logo.ratio) }}
      dangerouslySetInnerHTML={{ __html: brand.logo.svg }}
    />
  );
}

/** Logo completo: simbolo e logotipo, nel carattere del brand. Il colore arriva da `color`. */
export default function BrandLogo({ slug, brand, size = 48, as: Tag = "span", className = "" }: { slug: string; brand: ConceptBrand; size?: number; as?: "span" | "h1" | "h2" | "h3"; className?: string }) {
  const type = BRAND_TYPE[slug]?.display ?? {};
  if (slug === "trattoria-portico") {
    return (
      <Tag className={`flex items-center m-0 font-normal ${className}`} style={{ gap: size * 0.3 }}>
        <BrandMark brand={brand} height={size} />
        <span className="grid leading-none" style={{ fontFamily: "var(--font-portico)" }}>
          <span style={{ fontSize: size * 0.2, letterSpacing: "0.32em", opacity: 0.7, marginBottom: size * 0.08 }}>TRATTORIA</span>
          <span style={{ fontSize: size * 0.56, fontVariationSettings: "'opsz' 48", fontWeight: 400 }}>del Portico</span>
        </span>
      </Tag>
    );
  }
  const markH = slug === "lantern-pub" ? size * 1.15 : size * 0.8;
  return (
    <Tag className={`flex items-center m-0 font-normal ${className}`} style={{ gap: size * 0.28 }}>
      <BrandMark brand={brand} height={markH} />
      <span style={{ ...type, fontSize: size * (slug === "lantern-pub" ? 0.86 : 0.74), lineHeight: 1 }}>{slug === "pizzeria-brace" ? "BRACE" : brand.name}</span>
    </Tag>
  );
}
