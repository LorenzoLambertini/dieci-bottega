/** Preventivi: calcolo totali e numerazione. Condiviso tra CRM e pagina pubblica. */

export interface QuoteItem {
  description: string;
  qty: number;
  unit_price: number;
  unit?: string; // "una tantum" | "mese" | "anno"
}

export function sanitizeItems(raw: unknown): QuoteItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((r) => {
      const o = (r ?? {}) as Record<string, unknown>;
      return {
        description: String(o.description ?? "").trim().slice(0, 300),
        qty: Math.max(0, Math.min(1000, Number(o.qty) || 0)),
        unit_price: Math.max(0, Math.min(1_000_000, Math.round((Number(o.unit_price) || 0) * 100) / 100)),
        unit: typeof o.unit === "string" ? o.unit.slice(0, 20) : undefined,
      };
    })
    .filter((i) => i.description && i.qty > 0)
    .slice(0, 50);
}

export function quoteTotals(items: QuoteItem[], discount: number) {
  const subtotal = Math.round(items.reduce((s, i) => s + i.qty * i.unit_price, 0) * 100) / 100;
  const d = Math.max(0, Math.min(subtotal, Number(discount) || 0));
  return { subtotal, discount: d, total: Math.round((subtotal - d) * 100) / 100 };
}

export function eur(n: number): string {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: n % 1 ? 2 : 0 }).format(n);
}

export function nextQuoteNumber(year: number, existing: string[]): string {
  const prefix = `${year}-`;
  const max = existing
    .filter((n) => n.startsWith(prefix))
    .map((n) => parseInt(n.slice(prefix.length), 10) || 0)
    .reduce((a, b) => Math.max(a, b), 0);
  return `${prefix}${String(max + 1).padStart(3, "0")}`;
}

export const QUOTE_STATUS_LABEL: Record<string, string> = {
  draft: "Bozza",
  sent: "Inviato",
  accepted: "Accettato",
  rejected: "Rifiutato",
};
