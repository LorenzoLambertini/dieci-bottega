import { NextRequest, NextResponse } from "next/server";
import { generateSlots, signSlot, type Slot } from "@/lib/scheduling";

const RESEND_API = "https://api.resend.com/emails";

interface QuizRecommendation {
  product: string;
  tier:    string;
  price:   string;
  time:    string;
  reason?: string;
}

interface ContactPayload {
  name:           string;
  email:          string;
  message:        string;
  company?:       string;
  budget?:        string;
  source?:        string;
  page_url?:      string;
  recommendation?: QuizRecommendation;
}

function isValid(data: unknown): data is ContactPayload {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.name === "string"    && d.name.trim().length > 0 &&
    typeof d.email === "string"   && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email) &&
    typeof d.message === "string" && d.message.trim().length > 0
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ─── Edge Function (CRM) ──────────────────────────────── */

async function captureLead(body: ContactPayload): Promise<{ id: string } | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://voyhwqqubcathcvjatyk.supabase.co";
  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/capture-lead`, {
      method:  "POST",
      headers: { "Content-Type": "application/json", "Origin": "https://diecibottega.it" },
      body:    JSON.stringify(body),
    });
    if (!res.ok) {
      console.warn("[contact] capture-lead non-OK:", res.status);
      return null;
    }
    const data = await res.json() as { success?: boolean; id?: string };
    return data.id ? { id: data.id } : null;
  } catch (e) {
    console.warn("[contact] capture-lead error:", e);
    return null;
  }
}

/* ─── Email per il team ─────────────────────────────────── */

function teamEmailHtml(p: ContactPayload, leadId: string | null): string {
  const rows = [
    ["Nome",     escapeHtml(p.name)],
    ["Email",    `<a href="mailto:${escapeHtml(p.email)}" style="color:#E63B2E">${escapeHtml(p.email)}</a>`],
    p.company ? ["Azienda", escapeHtml(p.company)] : null,
    p.budget  ? ["Budget",  escapeHtml(p.budget)]  : null,
    p.source  ? ["Fonte",   escapeHtml(p.source)]  : null,
  ].filter(Boolean) as [string, string][];

  const table = rows
    .map(([k, v]) => `
      <tr>
        <td style="padding:8px 16px 8px 0;color:#999;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;font-family:Arial,sans-serif;vertical-align:top;white-space:nowrap">${k}</td>
        <td style="padding:8px 0;font-size:14px;color:#1A1414;font-family:Arial,sans-serif">${v}</td>
      </tr>`)
    .join("");

  const recBlock = p.recommendation
    ? `
      <div style="margin-top:24px;padding:20px;background:#fdf4f2;border-left:3px solid #E63B2E">
        <p style="margin:0 0 8px;color:#E63B2E;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;font-family:Arial,sans-serif;font-weight:700">
          ◆ DAL QUIZ · RACCOMANDAZIONE
        </p>
        <p style="margin:0 0 4px;font-size:18px;color:#1A1414;font-weight:900;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:-0.01em">
          ${escapeHtml(p.recommendation.product)}
        </p>
        <p style="margin:0 0 12px;color:#666;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;font-family:Arial,sans-serif">
          ${escapeHtml(p.recommendation.tier)} · ${escapeHtml(p.recommendation.price)} · ${escapeHtml(p.recommendation.time)}
        </p>
        ${p.recommendation.reason ? `<p style="margin:0;color:#555;font-size:13px;line-height:1.5;font-style:italic;font-family:Georgia,serif">&ldquo;${escapeHtml(p.recommendation.reason)}&rdquo;</p>` : ""}
      </div>
    ` : "";

  const crmLink = leadId
    ? `<a href="https://diecibottega.it/crm/leads/${leadId}" style="color:#E63B2E;text-decoration:none">Apri scheda nel CRM →</a>`
    : `<a href="https://diecibottega.it/crm/leads" style="color:#E63B2E;text-decoration:none">Apri CRM →</a>`;

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#F4EFE6">
      <div style="background:#1A1414;padding:20px 32px">
        <p style="color:#E63B2E;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;margin:0;font-family:Arial,sans-serif;font-weight:700">
          ● DIECI BOTTEGA · CRM
        </p>
        <p style="color:#F4EFE6;font-size:22px;margin:6px 0 0;font-weight:900;letter-spacing:-0.02em;text-transform:uppercase">
          Nuovo contatto
        </p>
      </div>

      <div style="padding:32px;background:#fff;border:1px solid #eee;border-top:none">
        <table style="border-collapse:collapse;width:100%">${table}</table>

        ${recBlock}

        <hr style="border:none;border-top:1px solid #eee;margin:24px 0 18px"/>
        <p style="color:#999;font-size:10px;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.14em;font-family:Arial,sans-serif">Messaggio del cliente</p>
        <p style="font-size:14px;line-height:1.7;white-space:pre-wrap;color:#1A1414;margin:0;font-family:Arial,sans-serif">${escapeHtml(p.message)}</p>

        <hr style="border:none;border-top:1px solid #eee;margin:24px 0 18px"/>
        <p style="margin:0;font-size:13px;font-family:Arial,sans-serif">
          ${crmLink}
        </p>
        ${p.page_url ? `
          <p style="color:#999;font-size:10px;margin:8px 0 0;text-transform:uppercase;letter-spacing:0.14em;font-family:Arial,sans-serif">
            Arrivato da · <a href="${escapeHtml(p.page_url)}" style="color:#999">${escapeHtml(p.page_url)}</a>
          </p>
        ` : ""}
      </div>

      <div style="padding:16px 32px;background:#f9f9f9;border:1px solid #eee;border-top:none">
        <p style="color:#aaa;font-size:11px;margin:0">
          Rispondi a questa email per scrivere direttamente al cliente — il reply-to è impostato.
        </p>
      </div>
    </div>
  `;
}

