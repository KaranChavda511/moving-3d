"use client"

import dynamic from "next/dynamic"

const CarouselCanvas = dynamic(
  () => import("@/components/3dCarousel/CarouselCanvas.client"),
  { ssr: false },
)

export default function CarouselCanvasLoader() {
  return <CarouselCanvas />
}
