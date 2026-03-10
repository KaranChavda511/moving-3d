"use client"

import { useState, useCallback } from "react"
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
  const [tiltStatus, setTiltStatus] = useState("idle")

  const handleTiltStatusChange = useCallback((status) => {
    setTiltStatus(status)
  }, [])

  const handleEnableTilt = () => {
    window.dispatchEvent(new Event("request-device-orientation"))
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center">
      <ParallaxHeroImages
        images={images}
        onTiltStatusChange={handleTiltStatusChange}
      />
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_20px_rgba(0,0,0,0.8)] sm:text-4xl md:text-6xl">
          Immersive Parallax <span className="text-primary">Gallery</span>
        </h2>
        <p className="max-w-md text-sm text-white/60 drop-shadow-[0_0_10px_rgba(0,0,0,0.6)] sm:text-base">
          <span className="hidden md:inline">Move your mouse to see the parallax effect.</span>
          <span className="md:hidden">
            {tiltStatus === "active"
              ? "Tilt your device — images move with your motion."
              : "Tilt your device to see the parallax effect."}
          </span>
          {" "}Images at different depths move at different speeds.
        </p>
        {tiltStatus === "needs-permission" && (
          <button
            onClick={handleEnableTilt}
            className="mt-2 rounded-full border border-white/20 bg-white/10 px-6 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors active:bg-white/20 md:hidden"
          >
            Tap to enable tilt effect
          </button>
        )}
      </div>
    </div>
  )
}

export default ParallaxShowcaseContent
