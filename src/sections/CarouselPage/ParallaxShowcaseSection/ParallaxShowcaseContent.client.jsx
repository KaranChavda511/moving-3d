"use client"

import { ParallaxHeroImages } from "@/components/ui/parallax-hero-images"

const images = [
  "/images/image-1.jpg",
  "/images/image-2.jpg",
  "/images/image-3.jpg",
  "/images/image-4.jpg",
  "/images/image-1.jpg",
  "/images/image-2.jpg",
]

const ParallaxShowcaseContent = () => {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center">
      <ParallaxHeroImages images={images} />
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 text-center">
        <h2 className="text-4xl font-bold tracking-tight text-white drop-shadow-[0_0_20px_rgba(0,0,0,0.8)] md:text-6xl">
          Immersive Parallax <span className="text-primary">Gallery</span>
        </h2>
        <p className="max-w-md text-white/60 drop-shadow-[0_0_10px_rgba(0,0,0,0.6)]">
          Move your mouse to see the parallax effect. Images at different depths
          move at different speeds.
        </p>
      </div>
    </div>
  )
}

export default ParallaxShowcaseContent
