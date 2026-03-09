# Nano Banana — Scroll-Driven Product Showcase

## Complete Developer Guide

A product showcase page for "Dutch Chocolate" cold-pressed juice. The hero section features a canvas-based bottle animation synced to scroll, with text overlays fading in and out. Below: product details, stats, and a Buy Now section — all with staggered reveal animations. Built with **1 package** for animation (`motion`) and **zero 3D** — pure canvas + DOM.

---

## Table of Contents

1. [How It Works (Big Picture)](#1-how-it-works-big-picture)
2. [Packages Used & Why](#2-packages-used--why)
3. [File Structure](#3-file-structure)
4. [File-by-File Breakdown](#4-file-by-file-breakdown)
   - [page.jsx — Route Entry Point](#41-pagejsx--route-entry-point)
   - [products.js — Product Data](#42-productsjs--product-data)
   - [ProductBottleScroll.jsx — Canvas Frame Animation](#43-productbottlescrolljsx--canvas-frame-animation)
   - [ProductTextOverlays.jsx — Scroll-Driven Text](#44-producttextoverlaysjsx--scroll-driven-text)
   - [Navbar.jsx — Fixed Header](#45-navbarjsx--fixed-header)
   - [Footer.jsx — Page Footer](#46-footerjsx--page-footer)
5. [Key Concepts Explained](#5-key-concepts-explained)
   - [What is Canvas Frame Sequencing?](#51-what-is-canvas-frame-sequencing)
   - [What is useScroll + useTransform?](#52-what-is-usescroll--usetransform)
   - [What is Cover Fit?](#53-what-is-cover-fit)
   - [What is Glass-Morphism?](#54-what-is-glass-morphism)
6. [How Scroll Works](#6-how-scroll-works)
7. [How the Bottle Animation Works](#7-how-the-bottle-animation-works)
8. [How Text Overlays Work](#8-how-text-overlays-work)
9. [How the Navbar Works](#9-how-the-navbar-works)
10. [Performance Techniques](#10-performance-techniques)
11. [Customization Guide](#11-customization-guide)

---

## 1. How It Works (Big Picture)

```
User scrolls natively (500vh wrapper + sticky viewport)
        │
        ▼
scrollYProgress: 0.0 ──────────────────► 1.0
        │
        ├── Canvas: draws PNG frame matching scroll position (0–191)
        ├── Text overlays: fade in/out at 4 scroll ranges
        ├── Navbar: background opacity fades from 0 → 0.85
        │
        ▼ (after scroll section ends)
        │
        ├── Product Details — 2-column grid, fade-up on view
        ├── Freshness — centered copy, staggered fade-up
        ├── Stats & Features — 3-column stat cards, feature pills
        ├── Buy Now — glass card with price + CTA button
        └── Footer — 4-column with newsletter signup
```

The hero scroll experience is driven by `scrollYProgress` (0 to 1). The remaining sections use viewport-triggered `whileInView` animations.

---

## 2. Packages Used & Why

| Package | What It Does | Why We Need It |
|---------|-------------|----------------|
| `motion` | Framer Motion for React. Provides `useScroll`, `useTransform`, `useMotionValueEvent`, and `motion.*` animated components. | **All animations** — scroll tracking, frame sequencing, text fade, navbar opacity, fade-up reveals, button hover/tap micro-interactions. |

### What We Don't Use

| Not Used | Why |
|----------|-----|
| `three` / `@react-three/fiber` | No 3D on this route — the bottle is a **2D image sequence**, not a 3D model. |
| `gsap` | Framer Motion's `useTransform` + `whileInView` cover all needs. |
| `video` element | Canvas gives frame-accurate scroll sync and cover-fit scaling that `<video>` can't. |

---

## 3. File Structure

```
src/
├── app/
│   └── nano-banana/
│       └── page.jsx                    ← Route entry point (client component)
├── components/
│   ├── ProductBottleScroll.jsx         ← Canvas frame animation + scroll
│   ├── ProductTextOverlays.jsx         ← Text overlays with scroll ranges
│   ├── Navbar.jsx                      ← Fixed header with glass-morphism
│   └── Footer.jsx                      ← Multi-column footer
├── data/
│   └── products.js                     ← Product content & config
public/
└── images/
    └── chocolate/
        ├── 1.png                       ← Frame 1 (1280×720)
        ├── 2.png
        ├── ...
        └── 192.png                     ← Frame 192
```

---

## 4. File-by-File Breakdown

### 4.1. `page.jsx` — Route Entry Point

**File:** `src/app/nano-banana/page.jsx`

```jsx
"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { product } from "@/data/products";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductBottleScroll from "@/components/ProductBottleScroll";
import ProductTextOverlays from "@/components/ProductTextOverlays";
```

**Key behavior:**
- `"use client"` — entire page is a client component (scroll + canvas need browser APIs)
- Sets `document.body.style.background = product.gradient` on mount to extend the product gradient behind all sections, and cleans up on unmount
- Uses a shared `fadeUp` animation config and a `stagger(delay)` helper for all sections

**Sections rendered:**
1. `<Navbar />` — fixed at top
2. Hero scroll wrapper (`scrollRef`) containing `<ProductBottleScroll>` + `<ProductTextOverlays>`
3. Product Details — 2-column `md:grid-cols-2`
4. Freshness — centered `max-w-3xl`
5. Stats & Features — feature pills + `sm:grid-cols-3` stat cards
6. Buy Now — glass card (`bg-white/5 backdrop-blur-xl`) with price, tags, CTA
7. `<Footer />`

**Shared animation config:**
```jsx
const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, ease: "easeOut" },
};

function stagger(delay) {
  return { ...fadeUp, transition: { ...fadeUp.transition, delay } };
}
```

Every `motion.div` and `motion.h2` spreads `{...fadeUp}` or `{...stagger(0.1)}` for consistent reveal animations.

---

### 4.2. `products.js` — Product Data

**File:** `src/data/products.js`

All content is centralized in one object:

```js
export const product = {
  id: "chocolate",
  name: "Dutch Chocolate",
  subName: "Velvety smooth.",
  price: "₹140",
  frameCount: 192,
  folderPath: "/images/chocolate",
  frameExt: "png",
  themeColor: "#8D6E63",
  gradient: "linear-gradient(135deg, #8D6E63 0%, #5D4037 100%)",
  features: ["Premium Cocoa", "Almond Milk", "Plant Protein"],
  stats: [
    { label: "Dairy", val: "0%" },
    { label: "Protein", val: "12g" },
    { label: "Cocoa", val: "100%" },
  ],
  section1: { title: "Dutch Chocolate.", subtitle: "Velvety smooth." },
  section2: { title: "Decadence redefined.", subtitle: "Rich, dark cocoa..." },
  section3: { title: "Plant-powered energy.", subtitle: "Loaded with..." },
  section4: { title: "Indulgence without compromise.", subtitle: "" },
  detailsSection: { title: "Ethically Sourced Cocoa", description: "..." },
  freshnessSection: { title: "Cold-Crafted Perfection", description: "..." },
  buyNowSection: {
    price: "₹140",
    unit: "per 300ml bottle",
    processingParams: ["Plant Based", "Cold Blended", "Dairy Free"],
    deliveryPromise: "Shipped in insulated eco-friendly coolers...",
    returnPolicy: "Taste the difference or get your money back.",
  },
};
```

**Design: data-driven page** — swapping this object (different `folderPath`, `frameCount`, `themeColor`, etc.) would create an entirely different product showcase.

---

### 4.3. `ProductBottleScroll.jsx` — Canvas Frame Animation

**File:** `src/components/ProductBottleScroll.jsx`

**How it works:**

1. **Preload**: `useEffect` creates 192 `Image` objects, each with `src` pointing to `/images/chocolate/1.png` through `192.png`
2. **Scroll tracking**: `useScroll({ target: wrapperRef })` gives `scrollYProgress` (0–1)
3. **Frame mapping**: `useTransform(scrollYProgress, [0, 1], [0, 191])` converts scroll to frame index
4. **Frame updates**: `useMotionValueEvent(frameIndex, 'change', ...)` fires on every scroll change
5. **Deduplication**: Only redraws when `Math.round(v)` differs from `currentFrameRef.current`
6. **Drawing**: `requestAnimationFrame(() => drawFrame(idx))` draws to canvas with cover fit

**Canvas rendering logic (`drawFrame`):**
```jsx
const drawFrame = (index) => {
  const ctx = canvas.getContext("2d");
  const img = imagesRef.current[index];

  // Cap at 1x CSS pixels (no HiDPI upscaling)
  const cw = rect.width;
  const ch = rect.height;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, cw, ch);

  // Cover fit — fill canvas, crop overflow
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const canvasRatio = cw / ch;
  let dw, dh;
  if (imgRatio > canvasRatio) { dh = ch; dw = ch * imgRatio; }
  else { dw = cw; dh = cw / imgRatio; }
  const dx = (cw - dw) / 2;
  const dy = (ch - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
};
```

**Layout:**
```jsx
<div ref={wrapperRef} className="relative h-[500vh]">
  <div className="sticky top-0 h-screen overflow-hidden">
    <canvas ref={canvasRef} className="h-full w-full" />
  </div>
</div>
```

500vh wrapper with sticky inner div — same pattern as the Atmos route but for canvas instead of WebGL.

---

### 4.4. `ProductTextOverlays.jsx` — Scroll-Driven Text

**File:** `src/components/ProductTextOverlays.jsx`

**OverlaySection component** — each text section:
```jsx
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
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      style={{ opacity, y }}
    >
      {children}
    </motion.div>
  );
}
```

**4-keyframe pattern (same as Atmos):**
- Fade in: 4% scroll buffer (opacity 0→1, y 60→0)
- Visible: holds steady
- Fade out: 4% scroll buffer (opacity 1→0, y 0→-60)

**4 text sections** with their scroll ranges:

| Section | Range | Title |
|---------|-------|-------|
| 1 | 0.00 – 0.22 | "Dutch Chocolate." |
| 2 | 0.22 – 0.45 | "Decadence redefined." |
| 3 | 0.45 – 0.68 | "Plant-powered energy." |
| 4 | 0.68 – 0.92 | "Indulgence without compromise." |

The component tracks the **parent scroll wrapper** (passed as `scrollRef` prop) — not its own element.

---

### 4.5. `Navbar.jsx` — Fixed Header

**File:** `src/components/Navbar.jsx`

```jsx
const { scrollY } = useScroll();
const bgOpacity = useTransform(scrollY, [0, 120], [0, 0.85]);
```

- Uses **page-level scroll** (`scrollY`, not `scrollYProgress`) — absolute pixel value
- Background `motion.div` with `opacity: bgOpacity` creates smooth fade-in of dark backdrop
- Glass-morphism: `backdrop-filter: blur(20px)` always applied; the dark background just fills in behind it
- Brand: gradient SVG star + gradient text ("Nano Banana")
- CTA: "Order Now" button with scale micro-interactions and orange glow shadow

---

### 4.6. `Footer.jsx` — Page Footer

**File:** `src/components/Footer.jsx`

4-column grid with staggered fade-up animations:
1. **Brand** — gradient text + tagline (delay: 0s)
2. **Shop** — links: All Flavors, Subscriptions, Gift Cards (delay: 0.1s)
3. **Support** — links: FAQ, Contact, Shipping, Returns (delay: 0.2s)
4. **Newsletter** — email input + "Join" button (delay: 0.3s)

Copyright bar below with auto-generated year.

---

## 5. Key Concepts Explained

### 5.1. What is Canvas Frame Sequencing?

Instead of using a `<video>` element, we draw individual image frames to an HTML5 `<canvas>` based on scroll position. This gives:
- **Frame-accurate scroll sync** — video playback doesn't sync perfectly to scroll
- **Cover fit scaling** — canvas can crop/scale freely per frame
- **No buffering** — all frames preloaded upfront, no video decode lag

### 5.2. What is useScroll + useTransform?

```jsx
const { scrollYProgress } = useScroll({ target: wrapperRef });
const frameIndex = useTransform(scrollYProgress, [0, 1], [0, 191]);
```

`useScroll` returns a `MotionValue` (0–1 for `scrollYProgress`) that updates on every scroll event **without triggering React re-renders**. `useTransform` maps it to a new range — here, 0–191 for frame indices.

### 5.3. What is Cover Fit?

Like CSS `object-fit: cover` but for canvas drawing. The image fills the entire canvas area, cropping any overflow. The math:
- If image is wider proportionally → height matches canvas, width overflows
- If image is taller proportionally → width matches canvas, height overflows
- Center the overflow with `(canvas - draw) / 2` offset

### 5.4. What is Glass-Morphism?

A UI pattern combining semi-transparent backgrounds with `backdrop-filter: blur()`:
```css
bg-white/5 border-white/10 backdrop-blur-sm
```
Creates a frosted-glass effect where content behind the element is blurred. Used on stat cards, nav bar, and Buy Now section.

---

## 6. How Scroll Works

```
              NATIVE BROWSER SCROLL
              (500vh wrapper + sticky viewport)
                           │
                           ▼
              ┌──────────────────────────┐
              │  useScroll() hook        │  ← Framer Motion MotionValue
              │  scrollYProgress: 0–1    │
              └──────────┬───────────────┘
                         │
              ┌──────────┼────────────┐
              ▼                       ▼
      useTransform           useTransform
      (frame index)          (text opacity/y)
              │                       │
              ▼                       ▼
    useMotionValueEvent      <motion.div style={...}>
              │                       │
              ▼                       ▼
    drawFrame(idx)           Text overlays
    on <canvas>              fade in/out


     Also independently:

              NATIVE SCROLL (scrollY pixels)
                           │
                           ▼
              useTransform(scrollY, [0, 120], [0, 0.85])
                           │
                           ▼
              Navbar background opacity
```

---

## 7. How the Bottle Animation Works

```
  192 PNG frames preloaded into Image array
         │
  scrollYProgress (0 → 1)
         │
  useTransform → frameIndex (0 → 191)
         │
  useMotionValueEvent('change')
         │
  Math.round(v) !== currentFrame?
     ├── No → skip (deduplication)
     └── Yes → cancelAnimationFrame + requestAnimationFrame
                  │
                  ▼
             drawFrame(idx)
                  │
                  ├── Get canvas 2D context
                  ├── Resize canvas to match container (1x CSS pixels)
                  ├── Enable high-quality image smoothing
                  ├── Clear canvas
                  ├── Calculate cover-fit dimensions
                  └── ctx.drawImage(img, dx, dy, dw, dh)
```

---

## 8. How Text Overlays Work

```
              scrollYProgress (MotionValue)
                         │
                         ▼
              ┌──────────────────────────┐
Each text has:│  start: 0.00, end: 0.22  │
              └──────────────────────────┘
                         │
              useTransform(scrollYProgress,
                [start, start+0.04, end-0.04, end],
                [0,     1,          1,         0])
                         │
                  ┌──────┴──────┐
                  ▼             ▼
           opacity: 0→1→1→0    y: 60→0→0→-60
                  │             │
                  └──────┬──────┘
                         │
              <motion.div style={{ opacity, y }}>
```

---

## 9. How the Navbar Works

```
  scrollY (absolute pixel value)
         │
  useTransform(scrollY, [0, 120], [0, 0.85])
         │
         ▼
  bgOpacity → motion.div background (bg-black/80)
         │
  Result: starts fully transparent,
          reaches 85% opacity after 120px scroll
```

The blur (`backdrop-filter: blur(20px)`) is always active — only the dark backdrop fills in.

---

## 10. Performance Techniques

| Technique | What it does |
|-----------|-------------|
| **Canvas rendering** | 2D canvas API instead of DOM elements — avoids layout thrashing from 192 image swaps |
| **RAF throttling** | `requestAnimationFrame` batches canvas draws to screen refresh rate |
| **Frame deduplication** | Skips redraw if `Math.round(frameIndex)` hasn't changed |
| **Image preloading** | All 192 frames loaded upfront in parallel |
| **1x resolution cap** | Canvas never upscales beyond CSS pixel size (saves memory on HiDPI) |
| **MotionValues** | `useTransform` creates derived values without React re-renders |
| **Debounced resize** | 100ms timeout before redrawing on window resize |
| **RAF cleanup** | `cancelAnimationFrame` before new requests and on unmount |
| **`viewport={{ once: true }}`** | Fade-up animations trigger once, never re-run |

---

## 11. Customization Guide

### Add a new product

1. Create a new image folder in `public/images/your-product/`
2. Add numbered frames: `1.png`, `2.png`, ..., `N.png`
3. Add a new product object in `products.js` with `folderPath`, `frameCount`, `themeColor`, etc.
4. The page reads everything from the product object

### Change scroll length
In `ProductBottleScroll.jsx`:
```jsx
<div ref={wrapperRef} className="relative h-[500vh]">
```
Increase for slower scrolling (more distance per frame), decrease for faster.

### Change text overlay timing
In `ProductTextOverlays.jsx`, edit the `sections` array:
```jsx
const sections = [
  { data: product.section1, start: 0.0, end: 0.22 },
  // adjust start/end values
];
```

### Change fade buffer
In `OverlaySection`, the `0.04` controls transition speed:
```jsx
[start, start + 0.04, end - 0.04, end]
// increase 0.04 for slower fades, decrease for snappier
```

### Change theme color
Update `themeColor` and `gradient` in `products.js`. The page uses these for:
- Body background
- Stat card values
- Buy Now processing param tags
- Product details gradient box

### Change navbar fade speed
In `Navbar.jsx`:
```jsx
const bgOpacity = useTransform(scrollY, [0, 120], [0, 0.85]);
// [0, 120] = start/end scroll pixels
// [0, 0.85] = start/end opacity
```

---

## Summary

The `/nano-banana` experience is built with:
- **1 npm package** for animation: `motion`
- **0 3D libraries** — pure 2D canvas + DOM
- **6 files**: page.jsx, ProductBottleScroll.jsx, ProductTextOverlays.jsx, Navbar.jsx, Footer.jsx, products.js
- **192 PNG frames** for the bottle animation
- **1 driving variable**: `scrollYProgress` (0 to 1) for the hero section
- **Data-driven**: swap the product object to create a new product showcase
