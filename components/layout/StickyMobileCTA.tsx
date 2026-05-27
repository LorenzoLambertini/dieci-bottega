"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ease = [0.2, 0.8, 0.2, 1] as const;

export default function StickyMobileCTA() {
  const [show, setShow] = useState(false);
  const [hideAtContact, setHideAtContact] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Show after scrolling past 70% of first viewport
      const trigger = window.innerHeight * 0.7;
      setShow(window.scrollY > trigger);

      // Hide when contatti section is in view
      const contact = document.querySelector<HTMLElement>("#contatti");
      if (contact) {
        const rect = contact.getBoundingClientRect();
        setHideAtContact(rect.top < window.innerHeight * 0.6);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const visible = show && !hideAtContact;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="sticky-cta"
          className="fixed inset-x-0 bottom-0 z-40 lg:hidden"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0,  opacity: 1 }}
          exit={{    y: 80, opacity: 0 }}
          transition={{ duration: 0.5, ease }}
        >
          <div className="px-3 pb-3">
            <a
              href="#contatti"
              className="relative flex items-center justify-between gap-3 bg-obsidian text-ivory px-5 py-3.5 overflow-hidden press shadow-atelier-lg"
            >
              <span className="flex items-center gap-2.5">
                <span className="live-dot" />
                <span
                  style={{
                    fontFamily:    "var(--db-jetbrains)",
                    fontSize:      "0.6875rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  Inizia un progetto
                </span>
              </span>
              <span className="flex items-center gap-2">
                <span
                  className="text-ivory/45"
                  style={{
                    fontFamily:    "var(--db-jetbrains)",
                    fontSize:      "0.5625rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                  }}
                >
                  da €800
                </span>
                <span className="text-rosewood">→</span>
              </span>
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
