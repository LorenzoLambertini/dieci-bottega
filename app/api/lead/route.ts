/**
 * /api/lead — endpoint chatbot
 *
 * Riusa la stessa pipeline di /api/contact:
 * 1. Salva lead in tabella `leads` (Supabase) via Edge Function capture-lead
 *    → stage automatico "Nuovo contatto", source "chatbot"
 * 2. Email notifica al team (lollo + tommaso su Gmail)
 * 3. Email conferma al cliente con 6 slot orari cliccabili
 */

import { NextRequest, NextResponse } from "next/server";
import { generateSlots, signSlot, type Slot } from "@/lib/scheduling";

const RESEND_API = "https://api.resend.com/emails";

interface LeadPayload {
  type:     "quote" | "contact";
  name:     string;
  email:    string;
  phone?:   string;
  business?:string;
  message?: string;
  package?: "BASIC" | "PRO" | "PREMIUM" | null;
  source?:  string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function captureLead(p: LeadPayload): Promise<{ id: string } | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://voyhwqqubcathcvjatyk.supabase.co";

  // Map chatbot payload → Edge Function format
  const message = [
    p.business ? `Tipo attività: ${p.business}`         : null,
    p.package  ? `Pacchetto interessato: ${p.package}`  : null,
    p.message  ? `\n${p.message}`                       : null,
  ].filter(Boolean).join("\n");

  const recommendation = p.package
    ? {
        product: `Pacchetto ${p.package}`,
        tier:    p.package === "BASIC" ? "TIER 01 · BASIC" : p.package === "PRO" ? "TIER 02 · PRO" : "TIER 03 · PREMIUM",
        price:   p.package === "BASIC" ? "800–1.000€" : p.package === "PRO" ? "1.500–2.000€" : "2.500–3.500€",
        time:    p.package === "BASIC" ? "7 giorni"   : p.package === "PRO" ? "10–14 giorni" : "3–4 settimane",
        reason:  p.type === "quote" ? "Richiesta preventivo dalla chat" : "Contatto dalla chat",
      }
    : undefined;

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/capture-lead`, {
      method:  "POST",
      headers: { "Content-Type": "application/json", "Origin": "https://diecibottega.it" },
      body: JSON.stringify({
        name:    p.name.trim(),
        email:   p.email.trim().toLowerCase(),
        phone:   p.phone?.trim(),
        company: p.business?.trim(),
        message,
        source:  p.source ?? `chatbot-${p.type}`,
        recommendation,
      }),
    });
    if (!res.ok) {
      console.warn("[lead] capture-lead non-OK:", res.status);
      return null;
    }
    const data = await res.json() as { id?: string };
    return data.id ? { id: data.id } : null;
  } catch (e) {
    console.warn("[lead] capture-lead error:", e);
    return null;
  }
}

/* ─── Email templates ────────────────────────────────── */

function teamEmailHtml(p: LeadPayload, leadId: string | null): string {
  const rows = [
    ["Nome",     escapeHtml(p.name)],
    ["Email",    `<a href="mailto:${escapeHtml(p.email)}" style="color:#E63B2E">${escapeHtml(p.email)}</a>`],
    p.phone    ? ["Telefono",  escapeHtml(p.phone)]    : null,
    p.business ? ["Attività",  escapeHtml(p.business)] : null,
    p.package  ? ["Pacchetto", `<strong style="color:#E63B2E">${p.package}</strong>`] : null,
    ["Origine",  p.type === "quote" ? "Chat · Preventivo" : "Chat · Contatto"],
  ].filter(Boolean) as [string, string][];

  const table = rows
    .map(([k, v]) => `
      <tr>
        <td style="padding:8px 16px 8px 0;color:#999;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;font-family:Arial,sans-serif;vertical-align:top;white-space:nowrap">${k}</td>
        <td style="padding:8px 0;font-size:14px;color:#1A1414;font-family:Arial,sans-serif">${v}</td>
      </tr>`)
    .join("");

  const crmLink = leadId
    ? `<a href="https://diecibottega.it/crm/leads/${leadId}" style="color:#E63B2E;text-decoration:none">Apri scheda nel CRM →</a>`
    : `<a href="https://diecibottega.it/crm/leads" style="color:#E63B2E;text-decoration:none">Apri CRM →</a>`;

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#F4EFE6">
      <div style="background:#1A1414;padding:20px 32px">
        <p style="color:#E63B2E;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;margin:0;font-family:Arial,sans-serif;font-weight:700">
          ● DIECI BOTTEGA · CHATBOT
        </p>
        <p style="color:#F4EFE6;font-size:22px;margin:6px 0 0;font-weight:900;letter-spacing:-0.02em;text-transform:uppercase">
          Lead dalla chat
        </p>
      </div>

      <div style="padding:32px;background:#fff;border:1px solid #eee;border-top:none">
        <table style="border-collapse:collapse;width:100%">${table}</table>

        ${p.message ? `
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0 18px"/>
          <p style="color:#999;font-size:10px;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.14em">Messaggio</p>
          <p style="font-size:14px;line-height:1.7;white-space:pre-wrap;color:#1A1414;margin:0">${escapeHtml(p.message)}</p>
        ` : ""}

        <hr style="border:none;border-top:1px solid #eee;margin:24px 0 18px"/>
        <p style="margin:0;font-size:13px">${crmLink}</p>
      </div>

      <div style="padding:16px 32px;background:#f9f9f9;border:1px solid #eee;border-top:none">
        <p style="color:#aaa;font-size:11px;margin:0">
          Rispondi a questa email per scrivere direttamente al cliente — reply-to impostato.
        </p>
      </div>
    </div>
  `;
}

