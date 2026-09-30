import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BLOG_URL, formatDate, getPost, POSTS, readingMinutes, relatedPosts } from "@/lib/blog";
import { AUTHORS } from "@/lib/blog/authors";
import { countWords, extractHeadings, Markdown } from "@/lib/blog/markdown";
import { approvedComments, type PublicComment } from "@/lib/blog/comments";
import { BlogCover } from "@/components/blog/BlogCover";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { Comments } from "@/components/blog/Comments";

// Pagine statiche, rigenerate al massimo ogni 5 minuti (nuovi commenti approvati)
export const revalidate = 300;

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getPost(slug);
  if (!p) return {};
  const url = `${BLOG_URL}/${p.slug}`;
  return {
    title: p.seoTitle ?? `${p.title} | Dieci Bottega`,
    description: p.description,
    keywords: p.keywords,
    alternates: { canonical: `/blog/${p.slug}` },
    authors: [{ name: AUTHORS[p.author].name }],
    openGraph: {
      type: "article",
      url,
      title: p.title,
      description: p.description,
      publishedTime: p.publishedAt,
      modifiedTime: p.updatedAt ?? p.publishedAt,
      authors: [AUTHORS[p.author].name],
      section: p.category,
      tags: p.keywords,
      locale: "it_IT",
      siteName: "Dieci Bottega",
      images: [{ url: `/blog/${p.slug}/cover.png`, width: 1200, height: 630, alt: p.title }],
    },
    twitter: { card: "summary_large_image", title: p.title, description: p.description, images: [`/blog/${p.slug}/cover.png`] },
  };
}

