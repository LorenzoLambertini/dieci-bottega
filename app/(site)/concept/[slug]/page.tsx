import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CONCEPTS, CONCEPT_DISCLAIMER, getConcept } from "@/lib/concepts";
import { CONCEPT_METRICS, type LighthouseRun } from "@/lib/concept-metrics";
import { conceptShots } from "@/lib/concept-assets";
import { whatsappUrl } from "@/lib/contacts";
import BeforeAfter from "@/components/ui/BeforeAfter";
import ConceptDisclaimer from "@/components/ConceptDisclaimer";

const SITE = "https://diecibottega.it";

export function generateStaticParams() {
  return CONCEPTS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = getConcept(slug);
  if (!c) return {};
  const shots = conceptShots(c.slug);
  return {
    title: c.seoTitle,
    description: c.description,
    alternates: { canonical: `/concept/${c.slug}` },
    openGraph: {
      type: "article",
      url: `${SITE}/concept/${c.slug}`,
      title: c.seoTitle,
      description: c.description,
      locale: "it_IT",
      siteName: "Dieci Bottega",
      ...(shots ? { images: [{ url: shots.dopo.desktop, width: 1600, height: 900, alt: `Il nuovo sito di ${c.name}` }] } : {}),
    },
  };
}

const label = "font-mono text-[11px] uppercase tracking-[0.16em]";
const h2 = "font-archivo font-bold uppercase tracking-tight text-obsidian text-2xl lg:text-4xl leading-[0.95] mb-6";
const btnDark = "inline-flex items-center gap-2 bg-obsidian text-ivory hover:bg-rosewood transition-colors duration-200 px-5 py-3.5 font-mono text-[11px] uppercase tracking-[0.12em]";
const btnLine = "inline-flex items-center gap-2 border border-obsidian/25 text-obsidian hover:bg-obsidian hover:text-ivory transition-colors duration-200 px-5 py-3.5 font-mono text-[11px] uppercase tracking-[0.12em]";

const ROWS: { key: keyof LighthouseRun; label: string; fmt: (v: number) => string; better: "up" | "down" }[] = [
  { key: "performance", label: "Prestazioni", fmt: (v) => `${v}/100`, better: "up" },
  { key: "accessibility", label: "Accessibilità", fmt: (v) => `${v}/100`, better: "up" },
  { key: "bestPractices", label: "Buone pratiche", fmt: (v) => `${v}/100`, better: "up" },
  { key: "seo", label: "SEO", fmt: (v) => `${v}/100`, better: "up" },
  { key: "lcp", label: "Contenuto principale visibile (LCP)", fmt: (v) => `${(v / 1000).toFixed(1).replace(".", ",")} s`, better: "down" },
  { key: "tbt", label: "Tempo di blocco (TBT)", fmt: (v) => `${Math.round(v)} ms`, better: "down" },
  { key: "cls", label: "Stabilità della pagina (CLS)", fmt: (v) => v.toFixed(3).replace(".", ","), better: "down" },
  { key: "bytes", label: "Peso della pagina", fmt: (v) => (v >= 1e6 ? `${(v / 1e6).toFixed(1).replace(".", ",")} MB` : `${Math.round(v / 1000)} KB`), better: "down" },
  { key: "requests", label: "Richieste", fmt: (v) => String(v), better: "down" },
];

