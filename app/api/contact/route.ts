import { NextRequest, NextResponse } from "next/server";

const RESEND_API = "https://api.resend.com/emails";

interface ContactPayload {
  name: string;
  email: string;
  message: string;
  company?: string;
  budget?: string;
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

function buildHtml(p: ContactPayload): string {
  const rows = [
    ["Nome",     p.name],
    ["Email",    p.email],
    p.company ? ["Azienda", p.company] : null,
    p.budget  ? ["Budget",  p.budget]  : null,
  ].filter(Boolean) as [string, string][];

  const table = rows
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666;font-size:13px">${k}</td><td style="font-size:14px">${v}</td></tr>`)
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto">
      <div style="background:#E63B2E;padding:24px 32px">
        <p style="color:#F4EFE6;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;margin:0">
          DIECI BOTTEGA · NUOVO CONTATTO
        </p>
      </div>
      <div style="padding:32px;background:#fff;border:1px solid #eee">
        <table style="border-collapse:collapse;width:100%">${table}</table>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
        <p style="color:#666;font-size:12px;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.08em">Messaggio</p>
        <p style="font-size:14px;line-height:1.65;white-space:pre-wrap">${p.message.replace(/</g, "&lt;")}</p>
      </div>
      <div style="padding:16px 32px;background:#f9f9f9;border:1px solid #eee;border-top:none">
        <p style="color:#aaa;font-size:11px;margin:0">diecibottega.it · Bologna, Italia</p>
      </div>
    </div>
  `;
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

  const contactEmail = process.env.CONTACT_EMAIL ?? "info@diecibottega.it";
  const apiKey       = process.env.RESEND_API_KEY;

  if (apiKey) {
    const res = await fetch(RESEND_API, {
      method:  "POST",
      headers: {
        Authorization:  `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from:     "Dieci Bottega <noreply@diecibottega.it>",
        to:       [contactEmail],
        reply_to: body.email,
        subject:  `Nuovo contatto: ${body.name}${body.company ? ` — ${body.company}` : ""}`,
        html:     buildHtml(body),
      }),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => "unknown");
      console.error("[contact] Resend error:", err);
      return NextResponse.json({ error: "Errore nell'invio. Riprova." }, { status: 502 });
    }
  } else {
    console.log("[contact] RESEND_API_KEY not set — logging payload:", body);
  }

  return NextResponse.json({ ok: true });
}
