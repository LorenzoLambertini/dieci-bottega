/**
 * Portfolio dei Video Spot, mostrato nella pagina /servizi/video-spot.
 *
 * Per aggiungere un video:
 *  1. metti il file in public/video/portfolio/ (mp4 H.264, meglio sotto i 10 MB)
 *     e un'immagine di copertina .jpg con lo stesso nome;
 *  2. aggiungi una voce qui sotto. format: "16:9" orizzontale, "9:16" verticale (reel).
 * Finché i video sono meno di tre, la pagina mostra dei riquadri "Il prossimo può essere il tuo".
 */

export interface PortfolioVideo {
  title: string;
  /** Per chi è stato fatto, es. "Pizzeria Da Mario · Bologna" */
  client: string;
  src: string;
  poster: string;
  format: "16:9" | "9:16";
  /** Durata in secondi */
  seconds: number;
}

export const PORTFOLIO_VIDEOS: PortfolioVideo[] = [
  {
    title: "Lavori bene. Fallo vedere.",
    client: "Dieci Bottega · Bologna",
    src: "/video/spot-720.mp4",
    poster: "/video/spot-poster.jpg",
    format: "16:9",
    seconds: 39,
  },
];
