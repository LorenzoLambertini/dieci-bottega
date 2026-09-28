import Link from "next/link";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata = {
  title: "Checklist sito web per PMI · Dieci Bottega",
  description: "20 controlli pratici per capire se il sito della tua attività porta davvero contatti e clienti.",
};

const SECTIONS: { title: string; items: string[] }[] = [
  {
    title: "1. Primi 5 secondi",
    items: [
      "Chi arriva capisce subito cosa fai, per chi e dove (es. \"Ristorante di pesce a Bologna\").",
      "C'è un'azione principale ben visibile: chiama, scrivi su WhatsApp, prenota, chiedi un preventivo.",
      "Le foto sono tue e recenti, non immagini di repertorio.",
      "Il logo e i colori sono gli stessi dei tuoi social e dell'insegna.",
    ],
  },
  {
    title: "2. Da telefono",
    items: [
      "Il sito si apre in meno di 3 secondi con il 4G (provalo su pagespeed.web.dev).",
      "I testi si leggono senza zoomare e i pulsanti si premono con il pollice.",
      "Numero di telefono e WhatsApp si aprono con un tocco.",
      "Il menu è semplice: 5 voci al massimo.",
    ],
  },
  {
    title: "3. Farsi trovare",
    items: [
      "Cercando \"la tua attività + città\" su Google compari in prima pagina.",
      "La scheda Google Business Profile è completa, con orari aggiornati e link al sito.",
      "Ogni pagina ha un titolo chiaro con servizio e città.",
      "Indirizzo, orari e contatti sono scritti come testo, non solo dentro un'immagine.",
    ],
  },
  {
    title: "4. Fiducia",
    items: [
      "Ci sono recensioni o testimonianze vere, con nome e foto quando possibile.",
      "Mostri lavori, piatti, prodotti o casi reali con prezzi o fasce di prezzo indicative.",
      "Privacy policy, cookie e P.IVA sono presenti e aggiornati.",
      "Il sito ha il lucchetto (https) e nessun avviso di sicurezza del browser.",
    ],
  },
  {
    title: "5. Contatti che arrivano davvero",
    items: [
      "Il modulo contatti ha pochi campi (nome, telefono o email, messaggio).",
      "Ogni richiesta ti arriva subito via email o notifica, e rispondi entro 24 ore.",
      "Sai quante richieste arrivano dal sito ogni mese (anche solo contandole a mano).",
      "Aggiorni il sito almeno una volta ogni 3 mesi: orari, foto, offerte.",
    ],
  },
];

export default function ChecklistSitoWebPmiPage() {
  return (
    <LegalPage eyebrow="Guida gratuita" title="Checklist sito web per PMI" updated="28 settembre 2026">
      <section>
        <p>
          20 controlli rapidi per capire se il sito della tua attività lavora per te. Segna quelli che rispetti: sotto
          i 15 c&apos;è margine concreto per ricevere più contatti.
        </p>
      </section>

      {SECTIONS.map((s) => (
        <section key={s.title}>
          <h2>{s.title}</h2>
          <ul>
            {s.items.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </section>
      ))}

      <section>
        <h2>Vuoi un parere sul tuo sito?</h2>
        <p>
          Mandaci il link: in 30 minuti ti diciamo cosa sistemare per primo, gratis e senza impegno.{" "}
          <Link href="/inizia-progetto">Prenota la call</Link> oppure rispondi al messaggio che ti abbiamo mandato.
        </p>
      </section>
    </LegalPage>
  );
}
