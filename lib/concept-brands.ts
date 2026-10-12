/** Brand identity dei concept, dai brand book in public/concept/<slug>/brand-identity.pdf (fonte: concept-redesign/brands.json). */
import data from "@/concept-redesign/brands.json";

export interface ConceptBrand {
  name: string;
  fullName: string;
  descriptor: string;
  tagline: string;
  essence: string;
  promise: string;
  values: { title: string; text: string; habit: string }[];
  keySign: { title: string; text: string };
  logo: { svg: string; ratio: number; concept: string };
  palette: { name: string; hex: string; role: string; share: number }[];
  fonts: { family: string; role: string }[];
  tone: { personality: string[]; description: string; do: string[]; dont: string[] };
  quote: { context: string; text: string };
  theme: { bg: string; surface: string; fg: string; muted: string; accent: string; accentFg: string; line: string };
  /** Pagine del brand book esportate in public/concept/<slug>/book/<page>.webp */
  book: { page: string; title: string }[];
}

const BRANDS = data as Record<string, ConceptBrand>;

export function getConceptBrand(slug: string): ConceptBrand | undefined {
  return BRANDS[slug];
}
