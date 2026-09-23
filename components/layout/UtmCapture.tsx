"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { captureUtm } from "@/lib/utm";

/** Salva gli UTM in sessionStorage a ogni cambio pagina. Non renderizza nulla. */
export default function UtmCapture() {
  const pathname = usePathname();
  useEffect(() => { captureUtm(); }, [pathname]);
  return null;
}