function customerEmailHtml(p: LeadPayload, slots: Array<Slot & { url: string }>): string {
  const firstName = p.name.trim().split(/\s+/)[0];

  const slotRows: string[] = [];
  for (let i = 0; i < slots.length; i += 2) {
    const a = slots[i], b = slots[i + 1];
    slotRows.push(`
      <tr>
        <td style="padding:4px 4px 4px 0;width:50%">${slotButton(a)}</td>
        <td style="padding:4px 0 4px 4px;width:50%">${b ? slotButton(b) : ""}</td>
      </tr>
    `);
  }
  const slotsTable = slots.length > 0
    ? `<table cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:separate;border-spacing:0">${slotRows.join("")}</table>`
    : "";

  const pkgBlock = p.package ? `
    <div style="margin:24px 0;padding:18px 22px;background:#fdf4f2;border:1px solid rgba(230,59,46,0.18)">
      <p style="margin:0 0 6px;color:#E63B2E;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;font-family:Arial,sans-serif;font-weight:700">
        ◆ DALLA CHAT
      </p>
      <p style="margin:0;color:#1A1414;font-size:14px;font-family:Arial,sans-serif;line-height:1.55">
        Hai indicato interesse per il pacchetto <strong>${p.package}</strong>.
      </p>
    </div>
  ` : "";

  return `
    <div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;background:#F4EFE6">
      <div style="background:#E63B2E;padding:40px 36px">
        <p style="color:rgba(244,239,230,0.7);font-size:10px;letter-spacing:0.18em;text-transform:uppercase;margin:0 0 12px;font-family:Arial,sans-serif">
          DIECI BOTTEGA · BOLOGNA
        </p>
        <h1 style="color:#F4EFE6;font-size:42px;margin:0;font-weight:900;letter-spacing:-0.035em;text-transform:uppercase;line-height:0.95">
          Grazie, ${escapeHtml(firstName)}.
        </h1>
        <p style="color:rgba(244,239,230,0.85);font-size:18px;margin:14px 0 0;font-family:Georgia,serif;font-style:italic;line-height:1.3">
          Quando ne parliamo?
        </p>
      </div>

      <div style="padding:36px;background:#fff">
        <p style="margin:0 0 16px;color:#1A1414;font-size:15px;line-height:1.7">Ciao ${escapeHtml(firstName)},</p>
        <p style="margin:0 0 16px;color:#333;font-size:15px;line-height:1.7">
          abbiamo ricevuto la tua richiesta dalla chat. Per non far perdere tempo a nessuno,
          ti proponiamo subito una <strong>call gratuita di 30 minuti</strong> — senza impegno.
          <strong>Scegli l&apos;orario che preferisci</strong>: ti basta un click.
        </p>

        ${pkgBlock}

        ${slots.length > 0 ? `
          <div style="margin:28px 0 8px;padding:24px;background:#F4EFE6;border:1px solid rgba(26,20,20,0.10)">
            <p style="margin:0 0 16px;color:#E63B2E;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;font-weight:700">
              ◇ SCEGLI UN ORARIO PER LA CALL
            </p>
            ${slotsTable}
            <p style="margin:16px 0 0;color:#888;font-size:11px;line-height:1.5">
              Un click sull&apos;orario conferma l&apos;appuntamento. Fuso: Europa/Roma (CET).
            </p>
          </div>
        ` : `
          <div style="margin:28px 0;padding:22px;background:#F4EFE6;border:1px solid rgba(26,20,20,0.10)">
            <p style="margin:0;color:#444;font-size:14px;line-height:1.65">
              Rispondi a questa email indicando 2 o 3 fasce orarie in cui sei disponibile
              nei prossimi 7 giorni. Lun&ndash;Ven 9:00&ndash;13:00 / 14:30&ndash;19:00 (CET).
            </p>
          </div>
        `}

        <p style="margin:24px 0 0;color:#666;font-size:14px;line-height:1.7;font-family:Georgia,serif;font-style:italic">
          Veloci, ma non frettolosi. È tutto nei dettagli.
        </p>

        <hr style="border:none;border-top:1px solid #eee;margin:32px 0 24px"/>
        <p style="margin:0 0 4px;color:#1A1414;font-size:14px;font-weight:600">Lorenzo &amp; Tommaso</p>
        <p style="margin:0;color:#888;font-size:11px;letter-spacing:0.12em;text-transform:uppercase">
          DIECI BOTTEGA · BOLOGNA
        </p>
      </div>

      <div style="padding:18px 36px;background:#1A1414">
        <p style="font-size:10px;color:rgba(244,239,230,0.5);letter-spacing:0.12em;text-transform:uppercase;margin:0">
          <a href="https://diecibottega.it" style="color:rgba(244,239,230,0.7);text-decoration:none">diecibottega.it</a> · EST. MMXXVI
        </p>
      </div>
    </div>
  `;
}

