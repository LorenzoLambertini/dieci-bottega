import Hero          from "@/components/sections/Hero";
import Soluzioni     from "@/components/sections/Services";
import BottegaAperta from "@/components/sections/Portfolio";
import Process       from "@/components/sections/Process";
import Studio        from "@/components/sections/About";
import Pricing       from "@/components/sections/Pricing";
import Contact       from "@/components/sections/Contact";

// Temporary: Home is still the long-page format. Phase 5 will slim it down
// to Hero + Value props + 6-card Services preview + Final CTA.
export default function Home() {
  return (
    <>
      <Hero />
      <Soluzioni />
      <BottegaAperta />
      <Process />
      <Studio />
      <Pricing />
      <Contact />
    </>
  );
}
