"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { products } from "@/data/products";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductBottleScroll from "@/components/ProductBottleScroll";
import ProductTextOverlays from "@/components/ProductTextOverlays";

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, ease: "easeOut" },
};

function stagger(delay) {
  return { ...fadeUp, transition: { ...fadeUp.transition, delay } };
}

export default function NanaBananaPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);
  const product = products[currentIndex];
  const nextProduct = products[(currentIndex + 1) % products.length];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [currentIndex]);

  // Update background gradient CSS variable
  useEffect(() => {
    document.body.style.background = product.gradient;
    return () => {
      document.body.style.background = "";
    };
  }, [product.gradient]);

  const goTo = useCallback((i) => setCurrentIndex(i), []);
  const goNext = useCallback(
    () => setCurrentIndex((c) => (c + 1) % products.length),
    []
  );

  return (
    <div
      className="nano-banana-page min-h-screen text-white"
      style={{ fontFamily: "var(--font-outfit), sans-serif" }}
    >
      <Navbar />

      {/* ── Flavor Pill Menu ── */}
      <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 gap-2 rounded-full border border-white/10 bg-black/50 p-1.5 backdrop-blur-xl">
        {products.map((p, i) => (
          <button
            key={p.id}
            onClick={() => goTo(i)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
              i === currentIndex
                ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                : "text-white/60 hover:text-white"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* ── Main Content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={product.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Hero Scroll Section */}
          <div ref={scrollRef} className="relative">
            <ProductBottleScroll product={product} />
            <ProductTextOverlays product={product} scrollRef={scrollRef} />
          </div>

          {/* ── Product Details Section ── */}
          <section className="relative z-10 px-6 py-32">
            <div className="mx-auto max-w-5xl">
              <div className="grid items-center gap-16 md:grid-cols-2">
                <motion.div {...fadeUp}>
                  <h2 className="text-4xl font-extrabold md:text-5xl">
                    {product.detailsSection.title}
                  </h2>
                  <p className="mt-6 text-base leading-relaxed text-white/70">
                    {product.detailsSection.description}
                  </p>
                </motion.div>
                <motion.div {...stagger(0.15)}>
                  <div
                    className="flex aspect-square items-center justify-center rounded-3xl"
                    style={{ background: product.gradient }}
                  >
                    <span className="text-6xl font-black uppercase opacity-20">
                      {product.id}
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* ── Freshness Section ── */}
          <section className="relative z-10 px-6 py-24">
            <div className="mx-auto max-w-3xl text-center">
              <motion.h2
                {...fadeUp}
                className="text-4xl font-extrabold md:text-5xl"
              >
                {product.freshnessSection.title}
              </motion.h2>
              <motion.p
                {...stagger(0.1)}
                className="mt-6 text-base leading-relaxed text-white/60"
              >
                {product.freshnessSection.description}
              </motion.p>
            </div>
          </section>

          {/* ── Stats & Features ── */}
          <section className="relative z-10 px-6 py-24">
            <div className="mx-auto max-w-5xl">
              {/* Features */}
              <motion.div
                {...fadeUp}
                className="mb-16 flex flex-wrap justify-center gap-3"
              >
                {product.features.map((f) => (
                  <span
                    key={f}
                    className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-medium backdrop-blur-sm"
                  >
                    {f}
                  </span>
                ))}
              </motion.div>

              {/* Stats grid */}
              <div className="grid gap-6 sm:grid-cols-3">
                {product.stats.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{
                      duration: 0.5,
                      ease: "easeOut",
                      delay: i * 0.1,
                    }}
                    className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm"
                  >
                    <div className="text-4xl font-black" style={{ color: product.themeColor }}>
                      {s.val}
                    </div>
                    <div className="mt-2 text-sm uppercase tracking-wider text-white/50">
                      {s.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Buy Now Section ── */}
          <section className="relative z-10 px-6 py-32">
            <div className="mx-auto max-w-4xl">
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-xl md:p-16">
                <motion.div {...fadeUp} className="text-center">
                  <div className="text-5xl font-black md:text-7xl">
                    {product.buyNowSection.price}
                  </div>
                  <div className="mt-2 text-sm text-white/50">
                    {product.buyNowSection.unit}
                  </div>

                  {/* Processing params */}
                  <div className="mt-8 flex flex-wrap justify-center gap-2">
                    {product.buyNowSection.processingParams.map((p) => (
                      <span
                        key={p}
                        className="rounded-full px-4 py-1.5 text-xs font-medium"
                        style={{
                          background: `${product.themeColor}22`,
                          color: product.themeColor,
                          border: `1px solid ${product.themeColor}44`,
                        }}
                      >
                        {p}
                      </span>
                    ))}
                  </div>

                  <p className="mx-auto mt-8 max-w-md text-sm leading-relaxed text-white/60">
                    {product.buyNowSection.deliveryPromise}
                  </p>
                  <p className="mt-3 text-xs text-white/40">
                    {product.buyNowSection.returnPolicy}
                  </p>

                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="mt-10 rounded-full px-12 py-4 text-base font-bold text-white shadow-[0_0_40px_rgba(0,0,0,0.3)]"
                    style={{ background: product.gradient }}
                  >
                    Add to Cart
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </section>

          {/* ── Next Flavor CTA ── */}
          <section className="relative z-10 overflow-hidden">
            <motion.button
              onClick={goNext}
              whileHover={{ scale: 1.01 }}
              className="group block w-full py-24 text-center"
              style={{ background: nextProduct.gradient }}
            >
              <motion.div {...fadeUp}>
                <span className="text-sm font-medium uppercase tracking-widest text-white/60">
                  Next Flavor
                </span>
                <h3 className="mt-4 text-5xl font-black text-white md:text-7xl">
                  {nextProduct.name}
                </h3>
                <p className="mt-3 text-lg text-white/70">
                  {nextProduct.subName}
                </p>
                <div className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-white/80 transition group-hover:gap-4">
                  Explore
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.div>
            </motion.button>
          </section>

          <Footer />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
