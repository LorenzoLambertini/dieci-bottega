import Navbar           from "@/components/layout/Navbar";
import Footer           from "@/components/layout/Footer";
import StickyMobileCTA  from "@/components/layout/StickyMobileCTA";
import Quiz             from "@/components/Quiz";
import ChatWidget       from "@/components/ChatWidget";
import UtmCapture       from "@/components/layout/UtmCapture";
import WebAnalytics     from "@/components/layout/WebAnalytics";
import OrganizationJsonLd from "@/components/layout/OrganizationJsonLd";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <UtmCapture />
      <WebAnalytics />
      <OrganizationJsonLd />
      <Navbar />
      <main>{children}</main>
      <Footer />
      <StickyMobileCTA />
      <Quiz />
      <ChatWidget />
    </>
  );
}
