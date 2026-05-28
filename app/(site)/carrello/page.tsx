import CartView from "@/components/CartView";

export const metadata = {
  title: "Carrello · Dieci Bottega",
  description: "Riepilogo dei servizi selezionati. Aggiungi, rimuovi, e richiedi un preventivo personalizzato.",
};

export default function CarrelloPage() {
  return <CartView />;
}
