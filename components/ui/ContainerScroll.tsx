"use client";

import React, { useRef } from "react";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";

/**
 * ContainerScroll — Aceternity-style 3D scroll-tilt effect
 * Brand-adapted: obsidian frame + plum bezel, no neutral grays.
 *
 * USAGE:
 * <ContainerScroll titleComponent={<h1>Il sito che ti serve</h1>}>
 *   <YourScreenshotOrMockup />
 * </ContainerScroll>
 */

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: React.ReactNode;
  children:       React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const rotate    = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale     = useTransform(scrollYProgress, [0, 1], isMobile ? [0.72, 0.92] : [1.05, 1]);
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div
      ref={containerRef}
      className="h-[60rem] md:h-[80rem] flex items-center justify-center relative p-2 md:p-20 overflow-hidden"
    >
      <div className="py-10 md:py-32 w-full relative" style={{ perspective: "1000px" }}>
        <ScrollHeader translate={translate}>{titleComponent}</ScrollHeader>
        <ScrollCard rotate={rotate} scale={scale}>{children}</ScrollCard>
      </div>
    </div>
  );
};

const ScrollHeader = ({
  translate,
  children,
}: {
  translate: MotionValue<number>;
  children:  React.ReactNode;
}) => {
  return (
    <motion.div
      style={{ translateY: translate }}
      className="max-w-5xl mx-auto text-center"
    >
      {children}
    </motion.div>
  );
};

const ScrollCard = ({
  rotate,
  scale,
  children,
}: {
  rotate:   MotionValue<number>;
  scale:    MotionValue<number>;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow:
          "0 0 #0000004d, 0 9px 20px rgba(26,20,20,0.30), 0 37px 37px rgba(26,20,20,0.26), 0 84px 50px rgba(26,20,20,0.15), 0 149px 60px rgba(26,20,20,0.06), 0 233px 65px rgba(26,20,20,0.02)",
        borderColor: "#4A3838", // plum bezel
        background:  "#1A1414", // obsidian frame
      }}
      className="max-w-5xl -mt-12 mx-auto h-[30rem] md:h-[40rem] w-full border-4 p-2 md:p-6 rounded-[30px]"
    >
      <div className="h-full w-full overflow-hidden rounded-2xl bg-ivory md:rounded-2xl md:p-2 relative">
        {children}
      </div>
    </motion.div>
  );
};
