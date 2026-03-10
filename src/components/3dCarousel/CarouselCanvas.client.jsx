"use client"

import { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import RotatingCylinder from "./RotatingCylinder"

export default function CarouselCanvas() {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[1, 1, 1]} />
          <RotatingCylinder />
          <OrbitControls />
        </Suspense>
      </Canvas>
    </div>
  )
}
