import Link from "next/link";
import type { Metadata } from "next";
import { CONCEPTS } from "@/lib/concepts";
import { getConceptBrand } from "@/lib/concept-brands";
import { BRAND_TYPE, conceptFontVars } from "@/lib/concept-fonts";
import ConceptDisclaimer from "@/components/ConceptDisclaimer";
import { ConceptThumb } from "@/components/ConceptPreview";
import BrandLogo from "@/components/concept/BrandLogo";

export const metadata: Metadata = {
  title: "Concept: siti e brand di locali rifatti da Dieci Bottega",
  description:
    "Tre concept redesign non commissionati per locali di fantasia a Bologna: un pub, una pizzeria e una trattoria. Sito nuovo, logo e brand book, con il prima e il dopo da provare.",
  alternates: { canonical: "/concept" },
};

const label = "font-mono text-[11px] uppercase tracking-[0.16em]";

export default function ConceptIndex() {
  return (
    <div className={`blog-body pt-16 lg:pt-[72px] bg-ivory text-obsidian ${conceptFontVars}`}>
      <section className="mx-auto max-w-[1480px] px-6 lg:px-12 pt-12 lg:pt-20 pb-14">
        <ConceptDisclaimer className="mb-8" />
        <p className={`${label} text-rosewood mb-6`}>Concept · Prima e dopo</p>
        <div className="grid lg:grid-cols-12 gap-8 items-end">
          <h1 className="lg:col-span-7 font-archivo font-black uppercase tracking-tight text-5xl sm:text-6xl lg:text-8xl leading-[0.9]">
            Tre locali.<br /><span className="text-obsidian/40">Tre brand nuovi.</span>
          </h1>
          <div className="lg:col-span-5">
            <p className="text-obsidian/65 text-lg leading-relaxed">
              Locali inventati, con i problemi che vediamo ogni giorno nei siti veri. Per ognuno abbiamo rifatto tutto:
              logo, colori, tono di voce, brand book e sito. I siti si aprono e si provano, il prima e il dopo si confrontano dal vivo.
            </p>
            <ul className="flex flex-wrap gap-2 mt-5" aria-label="Cosa trovi in ogni concept">
              {["Sito da provare", "Logo", "Brand book PDF", "Prima e dopo"].map((x) => (
                <li key={x} className={`${label} border border-obsidian/15 px-3 py-1.5 text-obsidian/70`}>{x}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <ul className="space-y-0">
        {CONCEPTS.map((c, i) => {
          const b = getConceptBrand(c.slug);
          const t = b?.theme;
          return (
            <li key={c.slug} style={t ? { background: t.bg, color: t.fg } : undefined} className={t ? "" : "bg-obsidian text-ivory"}>
              <Link href={`/concept/${c.slug}`} className="group block mx-auto max-w-[1480px] px-6 lg:px-12 py-14 lg:py-20">
                <div className={`grid lg:grid-cols-12 gap-10 lg:gap-14 items-center`}>
                  <div className={`lg:col-span-5 ${i % 2 ? "lg:order-2" : ""}`}>
                    <p className={`${label} opacity-70 mb-6`}>{String(i + 1).padStart(2, "0")} · {b?.descriptor ?? c.type}</p>
                    {b ? <BrandLogo slug={c.slug} brand={b} size={52} as="h2" /> : <h2 className="font-archivo font-black uppercase text-4xl">{c.name}</h2>}
                    {b && <p className="mt-8 text-[clamp(2rem,4.2vw,3.5rem)]" style={BRAND_TYPE[c.slug]?.display}>{b.tagline}</p>}
                    <p className="mt-5 opacity-75 text-lg leading-relaxed max-w-[46ch]">{c.pitch}</p>
                    {b && (
                      <div className="flex h-3 mt-8 max-w-[360px] rounded-full overflow-hidden" style={t ? { boxShadow: `0 0 0 1px ${t.line}` } : undefined} aria-hidden>
                        {b.palette.map((p) => <span key={p.hex} style={{ background: p.hex, width: `${p.share}%` }} />)}
                      </div>
                    )}
                    <p className={`${label} mt-8 inline-flex items-center gap-2 border-b pb-1`} style={t ? { borderColor: t.line } : undefined}>
                      Apri il caso studio <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </p>
                  </div>
                  <div className={`lg:col-span-7 ${i % 2 ? "lg:order-1" : ""}`}>
                    <div className="rounded-lg overflow-hidden shadow-[0_30px_80px_-25px_rgba(0,0,0,.6)] transition-transform duration-500 group-hover:-translate-y-1.5 bg-[#0d0d0d]">
                      <div className="flex items-center gap-1.5 px-3 h-7" aria-hidden>
                        <span className="w-2 h-2 rounded-full bg-white/25" /><span className="w-2 h-2 rounded-full bg-white/25" /><span className="w-2 h-2 rounded-full bg-white/25" />
                      </div>
                      <div className="relative aspect-[16/10]">
                        <ConceptThumb slug={c.slug} name={c.name} />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <section className="mx-auto max-w-[1480px] px-6 lg:px-12 py-16">
        <ConceptDisclaimer />
        <p className="mt-6 text-obsidian/50 text-sm max-w-2xl">
          I testi, i siti e i brand book dei concept sono stati realizzati con l&apos;assistenza dell&apos;intelligenza artificiale e rivisti da noi.
          Nomi, indirizzi, telefoni e recensioni sono inventati. Le foto nei siti demo sono stock con licenza gratuita.
        </p>
      </section>
    </div>
  );
}
