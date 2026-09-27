/**
 * Regole deterministiche — valutate PRIMA di chiamare Claude (cost control).
 *
 * Ordine nel motore:
 *   1. regole di automazione configurate (keyword su commento/DM)
 *   2. keyword delle guide attive (solo messaggi brevi, es. "GUIDA")
 *   3. commenti a basso valore (solo emoji / "bello!") → nessuna chiamata AI
 *   4. tutto il resto → Claude
 */
import type { AutomationRuleRow, GuideRow, Platform } from "./types";

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // accenti
    .replace(/[^\p{L}\p{N}\s]/gu, " ") // punteggiatura ed emoji
    .replace(/\s+/g, " ")
    .trim();
}

function words(text: string): string[] {
  const n = normalize(text);
  return n ? n.split(" ") : [];
}

/** La keyword (anche multi-parola) compare come parola intera nel testo. */
export function containsKeyword(text: string, keyword: string): boolean {
  const t = ` ${normalize(text)} `;
  const k = normalize(keyword);
  return k.length > 0 && t.includes(` ${k} `);
}

/** Lista keyword "a, b, c" → ["a","b","c"] */
export function parseKeywords(value: string): string[] {
  return value
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const FILLER = new Set([
  "la", "il", "lo", "una", "un", "mi", "me", "per", "favore", "grazie", "pls", "please",
  "mandi", "mandate", "manda", "inviate", "invia", "vorrei", "voglio", "ciao", "info", "si",
]);

/**
 * Una guida si attiva senza AI solo se il messaggio è essenzialmente la keyword
 * ("GUIDA", "guida sito per favore"), non se la keyword compare in una frase
 * più articolata ("quanto costa un sito?" → va a Claude).
 */
export function matchGuideDeterministic(text: string, guides: GuideRow[], platform: Platform): GuideRow | null {
  const w = words(text);
  if (w.length === 0 || w.length > 6) return null;
  const meaningful = w.filter((x) => !FILLER.has(x));
  if (meaningful.length > 3) return null;
  for (const g of guides) {
    if (!g.active) continue;
    if (g.platforms.length && !g.platforms.includes(platform)) continue;
    const kws = [...g.trigger_keywords].sort((a, b) => normalize(b).length - normalize(a).length);
    for (const k of kws) {
      const nk = normalize(k);
      if (!nk) continue;
      const kw = nk.split(" ");
      // tutte le parole significative devono appartenere alla keyword
      if (containsKeyword(text, k) && meaningful.every((m) => kw.includes(m))) return g;
    }
  }
  return null;
}

/** Commenti che non meritano una risposta AI (emoji, tag di amici, complimenti brevi). */
export function isLowValueComment(text: string): boolean {
  const raw = text.trim();
  if (!raw) return true;
  const withoutMentions = raw.replace(/@[\w.]+/g, "").trim();
  if (!withoutMentions) return true; // solo tag di amici
  const w = words(withoutMentions);
  if (w.length === 0) return true; // solo emoji/punteggiatura
  if (raw.includes("?")) return false;
  const PRAISE = new Set(["bello", "bella", "top", "wow", "grande", "bravi", "bravo", "brava", "stupendo", "fantastico", "complimenti", "super", "ottimo", "bellissimo", "bellissima", "love", "nice", "cool", "fire"]);
  return w.length <= 3 && w.every((x) => PRAISE.has(x) || FILLER.has(x));
}

export interface RuleContext {
  platform: Platform;
  kind: "message" | "comment";
  text: string;
  intent?: string | null;
  leadScore?: number;
}

/** Regole attive che scattano sul contenuto (keyword). Ordinate per priorità. */
export function matchContentRules(rules: AutomationRuleRow[], ctx: RuleContext): AutomationRuleRow[] {
  return rules
    .filter((r) => r.enabled && (r.platform === "all" || r.platform === ctx.platform))
    .filter((r) => {
      if (r.trigger_type === "comment_keyword" && ctx.kind !== "comment") return false;
      if (r.trigger_type === "dm_keyword" && ctx.kind !== "message") return false;
      if (!["comment_keyword", "dm_keyword", "any_keyword"].includes(r.trigger_type)) return false;
      return parseKeywords(r.trigger_value).some((k) => containsKeyword(ctx.text, k));
    })
    .sort((a, b) => a.priority - b.priority);
}

/** Regole che scattano dopo la decisione AI (intent / lead score). */
export function matchPostDecisionRules(
  rules: AutomationRuleRow[],
  ctx: RuleContext & { previousScore: number }
): AutomationRuleRow[] {
  return rules
    .filter((r) => r.enabled && (r.platform === "all" || r.platform === ctx.platform))
    .filter((r) => {
      if (r.trigger_type === "intent") {
        return !!ctx.intent && parseKeywords(r.trigger_value).includes(ctx.intent);
      }
      if (r.trigger_type === "lead_score_above") {
        const threshold = Number(r.trigger_value);
        if (!Number.isFinite(threshold)) return false;
        // scatta solo quando la soglia viene superata, non a ogni messaggio
        return ctx.previousScore <= threshold && (ctx.leadScore ?? 0) > threshold;
      }
      return false;
    })
    .sort((a, b) => a.priority - b.priority);
}
