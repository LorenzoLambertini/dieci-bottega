import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProject, PROJECTS } from "@/lib/projects";
import { whatsappUrl } from "@/lib/contacts";
import BeforeAfter from "@/components/ui/BeforeAfter";

const SITE = "https://diecibottega.it";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return {
    title: p.seoTitle,
    description: p.description,
    alternates: { canonical: `/progetti/${p.slug}` },
    openGraph: {
      type: "article",
      url: `${SITE}/progetti/${p.slug}`,
      title: p.seoTitle,
      description: p.description,
      locale: "it_IT",
      siteName: "Dieci Bottega",
      images: [{ url: p.image, width: 1600, height: 900, alt: p.alt }],
    },
  };
}

const label = "font-mono text-[11px] uppercase tracking-[0.16em]";
const h2 = "font-archivo font-black uppercase tracking-tight text-obsidian text-2xl lg:text-4xl leading-[0.95] mb-6";

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();
  const others = PROJECTS.filter((x) => x.slug !== p.slug);
  const url = `${SITE}/progetti/${p.slug}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: `${p.name}: caso studio`,
      headline: p.seoTitle,
      description: p.description,
      url,
      image: `${SITE}${p.image}`,
      inLanguage: "it-IT",
      about: { "@type": "Organization", name: p.client, address: { "@type": "PostalAddress", addressLocality: p.place, addressCountry: "IT" } },
      creator: { "@type": "Organization", name: "Dieci Bottega", url: SITE },
      ...(p.url ? { sameAs: p.url } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE },
        { "@type": "ListItem", position: 2, name: "Progetti", item: `${SITE}/progetti` },
        { "@type": "ListItem", position: 3, name: p.name, item: url },
      ],
    },
  ];

  return (
    <div className="blog-body pt-16 lg:pt-[72px] bg-ivory text-obsidian">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="mx-auto max-w-[1180px] px-6 lg:px-12 pt-12 lg:pt-20 pb-24">
        <nav className={`${label} text-obsidian/45 mb-8`} aria-label="Percorso">
          <Link href="/progetti" className="hover:text-rosewood">Progetti</Link>
          <span className="mx-2">/</span>
          <span>Caso studio</span>
        </nav>

        <header className="max-w-[900px]">
          <p className={`${label} text-rosewood mb-4`}>{p.type}</p>
          <h1 className="font-archivo font-black uppercase tracking-tight text-5xl sm:text-6xl lg:text-8xl leading-[0.9]">{p.name}</h1>
          <p className="text-obsidian/60 text-lg lg:text-xl mt-6 leading-relaxed">{p.description.replace(/^Caso studio: /, "")}</p>
        </header>

        {/* Scheda del progetto */}
        <dl className="grid grid-cols-2 lg:grid-cols-4 border-y border-obsidian/10 mt-10 lg:mt-14">
          {[
            ["Cliente", p.client],
            ["Settore", p.sector],
            ["Dove", p.place],
            ["Servizio", p.service?.label ?? p.tags[0]],
          ].map(([k, v]) => (
            <div key={k} className="py-5 pr-4 border-obsidian/10 [&:not(:last-child)]:lg:border-r lg:pl-6 first:lg:pl-0">
              <dt className={`${label} text-obsidian/40 mb-1.5`}>{k}</dt>
              <dd className="font-semibold text-obsidian">{v}</dd>
            </div>
          ))}
        </dl>

        <a href={p.url} target="_blank" rel="noopener noreferrer" className="group block relative aspect-[16/9] overflow-hidden rounded-xl border border-obsidian/10 shadow-atelier-lg bg-obsidian mt-10 lg:mt-14">
          <Image src={p.image} alt={p.alt} fill priority sizes="(min-width: 1180px) 1080px, 100vw" className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.01]" />
        </a>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_300px] gap-12 lg:gap-16 mt-14 lg:mt-20">
          <div className="min-w-0 max-w-[760px] text-[1.075rem] leading-[1.8] text-obsidian/80">
            <section>
              <h2 className={h2}>Il punto di partenza</h2>
              {p.challenge.map((t) => <p key={t} className="mb-4">{t}</p>)}
            </section>

            <section className="mt-14">
              <h2 className={h2}>Cosa abbiamo fatto</h2>
              {p.solution.map((t) => <p key={t} className="mb-4">{t}</p>)}
            </section>

            {p.beforeAfter && (
              <section className="mt-14">
                <h2 className={h2}>Prima e dopo</h2>
                <p className="mb-6 text-obsidian/60">Trascina il cursore per confrontare la home di prima con quella nuova.</p>
                <BeforeAfter {...p.beforeAfter} />
              </section>
            )}

            <section className="mt-14">
              <h2 className={h2}>Cosa c&apos;è dentro</h2>
              <ul className="grid sm:grid-cols-2 gap-px bg-obsidian/10 border border-obsidian/10">
                {p.features.map((f) => (
                  <li key={f.title} className="bg-ivory p-5 lg:p-6">
                    <p className="font-archivo font-bold text-obsidian text-base leading-snug mb-1.5">{f.title}</p>
                    <p className="text-obsidian/65 text-[0.95rem] leading-relaxed">{f.text}</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="lg:sticky lg:top-28 self-start space-y-8">
            <div>
              <p className={`${label} text-obsidian/45 mb-3`}>Guardalo dal vivo</p>
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-obsidian text-ivory hover:bg-rosewood transition-colors px-5 py-3.5 font-mono text-[11px] uppercase tracking-[0.12em]">
                Apri il sito ↗
              </a>
              {p.secondary && (
                <a href={p.secondary.url} target="_blank" rel="noopener noreferrer" className="block mt-3 text-obsidian/50 hover:text-rosewood underline underline-offset-4 text-sm">
                  {p.secondary.label} ↗
                </a>
              )}
            </div>
            {p.stack && (
              <div>
                <p className={`${label} text-obsidian/45 mb-3`}>Strumenti</p>
                <ul className="flex flex-wrap gap-2">
                  {p.stack.map((s) => <li key={s} className={`${label} text-obsidian/65 border border-obsidian/15 px-2.5 py-1`}>{s}</li>)}
                </ul>
              </div>
            )}
            <div>
              <p className={`${label} text-obsidian/45 mb-3`}>In breve</p>
              <ul className="flex flex-wrap gap-2">
                {p.tags.map((t) => <li key={t} className={`${label} text-obsidian/65 border border-obsidian/15 px-2.5 py-1`}>{t}</li>)}
              </ul>
            </div>
          </aside>
        </div>

        {/* Invito all'azione */}
        <section className="mt-20 bg-rosewood text-ivory px-6 py-8 lg:px-10 lg:py-12">
          <p className={`${label} text-ivory/70 mb-3`}>Dalla bottega</p>
          <p className="font-archivo font-black uppercase tracking-tight text-3xl lg:text-5xl leading-[0.95]">Vuoi un lavoro così per la tua attività?</p>
          <p className="text-ivory/85 mt-4 max-w-xl">
            Raccontaci cosa fai: in una call di 30 minuti, gratuita, ti diciamo cosa ti serve davvero e quanto costa.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link href="/inizia-progetto" className="bg-ivory text-obsidian font-mono text-[11px] uppercase tracking-[0.12em] px-6 py-3.5 hover:bg-obsidian hover:text-ivory transition-colors">
              Inizia il progetto →
            </Link>
            <a href={whatsappUrl(`Ciao Dieci Bottega, ho visto il caso studio di ${p.name} e vorrei qualcosa di simile`)} target="_blank" rel="noopener noreferrer" className="border border-ivory/50 text-ivory font-mono text-[11px] uppercase tracking-[0.12em] px-6 py-3.5 hover:bg-ivory hover:text-obsidian transition-colors">
              Scrivici su WhatsApp
            </a>
            {p.service && (
              <Link href={p.service.href} className="border border-ivory/50 text-ivory font-mono text-[11px] uppercase tracking-[0.12em] px-6 py-3.5 hover:bg-ivory hover:text-obsidian transition-colors">
                Scopri il servizio {p.service.label}
              </Link>
            )}
          </div>
        </section>

        {/* Altri lavori */}
        <section className="mt-20 border-t border-obsidian/10 pt-12">
          <p className={`${label} text-rosewood mb-8`}>Altri lavori</p>
          <div className="grid sm:grid-cols-2 gap-8">
            {others.map((o) => (
              <Link key={o.slug} href={`/progetti/${o.slug}`} className="group">
                <div className="relative aspect-[16/9] overflow-hidden rounded-lg border border-obsidian/10 bg-obsidian mb-4">
                  <Image src={o.image} alt={o.alt} fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]" />
                </div>
                <p className={`${label} text-obsidian/45 mb-1.5`}>{o.type}</p>
                <h3 className="font-archivo font-black uppercase tracking-tight text-xl group-hover:text-rosewood transition-colors">{o.name}</h3>
              </Link>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
}
