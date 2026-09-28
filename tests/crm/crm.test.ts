import { describe, expect, it } from "vitest";
import { whatsappNumber } from "@/components/crm/ContactButtons";
import { applyLeadFilters, cleanSearch } from "@/lib/crm/lead-filters";

describe("WhatsApp", () => {
  it("normalizza i numeri italiani", () => {
    expect(whatsappNumber("333 123 4567")).toBe("393331234567");
    expect(whatsappNumber("+39 333 123 4567")).toBe("393331234567");
    expect(whatsappNumber("0039 3331234567")).toBe("393331234567");
    expect(whatsappNumber("+44 7700 900123")).toBe("447700900123");
    expect(whatsappNumber("123")).toBeNull();
  });
});

describe("Ricerca contatti", () => {
  it("rimuove i caratteri che rompono i filtri", () => {
    expect(cleanSearch("Rossi, Mario (bar)")).toBe("Rossi Mario bar");
    expect(cleanSearch("  a*b%c  ")).toBe("a b c");
    expect(cleanSearch(undefined)).toBe("");
  });

  it("applica i filtri alla query", () => {
    const calls: [string, unknown[]][] = [];
    const q = new Proxy({}, { get: (_t, k: string) => (...a: unknown[]) => (calls.push([k, a]), q) });
    applyLeadFilters(q, { q: "Rossi, M", status: "won", follow: "due", channel: "social", stage: "S1" });
    expect(calls.map((c) => c[0])).toEqual(["or", "eq", "eq", "in", "lte"]);
    expect(String(calls[0][1][0])).toContain("name.ilike.%Rossi M%");
    applyLeadFilters(q, { status: "hacked" });
    expect(calls.filter((c) => c[0] === "eq" && c[1][1] === "hacked")).toHaveLength(0);
  });
});

import { buildDigest } from "@/lib/crm/digest";

/** DB finto: ogni tabella restituisce i dati indicati, qualunque filtro venga applicato. */
function fakeDb(tables: Record<string, { data?: unknown[]; count?: number }>) {
  return {
    from(t: string) {
      const res = { data: tables[t]?.data ?? [], count: tables[t]?.count ?? 0, error: null };
      const b: Record<string, unknown> = {};
      for (const m of ["select", "lte", "gte", "eq", "order", "limit"]) b[m] = () => b;
      b.then = (ok: (v: unknown) => unknown) => Promise.resolve(res).then(ok);
      return b;
    },
  } as never;
}

describe("Email del mattino", () => {
  it("niente da segnalare → nessuna email", async () => {
    expect(await buildDigest(fakeDb({}))).toBeNull();
  });

  it("promemoria, nuovi contatti e chat nel riepilogo, con escape HTML", async () => {
    const now = new Date("2026-09-29T07:00:00Z");
    const d = await buildDigest(
      fakeDb({
        leads: { data: [{ id: "L1", name: "Mario <b>", company: "Bar", next_action_at: "2026-09-28T10:00:00Z", next_action_note: "Preventivo", source: "instagram" }] },
        social_conversations: { count: 2 },
      }),
      now
    );
    expect(d).not.toBeNull();
    expect(d!.subject).toContain("1 da ricontattare");
    expect(d!.subject).toContain("2 chat da seguire");
    expect(d!.html).toContain("Mario &lt;b&gt;");
    expect(d!.html).toContain("Scaduto");
    expect(d!.text).toContain("/crm/leads/L1");
  });
});

describe("Filtro tag", () => {
  it("usa l'embed inner solo con un id valido", async () => {
    const { tagFilterSelect } = await import("@/lib/crm/lead-filters");
    expect(tagFilterSelect({ tag: "7c9e6679-7425-40de-944b-e07fc1f90ae7" })).toContain("lead_tags!inner");
    expect(tagFilterSelect({ tag: "x);drop" })).toBe("");
  });
});
