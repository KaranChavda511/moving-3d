
---

**Website Visuals One Shot – New Route in Existing Next.js App**

**Role**  
You are a world‑class Frontend Architect and Creative Developer specializing in Awwwards‑level, highly-polished interactive websites.

**Context**  
I already have an existing **Next.js App Router project**.  
You must implement everything described below **as a new route**, e.g. under `app/nano-banana/` (or a similarly named route), without breaking or overwriting any existing files or behavior in the project.

---

### 1. Objective

Build a complete, production‑ready, single‑page **scrollytelling e‑commerce experience** for a premium juice brand called **"Nano Banana"**.

- **Framework**: Next.js 16+ **App Router**.
- **Language**: JavaScript (no TypeScript for components unless explicitly required by config, but you may use `.ts` for config/data where appropriate).
- **Styling**: Tailwind CSS.
- **Animation**: Framer Motion for page transitions and scroll-reveal interactions, plus an HTML5 `<canvas>` image sequence for the product bottle.
- **Font**: Google Font `"Outfit"` via `next/font/google`.
- **Deployment**: Static Export (`output: 'export'`).

The page must look and feel like an **Awwwards-level scrollytelling product story**: bold typography, beautiful gradients, subtle micro-interactions, and buttery smooth scroll-driven animations.

---

### 2. Integration & Project Constraints

- **Do NOT assume a blank project.** Treat this as a **feature route** added to an existing Next.js App Router app.
- Place all new route files under a single folder, e.g. `app/nano-banana/`.
- If you need to add shared components (like `Navbar`, `Footer`), place them in `components/` so they can be reused.
- If `tailwind.config` or global styles already exist in a typical Next.js + Tailwind setup, **extend them instead of replacing** (show full, final versions but design them to be merged safely).
- Ensure all imports use **relative paths** that will work inside a standard `app` directory structure.

---

### 3. Required Files & Responsibilities

You must generate the **entire code** for all of the following files.  
Assume I will create and place images manually in `public/images/{flavor}/`.  
Your output must be **copy-paste runnable** with `npm run build` and `npm run start` (or `next build`/`next start`) after installing dependencies (`framer-motion`, `tailwindcss`, etc.).

#### 3.A. Configuration

1. **`next.config.mjs`**  
   - If the file already exists, show the final version as if extended (no breaking changes).
   - Requirements:
     - `output: 'export'`
     - `images: { unoptimized: true }` (for Netlify Drop / static export compatibility)
   - Example shape (adapt to existing config style as needed):
     ```js
     /** @type {import('next').NextConfig} */
     const nextConfig = {
       output: 'export',
       images: { unoptimized: true },
     };

     export default nextConfig;
     ```

2. **`tailwind.config.ts`**  
   - Standard Tailwind config, but:
     - Include `app/**/*.{js,ts,jsx,tsx}` and `components/**/*.{js,ts,jsx,tsx}` in `content`.
     - Extend theme with a **custom gradient** token for the product background (e.g. `product: { gradient: '...' }`).
     - Add any necessary font family mapping for `"Outfit"`.

3. **`app/globals.css`**  
   - Ensure global Tailwind base/components/utilities are imported if not already.
   - Requirements:
     - Set `body` background to a **custom CSS variable** that maps to the product gradient (e.g. `background: var(--product-gradient);`).
     - Customize `::selection` to **orange bg** and **white text** (`bg-orange-500`, `#fff`).
     - Hide or subtly style scrollbars for a clean "app-like" look (WebKit scrollbar styles + sensible fallbacks).
     - Ensure no global styles conflict with default Next.js App Router behavior.

---

### 3.B. Layout & Typography

1. **`app/layout.tsx` (root layout, or show how to extend existing layout)**  
   - Import `Outfit` from `next/font/google`.
   - Apply the font globally using the `className` from the font.
   - Set `<html lang="en">`.
   - Metadata:
     - `title: "Nano Banana | Future of Freshness"`
     - Optionally add `description` for SEO.
   - Ensure the layout is compatible with App Router and does not break other routes (e.g. keep `children` render as usual).

If there is already an `app/layout.tsx` in the project, show the **final merged version** containing both the existing behavior and the new font/metadata styling.

---

### 3.C. Data Layer – `data/products.ts`

Create a robust data file exporting the `Product` interface and `products` array.  
**You must use this EXACT data structure and content (preserve copy and vibe exactly):**

