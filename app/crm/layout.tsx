import type { Metadata, Viewport } from "next";

/** Il CRM si installa come app sulla schermata Home (iPhone e Android). */
export const metadata: Metadata = {
  manifest: "/crm.webmanifest",
  appleWebApp: { capable: true, title: "10B CRM", statusBarStyle: "black" },
  icons: { apple: "/crm-apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#0c0c0c",
  viewportFit: "cover",
};

export default function CrmRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
