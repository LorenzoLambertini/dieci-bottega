/** Feed RSS del blog. */
import { BLOG_URL, POSTS } from "@/lib/blog";
import { AUTHORS } from "@/lib/blog/authors";

export const dynamic = "force-static";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function GET() {
  const items = POSTS.map(
    (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${BLOG_URL}/${p.slug}</link>
      <guid isPermaLink="true">${BLOG_URL}/${p.slug}</guid>
      <description>${esc(p.description)}</description>
      <category>${esc(p.category)}</category>
      <dc:creator>${esc(AUTHORS[p.author].name)}</dc:creator>
      <pubDate>${new Date(`${p.publishedAt}T08:00:00Z`).toUTCString()}</pubDate>
    </item>`
  ).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Il blog di Dieci Bottega</title>
    <link>${BLOG_URL}</link>
    <atom:link href="${BLOG_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <description>Guide pratiche per PMI: siti web, SEO, Google, AI e automazioni.</description>
    <language>it-IT</language>
${items}
  </channel>
</rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
