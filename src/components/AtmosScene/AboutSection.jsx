'use client';

import { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

// Shared drag state passed via ref so AstronautModel can read it inside useFrame
function AstronautModel({ dragRef }) {
  const gltf = useLoader(GLTFLoader, '/models/astronaut.glb');
  const groupRef = useRef();

  const box = new THREE.Box3().setFromObject(gltf.scene);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = 1.8 / maxDim;
  const offsetX = -center.x * scale;
  const offsetZ = -center.z * scale;
  const offsetY = -center.y * scale;

  // Track current euler angles so drag blends into idle
  const rotY = useRef(0);
  const rotX = useRef(0);
  // Track how much drag delta we've already consumed (avoids mutating the prop ref)
  const consumedDrag = useRef({ deltaX: 0, deltaY: 0 });

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const drag = dragRef.current;

    if (drag.isDragging) {
      // Calculate unconsumed delta
      const dx = drag.deltaX - consumedDrag.current.deltaX;
      const dy = drag.deltaY - consumedDrag.current.deltaY;
      consumedDrag.current.deltaX = drag.deltaX;
      consumedDrag.current.deltaY = drag.deltaY;

      rotY.current += dx * 0.008;
      rotX.current += dy * 0.008;
      // Clamp X so it doesn't flip upside down
      rotX.current = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, rotX.current));
    } else {
      // Stay in sync while not dragging
      consumedDrag.current.deltaX = drag.deltaX;
      consumedDrag.current.deltaY = drag.deltaY;
      // Slow idle auto-rotate when not dragging
      rotY.current += delta * 0.25;
      // Ease rotX back to 0
      rotX.current += (0 - rotX.current) * delta * 1.5;
    }

    groupRef.current.rotation.y = rotY.current;
    groupRef.current.rotation.x = rotX.current;
    groupRef.current.position.y = offsetY + Math.sin(t * 0.6) * 0.08;
  });

  return (
    <group ref={groupRef} scale={scale} position={[offsetX, 0, offsetZ]}>
      <primitive object={gltf.scene} />
    </group>
  );
}

function SpaceScene({ dragRef }) {
  return (
    <>
      <color attach="background" args={['#000008']} />
      <ambientLight intensity={0.4} color="#ccd8ff" />
      <directionalLight position={[3, 5, 3]} intensity={1.8} color="#ffffff" />
      <directionalLight position={[-4, -2, -3]} intensity={0.3} color="#4488ff" />
      <pointLight position={[0, 3, 2]} intensity={0.6} color="#aaccff" />
      <Suspense fallback={null}>
        <AstronautModel dragRef={dragRef} />
      </Suspense>
    </>
  );
}

