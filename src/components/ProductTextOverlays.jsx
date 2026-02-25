"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

function OverlaySection({ children, start, end, scrollYProgress }) {
  const opacity = useTransform(
    scrollYProgress,
    [start, start + 0.04, end - 0.04, end],
    [0, 1, 1, 0]
  );
  const y = useTransform(
    scrollYProgress,
    [start, start + 0.04, end - 0.04, end],
    [60, 0, 0, -60]
  );

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 flex items-center justify-center px-6"
      style={{ opacity, y }}
    >
      {children}
    </motion.div>
  );
}

export default function ProductTextOverlays({ product, scrollRef }) {
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end end"],
  });

  const sections = [
    { data: product.section1, start: 0.0, end: 0.22 },
    { data: product.section2, start: 0.22, end: 0.45 },
    { data: product.section3, start: 0.45, end: 0.68 },
    { data: product.section4, start: 0.68, end: 0.92 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="sticky top-0 h-screen">
        {sections.map((sec, i) => (
          <OverlaySection
            key={i}
            start={sec.start}
            end={sec.end}
            scrollYProgress={scrollYProgress}
          >
            <div className="max-w-2xl text-center">
              <h2
                className="text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl lg:text-7xl"
                style={{ color: "#fff" }}
              >
                {sec.data.title}
              </h2>
              {sec.data.subtitle && (
                <p className="mt-4 text-base text-white/70 sm:text-lg md:text-xl">
                  {sec.data.subtitle}
                </p>
              )}
            </div>
          </OverlaySection>
        ))}
      </div>
    </div>
  );
}