function slotButton(slot: Slot & { url: string }): string {
  return `
    <a href="${slot.url}"
       style="display:block;width:100%;background:#1A1414;color:#F4EFE6;text-decoration:none;padding:14px 12px;font-family:Arial,sans-serif;border:1px solid #1A1414;text-align:left;box-sizing:border-box">
      <span style="display:block;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#E63B2E;margin-bottom:4px;font-weight:700">
        ${escapeHtml(slot.dayShort)}
      </span>
      <span style="display:block;font-size:18px;font-weight:900;letter-spacing:-0.02em">
        ${escapeHtml(slot.hour)}
      </span>
    </a>
  `;
}

async function sendEmail(opts: {
  apiKey: string; from: string; to: string[]; reply_to?: string; subject: string; html: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(RESEND_API, {
      method:  "POST",
      headers: { Authorization: `Bearer ${opts.apiKey}`, "Content-Type": "application/json" },
      body:    JSON.stringify({
        from: opts.from, to: opts.to, reply_to: opts.reply_to,
        subject: opts.subject, html: opts.html,
      }),
    });
    if (!res.ok) return { ok: false, error: await res.text().catch(() => "unknown") };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/* ─── Handler ───────────────────────────────────────── */

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const p = body as Partial<LeadPayload>;
  if (
    !p.name?.trim() ||
    !p.email?.trim() ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email) ||
    (p.type !== "quote" && p.type !== "contact")
  ) {
    return NextResponse.json({ error: "Dati incompleti" }, { status: 422 });
  }

  const payload = p as LeadPayload;

  // 1. Save lead in CRM
  const captured = await captureLead(payload);
  const leadId = captured?.id ?? null;

  // 2. Build clickable slots
  const slots = leadId
    ? generateSlots().map(s => ({
        ...s,
        url: `https://diecibottega.it/appuntamento?l=${encodeURIComponent(leadId)}&s=${encodeURIComponent(s.iso)}&t=${signSlot(leadId, s.iso)}`,
      }))
    : [];

  const apiKey   = process.env.RESEND_API_KEY;
  const teamRaw  = process.env.TEAM_EMAILS ?? "lollo.lambertini@gmail.com,tommaso.villa02@gmail.com";
  const teamEmails = teamRaw.split(",").map(s => s.trim()).filter(Boolean);

  if (!apiKey) {
    console.log("[lead] RESEND_API_KEY not set");
    return NextResponse.json({ success: true, dev: true, leadId });
  }

  // 3. Team notification
  const teamSubject = `Lead chat: ${payload.name}${payload.business ? ` — ${payload.business}` : ""}${payload.package ? ` · Pacchetto ${payload.package}` : ""}`;
  await sendEmail({
    apiKey,
    from:     "Dieci Bottega CRM <crm@diecibottega.it>",
    to:       teamEmails,
    reply_to: payload.email,
    subject:  teamSubject,
    html:     teamEmailHtml(payload, leadId),
  });

  // 4. Customer confirmation
  const customerSubject = `Ciao ${payload.name.split(/\s+/)[0]}, quando ne parliamo? · Dieci Bottega`;
  await sendEmail({
    apiKey,
    from:     "Dieci Bottega <info@diecibottega.it>",
    to:       [payload.email],
    reply_to: "info@diecibottega.it",
    subject:  customerSubject,
    html:     customerEmailHtml(payload, slots),
  });

  return NextResponse.json({ success: true, leadId });
}
