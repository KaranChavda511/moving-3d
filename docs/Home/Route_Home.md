# Home Route (`/`) — Technical Overview

---

## Project Structure

| File | Purpose |
|------|---------|
| `page.js` | Next.js route entry point (server component, renders Hero3DSection) |
| `layout.js` | Root layout — fonts, metadata, global CSS |
| `globals.css` | Global styles — theme variables, utility classes, animations |
| `Hero3DSection/index.jsx` | Hero section — Spline 3D viewer + marketing copy |
| `Hero3DSection.module.css` | CSS module — gradient blur effect |
| `SplineViewer/index.jsx` | Wrapper for `@splinetool/react-spline` (`use client`) |

**Image Assets:**

| Asset | Purpose |
|-------|---------|
| `src/assets/images/gradient.png` | Gradient grid overlay image (right side) |

---

## Packages Used & Why

| Package | Why |
|---------|-----|
| `@splinetool/react-spline` | Renders a remotely-hosted Spline 3D scene (interactive 3D model) without any Three.js setup. |
| `next` | App Router, `next/font/google` for font optimization, `next/image` for gradient overlay. |
| `tailwindcss` | Utility CSS for layout, responsive design, color system. |

**Not used on this route:** `three`, `@react-three/fiber`, `motion` — the home page has no scroll animations or custom 3D. The Spline viewer handles everything 3D.

---

## How the Page Works

A marketing landing page for an "Email for Developers" product. The hero section shows a Spline 3D model on the right and CTA text on the left.

```
┌────────────────────────────────────────────────────┐
│                                                    │
│   INTRUCING Δ                    ┌────────────┐    │
│                                  │             │    │
│   EMAIL FOR                      │   Spline    │    │
│   DEVELOPERS                     │   3D Model  │    │
│                                  │   (65% w)   │    │
│   the best way to reach          │             │    │
│   humans instead of spam...      └────────────┘    │
│                                                    │
│   [Documentation >]  [Get started >]               │
│                                                    │
│                             ░░░ gradient blur ░░░  │
└────────────────────────────────────────────────────┘
```

- **Desktop**: Side-by-side — text left (50%), 3D right (65%, overflows)
- **Mobile**: 3D viewer hidden (`hidden md:block`), text only

---

## How the Spline 3D Model Works

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

- **`"use client"`** — Spline needs browser APIs (WebGL canvas)
- Loads a **remotely-hosted** `.splinecode` file from Spline's CDN
- The 3D scene is authored in the [Spline](https://spline.design) editor — not coded manually
- Provides built-in interactivity (hover, drag, etc.) handled by the Spline runtime
- Positioned absolutely: `right-0 top-[-10%] w-[65%] h-[120%]` — overflows the container for dramatic effect

---

## How the Hero Section Works

**File:** `src/sections/HomePage/Hero3DSection/index.jsx`

**Background:** Radial gradient from near-black center to pure black edges:
```
bg-[radial-gradient(ellipse_at_center,#050507_0%,#020203_55%,#000000_100%)]
```

**Left side — text content:**
- Purple badge: "INTRUCING Δ" with `border-[#a855f7]/60` and purple glow shadow
- H1: "EMAIL FOR DEVELOPERS" — uppercase, responsive (4xl → 6xl → 64px)
- Description text in `#8a8a8a`
- Two CTA buttons:
  - "Documentation >" — dark with purple text (`#c084fc`)
  - "Get started >" — white with black text

**Right side — 3D + gradient layers:**

| Layer | Z-Index | Content |
|-------|---------|---------|
| Gradient blur blob | z-0 | CSS `layerBlur` class — 35rem × 20rem radial gradient, 90px blur, -30deg rotation |
| Gradient image | z-0 | `gradient.png` at 70% opacity via `next/image` |
| Spline 3D viewer | z-10 | Interactive 3D model |
| Text content | z-20 | Left-side copy + buttons |

---

## How the Gradient Blur Works

**File:** `Hero3DSection.module.css`

```css
.layerBlur {
  position: absolute;
  top: 0;
  right: 0;
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
  pointer-events: none;
}
```

A large, heavily blurred elliptical gradient creates a soft white glow behind the 3D model. The `-30deg` rotation adds visual interest.

---

## Root Layout

**File:** `src/app/layout.js`

- **Metadata**: `title: "Moving 3D"`
- **Fonts** (via `next/font/google`):
  - `Geist` — sans-serif, CSS var `--font-geist-sans`
  - `Geist_Mono` — monospace, CSS var `--font-geist-mono`
  - `Outfit` — display font (weights 300–900), CSS var `--font-outfit`
- **Body**: `antialiased` class, all font variables applied
- **Global CSS**: imports `globals.css`

---

## Global CSS Highlights

**File:** `src/app/globals.css`

**Theme variables** (Tailwind v4 `@theme`):
- Colors: primary (`#335fff`), secondary (`#2c23e8`), dark/light backgrounds, accent colors
- Breakpoints: sm (640), md (768), lg (1025), xl (1280), 2xl (1536), 3xl (1791)
- Custom spacings

**Utility classes:**
- `.h1-heading`, `.h2-heading` — responsive heading sizes with `clamp()`
- `.px-wrapper`, `.pl-wrapper` — horizontal padding wrappers
- `.gradient-border-button-pulse` — animated gradient border button
- `.btn-style501` — gradient background button with background-size animation
- `.layerBlur` — 35rem × 20rem blurred gradient blob
- `.no-scrollbar` — hides scrollbars globally (Firefox, Chrome, IE)
- `.my-custom-gradient` — `linear-gradient(163deg, #2a9fff, #2c23e8)`
- `.fade-in` — 0.5s opacity + translateY animation

**Global styles:**
- `scroll-behavior: smooth` on `html`
- Scrollbar hidden globally
- Custom `::selection` colors (orange background)

---

## Performance Notes

| Technique | What it does |
|-----------|-------------|
| **Spline CDN** | 3D scene loaded from Spline's CDN — no local model files to bundle |
| **Hidden on mobile** | Spline viewer hidden below `md` breakpoint — saves GPU on mobile |
| **`next/font`** | Fonts self-hosted by Next.js with automatic subsetting — no external font requests |
| **`next/image` with `priority`** | Gradient image loaded eagerly for LCP |
| **Static export** | `output: "export"` in config — no server needed |
| **React Compiler** | `babel-plugin-react-compiler` enabled for automatic memoization |

---

## Summary

The root route is a **simple marketing landing page** with:
- **1 npm package** for 3D: `@splinetool/react-spline` (no Three.js setup needed)
- **3 files**: page.js, Hero3DSection/index.jsx, SplineViewer/index.jsx
- **1 remote asset**: Spline scene hosted on `prod.spline.design`
- **No scroll animations** — static layout with CTA buttons
- **No custom 3D code** — Spline handles model, lighting, interaction
