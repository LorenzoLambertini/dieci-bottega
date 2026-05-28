import { createHmac } from "node:crypto";

const SECRET =
  process.env.SCHEDULE_SECRET ??
  // Derive a stable per-deployment secret so links don't break across redeploys
  (process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "db-fallback-secret-rotate-me");

const TZ = "Europe/Rome";

export type Slot = {
  iso:       string; // ISO 8601 UTC
  dayShort:  string; // "Lun 30 mag"
  dayLong:   string; // "Lunedì 30 maggio"
  hour:      string; // "10:00"
  label:     string; // "Lunedì 30 maggio · 10:00"
};

/* ─── Token ─────────────────────────────────────────────── */

export function signSlot(leadId: string, slotIso: string): string {
  return createHmac("sha256", SECRET)
    .update(`${leadId}|${slotIso}`)
    .digest("hex")
    .slice(0, 24);
}

export function verifySlot(leadId: string, slotIso: string, token: string): boolean {
  if (!leadId || !slotIso || !token) return false;
  const expected = signSlot(leadId, slotIso);
  return timingSafeEqual(expected, token);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/* ─── Slot generation ───────────────────────────────────── */

const DOW_SHORT: Record<number, string> = {
  0: "Dom", 1: "Lun", 2: "Mar", 3: "Mer", 4: "Gio", 5: "Ven", 6: "Sab",
};
const DOW_LONG: Record<number, string> = {
  0: "Domenica", 1: "Lunedì", 2: "Martedì", 3: "Mercoledì", 4: "Giovedì", 5: "Venerdì", 6: "Sabato",
};
const MONTH_SHORT: Record<number, string> = {
  0: "gen", 1: "feb", 2: "mar", 3: "apr",  4: "mag",  5: "giu",
  6: "lug", 7: "ago", 8: "set", 9: "ott", 10: "nov", 11: "dic",
};
const MONTH_LONG: Record<number, string> = {
  0: "gennaio", 1: "febbraio", 2: "marzo",   3: "aprile",  4: "maggio",   5: "giugno",
  6: "luglio",  7: "agosto",   8: "settembre", 9: "ottobre", 10: "novembre", 11: "dicembre",
};

function pad(n: number): string { return n.toString().padStart(2, "0"); }

/** Get current parts in Europe/Rome timezone */
function nowInRome(): { y: number; m: number; d: number; dow: number } {
  const now = new Date();
  // Use Intl to extract parts in TZ
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric", month: "2-digit", day: "2-digit", weekday: "short",
  }).formatToParts(now);
  const map: Record<string, string> = {};
  parts.forEach(p => { if (p.type !== "literal") map[p.type] = p.value; });
  const dowMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    y:   parseInt(map.year,  10),
    m:   parseInt(map.month, 10) - 1,
    d:   parseInt(map.day,   10),
    dow: dowMap[map.weekday] ?? new Date().getDay(),
  };
}

/** Build an ISO 8601 string for a given date+time in Europe/Rome timezone */
function buildIsoForRome(y: number, m: number, d: number, hh: number, mm: number): string {
  // Detect DST offset for that specific date by formatting in TZ
  const probe = new Date(Date.UTC(y, m, d, 12, 0, 0));
  const offsetParts = new Intl.DateTimeFormat("en", {
    timeZone: TZ,
    timeZoneName: "longOffset",
  }).formatToParts(probe);
  const offsetStr = offsetParts.find(p => p.type === "timeZoneName")?.value ?? "GMT+01:00";
  // Format like "GMT+02:00" → "+02:00"
  const off = offsetStr.replace("GMT", "").trim() || "+01:00";
  return `${y}-${pad(m + 1)}-${pad(d)}T${pad(hh)}:${pad(mm)}:00${off}`;
}

const SLOT_TIMES: Array<[number, number]> = [
  [10, 0],
  [16, 30],
];

/** Generate 6 slots: next 3 business days × 2 times. */
export function generateSlots(): Slot[] {
  const slots: Slot[] = [];
  const now = nowInRome();

  // Start from tomorrow
  let candidate = new Date(Date.UTC(now.y, now.m, now.d));
  candidate.setUTCDate(candidate.getUTCDate() + 1);

  let safety = 0;
  while (slots.length < 6 && safety < 20) {
    const dow = candidate.getUTCDay();
    if (dow !== 0 && dow !== 6) {
      const y = candidate.getUTCFullYear();
      const mo = candidate.getUTCMonth();
      const d  = candidate.getUTCDate();
      for (const [h, m] of SLOT_TIMES) {
        const iso = buildIsoForRome(y, mo, d, h, m);
        slots.push({
          iso,
          dayShort: `${DOW_SHORT[dow]} ${d} ${MONTH_SHORT[mo]}`,
          dayLong:  `${DOW_LONG[dow]} ${d} ${MONTH_LONG[mo]}`,
          hour:     `${pad(h)}:${pad(m)}`,
          label:    `${DOW_LONG[dow]} ${d} ${MONTH_LONG[mo]} · ${pad(h)}:${pad(m)}`,
        });
        if (slots.length >= 6) break;
      }
    }
    candidate.setUTCDate(candidate.getUTCDate() + 1);
    safety++;
  }
  return slots;
}

/** Parse an ISO string into a human-readable label in IT locale */
export function formatSlotLabel(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const dow = d.toLocaleDateString("en", { weekday: "short", timeZone: TZ }) as keyof typeof DOW_LONG_BY_EN;
    const dowIt = DOW_LONG_BY_EN[dow] ?? "";
    const day   = parseInt(d.toLocaleDateString("en", { day: "numeric", timeZone: TZ }), 10);
    const monthIdx = parseInt(d.toLocaleDateString("en", { month: "numeric", timeZone: TZ }), 10) - 1;
    const hour  = d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
    return `${dowIt} ${day} ${MONTH_LONG[monthIdx]} · ${hour}`;
  } catch {
    return iso;
  }
}

const DOW_LONG_BY_EN: Record<string, string> = {
  Sun: "Domenica", Mon: "Lunedì", Tue: "Martedì", Wed: "Mercoledì",
  Thu: "Giovedì",  Fri: "Venerdì", Sat: "Sabato",
};
