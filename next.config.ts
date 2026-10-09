import type { NextConfig } from "next";

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  // + CDN avatar dei profili social (Social AI inbox)
  "img-src 'self' data: blob: https://*.fbcdn.net https://*.cdninstagram.com https://*.licdn.com https://*.tiktokcdn.com https://*.tiktokcdn-eu.com",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "frame-ancestors 'none'",
].join("; ");

// Siti demo dei concept (public/concept-demo): stessa policy, ma con le foto stock di Unsplash
// finché non sono scaricate in locale. Mai indicizzati: Google vede solo i casi studio /concept/<slug>.
const DEMO_CSP = CSP
  .replace("img-src 'self' data: blob:", "img-src 'self' data: blob: https://images.unsplash.com")
  // le demo si possono mostrare in anteprima dentro le pagine del sito stesso
  .replace("frame-ancestors 'none'", "frame-ancestors 'self'");
const SAMEORIGIN = { key: "X-Frame-Options", value: "SAMEORIGIN" };
const NOINDEX = { key: "X-Robots-Tag", value: "noindex, nofollow" };

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async rewrites() {
    return [
      { source: "/concept/:slug/prima", destination: "/concept-demo/:slug/prima.html" },
      { source: "/concept/:slug/dopo",  destination: "/concept-demo/:slug/dopo.html" },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",  value: "nosniff" },
          { key: "X-Frame-Options",         value: "DENY" },
          { key: "Referrer-Policy",         value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",      value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: CSP },
        ],
      },
      // Le regole successive sovrascrivono la CSP generale solo per i siti demo
      { source: "/concept/:slug/:version(prima|dopo)", headers: [NOINDEX, SAMEORIGIN, { key: "Content-Security-Policy", value: DEMO_CSP }] },
      { source: "/concept-demo/:path*",                headers: [NOINDEX, SAMEORIGIN, { key: "Content-Security-Policy", value: DEMO_CSP }] },
    ];
  },
};

export default nextConfig;
