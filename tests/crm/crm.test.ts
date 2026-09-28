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
