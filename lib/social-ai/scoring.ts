/**
 * Lead scoring — deterministico e documentato.
 *
 * Claude NON sceglie il punteggio: rileva dei "segnali" nel messaggio
 * (richiesta prezzo, preventivo, tempistiche…). Il backend somma i pesi
 * dei segnali accumulati nella conversazione (ognuno conta una sola volta),
 * applica i segnali negativi e limita a 0–100.
 *
 * Pesi e soglie sono modificabili da /crm/settings/social-ai
 * (colonna social_ai_settings.scoring_config), questi sono i default.
 */
import type { Temperature } from "./types";

export interface ScoringConfig {
  weights: Record<string, number>;
  /** Soglie (estremo inferiore incluso). */
  bands: { warm: number; qualified: number; hot: number };
}

export const DEFAULT_SCORING: ScoringConfig = {
  weights: {
    price_request: 15,     // "quanto costa?"
    quote_request: 25,     // "potete farmi un preventivo?"
    purchase_intent: 20,   // "voglio rifare il sito", "ci serve un ecommerce"
    timeline: 10,          // tempistiche dichiarate ("entro marzo")
    specific_service: 10,  // servizio preciso (sito, ecommerce, CRM, SEO…)
    real_company: 10,      // attività/azienda reale identificata
    budget: 15,            // budget dichiarato
    call_request: 20,      // chiede una call / appuntamento
    contact_request: 10,   // lascia o chiede un contatto
    guide_download: 5,     // ha richiesto una guida (lead magnet)
    case_study_interest: 5,// chiede esempi / lavori
    not_interested: -25,   // "non mi interessa"
    spam: -100,
  },
  bands: { warm: 30, qualified: 60, hot: 80 },
};

export const SIGNAL_LABELS: Record<string, string> = {
  price_request: "Richiesta prezzo",
  quote_request: "Richiesta preventivo",
  purchase_intent: "Intenzione d'acquisto",
  timeline: "Tempistiche dichiarate",
  specific_service: "Servizio specifico",
  real_company: "Azienda reale",
  budget: "Budget dichiarato",
  call_request: "Richiesta call",
  contact_request: "Richiesta contatto",
  guide_download: "Guida scaricata",
  case_study_interest: "Interesse per casi studio",
  not_interested: "Non interessato",
  spam: "Spam",
};

export const KNOWN_SIGNALS = Object.keys(DEFAULT_SCORING.weights);

export function resolveScoringConfig(raw: Record<string, unknown> | null | undefined): ScoringConfig {
  const cfg: ScoringConfig = {
    weights: { ...DEFAULT_SCORING.weights },
    bands: { ...DEFAULT_SCORING.bands },
  };
  if (!raw || typeof raw !== "object") return cfg;
  const w = (raw as { weights?: unknown }).weights;
  if (w && typeof w === "object") {
    for (const [k, v] of Object.entries(w as Record<string, unknown>)) {
      if (typeof v === "number" && Number.isFinite(v) && Math.abs(v) <= 100) cfg.weights[k] = v;
    }
  }
  const b = (raw as { bands?: unknown }).bands;
  if (b && typeof b === "object") {
    for (const key of ["warm", "qualified", "hot"] as const) {
      const v = (b as Record<string, unknown>)[key];
      if (typeof v === "number" && v >= 0 && v <= 100) cfg.bands[key] = v;
    }
  }
  return cfg;
}

/** Unisce i segnali già noti con i nuovi, scartando quelli sconosciuti. */
export function mergeSignals(existing: string[], incoming: string[], cfg: ScoringConfig = DEFAULT_SCORING): string[] {
  const set = new Set(existing.filter((s) => s in cfg.weights));
  for (const s of incoming) if (s in cfg.weights) set.add(s);
  // "not_interested" viene superato da un segnale d'acquisto successivo
  if (incoming.some((s) => (cfg.weights[s] ?? 0) >= 15)) set.delete("not_interested");
  return [...set].sort();
}

export function computeScore(signals: string[], cfg: ScoringConfig = DEFAULT_SCORING): number {
  const total = signals.reduce((sum, s) => sum + (cfg.weights[s] ?? 0), 0);
  return Math.max(0, Math.min(100, Math.round(total)));
}

export type ScoreBand = "cold" | "warm" | "qualified" | "hot";

export function scoreBand(score: number, cfg: ScoringConfig = DEFAULT_SCORING): ScoreBand {
  if (score >= cfg.bands.hot) return "hot";
  if (score >= cfg.bands.qualified) return "qualified";
  if (score >= cfg.bands.warm) return "warm";
  return "cold";
}

/** Temperatura a 3 livelli (cold / warm / hot): "qualified" è una temperatura warm. */
export function temperatureFor(score: number, cfg: ScoringConfig = DEFAULT_SCORING): Temperature {
  const band = scoreBand(score, cfg);
  return band === "hot" ? "hot" : band === "cold" ? "cold" : "warm";
}

/** True quando il punteggio attraversa la soglia "hot" (per notificare una volta sola). */
export function becameHot(prev: number, next: number, cfg: ScoringConfig = DEFAULT_SCORING): boolean {
  return prev < cfg.bands.hot && next >= cfg.bands.hot;
}
