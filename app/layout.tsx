import type { Metadata } from "next";
import { Archivo, Cardo, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--db-archivo",
  display: "swap",
});

const cardo = Cardo({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--db-cardo",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--db-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dieci Bottega — Siti web professionali per PMI italiane",
  description:
    "Costruiamo siti web professionali per PMI italiane in 10 giorni. Al prezzo di un template, con la cura di un'agenzia. AI-powered, Made in Bologna.",
  keywords: [
    "siti web PMI italiane",
    "web agency Bologna",
    "siti web professionali",
    "Next.js web agency",
    "siti web 10 giorni",
    "web design Bologna",
    "AI-powered web design",
  ],
  authors: [{ name: "Dieci Bottega" }],
  creator: "Dieci Bottega",
  metadataBase: new URL("https://diecibottega.it"),
  openGraph: {
    title: "Dieci Bottega — Siti web professionali per PMI italiane",
    description:
      "Costruiamo siti web professionali per PMI italiane in 10 giorni. Al prezzo di un template, con la cura di un'agenzia.",
    url: "https://diecibottega.it",
    siteName: "Dieci Bottega",
    locale: "it_IT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dieci Bottega — Siti web professionali per PMI italiane",
    description: "Costruiamo siti web professionali per PMI italiane in 10 giorni.",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="it"
      className={`${archivo.variable} ${cardo.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased">
        {children}
        {/* Lead capture embed — fires on contact form submit */}
        <script src="/embed.js" async />
      </body>
    </html>
  );
}
