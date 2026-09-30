import { describe, expect, it } from "vitest";
import { POSTS, getPost, relatedPosts, readingMinutes } from "@/lib/blog";
import { extractHeadings, slugifyHeading } from "@/lib/blog/markdown";
import { validateComment } from "@/lib/blog/comments";
import { SERVICES } from "@/lib/services";

const STATIC = new Set(["/servizi", "/inizia-progetto", "/progetti", "/contatti", "/chi-siamo", "/privacy", "/blog", "/llms.txt", "/guide/checklist-sito-web-pmi"]);
const validLink = (href: string) => {
  const path = href.split("#")[0];
  if (STATIC.has(path)) return true;
  if (path.startsWith("/servizi/")) return SERVICES.some((s) => `/servizi/${s.slug}` === path);
  if (path.startsWith("/blog/")) return POSTS.some((p) => `/blog/${p.slug}` === path);
  return false;
};

describe("Articoli del blog", () => {
  it("ha 10+ articoli con slug unici e ben formati", () => {
    expect(POSTS.length).toBeGreaterThanOrEqual(10);
    expect(new Set(POSTS.map((p) => p.slug)).size).toBe(POSTS.length);
    for (const p of POSTS) expect(p.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it.each(POSTS.map((p) => [p.slug, p] as const))("%s: SEO/GEO completo", (_slug, p) => {
    expect((p.seoTitle ?? p.title).length).toBeLessThanOrEqual(62);
    expect(p.description.length).toBeGreaterThanOrEqual(110);
    expect(p.description.length).toBeLessThanOrEqual(160);
    expect(p.keywords.length).toBeGreaterThanOrEqual(3);
    expect(p.tldr.length).toBeGreaterThanOrEqual(3);
    expect(p.faq.length).toBeGreaterThanOrEqual(3);
    expect(extractHeadings(p.body).length).toBeGreaterThanOrEqual(4);
    expect(p.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    // link interni: esistono davvero e c'è sempre un invito all'azione
    const links = [...p.body.matchAll(/\]\((\/[^)]*)\)/g)].map((m) => m[1]);
    expect(links.length).toBeGreaterThanOrEqual(2);
    for (const l of links) expect(validLink(l), `link rotto ${l}`).toBe(true);
    expect(links).toContain("/inizia-progetto");
    for (const r of p.related ?? []) expect(getPost(r), `related ${r}`).toBeTruthy();
    expect(readingMinutes(p)).toBeGreaterThanOrEqual(2);
  });

  it("articoli collegati: mai lo stesso articolo", () => {
    for (const p of POSTS) expect(relatedPosts(p).every((r) => r.slug !== p.slug)).toBe(true);
  });

  it("ancore dei titoli stabili e senza accenti", () => {
    expect(slugifyHeading("Perché i prezzi sono così diversi?")).toBe("perche-i-prezzi-sono-cosi-diversi");
  });
});

describe("Commenti: anti-spam e validazione", () => {
  const ok = { name: "Anna", email: "", body: "Articolo utile, grazie!", website: "", startedAt: Date.now() - 10_000, consent: true };
  it("accetta un commento normale", () => {
    expect(validateComment(ok)).toMatchObject({ ok: true, data: { name: "Anna", email: null } });
  });
  it("blocca bot (campo trappola, invio troppo veloce, troppi link)", () => {
    expect(validateComment({ ...ok, website: "http://spam" })).toMatchObject({ ok: false, spam: true });
    expect(validateComment({ ...ok, startedAt: Date.now() })).toMatchObject({ ok: false, spam: true });
    expect(validateComment({ ...ok, body: "http://a http://b http://c" })).toMatchObject({ ok: false, spam: true });
  });
  it("richiede consenso, nome e testo validi", () => {
    expect(validateComment({ ...ok, consent: false }).ok).toBe(false);
    expect(validateComment({ ...ok, name: "A" }).ok).toBe(false);
    expect(validateComment({ ...ok, body: "" }).ok).toBe(false);
    expect(validateComment({ ...ok, email: "non-una-email" }).ok).toBe(false);
  });
});
