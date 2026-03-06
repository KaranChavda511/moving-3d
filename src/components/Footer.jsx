"use client";

import { motion } from "motion/react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const links = {
  shop: ["All Flavors", "Subscriptions", "Gift Cards"],
  support: ["FAQ", "Contact", "Shipping", "Returns"],
};

export default function Footer() {
  return (
    <footer className="bg-gray-950 px-6 pb-8 pt-20 text-gray-300">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-4">
        {/* Brand */}
        <motion.div {...fadeUp}>
          <h3
            className="mb-3 text-xl font-bold"
            style={{
              background: "linear-gradient(135deg, #F97316, #EC4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Nano Banana
          </h3>
          <p className="text-sm leading-relaxed text-gray-500">
            The future of freshness. Premium cold-pressed juices crafted for the
            bold.
          </p>
        </motion.div>

        {/* Shop */}
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
            Shop
          </h4>
          <nav>
            <ul className="space-y-2">
              {links.shop.map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="text-sm text-gray-500 transition-colors hover:text-white"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </motion.div>

        {/* Support */}
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }}>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
            Support
          </h4>
          <nav>
            <ul className="space-y-2">
              {links.support.map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="text-sm text-gray-500 transition-colors hover:text-white"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </motion.div>

        {/* Newsletter */}
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.3 }}>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
            Stay Fresh
          </h4>
          <p className="mb-4 text-sm text-gray-500">
            Get exclusive drops and flavor launches first.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex overflow-hidden rounded-full border border-white/10"
          >
            <label htmlFor="footer-email" className="sr-only">
              Email
            </label>
            <input
              id="footer-email"
              type="email"
              placeholder="your@email.com"
              className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white outline-none placeholder:text-gray-600"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="bg-white px-5 py-2.5 text-sm font-semibold text-black"
            >
              Join
            </motion.button>
          </form>
        </motion.div>
      </div>

      <div className="mx-auto mt-16 max-w-6xl border-t border-white/5 pt-6 text-center text-xs text-gray-600">
        &copy; {new Date().getFullYear()} Nano Banana. All rights reserved.
      </div>
    </footer>
  );
}
