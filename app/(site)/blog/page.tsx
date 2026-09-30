import Link from "next/link";
import type { Metadata } from "next";
import { BLOG_URL, CATEGORIES, formatDate, POSTS, readingMinutes } from "@/lib/blog";
import { BlogCover } from "@/components/blog/BlogCover";

export const metadata: Metadata = {
  title: "Blog · Siti web, SEO e clienti online per PMI | Dieci Bottega",
  description:
    "Guide pratiche per piccole imprese: quanto costa un sito, come farsi trovare su Google e sulle AI, Google Business Profile, CRM e automazioni. Dalla bottega di Bologna.",
  alternates: { canonical: "/blog", types: { "application/rss+xml": "/blog/rss.xml" } },
  openGraph: { type: "website", url: BLOG_URL, title: "Il blog di Dieci Bottega", description: "Guide pratiche per PMI: siti web, SEO, Google e automazioni." },
};

export default async function BlogIndex({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  const { categoria } = await searchParams;
  const active = CATEGORIES.find((c) => c === categoria) ?? null;
  const list = active ? POSTS.filter((p) => p.category === active) : POSTS;
  const [first, ...rest] = list;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Il blog di Dieci Bottega",
    url: BLOG_URL,
    inLanguage: "it-IT",
    publisher: { "@type": "Organization", name: "Dieci Bottega", url: "https://diecibottega.it" },
    blogPost: POSTS.map((p) => ({ "@type": "BlogPosting", headline: p.title, url: `${BLOG_URL}/${p.slug}`, datePublished: p.publishedAt })),
  };

  return (
    <div className="blog-body pt-16 lg:pt-[72px] bg-ivory text-obsidian min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-[1480px] px-6 lg:px-12 pt-16 lg:pt-24 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <span className="block w-8 h-px bg-rosewood" />
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-rosewood">Blog · Dalla bottega</span>
        </div>
        <h1 className="font-archivo font-black uppercase tracking-tight text-5xl lg:text-8xl leading-[0.9] max-w-5xl">
          Farsi trovare, <span className="text-obsidian/35">farsi scegliere.</span>
        </h1>
        <p className="text-obsidian/60 text-lg lg:text-xl max-w-2xl mt-6 leading-relaxed">
          Guide pratiche per chi ha un&apos;attività: prezzi veri, Google, intelligenza artificiale e tutto quello che serve
          perché il sito porti clienti. Senza giri di parole.
        </p>

        <nav className="flex flex-wrap gap-2 mt-10 mb-12" aria-label="Categorie">
          <Link href="/blog" className={`font-mono text-[11px] uppercase tracking-[0.12em] px-4 py-2 border transition-colors ${!active ? "bg-obsidian text-ivory border-obsidian" : "border-obsidian/15 text-obsidian/60 hover:border-obsidian"}`}>
            Tutti
          </Link>
          {CATEGORIES.filter((c) => POSTS.some((p) => p.category === c)).map((c) => (
            <Link
              key={c}
              href={`/blog?categoria=${encodeURIComponent(c)}`}
              className={`font-mono text-[11px] uppercase tracking-[0.12em] px-4 py-2 border transition-colors ${active === c ? "bg-obsidian text-ivory border-obsidian" : "border-obsidian/15 text-obsidian/60 hover:border-obsidian"}`}
            >
              {c}
            </Link>
          ))}
        </nav>

        {first && (
          <Link href={`/blog/${first.slug}`} className="group grid lg:grid-cols-[1.25fr_1fr] gap-6 lg:gap-12 items-center mb-16">
            <BlogCover post={first} className="transition-transform duration-500 group-hover:scale-[1.01]" />
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-rosewood mb-3">{first.category} · {readingMinutes(first)} min</p>
              <h2 className="font-archivo font-black uppercase tracking-tight text-3xl lg:text-5xl leading-[0.95] group-hover:text-rosewood transition-colors">{first.title}</h2>
              <p className="text-obsidian/60 text-lg mt-4 leading-relaxed">{first.description}</p>
              <p className="font-mono text-xs text-obsidian/40 mt-5">{formatDate(first.updatedAt ?? first.publishedAt)} · Leggi →</p>
            </div>
          </Link>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
          {rest.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="group">
              <BlogCover post={p} className="mb-5 transition-transform duration-500 group-hover:scale-[1.02]" />
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-rosewood mb-2">{p.category} · {readingMinutes(p)} min</p>
              <h2 className="font-archivo font-black uppercase tracking-tight text-xl lg:text-2xl leading-[1.02] group-hover:text-rosewood transition-colors">{p.title}</h2>
              <p className="text-obsidian/60 mt-3 leading-relaxed line-clamp-3">{p.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
