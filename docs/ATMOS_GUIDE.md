# ATMOS - Scroll-Driven 3D Aviation Experience

## Complete Developer Guide

A full-screen, scroll-driven 3D animation where a plane flies through clouds along a curved path while the sky transitions from blue to sunset. Text facts appear and disappear as the user scrolls. Built with **only 2 packages** for 3D (`three` + `@react-three/fiber`) and **zero animation libraries** — all DOM animations are vanilla JavaScript.

---

## Table of Contents

1. [How It Works (Big Picture)](#1-how-it-works-big-picture)
2. [Packages Used & Why](#2-packages-used--why)
3. [File Structure](#3-file-structure)
4. [File-by-File Breakdown](#4-file-by-file-breakdown)
   - [page.jsx — Route Entry Point](#41-pagejsx--route-entry-point)
   - [atmos.css — All Styling](#42-atmoscss--all-styling)
   - [AtmosScene/index.jsx — Scene Wrapper + Scroll Logic + DOM Overlays](#43-atmossceneindexjsx--scene-wrapper--scroll-logic--dom-overlays)
   - [AtmosScene/AtmosExperience.jsx — 3D World (Sky, Plane, Clouds, Camera)](#44-atmossceneatmosexperiencejsx--3d-world)
5. [Key Concepts Explained](#5-key-concepts-explained)
   - [What is Canvas?](#51-what-is-canvas)
   - [What is useFrame?](#52-what-is-useframe)
   - [What is useThree?](#53-what-is-usethree)
   - [What is a CatmullRomCurve3?](#54-what-is-a-catmullromcurve3)
   - [What is a ShaderMaterial / GLSL?](#55-what-is-a-shadermaterial--glsl)
   - [What is GLTFLoader?](#56-what-is-gltfloader)
   - [What is Quaternion Slerp?](#57-what-is-quaternion-slerp)
   - [What is Lerp?](#58-what-is-lerp)
6. [How Scroll Works](#6-how-scroll-works)
7. [How the Camera Moves](#7-how-the-camera-moves)
8. [How the Airplane Works](#8-how-the-airplane-works)
9. [How the Sky Changes Color](#9-how-the-sky-changes-color)
10. [How Clouds Work](#10-how-clouds-work)
11. [How Text Overlays Work](#11-how-text-overlays-work)
12. [How the Contrail (Trail) Works](#12-how-the-contrail-trail-works)
13. [Performance Techniques](#13-performance-techniques)
14. [Customization Guide](#14-customization-guide)
15. [Common Pitfalls & React Compiler Notes](#15-common-pitfalls--react-compiler-notes)

---

## 1. How It Works (Big Picture)

```
User scrolls (mouse wheel / touch drag)
        │
        ▼
scrollProgress: 0.0 ──────────────────► 1.0
        │
        ├── Camera moves along a 3D curved path (CatmullRomCurve3)
        ├── Airplane stays fixed in front of camera, tilts into curves
        ├── Sky color transitions: Blue → Purple → Sunset → Warm → Pink
        ├── Cloud colors tint to match the sky
        ├── Text facts fade in/out with depth scaling effect
        └── SVG contrail line grows downward from the plane
```

The entire experience is driven by a single number: `scrollProgress` (0 to 1). Every visual element reads this number and reacts to it.

---

## 2. Packages Used & Why

| Package | What It Does | Why We Need It |
|---------|-------------|----------------|
| `three` | The 3D engine (WebGL). Provides Vector3, Quaternion, CatmullRomCurve3, ShaderMaterial, GLTFLoader, etc. | **Core 3D math and rendering engine.** Everything 3D depends on this. |
| `@react-three/fiber` | React renderer for Three.js. Lets you write Three.js scenes using JSX (`<mesh>`, `<sphereGeometry>`, etc.) instead of imperative code. | **Bridges React and Three.js.** Provides `<Canvas>`, `useFrame` (animation loop), `useThree` (camera access). |

**That's it. Only 2 packages for the entire 3D experience.**

### What We Don't Use (and why)

| Not Used | What It Would Do | Why We Skipped It |
|----------|-----------------|-------------------|
| `@react-three/drei` | Helper components (Float, useGLTF, Clouds, Sky, etc.) | Replaced with manual code: sin-wave bobbing, direct GLTFLoader, custom sphere clouds, GLSL sky shader. Fewer deps = smaller bundle. |
| `gsap` | Animation library | Replaced with vanilla `el.style.transform` and `el.style.opacity`. Only 3 lines of JS needed. |
| `@react-three/postprocessing` | Bloom, vignette, etc. | Crashed WebGL context with React 19. Not needed for this effect. |

---

## 3. File Structure

```
src/
├── app/
│   └── atmos/
│       ├── page.jsx              ← Route entry point (Next.js)
│       └── atmos.css             ← All CSS for the page
├── components/
│   └── AtmosScene/
│       ├── index.jsx             ← Canvas + scroll logic + DOM overlays
│       └── AtmosExperience.jsx   ← 3D scene (sky, plane, clouds, camera)
public/
└── models/
    └── Airplane.glb              ← 3D airplane model (231KB)
```

---

## 4. File-by-File Breakdown

### 4.1. `page.jsx` — Route Entry Point

**File:** `src/app/atmos/page.jsx`

```jsx
'use client';

import dynamic from 'next/dynamic';
import './atmos.css';

const AtmosScene = dynamic(() => import('@/components/AtmosScene'), {
  ssr: false,
  loading: () => <div className="atmos-loading">Loading Experience...</div>,
});

export default function AtmosPage() {
  return (
    <div className="atmos-wrapper">
      <AtmosScene />
    </div>
  );
}
```

**What each line does:**

| Code | Purpose |
|------|---------|
| `'use client'` | Tells Next.js this is a client-side component (needed for browser APIs like WebGL) |
| `dynamic(..., { ssr: false })` | **Critical:** Loads `AtmosScene` only in the browser, never on the server. Three.js/WebGL crash on the server because there's no `window` or `document`. |
| `loading: () => <div>...` | Shows "Loading Experience..." while the 3D code downloads |
| `import './atmos.css'` | Loads all CSS for the page |
| `<div className="atmos-wrapper">` | Full-screen container (`100vw × 100vh`, `overflow: hidden`) |

**Why `ssr: false` is required:** Three.js tries to access `window`, `document`, and WebGL APIs that don't exist on the server. Without `ssr: false`, the build would crash.

---

### 4.2. `atmos.css` — All Styling

**File:** `src/app/atmos/atmos.css`

Key sections:

#### Container Setup
```css
.atmos-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.atmos-container canvas {
  position: absolute !important;
  top: 0; left: 0;
  width: 100%; height: 100%;
}
```
The Canvas fills the entire screen. `!important` overrides React Three Fiber's default inline styles.

#### Text Overlays
```css
.atmos-text-overlay {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);    /* vertically centered */
  z-index: 15;                     /* above canvas (z-index 0), below header (z-index 30) */
  pointer-events: none;            /* clicks pass through to canvas */
  will-change: opacity;            /* GPU hint for smooth animation */
}

.atmos-text-overlay.text-right {
  right: 5%;                       /* anchored to right edge */
}

.atmos-text-overlay.text-left {
  left: 5%;                        /* anchored to left edge */
}
```

#### Equalizer Animation (Header)
```css
.eq-bar {
  width: 2px;
  background: white;
  animation: eqBounce 0.8s ease-in-out infinite alternate;
}

@keyframes eqBounce {
  0%   { transform: scaleY(0.3); }
  100% { transform: scaleY(1); }
}
```
12 tiny bars with staggered `animation-delay` create a music equalizer effect.

#### Letter-by-Letter Title Animation
```css
.atmos-intro h1 span {
  display: inline-block;
  animation: fadeInLetter 0.8s ease-out backwards;
}
.atmos-intro h1 span:nth-child(1) { animation-delay: 0s; }
.atmos-intro h1 span:nth-child(2) { animation-delay: 0.1s; }
/* ... etc for A, T, M, O, S */
```
Each letter of "ATMOS" fades in with a 0.1s stagger.

---

### 4.3. `AtmosScene/index.jsx` — Scene Wrapper + Scroll Logic + DOM Overlays

**File:** `src/components/AtmosScene/index.jsx`

This file handles everything that is **NOT 3D**: scroll input, text animations, the header, the contrail SVG, and the Canvas wrapper.

#### State & Refs

```jsx
const [scrollProgress, setScrollProgress] = useState(0);  // 0 to 1, drives everything
const [showIntro, setShowIntro] = useState(true);          // "ATMOS" title visible?
const [showHint, setShowHint] = useState(true);            // "Scroll to begin" visible?
const targetScroll = useRef(0);        // where scroll WANTS to be (instant)
const currentScroll = useRef(0);       // where scroll IS (smoothed via lerp)
const textRefs = useRef([]);           // DOM elements for text overlays
const touchStartY = useRef(0);        // touch position tracking for mobile
```

**Why two scroll values?** `targetScroll` jumps instantly when the user scrolls. `currentScroll` chases it smoothly via lerp. This creates the buttery-smooth scroll feel.

#### Scroll Input Handling

```jsx
// Desktop: Mouse wheel
const handleWheel = (e) => {
  e.preventDefault();
  const rawDelta = Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 50);
  const delta = rawDelta * 0.00008;
  targetScroll.current = Math.max(0, Math.min(1, targetScroll.current + delta));
};

// Mobile: Touch drag
const handleTouchMove = (e) => {
  e.preventDefault();
  const touchY = e.touches[0].clientY;
  const deltaY = touchStartY.current - touchY;
  touchStartY.current = touchY;
  const delta = deltaY * 0.0004;
  targetScroll.current = Math.max(0, Math.min(1, targetScroll.current + delta));
};
```

- `e.preventDefault()` stops the browser from actually scrolling the page
- `Math.min(Math.abs(e.deltaY), 50)` caps the maximum scroll speed (prevents trackpad fast-flicks)
- `* 0.00008` is the scroll sensitivity — smaller = slower scrolling
- `Math.max(0, Math.min(1, ...))` clamps progress to 0–1 range

#### The Animation Loop (requestAnimationFrame)

```jsx
const smoothScroll = () => {
  // Smooth the scroll (lerp = linear interpolation)
  currentScroll.current = lerp(currentScroll.current, targetScroll.current, 0.04);
  setScrollProgress(currentScroll.current);  // triggers React re-render → updates 3D

  // Hide intro after scrolling starts
  if (currentScroll.current > 0.02 && showIntro) {
    setShowIntro(false);
    setShowHint(false);
  }

  // Animate text overlays (vanilla JS, no library needed)
  textContent.forEach((text, index) => {
    const el = textRefs.current[index];
    if (!el) return;

    const diff = currentScroll.current - text.progress;
    const absDiff = Math.abs(diff);
    const visibility = Math.max(0, 1 - absDiff * 16);

    let scale, opacity;
    if (diff < 0) {
      // Approaching: starts small (0.3), grows to full size (1.0)
      scale = 0.3 + visibility * 0.7;
      opacity = visibility;
    } else {
      // Passing: grows beyond 1.0 and fades out
      scale = 1.0 + diff * 6;
      opacity = visibility;
    }

    // Direct DOM style manipulation (GPU-accelerated via transform)
    el.style.opacity = opacity;
    el.style.transform = `translateY(-50%) scale(${scale})`;
    el.style.visibility = opacity < 0.01 ? 'hidden' : 'visible';
  });

  requestAnimationFrame(smoothScroll);  // loop forever at ~60fps
};
```

**Why vanilla JS instead of React state for text animations?** Setting React state 60 times per second would trigger 60 re-renders per second, re-rendering the entire component tree. Direct `el.style` manipulation bypasses React and goes straight to the GPU — much faster.

#### The Canvas

```jsx
<Canvas
  camera={{ position: [0, 0, 0], fov: 75 }}
  gl={{ antialias: true }}
  onCreated={({ gl }) => { gl.setClearColor('#1a2fa0'); }}
>
  <AtmosExperience scrollProgress={scrollProgress} />
</Canvas>
```

| Prop | What It Does |
|------|-------------|
| `camera={{ position: [0, 0, 0], fov: 75 }}` | Initial camera at origin, 75° field of view (wide angle) |
| `gl={{ antialias: true }}` | Smooth edges on 3D geometry (no jagged lines) |
| `onCreated={...setClearColor}` | Sets background color before first render (matches sky blue) |
| `scrollProgress={scrollProgress}` | Passes the scroll value into the 3D world |

**What is `<Canvas>`?**
It creates a `<canvas>` HTML element and sets up:
- A WebGL renderer (draws 3D graphics)
- A scene graph (tree of 3D objects)
- A camera (your viewpoint)
- An animation loop (60fps render cycle)

Everything inside `<Canvas>` lives in 3D space. Everything outside (text, header, SVG) is normal HTML/CSS.

#### The Contrail SVG

```jsx
<svg className="contrail-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
  <line
    x1="50" y1="48"
    x2="50" y2={48 + scrollProgress * 52}
    stroke="url(#trailGrad)"
    strokeWidth="0.6"
  />
</svg>
```

A vertical white line that starts at the plane's screen position (x=50%, y=48%) and grows downward as you scroll. Uses a gradient that fades from white to transparent. `preserveAspectRatio="none"` stretches the SVG to fill the screen.

---

### 4.4. `AtmosScene/AtmosExperience.jsx` — 3D World

**File:** `src/components/AtmosScene/AtmosExperience.jsx`

This file contains all 3D logic: sky, clouds, airplane, camera movement.

#### Imports

```jsx
import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
```

| Import | From | Purpose |
|--------|------|---------|
| `useRef` | React | Mutable values that persist across renders (refs to 3D objects) |
| `useMemo` | React | Cache expensive calculations (curve, cloud positions) |
| `useEffect` | React | Load the GLB model on mount |
| `useFrame` | @react-three/fiber | Runs a callback every frame (~60fps). This is the 3D animation loop. |
| `useThree` | @react-three/fiber | Access the camera, renderer, scene, etc. |
| `THREE` | three | All 3D math: Vector3, Quaternion, Color, Box3, CatmullRomCurve3, ShaderMaterial, etc. |
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

**Why not `Math.random()`?** The React Compiler forbids `Math.random()` inside `useMemo` because it's not pure (returns different values each call). A seeded PRNG with the same seed (42) always produces the same sequence, so cloud positions are deterministic and the compiler is happy.

#### Sky Component

The sky is a huge sphere (scale=100) with the camera inside it. It uses a custom GLSL shader that transitions through 5 color phases based on `scrollProgress`:

```
Phase 1: 0.0 – 0.2  → Blue to Deeper Blue
Phase 2: 0.2 – 0.4  → Blue to Sunset Purple
Phase 3: 0.4 – 0.65 → Purple to Warm Orange
Phase 4: 0.65 – 0.85 → Orange to Pink
Phase 5: 0.85 – 1.0  → Stays Pink
```

Each phase has a `topColor` and `botColor`. The shader interpolates vertically between them using the sphere's Y position, creating a sky gradient.

Key detail: `side={THREE.BackSide}` — renders the inside of the sphere (since the camera is inside it).

#### CloudMesh Component

Each cloud is a group of 5 overlapping spheres at slightly different positions and sizes:

```
    ○ (0.35r)   ○ (0.4r)
  ○ (0.45r)  ○ (0.6r)  ○ (0.5r)
```

This creates an organic, lumpy cloud shape. Each sphere has:
- `meshStandardMaterial` — responds to lighting
- `transparent opacity={0.8-0.9}` — semi-transparent
- `roughness={1}` — matte, non-shiny surface

Cloud color tints with the sky: white → purple → warm → pink. The `lerp(color, 0.05)` in `useFrame` creates a smooth color transition (5% per frame).

Sphere segments are 12×12 (reduced from 16×16 for performance — 45 clouds × 5 spheres = 225 meshes).

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
  const loader = new GLTFLoader();
  loader.load('/models/Airplane.glb', (gltf) => {
    const scene = gltf.scene;
    // Calculate bounding box to auto-scale
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const s = maxDim > 0 ? 1 / maxDim : 0.01;
    scene.scale.set(s, s, s);
    scene.rotation.set(0, Math.PI, 0);  // face forward
    modelObjRef.current = scene;
    container.add(scene);  // imperatively add to Three.js scene graph
  });
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
const pointAhead = curve.getPointAt(ahead);
const pointBehind = curve.getPointAt(behind);
const lateralDelta = pointAhead.x - pointBehind.x;  // positive = turning right

// Convert to roll angle
const targetRoll = -lateralDelta * 0.5;
currentRoll.current += (targetRoll - currentRoll.current) * 0.03;  // smooth it

// Apply roll around the forward axis (like an airplane banking)
_forwardAxis.set(0, 0, -1).applyQuaternion(camera.quaternion);
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
const curve = useMemo(() => {
  const points = [
    new THREE.Vector3(0, 0, 0),        // start
    new THREE.Vector3(0.8, 0.5, -10),   // slight right, up
    new THREE.Vector3(-1.5, 1.2, -20),  // swing left, up
    // ... more points snaking left/right/up through Z axis
    new THREE.Vector3(1.0, 2.8, -100),  // end
  ];
  return new THREE.CatmullRomCurve3(points);
}, []);
```

11 control points define a smooth path 100 units long. The path snakes left/right (X) and gradually ascends (Y) while moving forward (Z). `CatmullRomCurve3` creates a smooth curve that passes through every point.

**Cloud Generation:**
```jsx
for (let i = 0; i < 45; i++) {
  const t = i / 45;                              // evenly spaced along path
  const pointOnPath = curve.getPointAt(t);        // position on the curve
  let offsetX = (rng() - 0.5) * 30;             // random X offset (±15 units)
  let offsetY = (rng() - 0.5) * 12;             // random Y offset (±6 units)
  if (Math.abs(offsetX) < 3) {                   // push clouds away from flight path
    offsetX = offsetX > 0 ? offsetX + 3 : offsetX - 3;
  }
}
```

Clouds are placed along the entire flight path with random offsets. The minimum distance check (`< 3`) ensures no clouds block the view.

**Camera Movement:**
```jsx
useFrame(() => {
  const pos = curve.getPointAt(progress);              // target position on curve
  const lookAtPos = curve.getPointAt(progress + 0.025); // look slightly ahead

  camera.position.lerp(pos, 0.05);                     // smooth position
  // ... quaternion slerp for smooth rotation
  camera.quaternion.slerp(_targetQuat, 0.05);           // smooth rotation
});
```

The camera doesn't snap to positions — it lerps (smoothly interpolates) toward them at 5% per frame.

**Scene Composition:**
```jsx
return (
  <>
    <Sky scrollProgress={scrollProgress} />
    <ambientLight intensity={1.2} color="#ccd8ff" />
    <directionalLight position={[5, 10, -5]} intensity={1.5} />
    <hemisphereLight skyColor="#aabbff" groundColor="#ffd4b0" intensity={0.8} />
    <Airplane curve={curve} scrollProgress={scrollProgress} />
    {clouds.map((cloud, idx) => (
      <CloudMesh key={idx} ... />
    ))}
  </>
);
```

Three lights create the atmosphere:
- **ambientLight** — uniform base light (blue-tinted)
- **directionalLight** — sun-like light from upper-right
- **hemisphereLight** — blue from above, warm orange from below (simulates sky + ground bounce)

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
const curve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(1, 2, -10),
  new THREE.Vector3(-1, 3, -20),
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

The model at `public/models/Airplane.glb` contains the airplane's geometry, materials, and textures in a single 231KB file.

### 5.7. What is Quaternion Slerp?

Quaternions are the math behind 3D rotations. Unlike Euler angles (pitch/yaw/roll), they don't suffer from gimbal lock.

**Slerp** = Spherical Linear Interpolation. It smoothly rotates from one orientation to another:

```jsx
camera.quaternion.slerp(targetQuaternion, 0.05);
// Moves 5% of the way toward targetQuaternion each frame
```

This creates the smooth camera turning effect.

### 5.8. What is Lerp?

**Lerp** = Linear Interpolation. Smoothly moves a value toward a target:

```jsx
const lerp = (start, end, factor) => start + (end - start) * factor;
// lerp(0, 100, 0.1) = 10  (10% of the way)
// lerp(90, 100, 0.1) = 91  (slows down as it approaches)
```

Used everywhere for smooth movement:
- Camera position: `camera.position.lerp(target, 0.05)`
- Scroll smoothing: `currentScroll = lerp(current, target, 0.04)`
- Cloud color: `material.color.lerp(newColor, 0.05)`

---

## 6. How Scroll Works

```
                    WHEEL / TOUCH EVENT
                           │
                           ▼
              ┌─────────────────────────┐
              │  targetScroll (instant)  │  ← jumps immediately
              │  clamped to 0.0 – 1.0   │
              └──────────┬──────────────┘
                         │
                    lerp(0.04) each frame
                         │
                         ▼
              ┌─────────────────────────┐
              │ currentScroll (smoothed) │  ← chases target gradually
              └──────────┬──────────────┘
                         │
                setScrollProgress()
                         │
                         ▼
              ┌─────────────────────────┐
              │  scrollProgress (state)  │  ← React state, triggers re-render
              └──────────┬──────────────┘
                         │
              ┌──────────┼──────────────┐
              ▼          ▼              ▼
           Camera     Sky Color     Text Overlays
           + Plane    + Cloud Tint  + Contrail SVG
```

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

Implemented as a GLSL fragment shader on a huge inside-out sphere. The shader runs on the GPU, computing color per-pixel based on:
1. `uProgress` — scroll position (which color phase)
2. `vPosition.y` — vertical position on sphere (gradient from bottom to top)

---

## 10. How Clouds Work

- 45 clouds, each made of 5 overlapping spheres
- Positioned along the flight path with random offsets
- Minimum 3 units away from the path (so they don't block the view)
- Seeded random ensures same layout every time
- Colors tint to match the sky (white → purple → warm)
- Sphere segments: 12×12 (optimized for performance)

---

## 11. How Text Overlays Work

```
                    scrollProgress
                         │
                         ▼
               ┌─────────────────┐
Each text has: │  text.progress   │  (e.g., 0.30 for Fact #01)
               └─────────────────┘
                         │
              diff = currentScroll - text.progress
                         │
                  ┌──────┴──────┐
                  │             │
            diff < 0       diff > 0
          (approaching)     (passing)
                  │             │
         scale: 0.3 → 1.0   scale: 1.0 → grows
         opacity: 0 → 1     opacity: 1 → 0
                  │             │
                  └──────┬──────┘
                         │
              el.style.transform = scale
              el.style.opacity = opacity
```

**The depth effect:** Text starts small and invisible (far away), grows to full size as you reach it (close), then grows past full size and fades (passes by). This mimics the perspective of moving toward and past a sign on a road.

---

## 12. How the Contrail (Trail) Works

A simple SVG `<line>` that:
- Starts at screen center (x=50%, y=48% — just below the plane)
- Extends downward based on `scrollProgress`
- Has a gradient: solid white at top → transparent at bottom
- Creates the illusion of a contrail/vapor trail behind the plane

---

## 13. Performance Techniques

| Technique | What & Why |
|-----------|-----------|
| **Pre-allocated vectors** | `useMemo(() => new THREE.Vector3(), [])` — reuse the same object in useFrame instead of creating `new Vector3()` every frame (60 objects/sec → 0) |
| **Seeded PRNG** | Avoids `Math.random()` which React Compiler forbids in useMemo. Same positions every render. |
| **Reduced sphere segments** | 12×12 instead of 16×16. 45 clouds × 5 spheres = 225 meshes. (12² = 144 triangles vs 16² = 256 per sphere) |
| **Vanilla JS text animation** | `el.style.transform` instead of React state. Avoids 60 re-renders/second. |
| **`will-change: opacity`** | CSS hint to browser: "this element's opacity will change, please optimize" |
| **`visibility: hidden`** | Fully transparent overlays are hidden from the compositor |
| **`ssr: false` dynamic import** | 3D code only loads in browser, not during SSR build |
| **Imperative model loading** | GLB added to scene graph via `.add()`, not React state. Avoids re-render on model load. |
| **Capped scroll delta** | `Math.min(Math.abs(e.deltaY), 50)` prevents huge scroll jumps from trackpad flicks |

---

## 14. Customization Guide

### Change scroll speed
In `index.jsx`, line with `* 0.00008`:
```jsx
const delta = rawDelta * 0.00008;  // increase for faster, decrease for slower
```

### Change flight path
In `AtmosExperience.jsx`, edit the `points` array:
```jsx
const points = [
  new THREE.Vector3(x, y, z),  // x=left/right, y=up/down, z=forward(negative)
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
  progress: 0.30,      // when this text appears (0–1 scroll position)
  sup: 'Fact #01',     // small label above title
  title: 'SKY\nBABIES', // big title (\n = line break)
  body: 'Description text...',
  side: 'right',       // 'right' or 'left' — screen edge alignment
}
```

### Change number of clouds
In `AtmosExperience.jsx`:
```jsx
const numClouds = 45;  // increase for denser clouds, decrease for sparser
```

### Change cloud spread distance
```jsx
let offsetX = (rng() - 0.5) * 30;  // 30 = horizontal spread (increase for wider)
let offsetY = (rng() - 0.5) * 12;  // 12 = vertical spread
if (Math.abs(offsetX) < 3) {       // 3 = minimum distance from flight path
```

### Swap the airplane model
1. Place your `.glb` file in `public/models/`
2. Update the path in `AtmosExperience.jsx`:
   ```jsx
   loader.load('/models/YourModel.glb', ...);
   ```
3. The auto-scaling will normalize any model to ~1 unit

---

## 15. Common Pitfalls & React Compiler Notes

This project uses `babel-plugin-react-compiler` which enforces strict rules:

### 1. No `Math.random()` in useMemo
```jsx
// BAD — React Compiler error (not pure)
const clouds = useMemo(() => {
  return positions.map(() => Math.random());
}, []);

// GOOD — seeded PRNG is deterministic
const rng = seededRandom(42);
const clouds = useMemo(() => {
  return positions.map(() => rng());
}, []);
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
- **2 npm packages** for 3D: `three` + `@react-three/fiber`
- **0 animation libraries**: vanilla JS for DOM, `useFrame` + math for 3D
- **4 files**: page.jsx, atmos.css, index.jsx, AtmosExperience.jsx
- **1 asset**: Airplane.glb (231KB)
- **1 driving variable**: `scrollProgress` (0 to 1)
