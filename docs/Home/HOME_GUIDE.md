# Home Route — Complete Developer Guide

## Marketing Landing Page with Spline 3D

The root route (`/`) is a marketing hero section for an "Email for Developers" product. It features a remotely-hosted Spline 3D model on the right and CTA copy on the left. Built with **zero custom 3D code** — the Spline viewer handles everything.

---

## Table of Contents

1. [How It Works (Big Picture)](#1-how-it-works-big-picture)
2. [Packages Used & Why](#2-packages-used--why)
3. [File Structure](#3-file-structure)
4. [File-by-File Breakdown](#4-file-by-file-breakdown)
   - [page.js — Route Entry Point](#41-pagejs--route-entry-point)
   - [layout.js — Root Layout](#42-layoutjs--root-layout)
   - [globals.css — Global Styles](#43-globalscss--global-styles)
   - [Hero3DSection/index.jsx — Hero Component](#44-hero3dsectionindexjsx--hero-component)
   - [Hero3DSection.module.css — Gradient Blur Effect](#45-hero3dsectionmodulecss--gradient-blur-effect)
   - [SplineViewer/index.jsx — 3D Model Wrapper](#46-splineviewerindexjsx--3d-model-wrapper)
5. [Key Concepts Explained](#5-key-concepts-explained)
   - [What is Spline?](#51-what-is-spline)
   - [What is a CSS Module?](#52-what-is-a-css-module)
   - [Server vs Client Components](#53-server-vs-client-components)
6. [How the 3D Model Works](#6-how-the-3d-model-works)
7. [How the Visual Layers Work](#7-how-the-visual-layers-work)
8. [How the Layout & Fonts Work](#8-how-the-layout--fonts-work)
9. [Customization Guide](#9-customization-guide)

---

## 1. How It Works (Big Picture)

```
User visits /
        │
        ▼
page.js (server component)
        │
        └── Hero3DSection (server component)
                │
                ├── Left: Marketing copy + CTA buttons
                │
                ├── Right: SplineViewer (client component)
                │       └── Loads remote .splinecode from Spline CDN
                │       └── Renders interactive 3D scene in WebGL canvas
                │
                └── Background layers:
                        ├── Radial gradient (CSS)
                        ├── Blurred elliptical glow (CSS module)
                        └── Gradient grid image (next/image)
```

No scroll animations, no custom Three.js, no frame sequencing. Just a static hero section with a Spline 3D embed.

---

## 2. Packages Used & Why

| Package | What It Does | Why We Need It |
|---------|-------------|----------------|
| `@splinetool/react-spline` | React wrapper for the Spline 3D viewer. Loads `.splinecode` files and renders them in a WebGL canvas with built-in interactivity. | **Zero-code 3D** — the 3D scene is designed in Spline's visual editor, not coded in JavaScript. No Three.js setup, lighting, camera, or loaders needed. |
| `next` | Framework. `next/font/google` for font loading, `next/image` for optimized image rendering. | Provides the routing, layout system, and font optimization. |
| `tailwindcss` | Utility CSS. | Layout, responsive design, typography, spacing. |

### What We Don't Use (on this route)

| Not Used | Why |
|----------|-----|
| `three` / `@react-three/fiber` | Spline handles the entire 3D pipeline — no need for manual Three.js code |
| `motion` | No scroll animations or transitions — static layout |
| Canvas / frame sequencing | No scroll-driven animation — 3D model is always-on |

---

## 3. File Structure

```
src/
├── app/
│   ├── page.js                                 ← Route entry (server component)
│   ├── layout.js                               ← Root layout (fonts, metadata)
│   └── globals.css                             ← Theme variables, utility classes
├── sections/
│   └── HomePage/
│       └── Hero3DSection/
│           ├── index.jsx                       ← Hero component (server)
│           └── Hero3DSection.module.css        ← Gradient blur style
├── components/
│   └── SplineViewer/
│       └── index.jsx                           ← Spline wrapper (client)
└── assets/
    └── images/
        └── gradient.png                        ← Gradient grid overlay
```

---

## 4. File-by-File Breakdown

### 4.1. `page.js` — Route Entry Point

**File:** `src/app/page.js`

```jsx
import Hero3DSection from "@/sections/HomePage/Hero3DSection";

export default function HomePage() {
  return (
    <>
      <Hero3DSection />
    </>
  );
}
```

- **Server component** (no `"use client"`)
- Renders only the `Hero3DSection`
- No metadata export — uses defaults from `layout.js`

---

### 4.2. `layout.js` — Root Layout

**File:** `src/app/layout.js`

```jsx
import localFont from "next/font/local";
import { Outfit } from "next/font/google";
import "./globals.css";

const geistSans = localFont({ src: "./fonts/GeistVF.woff", variable: "--font-geist-sans" });
const geistMono = localFont({ src: "./fonts/GeistMonoVF.woff", variable: "--font-geist-mono" });
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
});

export const metadata = { title: "Moving 3D", description: "..." };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

**3 fonts loaded:**
- **Geist Sans** — primary sans-serif (`--font-geist-sans`)
- **Geist Mono** — monospace for code-like elements (`--font-geist-mono`)
- **Outfit** — display font for headings (weights 300–900, `--font-outfit`)

All applied as CSS variables on `<body>`, usable via `font-family: var(--font-outfit)`.

---

### 4.3. `globals.css` — Global Styles

**File:** `src/app/globals.css`

**Theme system** (Tailwind v4 `@theme` block):
```css
--color-primary: #335fff;
--color-secondary: #2c23e8;
--color-dark-bg: #141414;
--color-light-bg: #f0f4ff;
--color-accent-green: #28b673;
```

**Key utility classes:**
- `.h1-heading` — responsive: `clamp(28px, 4vw, 48px)`
- `.px-wrapper` — horizontal padding: `clamp(20px, 4vw, 80px)`
- `.gradient-border-button-pulse` — animated gradient border (shifts `background-position`)
- `.no-scrollbar` — hides scrollbars globally (WebKit + Firefox + IE)
- `.fade-in` — `opacity: 0 → 1` + `translateY(10px) → 0` over 0.5s

**Global scroll:**
```css
html { scroll-behavior: smooth; }
```

---

### 4.4. `Hero3DSection/index.jsx` — Hero Component

**File:** `src/sections/HomePage/Hero3DSection/index.jsx`

**Structure:**
```jsx
<section className="relative isolate min-h-screen overflow-hidden bg-[radial-gradient(...)]">
  {/* Right: Spline 3D viewer (65% width, hidden on mobile) */}
  <div className="absolute right-0 top-[-10%] z-10 hidden h-[120%] w-[65%] md:block">
    <SplineViewer />
  </div>

  {/* Left: Text + CTAs (50% width) */}
  <div className="flex w-full flex-col items-start md:w-1/2">
    {/* Badge, H1, Description, Buttons */}
  </div>

  {/* Background: Gradient blur + grid image */}
  <div className="pointer-events-none absolute inset-0 z-0">
    {/* layerBlur CSS module + gradient.png */}
  </div>
</section>
```

**Badge:** Purple-bordered pill with glow:
```jsx
<div className="border border-[#a855f7]/60 shadow-[0_0_18px_rgba(168,85,247,0.45)]">
  <span className="text-[#d8b4fe]">INTRUCING Δ</span>
</div>
```

**CTA buttons:**
- "Documentation >" — dark bg, purple text (`#c084fc`), border `white/10`
- "Get started >" — white bg, black text, no border

**Background:** `radial-gradient(ellipse_at_center, #050507 0%, #020203 55%, #000000 100%)` — near-black with subtle warmth at center.

---

### 4.5. `Hero3DSection.module.css` — Gradient Blur Effect

**File:** `src/sections/HomePage/Hero3DSection/Hero3DSection.module.css`

```css
.layerBlur {
  width: 35rem;
  height: 20rem;
  border-radius: 50%;
  background: radial-gradient(
    ellipse at center,
    rgba(255, 255, 255, 0.22) 0%,
    rgba(255, 255, 255, 0.08) 35%,
    transparent 65%
  );
  filter: blur(90px);
  rotate: -30deg;
}
```

Creates a large, soft white glow behind the 3D model. The 90px blur makes it feel ambient rather than sharp. Rotated -30deg for visual asymmetry.

---

### 4.6. `SplineViewer/index.jsx` — 3D Model Wrapper

**File:** `src/components/SplineViewer/index.jsx`

```jsx
"use client";

import Spline from "@splinetool/react-spline";

export default function SplineViewer() {
  return (
    <Spline
      scene="https://prod.spline.design/WSRvLniBZI0qPx1C/scene.splinecode"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
```

- **`"use client"`** — required because Spline creates a WebGL canvas (browser-only API)
- The `scene` prop points to a **remotely-hosted** `.splinecode` file on Spline's CDN
- The 3D content is authored in Spline's visual editor — any changes to the model are made there, not in code
- Spline's runtime handles: model loading, lighting, camera, interaction (hover/drag), render loop
- No `ssr: false` dynamic import needed — the parent `Hero3DSection` is a server component, but React can render client components within server components as long as they're imported directly

---

## 5. Key Concepts Explained

### 5.1. What is Spline?

[Spline](https://spline.design) is a visual 3D design tool (like Figma for 3D). You design scenes with models, lights, cameras, and interactions in their editor, then export a `.splinecode` file. The React component loads this file and renders it — no Three.js code needed.

**vs. Three.js / React Three Fiber:**
- Spline: Design in a visual editor, embed with one component. No code for models, lights, or cameras.
- Three.js: Full control, write every line. Better for custom effects (shaders, scroll-driven animation, etc.).

The Atmos route uses Three.js (needs custom shaders and scroll-driven camera). The Home route uses Spline (just needs to display a model).

### 5.2. What is a CSS Module?

A `.module.css` file where class names are locally scoped to the component that imports them:

```jsx
import styles from "./Hero3DSection.module.css";
// styles.layerBlur → "Hero3DSection_layerBlur__abc123"
```

Prevents class name collisions between components. Used here for the gradient blur effect.

### 5.3. Server vs Client Components

| | Server Component | Client Component |
|---|---|---|
| Default in Next.js App Router | Yes | No (needs `"use client"`) |
| Can access server APIs | Yes | No |
| Ships JS to client | No | Yes |
| Can use hooks / browser APIs | No | Yes |

On this route:
- `page.js` and `Hero3DSection` are **server components** — rendered on the server, zero JS shipped
- `SplineViewer` is a **client component** — needs WebGL (browser API), so it ships JS

---

## 6. How the 3D Model Works

```
SplineViewer (client component)
        │
        ▼
@splinetool/react-spline
        │
        ├── Downloads .splinecode from Spline CDN
        ├── Creates WebGL canvas
        ├── Parses scene: models, materials, lights, camera
        ├── Runs render loop (~60fps)
        └── Handles user interaction (hover, click, drag)
```

The `.splinecode` file contains the entire scene — geometry, textures, lighting, camera, animation, and interaction logic. All authored in Spline's editor.

---

## 7. How the Visual Layers Work

```
Z-order (back to front):

z-0:  Radial gradient background (CSS)
z-0:  layerBlur — 35rem elliptical glow, 90px blur, -30deg rotation
z-0:  gradient.png — grid pattern overlay at 70% opacity
z-10: SplineViewer — interactive 3D model (right 65%, overflow top/bottom)
z-20: Text content — badge, heading, description, CTA buttons
```

The radial background creates a dark, cinematic base. The blurred glow and grid image add depth behind the 3D model. Text sits above everything.

---

## 8. How the Layout & Fonts Work

**Root layout** wraps all pages:
```
<html>
  <body class="--font-geist-sans --font-geist-mono --font-outfit antialiased">
    {children}   ← page.js content goes here
  </body>
</html>
```

**Font loading** via `next/font`:
- Geist Sans and Geist Mono: loaded from local `.woff` files (no network request)
- Outfit: loaded from Google Fonts with automatic subsetting (only chars used are downloaded)
- All three injected as CSS variables, available everywhere

---

## 9. Customization Guide

### Swap the 3D model
1. Open the scene in [Spline](https://spline.design)
2. Edit the model, lighting, camera, etc.
3. Publish and get the new `.splinecode` URL
4. Update `SplineViewer/index.jsx`:
   ```jsx
   scene="https://prod.spline.design/YOUR_NEW_SCENE/scene.splinecode"
   ```

### Change the background
In `Hero3DSection/index.jsx`, edit the radial gradient:
```jsx
bg-[radial-gradient(ellipse_at_center,#050507_0%,#020203_55%,#000000_100%)]
```

### Change the glow effect
In `Hero3DSection.module.css`:
```css
.layerBlur {
  width: 35rem;      /* size of the glow */
  height: 20rem;
  filter: blur(90px); /* blur amount */
  rotate: -30deg;     /* rotation angle */
  /* edit the radial-gradient for color/opacity */
}
```

### Change the badge color
In `Hero3DSection/index.jsx`:
```jsx
border-[#a855f7]/60           /* border color + opacity */
shadow-[0_0_18px_rgba(...)]   /* glow shadow */
text-[#d8b4fe]                /* text color */
```

### Add more sections below the hero
In `page.js`, add components after `<Hero3DSection />`:
```jsx
export default function HomePage() {
  return (
    <>
      <Hero3DSection />
      <FeaturesSection />
      <PricingSection />
    </>
  );
}
```

---

## Summary

The root route is built with:
- **1 npm package** for 3D: `@splinetool/react-spline` (no Three.js code)
- **3 component files**: page.js, Hero3DSection/index.jsx, SplineViewer/index.jsx
- **1 CSS module**: Hero3DSection.module.css (gradient blur)
- **1 remote 3D asset**: `.splinecode` file on Spline CDN
- **Zero animations** — static layout, 3D interactivity handled by Spline runtime
- **Minimal JS** — only SplineViewer ships to the client; Hero3DSection is server-rendered