// Canvas wrapper that attaches pointer/touch listeners for drag-to-rotate
function AstronautCanvas() {
  const containerRef = useRef(null);
  // dragRef holds mutable drag state — no re-renders needed
  const dragRef = useRef({ isDragging: false, lastX: 0, lastY: 0, deltaX: 0, deltaY: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onPointerDown = (e) => {
      dragRef.current.isDragging = true;
      dragRef.current.lastX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      dragRef.current.lastY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
      dragRef.current.deltaX = 0;
      dragRef.current.deltaY = 0;
      el.style.cursor = 'grabbing';
    };

    const onPointerMove = (e) => {
      if (!dragRef.current.isDragging) return;
      const x = e.clientX ?? e.touches?.[0]?.clientX ?? dragRef.current.lastX;
      const y = e.clientY ?? e.touches?.[0]?.clientY ?? dragRef.current.lastY;
      dragRef.current.deltaX += x - dragRef.current.lastX;
      dragRef.current.deltaY += y - dragRef.current.lastY;
      dragRef.current.lastX = x;
      dragRef.current.lastY = y;
    };

    const onPointerUp = () => {
      dragRef.current.isDragging = false;
      el.style.cursor = 'grab';
    };

    const onTouchMove = (e) => {
      // Block page scroll while dragging inside the canvas
      if (dragRef.current.isDragging) e.preventDefault();
      onPointerMove(e);
    };

    el.style.cursor = 'grab';
    el.addEventListener('mousedown', onPointerDown);
    el.addEventListener('touchstart', onPointerDown, { passive: true });
    // Must be non-passive to call preventDefault
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchend', onPointerUp);

    return () => {
      el.removeEventListener('mousedown', onPointerDown);
      el.removeEventListener('touchstart', onPointerDown);
      el.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchend', onPointerUp);
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        gl={{ antialias: true }}
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <SpaceScene dragRef={dragRef} />
      </Canvas>
    </div>
  );
}

export default function AboutSection() {
  return (
    <section className="relative overflow-hidden bg-[#eef0f4]">
      {/* Decorative arcs — repositioned per breakpoint */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M 1100 -60 Q 1380 300 1200 900" stroke="#00d4d4" strokeWidth="9" strokeLinecap="round" opacity="0.95" />
        <path d="M 1160 -60 Q 1440 310 1260 900" stroke="#f0a882" strokeWidth="5" strokeLinecap="round" opacity="0.75" />
        <path d="M 1210 -60 Q 1490 320 1310 900" stroke="#c4b8e0" strokeWidth="4" strokeLinecap="round" opacity="0.55" />
      </svg>

      {/* ── Desktop / Tablet landscape: side-by-side ── */}
      <div className="hidden min-h-screen md:flex">
        {/* Left — tablet mockup */}
        <div className="relative flex shrink-0 items-center lg:w-[55%] md:w-[50%]">
          <div
            className="relative ml-4 lg:ml-6 rounded-4xl lg:rounded-[2.8rem]"
            style={{
              background: 'linear-gradient(160deg, #3a3a3a 0%, #1c1c1c 60%, #0e0e0e 100%)',
              boxShadow: '0 0 0 1.5px rgba(255,255,255,0.07), 0 40px 100px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.10)',
              padding: '8px',
              width: '100%',
              maxWidth: 740,
            }}
          >
            <div className="mb-1.5 flex items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-[#2a2a2a]" />
            </div>
            <div className="overflow-hidden rounded-[1.6rem] lg:rounded-4xl" style={{ aspectRatio: '4/3' }}>
              <AstronautCanvas />
            </div>
            <div className="mx-auto mt-2 h-1 w-16 lg:w-20 rounded-full bg-white opacity-15" />
          </div>
        </div>

        {/* Right — text */}
        <div className="relative z-10 flex flex-1 flex-col justify-center py-16 pr-10 pl-8 lg:pr-16 lg:pl-12">
          <p className="mb-6 text-[clamp(15px,1.4vw,20px)] leading-[1.7] text-gray-800">
            At Lusion, we don&apos;t follow trends for the sake of it. We believe in a different
            approach &mdash; one that&apos;s centered around you, your audience, and the art of
            creating a memorable, personalized experience.
          </p>
          <p className="text-[clamp(15px,1.4vw,20px)] leading-[1.7] text-gray-800">
            Our commitment goes beyond fleeting trends; it&apos;s about crafting tailor-made digital
            journeys that resonate uniquely and leave a lasting impact.
          </p>
        </div>
      </div>

      {/* ── Mobile: stacked ── */}
      <div className="flex flex-col md:hidden">
        {/* Tablet mockup — top */}
        <div className="relative flex items-center justify-center px-5 pt-12 pb-6">
          <div
            className="relative w-full max-w-sm rounded-[1.8rem]"
            style={{
              background: 'linear-gradient(160deg, #3a3a3a 0%, #1c1c1c 60%, #0e0e0e 100%)',
              boxShadow: '0 0 0 1.5px rgba(255,255,255,0.07), 0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.10)',
              padding: '7px',
            }}
          >
            <div className="mb-1.5 flex items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-[#2a2a2a]" />
            </div>
            <div className="overflow-hidden rounded-[1.4rem]" style={{ aspectRatio: '4/3' }}>
              <AstronautCanvas />
            </div>
            <div className="mx-auto mt-2 h-1 w-14 rounded-full bg-white opacity-15" />
          </div>
        </div>

        {/* Text — bottom */}
        <div className="relative z-10 px-6 pb-14 pt-4 text-center">
          <p className="mb-5 text-[17px] leading-[1.75] text-gray-800">
            At Lusion, we don&apos;t follow trends for the sake of it. We believe in a different
            approach &mdash; one that&apos;s centered around you, your audience, and the art of
            creating a memorable, personalized experience.
          </p>
          <p className="text-[17px] leading-[1.75] text-gray-800">
            Our commitment goes beyond fleeting trends; it&apos;s about crafting tailor-made digital
            journeys that resonate uniquely and leave a lasting impact.
          </p>
        </div>
      </div>
    </section>
  );
}
