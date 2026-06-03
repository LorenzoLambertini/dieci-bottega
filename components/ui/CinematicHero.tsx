"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const INJECTED_STYLES = `
  .gsap-reveal { visibility: hidden; }

  .ch-film-grain {
    position: absolute; inset: 0; width: 100%; height: 100%;
    pointer-events: none; z-index: 50; opacity: 0.05; mix-blend-mode: overlay;
    background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="noiseFilter"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%25" height="100%25" filter="url(%23noiseFilter)"/></svg>');
  }

  .ch-bg-grid {
    background-size: 60px 60px;
    background-image:
      linear-gradient(to right, rgba(26,20,20,0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(26,20,20,0.05) 1px, transparent 1px);
    mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
    -webkit-mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
  }

  .ch-text-3d-matte {
    color: #1A1414;
    text-shadow:
      0 10px 30px rgba(26,20,20,0.18),
      0 2px 4px rgba(26,20,20,0.08);
  }

  .ch-text-rosewood-matte {
    background: linear-gradient(180deg, #E63B2E 0%, rgba(122,24,24,0.6) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    transform: translateZ(0);
    filter:
      drop-shadow(0px 10px 20px rgba(230,59,46,0.18))
      drop-shadow(0px 2px 4px rgba(26,20,20,0.10));
  }

  .ch-text-card-ivory {
    background: linear-gradient(180deg, #F4EFE6 0%, rgba(244,239,230,0.45) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    transform: translateZ(0);
    filter:
      drop-shadow(0px 12px 24px rgba(0,0,0,0.75))
      drop-shadow(0px 4px 8px rgba(0,0,0,0.55));
  }

  .ch-premium-card {
    background: linear-gradient(145deg, #1A1414 0%, #0C0808 100%);
    box-shadow:
      0 40px 100px -20px rgba(0,0,0,0.85),
      0 20px 40px -20px rgba(0,0,0,0.75),
      inset 0 1px 2px rgba(244,239,230,0.18),
      inset 0 -2px 4px rgba(0,0,0,0.75);
    border: 1px solid rgba(244,239,230,0.05);
    position: relative;
  }

  .ch-card-sheen {
    position: absolute; inset: 0; border-radius: inherit; pointer-events: none; z-index: 50;
    background: radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(230,59,46,0.08) 0%, transparent 40%);
    mix-blend-mode: screen; transition: opacity 0.3s ease;
  }

  .ch-iphone-bezel {
    background-color: #0C0808;
    box-shadow:
      inset 0 0 0 2px #4A3838,
      inset 0 0 0 7px #000,
      0 40px 80px -15px rgba(0,0,0,0.9),
      0 15px 25px -5px rgba(0,0,0,0.7);
    transform-style: preserve-3d;
  }

  .ch-hardware-btn {
    background: linear-gradient(90deg, #4A3838 0%, #171010 100%);
    box-shadow:
      -2px 0 5px rgba(0,0,0,0.8),
      inset -1px 0 1px rgba(244,239,230,0.12),
      inset 1px 0 2px rgba(0,0,0,0.8);
  }

  .ch-screen-glare {
    background: linear-gradient(110deg, rgba(244,239,230,0.08) 0%, rgba(244,239,230,0) 45%);
  }

  .ch-widget-depth {
    background: linear-gradient(180deg, rgba(244,239,230,0.04) 0%, rgba(244,239,230,0.01) 100%);
    box-shadow:
      0 10px 20px rgba(0,0,0,0.3),
      inset 0 1px 1px rgba(244,239,230,0.06),
      inset 0 -1px 1px rgba(0,0,0,0.5);
    border: 1px solid rgba(244,239,230,0.04);
  }

  .ch-floating-badge {
    background: linear-gradient(135deg, rgba(244,239,230,0.10) 0%, rgba(244,239,230,0.02) 100%);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    box-shadow:
      0 0 0 1px rgba(244,239,230,0.10),
      0 25px 50px -12px rgba(0,0,0,0.8),
      inset 0 1px 1px rgba(244,239,230,0.18),
      inset 0 -1px 1px rgba(0,0,0,0.5);
  }

  .ch-btn-light, .ch-btn-dark { transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1); }
  .ch-btn-light {
    background: linear-gradient(180deg, #F4EFE6 0%, #E8E2D6 100%);
    color: #1A1414;
    box-shadow:
      0 0 0 1px rgba(26,20,20,0.06),
      0 2px 4px rgba(26,20,20,0.10),
      0 12px 24px -4px rgba(26,20,20,0.25),
      inset 0 1px 1px rgba(255,255,255,1),
      inset 0 -3px 6px rgba(26,20,20,0.06);
  }
  .ch-btn-light:hover {
    transform: translateY(-3px);
    box-shadow:
      0 0 0 1px rgba(26,20,20,0.08),
      0 6px 12px -2px rgba(26,20,20,0.15),
      0 20px 32px -6px rgba(26,20,20,0.35),
      inset 0 1px 1px rgba(255,255,255,1),
      inset 0 -3px 6px rgba(26,20,20,0.06);
  }
  .ch-btn-dark {
    background: linear-gradient(180deg, #E63B2E 0%, #C44A38 100%);
    color: #F4EFE6;
    box-shadow:
      0 0 0 1px rgba(244,239,230,0.10),
      0 2px 4px rgba(0,0,0,0.5),
      0 12px 24px -4px rgba(0,0,0,0.5),
      inset 0 1px 1px rgba(244,239,230,0.2),
      inset 0 -3px 6px rgba(0,0,0,0.3);
  }
  .ch-btn-dark:hover {
    transform: translateY(-3px);
    background: linear-gradient(180deg, #C44A38 0%, #7A1818 100%);
  }

  .ch-progress-ring {
    transform: rotate(-90deg);
    transform-origin: center;
    stroke-dasharray: 402;
    stroke-dashoffset: 402;
    stroke-linecap: round;
  }
`;

export interface CinematicHeroProps extends React.HTMLAttributes<HTMLDivElement> {
  brandName?:       string;
  tagline1?:        string;
  tagline2?:        string;
  cardHeading?:     string;
  cardDescription?: React.ReactNode;
  metricValue?:     number;
  metricLabel?:     string;
  ctaHeading?:      string;
  ctaDescription?:  string;
  primaryHref?:     string;
  secondaryHref?:   string;
}

export function CinematicHero({
  brandName       = "Dieci/B",
  tagline1        = "Il sito che ti serve.",
  tagline2        = "In dieci giorni.",
  cardHeading     = "Mestiere, riportato online.",
  cardDescription = <>Costruiamo siti professionali per PMI italiane in dieci giorni. <span className="text-ivory font-semibold">Veloci, ma non frettolosi.</span> È tutto nei dettagli.</>,
  metricValue     = 10,
  metricLabel     = "Giorni di consegna",
  ctaHeading      = "Inizia il tuo progetto.",
  ctaDescription  = "Una call di 30 minuti. Gratis. Senza impegno. Capiamo se siamo i giusti per te.",
  primaryHref     = "/inizia-progetto",
  secondaryHref   = "/servizi",
  className,
  ...props
}: CinematicHeroProps) {

  const containerRef = useRef<HTMLDivElement>(null);
  const mainCardRef  = useRef<HTMLDivElement>(null);
  const mockupRef    = useRef<HTMLDivElement>(null);
  const requestRef   = useRef<number>(0);

  // High-perf mouse interaction
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (window.scrollY > window.innerHeight * 2) return;
      cancelAnimationFrame(requestRef.current);
      requestRef.current = requestAnimationFrame(() => {
        if (mainCardRef.current && mockupRef.current) {
          const rect = mainCardRef.current.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;
          mainCardRef.current.style.setProperty("--mouse-x", `${mouseX}px`);
          mainCardRef.current.style.setProperty("--mouse-y", `${mouseY}px`);
          const xVal = (e.clientX / window.innerWidth - 0.5) * 2;
          const yVal = (e.clientY / window.innerHeight - 0.5) * 2;
          gsap.to(mockupRef.current, {
            rotationY: xVal * 12,
            rotationX: -yVal * 12,
            ease: "power3.out",
            duration: 1.2,
          });
        }
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Cinematic scroll timeline
  useEffect(() => {
    const isMobile = window.innerWidth < 768;

    const ctx = gsap.context(() => {
      gsap.set(".ch-text-track", { autoAlpha: 0, y: 60, scale: 0.85, filter: "blur(20px)", rotationX: -20 });
      gsap.set(".ch-text-days",  { autoAlpha: 1, clipPath: "inset(0 100% 0 0)" });
      gsap.set(".ch-main-card",  { y: window.innerHeight + 200, autoAlpha: 1 });
      gsap.set([".ch-card-left-text", ".ch-card-right-text", ".ch-mockup-scroll-wrapper", ".ch-floating-badge", ".ch-phone-widget"], { autoAlpha: 0 });
      gsap.set(".ch-cta-wrapper", { autoAlpha: 0, scale: 0.8, filter: "blur(30px)" });

      const intro = gsap.timeline({ delay: 0.3 });
      intro
        .to(".ch-text-track", { duration: 1.8, autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", rotationX: 0, ease: "expo.out" })
        .to(".ch-text-days",  { duration: 1.4, clipPath: "inset(0 0% 0 0)", ease: "power4.inOut" }, "-=1.0");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=7000",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      tl.to([".ch-hero-text-wrapper", ".ch-bg-grid"], { scale: 1.15, filter: "blur(20px)", opacity: 0.2, ease: "power2.inOut", duration: 2 }, 0)
        .to(".ch-main-card", { y: 0, ease: "power3.inOut", duration: 2 }, 0)
        .to(".ch-main-card", { width: "100%", height: "100%", borderRadius: "0px", ease: "power3.inOut", duration: 1.5 })
        .fromTo(".ch-mockup-scroll-wrapper",
          { y: 300, z: -500, rotationX: 50, rotationY: -30, autoAlpha: 0, scale: 0.6 },
          { y: 0, z: 0, rotationX: 0, rotationY: 0, autoAlpha: 1, scale: 1, ease: "expo.out", duration: 2.5 },
          "-=0.8",
        )
        .fromTo(".ch-phone-widget", { y: 40, autoAlpha: 0, scale: 0.95 }, { y: 0, autoAlpha: 1, scale: 1, stagger: 0.15, ease: "back.out(1.2)", duration: 1.5 }, "-=1.5")
        .to(".ch-progress-ring", { strokeDashoffset: 80, duration: 2, ease: "power3.inOut" }, "-=1.2")
        .to(".ch-counter-val", { innerHTML: metricValue, snap: { innerHTML: 1 }, duration: 2, ease: "expo.out" }, "-=2.0")
        .fromTo(".ch-floating-badge", { y: 100, autoAlpha: 0, scale: 0.7, rotationZ: -10 }, { y: 0, autoAlpha: 1, scale: 1, rotationZ: 0, ease: "back.out(1.5)", duration: 1.5, stagger: 0.2 }, "-=2.0")
        .fromTo(".ch-card-left-text",  { x: -50, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: "power4.out", duration: 1.5 }, "-=1.5")
        .fromTo(".ch-card-right-text", { x:  50, autoAlpha: 0, scale: 0.8 }, { x: 0, autoAlpha: 1, scale: 1, ease: "expo.out", duration: 1.5 }, "<")
        .to({}, { duration: 2.5 })
        .set(".ch-hero-text-wrapper", { autoAlpha: 0 })
        .set(".ch-cta-wrapper",       { autoAlpha: 1 })
        .to({}, { duration: 1.5 })
        .to([".ch-mockup-scroll-wrapper", ".ch-floating-badge", ".ch-card-left-text", ".ch-card-right-text"], {
          scale: 0.9, y: -40, z: -200, autoAlpha: 0, ease: "power3.in", duration: 1.2, stagger: 0.05,
        })
        .to(".ch-main-card", {
          width:        isMobile ? "92vw" : "85vw",
          height:       isMobile ? "92vh" : "85vh",
          borderRadius: isMobile ? "32px" : "40px",
          ease:         "expo.inOut",
          duration:     1.8,
        }, "pullback")
        .to(".ch-cta-wrapper", { scale: 1, filter: "blur(0px)", ease: "expo.inOut", duration: 1.8 }, "pullback")
        .to(".ch-main-card", { y: -window.innerHeight - 300, ease: "power3.in", duration: 1.5 });
    }, containerRef);

    return () => ctx.revert();
  }, [metricValue]);

  return (
    <div
      ref={containerRef}
      className={cn("relative w-screen h-screen overflow-hidden flex items-center justify-center bg-ivory text-obsidian font-sans antialiased", className)}
      style={{ perspective: "1500px" }}
      {...props}
    >
      <style dangerouslySetInnerHTML={{ __html: INJECTED_STYLES }} />
      <div className="ch-film-grain" aria-hidden />
      <div className="ch-bg-grid absolute inset-0 z-0 pointer-events-none opacity-50" aria-hidden />

      {/* Hero texts */}
      <div className="ch-hero-text-wrapper absolute z-10 flex flex-col items-center justify-center text-center w-screen px-4 will-change-transform" style={{ transformStyle: "preserve-3d" }}>
        <h1
          className="ch-text-track gsap-reveal ch-text-3d-matte tracking-tight mb-2"
          style={{
            fontFamily:    "var(--db-archivo)",
            fontWeight:    900,
            fontSize:      "clamp(2.5rem, 8vw, 7rem)",
            lineHeight:    0.95,
            letterSpacing: "-0.045em",
            textTransform: "uppercase",
          }}
        >
          {tagline1}
        </h1>
        <h1
          className="ch-text-days gsap-reveal ch-text-rosewood-matte tracking-tighter"
          style={{
            fontFamily:    "var(--db-cardo)",
            fontStyle:     "italic",
            fontWeight:    400,
            fontSize:      "clamp(2rem, 6vw, 5rem)",
            lineHeight:    1.05,
            letterSpacing: "-0.02em",
          }}
        >
          {tagline2}
        </h1>
      </div>

      {/* CTA wrapper */}
      <div className="ch-cta-wrapper absolute z-10 flex flex-col items-center justify-center text-center w-screen px-4 gsap-reveal pointer-events-auto will-change-transform">
        <h2
          className="mb-5 tracking-tight ch-text-rosewood-matte"
          style={{
            fontFamily:    "var(--db-archivo)",
            fontWeight:    900,
            fontSize:      "clamp(2rem, 5vw, 4.5rem)",
            lineHeight:    1,
            letterSpacing: "-0.04em",
            textTransform: "uppercase",
          }}
        >
          {ctaHeading}
        </h2>
        <p
          className="text-obsidian/60 mb-10 max-w-xl mx-auto"
          style={{ fontFamily: "var(--db-cardo)", fontStyle: "italic", fontSize: "clamp(1rem, 1.6vw, 1.25rem)", lineHeight: 1.5 }}
        >
          {ctaDescription}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href={primaryHref}
            className="ch-btn-dark inline-flex items-center justify-center gap-2 px-7 py-4 rounded-md"
            style={{
              fontFamily:    "var(--db-jetbrains)",
              fontSize:      "0.75rem",
              letterSpacing: "0.10em",
              textTransform: "uppercase",
              fontWeight:    700,
            }}
          >
            <span className="live-dot" /> Il tuo sito gratis →
          </a>
          <a
            href={secondaryHref}
            className="ch-btn-light inline-flex items-center justify-center gap-2 px-7 py-4 rounded-md"
            style={{
              fontFamily:    "var(--db-jetbrains)",
              fontSize:      "0.75rem",
              letterSpacing: "0.10em",
              textTransform: "uppercase",
              fontWeight:    700,
            }}
          >
            Sfoglia il catalogo
          </a>
        </div>
      </div>

      {/* The Deep Card */}
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none" style={{ perspective: "1500px" }}>
        <div
          ref={mainCardRef}
          className="ch-main-card ch-premium-card relative overflow-hidden gsap-reveal flex items-center justify-center pointer-events-auto w-[92vw] md:w-[85vw] h-[92vh] md:h-[85vh] rounded-[32px] md:rounded-[40px]"
        >
          <div className="ch-card-sheen" aria-hidden />

          <div className="relative w-full h-full max-w-7xl mx-auto px-4 lg:px-12 flex flex-col justify-evenly lg:grid lg:grid-cols-3 items-center lg:gap-8 z-10 py-6 lg:py-0">

            {/* Brand name (right on desktop, top on mobile) */}
            <div className="ch-card-right-text gsap-reveal order-1 lg:order-3 flex justify-center lg:justify-end z-20 w-full">
              <h2
                className="ch-text-card-ivory"
                style={{
                  fontFamily:    "var(--db-archivo)",
                  fontWeight:    900,
                  fontSize:      "clamp(3rem, 8vw, 8rem)",
                  letterSpacing: "-0.06em",
                  textTransform: "uppercase",
                  lineHeight:    0.9,
                }}
              >
                {brandName}
              </h2>
            </div>

            {/* iPhone mockup */}
            <div className="ch-mockup-scroll-wrapper order-2 lg:order-2 relative w-full h-[380px] lg:h-[600px] flex items-center justify-center z-10" style={{ perspective: "1000px" }}>
              <div className="relative w-full h-full flex items-center justify-center transform scale-[0.65] md:scale-85 lg:scale-100">

                <div
                  ref={mockupRef}
                  className="relative w-[280px] h-[580px] rounded-[3rem] ch-iphone-bezel flex flex-col will-change-transform"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Hardware buttons */}
                  <div className="absolute top-[120px] -left-[3px] w-[3px] h-[25px] ch-hardware-btn rounded-l-md" aria-hidden />
                  <div className="absolute top-[160px] -left-[3px] w-[3px] h-[45px] ch-hardware-btn rounded-l-md" aria-hidden />
                  <div className="absolute top-[220px] -left-[3px] w-[3px] h-[45px] ch-hardware-btn rounded-l-md" aria-hidden />
                  <div className="absolute top-[170px] -right-[3px] w-[3px] h-[70px] ch-hardware-btn rounded-r-md" style={{ transform: "scaleX(-1)" }} aria-hidden />

                  {/* Screen */}
                  <div className="absolute inset-[7px] bg-[#0C0808] rounded-[2.5rem] overflow-hidden shadow-[inset_0_0_15px_rgba(0,0,0,1)] text-ivory">
                    <div className="absolute inset-0 ch-screen-glare z-40 pointer-events-none" aria-hidden />

                    {/* Notch */}
                    <div className="absolute top-[5px] left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-full z-50 flex items-center justify-end px-3 shadow-[inset_0_-1px_2px_rgba(255,255,255,0.1)]">
                      <div className="w-1.5 h-1.5 rounded-full bg-rosewood shadow-[0_0_8px_rgba(230,59,46,0.8)] animate-pulse" />
                    </div>

                    {/* App content */}
                    <div className="relative w-full h-full pt-12 px-5 pb-8 flex flex-col">
                      <div className="ch-phone-widget flex justify-between items-center mb-8">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-ivory/40 uppercase tracking-widest font-bold mb-1" style={{ fontFamily: "var(--db-jetbrains)", letterSpacing: "0.18em" }}>Oggi</span>
                          <span className="text-xl text-ivory drop-shadow-md" style={{ fontFamily: "var(--db-archivo)", fontWeight: 900, letterSpacing: "-0.02em" }}>Bottega</span>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-rosewood/10 text-ivory flex items-center justify-center border border-rosewood/30 shadow-lg shadow-black/50" style={{ fontFamily: "var(--db-archivo)", fontWeight: 900, fontSize: "0.75rem" }}>10/B</div>
                      </div>

                      {/* Progress ring with metric */}
                      <div className="ch-phone-widget relative w-44 h-44 mx-auto flex items-center justify-center mb-8 drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)]">
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 176 176" aria-hidden>
                          <circle cx="88" cy="88" r="64" fill="none" stroke="rgba(244,239,230,0.04)" strokeWidth="12" />
                          <circle className="ch-progress-ring" cx="88" cy="88" r="64" fill="none" stroke="#E63B2E" strokeWidth="12" />
                        </svg>
                        <div className="text-center z-10 flex flex-col items-center">
                          <span className="ch-counter-val text-5xl tracking-tighter text-ivory" style={{ fontFamily: "var(--db-archivo)", fontWeight: 900, letterSpacing: "-0.04em" }}>0</span>
                          <span className="text-[8px] text-rosewood/70 uppercase tracking-[0.16em] font-bold mt-0.5" style={{ fontFamily: "var(--db-jetbrains)" }}>{metricLabel}</span>
                        </div>
                      </div>

                      {/* Widget rows */}
                      <div className="space-y-3">
                        <div className="ch-phone-widget ch-widget-depth rounded-2xl p-3 flex items-center">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rosewood/25 to-burgundy/8 flex items-center justify-center mr-3 border border-rosewood/25 shadow-inner">
                            <svg className="w-4 h-4 text-rosewood" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-ivory/90" style={{ fontFamily: "var(--db-archivo)", fontWeight: 700, fontSize: "0.6875rem" }}>Brief completato</p>
                            <p className="text-ivory/35 mt-0.5" style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>Giorno 1–2</p>
                          </div>
                        </div>
                        <div className="ch-phone-widget ch-widget-depth rounded-2xl p-3 flex items-center">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-peach/30 to-rosewood/10 flex items-center justify-center mr-3 border border-peach/30 shadow-inner">
                            <svg className="w-4 h-4 text-peach" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-ivory/90" style={{ fontFamily: "var(--db-archivo)", fontWeight: 700, fontSize: "0.6875rem" }}>Sviluppo in corso</p>
                            <p className="text-ivory/35 mt-0.5" style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>Giorno 6 di 10</p>
                          </div>
                        </div>
                      </div>

                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[120px] h-[4px] bg-ivory/20 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
                    </div>
                  </div>
                </div>

                {/* Floating badges */}
                <div className="ch-floating-badge absolute flex top-6 lg:top-12 left-[-15px] lg:left-[-80px] rounded-xl lg:rounded-2xl p-3 lg:p-4 items-center gap-3 lg:gap-4 z-30">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-b from-rosewood/30 to-burgundy/20 flex items-center justify-center border border-rosewood/40 shadow-inner">
                    <span className="text-base lg:text-xl drop-shadow-lg" aria-hidden>⚡</span>
                  </div>
                  <div>
                    <p className="text-ivory tracking-tight" style={{ fontFamily: "var(--db-archivo)", fontWeight: 700, fontSize: "0.75rem" }}>10 giorni</p>
                    <p className="text-rosewood/70 font-medium" style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5625rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>Consegna garantita</p>
                  </div>
                </div>

                <div className="ch-floating-badge absolute flex bottom-12 lg:bottom-20 right-[-15px] lg:right-[-80px] rounded-xl lg:rounded-2xl p-3 lg:p-4 items-center gap-3 lg:gap-4 z-30">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-b from-peach/40 to-rosewood/15 flex items-center justify-center border border-peach/40 shadow-inner">
                    <span className="text-base lg:text-lg drop-shadow-lg" aria-hidden>✓</span>
                  </div>
                  <div>
                    <p className="text-ivory tracking-tight" style={{ fontFamily: "var(--db-archivo)", fontWeight: 700, fontSize: "0.75rem" }}>Sito online</p>
                    <p className="text-rosewood/70 font-medium" style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5625rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>Cliente felice</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Card heading + description */}
            <div className="ch-card-left-text gsap-reveal order-3 lg:order-1 flex flex-col justify-center text-center lg:text-left z-20 w-full lg:max-w-none px-4 lg:px-0">
              <h3
                className="text-ivory mb-2 lg:mb-5 tracking-tight"
                style={{
                  fontFamily:    "var(--db-archivo)",
                  fontWeight:    900,
                  fontSize:      "clamp(1.5rem, 3vw, 2.5rem)",
                  lineHeight:    1,
                  letterSpacing: "-0.03em",
                  textTransform: "uppercase",
                }}
              >
                {cardHeading}
              </h3>
              <p
                className="hidden md:block text-ivory/70 mx-auto lg:mx-0 max-w-sm lg:max-w-none"
                style={{
                  fontFamily: "var(--db-cardo)",
                  fontStyle:  "italic",
                  fontSize:   "clamp(0.9375rem, 1.5vw, 1.125rem)",
                  lineHeight: 1.55,
                }}
              >
                {cardDescription}
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
