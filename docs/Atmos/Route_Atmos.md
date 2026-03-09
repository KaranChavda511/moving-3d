# Atmos Route — Technical Overview

---

## Project Structure

| File | Purpose |
|------|---------|
| `page.jsx` | Next.js route entry point (server component) |
| `index.jsx` | Main scroll-driven controller — Canvas, text overlays, contrail SVG |
| `AtmosExperience.jsx` | 3D flight scene — clouds, airplane, sky shader, camera |
| `AboutSection.jsx` | Interactive astronaut 3D model section |
| `AtmosSceneLoader.jsx` | Dynamic import wrapper for AtmosScene (`ssr: false`) |
| `AboutSectionLoader.jsx` | Dynamic import wrapper for AboutSection (`ssr: false`) |
| `atmos.module.css` | CSS animations — equalizer bars, letter intro, scroll hint bounce |

**3D Assets:**

| File | Size | Purpose |
|------|------|---------|
| `Airplane.glb` | 236 KB | Animated airplane flying in front of camera |
| `Cloud.glb` | 619 KB | Cloud model — loaded once, cloned 45 times |
| `astronaut.glb` | 1.36 MB | Compressed astronaut (meshopt — original was 19.5 MB) |

---

## Packages Used & Why

| Package | Why |
|---------|-----|
| `@react-three/fiber` | React renderer for Three.js — write 3D scenes as JSX components instead of imperative code. Provides `<Canvas>`, `useFrame`, `useThree`, `useLoader`. |
| `three` | The underlying 3D graphics engine (WebGL). Handles rendering, shaders, geometry, lighting, curves, quaternions. |
| `three/examples/jsm/loaders/GLTFLoader` | Loads `.glb` 3D model files (airplane, clouds, astronaut). |
| `three/examples/jsm/libs/meshopt_decoder` | Decompresses the astronaut model — compressed from 19.5 MB → 1.36 MB using meshopt. |
| `motion` (Framer Motion) | Scroll-tracking hooks (`useScroll`, `useTransform`, `useMotionValueEvent`) that drive the entire DOM animation timeline without React re-renders. |
| `next` | App Router framework. `next/dynamic` with `ssr: false` for lazy-loading WebGL components (Three.js crashes on the server). |
| `tailwindcss` | Utility CSS for layout, responsive design, z-index management, and responsive typography. |

---

## How the Scroll-Driven Animation Works

The experience uses a **600vh tall wrapper** with a **sticky viewport** inside it. The user scrolls normally — the page never moves, only the content reacts.

```
User scrolls natively
        │
        ▼
useScroll() → scrollYProgress MotionValue (0 → 1)
        │
useMotionValueEvent → scrollRef.current
(bridges MotionValue to a plain ref for Three.js)
        │
        ├─── useFrame() — runs every frame (~60fps)
        │       ├─ Camera moves along CatmullRomCurve3 flight path
        │       ├─ Sky shader updates via uProgress uniform
        │       ├─ Cloud colors lerp toward target color
        │       └─ Airplane follows camera with banking + bobbing
        │
        └─── useTransform() — Framer Motion declarative values
                ├─ Text overlays: opacity / scale / y position
                ├─ Intro title + scroll hint: opacity
                └─ Contrail SVG line: y2 (line length grows)
```

**5 text overlays** appear at specific scroll ranges, each fading smoothly in and out:

| Overlay | Scroll Range | Content |
|---------|-------------|---------|
| Welcome message | 0.06 – 0.20 | Intro paragraph |
| Fact #01 — Sky Babies | 0.22 – 0.38 | Babies born mid-flight |
| Fact #02 — Forbidden Number | 0.40 – 0.56 | No row 13 on planes |
| Fact #03 — Fast as Lightning | 0.58 – 0.74 | 575 mph cruise speed |
| Fact #04 — Flight to HEL | 0.76 – 0.92 | Flight 666 on Friday the 13th |

---

## How the Sky Works

A **custom GLSL shader** is applied to a large sphere (scale = 100) rendered from the **inside** (`THREE.BackSide`) so the camera always sees the inner surface.

The fragment shader receives `uProgress` (scroll 0–1) and `vPosition.y` (vertical gradient) and outputs a blended color:

| Scroll Range | Sky Transition |
|-------------|---------------|
| 0.0 – 0.20 | Deep blue → deeper blue |
| 0.2 – 0.40 | Blue → sunset purple |
| 0.4 – 0.65 | Purple → warm orange |
| 0.65 – 0.85 | Warm orange → pink |
| 0.85 – 1.0 | Stays deep pink |

Each phase has a `topColor` and `botColor` that blend vertically using `mix()`. The sphere also rotates slowly (`0.0001` rad/frame) for subtle ambient movement.

---

## How the Clouds Work

Clouds are **3D models** (`/models/Cloud.glb`) — not images or procedural geometry.