/* ─── Email cliente con slot cliccabili ─────────────────── */

function customerEmailHtml(p: ContactPayload, leadId: string | null, slots: Array<Slot & { url: string }>): string {
  const firstName = p.name.trim().split(/\s+/)[0];

  const recBlock = p.recommendation
    ? `
      <div style="margin:28px 0;padding:22px 24px;background:#fdf4f2;border:1px solid rgba(230,59,46,0.18)">
        <p style="margin:0 0 10px;color:#E63B2E;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;font-family:Arial,sans-serif;font-weight:700">
          ◆ DAL QUIZ
        </p>
        <p style="margin:0 0 6px;color:#1A1414;font-size:13px;font-family:Arial,sans-serif;line-height:1.55">
          Hai indicato interesse per <strong>${escapeHtml(p.recommendation.product)}</strong>.
        </p>
        <p style="margin:0;color:#666;font-size:12px;font-family:Georgia,serif;font-style:italic;line-height:1.5">
          Ne parleremo nei dettagli durante la call.
        </p>
      </div>
    ` : "";

  // Build a 3x2 grid of slot buttons (table-based for email compatibility)
  const slotRows: string[] = [];
  for (let i = 0; i < slots.length; i += 2) {
    const a = slots[i];
    const b = slots[i + 1];
    slotRows.push(`
      <tr>
        <td style="padding:4px 4px 4px 0;width:50%">
          ${slotButton(a)}
        </td>
        <td style="padding:4px 0 4px 4px;width:50%">
          ${b ? slotButton(b) : ""}
        </td>
      </tr>
    `);
  }
  const slotsTable = leadId
    ? `<table cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:separate;border-spacing:0">${slotRows.join("")}</table>`
    : "";

  return `
    <div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;background:#F4EFE6">

      <!-- Hero -->
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

      <!-- Body -->
      <div style="padding:36px;background:#fff">
        <p style="margin:0 0 16px;color:#1A1414;font-size:15px;line-height:1.7;font-family:Arial,sans-serif">
          Ciao ${escapeHtml(firstName)},
        </p>
        <p style="margin:0 0 16px;color:#333;font-size:15px;line-height:1.7;font-family:Arial,sans-serif">
          abbiamo ricevuto il tuo messaggio e siamo già al lavoro per capire come aiutarti.
        </p>
        <p style="margin:0 0 28px;color:#333;font-size:15px;line-height:1.7;font-family:Arial,sans-serif">
          Per non far perdere tempo a nessuno, ti proponiamo subito una <strong>call gratuita di 30 minuti</strong>
          — senza impegno. <strong>Scegli l&apos;orario che preferisci</strong>: ti basta un click.
        </p>

        ${recBlock}

        ${leadId ? `
        <!-- Scheduling slots -->
        <div style="margin:28px 0 8px;padding:24px;background:#F4EFE6;border:1px solid rgba(26,20,20,0.10)">
          <p style="margin:0 0 16px;color:#E63B2E;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;font-family:Arial,sans-serif;font-weight:700">
            ◇ SCEGLI UN ORARIO PER LA CALL
          </p>

          ${slotsTable}

          <p style="margin:16px 0 0;color:#888;font-size:11px;line-height:1.5;font-family:Arial,sans-serif">
            Un click sull&apos;orario conferma direttamente l&apos;appuntamento.
            Tutti gli orari sono in fuso Europa/Roma (CET).
          </p>
        </div>
        ` : `
        <div style="margin:28px 0;padding:24px;background:#F4EFE6;border:1px solid rgba(26,20,20,0.10)">
          <p style="margin:0 0 12px;color:#E63B2E;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;font-family:Arial,sans-serif;font-weight:700">
            ◇ FISSIAMO LA CALL
          </p>
          <p style="margin:0;color:#444;font-size:14px;line-height:1.65;font-family:Arial,sans-serif">
            Rispondi a questa email indicando 2 o 3 fasce orarie in cui sei disponibile
            nei prossimi 7 giorni. Lun&ndash;Ven, 9:00&ndash;13:00 / 14:30&ndash;19:00 (CET).
          </p>
        </div>
        `}

        <p style="margin:24px 0 0;color:#666;font-size:14px;line-height:1.7;font-family:Georgia,serif;font-style:italic">
          Veloci, ma non frettolosi. È tutto nei dettagli.
        </p>

        <hr style="border:none;border-top:1px solid #eee;margin:32px 0 24px"/>

        <p style="margin:0 0 4px;color:#1A1414;font-size:14px;font-family:Arial,sans-serif;font-weight:600">
          Lorenzo &amp; Tommaso
        </p>
        <p style="margin:0;color:#888;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;font-family:Arial,sans-serif">
          DIECI BOTTEGA · BOLOGNA
        </p>
      </div>

      <div style="padding:18px 36px;background:#1A1414">
        <table style="width:100%">
          <tr>
            <td style="font-size:10px;color:rgba(244,239,230,0.5);letter-spacing:0.12em;text-transform:uppercase;font-family:Arial,sans-serif">
              <a href="https://diecibottega.it" style="color:rgba(244,239,230,0.7);text-decoration:none">diecibottega.it</a>
            </td>
            <td style="font-size:10px;color:rgba(244,239,230,0.35);letter-spacing:0.12em;text-transform:uppercase;font-family:Arial,sans-serif;text-align:right">
              EST. MMXXVI · BOLOGNA
            </td>
          </tr>
        </table>
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

/* ─── Email send helper ─────────────────────────────────── */

async function sendEmail(opts: {
  apiKey:    string;
  from:      string;
  to:        string[];
  reply_to?: string;
  subject:   string;
  html:      string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(RESEND_API, {
      method:  "POST",
      headers: {
        Authorization:  `Bearer ${opts.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from:     opts.from,
        to:       opts.to,
        reply_to: opts.reply_to,
        subject:  opts.subject,
        html:     opts.html,
      }),
    });
    if (!res.ok) {
      const err = await res.text().catch(() => "unknown");
      return { ok: false, error: err };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/* ─── Handler ──────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!isValid(body)) {
    return NextResponse.json({ error: "Campi obbligatori mancanti" }, { status: 422 });
  }

  // 1. Save lead in CRM (Edge Function)
  const captured = await captureLead(body);
  const leadId = captured?.id ?? null;

  // 2. Build scheduling slots (only if we have leadId — otherwise email falls back to "rispondi a questa email")
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
    console.log("[contact] RESEND_API_KEY not set");
    return NextResponse.json({ ok: true, dev: true, leadId });
  }

  // 3. Email team
  const teamSubject = `Nuovo lead: ${body.name}${body.company ? ` — ${body.company}` : ""}${body.recommendation ? ` · ${body.recommendation.product}` : ""}`;
  const teamRes = await sendEmail({
    apiKey,
    from:     "Dieci Bottega CRM <crm@diecibottega.it>",
    to:       teamEmails,
    reply_to: body.email,
    subject:  teamSubject,
    html:     teamEmailHtml(body, leadId),
  });

  if (!teamRes.ok) {
    console.error("[contact] team email failed:", teamRes.error);
  }

  // 4. Email cliente
  const customerSubject = `Ciao ${body.name.split(/\s+/)[0]}, quando ne parliamo? · Dieci Bottega`;
  const customerRes = await sendEmail({
    apiKey,
    from:     "Dieci Bottega <info@diecibottega.it>",
    to:       [body.email],
    reply_to: "info@diecibottega.it",
    subject:  customerSubject,
    html:     customerEmailHtml(body, leadId, slots),
  });

  if (!customerRes.ok) {
    console.warn("[contact] customer email failed:", customerRes.error);
  }

  return NextResponse.json({
    ok: true,
    leadId,
    teamEmailOk:     teamRes.ok,
    customerEmailOk: customerRes.ok,
  });
}
