"use client"

import { useFrame, useLoader } from "@react-three/fiber"
import { useRef } from "react"
import { CylinderGeometry, DoubleSide, TextureLoader } from "three"

const images = [
  "/images/image-1.jpg",
  "/images/image-2.jpg",
  "/images/image-3.jpg",
  "/images/image-4.jpg",
]

function CurvedPanel({ texture, angle, radius }) {
  const segmentAngle = (Math.PI * 2) / images.length
  const gap = 0.15

  const geometry = new CylinderGeometry(
    radius,
    radius,
    2.5,
    32,
    1,
    true,
    angle - (segmentAngle - gap) / 2,
    segmentAngle - gap,
  )

  // Flip UVs so texture maps correctly on the outside
  const uvs = geometry.attributes.uv
  for (let i = 0; i < uvs.count; i++) {
    uvs.setX(i, 1 - uvs.getX(i))
  }

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial map={texture} side={DoubleSide} />
    </mesh>
  )
}

export default function RotatingCylinder() {
  const groupRef = useRef()
  const radius = 3

  const textures = useLoader(TextureLoader, images)

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.003
    }
  })

  return (
    <group ref={groupRef}>
      {images.map((_, i) => {
        const angle = (i / images.length) * Math.PI * 2
        return (
          <CurvedPanel
            key={i}
            texture={textures[i]}
            angle={angle}
            radius={radius}
          />
        )
      })}
    </group>
  )
}
