"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { captureFirstTouch, captureUtm } from "@/lib/utm";

/** Salva gli UTM a ogni cambio pagina e, la prima volta, la pagina d'ingresso. Non renderizza nulla. */
export default function UtmCapture() {
  const pathname = usePathname();
  useEffect(() => { captureFirstTouch(); captureUtm(); }, [pathname]);
  return null;
}
