/** Brand identity dei concept (fonte unica: concept-redesign/brands.json, usata anche per i PDF). */
import data from "@/concept-redesign/brands.json";

export interface ConceptBrand {
  name: string;
  fullName: string;
  descriptor: string;
  tagline: string;
  essence: string;
  palette: { name: string; hex: string; role: string; share: number }[];
  fonts: { family: string; role: string; spec: string }[];
  tone: { personality: string[]; description: string };
}

const BRANDS = data as unknown as Record<string, ConceptBrand>;

export function getConceptBrand(slug: string): ConceptBrand | undefined {
  return BRANDS[slug];
}
