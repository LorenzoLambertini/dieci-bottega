import { NextRequest, NextResponse } from "next/server";

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

/* ─── Email per il team (Lorenzo + Tommaso) ────────────── */

function teamEmailHtml(p: ContactPayload): string {
  const rows = [
    ["Nome",     p.name],
    ["Email",    `<a href="mailto:${p.email}" style="color:#E63B2E">${p.email}</a>`],
    p.company ? ["Azienda", escapeHtml(p.company)] : null,
    p.budget  ? ["Budget",  escapeHtml(p.budget)]  : null,
    p.source  ? ["Fonte",   escapeHtml(p.source)]  : null,
  ].filter(Boolean) as [string, string][];

  const table = rows
    .map(([k, v]) => `
      <tr>
        <td style="padding:8px 16px 8px 0;color:#999;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;font-family:'JetBrains Mono',monospace;vertical-align:top;white-space:nowrap">${k}</td>
        <td style="padding:8px 0;font-size:14px;color:#1A1414;font-family:Arial,sans-serif">${v}</td>
      </tr>`)
    .join("");

  const recommendationBlock = p.recommendation
    ? `
      <div style="margin-top:24px;padding:20px;background:#fdf4f2;border-left:3px solid #E63B2E">
        <p style="margin:0 0 8px 0;color:#E63B2E;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;font-family:'JetBrains Mono',monospace;font-weight:700">
          ◆ DAL QUIZ · RACCOMANDAZIONE
        </p>
        <p style="margin:0 0 4px 0;font-size:18px;color:#1A1414;font-weight:900;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:-0.01em">
          ${escapeHtml(p.recommendation.product)}
        </p>
        <p style="margin:0 0 12px 0;color:#666;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;font-family:'JetBrains Mono',monospace">
          ${escapeHtml(p.recommendation.tier)} · ${escapeHtml(p.recommendation.price)} · ${escapeHtml(p.recommendation.time)}
        </p>
        ${p.recommendation.reason ? `<p style="margin:0;color:#555;font-size:13px;line-height:1.5;font-style:italic;font-family:Georgia,serif">&ldquo;${escapeHtml(p.recommendation.reason)}&rdquo;</p>` : ""}
      </div>
    ` : "";

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#F4EFE6">
      <div style="background:#1A1414;padding:20px 32px">
        <p style="color:#E63B2E;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;margin:0;font-family:'JetBrains Mono',monospace;font-weight:700">
          ● DIECI BOTTEGA · CRM
        </p>
        <p style="color:#F4EFE6;font-size:22px;margin:6px 0 0 0;font-weight:900;letter-spacing:-0.02em;text-transform:uppercase">
          Nuovo contatto
        </p>
      </div>

      <div style="padding:32px;background:#fff;border:1px solid #eee;border-top:none">
        <table style="border-collapse:collapse;width:100%">${table}</table>

        ${recommendationBlock}

        <hr style="border:none;border-top:1px solid #eee;margin:24px 0 18px"/>
        <p style="color:#999;font-size:10px;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.14em;font-family:'JetBrains Mono',monospace">Messaggio</p>
        <p style="font-size:14px;line-height:1.7;white-space:pre-wrap;color:#1A1414;margin:0;font-family:Arial,sans-serif">${escapeHtml(p.message)}</p>

        ${p.page_url ? `
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0 18px"/>
          <p style="color:#999;font-size:10px;margin:0;text-transform:uppercase;letter-spacing:0.14em;font-family:'JetBrains Mono',monospace">
            ARRIVATO DA · <a href="${escapeHtml(p.page_url)}" style="color:#999">${escapeHtml(p.page_url)}</a>
          </p>
        ` : ""}
      </div>

      <div style="padding:16px 32px;background:#f9f9f9;border:1px solid #eee;border-top:none">
        <p style="color:#aaa;font-size:11px;margin:0;letter-spacing:0.05em">
          Rispondi direttamente a questa email per scrivere al cliente — il reply-to è già impostato.
        </p>
      </div>
    </div>
  `;
}

/* ─── Email di conferma per il cliente ─────────────────── */

function customerEmailHtml(p: ContactPayload): string {
  const firstName = p.name.trim().split(/\s+/)[0];

  const recBlock = p.recommendation
    ? `
      <div style="margin:28px 0;padding:22px 24px;background:#fdf4f2;border:1px solid rgba(230,59,46,0.18)">
        <p style="margin:0 0 10px;color:#E63B2E;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;font-family:'JetBrains Mono',monospace;font-weight:700">
          ◆ DAL QUIZ
        </p>
        <p style="margin:0 0 6px;color:#1A1414;font-size:13px;font-family:Arial,sans-serif;line-height:1.55">
          Hai indicato interesse per <strong>${escapeHtml(p.recommendation.product)}</strong>.
        </p>
        <p style="margin:0;color:#666;font-size:12px;font-family:Georgia,serif;font-style:italic;line-height:1.5">
          Ne parleremo nei dettagli durante la call — niente è ancora deciso, vediamo insieme cosa serve davvero.
        </p>
      </div>
    ` : "";

  return `
    <div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;background:#F4EFE6">

      <!-- Hero -->
      <div style="background:#E63B2E;padding:40px 36px;text-align:left">
        <p style="color:rgba(244,239,230,0.7);font-size:10px;letter-spacing:0.18em;text-transform:uppercase;margin:0 0 12px;font-family:'JetBrains Mono',monospace">
          DIECI BOTTEGA · BOLOGNA
        </p>
        <h1 style="color:#F4EFE6;font-size:42px;margin:0;font-weight:900;letter-spacing:-0.035em;text-transform:uppercase;line-height:0.95">
          Grazie, ${escapeHtml(firstName)}.
        </h1>
        <p style="color:rgba(244,239,230,0.85);font-size:18px;margin:14px 0 0;font-family:Georgia,serif;font-style:italic;line-height:1.3">
          Abbiamo ricevuto il tuo messaggio.
        </p>
      </div>

      <!-- Body -->
      <div style="padding:36px;background:#fff">
        <p style="margin:0 0 16px;color:#1A1414;font-size:15px;line-height:1.7;font-family:Arial,sans-serif">
          Ciao ${escapeHtml(firstName)},
        </p>
        <p style="margin:0 0 16px;color:#333;font-size:15px;line-height:1.7;font-family:Arial,sans-serif">
          ti scriviamo personalmente per confermarti che il tuo messaggio è arrivato in bottega.
          Lo leggeremo con attenzione nelle prossime ore e ti risponderemo entro <strong>24 ore lavorative</strong>.
        </p>
        <p style="margin:0 0 28px;color:#333;font-size:15px;line-height:1.7;font-family:Arial,sans-serif">
          Per non far perdere tempo a nessuno, vorremmo organizzare subito una <strong>call gratuita di 30 minuti</strong>
          per capirci meglio — senza impegno, senza preventivi gonfiati. Solo una conversazione onesta.
        </p>

        ${recBlock}

        <!-- Scheduling block -->
        <div style="margin:28px 0 8px;padding:24px;background:#F4EFE6;border:1px solid rgba(26,20,20,0.10)">
          <p style="margin:0 0 14px;color:#E63B2E;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;font-family:'JetBrains Mono',monospace;font-weight:700">
            ◇ SCEGLI QUANDO PARLARNE
          </p>
          <p style="margin:0 0 18px;color:#1A1414;font-size:22px;font-weight:900;letter-spacing:-0.02em;text-transform:uppercase;line-height:1.05">
            Rispondi a questa email
          </p>
          <p style="margin:0 0 16px;color:#444;font-size:14px;line-height:1.65;font-family:Arial,sans-serif">
            Indicaci <strong>2 o 3 fasce orarie</strong> in cui sei disponibile nei prossimi 7 giorni.
            Ti confermeremo quella migliore per entrambi.
          </p>

          <p style="margin:0 0 8px;color:#999;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;font-family:'JetBrains Mono',monospace">
            I nostri orari
          </p>
          <table style="border-collapse:collapse;width:100%;margin-bottom:8px">
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#444;font-family:Arial,sans-serif">
                Lunedì → Venerdì
              </td>
              <td style="padding:6px 0;font-size:13px;color:#1A1414;font-family:Arial,sans-serif;text-align:right;font-weight:600">
                9:00 – 13:00 · 14:30 – 19:00
              </td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#444;font-family:Arial,sans-serif">
                Fuso orario
              </td>
              <td style="padding:6px 0;font-size:13px;color:#1A1414;font-family:Arial,sans-serif;text-align:right;font-weight:600">
                Europa / Roma (CET)
              </td>
            </tr>
          </table>
        </div>

        <p style="margin:24px 0 0;color:#666;font-size:14px;line-height:1.7;font-family:Georgia,serif;font-style:italic">
          Veloci, ma non frettolosi. È tutto nei dettagli.
        </p>

        <hr style="border:none;border-top:1px solid #eee;margin:32px 0 24px"/>

        <p style="margin:0 0 4px;color:#1A1414;font-size:14px;font-family:Arial,sans-serif;font-weight:600">
          Lorenzo & Tommaso
        </p>
        <p style="margin:0;color:#888;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;font-family:'JetBrains Mono',monospace">
          DIECI BOTTEGA · BOLOGNA
        </p>
      </div>

      <!-- Footer -->
      <div style="padding:18px 36px;background:#1A1414;border-top:1px solid rgba(244,239,230,0.06)">
        <table style="width:100%">
          <tr>
            <td style="font-size:10px;color:rgba(244,239,230,0.5);letter-spacing:0.12em;text-transform:uppercase;font-family:'JetBrains Mono',monospace">
              <a href="https://diecibottega.it" style="color:rgba(244,239,230,0.7);text-decoration:none">diecibottega.it</a>
            </td>
            <td style="font-size:10px;color:rgba(244,239,230,0.35);letter-spacing:0.12em;text-transform:uppercase;font-family:'JetBrains Mono',monospace;text-align:right">
              EST. MMXXVI · BOLOGNA
            </td>
          </tr>
        </table>
      </div>
    </div>
  `;
}

/* ─── Handler ──────────────────────────────────────────── */

async function sendEmail(opts: {
  apiKey:   string;
  from:     string;
  to:       string[];
  reply_to?: string;
  subject:  string;
  html:     string;
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

  const apiKey   = process.env.RESEND_API_KEY;
  const teamRaw  = process.env.TEAM_EMAILS ?? "lorenzo@diecibottega.it,tommaso@diecibottega.it";
  const teamEmails = teamRaw.split(",").map(s => s.trim()).filter(Boolean);

  if (!apiKey) {
    console.log("[contact] RESEND_API_KEY not set — logging payload:", body);
    return NextResponse.json({ ok: true, dev: true });
  }

  // 1. Email al team (Lorenzo + Tommaso)
  const teamSubject = `Nuovo lead: ${body.name}${body.company ? ` — ${body.company}` : ""}${body.recommendation ? ` · ${body.recommendation.product}` : ""}`;
  const teamRes = await sendEmail({
    apiKey,
    from:     "Dieci Bottega CRM <noreply@diecibottega.it>",
    to:       teamEmails,
    reply_to: body.email,
    subject:  teamSubject,
    html:     teamEmailHtml(body),
  });

  if (!teamRes.ok) {
    console.error("[contact] team email failed:", teamRes.error);
    return NextResponse.json({ error: "Errore nell'invio. Riprova." }, { status: 502 });
  }

  // 2. Email di conferma al cliente — non bloccante: se fallisce
  //    il team è già stato notificato e il lead è in CRM.
  const customerSubject = `Ciao ${body.name.split(/\s+/)[0]}, quando ne parliamo? · Dieci Bottega`;
  const customerRes = await sendEmail({
    apiKey,
    from:     "Dieci Bottega <info@diecibottega.it>",
    to:       [body.email],
    reply_to: "info@diecibottega.it",
    subject:  customerSubject,
    html:     customerEmailHtml(body),
  });

  if (!customerRes.ok) {
    console.warn("[contact] customer email failed:", customerRes.error);
    // Restituiamo comunque ok=true ma con un flag
    return NextResponse.json({ ok: true, customerEmailFailed: true });
  }

  return NextResponse.json({ ok: true });
}
