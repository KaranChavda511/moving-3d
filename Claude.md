# Moving-3d Frontend

Welcome to the Frontend project! This guide outlines our development standards, best practices, and architectural rules to ensure a high-performance, maintainable codebase.


## 🚀 Best Practices & Architecture

### 1. Server vs. Client Components

We strictly follow the **Next.js App Router** architecture. Our goal is to **maximize Server Components** for performance and SEO.

#### **Folder Structure Rule**

- **Sections (`src/sections/`)**: files inside these folders (e.g., `HeroSection/index.jsx`) **MUST** be Server Components by default.
  - They act as "containers" that fetch data (if needed) and layout the page.
  - They import reusable UI components (which can be Server or Client).
  - Do **NOT** make a section a Client Component unless absolutely necessary (e.g., it requires global state or complex interactivity).

#### **When to use Client Components**

Use `"use client"` **ONLY** when you need:

- Event listeners (`onClick`, `onChange`, `useEffect`).
- React Hooks (`useState`, `useReducer`, `useRef`).
- Browser-only APIs (`localStorage`, `window`, etc.).

### 2. Animations with Motion (Framer Motion)

We use **Motion (formerly Framer Motion)** for animations. The import syntax changes depending on where you use it.

| Component Type       | Import Syntax                                   | Why?                                                                                                    |
| :------------------- | :---------------------------------------------- | :------------------------------------------------------------------------------------------------------ |
| **Server Component** | `import * as motion from "motion/react-client"` | Allows basic animations (fade-in, scroll) without hydrating the component on the client. **Preferred.** |
| **Client Component** | `import { motion } from "motion/react"`         | Unlocks full interactivity: gestures, layout animations, exit transitions, and event callbacks.         |

**Example (Server Component - Preferred):**

```javascript
// src/components/MyCard.jsx
import * as motion from "motion/react-client"; // <--- No "use client" needed!

export default function MyCard() {
  return (
    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
      <h1>I am rendered on the Server!</h1>
    </motion.div>
  );
}
```

**Example (Client Component):**

```javascript
"use client"; // <--- Required
import { motion } from "motion/react";
import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <motion.button whileTap={{ scale: 0.9 }} onClick={() => setCount((c) => c + 1)}>
      Clicked {count} times
    </motion.button>
  );
}
```

### 3. Image Optimization

- Always use `next/image` instead of `<img>`.
- For local images, import them directly if possible, or define `width` and `height`.
- For fill images, use `fill` with `sizes` prop.

### 4. React Compiler

- We use the **React Compiler** (enabled in `next.config.mjs`).
- **Do NOT** manually use `useMemo` or `useCallback` for performance optimizations. The compiler handles this automatically.
- Write simple, idiomatic React code.

### 5. WebGL & Three.js (React Three Fiber)

- **One WebGL context per page.** Mobile GPUs typically support only a single active WebGL context. Having multiple `<Canvas>` instances on the same page will cause `"WebGL context could not be created"` errors and crash all 3D content.
- **Lazy-mount additional canvases.** If a page needs more than one 3D scene (e.g., a flight experience + an astronaut viewer), use `IntersectionObserver` to only mount the second `<Canvas>` when it scrolls into view. Pass an `active` prop to conditionally render the Canvas.
- **Handle context loss gracefully.** Always listen for `webglcontextlost` on the canvas element and show a static fallback instead of letting the page crash.
- **Cap pixel ratio.** Use `dpr={[1, 1.5]}` on `<Canvas>` to prevent mobile devices from rendering at 3x, which wastes GPU memory.
- **Use `powerPreference: 'high-performance'`** in the `gl` prop to hint the browser to use the discrete GPU when available.
- **Tree-shake Three.js imports.** Use named imports (`import { Vector3 } from 'three'`) instead of `import * as THREE from 'three'`.

---

## 📦 Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components
│   ├── UI/              # Generic atoms (Buttons, Inputs)
│   └── ...              # Complex components (Marquees, Cards)
├── sections/            # Page Sections (Server Components Container)
│   ├── HeroSection/     # Each section has its own folder
│   │   └── index.jsx    # Main entry (Server Component)
│   └── ...
└── ...
```
