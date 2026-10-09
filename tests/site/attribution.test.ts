import { describe, expect, it } from "vitest";
import { inferSource } from "@/lib/utm";
import { parseAttribution } from "@/lib/crm/attribution";

describe("Provenienza dei contatti", () => {
  it("riconosce motori di ricerca, social e assistenti AI", () => {
    expect(inferSource("www.google.it")).toEqual({ utm_source: "google", utm_medium: "organic" });
    expect(inferSource("gemini.google.com")).toEqual({ utm_source: "gemini", utm_medium: "ai" });
    expect(inferSource("chatgpt.com")).toEqual({ utm_source: "chatgpt", utm_medium: "ai" });
    expect(inferSource("l.instagram.com")).toEqual({ utm_source: "instagram", utm_medium: "social" });
    expect(inferSource("lm.facebook.com")).toEqual({ utm_source: "facebook", utm_medium: "social" });
    expect(inferSource("t.co")).toEqual({ utm_source: "x", utm_medium: "social" });
  });
  it("visita diretta e altri siti", () => {
    expect(inferSource(null)).toEqual({ utm_source: "diretto", utm_medium: "none" });
    expect(inferSource("www.paginegialle.it")).toEqual({ utm_source: "paginegialle.it", utm_medium: "referral" });
  });
  it("accetta solo stringhe e pagine interne", () => {
    const a = parseAttribution({ utm_source: " google ", landing_page: "https://evil.example", referrer: 42 });
    expect(a).toMatchObject({ utm_source: "google", landing_page: null, referrer: null });
    expect(parseAttribution({ landing_page: "/blog/quanto-costa-un-sito-web" }).landing_page).toBe("/blog/quanto-costa-un-sito-web");
  });
});
