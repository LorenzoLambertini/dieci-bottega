import type { MetadataRoute } from "next";
import { SERVICES } from "@/lib/services";
import { POSTS } from "@/lib/blog";

const BASE = "https://diecibottega.it";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "monthly", priority: 1 },
    ...["/servizi", "/soluzioni", "/progetti", "/chi-siamo", "/contatti", "/inizia-progetto"].map((p) => ({
      url: `${BASE}${p}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: `${BASE}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/guide/checklist-sito-web-pmi`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
  ];
  const services = SERVICES.map((s) => ({ url: `${BASE}/servizi/${s.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 }));
  const posts = POSTS.map((p) => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: new Date(`${p.updatedAt ?? p.publishedAt}T12:00:00Z`),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));
  return [...pages, ...services, ...posts];
}
