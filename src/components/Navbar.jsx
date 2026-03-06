"use client";

import { motion, useScroll, useTransform } from "motion/react";

export default function Navbar() {
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 120], [0, 0.85]);

  return (
    <motion.nav
      className="fixed left-0 right-0 top-0 z-50 border-b border-white/5"
      style={{
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <motion.div
        className="absolute inset-0 bg-black/80"
        style={{ opacity: bgOpacity }}
      />
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Brand */}
        <a href="/nano-banana" className="flex items-center gap-2.5">
          <svg
            width="28"
            height="28"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16 2L20 10L28 6L24 16L30 22L22 20L18 30L16 22L8 28L12 18L2 16L10 12L6 4L14 8L16 2Z"
              fill="url(#navGrad)"
              stroke="url(#navGrad)"
              strokeWidth="0.5"
            />
            <defs>
              <linearGradient
                id="navGrad"
                x1="2"
                y1="2"
                x2="30"
                y2="30"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#F97316" />
                <stop offset="1" stopColor="#EC4899" />
              </linearGradient>
            </defs>
          </svg>
          <span
            className="text-lg font-bold"
            style={{
              background: "linear-gradient(135deg, #F97316, #EC4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Nano Banana
          </span>
        </a>

        {/* CTA */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="relative rounded-full bg-white px-5 py-2 text-sm font-semibold text-black shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-shadow hover:shadow-[0_0_30px_rgba(249,115,22,0.5)]"
        >
          Order Now
        </motion.button>
      </div>
    </motion.nav>
  );
}
