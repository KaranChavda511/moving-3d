# ATMOS - Scroll-Driven 3D Aviation Experience

## Complete Developer Guide

A full-screen, scroll-driven 3D animation where a plane flies through clouds along a curved path while the sky transitions from blue to sunset. Text facts appear and disappear as the user scrolls. Below the flight experience, an interactive 3D astronaut model lives in an About section. Built with **3 packages**: `three` + `@react-three/fiber` for 3D and `motion` (Framer Motion) for scroll-driven DOM animations.

---

## Table of Contents

1. [How It Works (Big Picture)](#1-how-it-works-big-picture)
2. [Packages Used & Why](#2-packages-used--why)
3. [File Structure](#3-file-structure)
4. [File-by-File Breakdown](#4-file-by-file-breakdown)
   - [page.jsx — Route Entry Point](#41-pagejsx--route-entry-point)
   - [AtmosSceneLoader.jsx — Dynamic Import Wrapper](#42-atmossceneloaderjsx--dynamic-import-wrapper)
   - [AboutSectionLoader.jsx — Dynamic Import Wrapper](#43-aboutsectionloaderjsx--dynamic-import-wrapper)
   - [atmos.module.css — CSS Module Animations](#44-atmosmodulecss--css-module-animations)
   - [AtmosScene/index.jsx — Scene Wrapper + Scroll Logic + DOM Overlays](#45-atmossceneindexjsx--scene-wrapper--scroll-logic--dom-overlays)
   - [AtmosScene/AtmosExperience.jsx — 3D World (Sky, Plane, Clouds, Camera)](#46-atmossceneatmosexperiencejsx--3d-world)
   - [AtmosScene/AboutSection.jsx — Interactive Astronaut 3D Model](#47-atmossceneaboutsectionjsx--interactive-astronaut-3d-model)
5. [Key Concepts Explained](#5-key-concepts-explained)
   - [What is Canvas?](#51-what-is-canvas)
   - [What is useFrame?](#52-what-is-useframe)
   - [What is useThree?](#53-what-is-usethree)
   - [What is a CatmullRomCurve3?](#54-what-is-a-catmullromcurve3)
   - [What is a ShaderMaterial / GLSL?](#55-what-is-a-shadermaterial--glsl)
   - [What is GLTFLoader?](#56-what-is-gltfloader)
   - [What is MeshoptDecoder?](#57-what-is-meshoptdecoder)
   - [What is Quaternion Slerp?](#58-what-is-quaternion-slerp)
   - [What is Lerp?](#59-what-is-lerp)
6. [How Scroll Works](#6-how-scroll-works)
7. [How the Camera Moves](#7-how-the-camera-moves)
8. [How the Airplane Works](#8-how-the-airplane-works)
9. [How the Sky Changes Color](#9-how-the-sky-changes-color)
10. [How Clouds Work](#10-how-clouds-work)
11. [How Text Overlays Work](#11-how-text-overlays-work)
12. [How the Contrail (Trail) Works](#12-how-the-contrail-trail-works)
13. [How the Astronaut Model Works](#13-how-the-astronaut-model-works)
14. [Performance Techniques](#14-performance-techniques)
15. [Customization Guide](#15-customization-guide)
16. [Common Pitfalls & React Compiler Notes](#16-common-pitfalls--react-compiler-notes)

---

## 1. How It Works (Big Picture)

```
User scrolls natively (the wrapper is 600vh tall with a sticky viewport)
        │
        ▼
scrollYProgress: 0.0 ──────────────────► 1.0   (Framer Motion useScroll)
        │
        ├── useMotionValueEvent bridges to scrollRef for Three.js
        ├── Camera moves along a 3D curved path (CatmullRomCurve3)
        ├── Airplane stays fixed in front of camera, tilts into curves
        ├── Sky color transitions: Blue → Purple → Sunset → Warm → Pink
        ├── Cloud colors tint to match the sky
        ├── Text facts fade in/out via useTransform (opacity/scale/y)
        └── SVG contrail line grows downward (motion.line)
```

The entire flight experience is driven by a single MotionValue: `scrollYProgress` (0 to 1). Every visual element reads this value and reacts to it. Below the flight section, the AboutSection renders an interactive 3D astronaut in a tablet mockup.

---

## 2. Packages Used & Why

| Package | What It Does | Why We Need It |
|---------|-------------|----------------|
| `three` | The 3D engine (WebGL). Provides Vector3, Quaternion, CatmullRomCurve3, ShaderMaterial, GLTFLoader, MeshoptDecoder, etc. | **Core 3D math and rendering engine.** Everything 3D depends on this. |
| `@react-three/fiber` | React renderer for Three.js. Lets you write Three.js scenes using JSX (`<mesh>`, `<sphereGeometry>`, etc.) instead of imperative code. | **Bridges React and Three.js.** Provides `<Canvas>`, `useFrame` (animation loop), `useThree` (camera access), `useLoader`. |
| `motion` | Framer Motion for React. Provides `useScroll`, `useTransform`, `useMotionValueEvent`, and `motion.*` animated components. | **Scroll-driven DOM animations.** Tracks native scroll progress and creates derived opacity/scale/position values for text overlays, intro, contrail. |

### What We Don't Use (and why)

| Not Used | What It Would Do | Why We Skipped It |
|----------|-----------------|-------------------|
| `@react-three/drei` | Helper components (Float, useGLTF, Clouds, Sky, etc.) | Replaced with manual code: sin-wave bobbing, direct GLTFLoader, Cloud.glb models, GLSL sky shader. Fewer deps = smaller bundle. |
| `gsap` | Animation library | Framer Motion's `useTransform` handles all DOM animations declaratively. |
| `@react-three/postprocessing` | Bloom, vignette, etc. | Crashed WebGL context with React 19. Not needed for this effect. |

---

## 3. File Structure

```
src/
├── app/
│   └── atmos/
│       └── page.jsx                    ← Route entry point (Next.js, server component)
├── components/
│   └── AtmosScene/
│       ├── index.jsx                   ← Canvas + scroll logic + DOM overlays
│       ├── AtmosExperience.jsx         ← 3D scene (sky, plane, clouds, camera)
│       ├── AboutSection.jsx            ← Interactive 3D astronaut model section
│       ├── AtmosSceneLoader.jsx        ← Dynamic import wrapper (ssr: false)
│       ├── AboutSectionLoader.jsx      ← Dynamic import wrapper (ssr: false)
│       └── atmos.module.css            ← CSS animations (equalizer, letter intro, bounce)
public/
└── models/
    ├── Airplane.glb                    ← 3D airplane model (236KB)
    ├── Cloud.glb                       ← 3D cloud model (619KB)
    ├── astronaut.glb                   ← Compressed astronaut model (1.36MB, meshopt)
    └── astronaut-original.glb          ← Original astronaut model (19.5MB, backup)
```

---

## 4. File-by-File Breakdown

### 4.1. `page.jsx` — Route Entry Point

**File:** `src/app/atmos/page.jsx`

```jsx
import AtmosSceneLoader from '@/components/AtmosScene/AtmosSceneLoader';
import AboutSectionLoader from '@/components/AtmosScene/AboutSectionLoader';

export const metadata = {
  title: 'ATMOS — Aviation Facts Experience',
  description:
    'An immersive scroll-driven 3D flight experience through the clouds, featuring fascinating aviation facts.',
};

export default function AtmosPage() {
  return (
    <main>
      <AtmosSceneLoader />
      <AboutSectionLoader />
    </main>
  );
}
```

**What each line does:**

| Code | Purpose |
|------|---------|
| No `'use client'` | This is a **server component** — only the loader children are client components |
| `export const metadata` | Next.js page metadata for SEO (title, description) |
| `<AtmosSceneLoader />` | Dynamically imports the 3D flight scene with `ssr: false` |
| `<AboutSectionLoader />` | Dynamically imports the astronaut About section with `ssr: false` |
| `<main>` wrapping | Sections stack naturally in normal document flow |

---

### 4.2. `AtmosSceneLoader.jsx` — Dynamic Import Wrapper

**File:** `src/components/AtmosScene/AtmosSceneLoader.jsx`

```jsx
'use client';

import dynamic from 'next/dynamic';

const AtmosScene = dynamic(() => import('@/components/AtmosScene'), {
  ssr: false,
  loading: () => (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse text-2xl text-white">
      Loading Experience...
    </div>
  ),
});

export default function AtmosSceneLoader() {
  return <AtmosScene />;
}
```

**Why a separate loader?** The `'use client'` + `dynamic()` call must happen in a client component, but `page.jsx` is a server component (to support `export const metadata`). Extracting the dynamic import into a loader keeps the page clean.

**Why `ssr: false`?** Three.js tries to access `window`, `document`, and WebGL APIs that don't exist on the server. Without `ssr: false`, the build would crash.

---

### 4.3. `AboutSectionLoader.jsx` — Dynamic Import Wrapper

**File:** `src/components/AtmosScene/AboutSectionLoader.jsx`

```jsx
'use client';

import dynamic from 'next/dynamic';

const AboutSection = dynamic(() => import('@/components/AtmosScene/AboutSection'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-[#eef0f4]" />,
});

export default function AboutSectionLoader() {
  return <AboutSection />;
}
```

Same pattern as `AtmosSceneLoader`. The loading fallback renders a placeholder div matching the section's background color.

---

### 4.4. `atmos.module.css` — CSS Module Animations

**File:** `src/components/AtmosScene/atmos.module.css`

```css
/* Equalizer bar bounce */
.eqBar {
  animation: eqBounce 0.8s ease-in-out infinite alternate;
}

@keyframes eqBounce {
  0%   { transform: scaleY(0.3); }
  100% { transform: scaleY(1); }
}

/* Intro letter fade-in */
.introLetter {
  display: inline-block;
  animation: fadeInLetter 0.8s ease-out backwards;
}

@keyframes fadeInLetter {
  from { opacity: 0; transform: translateY(-30px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Scroll hint bounce */
.scrollHint {
  animation: bounceHint 2s ease-in-out infinite;
}

@keyframes bounceHint {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50%      { transform: translateX(-50%) translateY(-15px); }
}

/* Loading pulse */
.loading {
  animation: pulse 2s ease-in-out infinite;
}
```

This is a **CSS Module** (`.module.css`), so class names are locally scoped and imported as `styles.eqBar`, `styles.introLetter`, etc. All layout and positioning uses Tailwind utility classes inline.

---

### 4.5. `AtmosScene/index.jsx` — Scene Wrapper + Scroll Logic + DOM Overlays

**File:** `src/components/AtmosScene/index.jsx`

This file handles everything that is **NOT 3D**: scroll tracking, text overlays, the header, the contrail SVG, and the Canvas wrapper.

#### Imports

```jsx
import { Canvas } from '@react-three/fiber';
import { useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'motion/react';
import AtmosExperience from './AtmosExperience';
import styles from './atmos.module.css';
```

| Import | From | Purpose |
|--------|------|---------|
| `Canvas` | @react-three/fiber | Creates the WebGL `<canvas>` element and 3D scene |
| `useRef` | React | Mutable ref to bridge MotionValue → Three.js |
| `useScroll` | motion/react | Tracks native scroll progress of the wrapper element |
| `useTransform` | motion/react | Creates derived MotionValues (opacity, scale, y) from scroll progress |
| `useMotionValueEvent` | motion/react | Subscribes to MotionValue changes without re-renders |
| `motion` | motion/react | Animated component wrappers (`motion.div`, `motion.line`) |
| `styles` | CSS Module | Locally-scoped animation classes |

#### Scroll Setup

```jsx
const wrapperRef = useRef(null);
// scrollYProgress: 0 at top of wrapper, 1 at bottom — driven by native scroll
const { scrollYProgress } = useScroll({
  target: wrapperRef,
  offset: ['start start', 'end end'],
});

// Bridge MotionValue → plain number ref for Three.js useFrame
const scrollRef = useRef(0);
useMotionValueEvent(scrollYProgress, 'change', (v) => {
  scrollRef.current = v;
});
```

**Why `useMotionValueEvent`?** MotionValues don't trigger React re-renders (they're external to React state). `useMotionValueEvent` lets us subscribe to changes and write the value to a plain ref that Three.js `useFrame` can read every frame — no re-renders needed.

#### Derived Animations

```jsx
// Intro/hint visibility — fade out as user starts scrolling
const introOpacity = useTransform(scrollYProgress, [0, 0.02], [1, 0]);
const hintOpacity = useTransform(scrollYProgress, [0, 0.015], [1, 0]);

// Contrail line length — grows from y=48 to y=100 as user scrolls
const trailY2 = useTransform(scrollYProgress, [0, 1], [48, 100]);
```

`useTransform` maps an input MotionValue to an output range. For example, `introOpacity` is 1 when scroll is 0 and fades to 0 by the time scroll reaches 0.02.

#### TextOverlay Component

```jsx
function TextOverlay({ text, start, end, scrollYProgress }) {
  const opacity = useTransform(
    scrollYProgress,
    [start, start + 0.03, end - 0.03, end],
    [0, 1, 1, 0]
  );
  const scale = useTransform(
    scrollYProgress,
    [start, start + 0.03, end - 0.03, end],
    [0.85, 1, 1, 1.1]
  );
  const y = useTransform(
    scrollYProgress,
    [start, start + 0.03, end - 0.03, end],
    [30, 0, 0, -20]
  );

  return (
    <motion.div style={{ opacity, scale, y, ... }}>
      {/* text content */}
    </motion.div>
  );
}
```

Each text overlay has a `start` and `end` scroll range. The 4-keyframe pattern creates:
- **Fade in** (start → start+0.03): opacity 0→1, scale 0.85→1, y 30→0
- **Visible** (start+0.03 → end-0.03): fully visible, stationary
- **Fade out** (end-0.03 → end): opacity 1→0, scale 1→1.1, y 0→-20

#### Text Content Array

```jsx
const textContent = [
  {
    start: 0.06, end: 0.2,
    sup: null, title: null,
    body: 'Hello passengers and welcome aboard...',
    isIntroText: true, side: 'right',
  },
  {
    start: 0.22, end: 0.38,
    sup: 'Fact #01', title: 'SKY\nBABIES',
    body: 'Apart from a crash, the worst nightmare...',
    side: 'right',
  },
  // ... 3 more facts at ranges 0.40-0.56, 0.58-0.74, 0.76-0.92
];
```

#### The Canvas

```jsx
<Canvas
  className="absolute! inset-0 z-0 h-full w-full"
  camera={{ position: [0, 0, 0], fov: 75 }}
  gl={{ antialias: true, powerPreference: 'high-performance' }}
  dpr={[1, 1.5]}
  onCreated={({ gl }) => {
    gl.setClearColor('#1a2fa0');
  }}
>
  <AtmosExperience scrollRef={scrollRef} />
</Canvas>
```

| Prop | What It Does |
|------|-------------|
| `camera={{ position: [0, 0, 0], fov: 75 }}` | Initial camera at origin, 75° field of view (wide angle) |
| `gl={{ antialias: true, powerPreference: 'high-performance' }}` | Smooth edges + request dedicated GPU |
| `dpr={[1, 1.5]}` | Clamp device pixel ratio (avoids rendering at full 2x/3x retina) |
| `onCreated={...setClearColor}` | Sets background color before first render (matches sky blue) |
| `scrollRef={scrollRef}` | Passes the scroll ref into the 3D world (not React state — avoids re-renders) |

#### The Contrail SVG

```jsx
<svg className="pointer-events-none absolute inset-0 z-8 h-full w-full"
     viewBox="0 0 100 100" preserveAspectRatio="none">
  <defs>
    <linearGradient id="trailGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="white" stopOpacity="0.9" />
      <stop offset="60%" stopColor="white" stopOpacity="0.5" />
      <stop offset="100%" stopColor="white" stopOpacity="0" />
    </linearGradient>
  </defs>
  <motion.line
    x1="50" y1="48"
    x2="50" y2={trailY2}
    stroke="url(#trailGrad)" strokeWidth="0.6"
  />
</svg>
```

Uses `motion.line` so the `y2` attribute is animated by the `trailY2` MotionValue without React re-renders. The gradient fades from white to transparent, creating a vapor trail effect.

---

### 4.6. `AtmosScene/AtmosExperience.jsx` — 3D World

**File:** `src/components/AtmosScene/AtmosExperience.jsx`

This file contains all 3D logic: sky, clouds, airplane, camera movement.

#### Imports

```jsx
import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  BackSide, Box3, CatmullRomCurve3, Color,
  PerspectiveCamera, Quaternion, Vector3,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
```

| Import | From | Purpose |
|--------|------|---------|
| `useRef, useEffect` | React | Mutable refs and model loading on mount |
| `useFrame` | @react-three/fiber | Runs a callback every frame (~60fps) — the 3D animation loop |
| `useThree` | @react-three/fiber | Access the camera object |
| `BackSide, Box3, ...` | three | Individual Three.js classes (tree-shakeable, smaller than `import * as THREE`) |
| `GLTFLoader` | three/examples | Loads `.glb`/`.gltf` 3D model files |

#### Seeded Random Number Generator

```jsx
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
```

**Why not `Math.random()`?** The React Compiler forbids `Math.random()` inside render because it's not pure (returns different values each call). A seeded PRNG with the same seed (42) always produces the same sequence, so cloud positions are deterministic.

#### Sky Component

The sky is a huge sphere (scale=100) with the camera inside it. It uses a custom GLSL shader that transitions through 5 color phases based on scroll progress:

```
Phase 1: 0.0 – 0.2  → Blue to Deeper Blue
Phase 2: 0.2 – 0.4  → Blue to Sunset Purple
Phase 3: 0.4 – 0.65 → Purple to Warm Orange
Phase 4: 0.65 – 0.85 → Orange to Pink
Phase 5: 0.85 – 1.0  → Stays Pink
```

Each phase has a `topColor` and `botColor`. The shader interpolates vertically between them using the sphere's Y position, creating a sky gradient. The sphere rotates slowly (0.0001 rad/frame) for subtle movement.

Key detail: `side={BackSide}` — renders the inside of the sphere (since the camera is inside it).

**Uniforms:**
- `uProgress` — scroll progress (0–1), controls which color phase is active
- `uTime` — elapsed time from `state.clock.elapsedTime` (available for future effects)

#### Cloud Model Caching System

Clouds use **3D `.glb` models** (not procedural spheres). The model is loaded once and cloned for each instance using a module-level cache with reference counting:

```jsx
let _cloudModelCache = null;
let _cloudModelLoading = false;
const _cloudModelCallbacks = [];
let _cloudModelRefCount = 0;

function loadCloudModel(callback) {
  _cloudModelRefCount++;
  if (_cloudModelCache) {
    callback(_cloudModelCache);
    return;
  }
  _cloudModelCallbacks.push(callback);
  if (_cloudModelLoading) return;
  _cloudModelLoading = true;
  const loader = new GLTFLoader();
  loader.load('/models/Cloud.glb', (gltf) => {
    // Auto-scale to ~1 unit
    const box = new Box3().setFromObject(gltf.scene);
    // ... normalize scale ...
    _cloudModelCache = gltf.scene;
    _cloudModelCallbacks.forEach((cb) => cb(gltf.scene));
    _cloudModelCallbacks.length = 0;
  });
}

function releaseCloudModel() {
  _cloudModelRefCount--;
  if (_cloudModelRefCount <= 0 && _cloudModelCache) {
    // Dispose all geometry and materials to free GPU memory
    _cloudModelCache.traverse((child) => {
      if (child.isMesh) {
        child.geometry?.dispose();
        // ... dispose materials ...
      }
    });
    _cloudModelCache = null;
    _cloudModelLoading = false;
  }
}
```

**Why reference counting?** 45 CloudMesh components each call `loadCloudModel()`. The first call triggers the actual HTTP request; the rest get the cached model instantly. When all CloudMesh components unmount, `releaseCloudModel()` counts down to zero and disposes GPU resources.

#### CloudMesh Component

```jsx
function CloudMesh({ position, scale = 1, scrollRef }) {
  const groupRef = useRef();
  const materialsRef = useRef([]);
  const targetColor = new Color();

  const getCloudColor = (progress) => {
    if (progress < 0.25) return targetColor.setRGB(0.92, 0.92, 0.98);  // white
    if (progress < 0.45) return targetColor.setRGB(0.78, 0.72, 0.88);  // soft purple
    if (progress < 0.65) return targetColor.setRGB(0.85, 0.75, 0.78);  // peachy rose
    if (progress < 0.80) return targetColor.setRGB(0.92, 0.82, 0.75);  // warm beige
    return targetColor.setRGB(0.95, 0.88, 0.85);                       // off-white
  };

  useEffect(() => {
    loadCloudModel((original) => {
      const clone = original.clone(true);
      // Clone materials so each cloud can tint independently
      clone.traverse((child) => {
        if (child.isMesh) {
          child.material = child.material.clone();
          child.material.transparent = true;
          child.material.opacity = 0.9;
          child.material.roughness = 1;
          materialsRef.current.push(child.material);
        }
      });
      groupRef.current.add(clone);
    });
    return () => {
      // Cleanup: dispose cloned materials, release cached model
      materialsRef.current.forEach((mat) => mat.dispose());
      releaseCloudModel();
    };
  }, []);

  useFrame(() => {
    const color = getCloudColor(scrollRef.current);
    materialsRef.current.forEach((mat) => {
      mat.color.lerp(color, 0.05);  // smooth 5% blend per frame
    });
  });

  return <group ref={groupRef} position={position} scale={scale} />;
}
```

#### Airplane Component

The airplane:
1. **Loads a GLB model** using Three.js `GLTFLoader` directly
2. **Auto-scales** to ~1 unit using bounding box calculation
3. **Positions in front of camera** every frame
4. **Banks/tilts into curves** based on path direction
5. **Bobs up/down** with sin-wave animation

**Model Loading (useEffect):**
```jsx
useEffect(() => {
  const container = modelContainerRef.current;
  const loader = new GLTFLoader();
  loader.load('/models/Airplane.glb', (gltf) => {
    const scene = gltf.scene;
    // Calculate bounding box to auto-scale
    const box = new Box3().setFromObject(scene);
    const size = new Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const s = maxDim > 0 ? 1 / maxDim : 0.01;
    scene.scale.set(s, s, s);
    scene.rotation.set(0, Math.PI, 0);  // face forward
    modelObjRef.current = scene;
    if (container) {
      container.add(scene);  // imperatively add to Three.js scene graph
    }
  });
  return () => {
    if (modelObjRef.current && container) {
      container.remove(modelObjRef.current);
    }
  };
}, []);
```

**Why imperative `container.add(scene)` instead of `<primitive object={model} />`?** The React Compiler doesn't allow reading `ref.current` during render. So we can't do `{model && <primitive object={modelRef.current} />}`. Instead, we create an empty `<group ref={modelContainerRef} />` and add the model to it imperatively via `useEffect`.

**Positioning (useFrame):**
```jsx
// Place plane 2.5 units in front of camera, 0.08 units below center
_forward.set(0, -0.08, -2.5);
_forward.applyQuaternion(camera.quaternion);  // rotate to camera's facing direction
meshRef.current.position.copy(camera.position).add(_forward);
meshRef.current.quaternion.copy(camera.quaternion);  // match camera rotation
```

**Banking/Tilt:**
```jsx
// Look at where the path is going vs where it came from
const pointAhead = curve.getPointAt(ahead);   // 3% ahead
const pointBehind = curve.getPointAt(behind); // 3% behind
const lateralDelta = pointAhead.x - pointBehind.x;  // positive = turning right

// Convert to roll angle
const targetRoll = -lateralDelta * 0.5;
currentRoll.current += (targetRoll - currentRoll.current) * 0.03;  // smooth it

// Apply roll around the forward axis (like an airplane banking)
_forwardAxis.set(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
_rollQuat.setFromAxisAngle(_forwardAxis, currentRoll.current);
meshRef.current.quaternion.premultiply(_rollQuat);
```

**Bobbing (replaces drei's Float):**
```jsx
bobOffset.current = Math.sin(time * 2) * 0.08;    // up/down at speed 2, amplitude 0.08
m.position.y = bobOffset.current;
m.rotation.x = Math.sin(time * 3.5) * 0.03;       // subtle pitch wobble
m.rotation.z = Math.cos(time * 4.2) * 0.03;       // subtle roll wobble
```

#### Main AtmosExperience Component

**Flight Path:**
```jsx
const points = [
  new Vector3(0, 0, 0),         // start
  new Vector3(0.8, 0.5, -10),   // slight right, up
  new Vector3(-1.5, 1.2, -20),  // swing left, up
  new Vector3(1.2, 2.0, -30),
  new Vector3(-0.8, 1.5, -40),
  new Vector3(2.0, 2.5, -50),
  new Vector3(-1.2, 2.0, -60),
  new Vector3(0.6, 3.0, -70),
  new Vector3(-1.5, 2.5, -80),
  new Vector3(0.3, 3.5, -90),
  new Vector3(1.0, 2.8, -100),  // end
];
const curve = new CatmullRomCurve3(points);
```

11 control points define a smooth path 100 units long. The path snakes left/right (X) and gradually ascends (Y) while moving forward (Z). `CatmullRomCurve3` creates a smooth curve that passes through every point.

**Cloud Generation (Two Tiers):**
```jsx
const rng = seededRandom(42);
const clouds = [];

// Close clouds — 30 instances, 2.5–7.5 units from path, scale 1.0–3.5
for (let i = 0; i < 30; i++) {
  const t = i / 30;
  const pointOnPath = curve.getPointAt(t);
  const side = rng() > 0.5 ? 1 : -1;
  const dist = 2.5 + rng() * 5;
  // ... push to clouds array
}

// Mid-distance clouds — 15 instances, 8–20 units from path, scale 0.5–2.0
for (let i = 0; i < 15; i++) {
  const t = i / 15;
  const pointOnPath = curve.getPointAt(t);
  const side = rng() > 0.5 ? 1 : -1;
  const dist = 8 + rng() * 12;
  // ... push to clouds array
}
```

45 total clouds split into two distance tiers: 30 close (you fly past these) and 15 mid-distance (fill the sky). Each tier has different scale ranges and distances from the path.

**Camera Movement:**
```jsx
useFrame(() => {
  const progress = Math.max(0, Math.min(1, scrollRef.current));
  const pos = curve.getPointAt(progress);
  const lookAhead = Math.min(1, progress + 0.025);
  const lookAtPos = curve.getPointAt(lookAhead);

  camera.position.lerp(pos, 0.05);              // smooth position (5% per frame)

  _tempCam.position.copy(pos);
  _tempCam.lookAt(lookAtPos);
  _targetQuat.copy(_tempCam.quaternion);
  camera.quaternion.slerp(_targetQuat, 0.05);    // smooth rotation (5% per frame)
});
```

The camera doesn't snap to positions — it lerps/slerps toward them at 5% per frame for buttery-smooth movement.

**Scene Composition:**
```jsx
return (
  <>
    <Sky scrollRef={scrollRef} />
    <ambientLight intensity={1.2} color="#ccd8ff" />
    <directionalLight position={[5, 10, -5]} intensity={1.5} color="#ffffff" />
    <hemisphereLight skyColor="#aabbff" groundColor="#ffd4b0" intensity={0.8} />
    <Airplane curve={curve} scrollRef={scrollRef} />
    {clouds.map((cloud, idx) => (
      <CloudMesh key={idx} position={cloud.position} scale={cloud.scale} scrollRef={scrollRef} />
    ))}
  </>
);
```

Three lights create the atmosphere:
- **ambientLight** — uniform base light (blue-tinted)
- **directionalLight** — sun-like light from upper-right
- **hemisphereLight** — blue from above, warm orange from below (simulates sky + ground bounce)

---

### 4.7. `AtmosScene/AboutSection.jsx` — Interactive Astronaut 3D Model

**File:** `src/components/AtmosScene/AboutSection.jsx`

This section appears below the flight experience in normal document flow. It renders an interactive 3D astronaut model inside a tablet-style mockup.

#### AstronautModel Component

```jsx
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

function AstronautModel({ dragRef }) {
  const gltf = useLoader(GLTFLoader, '/models/astronaut.glb', (loader) => {
    loader.setMeshoptDecoder(MeshoptDecoder);
  });

  // Auto-scale to 1.8 units using bounding box
  const box = new Box3().setFromObject(gltf.scene);
  const size = new Vector3();
  const center = new Vector3();
  box.getSize(size);
  box.getCenter(center);
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = 1.8 / maxDim;
  // ... center offsets calculated from bounding box
```

Uses `useLoader` (from @react-three/fiber) instead of manual `GLTFLoader.load()` because the React Compiler allows `useLoader` in render — it's a hook, not a `ref.current` read. The `MeshoptDecoder` is needed because `astronaut.glb` was compressed with meshopt (1.36 MB vs 19.5 MB original).

#### Drag-to-Rotate Interaction

```jsx
useFrame((state, delta) => {
  const drag = dragRef.current;

  if (drag.isDragging) {
    // Calculate unconsumed delta
    const dx = drag.deltaX - consumedDrag.current.deltaX;
    const dy = drag.deltaY - consumedDrag.current.deltaY;
    consumedDrag.current.deltaX = drag.deltaX;
    consumedDrag.current.deltaY = drag.deltaY;

    rotY.current += dx * 0.008;   // sensitivity: 0.008 radians per pixel
    rotX.current += dy * 0.008;
    // Clamp X so it doesn't flip upside down
    rotX.current = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, rotX.current));
  } else {
    // Slow idle auto-rotate when not dragging
    rotY.current += delta * 0.25;
    // Ease rotX back to 0
    rotX.current += (0 - rotX.current) * delta * 1.5;
  }

  groupRef.current.rotation.y = rotY.current;
  groupRef.current.rotation.x = rotX.current;
  groupRef.current.position.y = offsetY + Math.sin(t * 0.6) * 0.08;  // gentle bobbing
});
```

The drag state is shared via a ref (`dragRef`) from the outer `AstronautCanvas` component, which attaches pointer/touch event listeners to the canvas container.

#### Conditional Canvas Mounting

```jsx
export default function AboutSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: '200px' }  // start loading 200px before visible
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef}>
      {/* Tablet mockup contains: */}
      <AstronautCanvas active={isVisible} />
      {/* Text content beside it */}
    </section>
  );
}
```

The WebGL Canvas **only mounts when the section is visible** (plus 200px margin). This prevents wasting GPU resources on a hidden section and avoids WebGL context limits on mobile.

#### WebGL Context Loss Fallback

```jsx
onCreated={({ gl }) => {
  const canvas = gl.domElement;
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    setWebglFailed(true);
  });
}}
```

If the GPU runs out of WebGL contexts (common on mobile), the component gracefully falls back to a static message: "3D preview unavailable on this device".

#### Lighting (Astronaut Scene)

```jsx
<color attach="background" args={['#000008']} />
<ambientLight intensity={0.4} color="#ccd8ff" />
<directionalLight position={[3, 5, 3]} intensity={1.8} color="#ffffff" />
<directionalLight position={[-4, -2, -3]} intensity={0.3} color="#4488ff" />
<pointLight position={[0, 3, 2]} intensity={0.6} color="#aaccff" />
```

Multiple lights from different angles create a dramatic 3D look against the near-black background.

#### Layout

- **Desktop/Tablet**: Side-by-side (`md:flex`) — tablet mockup on left (50–55% width), text on right
- **Mobile**: Stacked (`flex-col md:hidden`) — tablet mockup centered above, text below

The tablet mockup is a dark gradient rounded rectangle with a notch (camera dot) at top and a home indicator bar at bottom.

---

## 5. Key Concepts Explained

### 5.1. What is Canvas?

`<Canvas>` from `@react-three/fiber` creates a WebGL context — a `<canvas>` HTML element that can draw 3D graphics. It automatically:
- Creates a Three.js `WebGLRenderer`
- Creates a `Scene` (the 3D world)
- Creates a `Camera` (your viewpoint)
- Runs a render loop at 60fps
- Handles window resizing

Everything inside `<Canvas>` uses **3D coordinates** (x, y, z in units), not pixels. Everything outside `<Canvas>` is normal HTML.

### 5.2. What is useFrame?

```jsx
useFrame((state, delta) => {
  // This runs every frame (~60 times per second)
  // state.clock.elapsedTime = seconds since Canvas mounted
  // delta = seconds since last frame (~0.016 for 60fps)
});
```

This is the **animation loop** for 3D. You move objects, update materials, etc. here. It's like `requestAnimationFrame` but managed by React Three Fiber.

**Rules:**
- Never set React state in useFrame (causes re-renders)
- Mutate refs and Three.js objects directly
- Runs inside the Canvas context only

### 5.3. What is useThree?

```jsx
const { camera, gl, scene, viewport } = useThree();
```

Gives you access to the Three.js internals:
- `camera` — the active camera object
- `gl` — the WebGL renderer
- `scene` — the root scene
- `viewport` — screen dimensions in 3D units

### 5.4. What is a CatmullRomCurve3?

A smooth 3D curve that passes through a list of control points. Unlike a Bezier curve, it goes **through** every point (not just near them).

```jsx
const curve = new CatmullRomCurve3([
  new Vector3(0, 0, 0),
  new Vector3(1, 2, -10),
  new Vector3(-1, 3, -20),
]);

curve.getPointAt(0);    // → first point
curve.getPointAt(0.5);  // → midpoint of the curve
curve.getPointAt(1);    // → last point
```

`getPointAt(t)` returns a position on the curve where `t` is 0–1. This is how we map `scrollProgress` to a 3D position.

### 5.5. What is a ShaderMaterial / GLSL?

Shaders are tiny programs that run on the **GPU** (graphics card). They're written in GLSL (OpenGL Shading Language), not JavaScript.

Two types:
- **Vertex shader** — runs once per vertex (corner of a triangle). Positions the geometry.
- **Fragment shader** — runs once per pixel. Determines the color.

Our sky shader:
```glsl
// Fragment shader — runs for every pixel of the sphere
uniform float uProgress;  // scroll progress (sent from JavaScript)
varying vec3 vPosition;   // position on the sphere (sent from vertex shader)

void main() {
  float gradient = (vPosition.y + 1.0) * 0.5;  // 0 at bottom, 1 at top
  // ... pick colors based on uProgress ...
  vec3 skyColor = mix(botColor, topColor, gradient);  // blend top/bottom
  gl_FragColor = vec4(skyColor, 1.0);  // output RGBA
}
```

**Why use a shader?** Standard Three.js materials (MeshStandardMaterial, etc.) can't do multi-phase gradient transitions. A custom shader gives pixel-perfect control over color at every point.

### 5.6. What is GLTFLoader?

GLTF/GLB is the standard format for 3D models on the web (like JPEG for images). GLB is the binary version (single file, smaller).

```jsx
const loader = new GLTFLoader();
loader.load('/models/Airplane.glb', (gltf) => {
  const model = gltf.scene;  // Three.js Group containing meshes
  scene.add(model);          // add to the 3D scene
});
```

This project uses GLTFLoader for both the Airplane and Cloud models (loaded imperatively in `useEffect`). The astronaut model uses R3F's `useLoader(GLTFLoader, ...)` hook instead.

### 5.7. What is MeshoptDecoder?

```jsx
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

const gltf = useLoader(GLTFLoader, '/models/astronaut.glb', (loader) => {
  loader.setMeshoptDecoder(MeshoptDecoder);
});
```

Meshopt is a compression format for 3D model geometry. It dramatically reduces file sizes by encoding vertex/index data more efficiently. The astronaut model was compressed from **19.5 MB → 1.36 MB** using meshopt. The decoder runs on the client to decompress the geometry at load time.

### 5.8. What is Quaternion Slerp?

Quaternions are the math behind 3D rotations. Unlike Euler angles (pitch/yaw/roll), they don't suffer from gimbal lock.

**Slerp** = Spherical Linear Interpolation. It smoothly rotates from one orientation to another:

```jsx
camera.quaternion.slerp(targetQuaternion, 0.05);
// Moves 5% of the way toward targetQuaternion each frame
```

This creates the smooth camera turning effect.

### 5.9. What is Lerp?

**Lerp** = Linear Interpolation. Smoothly moves a value toward a target:

```jsx
const lerp = (start, end, factor) => start + (end - start) * factor;
// lerp(0, 100, 0.1) = 10  (10% of the way)
// lerp(90, 100, 0.1) = 91  (slows down as it approaches)
```

Used everywhere for smooth movement:
- Camera position: `camera.position.lerp(target, 0.05)`
- Cloud color: `material.color.lerp(newColor, 0.05)`

---

## 6. How Scroll Works

```
              NATIVE BROWSER SCROLL
              (600vh tall wrapper + sticky viewport)
                           │
                           ▼
              ┌─────────────────────────┐
              │  useScroll() hook       │  ← Framer Motion tracks scroll position
              │  scrollYProgress: 0–1   │     (MotionValue, no React re-renders)
              └──────────┬──────────────┘
                         │
              useMotionValueEvent('change')
                         │
                         ▼
              ┌─────────────────────────┐
              │  scrollRef.current      │  ← plain number, readable in useFrame
              └──────────┬──────────────┘
                         │
              ┌──────────┼──────────────┐
              ▼          ▼              ▼
           Camera     Sky Color     Clouds
           + Plane    (shader)      (color lerp)

              useTransform(scrollYProgress, ...)
                         │
              ┌──────────┼──────────────┐
              ▼          ▼              ▼
        Text Overlays  Intro/Hint   Contrail SVG
        (opacity,      (opacity)    (motion.line y2)
         scale, y)
```

**Key insight:** The scroll mechanism uses **native browser scroll** (no `preventDefault`, no custom wheel handlers). The 600vh wrapper naturally scrolls, and Framer Motion's `useScroll` tracks the progress. The `useMotionValueEvent` bridge to `scrollRef` avoids React re-renders — the 3D scene reads `scrollRef.current` directly in `useFrame`.

---

## 7. How the Camera Moves

```
  scrollProgress = 0.0                    scrollProgress = 1.0
       │                                        │
       ▼                                        ▼
    Start ──→ curve snakes left/right ──→ End
    (0,0,0)    gradually ascending     (1, 2.8, -100)

    Camera looks 2.5% ahead on the curve for direction.
    Position: lerp 5% per frame → smooth movement
    Rotation: slerp 5% per frame → smooth turning
```

---

## 8. How the Airplane Works

```
  Every frame (useFrame):

  1. Calculate position: 2.5 units in front of camera, 0.08 below
  2. Match camera rotation (faces same direction)
  3. Calculate banking:
     - Sample curve 3% ahead and 3% behind
     - Lateral delta = how much X changed = curve direction
     - Convert to roll angle, smooth it (3% per frame)
     - Apply as rotation around forward axis
  4. Apply bobbing (sin wave):
     - Y position: sin(time × 2) × 0.08
     - Pitch wobble: sin(time × 3.5) × 0.03
     - Roll wobble: cos(time × 4.2) × 0.03
```

---

## 9. How the Sky Changes Color

```
Scroll:  0.0         0.2         0.4         0.65        0.85       1.0
         │           │           │            │           │          │
Color:   Deep Blue → Blue → Sunset Purple → Warm Orange → Pink → Pink
```

Implemented as a GLSL fragment shader on a huge inside-out sphere (32×32 segments, scale=100). The shader runs on the GPU, computing color per-pixel based on:
1. `uProgress` — scroll position (which color phase)
2. `vPosition.y` — vertical position on sphere (gradient from bottom to top)

---

## 10. How Clouds Work

- **45 clouds total**: 30 close (2.5–7.5 units from path) + 15 mid-distance (8–20 units)
- Each cloud is a **Cloud.glb 3D model** clone (not procedural spheres)
- Model loaded once, cached globally, cloned with independent materials per instance
- Reference counting ensures GPU memory is freed when all instances unmount
- Positioned along the flight path with seeded random offsets (seed: 42)
- Close clouds: scale 1.0–3.5 (big, you fly past these)
- Mid-distance clouds: scale 0.5–2.0 (smaller, fill the sky)
- Colors tint to match the sky: white → purple → peachy → warm → off-white
- Color transition: `material.color.lerp(targetColor, 0.05)` per frame (smooth 5% blend)

---

## 11. How Text Overlays Work

```
                    scrollYProgress (MotionValue)
                         │
                         ▼
              ┌──────────────────────────┐
Each text has:│  start: 0.22, end: 0.38  │  (scroll range)
              └──────────────────────────┘
                         │
              useTransform(scrollYProgress,
                [start, start+0.03, end-0.03, end],
                [0,     1,          1,         0])
                         │
                  ┌──────┴──────┐
                  ▼             ▼
           opacity: 0→1→1→0    scale: 0.85→1→1→1.1
                  │             │
                  └──────┬──────┘
                         │
              <motion.div style={{ opacity, scale, y }}>
```

All text animations are **declarative MotionValues** — no manual DOM manipulation, no `requestAnimationFrame` loops. Framer Motion handles the updates efficiently outside React's render cycle.

---

## 12. How the Contrail (Trail) Works

A `motion.line` SVG element that:
- Starts at screen center (x=50%, y=48% — just below the plane)
- `y2` is a MotionValue derived from `scrollYProgress` via `useTransform([0, 1], [48, 100])`
- Has a `linearGradient`: solid white (0.9 opacity) at top → transparent at bottom
- Creates the illusion of a contrail/vapor trail behind the plane

---

## 13. How the Astronaut Model Works

```
  IntersectionObserver (200px rootMargin)
         │
         ▼ isVisible = true
  Canvas mounts → useLoader(GLTFLoader, 'astronaut.glb', MeshoptDecoder)
         │
         ▼
  AstronautModel (auto-scaled to 1.8 units)
         │
    ┌────┴────┐
    ▼         ▼
  Dragging   Idle
    │         │
    ▼         ▼
  dx * 0.008  rotY += delta * 0.25 (auto-rotate)
  dy * 0.008  rotX eases to 0
  X clamped   bobbing: sin(t * 0.6) * 0.08
  ±π/2.2
```

The astronaut model is displayed inside a fake tablet mockup (dark gradient frame with notch). Pointer/touch events on the container div are tracked via event listeners and passed to the 3D component via a shared ref (`dragRef`).

---

## 14. Performance Techniques

| Technique | What & Why |
|-----------|-----------|
| **Pre-allocated vectors** | Reusable `Vector3`, `Quaternion` objects created once, mutated in useFrame — avoids GC pressure (0 allocations per frame) |
| **Seeded PRNG** | Avoids `Math.random()` which React Compiler forbids. Same positions every render. |
| **Cloud model caching** | Cloud.glb loaded once, cloned 45 times. Reference counting frees GPU memory when done. |
| **Meshopt compression** | Astronaut model compressed 19.5 MB → 1.36 MB. MeshoptDecoder decompresses on the client. |
| **MotionValue-based animations** | `useTransform` creates derived values without React re-renders. Text overlays, intro, contrail all animate via MotionValues. |
| **scrollRef bridge** | `useMotionValueEvent` writes to a plain ref — Three.js reads it in useFrame without triggering React. |
| **DPR clamping** | `dpr={[1, 1.5]}` prevents rendering at full 2x/3x retina resolution on high-DPI screens. |
| **IntersectionObserver** | AboutSection Canvas only mounts when visible (+ 200px margin). Saves GPU on hidden sections. |
| **WebGL context fallback** | Graceful degradation when GPU can't create more contexts (common on mobile). |
| **`ssr: false` dynamic import** | 3D code only loads in browser, not during SSR build. |
| **Imperative model loading** | GLB added to scene graph via `.add()`, not React state. Avoids re-render on model load. |
| **`powerPreference: 'high-performance'`** | Requests dedicated GPU over integrated graphics. |

---

## 15. Customization Guide

### Change scroll speed
The scroll speed is controlled by the wrapper height. In `index.jsx`:
```jsx
<div ref={wrapperRef} className="relative h-[600vh]">
```
Increase `600vh` for slower scrolling (more scroll distance per progress unit), decrease for faster.

### Change flight path
In `AtmosExperience.jsx`, edit the `points` array:
```jsx
const points = [
  new Vector3(x, y, z),  // x=left/right, y=up/down, z=forward(negative)
  // ... add/remove/move points
];
```

### Change sky colors
In the fragment shader, edit the `vec3` color values:
```glsl
vec3 blue1Top = vec3(0.10, 0.12, 0.60);  // RGB, range 0.0–1.0
```

### Change plane wobble
In `AtmosExperience.jsx`:
```jsx
Math.sin(time * 2) * 0.08    // speed=2, amplitude=0.08 (up/down bob)
Math.sin(time * 3.5) * 0.03  // speed=3.5, amplitude=0.03 (pitch wobble)
Math.cos(time * 4.2) * 0.03  // speed=4.2, amplitude=0.03 (roll wobble)
```

### Change plane tilt intensity
```jsx
const targetRoll = -lateralDelta * 0.5;  // increase 0.5 for more dramatic banking
currentRoll.current += (targetRoll - currentRoll.current) * 0.03;  // increase 0.03 for faster tilt response
```

### Add/modify text facts
In `index.jsx`, edit the `textContent` array:
```jsx
{
  start: 0.22,       // when this text starts appearing (0–1 scroll range)
  end: 0.38,         // when this text finishes disappearing
  sup: 'Fact #01',   // small label above title
  title: 'SKY\nBABIES', // big title (\n = line break)
  body: 'Description text...',
  side: 'right',     // 'right' or 'left' — screen edge alignment
}
```

### Change number of clouds
In `AtmosExperience.jsx`, adjust the loop counts:
```jsx
for (let i = 0; i < 30; i++) { ... }  // close clouds (increase/decrease)
for (let i = 0; i < 15; i++) { ... }  // mid-distance clouds (increase/decrease)
```

### Change cloud distances
```jsx
// Close clouds
const dist = 2.5 + rng() * 5;   // 2.5–7.5 units (adjust range)

// Mid-distance clouds
const dist = 8 + rng() * 12;    // 8–20 units (adjust range)
```

### Swap the airplane model
1. Place your `.glb` file in `public/models/`
2. Update the path in `AtmosExperience.jsx`:
   ```jsx
   loader.load('/models/YourModel.glb', ...);
   ```
3. The auto-scaling will normalize any model to ~1 unit

### Swap the astronaut model
1. Place your `.glb` file in `public/models/`
2. Update the path in `AboutSection.jsx`:
   ```jsx
   const gltf = useLoader(GLTFLoader, '/models/YourModel.glb', (loader) => {
     loader.setMeshoptDecoder(MeshoptDecoder);  // only if meshopt-compressed
   });
   ```
3. If your model is NOT meshopt-compressed, remove the `MeshoptDecoder` setup

---

## 16. Common Pitfalls & React Compiler Notes

This project uses `babel-plugin-react-compiler` which enforces strict rules:

### 1. No `Math.random()` in render
```jsx
// BAD — React Compiler error (not pure)
const clouds = positions.map(() => Math.random());

// GOOD — seeded PRNG is deterministic
const rng = seededRandom(42);
const clouds = positions.map(() => rng());
```

### 2. No `ref.current` in render JSX
```jsx
// BAD — React Compiler error ("Cannot access refs during render")
return <primitive object={modelRef.current} />;

// GOOD — add imperatively in useEffect
useEffect(() => {
  container.add(model);
}, []);
return <group ref={containerRef} />;
```

### 3. No mutating state values directly
```jsx
// BAD — React Compiler error (model from useState)
const [model, setModel] = useState(null);
useFrame(() => { model.position.y = 5; });  // mutating state!

// GOOD — use ref for mutable 3D objects
const modelRef = useRef(null);
useFrame(() => { modelRef.current.position.y = 5; });
```

### 4. Never set React state in useFrame
```jsx
// BAD — causes 60 re-renders per second
useFrame(() => { setColor(new THREE.Color()); });

// GOOD — mutate ref directly
useFrame(() => { materialRef.current.color.set(0xff0000); });
```

---

## Summary

The entire `/atmos` experience is built with:
- **3 npm packages**: `three` + `@react-three/fiber` for 3D, `motion` for scroll-driven DOM animations
- **7 files**: page.jsx, AtmosSceneLoader.jsx, AboutSectionLoader.jsx, atmos.module.css, index.jsx, AtmosExperience.jsx, AboutSection.jsx
- **3 model assets**: Airplane.glb (236KB), Cloud.glb (619KB), astronaut.glb (1.36MB meshopt-compressed)
- **1 driving variable**: `scrollYProgress` MotionValue (0 to 1)
- **2 sections**: Scroll-driven 3D flight + Interactive astronaut About section
