import { describe, expect, it } from "vitest";
import { computeToday, romeOffset } from "@/lib/crm/today";
import { checklistFor, sanitizeChecklist } from "@/lib/crm/checklists";

function fakeDb(tables: Record<string, { data?: unknown[]; count?: number }>) {
  return {
    from(t: string) {
      const res = { data: tables[t]?.data ?? [], count: tables[t]?.count ?? 0, error: null };
      const b: unknown = new Proxy({}, { get: (_o, k) => (k === "then" ? (ok: (v: unknown) => unknown) => Promise.resolve(res).then(ok) : () => b) });
      return b;
    },
  } as never;
}

describe("Ora italiana", () => {
  it("ora legale e solare", () => {
    expect(romeOffset(new Date("2026-07-01T12:00:00Z"))).toBe("+02:00");
    expect(romeOffset(new Date("2026-12-01T12:00:00Z"))).toBe("+01:00");
  });
});

describe("Oggi", () => {
  it("ordina call, promemoria scaduti, chat, preventivi fermi", async () => {
    const now = new Date("2026-09-29T08:00:00Z");
    const t = await computeToday(
      fakeDb({
        leads: { data: [{ id: "L1", name: "Mario", company: null, next_action_at: "2026-09-27T07:00:00Z", next_action_note: "Richiamare", metadata: { scheduled_slot: "2026-09-29T13:00:00Z" }, created_at: "2026-09-29T06:00:00Z", updated_at: "2026-09-29T06:00:00Z", source: "website" }], count: 1 },
        quotes: { data: [{ id: "Q1", number: "2026-001", title: "Sito", total: 1500, sent_at: "2026-09-20T08:00:00Z", viewed_at: null, lead_id: "L1", lead: { name: "Mario" } }] },
        social_conversations: { count: 2 },
      }),
      now
    );
    const kinds = t.actions.map((a) => a.kind);
    expect(kinds[0]).toBe("call");
    expect(t.actions[0].detail).toBe("alle 15:00");
    expect(kinds).toContain("followup");
    expect(t.actions.find((a) => a.kind === "followup")!.late).toBe(true);
    expect(kinds).toContain("chat");
    expect(t.actions.find((a) => a.kind === "quote")!.title).toContain("fermo da 9 giorni");
    expect(t.counters.openQuotesValue).toBe(1500);
  });
});

describe("Checklist", () => {
  it("modello in base al tipo di progetto", () => {
    expect(checklistFor("E-commerce Bar Mario").some((i) => i.label.includes("Catalogo"))).toBe(true);
    expect(checklistFor("Sito vetrina").some((i) => i.label.includes("Google Business"))).toBe(true);
    expect(checklistFor("Landing page").some((i) => i.label.includes("landing"))).toBe(true);
    expect(sanitizeChecklist([{ label: " a ", done: 1 }, { label: "" }, "x"])).toEqual([{ label: "a", done: true }]);
  });
});
