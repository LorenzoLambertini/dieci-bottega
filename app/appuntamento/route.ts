import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifySlot, formatSlotLabel } from "@/lib/scheduling";

const RESEND_API = "https://api.resend.com/emails";
// "Appuntamento fissato" — stage in pipeline
const APPUNTAMENTO_STAGE_ID = "09ebcf07-c9f3-4a64-9edb-5c996e500b2f";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildErrorRedirect(reason: string): NextResponse {
  return NextResponse.redirect(new URL(`/appuntamento-confermato?status=error&reason=${encodeURIComponent(reason)}`, "https://diecibottega.it"));
}

async function sendEmail(opts: {
  apiKey:   string;
  from:     string;
  to:       string[];
  reply_to?: string;
  subject:  string;
  html:     string;
}): Promise<boolean> {
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
    return res.ok;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const leadId = url.searchParams.get("l");
  const slotIso = url.searchParams.get("s");
  const token = url.searchParams.get("t");

  if (!leadId || !slotIso || !token) {
    return buildErrorRedirect("missing-params");
  }

  if (!verifySlot(leadId, slotIso, token)) {
    return buildErrorRedirect("invalid-token");
  }

  // Validate slot is in the future
  const slotDate = new Date(slotIso);
  if (isNaN(slotDate.getTime()) || slotDate.getTime() < Date.now() - 5 * 60 * 1000) {
    return buildErrorRedirect("slot-expired");
  }

  const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://voyhwqqubcathcvjatyk.supabase.co";
  const serviceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    console.error("[appuntamento] SUPABASE_SERVICE_ROLE_KEY missing");
    return buildErrorRedirect("server-config");
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // Fetch lead
  const { data: lead, error: leadErr } = await supabase
    .from("leads")
    .select("id, name, email, metadata, stage_id")
    .eq("id", leadId)
    .single();

  if (leadErr || !lead) {
    return buildErrorRedirect("lead-not-found");
  }

  // Idempotency: if same slot already scheduled, just redirect to confirmation
  const existingMeta = (lead.metadata as Record<string, unknown> | null) ?? {};
  const previousSlot = typeof existingMeta.scheduled_slot === "string" ? existingMeta.scheduled_slot : null;

  if (previousSlot === slotIso) {
    return NextResponse.redirect(
      new URL(`/appuntamento-confermato?slot=${encodeURIComponent(slotIso)}&name=${encodeURIComponent(lead.name)}`, "https://diecibottega.it")
    );
  }

  // Update lead: stage = "Appuntamento fissato", metadata.scheduled_slot = slotIso
  const newMeta = { ...existingMeta, scheduled_slot: slotIso, scheduled_at: new Date().toISOString() };

  const { error: updateErr } = await supabase
    .from("leads")
    .update({
      stage_id:   APPUNTAMENTO_STAGE_ID,
      status:     "qualified",
      metadata:   newMeta,
      score:      Math.max(50, 0),
      updated_at: new Date().toISOString(),
    })
    .eq("id", leadId);

  if (updateErr) {
    console.error("[appuntamento] lead update error:", updateErr);
    return buildErrorRedirect("update-failed");
  }

  // Activity log
  await supabase.from("activities").insert({
    lead_id: leadId,
    user_id: null,
    type:    "meeting",
    subject: `Appuntamento fissato · ${formatSlotLabel(slotIso)}`,
    body:    `Il cliente ha selezionato uno slot dal link nell'email.\nOrario: ${formatSlotLabel(slotIso)}\nFuso: Europa/Roma (CET).`,
    metadata: { scheduled_slot: slotIso, source: "email-link" },
  });

  // Send confirmation emails
  const apiKey  = process.env.RESEND_API_KEY;
  const teamRaw = process.env.TEAM_EMAILS ?? "lollo.lambertini@gmail.com,tommaso.villa02@gmail.com";
  const teamEmails = teamRaw.split(",").map(s => s.trim()).filter(Boolean);

  if (apiKey) {
    const label = formatSlotLabel(slotIso);
    const firstName = lead.name.trim().split(/\s+/)[0];

    // Customer confirmation
    await sendEmail({
      apiKey,
      from:     "Dieci Bottega <info@diecibottega.it>",
      to:       [lead.email],
      reply_to: "info@diecibottega.it",
      subject:  `Confermato — ci sentiamo ${label.split("·")[0].trim().toLowerCase()} · Dieci Bottega`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto">
          <div style="background:#E63B2E;padding:36px 32px">
            <p style="color:rgba(244,239,230,0.7);font-size:10px;letter-spacing:0.18em;text-transform:uppercase;margin:0 0 10px;font-family:Arial,sans-serif">
              DIECI BOTTEGA · APPUNTAMENTO CONFERMATO
            </p>
            <h1 style="color:#F4EFE6;font-size:36px;margin:0;font-weight:900;letter-spacing:-0.035em;text-transform:uppercase;line-height:1">
              Ci sentiamo presto, ${escapeHtml(firstName)}.
            </h1>
          </div>
          <div style="padding:32px;background:#fff">
            <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#1A1414">
              Confermato — abbiamo bloccato il calendario per te.
            </p>
            <div style="margin:24px 0;padding:24px;background:#F4EFE6;border-left:4px solid #E63B2E">
              <p style="margin:0 0 6px;color:#E63B2E;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;font-weight:700">
                ◆ APPUNTAMENTO
              </p>
              <p style="margin:0;font-size:22px;font-weight:900;text-transform:uppercase;letter-spacing:-0.02em;line-height:1.1;color:#1A1414">
                ${escapeHtml(label)}
              </p>
              <p style="margin:8px 0 0;color:#666;font-size:12px">
                Fuso orario: Europa/Roma (CET) · Durata: 30 minuti
              </p>
            </div>
            <p style="margin:0 0 12px;color:#444;font-size:14px;line-height:1.65">
              Ti invieremo un promemoria con il link Google Meet 30 minuti prima.
            </p>
            <p style="margin:0;color:#444;font-size:14px;line-height:1.65">
              Se devi annullare o spostare, scrivici a
              <a href="mailto:info@diecibottega.it" style="color:#E63B2E">info@diecibottega.it</a>.
            </p>

            <hr style="border:none;border-top:1px solid #eee;margin:28px 0 20px"/>
            <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#1A1414">
              Lorenzo &amp; Tommaso
            </p>
            <p style="margin:0;color:#888;font-size:11px;letter-spacing:0.12em;text-transform:uppercase">
              DIECI BOTTEGA · BOLOGNA
            </p>
          </div>
        </div>
      `,
    });

    // Team notification
    await sendEmail({
      apiKey,
      from:     "Dieci Bottega CRM <crm@diecibottega.it>",
      to:       teamEmails,
      reply_to: lead.email,
      subject:  `📅 ${lead.name} ha fissato la call · ${label}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#1A1414;padding:20px 32px">
            <p style="color:#E63B2E;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;margin:0;font-weight:700">
              ● DIECI BOTTEGA · APPUNTAMENTO
            </p>
            <p style="color:#F4EFE6;font-size:22px;margin:6px 0 0;font-weight:900;letter-spacing:-0.02em;text-transform:uppercase">
              Call fissata
            </p>
          </div>
          <div style="padding:28px 32px;background:#fff">
            <p style="margin:0 0 18px;font-size:15px;color:#1A1414">
              <strong>${escapeHtml(lead.name)}</strong> ha confermato l'appuntamento.
            </p>
            <table style="border-collapse:collapse;width:100%">
              <tr>
                <td style="padding:6px 16px 6px 0;color:#999;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;vertical-align:top;white-space:nowrap">Cliente</td>
                <td style="padding:6px 0;font-size:14px;color:#1A1414">${escapeHtml(lead.name)}</td>
              </tr>
              <tr>
                <td style="padding:6px 16px 6px 0;color:#999;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;vertical-align:top">Email</td>
                <td style="padding:6px 0;font-size:14px"><a href="mailto:${escapeHtml(lead.email)}" style="color:#E63B2E">${escapeHtml(lead.email)}</a></td>
              </tr>
              <tr>
                <td style="padding:6px 16px 6px 0;color:#999;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;vertical-align:top">Orario</td>
                <td style="padding:6px 0;font-size:18px;color:#1A1414;font-weight:900;letter-spacing:-0.01em">${escapeHtml(label)}</td>
              </tr>
              <tr>
                <td style="padding:6px 16px 6px 0;color:#999;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;vertical-align:top">Fuso</td>
                <td style="padding:6px 0;font-size:13px;color:#444">Europa/Roma (CET) · 30 min</td>
              </tr>
            </table>
            <p style="margin:24px 0 0;font-size:13px">
              <a href="https://diecibottega.it/crm/leads/${leadId}" style="color:#E63B2E">→ Apri scheda lead nel CRM</a>
            </p>
            <p style="margin:6px 0 0;color:#aaa;font-size:11px">
              Il lead è stato spostato automaticamente nello stage <strong>Appuntamento fissato</strong>.
            </p>
          </div>
        </div>
      `,
    });
  }

  return NextResponse.redirect(
    new URL(`/appuntamento-confermato?slot=${encodeURIComponent(slotIso)}&name=${encodeURIComponent(lead.name)}`, "https://diecibottega.it")
  );
}
