import Link from "next/link";
import { formatSlotLabel } from "@/lib/scheduling";

export const metadata = {
  title: "Appuntamento confermato — Dieci Bottega",
  robots: { index: false, follow: false },
};

const ERROR_MESSAGES: Record<string, { title: string; body: string }> = {
  "missing-params":  { title: "Link non valido",     body: "Il link che hai aperto è incompleto. Scrivici a info@diecibottega.it e ti rimandiamo le opzioni." },
  "invalid-token":   { title: "Link scaduto",        body: "Questo link non è più valido. Scrivici a info@diecibottega.it per rifissare l'appuntamento." },
  "slot-expired":    { title: "Orario passato",      body: "L'orario che hai scelto è già passato. Scrivici a info@diecibottega.it per proporne di nuovi." },
  "lead-not-found":  { title: "Cliente non trovato", body: "Non riusciamo a recuperare i tuoi dati. Scrivici a info@diecibottega.it." },
  "update-failed":   { title: "Errore tecnico",      body: "Qualcosa è andato storto da parte nostra. Scrivici a info@diecibottega.it e gestiamo manualmente." },
  "server-config":   { title: "Servizio non disponibile", body: "Il sistema di prenotazione è in manutenzione. Scrivici a info@diecibottega.it." },
};

export default async function AppuntamentoConfermato({
  searchParams,
}: {
  searchParams: Promise<{ slot?: string; name?: string; status?: string; reason?: string }>;
}) {
  const sp = await searchParams;
  const isError = sp.status === "error";
  const errorInfo = isError ? (ERROR_MESSAGES[sp.reason ?? ""] ?? { title: "Errore", body: "Qualcosa è andato storto." }) : null;

  const slot = sp.slot;
  const name = sp.name;
  const slotLabel = slot ? formatSlotLabel(slot) : "";
  const firstName = name ? name.split(/\s+/)[0] : "";

  return (
    <main className="min-h-screen bg-ivory text-obsidian flex items-center justify-center px-6 py-16 relative overflow-hidden">
      <div className="noise-overlay" aria-hidden />

      <div className="relative w-full max-w-[640px]">

        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <span className="block w-8 h-px bg-rosewood" />
          <span className="text-rosewood" style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.6875rem", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            DIECI BOTTEGA · {isError ? "ERRORE" : "APPUNTAMENTO"}
          </span>
        </div>

        {isError ? (
          <>
            <h1
              className="text-obsidian mb-4"
              style={{
                fontFamily:    "var(--db-archivo)",
                fontWeight:    900,
                fontSize:      "clamp(2.25rem, 5vw, 3.75rem)",
                lineHeight:    0.95,
                letterSpacing: "-0.035em",
                textTransform: "uppercase",
              }}
            >
              {errorInfo!.title}
            </h1>
            <p
              className="text-obsidian/60 mb-8 max-w-md"
              style={{ fontFamily: "var(--db-cardo)", fontStyle: "italic", fontSize: "1.125rem", lineHeight: 1.5 }}
            >
              {errorInfo!.body}
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <a
                href="mailto:info@diecibottega.it"
                className="relative flex items-center justify-center gap-2 bg-rosewood text-ivory overflow-hidden group press"
                style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.6875rem", letterSpacing: "0.10em", textTransform: "uppercase", padding: "1rem 1.5rem" }}
              >
                Scrivici a info@
                <span>→</span>
              </a>
              <Link
                href="/"
                className="border border-obsidian/20 hover:border-obsidian/40 text-obsidian/60 hover:text-obsidian transition-colors duration-300 press"
                style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.6875rem", letterSpacing: "0.10em", textTransform: "uppercase", padding: "1rem 1.5rem", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
              >
                Torna al sito
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <span className="w-12 h-12 bg-rosewood flex items-center justify-center shrink-0">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
                  <path d="M4.5 11L9 15.5L17.5 7" stroke="#F4EFE6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <p className="text-rosewood" style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.6875rem", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                CONFERMATO
              </p>
            </div>

            <h1
              className="text-obsidian mb-4"
              style={{
                fontFamily:    "var(--db-archivo)",
                fontWeight:    900,
                fontSize:      "clamp(2.5rem, 6vw, 4.5rem)",
                lineHeight:    0.9,
                letterSpacing: "-0.04em",
                textTransform: "uppercase",
              }}
            >
              Ci sentiamo<br />
              <span className="text-obsidian/40">presto{firstName ? `, ${firstName}` : ""}.</span>
            </h1>

            <p
              className="text-obsidian/60 mb-8 max-w-md"
              style={{ fontFamily: "var(--db-cardo)", fontStyle: "italic", fontSize: "1.25rem", lineHeight: 1.4 }}
            >
              Abbiamo bloccato il calendario. Una conferma è in arrivo
              nella tua casella di posta.
            </p>

            {/* Appointment card */}
            <div className="border border-obsidian/10 bg-ivory shadow-atelier p-7 lg:p-9 mb-8">
              <p className="text-rosewood mb-3" style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5625rem", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700 }}>
                ◆ IL TUO APPUNTAMENTO
              </p>
              <p
                className="text-obsidian mb-4"
                style={{
                  fontFamily:    "var(--db-archivo)",
                  fontWeight:    900,
                  fontSize:      "clamp(1.5rem, 3vw, 2.25rem)",
                  lineHeight:    1.05,
                  letterSpacing: "-0.025em",
                  textTransform: "uppercase",
                }}
              >
                {slotLabel || "Slot confermato"}
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-obsidian/55" style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.6875rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                <span>● 30 MINUTI</span>
                <span>● GOOGLE MEET</span>
                <span>● EUROPA/ROMA (CET)</span>
              </div>
            </div>

            <p className="text-obsidian/45 mb-8" style={{ fontFamily: "var(--db-archivo)", fontSize: "0.875rem", lineHeight: 1.65 }}>
              Ti invieremo il link Google Meet 30 minuti prima della call.<br />
              Per spostare o annullare, scrivici a{" "}
              <a href="mailto:info@diecibottega.it" className="text-rosewood hover:text-obsidian transition-colors">info@diecibottega.it</a>.
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <Link
                href="/"
                className="relative flex items-center justify-center gap-2 bg-obsidian text-ivory overflow-hidden group press"
                style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.6875rem", letterSpacing: "0.10em", textTransform: "uppercase", padding: "1rem 1.5rem" }}
              >
                Torna al sito
                <span>→</span>
              </Link>
            </div>

            <p className="text-obsidian/25 mt-12 italic" style={{ fontFamily: "var(--db-cardo)", fontSize: "1rem" }}>
              — Lorenzo &amp; Tommaso
            </p>
          </>
        )}
      </div>
    </main>
  );
}
