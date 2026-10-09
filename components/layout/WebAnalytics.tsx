import Script from "next/script";

/**
 * Vercel Web Analytics: visite, pagine più viste e provenienza, senza cookie
 * (quindi senza banner). Si attiva da Vercel → progetto → Analytics → Enable.
 * Lo script è servito da Vercel stesso, quindi in locale non viene caricato.
 */
export default function WebAnalytics() {
  if (process.env.NODE_ENV !== "production") return null;
  return (
    <>
      <Script id="vercel-analytics-queue" strategy="afterInteractive">
        {"window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };"}
      </Script>
      <Script src="/_vercel/insights/script.js" strategy="afterInteractive" />
    </>
  );
}
