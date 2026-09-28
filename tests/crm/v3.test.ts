import { describe, expect, it } from "vitest";
import { parseCsv } from "@/lib/crm/csv";
import { nextQuoteNumber, quoteTotals, sanitizeItems } from "@/lib/crm/quotes";
import { fillTemplate, textToHtml } from "@/lib/crm/email";
import { toIcs, type CalEvent } from "@/lib/crm/calendar";

describe("CSV", () => {
  it("separatore ; di Excel italiano, virgolette e a capo nelle celle", () => {
    const rows = parseCsv('﻿Nome;Email;Note\r\n"Rossi; Mario";mario@x.it;"riga 1\nriga 2"\r\nBianchi;;"dice ""ciao"""\r\n');
    expect(rows).toEqual([["Nome", "Email", "Note"], ["Rossi; Mario", "mario@x.it", "riga 1\nriga 2"], ["Bianchi", "", 'dice "ciao"']]);
  });
  it("separatore virgola", () => {
    expect(parseCsv("a,b\n1,2")).toEqual([["a", "b"], ["1", "2"]]);
  });
});

describe("Preventivi", () => {
  it("totali, sconto limitato al subtotale, voci ripulite", () => {
    const items = sanitizeItems([{ description: "Sito", qty: 1, unit_price: 1500 }, { description: "", qty: 1, unit_price: 9 }, { description: "Care", qty: 12, unit_price: 79 }]);
    expect(items).toHaveLength(2);
    expect(quoteTotals(items, 200)).toEqual({ subtotal: 2448, discount: 200, total: 2248 });
    expect(quoteTotals(items, 99999).total).toBe(0);
  });
  it("numerazione progressiva per anno", () => {
    expect(nextQuoteNumber(2026, [])).toBe("2026-001");
    expect(nextQuoteNumber(2026, ["2026-001", "2026-009", "2025-044"])).toBe("2026-010");
  });
});

describe("Email", () => {
  it("variabili dei modelli ed escape HTML", () => {
    expect(fillTemplate("Ciao {{nome}}, {{ mittente }}", { nome: "Anna", mittente: "Lorenzo" })).toBe("Ciao Anna, Lorenzo");
    const html = textToHtml("Ciao <b>\n\nhttps://diecibottega.it/preventivo/abc");
    expect(html).toContain("Ciao &lt;b&gt;");
    expect(html).toContain('<a href="https://diecibottega.it/preventivo/abc"');
  });
});

describe("Calendario .ics", () => {
  it("eventi con orario e giornate intere, testo con escape", () => {
    const ev: CalEvent[] = [
      { id: "call-1", kind: "call", title: "Call con Rossi, Bar", start: "2026-10-01T08:00:00.000Z", allDay: false, leadId: "L1" },
      { id: "due-1", kind: "due", title: "Consegna: Sito", start: "2026-10-05T08:00:00.000Z", allDay: true, leadId: "L2" },
    ];
    const ics = toIcs(ev, "https://diecibottega.it");
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("DTSTART:20261001T080000Z");
    expect(ics).toContain("DTEND:20261001T083000Z");
    expect(ics).toContain("DTSTART;VALUE=DATE:20261005");
    expect(ics).toContain("DTEND;VALUE=DATE:20261006");
    expect(ics).toContain("Rossi\\, Bar");
    expect(ics.split("\r\n").every((l) => l.length <= 75)).toBe(true);
  });
});
