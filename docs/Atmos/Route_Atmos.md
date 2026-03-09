Atmos route:

Project Structure
File	Purpose
page.jsx	Next.js route entry point
index.jsx	Main scroll-driven controller
AtmosExperience.jsx	3D flight scene (clouds, airplane, sky)
AboutSection.jsx	Interactive astronaut 3D model section
AtmosSceneLoader.jsx	Dynamic import wrapper (SSR disabled)
AboutSectionLoader.jsx	Dynamic import wrapper (SSR disabled)
atmos.module.css	CSS animations (equalizer, letter intro, bounce)
Packages Used & Why
Package	Why
@react-three/fiber	React renderer for Three.js — lets you write 3D scenes as React components instead of imperative Three.js code
three	The underlying 3D graphics engine (WebGL). Handles rendering, shaders, geometry, lighting
three/examples/jsm/loaders/GLTFLoader	Loads .glb 3D model files (airplane, clouds, astronaut)
three/examples/jsm/libs/meshopt_decoder	Decompresses the astronaut model (compressed from 19.5 MB to 1.36 MB)
motion (Framer Motion)	Scroll-tracking hooks (useScroll, useTransform) that drive the entire animation timeline
next	App Router framework, next/dynamic for lazy-loading WebGL components with ssr: false
tailwindcss	Utility CSS for layout, responsive design, z-index management
How the Scroll-Driven Animation Works
The entire experience is a 600vh tall wrapper with a sticky viewport:


User scrolls → useScroll() gives scrollYProgress (0 to 1)
    ↓
useMotionValueEvent → updates scrollRef.current (bridges React state → Three.js frame loop)
    ↓
useFrame() runs every frame:
    ├─ Camera moves along a CatmullRomCurve3 flight path
    ├─ Sky shader color transitions via uProgress uniform
    ├─ Cloud colors lerp based on progress
    └─ Airplane follows camera with banking/bobbing
    ↓
Text overlays use useTransform() for scroll-range opacity fade-in/out
5 text overlays appear at specific scroll ranges (e.g., 0.06–0.2, 0.22–0.38, etc.), each fading in and out smoothly.

How the Sky Works
A custom GLSL shader on a large sphere rendered from the inside (THREE.BackSide):

Vertex shader: passes UV coordinates and a vertical gradient factor
Fragment shader: receives a uProgress uniform (0–1 from scroll) and interpolates between 5 color stops:
0–0.2: Deep blue
0.2–0.4: Blue → sunset orange
0.4–0.65: Sunset → warm tones
0.65–0.85: Warm → pink
0.85–1.0: Deep pink/magenta
The sphere rotates slowly (0.0001 rad/frame) for subtle movement.

How the Clouds Work
Not images — they're 3D models loaded from /models/Cloud.glb:

One cloud model is loaded and cached globally (reference counted)
45 cloud instances are created by cloning the geometry:
30 "close clouds" (2.5–7.5 units from the flight path, scale 1.0–3.5)
15 "mid-distance clouds" (8–20 units away, scale 0.5–2.0)
Placement uses a seeded pseudo-random number generator (seed: 42) so clouds appear in the same positions every time
Clouds are placed along the flight path curve at evenly spaced intervals
Cloud colors change with scroll progress using lerp():
White → soft purple → peachy rose → warm beige → off-white
Material: Transparent (opacity 0.9), matte (roughness 1), with MeshStandardMaterial.

How the Airplane Works
Loaded from /models/Airplane.glb:

Positioned 2.5 units ahead of the camera along the flight path
Banking/rolling: calculates lateral delta from curve direction, multiplies by 0.5 for realistic turns
Bobbing: Math.sin(time * 2) * 0.08 for gentle vertical float
Wobble: subtle sin/cos rotations on x/z axes
How the Astronaut 3D Model Works (AboutSection)
This is a separate section below the flight experience:

Model loading: /models/astronaut.glb loaded via GLTFLoader + MeshoptDecoder (for compressed mesh decompression)
Auto-scaling: Bounding box is calculated, model is normalized to 1.8 units and centered
Idle animation:
Y-axis auto-rotation at delta * 0.25 rad/frame
Vertical bobbing: Math.sin(t * 0.6) * 0.08
Drag-to-rotate interaction:
Pointer/touch events tracked on the canvas container
Sensitivity: 0.008 radians per pixel of mouse movement
X-rotation clamped to ±π/2.2 (prevents flipping upside down)
When released, X-rotation eases back to 0
Conditional rendering: Canvas only mounts when visible (IntersectionObserver with 200px margin)
Display: Shown inside a fake "tablet" frame (dark gradient with notch cutout)
Lighting for astronaut: Multiple directional + point lights for dramatic effect, background #000008.

How the "Pan" Images / Layout Works
There are no pan images — the panoramic sky effect is entirely the custom GLSL sky shader sphere surrounding the camera. As you scroll, the camera moves along the 3D curve, and the sky color transitions give the illusion of a panoramic journey through the atmosphere.

Performance Optimizations
Meshopt compression: Astronaut model 19.5 MB → 1.36 MB
Model caching: Cloud .glb loaded once, cloned for all 45 instances with ref counting
DPR clamped: [1, 1.5] — avoids rendering at full retina resolution
SSR disabled: next/dynamic with ssr: false for all WebGL components
Lazy canvas mount: IntersectionObserver delays astronaut Canvas until visible
Cleanup: Material/geometry disposal on unmount to prevent memory leaks