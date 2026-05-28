"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { type Service } from "./services";

export type CartItem = {
  slug:     string;
  title:    string;
  price:    number;
  unit:     "one-shot" | "mese" | "anno";
  quantity: number;
};

type CartState = {
  items:        CartItem[];
  hydrated:     boolean;
  add:          (svc: Service) => void;
  remove:       (slug: string) => void;
  incQty:       (slug: string) => void;
  decQty:       (slug: string) => void;
  clear:        () => void;
  totalItems:   () => number;
  totalOneShot: () => number;
  totalMonthly: () => number;
  totalAnnual:  () => number;
  setHydrated:  () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items:    [],
      hydrated: false,

      add: (svc) => {
        const items = get().items;
        const existing = items.find(i => i.slug === svc.slug);
        if (existing) {
          set({
            items: items.map(i =>
              i.slug === svc.slug ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          set({
            items: [
              ...items,
              { slug: svc.slug, title: svc.title, price: svc.price, unit: svc.unit, quantity: 1 },
            ],
          });
        }
      },

      remove: (slug) => set({ items: get().items.filter(i => i.slug !== slug) }),

      incQty: (slug) =>
        set({
          items: get().items.map(i =>
            i.slug === slug ? { ...i, quantity: i.quantity + 1 } : i
          ),
        }),

      decQty: (slug) => {
        const items = get().items.map(i =>
          i.slug === slug ? { ...i, quantity: Math.max(0, i.quantity - 1) } : i
        ).filter(i => i.quantity > 0);
        set({ items });
      },

      clear: () => set({ items: [] }),

      totalItems:   () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalOneShot: () => get().items.filter(i => i.unit === "one-shot").reduce((sum, i) => sum + i.price * i.quantity, 0),
      totalMonthly: () => get().items.filter(i => i.unit === "mese").reduce((sum, i) => sum + i.price * i.quantity, 0),
      totalAnnual:  () => get().items.filter(i => i.unit === "anno").reduce((sum, i) => sum + i.price * i.quantity, 0),

      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name:    "db-cart-v1",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
