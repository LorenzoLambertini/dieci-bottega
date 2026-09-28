/** Pulsanti di contatto rapido (telefono, WhatsApp, email): pensati per il telefono. */

/** Numero per wa.me: solo cifre, prefisso 39 per i numeri italiani senza prefisso. */
export function whatsappNumber(phone: string): string | null {
  let d = phone.replace(/[^\d+]/g, "");
  if (d.startsWith("+")) d = d.slice(1);
  else if (d.startsWith("00")) d = d.slice(2);
  else if (/^3\d{8,9}$/.test(d)) d = `39${d}`; // cellulare italiano senza prefisso
  d = d.replace(/\D/g, "");
  return d.length >= 8 ? d : null;
}

const btn =
  "flex-1 min-w-[90px] flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold transition-colors";

export function ContactButtons({ phone, email, name }: { phone: string | null; email: string | null; name: string }) {
  const wa = phone ? whatsappNumber(phone) : null;
  if (!phone && !email) return null;
  const first = name.split(" ")[0];
  return (
    <div className="flex flex-wrap gap-2 mt-5">
      {phone && (
        <a href={`tel:${phone.replace(/\s/g, "")}`} className={`${btn} bg-white/[0.06] hover:bg-white/[0.1] text-white/80`}>
          <span aria-hidden>📞</span> Chiama
        </a>
      )}
      {wa && (
        <a
          href={`https://wa.me/${wa}?text=${encodeURIComponent(`Ciao ${first}, sono di Dieci Bottega. `)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btn} bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#4be283]`}
        >
          <span aria-hidden>💬</span> WhatsApp
        </a>
      )}
      {email && (
        <a href={`mailto:${email}?subject=${encodeURIComponent("Dieci Bottega")}`} className={`${btn} bg-white/[0.06] hover:bg-white/[0.1] text-white/80`}>
          <span aria-hidden>✉️</span> Email
        </a>
      )}
    </div>
  );
}
