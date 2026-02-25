# Scroll-Driven Image Sequence Animation — Complete Guide

> A step-by-step guide to building the `/nano-banana` scrollytelling product page.
> After reading this, you should be able to recreate the entire feature from scratch.

---

## Table of Contents

1. [What Are We Building?](#1-what-are-we-building)
2. [Prerequisites](#2-prerequisites)
3. [Project File Structure](#3-project-file-structure)
4. [Step 1: Generate Image Frames from Video](#step-1-generate-image-frames-from-video)
5. [Step 2: Product Data File](#step-2-product-data-file)
6. [Step 3: The Scroll Engine (ProductBottleScroll)](#step-3-the-scroll-engine-productbottlescroll)
7. [Step 4: Text Overlays (ProductTextOverlays)](#step-4-text-overlays-producttextoverlays)
8. [Step 5: Navbar Component](#step-5-navbar-component)
9. [Step 6: Footer Component](#step-6-footer-component)
10. [Step 7: The Main Page (page.jsx)](#step-7-the-main-page-pagejsx)
11. [Step 8: Global CSS Additions](#step-8-global-css-additions)
12. [Step 9: Layout Changes](#step-9-layout-changes)
13. [Step 10: Config Changes](#step-10-config-changes)
14. [How the Scroll Animation Works (Deep Dive)](#how-the-scroll-animation-works-deep-dive)
15. [How Text Overlays Work (Deep Dive)](#how-text-overlays-work-deep-dive)
16. [How to Add a New Product](#how-to-add-a-new-product)
17. [Troubleshooting](#troubleshooting)

---

## 1. What Are We Building?

A single-page scrollytelling product page where:

- A product (chocolate can) appears to **rotate in 3D** as the user scrolls
- Text overlays **fade in and out** at different scroll positions
- Below the scroll section, static content sections animate into view
- The whole page has a premium, dark-themed, gradient-rich design

**The 3D effect is an illusion.** It's not real 3D — it's 192 pre-rendered PNG images played like a flipbook on an HTML `<canvas>`, controlled by scroll position.

```
What the user sees:          What actually happens:
┌─────────────────┐          Scroll 0%   → draws frame 1
│  Rotating can    │          Scroll 25%  → draws frame 48
│  as I scroll     │          Scroll 50%  → draws frame 96
│  ↕               │          Scroll 75%  → draws frame 144
└─────────────────┘          Scroll 100% → draws frame 192
```

---

## 2. Prerequisites

### Packages Needed

```bash
npm install framer-motion
```

This is the **only** additional package. Everything else uses:

| Tool | Already in project | Purpose |
|------|-------------------|---------|
| Next.js 16+ | Yes | Framework (App Router) |
| React 19 | Yes | UI library |
| Tailwind CSS 4 | Yes | Styling |
| framer-motion | **Install this** | Scroll tracking + animations |

### Tools for Image Extraction

```bash
sudo apt install ffmpeg
```

---

## 3. Project File Structure

Here's every file involved in the `/nano-banana` route:

```
src/
├── app/
│   ├── layout.js                    ← Modified (added Outfit font)
│   ├── globals.css                  ← Modified (added nano-banana styles)
│   └── nano-banana/
│       └── page.jsx                 ← NEW — the main page
├── components/
│   ├── ProductBottleScroll.jsx      ← NEW — canvas scroll engine
│   ├── ProductTextOverlays.jsx      ← NEW — scroll-synced text
│   ├── Navbar.jsx                   ← NEW — top navigation
│   └── Footer.jsx                   ← NEW — bottom footer
├── data/
│   └── products.js                  ← NEW — product data
public/
└── images/
    └── chocolate/
        ├── 1.png                    ← Frame 1
        ├── 2.png                    ← Frame 2
        ├── ...
        └── 192.png                  ← Frame 192
next.config.mjs                      ← Modified (added export + unoptimized)
```

### Which file does what?

```
page.jsx ──────────── Orchestrates everything, imports all components
    │
    ├── products.js ─── Provides all text content, paths, colors
    │
    ├── ProductBottleScroll.jsx ─── Canvas + scroll = frame animation
    │
    ├── ProductTextOverlays.jsx ─── Fading text on top of canvas
    │
    ├── Navbar.jsx ─── Fixed top bar
    │
    └── Footer.jsx ─── Bottom section
```

---

## Step 1: Generate Image Frames from Video

### Why frames? Why not just use a video?

A `<video>` element cannot be precisely controlled by scroll position. By extracting individual frames, we can pick **exactly** which frame to show at any scroll position — giving buttery smooth, frame-perfect control.

### How to extract frames

#### 1. Check your video info first

```bash
ffmpeg -i your-video.mp4
```

This shows: duration, resolution, fps, codec. Example output:

```
Duration: 00:00:08.00
Stream: Video: h264, 1280x720, 24 fps
```

#### 2. Extract all frames as lossless PNG

```bash
mkdir -p public/images/chocolate
ffmpeg -i your-video.mp4 -start_number 1 public/images/chocolate/%d.png
```

**Breaking down the command:**

| Part | Meaning |
|------|---------|
| `ffmpeg` | The tool |
| `-i your-video.mp4` | Input video file |
| `-start_number 1` | Start naming from 1 (not 0) |
| `public/images/chocolate/` | Output folder (inside Next.js public dir) |
| `%d.png` | Output pattern: `1.png`, `2.png`, `3.png`... |

#### 3. Verify

```bash
ls public/images/chocolate/ | wc -l    # Count frames
file public/images/chocolate/1.png     # Check format & resolution
```

### Why PNG and not JPG?

| Format | Quality | File Size | Best For |
|--------|---------|-----------|----------|
| **PNG** | Lossless (perfect) | ~800KB/frame | This use case |
| JPG | Lossy (artifacts) | ~12KB/frame | Photos, not animations |
| WebP | Lossless option | ~400KB/frame | Good alternative |

PNG gives pixel-perfect quality. The browser caches them after first load.

---

## Step 2: Product Data File

**File: `src/data/products.js`**

This file holds ALL the content for the page. No hardcoded text in components.

```js
export const product = {
  id: "chocolate",
  name: "Dutch Chocolate",
  subName: "Velvety smooth.",
  price: "₹140",
  description: "Premium Cocoa - Almond Milk base - Plant Protein",

  // ── Image Sequence Config ──
  folderPath: "/images/chocolate",  // Path inside public/
  frameCount: 192,                   // Total number of frames
  frameExt: "png",                   // File extension

  // ── Theme ──
  themeColor: "#8D6E63",
  gradient: "linear-gradient(135deg, #8D6E63 0%, #5D4037 100%)",

  // ── Features & Stats ──
  features: ["Premium Cocoa", "Almond Milk", "Plant Protein"],
  stats: [
    { label: "Dairy", val: "0%" },
    { label: "Protein", val: "12g" },
    { label: "Cocoa", val: "100%" },
  ],

  // ── Scroll Text Overlays (shown during canvas scroll) ──
  section1: { title: "Dutch Chocolate.", subtitle: "Velvety smooth." },
  section2: { title: "Decadence redefined.", subtitle: "Rich, dark cocoa..." },
  section3: { title: "Plant-powered energy.", subtitle: "Loaded with..." },
  section4: { title: "Indulgence without compromise.", subtitle: "" },

  // ── Static Sections (below the scroll) ──
  detailsSection: { title: "...", description: "...", imageAlt: "..." },
  freshnessSection: { title: "...", description: "..." },
  buyNowSection: {
    price: "₹140",
    unit: "per 300ml bottle",
    processingParams: ["Plant Based", "Cold Blended", "Dairy Free"],
    deliveryPromise: "Shipped in insulated eco-friendly coolers...",
    returnPolicy: "Taste the difference or get your money back.",
  },
};
```

### Key fields for the scroll animation

| Field | Used By | Purpose |
|-------|---------|---------|
| `folderPath` | ProductBottleScroll | Where to find the images |
| `frameCount` | ProductBottleScroll | How many frames to load |
| `frameExt` | ProductBottleScroll | File extension (png/jpg/webp) |
| `section1-4` | ProductTextOverlays | Text shown during scroll |
| `gradient` | page.jsx | Page background color |
| `themeColor` | page.jsx | Accent color for stats, badges |

---

## Step 3: The Scroll Engine (ProductBottleScroll)

**File: `src/components/ProductBottleScroll.jsx`**

This is the **core** of the animation. Here's the complete code with inline explanations:

```jsx
"use client";
// ↑ Required because we use browser APIs (canvas, window, scroll events)

import { useRef, useEffect, useCallback } from "react";
import { useScroll, useTransform, useMotionValueEvent } from "framer-motion";
```

### The Refs

```jsx
const wrapperRef = useRef(null);      // The tall 500vh div
const canvasRef = useRef(null);       // The <canvas> element
const imagesRef = useRef([]);         // Array of 192 preloaded Image objects
const currentFrameRef = useRef(0);    // Which frame is currently displayed
const rafRef = useRef(null);          // requestAnimationFrame ID (for cleanup)
```

**Why `useRef` instead of `useState`?**
- `useRef` doesn't trigger re-renders. We're updating the canvas 60 times per second during scroll — if we used `useState`, React would re-render the component 60 times/second, destroying performance.

### Scroll Tracking

```jsx
const { scrollYProgress } = useScroll({
  target: wrapperRef,
  offset: ["start start", "end end"],
});
```

- `target: wrapperRef` — tracks scroll progress of the 500vh wrapper div
- `offset: ["start start", "end end"]` — progress is 0 when top of wrapper hits top of viewport, 1 when bottom of wrapper hits bottom of viewport
- `scrollYProgress` — a Framer Motion "motion value" that updates automatically (0 to 1)

### Mapping Scroll to Frame

```jsx
const frameIndex = useTransform(
  scrollYProgress,   // input: 0 to 1
  [0, 1],            // input range
  [0, frameCount-1]  // output range: 0 to 191
);
```

This maps:
```
scrollYProgress: 0     → frameIndex: 0
scrollYProgress: 0.25  → frameIndex: 47.75
scrollYProgress: 0.5   → frameIndex: 95.5
scrollYProgress: 1     → frameIndex: 191
```

### Drawing a Frame on Canvas

```jsx
const drawFrame = useCallback((index) => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const img = imagesRef.current[index];
  if (!img || !img.complete) return;
  // ↑ Safety: skip if image hasn't loaded yet

  // Set canvas size to match its CSS size (1:1 pixels)
  const rect = canvas.getBoundingClientRect();
  const cw = rect.width;
  const ch = rect.height;

  if (canvas.width !== cw || canvas.height !== ch) {
    canvas.width = cw;
    canvas.height = ch;
  }

  // Enable smooth scaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, cw, ch);

  // ── COVER FIT (like CSS object-fit: cover) ──
  const imgRatio = img.naturalWidth / img.naturalHeight;  // e.g. 1280/720 = 1.78
  const canvasRatio = cw / ch;
  let dw, dh;
  if (imgRatio > canvasRatio) {
    // Image is wider than canvas → match height, crop sides
    dh = ch;
    dw = ch * imgRatio;
  } else {
    // Image is taller than canvas → match width, crop top/bottom
    dw = cw;
    dh = cw / imgRatio;
  }
  const dx = (cw - dw) / 2;  // Center horizontally
  const dy = (ch - dh) / 2;  // Center vertically
  ctx.drawImage(img, dx, dy, dw, dh);
}, []);
```

**Cover fit visualized:**
```
Image (1280x720):           Canvas (1920x1080):
┌──────────────────┐        ┌──────────────────┐
│                  │   →    │ ┌──────────────┐ │
│    source img    │   →    │ │  drawn area  │ │  ← cropped sides
│                  │   →    │ └──────────────┘ │
└──────────────────┘        └──────────────────┘
```

### Preloading All Images

```jsx
useEffect(() => {
  const imgs = [];
  for (let i = 1; i <= frameCount; i++) {
    const img = new Image();
    img.src = `${product.folderPath}/${i}.${ext}`;
    // Creates URL: "/images/chocolate/1.png", "/images/chocolate/2.png", etc.
    imgs.push(img);
  }
  imagesRef.current = imgs;

  // Draw first frame as soon as it loads
  imgs[0].onload = () => drawFrame(0);

  return () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };
}, [product.folderPath, frameCount, ext, drawFrame]);
```

**What happens in the browser:**
```
new Image() + set .src
        ↓
Browser starts downloading all 192 PNGs in parallel
        ↓
Each image's .complete becomes true when downloaded
        ↓
imgs[0].onload fires → draws first frame
        ↓
All 192 images now sit in memory (imagesRef.current[])
        ↓
Ready for instant access during scroll
```

### Listening for Scroll Changes

```jsx
useMotionValueEvent(frameIndex, "change", (v) => {
  const idx = Math.round(v);                          // Round 95.5 → 96
  if (idx === currentFrameRef.current) return;         // Same frame? Skip
  currentFrameRef.current = idx;                       // Update tracker
  if (rafRef.current) cancelAnimationFrame(rafRef.current);  // Cancel pending draw
  rafRef.current = requestAnimationFrame(() => drawFrame(idx)); // Draw new frame
});
```

**Why `requestAnimationFrame`?**
- Scroll events fire faster than the screen refreshes (60fps)
- `requestAnimationFrame` batches draws to sync with the display refresh rate
- Prevents wasted draws that the user would never see

### Handling Window Resize

```jsx
useEffect(() => {
  let resizeTimer;
  const handleResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      drawFrame(currentFrameRef.current);
    }, 100);  // Debounce: wait 100ms after resize stops
  };
  window.addEventListener("resize", handleResize);
  return () => {
    window.removeEventListener("resize", handleResize);
    clearTimeout(resizeTimer);
  };
}, [drawFrame]);
```

When the window resizes, the canvas dimensions change, so we need to redraw the current frame to fit the new size.

### The HTML Structure

```jsx
return (
  <div ref={wrapperRef} className="relative h-[500vh]">
    {/* ↑ 500vh = 5x screen height. This creates the scroll distance. */}
    <div className="sticky top-0 h-screen overflow-hidden">
      {/* ↑ Sticky: stays fixed on screen while scrolling through the 500vh */}
      <canvas ref={canvasRef} className="h-full w-full" />
      {/* ↑ Full-screen canvas where frames are drawn */}
    </div>
  </div>
);
```

**Visual explanation:**
```
Viewport (what you see):
┌─────────────────────┐
│                     │ ← sticky div stays here
│    ┌─canvas────┐    │
│    │ frame 48  │    │
│    └───────────┘    │
│                     │
└─────────────────────┘

Actual DOM (total height):
┌─────────────────────┐ ← 0vh
│ wrapper (500vh)     │
│   ┌─sticky──────┐   │
│   │ canvas      │   │ ← stays at top of viewport
│   └─────────────┘   │
│                     │ ← 100vh
│   (empty scroll     │
│    space)           │ ← 200vh
│                     │
│                     │ ← 300vh
│                     │
│                     │ ← 400vh
│                     │
└─────────────────────┘ ← 500vh
```

---

## Step 4: Text Overlays (ProductTextOverlays)

**File: `src/components/ProductTextOverlays.jsx`**

Text that fades in and out on top of the canvas at specific scroll positions.

### The Overlay Section Component

```jsx
function OverlaySection({ children, start, end, scrollYProgress }) {
  const opacity = useTransform(
    scrollYProgress,
    [start, start + 0.04, end - 0.04, end],
    [0,     1,            1,           0   ]
  );
  const y = useTransform(
    scrollYProgress,
    [start, start + 0.04, end - 0.04, end],
    [60,    0,            0,          -60  ]
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
```

**How the fade works for Section 1 (start=0.0, end=0.22):**

```
Scroll:   0.00   0.04   0.10   0.18   0.22
          │      │      │      │      │
Opacity:  0  →   1  ────────   1  →   0
Y pos:    60 →   0  ────────   0  → -60

          fade   visible        fade
          in     (reads here)   out
```

### The 4 Scroll Ranges

```jsx
const sections = [
  { data: product.section1, start: 0.0,  end: 0.22 },  // 0% – 22%
  { data: product.section2, start: 0.22, end: 0.45 },  // 22% – 45%
  { data: product.section3, start: 0.45, end: 0.68 },  // 45% – 68%
  { data: product.section4, start: 0.68, end: 0.92 },  // 68% – 92%
];
```

**Mapped to frames (with 192 total frames):**

```
Section 1: "Dutch Chocolate."       → Frames 1-42    (scroll 0%-22%)
Section 2: "Decadence redefined."   → Frames 42-86   (scroll 22%-45%)
Section 3: "Plant-powered energy."  → Frames 86-131  (scroll 45%-68%)
Section 4: "Indulgence without..."  → Frames 131-177 (scroll 68%-92%)
```

### How it layers on top of the canvas

```jsx
{/* In page.jsx */}
<div ref={scrollRef} className="relative">
  <ProductBottleScroll product={product} />      {/* BEHIND — z-index auto */}
  <ProductTextOverlays product={product} />       {/* ON TOP — absolute inset-0 */}
</div>
```

The overlay div uses `absolute inset-0` to cover the same area as the scroll section, and `pointer-events-none` so it doesn't block scrolling.

```
Layer stack:
┌─────────────────────────┐
│  ProductTextOverlays     │ ← absolute, on top, transparent bg
│  "Dutch Chocolate."     │
│                         │
│  ┌─ ProductBottleScroll ┐│
│  │  <canvas>            ││ ← behind, draws the frames
│  │  (chocolate can img) ││
│  └──────────────────────┘│
└─────────────────────────┘
```

---

## Step 5: Navbar Component

**File: `src/components/Navbar.jsx`**

A fixed top navigation bar with scroll-reactive background.

### Key feature: Background fades in on scroll

```jsx
const { scrollY } = useScroll();
const bgOpacity = useTransform(scrollY, [0, 120], [0, 0.85]);
```

- At scroll position 0px: navbar background is fully transparent
- At scroll position 120px: navbar background is 85% opaque black
- Between 0-120px: smoothly transitions

### Glassmorphism effect

```jsx
style={{
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
}}
```

This blurs everything behind the navbar, creating a frosted glass look.

### Gradient text (brand name)

```jsx
style={{
  background: "linear-gradient(135deg, #F97316, #EC4899)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
}}
```

This makes the text fill with a gradient (orange to pink) instead of a solid color.

---

## Step 6: Footer Component

**File: `src/components/Footer.jsx`**

A dark 4-column footer with scroll-triggered animations.

### Animation pattern used

```jsx
const fadeUp = {
  initial: { opacity: 0, y: 30 },       // Start: invisible, 30px below
  whileInView: { opacity: 1, y: 0 },    // When visible: fade in, slide up
  viewport: { once: true, amount: 0.2 }, // Trigger when 20% visible, only once
  transition: { duration: 0.6, ease: "easeOut" },
};
```

Each column uses a staggered delay so they animate in sequence:

```
Column 1: delay 0.0s  →  ████████
Column 2: delay 0.1s  →   ████████
Column 3: delay 0.2s  →    ████████
Column 4: delay 0.3s  →     ████████
```

---

## Step 7: The Main Page (page.jsx)

**File: `src/app/nano-banana/page.jsx`**

This file orchestrates everything.

### "use client" Directive

```jsx
"use client";
```

Required because the page uses:
- `useEffect` (browser-only)
- `useRef` (DOM references)
- `framer-motion` animations (browser APIs)

### Setting the background gradient

```jsx
useEffect(() => {
  document.body.style.background = product.gradient;
  // Sets: "linear-gradient(135deg, #8D6E63 0%, #5D4037 100%)"
  return () => {
    document.body.style.background = "";
    // Cleanup: removes gradient when leaving the page
  };
}, []);
```

### Page sections (top to bottom)

```
┌──────────────────────────────────┐
│  Navbar (fixed, always visible)  │
├──────────────────────────────────┤
│                                  │
│  Hero Scroll Section (500vh)     │  ← ProductBottleScroll + ProductTextOverlays
│  Canvas + fading text            │
│                                  │
├──────────────────────────────────┤
│  Product Details Section         │  ← 2-column: text + image placeholder
├──────────────────────────────────┤
│  Freshness Section               │  ← Centered text
├──────────────────────────────────┤
│  Stats & Features                │  ← Pill badges + 3-column stat grid
├──────────────────────────────────┤
│  Buy Now Section                 │  ← Price, badges, CTA button
├──────────────────────────────────┤
│  Footer                          │  ← 4-column dark footer
└──────────────────────────────────┘
```

### The fadeUp animation pattern

Used on every section below the scroll area:

```jsx
const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, ease: "easeOut" },
};
```

- `initial` — starting state (invisible, 40px below final position)
- `whileInView` — end state (visible, in position)
- `viewport: { once: true }` — only animate once (don't replay on scroll back up)
- `amount: 0.2` — trigger when 20% of the element is in view

### The stagger helper

```jsx
function stagger(delay) {
  return { ...fadeUp, transition: { ...fadeUp.transition, delay } };
}

// Usage:
<motion.div {...stagger(0.15)}>  // Starts 0.15s after entering viewport
```

---

## Step 8: Global CSS Additions

**Added to `src/app/globals.css`:**

```css
/* Scoped to nano-banana page only — won't affect other routes */

.nano-banana-page ::selection {
  background: #f97316;   /* Orange highlight when selecting text */
  color: #fff;
}

.nano-banana-page::-webkit-scrollbar {
  width: 6px;            /* Thin scrollbar */
}

.nano-banana-page::-webkit-scrollbar-track {
  background: transparent;
}

.nano-banana-page::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);  /* Subtle white scrollbar */
  border-radius: 3px;
}

.nano-banana-page {
  scrollbar-width: thin;                              /* Firefox */
  scrollbar-color: rgba(255, 255, 255, 0.15) transparent;  /* Firefox */
}
```

All styles are scoped under `.nano-banana-page` class so they don't affect other routes.

---

## Step 9: Layout Changes

**Modified: `src/app/layout.js`**

Added the Outfit font from Google Fonts:

```jsx
import { Geist, Geist_Mono, Outfit } from "next/font/google";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

// Applied in the <body>:
<body className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} antialiased`}>
```

The nano-banana page then uses it via:

```jsx
style={{ fontFamily: "var(--font-outfit), sans-serif" }}
```

This way only the nano-banana page uses Outfit; other pages keep using Geist.

---

## Step 10: Config Changes

**Modified: `next.config.mjs`**

```js
const nextConfig = {
  reactCompiler: true,
  output: "export",              // Static export for deployment
  images: { unoptimized: true }, // Required for static export
};
```

---

## How the Scroll Animation Works (Deep Dive)

### The complete flow, step by step

```
1. PAGE LOADS
   ├── page.jsx renders
   ├── Sets body background gradient
   ├── Renders <ProductBottleScroll> and <ProductTextOverlays>
   │
   ├── ProductBottleScroll mounts:
   │   ├── Creates 192 Image objects
   │   ├── Sets img.src = "/images/chocolate/1.png" through "192.png"
   │   ├── Browser starts downloading all 192 PNGs in parallel
   │   ├── First image loads → draws frame 1 on canvas
   │   └── Sets up scroll listener via useScroll()
   │
   └── ProductTextOverlays mounts:
       ├── Sets up its own scroll listener via useScroll()
       └── All 4 text sections start with opacity: 0

2. USER SCROLLS
   ├── Browser fires scroll events
   ├── Framer Motion updates scrollYProgress (0 to 1)
   │
   ├── In ProductBottleScroll:
   │   ├── useTransform maps scrollYProgress → frameIndex (0 to 191)
   │   ├── useMotionValueEvent fires with new frameIndex
   │   ├── Math.round(frameIndex) gives integer frame number
   │   ├── Skips if same as current frame
   │   ├── requestAnimationFrame schedules canvas draw
   │   └── drawFrame() picks image from array, draws on canvas
   │
   └── In ProductTextOverlays:
       ├── useTransform maps scrollYProgress → opacity for each section
       ├── useTransform maps scrollYProgress → y position for each section
       └── Framer Motion applies opacity/y as CSS styles (no re-render)

3. USER SCROLLS PAST 500vh WRAPPER
   ├── Canvas section ends (sticky div unsticks)
   ├── Static sections come into view
   ├── Each <motion.div> with whileInView triggers fade-up animation
   └── User sees: Details → Freshness → Stats → Buy Now → Footer
```

### Performance optimizations in the code

| Optimization | Why |
|---|---|
| `useRef` for images (not `useState`) | Prevents 60 re-renders/second during scroll |
| `requestAnimationFrame` | Syncs draws with display refresh rate |
| `if (idx === currentFrameRef.current) return` | Skips redundant draws |
| Canvas at 1x resolution (no DPR multiply) | Prevents upscaling low-res images |
| `imageSmoothingQuality: "high"` | Bicubic interpolation for cleaner scaling |
| Debounced resize handler | Prevents excessive redraws during window resize |
| `cancelAnimationFrame` before new draw | Prevents draw queue buildup |

---

## How Text Overlays Work (Deep Dive)

### The opacity/y transform curve

For Section 1 (start=0.0, end=0.22):

```
scrollYProgress:  0.00    0.04    0.10    0.18    0.22
                  │       │       │       │       │
opacity:          0   →   1   ─────────   1   →   0
y position:       60  →   0   ─────────   0  → -60
                  │       │       │       │       │
                  fade    fully   readable  fade
                  in      visible           out
```

The `0.04` buffer at start and end creates smooth 4% fade zones.

### Why pointer-events-none?

```jsx
<div className="pointer-events-none absolute inset-0">
```

Without this, the overlay div would capture all mouse/touch events and the user couldn't scroll through it. `pointer-events-none` makes it "transparent" to interaction.

---

## How to Add a New Product

To create the same effect for a different product (e.g. Mango):

### 1. Get the video

Record or obtain a video of the product rotating.

### 2. Extract frames

```bash
mkdir -p public/images/mango
ffmpeg -i mango-video.mp4 -start_number 1 public/images/mango/%d.png
```

### 3. Count frames

```bash
ls public/images/mango/ | wc -l
# Output: 150 (example)
```

### 4. Update products.js

Change the product data:

```js
export const product = {
  id: "mango",
  name: "Cream Mango",
  folderPath: "/images/mango",
  frameCount: 150,        // ← match the count from step 3
  frameExt: "png",
  themeColor: "#FFB74D",
  gradient: "linear-gradient(135deg, #FFB74D 0%, #FFA726 100%)",
  // ... rest of the content
};
```

That's it. The components automatically use `folderPath`, `frameCount`, and `frameExt` to load the correct images.

---

## Troubleshooting

### Images not showing

- Check the path: files must be in `public/images/<folder>/1.png`, `2.png`, etc.
- The path in `folderPath` should NOT include `public/` — Next.js serves `public/` at root
- Open browser DevTools → Network tab → check if images are loading (404s?)

### Animation is choppy/laggy

- Too many frames? Try extracting fewer: `ffmpeg -i video.mp4 -vf "fps=15" ...`
- Images too large? PNGs over 1MB each will be slow to load
- Check browser memory: 192 images at ~800KB each = ~150MB in RAM

### Images look blurry

- Source images are too low resolution
- Re-extract at higher resolution: `ffmpeg -i video.mp4 -vf "scale=1920:1080" ...`
- Or use a higher quality source video

### Canvas has gaps on sides

- The cover fit code in `drawFrame()` should handle this
- Check that `overflow-hidden` is on the sticky container

### Text overlays not synced with scroll

- Both `ProductBottleScroll` and `ProductTextOverlays` must share the same `scrollRef`
- Check that the `scrollRef` div wraps both components

### Build fails

- Make sure `framer-motion` is installed: `npm install framer-motion`
- All components using hooks must have `"use client"` at the top
- Check import paths use `@/` alias correctly

---

## Summary

```
Video → ffmpeg → 192 PNG frames → public/images/chocolate/
                                          ↓
products.js (folderPath, frameCount, frameExt, text content)
                                          ↓
ProductBottleScroll ← useScroll → scrollYProgress → frameIndex → canvas.drawImage()
ProductTextOverlays ← useScroll → scrollYProgress → opacity/y transforms
                                          ↓
page.jsx orchestrates: Navbar + ScrollSection + Details + Stats + BuyNow + Footer
                                          ↓
User scrolls → canvas flipbook + fading text = "3D rotating product" illusion
```
