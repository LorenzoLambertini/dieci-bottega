import Link from "next/link";
import { CONCEPTS, CONCEPT_DISCLAIMER } from "@/lib/concepts";
import { getConceptBrand } from "@/lib/concept-brands";
import { BrandMark } from "@/components/concept/BrandLogo";

/** Rimando ai concept redesign (/concept): separato dai lavori reali per clienti. Ogni card nei colori del suo brand. */
export default function ConceptTeaser({ tone = "obsidian" }: { tone?: "obsidian" | "ivory" }) {
  const dark = tone === "obsidian";
  const label = "font-mono text-[11px] uppercase tracking-[0.16em]";
  return (
    <section className={dark ? "bg-obsidian text-ivory" : "bg-ivory text-obsidian border-t border-obsidian/10"} aria-labelledby="concept-teaser">
      <div className="mx-auto max-w-[1480px] px-6 lg:px-12 py-20 lg:py-28">
        <div className="grid lg:grid-cols-12 gap-8 items-end mb-10">
          <div className="lg:col-span-7">
            <p className={`${label} text-rosewood mb-5`}>Concept · Prima e dopo</p>
            <h2 id="concept-teaser" className="font-archivo font-black uppercase tracking-tight leading-[0.9] text-4xl sm:text-5xl lg:text-7xl">
              Tre locali,<br /><span className={dark ? "text-ivory/40" : "text-obsidian/40"}>rifatti da zero.</span>
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className={`${dark ? "text-ivory/65" : "text-obsidian/65"} text-lg leading-relaxed`}>
              Logo, colori, brand book e sito nuovo per tre locali inventati, con i difetti che vediamo nei siti veri. Apri il prima, apri il dopo, confronta.
            </p>
            <p className={`mt-4 inline-block bg-[#F2B8A2] text-obsidian px-3 py-2 ${label} tracking-[0.1em]`}>{CONCEPT_DISCLAIMER}</p>
          </div>
        </div>
        <ul className="grid md:grid-cols-3 gap-4 lg:gap-6">
          {CONCEPTS.map((c) => {
            const b = getConceptBrand(c.slug);
            return (
              <li key={c.slug}>
                <Link
                  href={`/concept/${c.slug}`}
                  style={b ? { background: b.theme.bg, color: b.theme.fg } : undefined}
                  className="group relative flex flex-col h-full min-h-[340px] p-6 lg:p-8 overflow-hidden transition-transform duration-300 hover:-translate-y-1.5"
                >
                  {b && <BrandMark brand={b} height={150} className="absolute -right-4 -bottom-6 opacity-[0.14] transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3" />}
                  {b && <BrandMark brand={b} height={44} className="mb-6" />}
                  <p className={`${label} opacity-70 mb-2`}>{c.type}</p>
                  <p className="font-archivo font-black uppercase tracking-tight text-2xl leading-tight">{c.name}</p>
                  {b && <p className="mt-3 text-lg leading-snug opacity-90">{b.tagline}</p>}
                  <p className={`${label} mt-auto pt-8`}>Sito, logo e brand book →</p>
                </Link>
              </li>
            );
          })}
        </ul>
        <Link href="/concept" className={`inline-block mt-8 ${label} underline underline-offset-4 hover:text-rosewood transition-colors duration-200`}>
          Tutti i concept
        </Link>
      </div>
    </section>
  );
}
