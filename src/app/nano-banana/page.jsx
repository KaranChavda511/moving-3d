"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { product } from "@/data/products";
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
  const scrollRef = useRef(null);

  useEffect(() => {
    document.body.style.background = product.gradient;
    return () => {
      document.body.style.background = "";
    };
  }, []);

  return (
    <div
      className="nano-banana-page min-h-screen text-white"
      style={{ fontFamily: "var(--font-outfit), sans-serif" }}
    >
      <Navbar />

      {/* Hero Scroll Section */}
      <div ref={scrollRef} className="relative">
        <ProductBottleScroll product={product} />
        <ProductTextOverlays product={product} scrollRef={scrollRef} />
      </div>

      {/* Product Details Section */}
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

      {/* Freshness Section */}
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

      {/* Stats & Features */}
      <section className="relative z-10 px-6 py-24">
        <div className="mx-auto max-w-5xl">
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
                <div
                  className="text-4xl font-black"
                  style={{ color: product.themeColor }}
                >
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

      {/* Buy Now Section */}
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

      <Footer />
    </div>
  );
}
