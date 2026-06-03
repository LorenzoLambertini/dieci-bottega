import Hero            from "@/components/sections/Hero";
import Soluzioni       from "@/components/sections/Services";
import Transformation  from "@/components/sections/Transformation";
import Growth          from "@/components/sections/Growth";
import BottegaAperta   from "@/components/sections/Portfolio";
import Promise         from "@/components/sections/Promise";
import Process         from "@/components/sections/Process";
import Studio          from "@/components/sections/About";
import Pricing         from "@/components/sections/Pricing";
import Contact         from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      {/* Hero con scroll-tilt 3D leggero (ContainerScroll) */}
      <Hero />

      {/* Soluzioni · 3 macro-aree espandibili */}
      <Soluzioni />

      {/* Transformation · Before/After slider */}
      <Transformation />

      {/* Growth · 4 metriche di impatto */}
      <Growth />

      {/* Bottega Aperta · bento grid workshop */}
      <BottegaAperta />

      {/* Promise · 3 valori stacked cards */}
      <Promise />

      {/* Process · 4 step + connector */}
      <Process />

      {/* Studio · about + team */}
      <Studio />

      {/* Pricing · configuratore + pacchetti */}
      <Pricing />

      {/* Contact · form + scheduling */}
      <Contact />
    </>
  );
}
