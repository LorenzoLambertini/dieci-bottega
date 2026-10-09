import { EMAIL, SOCIAL_LINKS, WHATSAPP_NUMBER } from "@/lib/contacts";

const SITE = "https://diecibottega.it";

/** Chi siamo, per Google e assistenti AI: nome, contatti, città, fondatori e profili social. */
export default function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${SITE}/#organization`,
    name: "Dieci Bottega",
    url: SITE,
    logo: `${SITE}/logo.png`,
    image: `${SITE}/video/spot-poster.jpg`,
    description:
      "Micro-agenzia digitale di Bologna: siti web per piccole imprese online in circa dieci giorni, CRM su misura e automazioni con l'intelligenza artificiale.",
    email: EMAIL,
    telephone: `+${WHATSAPP_NUMBER}`,
    address: { "@type": "PostalAddress", addressLocality: "Bologna", addressRegion: "BO", addressCountry: "IT" },
    areaServed: [{ "@type": "City", name: "Bologna" }, { "@type": "Country", name: "Italia" }],
    priceRange: "50€–5.000€",
    foundingDate: "2026",
    founder: [
      { "@type": "Person", name: "Lorenzo Lambertini", jobTitle: "Design e sviluppo" },
      { "@type": "Person", name: "Tommaso Villa", jobTitle: "Strategia e clienti" },
    ],
    sameAs: SOCIAL_LINKS.map((s) => s.href),
    knowsAbout: ["Siti web", "SEO locale", "CRM", "Automazioni", "Intelligenza artificiale", "Video spot"],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
