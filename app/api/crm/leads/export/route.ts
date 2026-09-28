/**
 * Export CSV dei contatti (solo admin), con gli stessi filtri della lista.
 * Separatore ";" e BOM UTF-8: si apre correttamente in Excel italiano.
 */
import { NextResponse, type NextRequest } from "next/server";
import { getCrmUser } from "@/lib/social-ai/auth";
import { createSocialClient } from "@/lib/social-ai/db";
import { applyLeadFilters, STATUS_LABEL_IT, tagFilterSelect } from "@/lib/crm/lead-filters";

export const dynamic = "force-dynamic";

function cell(v: unknown): string {
  if (v == null) return "";
  let s = String(v);
  // evita che Excel interpreti il contenuto come formula
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(req: NextRequest) {
  const user = await getCrmUser();
  if (!user) return new NextResponse("Non autenticato", { status: 401 });
  if (user.role !== "admin") return new NextResponse("Solo admin", { status: 403 });

  const p = Object.fromEntries(req.nextUrl.searchParams);
  const db = await createSocialClient();
  const query = applyLeadFilters(
    db
      .from("leads")
      .select(`name, email, phone, company, website, status, score, source, notes, next_action_at, next_action_note, created_at, stage:pipeline_stages(name), taglist:lead_tags(tag:tags(name))${tagFilterSelect(p)}`)
      .order("created_at", { ascending: false })
      .limit(5000),
    p
  );
  const { data, error } = await query;
  if (error) return new NextResponse(error.message, { status: 500 });

  const header = ["Nome", "Email", "Telefono", "Azienda", "Sito", "Stato", "Stage", "Score", "Sorgente", "Tag", "Prossima azione", "Nota promemoria", "Note", "Creato il"];
  const rows = ((data ?? []) as unknown as Record<string, unknown>[]).map((l) => [
    l.name, l.email, l.phone, l.company, l.website,
    STATUS_LABEL_IT[String(l.status)] ?? l.status,
    (l.stage as { name?: string } | null)?.name,
    l.score, l.source,
    ((l.taglist as { tag: { name: string } | null }[] | undefined) ?? []).map((t) => t.tag?.name).filter(Boolean).join(", "),
    l.next_action_at ? new Date(String(l.next_action_at)).toLocaleString("it-IT", { timeZone: "Europe/Rome" }) : "",
    l.next_action_note, l.notes,
    new Date(String(l.created_at)).toLocaleDateString("it-IT", { timeZone: "Europe/Rome" }),
  ]);
  const csv = "﻿" + [header, ...rows].map((r) => r.map(cell).join(";")).join("\r\n");
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="contatti-dieci-bottega-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
