import { LegalPage } from "@/components/layout/LegalPage";
import { EMAIL } from "@/lib/contacts";

export const metadata = {
  title: "Privacy Policy · Dieci Bottega",
  description: "Come Dieci Bottega tratta i dati personali raccolti dal sito, dai form di contatto e dai canali social.",
};

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Informativa" title="Privacy Policy" updated="27 settembre 2026">
      <section>
        <h2>Titolare del trattamento</h2>
        <p>
          Dieci Bottega (Lorenzo Lambertini e Tommaso Villa), Bologna. Per qualsiasi richiesta sui tuoi dati scrivi a{" "}
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
        </p>
      </section>

      <section>
        <h2>Quali dati raccogliamo</h2>
        <ul>
          <li>Dati che ci invii dai form del sito e dalla chat: nome, email, telefono, attività, messaggio.</li>
          <li>
            Messaggi e commenti che ci scrivi sui nostri profili social (Instagram, Facebook, LinkedIn, TikTok), con il
            nome utente e l&apos;immagine del profilo resi disponibili dalle piattaforme tramite le loro API ufficiali.
          </li>
          <li>Dati tecnici di navigazione necessari al funzionamento del sito.</li>
          <li>
            Statistiche di visita anonime e aggregate (pagine viste, provenienza, tipo di dispositivo) tramite Vercel Web
            Analytics, che non usa cookie e non permette di identificarti.
          </li>
          <li>
            Se ci scrivi da un form o dalla chat, la prima pagina che hai visitato e il sito da cui sei arrivato (ad esempio
            Google o Instagram): restano nel tuo browser solo per la durata della visita e ci vengono inviati soltanto
            insieme alla tua richiesta, per capire quali contenuti sono utili.
          </li>
        </ul>
      </section>

      <section>
        <h2>Perché li usiamo</h2>
        <ul>
          <li>Rispondere alle tue richieste, inviarti le guide o i materiali che hai chiesto, fissare una call.</li>
          <li>Gestire il rapporto commerciale nel nostro CRM interno (storico dei contatti, note, preventivi).</li>
          <li>Rispondere a commenti e messaggi sui social, anche con l&apos;aiuto di un assistente di intelligenza artificiale supervisionato dal team.</li>
        </ul>
        <p className="mt-3">
          La base giuridica è la tua richiesta (misure precontrattuali) e il nostro legittimo interesse a rispondere a
          chi ci contatta. Non vendiamo i tuoi dati e non li usiamo per profilazione pubblicitaria.
        </p>
      </section>

      <section>
        <h2>Assistente AI</h2>
        <p>
          Alcune risposte a messaggi e commenti social sono preparate da un assistente AI (Claude, fornito da Anthropic)
          che riceve il testo della conversazione e i dati di contatto strettamente necessari. L&apos;assistente si
          dichiara come tale se richiesto e passa la conversazione a una persona del team quando serve. Puoi sempre
          chiedere di parlare con una persona.
        </p>
      </section>

      <section>
        <h2>Fornitori che trattano i dati per nostro conto</h2>
        <ul>
          <li>Supabase (database del CRM, server nell&apos;Unione Europea).</li>
          <li>Vercel (hosting del sito).</li>
          <li>Resend (invio email).</li>
          <li>Anthropic (assistente AI).</li>
          <li>Meta, LinkedIn e TikTok, per i messaggi scambiati sulle rispettive piattaforme, secondo le loro informative.</li>
        </ul>
        <p className="mt-3">
          Alcuni fornitori possono trattare dati fuori dall&apos;Unione Europea; in quel caso il trasferimento avviene con
          le garanzie previste dal GDPR (ad esempio le Clausole Contrattuali Standard).
        </p>
      </section>

      <section>
        <h2>Per quanto tempo</h2>
        <p>
          Conserviamo i dati per il tempo necessario a gestire la tua richiesta e l&apos;eventuale rapporto commerciale,
          e comunque non oltre 24 mesi dall&apos;ultimo contatto, salvo obblighi di legge.
        </p>
      </section>

      <section>
        <h2>I tuoi diritti</h2>
        <p>
          Puoi chiedere accesso, rettifica, cancellazione, limitazione, portabilità dei dati e opporti al trattamento
          scrivendo a <a href={`mailto:${EMAIL}`}>{EMAIL}</a>. Puoi anche presentare reclamo al Garante per la
          protezione dei dati personali. Per cancellare i dati raccolti tramite i social vedi{" "}
          <a href="/eliminazione-dati">Eliminazione dei dati</a>.
        </p>
      </section>
    </LegalPage>
  );
}