async function loadComments(slug: string): Promise<PublicComment[]> {
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    return await approvedComments(createAdminClient(), slug);
  } catch {
    return [];
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getPost(slug);
  if (!p) notFound();
  const author = AUTHORS[p.author];
  const url = `${BLOG_URL}/${p.slug}`;
  const headings = extractHeadings(p.body);
  const minutes = readingMinutes(p);
  const related = relatedPosts(p);
  const comments = await loadComments(p.slug);
  const updated = p.updatedAt ?? p.publishedAt;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: p.title,
      description: p.description,
      image: `${url}/cover.png`,
      datePublished: p.publishedAt,
      dateModified: updated,
      inLanguage: "it-IT",
      wordCount: countWords(p.body),
      keywords: p.keywords.join(", "),
      articleSection: p.category,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      author: { "@type": "Person", name: author.name, jobTitle: author.role, url: "https://diecibottega.it/chi-siamo" },
      publisher: {
        "@type": "Organization",
        name: "Dieci Bottega",
        url: "https://diecibottega.it",
        logo: { "@type": "ImageObject", url: "https://diecibottega.it/logo.png" },
        address: { "@type": "PostalAddress", addressLocality: "Bologna", addressCountry: "IT" },
      },
      abstract: p.tldr.join(" "),
      commentCount: comments.length,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: p.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://diecibottega.it" },
        { "@type": "ListItem", position: 2, name: "Blog", item: BLOG_URL },
        { "@type": "ListItem", position: 3, name: p.title, item: url },
      ],
    },
  ];

  return (
    <div className="blog-body pt-16 lg:pt-[72px] bg-ivory text-obsidian">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="mx-auto max-w-[1180px] px-6 lg:px-12 pt-12 lg:pt-20 pb-24">
        {/* Intestazione */}
        <nav className="font-mono text-[11px] uppercase tracking-[0.14em] text-obsidian/45 mb-8" aria-label="Percorso">
          <Link href="/blog" className="hover:text-rosewood">Blog</Link>
          <span className="mx-2">/</span>
          <Link href={`/blog?categoria=${encodeURIComponent(p.category)}`} className="hover:text-rosewood">{p.category}</Link>
        </nav>
        <header className="max-w-[860px]">
          <h1 className="font-archivo font-black uppercase tracking-tight text-4xl sm:text-5xl lg:text-7xl leading-[0.92]">{p.title}</h1>
          <p className="text-obsidian/60 text-lg lg:text-xl mt-6 leading-relaxed">{p.description}</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-6 font-mono text-xs text-obsidian/50">
            <span>Di <strong className="text-obsidian font-semibold">{author.name}</strong></span>
            <span>Aggiornato il <time dateTime={updated}>{formatDate(updated)}</time></span>
            <span>{minutes} min di lettura</span>
            {comments.length > 0 && <a href="#commenti" className="hover:text-rosewood">{comments.length} commenti</a>}
          </div>
        </header>

        <BlogCover post={p} className="mt-10 lg:mt-14" />

        <div className="grid lg:grid-cols-[minmax(0,1fr)_280px] gap-12 lg:gap-16 mt-12">
          <div className="min-w-0 max-w-[760px] text-[1.075rem] leading-[1.8] text-obsidian/80">
            {/* In breve: risposta diretta (utile a lettori, Google e assistenti AI) */}
            <section className="bg-obsidian text-ivory px-6 py-6 lg:px-8 lg:py-7" aria-label="In breve">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-rosewood mb-3">In breve</p>
              <ul className="space-y-2.5">
                {p.tldr.map((t) => (
                  <li key={t} className="relative pl-6 text-ivory/85 leading-relaxed">
                    <span className="absolute left-0 top-[0.8em] w-2.5 h-px bg-rosewood" aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
            </section>

            <Markdown source={p.body} />

            {/* Domande frequenti */}
            {p.faq.length > 0 && (
              <section className="mt-16" aria-labelledby="faq">
                <h2 id="faq" className="font-archivo font-black uppercase tracking-tight text-obsidian text-2xl lg:text-[2rem] mb-5 scroll-mt-28">Domande frequenti</h2>
                <div className="divide-y divide-obsidian/10 border-y border-obsidian/10">
                  {p.faq.map((f) => (
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
            )}

            {/* Invito all'azione */}
            <section className="mt-16 bg-rosewood text-ivory px-6 py-8 lg:px-10 lg:py-10">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ivory/70 mb-3">Dalla bottega</p>
              <p className="font-archivo font-black uppercase tracking-tight text-2xl lg:text-4xl leading-[0.95]">Vuoi un sito che ti porti clienti?</p>
              <p className="text-ivory/85 mt-4 max-w-xl">
                Progettiamo e mettiamo online siti per piccole imprese in dieci giorni, da 800€. La prima call di 30 minuti è gratuita.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <Link href="/inizia-progetto" className="bg-ivory text-obsidian font-mono text-[11px] uppercase tracking-[0.12em] px-6 py-3.5 hover:bg-obsidian hover:text-ivory transition-colors">
                  Inizia il progetto →
                </Link>
                <Link href="/servizi" className="border border-ivory/50 text-ivory font-mono text-[11px] uppercase tracking-[0.12em] px-6 py-3.5 hover:bg-ivory hover:text-obsidian transition-colors">
                  Vedi i servizi
                </Link>
              </div>
            </section>

            {/* Autore */}
            <section className="mt-12 flex gap-4 items-start border-t border-obsidian/10 pt-8">
              <span className="w-12 h-12 shrink-0 bg-obsidian text-ivory font-archivo font-black flex items-center justify-center">{author.name[0]}</span>
              <div>
                <p className="font-semibold text-obsidian">{author.name}</p>
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-rosewood">{author.role}</p>
                <p className="text-obsidian/65 mt-2 text-base leading-relaxed">{author.bio}</p>
              </div>
            </section>

            <div className="mt-10">
              <ShareButtons url={url} title={p.title} />
            </div>

            <div className="mt-16">
              <Comments slug={p.slug} comments={comments} />
            </div>
          </div>

          {/* Colonna laterale: indice e condivisione */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-8">
              {headings.length > 0 && (
                <nav aria-label="Indice">
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-obsidian/45 mb-3">In questo articolo</p>
                  <ol className="space-y-2 text-sm">
                    {headings.map((h) => (
                      <li key={h.id}>
                        <a href={`#${h.id}`} className="text-obsidian/65 hover:text-rosewood leading-snug block">{h.text}</a>
                      </li>
                    ))}
                    <li><a href="#faq" className="text-obsidian/65 hover:text-rosewood">Domande frequenti</a></li>
                  </ol>
                </nav>
              )}
              <ShareButtons url={url} title={p.title} compact />
            </div>
          </aside>
        </div>

        {/* Articoli collegati */}
        {related.length > 0 && (
          <section className="mt-24 border-t border-obsidian/10 pt-12">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-rosewood mb-8">Continua a leggere</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {related.map((r) => (
                <Link key={r.slug} href={`/blog/${r.slug}`} className="group">
                  <BlogCover post={r} className="mb-4" />
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-obsidian/45 mb-1.5">{r.category}</p>
                  <h3 className="font-archivo font-black uppercase tracking-tight text-lg leading-tight group-hover:text-rosewood transition-colors">{r.title}</h3>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
