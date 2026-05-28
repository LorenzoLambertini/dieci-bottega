import Contact from "@/components/sections/Contact";

export const metadata = {
  title: "Contatti · Dieci Bottega",
  description: "Scrivici per parlare del tuo progetto. Risposta entro 24 ore lavorative.",
};

export default function ContattiPage() {
  return (
    <div className="pt-16 lg:pt-[72px]">
      <Contact />
    </div>
  );
}
