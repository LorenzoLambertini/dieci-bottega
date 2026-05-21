import Navbar    from "@/components/layout/Navbar";
import Footer    from "@/components/layout/Footer";
import Hero      from "@/components/sections/Hero";
import Services  from "@/components/sections/Services";
import Portfolio from "@/components/sections/Portfolio";
import Process   from "@/components/sections/Process";
import About     from "@/components/sections/About";
import Pricing   from "@/components/sections/Pricing";
import Contact   from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Portfolio />
        <Process />
        <About />
        <Pricing />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
