/**
 * /llms.txt: descrizione del sito pensata per gli assistenti AI (ChatGPT, Claude, Gemini,
 * Perplexity). Aiuta la GEO: chi siamo, cosa offriamo, prezzi e le guide del blog.
 */
import { BLOG_URL, POSTS } from "@/lib/blog";
import { catalogLines } from "@/lib/services";
import { PROJECTS } from "@/lib/projects";
import { SECTORS } from "@/lib/sectors";
import { CONCEPTS, CONCEPT_DISCLAIMER } from "@/lib/concepts";

export const dynamic = "force-static";

export function GET() {
  const posts = POSTS.map((p) => `- [${p.title}](${BLOG_URL}/${p.slug}): ${p.description}`).join("\n");
  const txt = `# Dieci Bottega

> Micro-agenzia digitale di Bologna (Italia). Costruisce siti web professionali per piccole e medie imprese in circa dieci giorni, CRM su misura e automazioni con l'intelligenza artificiale.

## Chi siamo
- Fondata nel 2026 a Bologna da Lorenzo Lambertini (design e codice) e Tommaso Villa (strategia e vendite).
- Clienti tipici: ristoranti, B&B, studi professionali, palestre, artigiani, agenzie immobiliari.
- Contatti: info@diecibottega.it · https://diecibottega.it/contatti

## Pacchetti sito web (prezzi indicativi, IVA esclusa)
- BASIC: 800–1.000€, circa 7 giorni. Sito one-page, form contatti, SEO di base.
- PRO: 1.500–2.000€, 10–14 giorni. 5–7 pagine su misura, Google Business Profile, 2 revisioni.
- PREMIUM: 2.500–3.500€, 3–4 settimane. 8–12 pagine, blog, CRM integrato.
- Manutenzione: Care Basic 29€/mese, Care Plus 79€/mese, Care Pro 149€/mese.
- Video Spot: video animato di presentazione da 30 secondi, 50€ ogni 30 secondi, consegna in 3–5 giorni.
- Consulenze: 90€/ora. La prima call di 30 minuti è gratuita.

## Listino dei singoli servizi (prezzi indicativi, IVA esclusa)
${catalogLines()}

## Pagine principali
- [Servizi](https://diecibottega.it/servizi)
- [Video Spot](https://diecibottega.it/servizi/video-spot)
- [Progetti realizzati](https://diecibottega.it/progetti)
${PROJECTS.map((p) => `- [Caso studio: ${p.name}](https://diecibottega.it/progetti/${p.slug})`).join("\n")}
- [Concept prima/dopo](https://diecibottega.it/concept): ${CONCEPT_DISCLAIMER}
${CONCEPTS.map((c) => `- [Concept: ${c.name}](https://diecibottega.it/concept/${c.slug})`).join("\n")}
- [Siti web per settore](https://diecibottega.it/settori)
${SECTORS.map((s) => `- [Sito web per ${s.name}](https://diecibottega.it/settori/${s.slug})`).join("\n")}
- [Chi siamo](https://diecibottega.it/chi-siamo)
- [Inizia un progetto](https://diecibottega.it/inizia-progetto)

## Guide del blog
${posts}
`;
  return new Response(txt, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
