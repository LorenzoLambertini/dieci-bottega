/**
 * Metriche Lighthouse (mobile, mediana di 3 passaggi) dei siti concept prima/dopo.
 * NON scrivere numeri a mano: il file si rigenera con `npm run concept:measure`,
 * che misura le pagine in public/concept-demo e aggiorna anche concept-redesign/metriche.json.
 * Finché è vuoto, le pagine dei casi studio non mostrano il riquadro delle metriche.
 */

export interface LighthouseRun {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  /** Largest Contentful Paint, millisecondi */
  lcp: number;
  cls: number;
  /** Total Blocking Time, millisecondi */
  tbt: number;
  /** Peso totale della pagina, byte */
  bytes: number;
  requests: number;
}

export interface ConceptMetrics {
  measuredAt: string;
  prima: LighthouseRun;
  dopo: LighthouseRun;
}

export const CONCEPT_METRICS: Record<string, ConceptMetrics> = {};