```ts
export interface Product {
   id: string;
   name: string;
   subName: string;
   price: string;
   description: string;
   folderPath: string;
   themeColor: string;
   gradient: string;
   features: string[];
   stats: { label: string; val: string }[];
   section1: { title: string; subtitle: string };
   section2: { title: string; subtitle: string };
   section3: { title: string; subtitle: string };
   section4: { title: string; subtitle: string };
   detailsSection: { title: string; description: string; imageAlt: string };
   freshnessSection: { title: string; description: string };
   buyNowSection: {
       price: string;
       unit: string;
       processingParams: string[];
       deliveryPromise: string;
       returnPolicy: string;
   };
}

export const products: Product[] = [
   {
       id: "mango",
       name: "Cream Mango",
       subName: "Pure sunshine.",
       price: "₹120",
       description: "Rich in Vitamin C - No preservatives - 100% fruit",
       folderPath: "/images/mango",
       themeColor: "#FFB74D",
       gradient: "linear-gradient(135deg, #FFB74D 0%, #FFA726 100%)",
       features: ["Rich in Vitamin C", "No preservatives", "100% fruit"],
       stats: [{ label: "Sugar", val: "0g" }, { label: "Water", val: "0%" }, { label: "Pulp", val: "100%" }],
       section1: { title: "Cream Mango.", subtitle: "Pure sunshine." },
       section2: { title: "Bursting with fresh mango.", subtitle: "Hand-picked Alphonso mangoes, perfectly ripened under the summer sun." },
       section3: { title: "Vitamin-packed refreshment.", subtitle: "A natural energy boost that revitalizes your body and mind instantly." },
       section4: { title: "Made from fruit, not concentrate.", subtitle: "" },
       detailsSection: {
           title: "The King of Fruits",
           description: "Our Cream Mango juice uses only the finest Ratnagiri Alphonso mangoes. Known for their rich sweetness and vibrant color, these mangoes are cold-pressed within hours of harvest to preserve every drop of nutrient-rich goodness. It's not just juice; it's a liquid gold experience.",
           imageAlt: "Mango Details"
       },
       freshnessSection: {
           title: "Farm to Bottle",
           description: "We believe in absolute transparency. From the orchard to the bottle, our process is designed to minimize oxidation and maximize flavor. HPP (High Pressure Processing) ensures that our juice stays safe and fresh without any heat treatment, keeping the vital enzymes and vitamins intact."
       },
       buyNowSection: {
           price: "₹120",
           unit: "per 300ml bottle",
           processingParams: ["Cold Pressed", "Never Heated", "HPP Treated"],
           deliveryPromise: "Next-day delivery available in metro cities. Chilled packaging ensures peak freshness.",
           returnPolicy: "100% Satisfaction Guarantee. Not happy? We'll replace it, no questions asked."
       }
   },
   {
       id: "chocolate",
       name: "Dutch Chocolate",
       subName: "Velvety smooth.",
       price: "₹140",
       description: "Premium Cocoa - Almond Milk base - Plant Protein",
       folderPath: "/images/chocolate",
       themeColor: "#8D6E63",
       gradient: "linear-gradient(135deg, #8D6E63 0%, #5D4037 100%)",
       features: ["Premium Cocoa", "Almond Milk", "Plant Protein"],
       stats: [{ label: "Dairy", val: "0%" }, { label: "Protein", val: "12g" }, { label: "Cocoa", val: "100%" }],
       section1: { title: "Dutch Chocolate.", subtitle: "Velvety smooth." },
       section2: { title: "Decadence redefined.", subtitle: "Rich, dark cocoa blended with creamy almond milk for a guilt-free treat." },
       section3: { title: "Plant-powered energy.", subtitle: "Loaded with natural plant protein to fuel your active lifestyle." },
       section4: { title: "Indulgence without compromise.", subtitle: "" },
       detailsSection: {
           title: "Ethically Sourced Cocoa",
           description: "We source our cocoa from sustainable farms in Ghana, ensuring fair wages and premium quality. Blended with our house-made almond milk, this drink offers a silky texture that rivals traditional dairy shakes, but with zero cholesterol and 100% plant-based goodness.",
           imageAlt: "Chocolate Details"
       },
       freshnessSection: {
           title: "Cold-Crafted Perfection",
           description: "Heat destroys delicate cocoa flavonoids. That's why we mix our Dutch Chocolate cold. Our almond milk is pressed fresh daily, never stored. The result is a clean, robust chocolate flavor that feels heavy on the tongue but light on the stomach."
       },
       buyNowSection: {
           price: "₹140",
           unit: "per 300ml bottle",
           processingParams: ["Plant Based", "Cold Blended", "Dairy Free"],
           deliveryPromise: "Shipped in insulated eco-friendly coolers. Keeps perfectly cold for 48 hours.",
           returnPolicy: "Taste the difference or get your money back."
       }
   },
   {
       id: "pomegranate",
       name: "Ruby Pomegranate",
       subName: "Antioxidant powerhouse.",
       price: "₹150",
       description: "Heart Healthy - Cold Pressed - Immunity Booster",
       folderPath: "/images/pomegranate",
       themeColor: "#E57373",
       gradient: "linear-gradient(135deg, #E57373 0%, #C62828 100%)",
       features: ["Heart Healthy", "Cold Pressed", "Immunity Booster"],
       stats: [{ label: "Additives", val: "0%" }, { label: "Vitamins", val: "A,C,K" }, { label: "Purity", val: "100%" }],
       section1: { title: "Ruby Pomegranate.", subtitle: "Nature's jewel." },
       section2: { title: "Explosion of flavor.", subtitle: "Freshly pressed pomegranate arils delivering a tart and sweet sensation." },
       section3: { title: "Heart healthy goodness.", subtitle: "Packed with powerful antioxidants to protect and rejuvenate." },
       section4: { title: "Pure juice, pure life.", subtitle: "" },
       detailsSection: {
           title: "The Ruby Elixir",
           description: "Each bottle contains the juice of over 1 kg of premium pomegranates. We use a gentle pressing method to extract the juice from the arils without crushing the bitter pith. This results in a sweet, complex flavor profile that is unmatched by commercial concentrates.",
           imageAlt: "Pomegranate Details"
       },
       freshnessSection: {
           title: "Potent Preservation",
           description: "Pomegranate juice is highly sensitive to light and air. Our bottling line is designed to shield the juice from oxidation at every step. We bottle immediately after pressing to lock in the vibrant color and the potent punicalagins—unique antioxidants found only in pomegranate."
       },
       buyNowSection: {
           price: "₹150",
           unit: "per 300ml bottle",
           processingParams: ["Cold Pressed", "Oxidation Shield", "No Additives"],
           deliveryPromise: "Direct from the pressery to your doorstep. Guaranteed fresh upon arrival.",
           returnPolicy: "Damaged in transit? Instant replacement available."
       }
   }
];
```

