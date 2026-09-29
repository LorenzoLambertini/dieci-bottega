/**
 * Link univoco del lead magnet inviato in DM: /g/<token>.
 * Registra "Link aperto" (solo persone: le anteprime dei social sono escluse) e mostra
 * la pagina di download. Il download vero passa da /g/<token>/pdf.
 */
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { recordOpen } from "@/lib/social-ai/lead-magnet";
import { clientIp, rateLimit } from "@/lib/social-ai/rate-limit";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "La tua guida gratuita · Dieci Bottega",
  description: "Scarica la guida gratuita di Dieci Bottega.",
  robots: { index: false, follow: false },
};

export default async function LeadMagnetPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[a-f0-9]{32}$/.test(token)) notFound();
  const h = await headers();
  if (!rateLimit(`g:${clientIp(h)}`, 60, 60_000)) notFound();
  const r = await recordOpen(createAdminClient(), token, h.get("user-agent"));
  if (!r) notFound();
  const { guide } = r;
  // Guide senza PDF (pagina del sito): apertura registrata, poi alla pagina
  if (!guide.file_url) redirect(guide.url);

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#1A1414]">
      <div className="mx-auto max-w-xl px-5 py-12 sm:py-20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-mark.png" alt="Dieci Bottega" className="h-10 w-auto mb-10" />
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E63B2E] mb-3">Guida gratuita</p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">{guide.name}</h1>
        {guide.description && <p className="text-black/60 text-lg leading-relaxed mb-8">{guide.description}</p>}
        <a
          href={`/g/${token}/pdf`}
          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-[#E63B2E] hover:bg-[#C44A38] text-white font-semibold rounded-xl px-7 py-4 text-lg transition-colors"
        >
          📄 Scarica il PDF
        </a>
        <p className="text-black/40 text-sm mt-3">PDF gratuito · si apre subito, nessun dato richiesto.</p>

        <div className="mt-14 border-t border-black/10 pt-8">
          <p className="font-semibold mb-1">Vuoi sapere quali errori valgono per il tuo sito?</p>
          <p className="text-black/60 mb-4">Rispondi al messaggio su Instagram o Facebook: ti diamo un parere gratuito.</p>
          <a href="https://diecibottega.it" className="text-[#E63B2E] font-semibold underline underline-offset-4">diecibottega.it →</a>
        </div>
      </div>
    </div>
  );
}
