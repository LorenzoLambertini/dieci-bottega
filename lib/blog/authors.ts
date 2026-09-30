import type { BlogAuthor } from "./types";

export const AUTHORS: Record<BlogAuthor["id"], BlogAuthor> = {
  lorenzo: {
    id: "lorenzo",
    name: "Lorenzo Lambertini",
    role: "Co-founder · design e codice",
    bio: "Progetta e sviluppa i siti e i CRM di Dieci Bottega. Usa l'AI ogni giorno per consegnare in dieci giorni lavori fatti bene.",
  },
  tommaso: {
    id: "tommaso",
    name: "Tommaso Villa",
    role: "Co-founder · strategia e vendite",
    bio: "Segue i clienti dal primo contatto alla messa online: obiettivi, contenuti e strategia per farsi trovare.",
  },
};
