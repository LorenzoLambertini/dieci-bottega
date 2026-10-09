import Projects      from "@/components/sections/Projects";
import BottegaAperta from "@/components/sections/Portfolio";
import ConceptTeaser from "@/components/sections/ConceptTeaser";

export const metadata = {
  title: "Progetti · Dieci Bottega",
  description: "Lavori reali di Dieci Bottega: siti vetrina, web app e portfolio. Codice, processo, risultati.",
};

export default function ProgettiPage() {
  return (
    <div className="pt-16 lg:pt-[72px]">
      <Projects />
      <ConceptTeaser />
      <BottegaAperta />
    </div>
  );
}
