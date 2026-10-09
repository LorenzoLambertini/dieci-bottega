import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSector, SECTORS } from "@/lib/sectors";
import { getPost } from "@/lib/blog";
import { getProject } from "@/lib/projects";
import { whatsappUrl } from "@/lib/contacts";

const SITE = "https://diecibottega.it";

export function generateStaticParams() {
  return SECTORS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = getSector(slug);
  if (!s) return {};
  return {
    title: s.seoTitle,
    description: s.description,
    alternates: { canonical: `/settori/${s.slug}` },
    openGraph: { type: "website", url: `${SITE}/settori/${s.slug}`, title: s.title, description: s.description, locale: "it_IT", siteName: "Dieci Bottega" },
  };
}

const label = "font-mono text-[11px] uppercase tracking-[0.16em]";
const h2 = "font-archivo font-black uppercase tracking-tight text-obsidian text-2xl lg:text-4xl leading-[0.95] mb-6";

export default async function SectorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = getSector(slug);
  if (!s) notFound();
  const posts = s.posts.map((p) => getPost(p)).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const caseStudy = s.caseStudy ? getProject(s.caseStudy) : undefined;
  const others = SECTORS.filter((x) => x.slug !== s.slug);
  const url = `${SITE}/settori/${s.slug}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: `Sito web per ${s.name}`,
      serviceType: "Realizzazione siti web",
      description: s.description,
      url,
      areaServed: { "@type": "City", name: "Bologna" },
      provider: { "@type": "ProfessionalService", name: "Dieci Bottega", url: SITE, address: { "@type": "PostalAddress", addressLocality: "Bologna", addressCountry: "IT" } },
      offers: {
        "@type": "Offer",
        priceCurrency: "EUR",
        price: Number(s.plan.price.split("–")[0].replace(/\D/g, "")),
        description: `Pacchetto ${s.plan.name}: ${s.plan.price}, ${s.plan.time}`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: s.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE },
        { "@type": "ListItem", position: 2, name: "Settori", item: `${SITE}/settori` },
        { "@type": "ListItem", position: 3, name: `Sito web per ${s.name}`, item: url },
      ],
    },
  ];

  return (
    <div className="blog-body pt-16 lg:pt-[72px] bg-ivory text-obsidian">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="mx-auto max-w-[1180px] px-6 lg:px-12 pt-12 lg:pt-20 pb-24">
        <nav className={`${label} text-obsidian/45 mb-8`} aria-label="Percorso">
          <Link href="/settori" className="hover:text-rosewood">Settori</Link>
          <span className="mx-2">/</span>
          <span>{s.name}</span>
        </nav>

        <header className="grid lg:grid-cols-[minmax(0,1fr)_260px] gap-10 items-end">
          <div>
            <h1 className="font-archivo font-black uppercase tracking-tight text-4xl sm:text-5xl lg:text-7xl leading-[0.92]">{s.title}</h1>
            <p className="text-obsidian/60 text-lg lg:text-xl mt-6 leading-relaxed max-w-[760px]">{s.intro}</p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link href="/inizia-progetto" className="bg-rosewood text-ivory font-mono text-[11px] uppercase tracking-[0.12em] px-6 py-3.5 hover:bg-obsidian transition-colors">
                Inizia il progetto →
              </Link>
              <a href={whatsappUrl(s.whatsapp)} target="_blank" rel="noopener noreferrer" className="border border-obsidian/25 text-obsidian font-mono text-[11px] uppercase tracking-[0.12em] px-6 py-3.5 hover:bg-obsidian hover:text-ivory transition-colors">
                Scrivici su WhatsApp
              </a>
            </div>
          </div>
          <div className="hidden lg:flex aspect-square bg-obsidian text-rosewood items-center justify-center" aria-hidden>
            <span className="font-archivo font-black uppercase text-7xl tracking-tight">{s.glyph}</span>
          </div>
        </header>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_300px] gap-12 lg:gap-16 mt-16 lg:mt-24">
          <div className="min-w-0 max-w-[760px] text-[1.075rem] leading-[1.8] text-obsidian/80">
            <section className="bg-obsidian text-ivory px-6 py-6 lg:px-8 lg:py-7">
              <p className={`${label} text-rosewood mb-3`}>Il problema più comune</p>
              <p className="text-ivory/85 leading-relaxed">{s.problem}</p>
            </section>

            <section className="mt-14">
              <h2 className={h2}>Cosa deve avere il sito</h2>
              <ul className="grid sm:grid-cols-2 gap-px bg-obsidian/10 border border-obsidian/10">
                {s.needs.map((n) => (
                  <li key={n.title} className="bg-ivory p-5 lg:p-6">
                    <p className="font-archivo font-bold text-obsidian text-base leading-snug mb-1.5">{n.title}</p>
                    <p className="text-obsidian/65 text-[0.95rem] leading-relaxed">{n.text}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-14">
              <h2 className={h2}>Il pacchetto che consigliamo</h2>
              <div className="border border-obsidian/15 p-6 lg:p-8">
                <p className={`${label} text-rosewood mb-2`}>Pacchetto {s.plan.name}</p>
                <p className="font-archivo font-black text-obsidian text-4xl tracking-tight">{s.plan.price}</p>
                <p className={`${label} text-obsidian/50 mt-2`}>Consegna in {s.plan.time} · IVA esclusa</p>
                <p className="mt-4">{s.plan.why}</p>
                <Link href={s.plan.href} className="inline-block mt-5 text-rosewood underline underline-offset-4 font-semibold">
                  {s.plan.href === "/inizia-progetto" ? "Chiedi un preventivo" : "Vedi cosa include"} →
                </Link>
              </div>
            </section>

            {caseStudy && (
              <section className="mt-14">
                <h2 className={h2}>Un lavoro che abbiamo fatto</h2>
                <Link href={`/progetti/${caseStudy.slug}`} className="group block border border-obsidian/15 p-6 lg:p-8 hover:border-rosewood transition-colors">
                  <p className={`${label} text-rosewood mb-2`}>Caso studio · {caseStudy.type}</p>
                  <p className="font-archivo font-black uppercase text-2xl text-obsidian group-hover:text-rosewood transition-colors">{caseStudy.name}</p>
                  <p className="mt-2 text-obsidian/65">{caseStudy.desc}</p>
                </Link>
              </section>
            )}

            <section className="mt-14" aria-labelledby="faq">
              <h2 id="faq" className={h2}>Domande frequenti</h2>
              <div className="divide-y divide-obsidian/10 border-y border-obsidian/10">
                {s.faq.map((f) => (
                  <details key={f.q} className="group py-4">
                    <summary className="cursor-pointer list-none flex items-start justify-between gap-4 font-semibold text-obsidian">
                      {f.q}
                      <span className="text-rosewood font-mono transition-transform group-open:rotate-45" aria-hidden>+</span>
                    </summary>
                    <p className="mt-3 text-obsidian/75">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-28 self-start space-y-8">
            {posts.length > 0 && (
              <div>
                <p className={`${label} text-obsidian/45 mb-3`}>Da leggere</p>
                <ul className="space-y-3">
                  {posts.map((p) => (
                    <li key={p.slug}>
                      <Link href={`/blog/${p.slug}`} className="text-obsidian/75 hover:text-rosewood leading-snug block">{p.title}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <p className={`${label} text-obsidian/45 mb-3`}>Altri settori</p>
              <ul className="flex flex-wrap gap-2">
                {others.map((o) => (
                  <li key={o.slug}>
                    <Link href={`/settori/${o.slug}`} className={`${label} text-obsidian/65 border border-obsidian/15 px-2.5 py-1 inline-block hover:border-rosewood hover:text-rosewood`}>{o.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        <section className="mt-20 bg-rosewood text-ivory px-6 py-8 lg:px-10 lg:py-12">
          <p className={`${label} text-ivory/70 mb-3`}>Dalla bottega</p>
          <p className="font-archivo font-black uppercase tracking-tight text-3xl lg:text-5xl leading-[0.95]">Parliamo del tuo sito.</p>
          <p className="text-ivory/85 mt-4 max-w-xl">Siamo a Bologna. La prima call di 30 minuti è gratuita: ci racconti la tua attività e ti diciamo cosa serve davvero.</p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link href="/inizia-progetto" className="bg-ivory text-obsidian font-mono text-[11px] uppercase tracking-[0.12em] px-6 py-3.5 hover:bg-obsidian hover:text-ivory transition-colors">Inizia il progetto →</Link>
            <a href={whatsappUrl(s.whatsapp)} target="_blank" rel="noopener noreferrer" className="border border-ivory/50 text-ivory font-mono text-[11px] uppercase tracking-[0.12em] px-6 py-3.5 hover:bg-ivory hover:text-obsidian transition-colors">Scrivici su WhatsApp</a>
          </div>
        </section>
      </article>
    </div>
  );
}
