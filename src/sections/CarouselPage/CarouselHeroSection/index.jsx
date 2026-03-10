"use client"

import dynamic from "next/dynamic"

const CarouselCanvas = dynamic(
  () => import("@/components/3dCarousel/CarouselCanvas.client"),
  { ssr: false },
)

const CarouselHeroSection = () => {
  return (
    <section className="h-screen bg-black">
      <CarouselCanvas />
    </section>
  )
}

export default CarouselHeroSection
