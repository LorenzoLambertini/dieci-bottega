/** Blog di Dieci Bottega: tipi. Gli articoli sono file in lib/blog/posts (uno per articolo). */

export type BlogCategory = "Siti web" | "Prezzi" | "SEO e GEO" | "Google" | "CRM e automazioni" | "Settori";

export type CoverVariant = "rosewood" | "obsidian" | "ivory";

export interface BlogAuthor {
  id: "lorenzo" | "tommaso";
  name: string;
  role: string;
  bio: string;
}

export interface BlogPost {
  slug: string;
  /** Titolo H1 della pagina */
  title: string;
  /** Title tag per Google (max ~60 caratteri). Se assente si usa `title`. */
  seoTitle?: string;
  /** Meta description (140-160 caratteri) */
  description: string;
  category: BlogCategory;
  /** Parole chiave principali (la prima è la keyword primaria) */
  keywords: string[];
  publishedAt: string; // YYYY-MM-DD
  updatedAt?: string; // YYYY-MM-DD
  author: BlogAuthor["id"];
  /** Copertina generata in stile brand: simbolo grande + colore */
  cover: { glyph: string; variant: CoverVariant; label?: string };
  /** "In breve": risposta diretta in 3-5 punti (GEO: i motori AI citano questi riassunti) */
  tldr: string[];
  /** Corpo in Markdown semplice: ## / ###, elenchi, **grassetto**, [link](/percorso), > nota, tabelle */
  body: string;
  faq: { q: string; a: string }[];
  /** Slug di articoli collegati (link interni) */
  related?: string[];
}
