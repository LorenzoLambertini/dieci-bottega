import BottegaAperta from "@/components/sections/Portfolio";

export const metadata = {
  title: "Progetti · Bottega Aperta · Dieci Bottega",
  description: "La nostra bottega è aperta. Mostriamo codice, workflow, snippet — niente case study finti.",
};

export default function ProgettiPage() {
  return (
    <div className="pt-16 lg:pt-[72px]">
      <BottegaAperta />
    </div>
  );
}