---

### 3.D. Core Components

Place these in `components/` and make them reusable for any product in the `products` array.

1. **`components/ProductBottleScroll.tsx` – The Scroll Engine (Canvas Sequence)**  
   **Responsibilities:**
   - Render a full-height scroll section:
     - Outer wrapper: `div` with `h-[500vh]` (or similar) to create scrollytelling length.
     - Inside: a `sticky` container with `top-0` and `h-screen`.
   - Inside the sticky container, render `<canvas ref={canvasRef} />`.
   - Use Framer Motion’s `useScroll` (with a `ref` to the wrapper) to get scroll progress (`0` → `1`).
   - Load **120 `.webp` images** named `1.webp` to `120.webp` from `product.folderPath`.
     - Use an efficient preloading strategy (e.g. `Image` objects or `HTMLImageElement`) and cache them in memory.
   - Map scroll progress to **frame index**:
     - `frameIndex = Math.floor(progress * (frameCount - 1))` where `frameCount = 120`.
   - On scroll:
     - Use `requestAnimationFrame` to draw the current frame to the canvas.
     - Ensure high-DPI support:
       - Handle `devicePixelRatio`.
       - Resize canvas on window resize so the image fits with a `"contain"` style (no distortion, centered).
   - Accept a `product` prop (typed with `Product`) to infer `folderPath` and maybe theme color.

2. **`components/ProductTextOverlays.tsx` – Scroll-Synced Copy**  
   **Responsibilities:**
   - Display 4 main text sections using `product.section1` to `section4`.
   - Use `useScroll` + `useTransform` from Framer Motion to:
     - Fade each section in/out at specific progress ranges (e.g. `0.0–0.2`, `0.2–0.4`, `0.4–0.6`, `0.6–0.8`).
     - Optionally add `y` translate transforms for subtle parallax.
   - Styling:
     - Big, bold, minimal typography.
     - Align with the current product’s `themeColor` and `gradient`.
     - Responsive layout (stacked on mobile, more open / two-column feel on desktop).

3. **`components/Navbar.tsx` – Fixed Gradient Nav**  
   **Responsibilities:**
   - Fixed at top (`fixed top-0 left-0 right-0 z-50`).
   - Use `backdrop-blur-xl`, subtle border, and background that transitions opacity based on scroll (use `useScroll` or `useMotionValueEvent`).
   - Branding:
     - A custom inline SVG icon (abstract lightning/banana hybrid).
     - "Nano Banana" text with a gradient fill (Orange → Pink).
   - Right side: `"Order Now"` button with:
     - Glowing hover effect (outer glow using `before:` or `shadow-[...]`).
     - Subtle scale-up and color shift on hover via Framer Motion.
   - Mobile-friendly layout (collapses nicely on small screens).

4. **`components/Footer.tsx` – Professional Dark Footer**  
   **Responsibilities:**
   - Dark mode background: `bg-gray-900`, light text.
   - Multi-column layout:
     - Column 1: Brand ("Nano Banana") and short tagline.
     - Column 2: Shop links (e.g. "All Flavors", "Subscriptions", "Gift Cards").
     - Column 3: Support (FAQ, Contact, Shipping, Returns).
     - Column 4: Newsletter signup:
       - Email input field.
       - CTA button with subtle animations.
   - Responsive and accessible:
     - Proper `label` for input.
     - Use semantic HTML (`footer`, `nav`, `ul`, `li`).

