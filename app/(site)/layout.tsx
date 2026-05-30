import Navbar           from "@/components/layout/Navbar";
import Footer           from "@/components/layout/Footer";
import StickyMobileCTA  from "@/components/layout/StickyMobileCTA";
import Quiz             from "@/components/Quiz";
import ChatWidget       from "@/components/ChatWidget";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <StickyMobileCTA />
      <Quiz />
      <ChatWidget />
    </>
  );
}
