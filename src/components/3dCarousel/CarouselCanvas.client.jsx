"use client"

import { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { Sparkles, OrbitControls, useTexture } from "@react-three/drei"
import RotatingCylinder from "./RotatingCylinder"

const images = [
  "/images/image-1.jpg",
  "/images/image-2.jpg",
  "/images/image-3.jpg",
  "/images/image-4.jpg",
]

// Preload textures as soon as this module is imported
images.forEach((src) => useTexture.preload(src))

export default function CarouselCanvas() {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Canvas
        camera={{ position: [0, 1.5, 8], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ powerPreference: "high-performance", alpha: true }}
        style={{ background: "transparent" }}
      >
        {/* Lights and particles render immediately */}
        <ambientLight intensity={1.8} />
        <directionalLight position={[2, 3, 4]} intensity={0.5} />
        <OrbitControls enableZoom={false} enablePan={false} />

        {/* Dense golden/orange particles */}
        <Sparkles
          count={400}
          scale={16}
          size={3}
          speed={0.4}
          color="#f6c177"
          opacity={0.7}
        />
        {/* Smaller warm accent particles */}
        <Sparkles
          count={250}
          scale={12}
          size={1.5}
          speed={0.2}
          color="#e8a04a"
          opacity={0.5}
        />
        {/* Faint wide-spread ambient particles */}
        <Sparkles
          count={200}
          scale={20}
          size={2}
          speed={0.15}
          color="#ffcc80"
          opacity={0.35}
        />

        {/* Cylinder suspends until textures are loaded */}
        <Suspense fallback={null}>
          <RotatingCylinder />
        </Suspense>
      </Canvas>
    </div>
  )
}
