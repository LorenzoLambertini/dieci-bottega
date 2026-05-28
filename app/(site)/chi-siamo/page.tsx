import Studio from "@/components/sections/About";

export const metadata = {
  title: "Chi siamo · Dieci Bottega",
  description: "Micro-agenzia digitale di Bologna. Due fondatori, mestiere artigiano + AI, consegne in 10 giorni.",
};

export default function ChiSiamoPage() {
  return (
    <div className="pt-16 lg:pt-[72px]">
      <Studio />
    </div>
  );
}
