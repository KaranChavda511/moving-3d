"use client"

import { useFrame } from "@react-three/fiber"
import { useTexture } from "@react-three/drei"
import { useRef, useMemo } from "react"
import { CylinderGeometry, DoubleSide } from "three"

const images = [
  "/images/image-1.jpg",
  "/images/image-2.jpg",
  "/images/image-3.jpg",
  "/images/image-4.jpg",
]

function CurvedPanel({ texture, angle, radius }) {
  const geometry = useMemo(() => {
    const segmentAngle = (Math.PI * 2) / images.length
    const gap = 0.15

    const geo = new CylinderGeometry(
      radius,
      radius,
      1.8,
      32,
      1,
      true,
      angle - (segmentAngle - gap) / 2,
      segmentAngle - gap,
    )

    // Flip UVs so texture maps correctly on the outside
    const uvs = geo.attributes.uv
    for (let i = 0; i < uvs.count; i++) {
      uvs.setX(i, 1 - uvs.getX(i))
    }

    return geo
  }, [angle, radius])

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial map={texture} side={DoubleSide} />
    </mesh>
  )
}

export default function RotatingCylinder() {
  const groupRef = useRef()
  const radius = 2.2

  const textures = useTexture(images)

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.003
    }
  })

  return (
    <group ref={groupRef} position={[0, 0.5, 0]}>
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
