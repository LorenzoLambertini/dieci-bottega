import Navbar           from "@/components/layout/Navbar";
import Footer           from "@/components/layout/Footer";
import StickyMobileCTA  from "@/components/layout/StickyMobileCTA";
import Hero             from "@/components/sections/Hero";
import Soluzioni        from "@/components/sections/Services";
import BottegaAperta    from "@/components/sections/Portfolio";
import Process          from "@/components/sections/Process";
import Studio           from "@/components/sections/About";
import Pricing          from "@/components/sections/Pricing";
import Contact          from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Soluzioni />
        <BottegaAperta />
        <Process />
        <Studio />
        <Pricing />
        <Contact />
      </main>
      <Footer />
      <StickyMobileCTA />
    </>
  );
}
