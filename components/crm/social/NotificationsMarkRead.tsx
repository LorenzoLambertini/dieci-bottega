"use client";

import { useTransition } from "react";
import { markNotificationsRead } from "@/app/crm/(app)/social/actions";

export function NotificationsMarkRead() {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(async () => void (await markNotificationsRead()))}
      className="text-white/30 hover:text-white/60 text-xs disabled:opacity-40"
    >
      Segna come lette
    </button>
  );
}
