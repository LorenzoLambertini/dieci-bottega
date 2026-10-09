/**
 * Registro degli articoli del blog.
 * Per pubblicare un nuovo articolo: crea lib/blog/posts/<slug>.ts e aggiungilo a POSTS qui sotto
 * (vedi .claude/skills/blog/SKILL.md).
 */
import type { BlogCategory, BlogPost } from "./types";
import { countWords } from "./markdown";
import quantoCostaSito from "./posts/quanto-costa-un-sito-web";
import vetrinaLanding from "./posts/sito-vetrina-o-landing-page";
import dieciErrori from "./posts/errori-sito-web-perdere-clienti";
import googleBusiness from "./posts/google-business-profile-guida";
import seoLocale from "./posts/seo-locale-bologna";
import sitoRistorante from "./posts/sito-web-ristorante";
import crmPmi from "./posts/crm-piccole-imprese";
import tempiSito from "./posts/quanto-tempo-per-fare-un-sito";
import geoChatgpt from "./posts/farsi-trovare-su-chatgpt-geo";
import manutenzione from "./posts/manutenzione-sito-web-costi";
import sitoBnb from "./posts/sito-web-bb-case-vacanza";
import wordpressWix from "./posts/wordpress-wix-o-sito-su-misura";
import instagramSito from "./posts/instagram-o-sito-web";
import videoSpot from "./posts/video-spot-aziendale-quanto-costa";
import risposteAi from "./posts/risposte-automatiche-instagram-ai";
import dominioEmail from "./posts/dominio-email-professionale";
import recensioniGoogle from "./posts/come-ottenere-recensioni-google";
import studioProfessionale from "./posts/sito-web-studio-professionale";
import velocitaSito from "./posts/velocita-sito-web";
import preventiviOnline from "./posts/preventivi-online-accettazione";

export const POSTS: BlogPost[] = [
  quantoCostaSito,
  vetrinaLanding,
  dieciErrori,
  googleBusiness,
  seoLocale,
  sitoRistorante,
  crmPmi,
  tempiSito,
  geoChatgpt,
  manutenzione,
  sitoBnb,
  wordpressWix,
  instagramSito,
  videoSpot,
  risposteAi,
  dominioEmail,
  recensioniGoogle,
  studioProfessionale,
  velocitaSito,
  preventiviOnline,
].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.title.localeCompare(b.title));

export const CATEGORIES: BlogCategory[] = ["Siti web", "Prezzi", "SEO e GEO", "Google", "CRM e automazioni", "Settori"];

export const BLOG_URL = "https://diecibottega.it/blog";

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export function readingMinutes(p: BlogPost): number {
  const words = countWords([p.tldr.join(" "), p.body, ...p.faq.map((f) => `${f.q} ${f.a}`)].join(" "));
  return Math.max(2, Math.round(words / 200));
}

export function relatedPosts(p: BlogPost, n = 3): BlogPost[] {
  const explicit = (p.related ?? []).map(getPost).filter((x): x is BlogPost => !!x && x.slug !== p.slug);
  const sameCat = POSTS.filter((x) => x.slug !== p.slug && x.category === p.category && !explicit.includes(x));
  const others = POSTS.filter((x) => x.slug !== p.slug && !explicit.includes(x) && !sameCat.includes(x));
  return [...explicit, ...sameCat, ...others].slice(0, n);
}

export function formatDate(d: string): string {
  return new Date(`${d}T12:00:00Z`).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
}
