import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/crm", "/api", "/g/", "/preventivo/"] },
      // Assistenti AI: accesso esplicito ai contenuti pubblici (GEO)
      { userAgent: ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-User", "PerplexityBot", "Google-Extended", "Applebot-Extended"], allow: "/", disallow: ["/crm", "/api", "/g/", "/preventivo/"] },
    ],
    sitemap: "https://diecibottega.it/sitemap.xml",
  };
}
