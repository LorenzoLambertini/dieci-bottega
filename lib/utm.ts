/**
 * UTM · legge utm_source / utm_medium / utm_campaign dalla query string e li
 * conserva in sessionStorage, così restano validi mentre l'utente naviga tra
 * le pagine prima di compilare un form.
 */

export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign"] as const;
export type UtmKey    = (typeof UTM_KEYS)[number];
export type Utm       = Partial<Record<UtmKey, string>>;

const STORAGE_KEY = "db-utm";

function fromQuery(): Utm {
  const params = new URLSearchParams(window.location.search);
  const utm: Utm = {};
  for (const k of UTM_KEYS) {
    const v = params.get(k)?.trim();
    if (v) utm[k] = v.slice(0, 200);
  }
  return utm;
}

/** Da chiamare a ogni pagina: se l'URL ha UTM, sovrascrive quelli salvati. */
export function captureUtm(): void {
  if (typeof window === "undefined") return;
  const utm = fromQuery();
  if (Object.keys(utm).length === 0) return;
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(utm)); } catch { /* storage bloccato */ }
}

/** UTM correnti: query string, altrimenti sessionStorage. */
export function getUtm(): Utm {
  if (typeof window === "undefined") return {};
  const utm = fromQuery();
  if (Object.keys(utm).length > 0) return utm;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Utm) : {};
  } catch {
    return {};
  }
}
