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

/* ─── Primo arrivo sul sito (attribuzione) ─────────────────────────────── */

const FIRST_TOUCH_KEY = "db-first-touch";

export interface FirstTouch {
  /** Prima pagina vista, es. "/blog/quanto-costa-un-sito-web" */
  landing_page: string;
  /** Sito da cui è arrivato (solo il dominio), es. "www.google.com" */
  referrer: string | null;
  first_seen: string;
}

/** Fonte dedotta dal sito di provenienza, quando il link non ha UTM. */
export function inferSource(referrerHost: string | null): Utm {
  if (!referrerHost) return { utm_source: "diretto", utm_medium: "none" };
  const h = referrerHost.toLowerCase().replace(/^www\./, "");
  const ai: Array<[RegExp, string]> = [
    [/(^|\.)chatgpt\.com$|(^|\.)openai\.com$/, "chatgpt"],
    [/(^|\.)perplexity\.ai$/, "perplexity"],
    [/^gemini\.google\.com$/, "gemini"],
    [/^copilot\.microsoft\.com$/, "copilot"],
    [/(^|\.)claude\.ai$/, "claude"],
  ];
  for (const [re, name] of ai) if (re.test(h)) return { utm_source: name, utm_medium: "ai" };
  const search: Array<[RegExp, string]> = [
    [/(^|\.)google\.[a-z.]+$/, "google"],
    [/(^|\.)bing\.com$/, "bing"],
    [/(^|\.)duckduckgo\.com$/, "duckduckgo"],
    [/(^|\.)ecosia\.org$/, "ecosia"],
    [/(^|\.)yahoo\.[a-z.]+$/, "yahoo"],
  ];
  for (const [re, name] of search) if (re.test(h)) return { utm_source: name, utm_medium: "organic" };
  const social: Array<[RegExp, string]> = [
    [/(^|\.)instagram\.com$/, "instagram"],
    [/(^|\.)facebook\.com$|(^|\.)fb\.me$/, "facebook"],
    [/(^|\.)linkedin\.com$|^lnkd\.in$/, "linkedin"],
    [/^t\.co$|(^|\.)x\.com$|(^|\.)twitter\.com$/, "x"],
    [/(^|\.)tiktok\.com$/, "tiktok"],
    [/(^|\.)whatsapp\.com$|^wa\.me$/, "whatsapp"],
    [/(^|\.)youtube\.com$/, "youtube"],
  ];
  for (const [re, name] of social) if (re.test(h)) return { utm_source: name, utm_medium: "social" };
  return { utm_source: h.slice(0, 100), utm_medium: "referral" };
}

/**
 * Da chiamare a ogni pagina: la prima volta nella sessione salva pagina d'ingresso e provenienza.
 * Resta solo nel browser (sessionStorage) e viene inviato soltanto se l'utente compila un form.
 */
export function captureFirstTouch(): void {
  if (typeof window === "undefined") return;
  try {
    if (sessionStorage.getItem(FIRST_TOUCH_KEY)) return;
    let referrer: string | null = null;
    if (document.referrer) {
      const host = new URL(document.referrer).hostname;
      if (host && host !== window.location.hostname) referrer = host;
    }
    const touch: FirstTouch = {
      landing_page: (window.location.pathname + window.location.search).slice(0, 300),
      referrer,
      first_seen: new Date().toISOString(),
    };
    sessionStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify(touch));
  } catch { /* storage bloccato o referrer non valido */ }
}

export function getFirstTouch(): FirstTouch | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(FIRST_TOUCH_KEY);
    return raw ? (JSON.parse(raw) as FirstTouch) : null;
  } catch {
    return null;
  }
}

/**
 * Tutto quello che serve al CRM per sapere da dove arriva un contatto:
 * UTM (se presenti, altrimenti dedotti dalla provenienza) + pagina d'ingresso.
 */
export function getAttribution(): Utm & { landing_page?: string; referrer?: string } {
  const touch = getFirstTouch();
  const utm = getUtm();
  const base = Object.keys(utm).length > 0 ? utm : touch ? inferSource(touch.referrer) : {};
  return {
    ...base,
    ...(touch?.landing_page ? { landing_page: touch.landing_page } : {}),
    ...(touch?.referrer ? { referrer: touch.referrer } : {}),
  };
}
