# Nano Banana Route — Technical Overview

---

## Project Structure

| File | Purpose |
|------|---------|
| `page.jsx` | Next.js route entry point (`use client`) |
| `ProductBottleScroll.jsx` | Canvas-based frame sequence animation driven by scroll |
| `ProductTextOverlays.jsx` | Text overlays that fade in/out at scroll ranges |
| `Navbar.jsx` | Fixed header with glass-morphism + scroll-driven opacity |
| `Footer.jsx` | Multi-column footer with newsletter signup |
| `products.js` | Product data — name, frames, colors, stats, copy |

**Image Assets:**

| Asset | Details |
|-------|---------|
| `public/images/chocolate/1.png` – `192.png` | 192 PNG frames of the product bottle rotating |

---

## Packages Used & Why

| Package | Why |
|---------|-----|
| `motion` (Framer Motion) | `useScroll`, `useTransform`, `useMotionValueEvent` for scroll-driven frame animation and text overlays. `motion.div`/`motion.button` for fade-up and hover/tap micro-interactions. |
| `next` | App Router framework. |
| `tailwindcss` | Utility CSS for layout, responsive design, glass-morphism effects. |

No 3D packages (`three`, `@react-three/fiber`) are used on this route — it's entirely **2D canvas + DOM**.

---

## How the Page Works

A product showcase for "Dutch Chocolate" cold-pressed juice. The user scrolls through a bottle animation, reads product info, views stats, and reaches a Buy Now section.

```
User scrolls natively
        │
        ▼
ProductBottleScroll (500vh wrapper + sticky viewport)
        │
        ├── useScroll() → scrollYProgress (0 → 1)
        │       └── useTransform → frameIndex (0 → 191)
        │               └── useMotionValueEvent → drawFrame(idx) on <canvas>
        │
        └── ProductTextOverlays (absolute, sticky)
                └── 4 OverlaySection components
                        └── useTransform → opacity + y per scroll range
```

After the scroll section, **static sections** stack in normal flow:
- Product Details (2-column grid)
- Freshness (centered copy)
- Stats & Features (3-column stat cards + feature pills)
- Buy Now (glass card with price + CTA)
- Footer (4-column with newsletter)

---

## How the Bottle Animation Works

**Not a video** — it's 192 pre-rendered PNG frames drawn to an HTML5 `<canvas>`.

**Loading:**
- All 192 images preloaded in `useEffect` as `new Image()` objects
- Stored in `imagesRef.current[]` array
- First frame drawn on load

**Scroll-to-frame mapping:**
- `useScroll()` tracks the 500vh wrapper's scroll progress (0–1)
- `useTransform(scrollYProgress, [0, 1], [0, 191])` maps progress to frame index
- `useMotionValueEvent(frameIndex, 'change', ...)` fires on every value change
- Only redraws when frame index actually changes (deduplication via `currentFrameRef`)

**Canvas rendering:**
- Canvas resolution set to 1x CSS pixels (avoids upscaling low-res sources on HiDPI)
- Uses **cover fit** — fills entire canvas, crops overflow
- `imageSmoothingQuality: "high"` for quality scaling
- `requestAnimationFrame` for smooth, non-blocking draws
- Debounced resize handler (100ms) redraws current frame on window resize

---

## How Text Overlays Work

4 text sections fade in/out over the bottle animation using the same scroll progress:

| Section | Scroll Range | Title |
|---------|-------------|-------|
| 1 | 0.00 – 0.22 | "Dutch Chocolate." |
| 2 | 0.22 – 0.45 | "Decadence redefined." |
| 3 | 0.45 – 0.68 | "Plant-powered energy." |
| 4 | 0.68 – 0.92 | "Indulgence without compromise." |

Each `OverlaySection` uses `useTransform` with a 4-keyframe pattern:
- **Fade in**: opacity 0→1, y 60→0 (over 4% of scroll)
- **Visible**: fully shown, stationary
- **Fade out**: opacity 1→0, y 0→-60 (over 4% of scroll)