**Loading strategy — global cache with reference counting:**
- The `.glb` is loaded **once** and stored in a module-level variable
- Each of the 45 `CloudMesh` components clones the model and gets independent materials
- When all instances unmount, `releaseCloudModel()` disposes GPU geometry + materials

**Placement — two distance tiers:**

| Tier | Count | Distance from path | Scale range |
|------|-------|--------------------|-------------|
| Close clouds | 30 | 2.5 – 7.5 units | 1.0 – 3.5 (large, fly past these) |
| Mid-distance clouds | 15 | 8 – 20 units | 0.5 – 2.0 (smaller, fill the sky) |

- Placement uses a **seeded PRNG** (seed: 42) so positions are always identical
- Each cloud's material color **lerps** toward a target color every frame (5% blend)

**Color progression with scroll:**

```
0–0.25    White         (0.92, 0.92, 0.98)
0.25–0.45 Soft purple   (0.78, 0.72, 0.88)
0.45–0.65 Peachy rose   (0.85, 0.75, 0.78)
0.65–0.80 Warm beige    (0.92, 0.82, 0.75)
0.80+     Off-white     (0.95, 0.88, 0.85)
```

**Material settings:** `MeshStandardMaterial`, transparent, opacity `0.9`, roughness `1` (matte, non-shiny).

---

## How the Airplane Works

Loaded from `/models/Airplane.glb` via `GLTFLoader` in `useEffect`. Auto-scaled to ~1 unit using bounding box normalization.

Every frame (`useFrame`):

1. **Position** — placed 2.5 units in front of camera, 0.08 units below center
2. **Orientation** — quaternion copied from camera so it always faces forward
3. **Banking/rolling** — samples the curve 3% ahead and 3% behind; lateral delta × 0.5 = roll angle; smoothed at 3% per frame
4. **Bobbing** — `Math.sin(time * 2) * 0.08` vertical float
5. **Wobble** — `sin(time * 3.5) * 0.03` pitch, `cos(time * 4.2) * 0.03` roll

---

## How the Astronaut 3D Model Works

Located in `AboutSection.jsx`, rendered **below** the scroll-driven flight section in normal document flow.

**Model loading:**
- `/models/astronaut.glb` loaded via `useLoader(GLTFLoader, ...)` with `MeshoptDecoder`
- MeshoptDecoder decompresses the mesh at load time (19.5 MB → 1.36 MB on disk)
- Auto-scaled to 1.8 units using bounding box; centered at origin

**Idle animation (when not dragging):**
- Y-axis auto-rotation: `rotY += delta * 0.25` rad/frame
- X-rotation eases back to 0: `rotX += (0 - rotX) * delta * 1.5`
- Vertical bobbing: `Math.sin(t * 0.6) * 0.08`

**Drag-to-rotate:**
- Pointer + touch events tracked on the canvas container div
- Sensitivity: `0.008` radians per pixel of movement
- X-rotation clamped to `±π/2.2` to prevent flipping upside down
- Delta is accumulated and consumed each frame to avoid double-counting

**Performance — conditional canvas mount:**
- `IntersectionObserver` with `200px rootMargin` delays Canvas mount until section is near viewport
- Prevents wasting GPU resources on a hidden section
- WebGL context loss handled gracefully: shows "3D preview unavailable on this device"

**Display:** Shown inside a fake tablet mockup — dark gradient frame, camera notch, home indicator bar. Responsive: side-by-side on tablet+, stacked on mobile.

---

## Sky Panorama — No Images

There are **no panoramic images**. The sky effect is entirely the GLSL shader sphere. As the camera moves along the 3D curve and the sky colors transition, it creates the illusion of flying through changing atmosphere — from daytime blue to a warm sunset.

---

## Performance Optimizations

| Technique | What it does |
|-----------|-------------|
| **Meshopt compression** | Astronaut model 19.5 MB → 1.36 MB on disk |
| **Cloud model caching** | `Cloud.glb` loaded once; cloned for all 45 instances; reference-counted GPU disposal |
| **DPR clamping** | `dpr={[1, 1.5]}` — never renders at full 2×/3× retina resolution |
| **MotionValue bridge** | `scrollRef` avoids React re-renders in Three.js loop; `useTransform` animates DOM without state |
| **SSR disabled** | `next/dynamic` + `ssr: false` — WebGL code never runs on the server |
| **Lazy canvas mount** | `IntersectionObserver` delays astronaut Canvas until section is near viewport |
| **Pre-allocated vectors** | `Vector3`, `Quaternion` objects created once and mutated in `useFrame` — zero GC pressure |
| **Imperative model add** | GLB added via `.add()` in `useEffect`, not via React state, so model load doesn't trigger re-render |
| **GPU hint** | `powerPreference: 'high-performance'` requests dedicated GPU over integrated graphics |
| **Cleanup on unmount** | Cloned cloud materials disposed; cloud cache reference-counted and freed |