export default async function ConceptPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getConcept(slug);
  if (!c) notFound();
  const shots = conceptShots(c.slug);
  const metrics = CONCEPT_METRICS[c.slug];
  const others = CONCEPTS.filter((x) => x.slug !== c.slug);
  const url = `${SITE}/concept/${c.slug}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: `${c.name}: concept redesign`,
      headline: c.seoTitle,
      description: `${c.description} ${CONCEPT_DISCLAIMER}`,
      url,
      inLanguage: "it-IT",
      genre: "Concept non commissionato",
      creator: { "@type": "Organization", name: "Dieci Bottega", url: SITE },
      ...(shots ? { image: `${SITE}${shots.dopo.desktop}` } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE },
        { "@type": "ListItem", position: 2, name: "Concept", item: `${SITE}/concept` },
        { "@type": "ListItem", position: 3, name: c.name, item: url },
      ],
    },
  ];

  return (
    <div className="blog-body pt-16 lg:pt-[72px] bg-ivory text-obsidian">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="mx-auto max-w-[1180px] px-6 lg:px-12 pt-12 lg:pt-20 pb-24">
        <nav className={`${label} text-obsidian/45 mb-6`} aria-label="Percorso">
          <Link href="/progetti" className="hover:text-rosewood">Progetti</Link>
          <span className="mx-2">/</span>
          <Link href="/concept" className="hover:text-rosewood">Concept</Link>
          <span className="mx-2">/</span>
          <span>{c.name}</span>
        </nav>
        <ConceptDisclaimer className="mb-8" />

        <header className="max-w-[900px]">
          <p className={`${label} text-rosewood mb-4`}>{c.type} · Concept</p>
          <h1 className="font-archivo font-black uppercase tracking-tight text-5xl sm:text-6xl lg:text-8xl leading-[0.9]">{c.name}</h1>
          <p className="text-obsidian/65 text-lg lg:text-xl mt-6 leading-relaxed">{c.pitch}</p>
          <div className="flex flex-wrap gap-3 mt-8">
            <a href={`/concept/${c.slug}/dopo`} target="_blank" rel="noopener" className={btnDark}>Prova il sito nuovo ↗</a>
            <a href={`/concept/${c.slug}/prima`} target="_blank" rel="noopener" className={btnLine}>{c.primaLabel} ↗</a>
          </div>
        </header>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_300px] gap-12 lg:gap-16 mt-16 lg:mt-20">
          <div className="min-w-0 max-w-[760px] text-[1.075rem] leading-[1.8] text-obsidian/80">
            <section>
              <h2 className={h2}>Il punto di partenza</h2>
              <ul className="space-y-3">
                {c.problems.map((p) => (
                  <li key={p} className="relative pl-6">
                    <span className="absolute left-0 top-[0.85em] w-2.5 h-px bg-rosewood" aria-hidden />
                    {p}
                  </li>
                ))}
              </ul>
            </section>

            {shots && (
              <section className="mt-14">
                <h2 className={h2}>Prima e dopo</h2>
                <p className="mb-6 text-obsidian/60">Trascina il cursore per confrontare le due versioni.</p>
                <BeforeAfter
                  before={{ ...shots.prima, alt: `${c.primaLabel} di ${c.name} (attività di fantasia)` }}
                  after={{ ...shots.dopo, alt: `Il nuovo sito di ${c.name} progettato da Dieci Bottega (attività di fantasia)` }}
                  beforeLabel="◆ PRIMA"
                  afterLabel="◆ DOPO · concept Dieci Bottega"
                />
              </section>
            )}

            <section className="mt-14">
              <h2 className={h2}>Cosa abbiamo cambiato e perché</h2>
              <p className={`${label} text-rosewood mb-4`}>L&apos;elemento chiave: {c.keyFeature}</p>
              <ul className="grid sm:grid-cols-2 gap-px bg-obsidian/10 border border-obsidian/10">
                {c.choices.map((ch) => (
                  <li key={ch.title} className="bg-ivory p-5 lg:p-6 sm:[&:last-child:nth-child(odd)]:col-span-2">
                    <p className="font-archivo font-bold text-obsidian text-base leading-snug mb-1.5">{ch.title}</p>
                    <p className="text-obsidian/65 text-[0.95rem] leading-relaxed">{ch.why}</p>
                  </li>
                ))}
              </ul>
            </section>

            {metrics && (
              <section className="mt-14" aria-labelledby="misure">
                <h2 id="misure" className={h2}>Le misure</h2>
                <p className="mb-6 text-obsidian/60">
                  Lighthouse da telefono, mediana di tre misure per pagina, rilevate il{" "}
                  {new Date(metrics.measuredAt).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}.
                </p>
                <div className="overflow-x-auto border border-obsidian/10">
                  <table className="w-full text-[0.95rem]">
                    <thead className="bg-obsidian text-ivory">
                      <tr>
                        <th className={`${label} text-left px-4 py-3 font-medium`}>Misura</th>
                        <th className={`${label} text-right px-4 py-3 font-medium`}>Prima</th>
                        <th className={`${label} text-right px-4 py-3 font-medium`}>Dopo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ROWS.map((r) => {
                        const a = metrics.prima[r.key], b = metrics.dopo[r.key];
                        const improved = r.better === "up" ? b > a : b < a;
                        return (
                          <tr key={r.key} className="border-t border-obsidian/10">
                            <td className="px-4 py-3">{r.label}</td>
                            <td className="px-4 py-3 text-right tabular-nums text-obsidian/60">{r.fmt(a)}</td>
                            <td className={`px-4 py-3 text-right tabular-nums font-semibold ${improved ? "text-rosewood" : ""}`}>{r.fmt(b)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>

          <aside className="lg:sticky lg:top-28 self-start space-y-8">
            <div>
              <p className={`${label} text-obsidian/45 mb-3`}>Provalo</p>
              <div className="flex flex-col gap-2">
                <a href={`/concept/${c.slug}/dopo`} target="_blank" rel="noopener" className={btnDark}>Il sito nuovo ↗</a>
                <a href={`/concept/${c.slug}/prima`} target="_blank" rel="noopener" className={btnLine}>Com&apos;era prima ↗</a>
              </div>
            </div>
            <p className="text-obsidian/50 text-sm leading-relaxed">
              Contenuti realizzati con assistenza AI e rivisti da noi. Nomi, indirizzi e recensioni sono inventati.
            </p>
          </aside>
        </div>

        <section className="mt-20 bg-rosewood text-ivory px-6 py-8 lg:px-10 lg:py-12">
          <p className={`${label} text-ivory/70 mb-3`}>Dalla bottega</p>
          <p className="font-archivo font-black uppercase tracking-tight text-3xl lg:text-5xl leading-[0.95]">Il tuo locale merita lo stesso.</p>
          <p className="text-ivory/85 mt-4 max-w-xl">Una call di 30 minuti, gratuita. Ci racconti come lavori e ti diciamo cosa cambieremmo.</p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link href="/inizia-progetto" className="bg-ivory text-obsidian font-mono text-[11px] uppercase tracking-[0.12em] px-6 py-3.5 hover:bg-obsidian hover:text-ivory transition-colors duration-200">Prenota la call →</Link>
            <a href={whatsappUrl(c.whatsapp)} target="_blank" rel="noopener noreferrer" className="border border-ivory/50 text-ivory font-mono text-[11px] uppercase tracking-[0.12em] px-6 py-3.5 hover:bg-ivory hover:text-obsidian transition-colors duration-200">Scrivici su WhatsApp</a>
            <Link href="/settori/ristoranti" className="border border-ivory/50 text-ivory font-mono text-[11px] uppercase tracking-[0.12em] px-6 py-3.5 hover:bg-ivory hover:text-obsidian transition-colors duration-200">Siti per ristoranti e locali</Link>
          </div>
        </section>

        <section className="mt-20 border-t border-obsidian/10 pt-12">
          <p className={`${label} text-rosewood mb-8`}>Altri concept</p>
          <div className="grid sm:grid-cols-2 gap-8">
            {others.map((o) => (
              <Link key={o.slug} href={`/concept/${o.slug}`} className="group block border border-obsidian/10 p-6 hover:border-rosewood transition-colors duration-200">
                <p className={`${label} text-obsidian/45 mb-1.5`}>{o.type}</p>
                <h3 className="font-archivo font-black uppercase tracking-tight text-xl group-hover:text-rosewood transition-colors duration-200">{o.name}</h3>
                <p className="text-obsidian/60 mt-2">{o.pitch}</p>
              </Link>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
}
