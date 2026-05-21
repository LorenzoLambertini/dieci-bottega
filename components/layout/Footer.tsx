const NAV = [
  { label: "Lavori",   href: "#lavori"   },
  { label: "Servizi",  href: "#servizi"  },
  { label: "Bottega",  href: "#bottega"  },
  { label: "Prezzi",   href: "#prezzi"   },
  { label: "Contatti", href: "#contatti" },
];

export default function Footer() {
  return (
    <footer className="bg-obsidian border-t" style={{ borderColor: "rgba(244,239,230,0.08)" }}>
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12 py-16 lg:py-20">

        {/* Top */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-12 mb-12 pb-12 border-b" style={{ borderColor: "rgba(244,239,230,0.08)" }}>

          {/* Brand */}
          <div>
            <p
              className="text-ivory"
              style={{ fontFamily: "var(--db-archivo)", fontWeight: 900, fontSize: "1.375rem", textTransform: "uppercase", letterSpacing: "-0.02em", marginBottom: "0.375rem" }}
            >
              Dieci Bottega
            </p>
            <p
              className="text-ivory/35 mb-5"
              style={{ fontFamily: "var(--db-cardo)", fontStyle: "italic", fontSize: "1rem" }}
            >
              È tutto nei dettagli.
            </p>
            <p
              className="text-ivory/35 max-w-xs"
              style={{ fontFamily: "var(--db-archivo)", fontSize: "0.875rem", lineHeight: 1.65 }}
            >
              Micro-agenzia digitale italiana. Siti professionali per PMI
              in 10 giorni, al prezzo di un template, con la cura di
              un&apos;agenzia.
            </p>
          </div>

          {/* Nav */}
          <div>
            <p
              className="text-ivory/20 mb-5"
              style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5625rem", letterSpacing: "0.12em", textTransform: "uppercase" }}
            >
              NAVIGAZIONE
            </p>
            <ul className="space-y-3">
              {NAV.map(l => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="text-ivory/40 hover:text-ivory"
                    style={{ fontFamily: "var(--db-archivo)", fontSize: "0.875rem", transition: "color 0.2s" }}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <p
              className="text-ivory/20 mb-5"
              style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5625rem", letterSpacing: "0.12em", textTransform: "uppercase" }}
            >
              CONTATTI
            </p>
            <div className="space-y-3">
              <a
                href="mailto:ciao@diecibottega.it"
                className="block text-ivory/40 hover:text-ivory"
                style={{ fontFamily: "var(--db-archivo)", fontSize: "0.875rem", transition: "color 0.2s" }}
              >
                ciao@diecibottega.it
              </a>
              <a
                href="https://wa.me/393331234567"
                className="block text-ivory/40 hover:text-ivory"
                style={{ fontFamily: "var(--db-archivo)", fontSize: "0.875rem", transition: "color 0.2s" }}
              >
                WhatsApp →
              </a>
              <p
                className="text-ivory/25"
                style={{ fontFamily: "var(--db-archivo)", fontSize: "0.875rem" }}
              >
                Bologna · Italia
              </p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <p
            className="text-ivory/18"
            style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5625rem", letterSpacing: "0.08em", textTransform: "uppercase" }}
          >
            © {new Date().getFullYear()} DIECI BOTTEGA® · TUTTI I DIRITTI RISERVATI · P.IVA IN CORSO
          </p>
          <p
            className="text-ivory/18 flex items-center gap-2"
            style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5625rem", letterSpacing: "0.06em", textTransform: "uppercase" }}
          >
            MADE WITH <span style={{ color: "#E63B2E" }}>♥</span> IN BOLOGNA · NEXT.JS · TAILWIND · VERCEL
          </p>
        </div>
      </div>
    </footer>
  );
}