---

### 3.E. Page Orchestration – `app/nano-banana/page.tsx`

This is the main scrollytelling route.

**State & Flow:**

- Maintain `currentIndex` in React state (`0`, `1`, `2`) corresponding to the product index in `products`.
- Wrap the top-level product-specific content in `<AnimatePresence mode="wait">`:
  - Animate out old product background/bottle before animating in the new one.
- On flavor change (`currentIndex` change):
  - `useEffect(() => window.scrollTo(0, 0), [currentIndex]);`

**Navigation UI:**

- **Arrows**:
  - Fixed left and right arrow buttons (vertically centered or near bottom).
  - Click to go to previous/next flavor (loop around from last → first).
  - Use Framer Motion hover/tap states.
- **Flavor Menu**:
  - Fixed bottom-center pill menu with each flavor name ("Cream Mango", "Dutch Chocolate", "Ruby Pomegranate").
  - Clicking a pill jumps directly to that flavor (updates `currentIndex`).
  - The active flavor is highlighted with a strong accent (border, glow, bold text).

**Content Sections (Vertical Flow):**

For each `current` product:

1. **Hero & Scroll Experience**
   - Use `ProductBottleScroll` as the central scroll engine.
   - Layer `ProductTextOverlays` on top or beside the canvas (z-indexed, positioned with Tailwind and Framer Motion).
   - Background gradient / body CSS variable should update based on `product.gradient`.

2. **Product Details Section**
   - Use `product.detailsSection` and `product.freshnessSection`.
   - Card‑like layout with imagery placeholder (I will link images later).
   - Use `motion.div` with `whileInView` and `viewport={{ once: true }}` for slide‑up and fade animations on scroll.

3. **Stats & Features**
   - Grid layout showing:
     - `product.features` as pill badges.
     - `product.stats` as key-value tiles (e.g. "Sugar – 0g").
   - Use `whileInView` animations for each tile (staggered).

4. **Buy Now Section**
   - Data from `product.buyNowSection`:
     - Prominent price (`price` + `unit`).
     - Processing params as small badges.
     - Copy for `deliveryPromise` and `returnPolicy`.
   - "Add to Cart" / "Buy Now" button with:
     - Framer Motion hover/tap interactions.
     - Emphasis on conversion while keeping premium feel.

5. **Next Flavor CTA**
   - At the very bottom, a large, diagonal/slanted CTA block:
     - "Next Flavor: {nextProduct.name}".
     - Clicking it changes `currentIndex` to the next product and scrolls to the top (re-using the `useEffect` logic).
     - Use strong gradient and playful diagonals to feel like *turning the page*.

**Animation Polish:**

- Use `motion.div` with:
  - `initial={{ opacity: 0, y: 40 }}`
  - `whileInView={{ opacity: 1, y: 0 }}`
  - `transition={{ duration: 0.6, ease: 'easeOut' }}`
  - and `viewport={{ once: true, amount: 0.2 }}` for each main content block.
- Ensure **smooth transitions** between flavors:
  - Background gradient cross-fades.
  - Bottle canvas fades/zooms slightly.
  - Text content cross-fades/slides.

---

### 4. Visual & UX Style Requirements

- **Overall Feel**:
  - Minimal but premium.
  - Strong use of gradients, glassmorphism (where appropriate), and smooth micro interactions.
- **Responsive**:
  - Fully responsive across mobile, tablet, and desktop.
  - Avoid horizontal scroll.
- **Performance**:
  - Lazy-load non-critical sections where possible.
  - Canvas rendering should be optimized with `requestAnimationFrame`, efficient image caching, and debounced resize logic.

---

### 5. Output Requirements

- **Critical**: The output must be **COMPLETE and self-contained**.
  - Provide the **full contents** of every file mentioned:
    - `next.config.mjs`
    - `tailwind.config.ts`
    - `app/globals.css`
    - `app/layout.tsx` (or merged version)
    - `data/products.ts`
    - `components/ProductBottleScroll.tsx`
    - `components/ProductTextOverlays.tsx`
    - `components/Navbar.tsx`
    - `components/Footer.tsx`
    - `app/nano-banana/page.tsx` (or whichever route name you use)
  - Make sure imports and paths are correct and consistent.
  - Assume I will run:
    - `npm install next react react-dom tailwindcss postcss autoprefixer framer-motion`
    - `npm run dev` / `npm run build` / `npm run start`
- **No TODOs** or placeholders in logic (visual placeholders such as `div` where an image will go are fine).
- The code must be **error-free** and ready to paste directly into my existing Next.js App Router project.

---