Overlays are `pointer-events-none` and absolutely positioned over the sticky canvas.

---

## How the Navbar Works

- **Fixed** at top (`z-50`), always visible
- **Glass-morphism**: `backdrop-filter: blur(20px)` on the nav element
- **Dynamic background**: a `motion.div` behind the content with `opacity` driven by `useTransform(scrollY, [0, 120], [0, 0.85])` — starts transparent, becomes 85% opaque black after 120px of scroll
- **Brand**: gradient star SVG + "Nano Banana" text with `linear-gradient(135deg, #F97316, #EC4899)` clipped to text
- **CTA**: "Order Now" button with `whileHover={{ scale: 1.05 }}`, `whileTap={{ scale: 0.97 }}`, orange glow shadow

---

## How the Footer Works

- Dark background (`gray-950`)
- 4-column responsive grid (`md:grid-cols-4`, stacks on mobile)
- **Columns**: Brand, Shop links, Support links, Newsletter signup
- **Staggered animations**: each column fades up with 0.1s delay increment
- **Newsletter form**: email input + "Join" button in a rounded pill container
- Auto-generated copyright year

---

## Product Data Structure

All product content comes from `src/data/products.js`:

```js
{
  id: "chocolate",
  name: "Dutch Chocolate",
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
  section1–4: { title, subtitle },     // overlay text
  detailsSection: { title, description },
  freshnessSection: { title, description },
  buyNowSection: { price, unit, processingParams, deliveryPromise, returnPolicy },
}
```

The page is designed to be **data-driven** — swapping the product object would create a different product page with different frames, colors, and copy.

---

## Animation Patterns

| Pattern | Implementation |
|---------|---------------|
| **Fade up on view** | `motion.div` with `initial={{ opacity: 0, y: 40 }}`, `whileInView={{ opacity: 1, y: 0 }}`, `viewport={{ once: true }}` |
| **Staggered fade** | `stagger(delay)` helper adds delay to the shared `fadeUp` config |
| **Hover scale** | `whileHover={{ scale: 1.04 }}` on buttons |
| **Tap scale** | `whileTap={{ scale: 0.97 }}` on buttons |
| **Scroll-linked opacity** | `useTransform(scrollYProgress, [...], [...])` for text overlays and navbar background |
| **Scroll-linked canvas** | `useMotionValueEvent` + `requestAnimationFrame` for frame drawing |

---

## Design System

| Element | Style |
|---------|-------|
| **Theme color** | `#8D6E63` (chocolate brown) |
| **Gradient** | `135deg, #8D6E63 → #5D4037` |
| **Glass cards** | `bg-white/5 border-white/10 backdrop-blur-sm` |
| **Feature pills** | `bg-white/5 border-white/15 rounded-full` |
| **Text opacity** | Primary: 100%, Secondary: 70%, Tertiary: 50–60% |
| **Font** | Outfit (300–900 weights) |
| **Body background** | Set to product gradient via `document.body.style.background` |

---

## Performance Optimizations

| Technique | What it does |
|-----------|-------------|
| **Canvas rendering** | 2D canvas API instead of DOM elements for frame animation — avoids layout thrashing |
| **RAF throttling** | `requestAnimationFrame` + frame deduplication — only draws when frame index changes |
| **Image preloading** | All 192 frames loaded upfront in `useEffect` |
| **Debounced resize** | 100ms timeout before redrawing on window resize |
| **MotionValue animations** | `useTransform` creates derived values without React re-renders |
| **1x canvas resolution** | Canvas capped at 1x CSS pixels — avoids upscaling low-res source images |
| **`viewport={{ once: true }}`** | Fade-up animations only run once, never re-triggered |
| **RAF cleanup** | Pending animation frames cancelled on unmount and before new requests |
