# TransformSection — Complete In-Depth Analysis

## Table of Contents

1. [Overview](#overview)
2. [File Architecture](#file-architecture)
3. [Loading Pipeline (TransformSectionLoader)](#loading-pipeline)
4. [Module-Level State](#module-level-state)
5. [Constants & Color System](#constants--color-system)
6. [Cable Path System](#cable-path-system)
7. [Animation Timeline](#animation-timeline)
8. [SVG → Three.js Shape Conversion](#svg-to-threejs-shape-conversion)
9. [3D Scene Components](#3d-scene-components)
   - [GridFloor](#gridfloor)
   - [GridLines](#gridlines)
   - [Machine (Lever)](#machine-lever)
   - [StatusLight](#statuslight)
   - [Cable](#cable)
   - [EnergyPulse](#energypulse)
   - [LogoShape (WM Logo)](#logoshape-wm-logo)
   - [PulseLight](#pulselight)
10. [Scene Composition (TransformScene)](#scene-composition)
11. [Animation Controller](#animation-controller)
12. [Camera Rig & Responsiveness](#camera-rig--responsiveness)
13. [Canvas Wrapper](#canvas-wrapper)
14. [Section Mount & Visibility](#section-mount--visibility)
15. [Complete Render Tree](#complete-render-tree)
16. [Coordinate System & Spatial Layout](#coordinate-system--spatial-layout)
17. [Performance Considerations](#performance-considerations)

---

## Overview

TransformSection renders a full-screen 3D animation where:

1. A **mechanical lever** (bottom-left) is pulled
2. An **energy pulse** travels along a cable
3. A **WM logo** (upper-right) extrudes from flat 2D into 3D
4. The scene settles with a glow effect

The entire animation loops automatically when the section is visible in the viewport.

**Tech stack**: React Three Fiber (R3F) + Three.js, running inside Next.js with client-only rendering.

---

## File Architecture

```
src/components/AtmosScene/
├── TransformSectionLoader.jsx   ← Dynamic import wrapper (13 lines)
└── TransformSection.jsx         ← All 3D logic (684 lines)
```

### Why two files?

- **TransformSectionLoader.jsx** — Thin wrapper that uses `next/dynamic` with `ssr: false`
- **TransformSection.jsx** — The actual component, loaded only on the client

This split exists because Three.js and WebGL APIs don't exist on the server. The loader ensures the 3D code never runs during SSR.

---

## Loading Pipeline

### TransformSectionLoader.jsx (complete code)

```jsx
'use client';

import dynamic from 'next/dynamic';

const TransformSection = dynamic(
  () => import('@/components/AtmosScene/TransformSection'),
  {
    ssr: false,
    loading: () => <div className="min-h-screen bg-[#08080c]" />,
  }
);

export default function TransformSectionLoader() {
  return <TransformSection />;
}
```

### How it works step by step:

1. **`'use client'`** — Marks this as a Client Component (required for dynamic imports in Next.js App Router)

2. **`dynamic(() => import(...))`** — Creates a lazy-loaded component
   - The import only fires when `TransformSectionLoader` actually renders in the browser
   - The JS bundle for TransformSection is code-split into a separate chunk

3. **`ssr: false`** — Completely skips server-side rendering
   - During SSR, Next.js renders the `loading` fallback instead
   - The actual component only loads after hydration in the browser
   - This is critical because Three.js requires `window`, `WebGLRenderingContext`, `requestAnimationFrame`, etc.

4. **`loading: () => <div className="min-h-screen bg-[#08080c]" />`**
   - Shows a dark placeholder while the JS chunk downloads and parses
   - `min-h-screen` reserves the viewport height to prevent layout shift
   - `bg-[#08080c]` matches the dark scene background for a seamless transition

5. **`TransformSectionLoader`** — Just returns `<TransformSection />`
   - This component is what gets imported by the page (`src/app/atmos/page.jsx`)
   - Acts as the public API — consumers don't need to know about dynamic loading

### Loading sequence:

```
Server render:
  page.jsx → TransformSectionLoader → dark placeholder div (min-h-screen)

Client hydration:
  1. React hydrates the placeholder
  2. dynamic() triggers: import('@/components/AtmosScene/TransformSection')
  3. Browser fetches the chunk (TransformSection + Three.js + R3F)
  4. Chunk parses → TransformSection component mounts
  5. Placeholder replaced with <section> containing <Canvas>
  6. WebGL context created → 3D scene renders
  7. IntersectionObserver starts watching visibility
```

---

## Module-Level State

```jsx
const anim = { progress: 0 };
```

### Why module-level instead of useRef or useState?

**Problem**: React's compiler (strict mode) treats values returned from hooks as immutable. Writing `ref.current.progress = 0.5` inside `useFrame` triggers compiler warnings/errors.

**Solution**: A plain object declared at module scope:
- Lives outside React's reactivity system entirely
- Can be freely mutated from any `useFrame` callback
- Shared across all components in the same module (AnimationController writes, others read)
- Not reactive — doesn't trigger re-renders (which is exactly what we want for 60fps animation)

### How it's used:

```
AnimationController → writes anim.progress (0 → 1.2, then resets to 0)
Machine             → reads anim.progress to compute lever angle
StatusLight         → reads to toggle color (green ↔ blue)
EnergyPulse         → reads to position pulse along cable
LogoShape           → reads to compute extrude depth
PulseLight          → reads to position/intensity of dynamic light
```

---

## Constants & Color System

```jsx
const BLUE_LIGHT = new Color('#5b8aff');  // Energy pulse, logo emissive
const BLUE_GLOW  = new Color('#7aa4ff');  // Glow effects, pulse light
const DARK_METAL = new Color('#45454f');  // Machine body
const METAL_WARM = new Color('#9a9ab0');  // Lever arm, handle, feet (cool chrome)
const METAL_EDGE = new Color('#5a5a66');  // Edge trim, base mount
```

These are instantiated as `Three.Color` objects at module level (not inside components) to avoid garbage collection from creating new objects every frame.

---

## Cable Path System

```jsx
const CABLE_POINTS = [
  new Vector3(-2.8, 0.35, 3.5),   // Start: exits machine (matches machine position)
  new Vector3(-2.4, 0.20, 2.8),   // Descends, curves inward
  new Vector3(-1.6, 0.10, 1.8),   // Near floor
  // S-curve: first bend sweeps far right
  new Vector3(-0.4, 0.06, 1.2),
  new Vector3(0.8, 0.05, 0.4),
  new Vector3(1.6, 0.04, -0.2),   // Peak of first S bend (far right)
  // S-curve: second bend sweeps back left
  new Vector3(1.0, 0.04, -1.0),
  new Vector3(0.0, 0.04, -1.8),   // Dip of second S bend (far left)
  new Vector3(0.6, 0.03, -2.6),
  new Vector3(1.4, 0.02, -3.2),   // Straightening toward logo
  new Vector3(2.2, 0.01, -3.6),   // Arrives at left edge of logo
  new Vector3(2.8, 0.01, -3.8),   // Connects to logo
];
const CABLE_CURVE = new CatmullRomCurve3(CABLE_POINTS);
```

### How CatmullRomCurve3 works:

- Takes an array of control points (12 points in this case)
- Creates a smooth spline that passes **through** each point (unlike Bezier which uses them as handles)
- The `getPointAt(t)` method returns a position for `t` in [0, 1] uniformly distributed by arc length
- Used for both the visible tube geometry AND the energy pulse position

### Cable S-curve shape explained:

The cable forms a pronounced **S-curve** across the scene floor, connecting the machine (bottom-left) to the logo (upper-right). The cable approaches the logo from its **left side** (not from below).

**S-curve structure:**
1. **Exit** (points 0–2): Cable leaves machine, descends toward floor
2. **First bend** (points 3–5): Sweeps far right to X=1.6, crossing the scene diagonally
3. **Second bend** (points 6–7): Curves back left to X=0.0, creating the S shape
4. **Approach** (points 8–11): Sweeps right again, straightening to arrive at logo's left edge

### Y coordinates explained:

The cable stays close to the floor, gradually descending:

```
Y = 0.35 → Cable exits from machine at port height
Y = 0.20 → Descends but stays above floor
Y = 0.10 → Approaching floor level
Y = 0.04–0.06 → S-curve body (very close to floor)
Y = 0.01–0.03 → Final approach to logo (nearly flat)
```

Key difference from a flat cable: the Y values range from 0.01–0.35, with the cable mostly hugging the floor while the exit point is elevated at the machine.

---

## Animation Timeline

```jsx
const PHASE_LEVER   = [0, 0.08];     //  0% –  8%  → Lever pulls down
const PHASE_PULSE   = [0.08, 0.55];  //  8% – 55%  → Energy travels cable
const PHASE_EXTRUDE = [0.55, 0.85];  // 55% – 85%  → Logo extrudes to 3D
const PHASE_SETTLE  = [0.85, 1.0];   // 85% – 100% → Glow fades, settle
```

The animation progress goes from 0 to 1.2 (the extra 0.2 is a pause before looping).

### Visual timeline:

```
0.0                                                           1.0    1.2
|===LEVER===|============PULSE============|=====EXTRUDE=====|=SETTLE=|pause|
    8%                   47%                     30%            15%     20%
```

### Phase calculation pattern (used everywhere):

```jsx
// Normalize progress within a phase to [0, 1]
const t = (p - PHASE_START) / (PHASE_END - PHASE_START);
```

---

## SVG to Three.js Shape Conversion

### The problem:

The WM logo exists as SVG paths (from a `.svg` file with viewBox `0 0 188 192`). Three.js needs `Shape` objects for `ExtrudeGeometry`.

### The solution — coordinate transform functions:

```jsx
const SVG_SCALE = 0.009;  // 188px → ~1.7 Three.js units
const SVG_CX = 94;        // Center X of viewBox (188/2)
const SVG_CY = 96;        // Center Y of viewBox (192/2)

function sx(x) { return (x - SVG_CX) * SVG_SCALE; }
function sy(y) { return -(y - SVG_CY) * SVG_SCALE; }
```

### What these do:

1. **Center at origin**: `x - SVG_CX` shifts the shape so its center is at (0,0) instead of (94, 96)
2. **Scale down**: `* SVG_SCALE` converts from SVG pixels to Three.js world units (188px → ~0.85 units wide)
3. **Flip Y**: The negative in `sy` flips the Y axis (SVG Y goes down, Three.js Y goes up)

### Three shapes are created:

1. **`createChipBody()`** — The rounded rectangle background (blue chip)
   - Rounded corners using bezierCurveTo (4 corners with radius ~48px)
   - Maps the SVG `rect` with `rx` into a Three.js Shape

2. **`createWMLeft()`** — Left half of the "WM" letters
   - Complex path with straight lines and bezier curves
   - The W's left strokes and M's left portion

3. **`createWMRight()`** — Right half of the "WM" letters
   - Mirror complement to createWMLeft
   - Together they form the complete WM lettermark

### SVG path commands → Three.js Shape methods:

| SVG Command | Three.js Method | Description |
|---|---|---|
| `M x,y` | `shape.moveTo(sx(x), sy(y))` | Move pen without drawing |
| `L x,y` | `shape.lineTo(sx(x), sy(y))` | Straight line |
| `C x1,y1 x2,y2 x,y` | `shape.bezierCurveTo(...)` | Cubic bezier curve |
| `Z` | `shape.closePath()` | Close the path |

---

## 3D Scene Components

### GridFloor

```jsx
function GridFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[20, 20, 1, 1]} />
      <meshStandardMaterial color="#1a1c28" roughness={0.55} metalness={0.45} />
    </mesh>
  );
}
```

- **20x20 unit plane** rotated to lie flat (XZ plane)
- Positioned at Y=-0.01 (slightly below origin to prevent z-fighting with objects at Y=0)
- Dark color `#1a1c28` — dark blue-gray, provides ground reference
- `receiveShadow` — catches shadows from objects above
- Roughness 0.55, metalness 0.45 — semi-reflective surface that subtly mirrors scene lighting

### GridLines

```jsx
function GridLines() { ... }
```

- Creates a grid of lines across the floor
- **Size**: -10 to +10 units in both X and Z
- **Step**: 0.8 units between lines
- Each grid line is a `<line>` element with `bufferGeometry` holding 2 vertices
- Color `#2a2e42` at 35% opacity — subtle blue-gray tint, non-distracting
- Wrapped in `useMemo(() => ..., [])` — computed once, never recomputed

### Machine (Lever)

The most complex static component. Built from multiple nested meshes:

```
Machine group position=[-2.8, 0, 3.5] scale=[1.2, 1.2, 1.2]  (bottom-left of scene)
├── Main body (box 0.85 × 0.7 × 0.7) at Y=0.35
├── Top plate (thin box) at Y=0.71
├── Bottom edge trim (thin box) at Y=0.01
├── Vent slot left (thin box) at Z=0.355 (front face)
├── Vent slot right (thin box) at Z=0.355 (front face)
├── Lever base mount (cylinder) at Y=0.74
├── Lever group (ref=leverRef) at Y=0.74 ← ANIMATED
│   ├── Lever arm (cylinder 0.5 tall) at Y=0.25
│   ├── Handle (cylinder, rotated 90° on Z) at Y=0.5
│   ├── End cap left (sphere r=0.055) at X=0.13, Y=0.5
│   └── End cap right (sphere r=0.055) at X=-0.13, Y=0.5
├── Base feet × 4 (cylinders at corners)
├── StatusLight (sphere)
└── Cable connection port (cylinder on right side)
```

#### Lever animation:

```jsx
const LEVER_BACK = 0.35; // ~20° backward lean
```

| Phase | leverAngle | Visual |
|---|---|---|
| Before activation | 0.35 rad | Tilted backward `/` |
| During PHASE_LEVER | Eases from 0.35 → 0 | Pulling forward |
| After lever, before settle | 0 | Vertical `|` (pulled down) |
| After settle (reset) | 0.35 | Back to rest `/` |

**Easing**: ease-out-back (overshoots slightly then settles)

```jsx
const c1 = 1.70158;
const c3 = c1 + 1;
const eased = 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
```

This is a cubic bezier approximation. The `c1 = 1.70158` is the "back" overshoot constant — the lever slightly overshoots vertical before settling.

**Rotation axis**: `rotation.x` — tilts forward/backward (toward/away from camera)

### StatusLight

A small sphere on the machine's front face that changes color based on animation state:

| State | Color | Emissive Intensity |
|---|---|---|
| Idle (lever at rest) | `#22c55e` (green) | 2.5 |
| Active (pulse traveling / extruding) | `#335fff` (blue) | 4.0 |

### Cable

```jsx
function Cable() {
  const tubeGeo = useMemo(
    () => new TubeGeometry(CABLE_CURVE, 80, 0.085, 8, false),
    []
  );
  return (
    <mesh geometry={tubeGeo}>
      <meshStandardMaterial
        color="#4a4c62"
        roughness={0.3}
        metalness={0.7}
        emissive="#1a1c3a"
        emissiveIntensity={0.15}
      />
    </mesh>
  );
}
```

- **TubeGeometry** wraps the CatmullRomCurve3 in a cylindrical tube
- **80 segments** along the curve length (smoothness)
- **0.085 radius** — thicker than before, clearly visible from the steep camera angle
- **8 radial segments** — cross-section polygon resolution
- **false** — not closed (tube has open ends)
- Blue-gray metallic color `#4a4c62` with subtle emissive glow (`#1a1c3a` at 0.15 intensity) — gives the cable a faint self-illumination that makes it pop against the dark floor

### EnergyPulse

Three layered spheres that travel along the cable:

```
EnergyPulse
├── Main pulse (sphere r=0.08) — bright, opaque
├── Trail (sphere r=0.05) — dimmer, follows behind
└── Glow (sphere r=0.2) — large, very transparent halo
```

**Movement**: Uses `CABLE_CURVE.getPointAt(pulseT)` where `pulseT` goes from 0 to 1 during PHASE_PULSE.

**Trail**: Positioned at `pulseT - 0.04` — slightly behind the main pulse on the curve.

**Visibility**: Only visible during PHASE_PULSE. Hidden before and after.

### LogoShape (WM Logo)

The most complex animated component.

```
LogoShape group position=[3.2, 0.01, -3.8] rotation=[-PI/2, 0, 0]
├── Blue chip body (ExtrudeGeometry) ← depth animated
├── WM left letter (ExtrudeGeometry) ← depth animated
├── WM right letter (ExtrudeGeometry) ← depth animated
└── Glow mesh (larger ExtrudeGeometry) ← opacity animated
```

#### Why rotation=[-PI/2, 0, 0]?

`ExtrudeGeometry` extrudes along the **local Z axis**. But we want the logo to extrude **upward** (Y axis in world space). Rotating the group -90° on X maps local Z → world Y.

#### Extrude animation:

```
Before PHASE_EXTRUDE: depth = 0.005 (nearly flat — 2D appearance)
During PHASE_EXTRUDE: depth eases from 0.005 → 0.205 (3D)
After PHASE_EXTRUDE:  depth = 0.205 (stays 3D)
```

**How geometry is rebuilt per frame**:

```jsx
// Only rebuild if depth changed significantly
if (Math.abs(depth - lastBuiltDepth.current) > 0.001) {
  const oldBody = bodyRef.current.geometry;
  bodyRef.current.geometry = new ExtrudeGeometry(chipBody, { depth, ... });
  oldBody.dispose();  // Free GPU memory!
}
```

- `currentDepth.current` lerps toward `targetDepth` at 10% per frame (`+= (target - current) * 0.1`)
- Only rebuilds geometry when change exceeds 0.001 (avoids unnecessary GPU uploads)
- Old geometry is explicitly `.dispose()`d to prevent memory leaks

#### WM letters extrude slightly taller:

```jsx
const wmOpts = { depth: depth + 0.012, ... };
```

The letters are always 0.012 units taller than the chip body, making them raised/embossed.

#### Emissive glow during extrusion:

```
0.50 → 0.55: Glow fades in (pre-extrude anticipation)
0.55 → 0.85: Full glow (during extrusion)
0.85 → 1.00: Glow fades to 30% (settle)
```

### PulseLight

A dynamic `pointLight` that follows the energy pulse:

| Phase | Position | Intensity |
|---|---|---|
| PULSE | Follows cable curve + 0.3 Y offset | 2.5 |
| EXTRUDE | Fixed at logo position `(3.2, 0.8, -3.8)` | 3.5 (fading) |
| Idle | Anywhere | 0 (off) |

This creates the illusion that the pulse is emitting light onto nearby surfaces.

---

## Scene Composition

```jsx
function TransformScene() {
  return (
    <>
      <color attach="background" args={['#111116']} />
      <fog attach="fog" args={['#111116', 10, 24]} />

      {/* Lighting */}
      <ambientLight intensity={0.8} color="#c0c0d0" />
      <directionalLight position={[4, 8, 4]} intensity={2.8} color="#e0dcd4" castShadow />
      <directionalLight position={[-3, 5, -2]} intensity={1.2} color="#4466aa" />
      <pointLight position={[-2.8, 2.5, 4.0]} intensity={1.4} color="#e0d8cc" distance={10} />
      <pointLight position={[3.6, 1.8, -3.5]} intensity={0.8} color="#5b8aff" distance={9} />
      <pointLight position={[-2.5, 0.8, 0.0]} intensity={0.6} color="#6a6a80" distance={5} />
      <PulseLight />

      {/* Scene objects */}
      <GridFloor />
      <GridLines />
      <Machine />
      <Cable />
      <LogoShape />
      <EnergyPulse />
    </>
  );
}
```

### Background & Fog

- **Background**: `#111116` — very dark blue-gray
- **Fog**: Linear fog from distance 10 to 24, same color as background
  - Objects closer than 10 units: fully visible
  - Objects between 10–24: gradually fade
  - Objects beyond 24: invisible
  - Hides the grid edges naturally

### Lighting Setup (6 lights + 1 dynamic):

| Light | Type | Purpose |
|---|---|---|
| Ambient `#c0c0d0` | ambientLight | Base fill, ensures nothing is pure black |
| Directional `[4,8,4]` | directionalLight | Key light — main illumination, casts shadows |
| Directional `[-3,5,-2]` | directionalLight | Cool blue fill from opposite side |
| Point `[-2.8,2.5,4.0]` | pointLight | Warm spot on lever (bottom-left), distance=10 |
| Point `[3.6,1.8,-3.5]` | pointLight | Blue accent on logo (upper-right), distance=9 |
| Point `[-2.5,0.8,0.0]` | pointLight | Rim/edge highlight |
| PulseLight | pointLight (animated) | Follows energy pulse, illuminates logo during extrude |

---

## Animation Controller

```jsx
function AnimationController({ isPlaying }) {
  useFrame((_, delta) => {
    if (!isPlaying) return;
    anim.progress += delta * 0.2;
    if (anim.progress > 1.2) anim.progress = 0;
  });
  return null;
}
```

- **`delta`** — time since last frame in seconds (~0.016 at 60fps)
- **`delta * 0.2`** — speed multiplier. Full cycle (0 → 1.2) takes ~6 seconds
- **1.2 threshold** — animation runs to 1.0, then 0.2 extra seconds of pause before looping
- **`isPlaying`** — controlled by IntersectionObserver (only animates when visible)
- **Returns null** — invisible component, pure logic

### Animation speed math:

```
At 60fps: delta ≈ 0.0167s
Per frame: 0.0167 × 0.2 = 0.00333 progress
Frames for full cycle: 1.2 / 0.00333 ≈ 360 frames
Duration: 360 / 60 = 6 seconds
```

---

## Camera Rig & Responsiveness

```jsx
function CameraRig() {
  const { camera, size } = useThree();

  useEffect(() => {
    const aspect = size.width / size.height;

    let dist;
    if (aspect < 0.7)       dist = 1.5;   // Phone portrait
    else if (aspect < 1.0)  dist = 1.25;  // Tablet portrait
    else                    dist = 1.0;   // Desktop/landscape

    camera.position.set(3.5 * dist, 7.5 * dist, 4.0 * dist);
    camera.lookAt(0.2, 0.0, -0.2);
    camera.updateProjectionMatrix();
  }, [camera, size]);

  return null;
}
```

### Camera position explained:

Base position: `(3.5, 7.5, 4.0)` — high and to the front-right, pulled back to fit the wider scene

```
Top view (Y looking down):

         -Z (screen top)
          |
          |     Logo [3.2, -3.8]
          |
 -X ──────┼────── +X
          |
          |
Machine [-2.8, 3.5]
          |
         +Z (screen bottom)

  Camera at (+3.5, +4.0) in XZ — front-right
```

### Why this angle?

- **High Y (7.5)**: Steep top-down view minimizes perspective distortion — pulled back further than before to fit the wider object spread
- **FOV 40°**: Wide enough to fit both objects near screen edges
- **Both objects appear similar size** because the view is near-orthographic

### Responsive scaling:

The `dist` multiplier uniformly scales the camera away from origin:

| Viewport | Aspect | dist | Camera Y | Effect |
|---|---|---|---|---|
| Desktop (16:9) | 1.78 | 1.0 | 7.5 | Normal framing |
| Tablet portrait | 0.75 | 1.25 | 9.375 | Pulls back to fit |
| Phone portrait | 0.5 | 1.5 | 11.25 | Pulls back further |

The `lookAt(0.2, 0.0, -0.2)` stays constant — the camera always looks at roughly the scene center regardless of distance.

---

## Canvas Wrapper

```jsx
function TransformCanvas({ active }) {
  const [webglFailed, setWebglFailed] = useState(false);

  const onContextLost = useCallback((e) => {
    e.preventDefault();
    setWebglFailed(true);
  }, []);

  if (webglFailed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#111116]">
        <p className="text-center text-sm text-white/50 px-4">
          3D preview unavailable on this device
        </p>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      {active ? (
        <Canvas
          camera={{ fov: 40, near: 0.1, far: 50 }}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          dpr={[1, 1.5]}
          style={{ width: '100%', height: '100%', display: 'block' }}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener('webglcontextlost', onContextLost);
          }}
        >
          ...
        </Canvas>
      ) : (
        <div className="h-full w-full bg-[#111116]" />
      )}
    </div>
  );
}
```

### Canvas props:

| Prop | Value | Purpose |
|---|---|---|
| `fov` | 40 | Field of view in degrees (vertical) |
| `near` | 0.1 | Near clipping plane |
| `far` | 50 | Far clipping plane |
| `antialias` | true | Smooth edges |
| `powerPreference` | 'high-performance' | Request dedicated GPU |
| `dpr` | [1, 1.5] | Device pixel ratio range (caps at 1.5 for performance) |

### WebGL context loss handling:

If the GPU crashes or the browser reclaims the WebGL context:
1. The `webglcontextlost` event fires
2. `e.preventDefault()` prevents default handling
3. `setWebglFailed(true)` switches to fallback text

### Conditional rendering:

- **`active` = true** → Full Canvas with 3D scene
- **`active` = false** → Empty dark div (no GPU resources used)

This means the WebGL context is only created when the section is visible.

---

## Section Mount & Visibility

```jsx
export default function TransformSection() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: '100px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative h-screen w-full overflow-hidden">
      <TransformCanvas active={isVisible} />
    </section>
  );
}
```

### IntersectionObserver:

- **rootMargin: '100px'** — Triggers 100px before the section enters the viewport (preloads early)
- When section enters viewport: `isVisible = true` → Canvas mounts → animation starts
- When section leaves viewport: `isVisible = false` → Canvas unmounts → GPU freed
- Cleanup: `observer.disconnect()` on unmount

### Section CSS:

- `h-screen` — Full viewport height
- `w-full` — Full width
- `overflow-hidden` — Clips any 3D content that might extend beyond bounds
- `relative` — Establishes positioning context

---

## Complete Render Tree

```
TransformSectionLoader (dynamic import, ssr: false)
└── TransformSection (IntersectionObserver)
    └── <section> (h-screen)
        └── TransformCanvas (conditional on isVisible)
            └── <Canvas> (R3F WebGL)
                ├── CameraRig (positions camera based on viewport)
                ├── AnimationController (drives anim.progress)
                └── <Suspense>
                    └── TransformScene
                        ├── <color> (background #111116)
                        ├── <fog> (linear fog)
                        ├── ambientLight
                        ├── directionalLight × 2
                        ├── pointLight × 3
                        ├── PulseLight (animated pointLight)
                        ├── GridFloor (plane)
                        ├── GridLines (26+ line pairs)
                        ├── Machine
                        │   ├── Body (box)
                        │   ├── Top plate (thin box)
                        │   ├── Bottom trim (thin box)
                        │   ├── Vent slots × 2 (thin boxes)
                        │   ├── Base mount (cylinder)
                        │   ├── Lever group (animated rotation.x)
                        │   │   ├── Arm (cylinder)
                        │   │   ├── Handle (cylinder, rotated)
                        │   │   └── End caps × 2 (spheres)
                        │   ├── Feet × 4 (cylinders)
                        │   ├── StatusLight (animated sphere)
                        │   └── Cable port (cylinder)
                        ├── Cable (TubeGeometry)
                        ├── LogoShape
                        │   ├── Chip body (animated ExtrudeGeometry)
                        │   ├── WM left (animated ExtrudeGeometry)
                        │   ├── WM right (animated ExtrudeGeometry)
                        │   └── Glow (animated opacity)
                        └── EnergyPulse
                            ├── Main sphere (animated position)
                            ├── Trail sphere (animated position)
                            └── Glow sphere (animated position)
```

---

## Coordinate System & Spatial Layout

Three.js uses a right-handed coordinate system:

```
        Y (up)
        |
        |
        |_______ X (right)
       /
      /
     Z (toward camera)
```

### Scene layout (top-down, as seen from camera):

```
Screen top (−Z in world)
┌──────────────────────────────────────────┐
│                                          │
│                           ┌─────┐        │
│                           │ WM  │        │  Logo at [3.2, -3.8]
│                           │Logo │        │
│                      ─────┘─────┘        │  Cable connects from left side
│                 ~~~~                     │
│            ~~~~                          │
│       ~~~~                               │  Cable S-curve (wide, on floor)
│          ~~~~~                           │
│               ~~~~~                      │
│  ┌─────────┐       ~~~~                  │
│  │ Machine │                             │  Machine at [-2.8, 3.5] (1.2x scale)
│  │  ╔═╗    │                             │
│  │  ║L║    │                             │  L = Lever
│  └──╚═╝────┘                             │
│                                          │
└──────────────────────────────────────────┘
Screen bottom (+Z in world)
```

The machine and logo are placed further apart than before (diagonal distance ~9.3 units vs ~6.0 units previously) to give the S-curve cable enough room to form a pronounced shape. The cable connects to the **left side** of the logo, not from below.

---

## Performance Considerations

1. **Module-level constants** — Colors, cable points, curve created once, never garbage collected

2. **useMemo for geometries** — Grid lines, tube geometry, logo shapes computed once

3. **Geometry disposal** — `oldBody.dispose()` prevents GPU memory leaks during extrude animation

4. **Depth change threshold** — Only rebuilds ExtrudeGeometry when depth changes by >0.001 (skips frames where change is negligible)

5. **Conditional Canvas** — WebGL context only exists when section is visible (IntersectionObserver)

6. **DPR capped at 1.5** — Prevents 3x rendering on high-DPI screens

7. **`powerPreference: 'high-performance'`** — Hints to use dedicated GPU over integrated

8. **No shadows on animated objects** — Only static meshes cast shadows to reduce shadow map updates

9. **Fog** — Naturally hides distant geometry, reducing effective draw calls

10. **Code splitting** — `next/dynamic` ensures Three.js bundle only loads when needed
