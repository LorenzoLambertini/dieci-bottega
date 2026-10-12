import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CONCEPTS, CONCEPT_DISCLAIMER, getConcept } from "@/lib/concepts";
import { CONCEPT_METRICS, type LighthouseRun } from "@/lib/concept-metrics";
import { conceptShots } from "@/lib/concept-assets";
import { whatsappUrl } from "@/lib/contacts";
import ConceptDisclaimer from "@/components/ConceptDisclaimer";
import ConceptPreview, { ConceptPhone } from "@/components/ConceptPreview";
import BrandLogo, { BrandMark } from "@/components/concept/BrandLogo";
import BookGallery from "@/components/concept/BookGallery";
import { getConceptBrand } from "@/lib/concept-brands";
import { BRAND_TYPE, conceptFontVars } from "@/lib/concept-fonts";
import type { CSSProperties } from "react";

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
      images: shots
        ? [{ url: shots.dopo.desktop, width: 1600, height: 900, alt: `Il nuovo sito di ${c.name}` }]
        : [{ url: `/concept/${c.slug}/book/01.webp`, width: 1600, height: 900, alt: `Brand book di ${c.name}, copertina` }],
    },
  };
}

const label = "font-mono text-[11px] uppercase tracking-[0.16em]";
const h2 = "font-archivo font-bold uppercase tracking-tight text-2xl lg:text-4xl leading-[0.95] mb-6";
const btn = "inline-flex items-center gap-2 transition-all duration-200 px-5 py-3.5 font-mono text-[11px] uppercase tracking-[0.12em]";

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
  const brand = getConceptBrand(c.slug);
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
      image: `${SITE}${shots ? shots.dopo.desktop : `/concept/${c.slug}/book/01.webp`}`,
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

  const t = brand?.theme;
  const type = BRAND_TYPE[c.slug];
  const vars = (t ? { "--b-bg": t.bg, "--b-fg": t.fg, "--b-muted": t.muted, "--b-accent": t.accent, "--b-accent-fg": t.accentFg, "--b-line": t.line, "--b-surface": t.surface } : {}) as CSSProperties;
  const card = { background: "color-mix(in srgb, var(--b-fg) 7%, transparent)" } as CSSProperties;

  return (
    <div className={`blog-body pt-16 lg:pt-[72px] bg-ivory text-obsidian ${conceptFontVars}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero nei colori del brand */}
      <header style={vars} className={t ? "bg-[var(--b-bg)] text-[var(--b-fg)] overflow-hidden" : ""}>
        <div className="mx-auto max-w-[1180px] px-6 lg:px-12 pt-10 lg:pt-14 pb-16 lg:pb-20 grid lg:grid-cols-[minmax(0,1fr)_330px] gap-12 lg:gap-16 items-center">
          <div className="min-w-0">
            <nav className={`${label} opacity-70 mb-5`} aria-label="Percorso">
              <Link href="/progetti" className="hover:underline underline-offset-4">Progetti</Link>
              <span className="mx-2">/</span>
              <Link href="/concept" className="hover:underline underline-offset-4">Concept</Link>
              <span className="mx-2">/</span>
              <span>{c.name}</span>
            </nav>
            <ConceptDisclaimer className="mb-10" />
            <p className={`${label} mb-6 opacity-80`}>{brand?.descriptor ?? c.type} · Concept Dieci Bottega</p>
            {brand ? (
              <BrandLogo slug={c.slug} brand={brand} size={64} as="h1" className="mb-8" />
            ) : (
              <h1 className="font-archivo font-black uppercase tracking-tight text-5xl lg:text-8xl leading-[0.9]">{c.name}</h1>
            )}
            {brand && (
              <p className="text-[clamp(2.4rem,6vw,4.75rem)] max-w-[14ch]" style={type?.display}>{brand.tagline}</p>
            )}
            <p className="mt-6 text-lg lg:text-xl leading-relaxed max-w-[52ch] text-[var(--b-muted)]">{c.pitch}</p>
            <div className="flex flex-wrap gap-3 mt-8">
              <a href={`/concept/${c.slug}/dopo`} target="_blank" rel="noopener" className={`${btn} bg-[var(--b-accent)] text-[var(--b-accent-fg)] hover:opacity-90`}>Prova il sito nuovo ↗</a>
              <a href="#confronto" className={`${btn} border border-[var(--b-line)] hover:bg-[color-mix(in_srgb,var(--b-fg)_10%,transparent)]`}>Confronta prima e dopo</a>
              {brand && <a href={`/concept/${c.slug}/brand-identity.pdf`} target="_blank" rel="noopener" className={`${btn} border border-[var(--b-line)] hover:bg-[color-mix(in_srgb,var(--b-fg)_10%,transparent)]`}>Brand book PDF ↓</a>}
            </div>
          </div>
          <div className="hidden lg:block">
            <ConceptPhone slug={c.slug} name={c.name} width={300} />
            <p className={`${label} text-center mt-4 opacity-70`}>È il sito vero: provalo qui</p>
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-[1180px] px-6 lg:px-12 pt-16 lg:pt-24 pb-24">
        <section id="confronto" aria-labelledby="confronto-t" className="scroll-mt-28">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <h2 id="confronto-t" className={`${h2} mb-0`}>Prima e dopo,<br /><span className="text-obsidian/40">dal vivo.</span></h2>
            <p className="text-obsidian/60 max-w-[38ch]">Non sono screenshot: sono i due siti, uno sopra l&apos;altro. Trascina la maniglia.</p>
          </div>
          <ConceptPreview slug={c.slug} name={c.name} primaLabel={c.primaLabel} />
        </section>

        <section className="mt-20 lg:mt-28 grid lg:grid-cols-2 gap-px bg-obsidian/10 border border-obsidian/10" aria-label="Il lavoro">
          <div className="bg-ivory p-6 lg:p-10">
            <p className={`${label} text-obsidian/45 mb-3`}>Prima</p>
            <h2 className={h2}>Cosa non andava</h2>
            <ol className="space-y-4">
              {c.problems.map((p, i) => (
                <li key={p} className="grid grid-cols-[2.25rem_1fr] gap-2 text-obsidian/75 leading-relaxed">
                  <span className="font-mono text-[12px] text-obsidian/40 pt-1">✕ {String(i + 1).padStart(2, "0")}</span>
                  <span>{p}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="bg-obsidian text-ivory p-6 lg:p-10">
            <p className={`${label} text-[#F2B8A2] mb-3`}>Dopo</p>
            <h2 className={h2}>Cosa abbiamo fatto</h2>
            <p className={`${label} text-[#F2B8A2] mb-6 leading-relaxed`}>L&apos;elemento chiave: {c.keyFeature}</p>
            <ol className="space-y-5">
              {c.choices.map((ch, i) => (
                <li key={ch.title} className="grid grid-cols-[2.25rem_1fr] gap-2">
                  <span className="font-mono text-[12px] text-rosewood pt-1">{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    <span className="block font-archivo font-bold leading-snug mb-1">{ch.title}</span>
                    <span className="block text-ivory/65 text-[0.95rem] leading-relaxed">{ch.why}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </article>

      {brand && t && (
        <section style={vars} className="bg-[var(--b-bg)] text-[var(--b-fg)]" aria-labelledby="brand">
          <div className="mx-auto max-w-[1180px] px-6 lg:px-12 py-20 lg:py-28">
            <p className={`${label} opacity-70 mb-5`}>La nuova brand identity</p>
            <h2 id="brand" className="text-[clamp(2.2rem,5.5vw,4.5rem)] max-w-[20ch]" style={type?.display}>&laquo;{brand.essence}&raquo;</h2>
            <p className="mt-6 text-lg max-w-[52ch] text-[var(--b-muted)]" style={type?.text}>La promessa: <span className="text-[var(--b-fg)]">&laquo;{brand.promise}&raquo;</span></p>

            <div className="mt-14 grid lg:grid-cols-[1.1fr_1fr] gap-6">
              <div className="p-6 lg:p-8 rounded-[6px] flex flex-col sm:flex-row gap-6 sm:items-center" style={card}>
                <BrandMark brand={brand} height={120} />
                <div>
                  <p className={`${label} opacity-70 mb-2`}>Il segno chiave</p>
                  <p className="text-3xl mb-3" style={type?.display}>{brand.keySign.title}</p>
                  <p className="text-[var(--b-muted)] leading-relaxed">{brand.keySign.text}</p>
                </div>
              </div>
              <div className="p-6 lg:p-8 rounded-[6px]" style={card}>
                <p className={`${label} opacity-70 mb-4`}>Palette</p>
                <div className="flex h-24 rounded-[4px] overflow-hidden border border-[var(--b-line)]" aria-hidden>
                  {brand.palette.map((p) => <span key={p.hex} style={{ background: p.hex, width: `${p.share}%` }} />)}
                </div>
                <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 mt-5">
                  {brand.palette.map((p) => (
                    <li key={p.hex} className="flex gap-2.5 items-start">
                      <span className="w-4 h-4 mt-1 rounded-full border border-[var(--b-line)] shrink-0" style={{ background: p.hex }} aria-hidden />
                      <span className="text-sm leading-snug"><b>{p.name}</b> <span className="opacity-60">{p.share}%</span><br /><span className="font-mono text-[11px] opacity-70">{p.hex}</span></span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <ul className="mt-6 grid md:grid-cols-3 gap-6">
              {brand.values.map((v, i) => (
                <li key={v.title} className="p-6 lg:p-8 rounded-[6px]" style={card}>
                  <p className="font-mono text-[12px] opacity-60">{String(i + 1).padStart(2, "0")}</p>
                  <p className="text-3xl mt-2 mb-3" style={type?.display}>{v.title}</p>
                  <p className="text-[var(--b-muted)] leading-relaxed">{v.text}</p>
                  <p className="mt-4 pt-4 border-t border-[var(--b-line)] text-sm">→ {v.habit}</p>
                </li>
              ))}
            </ul>

            <div className="mt-6 grid lg:grid-cols-[1fr_1.1fr] gap-6">
              <div className="p-6 lg:p-8 rounded-[6px]" style={card}>
                <p className={`${label} opacity-70 mb-4`}>Carattere</p>
                {brand.fonts.map((f, i) => (
                  <div key={f.family} className={i ? "mt-6 pt-6 border-t border-[var(--b-line)]" : ""}>
                    <p className="text-7xl leading-none" style={i ? type?.text : type?.display}>Aa</p>
                    <p className="mt-3 font-semibold">{f.family}</p>
                    <p className="text-[var(--b-muted)] text-sm leading-relaxed">{f.role}</p>
                  </div>
                ))}
              </div>
              <div className="p-6 lg:p-8 rounded-[6px]" style={card}>
                <p className={`${label} opacity-70 mb-4`}>Tono di voce</p>
                <p className="text-2xl lg:text-3xl" style={type?.display}>{brand.tone.personality.join(". ")}.</p>
                <p className="text-[var(--b-muted)] leading-relaxed mt-3">{brand.tone.description}</p>
                <div className="grid sm:grid-cols-2 gap-5 mt-6 text-sm">
                  <ul className="space-y-1.5"><li className={`${label} opacity-70 mb-2`}>Sì</li>{brand.tone.do.map((d) => <li key={d}>+ {d}</li>)}</ul>
                  <ul className="space-y-1.5"><li className={`${label} opacity-70 mb-2`}>No</li>{brand.tone.dont.map((d) => <li key={d} className="text-[var(--b-muted)]">− {d}</li>)}</ul>
                </div>
                <figure className="mt-6 pt-6 border-t border-[var(--b-line)]">
                  <figcaption className={`${label} opacity-70 mb-2`}>Esempio · {brand.quote.context}</figcaption>
                  <blockquote className="text-lg leading-relaxed" style={type?.text}>&laquo;{brand.quote.text}&raquo;</blockquote>
                </figure>
              </div>
            </div>

            <div className="mt-20 flex flex-wrap items-end justify-between gap-4 mb-6">
              <div>
                <p className={`${label} opacity-70 mb-3`}>Il brand book</p>
                <h2 className="text-[clamp(2rem,4.5vw,3.5rem)]" style={type?.display}>Sfoglialo qui.</h2>
              </div>
              <a href={`/concept/${c.slug}/brand-identity.pdf`} target="_blank" rel="noopener" className={`${btn} bg-[var(--b-accent)] text-[var(--b-accent-fg)] hover:opacity-90`}>Scarica il PDF · 30 pagine ↓</a>
            </div>
            <BookGallery slug={c.slug} name={brand.fullName} pages={brand.book} fg={t.fg} line={t.line} />
          </div>
        </section>
      )}

      <div className="mx-auto max-w-[1180px] px-6 lg:px-12 pb-24">
        {metrics && (
          <section className="pt-20" aria-labelledby="misure">
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

        <section className="mt-20 bg-rosewood text-ivory px-6 py-8 lg:px-10 lg:py-12">
          <p className={`${label} text-ivory/70 mb-3`}>Dalla bottega</p>
          <p className="font-archivo font-black uppercase tracking-tight text-3xl lg:text-5xl leading-[0.95]">Il tuo locale merita lo stesso.</p>
          <p className="text-ivory/85 mt-4 max-w-xl">Sito, logo e brand book come questi. Una call di 30 minuti, gratuita: ci racconti come lavori e ti diciamo cosa cambieremmo.</p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link href="/inizia-progetto" className="bg-ivory text-obsidian font-mono text-[11px] uppercase tracking-[0.12em] px-6 py-3.5 hover:bg-obsidian hover:text-ivory transition-colors duration-200">Prenota la call →</Link>
            <a href={whatsappUrl(c.whatsapp)} target="_blank" rel="noopener noreferrer" className="border border-ivory/50 text-ivory font-mono text-[11px] uppercase tracking-[0.12em] px-6 py-3.5 hover:bg-ivory hover:text-obsidian transition-colors duration-200">Scrivici su WhatsApp</a>
            <Link href="/settori/ristoranti" className="border border-ivory/50 text-ivory font-mono text-[11px] uppercase tracking-[0.12em] px-6 py-3.5 hover:bg-ivory hover:text-obsidian transition-colors duration-200">Siti per ristoranti e locali</Link>
          </div>
          <p className="text-ivory/70 text-sm mt-6">Contenuti realizzati con assistenza AI e rivisti da noi. Nomi, indirizzi e recensioni sono inventati.</p>
        </section>

        <section className="mt-20 border-t border-obsidian/10 pt-12">
          <p className={`${label} text-rosewood mb-8`}>Altri concept</p>
          <div className="grid sm:grid-cols-2 gap-6">
            {others.map((o) => {
              const ob = getConceptBrand(o.slug);
              return (
                <Link
                  key={o.slug}
                  href={`/concept/${o.slug}`}
                  style={ob ? { background: ob.theme.bg, color: ob.theme.fg } : undefined}
                  className="group block p-6 lg:p-8 border border-obsidian/10 transition-transform duration-300 hover:-translate-y-1"
                >
                  {ob ? <BrandLogo slug={o.slug} brand={ob} size={34} as="h3" /> : <h3 className="font-archivo font-black uppercase text-xl">{o.name}</h3>}
                  {ob && <p className="mt-5 text-2xl" style={BRAND_TYPE[o.slug]?.display}>{ob.tagline}</p>}
                  <p className="mt-3 opacity-75">{o.pitch}</p>
                  <p className={`${label} mt-5`}>Il caso studio →</p>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
