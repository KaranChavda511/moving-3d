### Focused prompt for “Chocolate” scroll animation

You can paste and adapt this directly:

---

**One-Shot Prompt – Dutch Chocolate Scroll Animation**

Role:  
You are a senior Frontend Creative Developer specializing in smooth scroll‑driven animations for premium product websites.

Objective:  
Implement a **single scroll section** that showcases the **"Dutch Chocolate"** flavor with a buttery smooth **on‑scroll bottle animation** and text reveals. This is a **self-contained feature**, not a full site.

Tech stack (assume these are already set up):  
- Next.js App Router (React 18+), JavaScript  
- Tailwind CSS  
- Framer Motion  
- HTML5 `<canvas>` for image sequence

---

### Requirements

1. **Component & API**

Create a React client component, e.g. `ChocolateScrollExperience.tsx`, that I can drop into any page. It should:

- Be fully self-contained (no external state).
- Accept optional props:
  - `folderPath` (default: `"/images/chocolate"`).
  - `frameCount` (default: `120`).
- Internally handle all scroll logic and rendering.

---

2. **Layout & Structure**

Inside the component:

- Outer wrapper: `div` with large scroll height, e.g. `h-[500vh]`.
- Inside it, a `sticky` container: `div` with `sticky top-0 h-screen`.
- Inside the sticky container:
  - A full‑size `<canvas ref={canvasRef} />` centered and scaled with **contain** behavior.
  - Overlay text block(s) positioned above the canvas using absolute/flex layout.

Use Tailwind for layout/styling.

---

3. **Canvas Image Sequence (Bottle Animation)**

- Load a sequence of `frameCount` `.webp` images, named `1.webp` to `frameCount.webp`, from `folderPath`.
- Use `Framer Motion`’s `useScroll` + `useTransform` with a `ref` to the **outer wrapper**.
- Map `scrollYProgress` (0 → 1) to a frame index:
  - `frameIndex = Math.floor(scrollYProgress * (frameCount - 1))`.
- Use `requestAnimationFrame` to draw the current frame to the canvas:
  - Handle `devicePixelRatio` for retina.
  - Resize canvas on window resize; keep aspect ratio and center the image (`contain`).
  - Avoid unnecessary re-draws (only when frame index or size changes).

---

4. **Chocolate Copy & Text Animation**

Overlay copy should be specific to Dutch Chocolate and animated by scroll:

Use this content:

- Section 1: title `"Dutch Chocolate."`, subtitle `"Velvety smooth."`
- Section 2: title `"Decadence redefined."`, subtitle `"Rich, dark cocoa blended with creamy almond milk for a guilt-free treat."`
- Section 3: title `"Plant-powered energy."`, subtitle `"Loaded with natural plant protein to fuel your active lifestyle."`
- Section 4: title `"Indulgence without compromise."`, subtitle `""`

Behavior:

- Each section should **fade in and out** based on `scrollYProgress`, for example:
  - Section 1 visible ~ `0.0 – 0.25`
  - Section 2 visible ~ `0.25 – 0.5`
  - Section 3 visible ~ `0.5 – 0.75`
  - Section 4 visible ~ `0.75 – 1.0`
- Use `useTransform(scrollYProgress, [...], [...])` to drive:
  - `opacity`
  - `y` (slight up/down translation)
- Typography:
  - Big, bold, premium feel.
  - Use a deep chocolate color palette (browns, warm neutrals) and a subtle background gradient.

---

5. **Styling & Polish**

- Background: chocolate‑themed gradient (e.g. `from-[#5D4037] via-[#3E2723] to-black`).
- Use Tailwind classes for:
  - Centering canvas and text.
  - Responsive spacing for mobile and desktop.
- Micro‑interactions:
  - Slight parallax / `y` motion on text.
  - Smooth easing (`easeOut`, `easeInOut`).

---

6. **Output Requirements**

- Provide the **complete component code** for `ChocolateScrollExperience.tsx` as a Next.js **client component** (`"use client"` at top).
- Use **only JavaScript** for the component (no TypeScript types in this file).
- Make sure imports are correct for:
  - `useRef`, `useEffect`, `useState`
  - `useScroll`, `useTransform`, `motion` from `framer-motion`
- Code must be **copy‑paste runnable** inside a standard Next.js App Router project with Tailwind and Framer Motion already configured.

---

If you want, you can also show a minimal usage example like:

```jsx
export default function Page() {
  return <ChocolateScrollExperience />;
}
```