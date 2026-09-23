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
