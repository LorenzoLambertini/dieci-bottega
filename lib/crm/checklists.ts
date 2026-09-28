/** Checklist di avvio progetto: materiali da chiedere al cliente e passi di lavoro, per tipo di servizio. */
export interface CheckItem {
  label: string;
  done: boolean;
}

const COMMON_START = ["Brief compilato con il cliente", "Acconto ricevuto"];
const COMMON_END = ["Revisione finale approvata dal cliente", "Pubblicazione online", "Saldo ricevuto", "Chiedere una recensione"];

const TEMPLATES: { match: RegExp; items: string[] }[] = [
  {
    match: /e-?commerce|shop|negozio/i,
    items: ["Logo e colori del brand", "Catalogo prodotti (nomi, prezzi, varianti)", "Foto dei prodotti", "Metodi di pagamento attivati", "Spedizioni e costi", "Regole IVA e fatturazione", "Condizioni di vendita, resi, privacy", "Dominio e email"],
  },
  {
    match: /landing/i,
    items: ["Obiettivo della landing e offerta", "Testi e call to action", "Foto o video", "Collegamento form → CRM", "Pixel / tracciamenti campagne"],
  },
  {
    match: /crm|dashboard|automazion|gestionale/i,
    items: ["Processo attuale mappato", "Elenco utenti e ruoli", "Dati da importare", "Integrazioni necessarie", "Formazione del team"],
  },
  {
    match: /sito|vetrina|web/i,
    items: ["Logo e colori del brand", "Testi delle pagine (chi siamo, servizi, contatti)", "Foto dell'attività", "Elenco servizi e prezzi indicativi", "Contatti, orari, indirizzo", "Siti di concorrenti o esempi che piacciono", "Dominio e email", "Google Business Profile"],
  },
];

export function checklistFor(projectName: string): CheckItem[] {
  const t = TEMPLATES.find((x) => x.match.test(projectName)) ?? TEMPLATES[TEMPLATES.length - 1];
  return [...COMMON_START, ...t.items, ...COMMON_END].map((label) => ({ label, done: false }));
}

export function sanitizeChecklist(raw: unknown): CheckItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((r) => ({ label: String((r as CheckItem)?.label ?? "").trim().slice(0, 160), done: !!(r as CheckItem)?.done }))
    .filter((r) => r.label)
    .slice(0, 60);
}
