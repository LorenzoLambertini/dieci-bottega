import { LegalPage } from "@/components/layout/LegalPage";
import { EMAIL } from "@/lib/contacts";

export const metadata = {
  title: "Eliminazione dei dati · Dieci Bottega",
  description: "Come chiedere a Dieci Bottega di eliminare i tuoi dati, inclusi quelli ricevuti da Instagram, Facebook, LinkedIn e TikTok.",
};

export default function DataDeletionPage() {
  return (
    <LegalPage eyebrow="I tuoi dati" title="Eliminazione dei dati" updated="27 settembre 2026">
      <section>
        <p>
          Puoi chiederci in qualsiasi momento di eliminare i dati che ti riguardano, compresi i messaggi, i commenti e
          le informazioni di profilo ricevuti tramite Instagram, Facebook, LinkedIn o TikTok.
        </p>
      </section>

      <section>
        <h2>Come fare</h2>
        <ul>
          <li>
            Scrivi a <a href={`mailto:${EMAIL}?subject=Richiesta%20eliminazione%20dati`}>{EMAIL}</a> con oggetto
            &quot;Richiesta eliminazione dati&quot;.
          </li>
          <li>Indica il tuo nome e il nome utente del profilo social con cui ci hai scritto (es. @nomeutente su Instagram).</li>
          <li>In alternativa puoi inviarci la stessa richiesta in un messaggio privato sui nostri profili social.</li>
        </ul>
      </section>

      <section>
        <h2>Cosa succede dopo</h2>
        <p>
          Eliminiamo dal nostro CRM la scheda contatto, le conversazioni, i commenti salvati e lo storico delle attività
          collegate entro 30 giorni dalla richiesta, e ti confermiamo l&apos;avvenuta cancellazione. Restano solo i dati
          che siamo obbligati a conservare per legge (ad esempio documenti fiscali).
        </p>
      </section>

      <section>
        <h2>Revocare l&apos;accesso dai social</h2>
        <p>
          Noi non accediamo al tuo account social: riceviamo solo i messaggi e i commenti che ci invii. I dati restano
          comunque gestiti da ciascuna piattaforma secondo le sue impostazioni sulla privacy.
        </p>
      </section>
    </LegalPage>
  );
}
