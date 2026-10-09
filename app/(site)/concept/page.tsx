import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { CONCEPTS } from "@/lib/concepts";
import { conceptShots } from "@/lib/concept-assets";
import ConceptDisclaimer from "@/components/ConceptDisclaimer";
import { ConceptThumb } from "@/components/ConceptPreview";

export const metadata: Metadata = {
  title: "Concept: siti di locali rifatti da Dieci Bottega",
  description:
    "Tre concept redesign non commissionati per locali di fantasia a Bologna: un pub, una pizzeria e una trattoria. Cosa non funzionava e come lo abbiamo rifatto.",
  alternates: { canonical: "/concept" },
};

const label = "font-mono text-[11px] uppercase tracking-[0.16em]";
const VARIANTS = ["bg-rosewood text-ivory", "bg-obsidian text-[#F2B8A2]", "bg-[#E8E2D6] text-rosewood"];

export default function ConceptIndex() {
  return (
    <div className="blog-body pt-16 lg:pt-[72px] bg-ivory text-obsidian">
      <section className="mx-auto max-w-[1480px] px-6 lg:px-12 pt-12 lg:pt-20 pb-24">
        <ConceptDisclaimer className="mb-8" />
        <p className={`${label} text-rosewood mb-6`}>Concept · Prima e dopo</p>
        <div className="grid lg:grid-cols-12 gap-8 items-end mb-14">
          <h1 className="lg:col-span-7 font-archivo font-black uppercase tracking-tight text-5xl sm:text-6xl lg:text-8xl leading-[0.9]">
            Come lo<br /><span className="text-obsidian/40">rifaremmo noi.</span>
          </h1>
          <p className="lg:col-span-5 text-obsidian/65 text-lg leading-relaxed">
            Tre locali inventati, con i problemi che vediamo ogni giorno nei siti veri. Per ognuno: cosa non funziona,
            cosa abbiamo cambiato e perché. I siti si possono aprire e provare.
          </p>
        </div>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {CONCEPTS.map((c, i) => {
            const shots = conceptShots(c.slug);
            return (
              <li key={c.slug}>
                <Link href={`/concept/${c.slug}`} className="group block">
                  <div className={`relative aspect-[16/10] overflow-hidden mb-4 ${shots ? "bg-obsidian" : VARIANTS[i % 3]}`}>
                    {shots ? (
                      <Image src={shots.dopo.desktop} alt={`Il nuovo sito di ${c.name}, concept di Dieci Bottega`} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]" />
                    ) : (
                      <ConceptThumb slug={c.slug} name={c.name} />
                    )}
                  </div>
                  <p className={`${label} text-obsidian/45 mb-1.5`}>{c.type}</p>
                  <h2 className="font-archivo font-black uppercase tracking-tight text-xl leading-tight group-hover:text-rosewood transition-colors duration-200">{c.name}</h2>
                  <p className="text-obsidian/60 mt-2 leading-relaxed">{c.pitch}</p>
                  <p className={`${label} text-rosewood mt-3`}>{c.keyFeature} →</p>
                </Link>
              </li>
            );
          })}
        </ul>
        <p className="mt-16 text-obsidian/50 text-sm max-w-2xl">
          I testi e i siti dei concept sono stati realizzati con l&apos;assistenza dell&apos;intelligenza artificiale e rivisti da noi.
          Nomi, indirizzi, telefoni e recensioni sono inventati. Le foto nei siti demo sono stock con licenza gratuita.
        </p>
      </section>
    </div>
  );
}
