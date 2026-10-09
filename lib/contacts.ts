/**
 * Contatti condivisi · unica fonte per numero WhatsApp ed email.
 * Per cambiare numero basta modificare WHATSAPP_NUMBER.
 */

/** Numero in formato internazionale, solo cifre (senza + né spazi) */
export const WHATSAPP_NUMBER = "393927854129";

export const WHATSAPP_MESSAGE = "Ciao Dieci Bottega, vi scrivo dal sito";

export const WHATSAPP_URL =
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

export const EMAIL = "info@diecibottega.it";

/** Profili social mostrati nel footer del sito. */
export const SOCIAL_LINKS = [
  { platform: "instagram", label: "Instagram", href: "https://www.instagram.com/diecibottega/" },
  { platform: "facebook",  label: "Facebook",  href: "https://www.facebook.com/1309642035566812" },
  { platform: "linkedin",  label: "LinkedIn",  href: "https://www.linkedin.com/company/diecibottega/" },
] as const;

/** Link WhatsApp con un messaggio già scritto (es. il servizio che interessa). */
export function whatsappUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
