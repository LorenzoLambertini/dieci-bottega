import Link from "next/link";
import { CONCEPTS, CONCEPT_DISCLAIMER } from "@/lib/concepts";

/** Rimando ai concept redesign (/concept): separato dai lavori reali per clienti. */
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
              Come rifaremmo<br /><span className={dark ? "text-ivory/40" : "text-obsidian/40"}>il sito di un locale.</span>
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className={`${dark ? "text-ivory/65" : "text-obsidian/65"} text-lg leading-relaxed`}>
              Tre locali inventati, con i difetti che vediamo nei siti veri. Apri il prima, apri il dopo, confronta.
            </p>
            <p className={`mt-4 inline-block bg-[#F2B8A2] text-obsidian px-3 py-2 ${label} tracking-[0.1em]`}>{CONCEPT_DISCLAIMER}</p>
          </div>
        </div>
        <ul className="grid md:grid-cols-3 gap-px bg-current/10">
          {CONCEPTS.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/concept/${c.slug}`}
                className={`group block h-full p-6 lg:p-8 border ${dark ? "border-ivory/12 hover:border-rosewood" : "border-obsidian/10 hover:border-rosewood"} transition-colors duration-200`}
              >
                <p className={`${label} ${dark ? "text-ivory/45" : "text-obsidian/45"} mb-3`}>{c.type}</p>
                <p className="font-archivo font-black uppercase tracking-tight text-2xl leading-tight group-hover:text-rosewood transition-colors duration-200">{c.name}</p>
                <p className={`${dark ? "text-ivory/60" : "text-obsidian/60"} mt-3 leading-relaxed`}>{c.pitch}</p>
                <p className={`${label} text-rosewood mt-5`}>Il caso studio →</p>
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/concept" className={`inline-block mt-8 ${label} underline underline-offset-4 hover:text-rosewood transition-colors duration-200`}>
          Tutti i concept
        </Link>
      </div>
    </section>
  );
}
