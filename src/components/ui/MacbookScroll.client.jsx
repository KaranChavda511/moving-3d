"use client"

import React, { useRef, useSyncExternalStore } from "react"
import Image from "next/image"
import { motion, useScroll, useTransform } from "motion/react"

const subscribe = (cb) => {
  window.addEventListener("resize", cb)
  return () => window.removeEventListener("resize", cb)
}

export const MacbookScroll = ({ src, title, showGradient = true }) => {
  const ref = useRef(null)

  const isMobile = useSyncExternalStore(
    subscribe,
    () => window.innerWidth < 768,
    () => false,
  )

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: isMobile ? ["start end", "end start"] : ["start start", "end start"],
  })

  const scaleX = useTransform(
    scrollYProgress,
    isMobile ? [0.1, 0.4] : [0, 0.3],
    [1.2, isMobile ? 1.1 : 1.5],
  )
  const scaleY = useTransform(
    scrollYProgress,
    isMobile ? [0.1, 0.4] : [0, 0.3],
    [0.6, isMobile ? 1.1 : 1.5],
  )
  const translate = useTransform(
    scrollYProgress,
    isMobile ? [0.15, 0.6] : [0, 1],
    [0, isMobile ? 300 : 1500],
  )
  const rotate = useTransform(
    scrollYProgress,
    isMobile ? [0.15, 0.18, 0.4] : [0.1, 0.12, 0.3],
    [-28, -28, 0],
  )
  const textTransform = useTransform(scrollYProgress, isMobile ? [0.1, 0.35] : [0, 0.3], [0, 100])
  const textOpacity = useTransform(scrollYProgress, isMobile ? [0.1, 0.3] : [0, 0.2], [1, 0])

  return (
    <div
      ref={ref}
      className="flex min-h-[120vh] shrink-0 transform flex-col items-center justify-start py-10 perspective-midrange sm:min-h-[150vh] sm:py-20 md:min-h-[200vh] md:py-80"
    >
      <motion.h2
        style={{
          translateY: textTransform,
          opacity: textOpacity,
        }}
        className="mb-10 px-4 text-center text-2xl font-bold text-white sm:text-3xl md:mb-20"
      >
        {title || (
          <span>
            Scroll to reveal the <br /> magic within.
          </span>
        )}
      </motion.h2>

      {/* Lid */}
      <Lid
        src={src}
        scaleX={scaleX}
        scaleY={scaleY}
        rotate={rotate}
        translate={translate}
      />

      {/* Base area */}
      <div className="relative -z-10 h-44 w-64 overflow-hidden rounded-xl bg-[#272729] sm:h-64 sm:w-96 sm:rounded-2xl md:h-88 md:w-lg">
        {/* Above keyboard bar */}
        <div className="relative h-5 w-full sm:h-8 md:h-10">
          <div className="absolute inset-x-0 mx-auto h-2 w-[80%] bg-[#050505] sm:h-3 md:h-4" />
        </div>

        {/* Simplified keyboard */}
        <div className="relative flex">
          <div className="mx-auto h-full w-[10%] overflow-hidden">
            <SpeakerGrid />
          </div>
          <div className="mx-auto h-full w-[80%]">
            <SimpleKeyboard />
          </div>
          <div className="mx-auto h-full w-[10%] overflow-hidden">
            <SpeakerGrid />
          </div>
        </div>

        {/* Trackpad */}
        <div
          className="mx-auto my-1 h-16 w-[40%] rounded-lg sm:h-24 sm:rounded-xl md:h-32"
          style={{ boxShadow: "0px 0px 1px 1px #00000020 inset" }}
        />

        {/* Bottom notch */}
        <div className="absolute inset-x-0 bottom-0 mx-auto h-1.5 w-12 rounded-tl-2xl rounded-tr-2xl bg-linear-to-t from-[#272729] to-[#050505] sm:h-2 sm:w-16 md:w-20 md:rounded-tl-3xl md:rounded-tr-3xl" />

        {showGradient && (
          <div className="absolute inset-x-0 bottom-0 z-50 h-20 w-full bg-linear-to-t from-black via-black to-transparent sm:h-32 md:h-40" />
        )}
      </div>
    </div>
  )
}

const Lid = ({ scaleX, scaleY, rotate, translate, src }) => {
  return (
    <div className="relative perspective-midrange">
      {/* Back of lid (visible when closed) */}
      <div
        style={{
          transform: "perspective(800px) rotateX(-25deg) translateZ(0px)",
          transformOrigin: "bottom",
          transformStyle: "preserve-3d",
        }}
        className="relative h-24 w-64 rounded-xl bg-[#010101] p-1.5 sm:h-36 sm:w-96 sm:rounded-2xl sm:p-2 md:h-48 md:w-lg"
      >
        <div
          style={{ boxShadow: "0px 2px 0px 2px #171717 inset" }}
          className="absolute inset-0 flex items-center justify-center rounded-lg bg-[#010101]"
        >
          <span className="text-lg text-white/20 sm:text-2xl">⌘</span>
        </div>
      </div>

      {/* Front of lid (screen with image) */}
      <motion.div
        style={{
          scaleX,
          scaleY,
          rotateX: rotate,
          translateY: translate,
          transformStyle: "preserve-3d",
          transformOrigin: "top",
        }}
        className="absolute inset-0 h-48 w-64 rounded-xl bg-[#010101] p-1.5 sm:h-72 sm:w-96 sm:rounded-2xl sm:p-2 md:h-96 md:w-lg"
      >
        <div className="absolute inset-0 rounded-lg bg-[#272729]" />
        {src && (
          <Image
            src={src}
            alt="Macbook screen content"
            fill
            className="absolute inset-0 rounded-lg object-cover object-top-left"
          />
        )}
      </motion.div>
    </div>
  )
}

const SpeakerGrid = () => {
  return (
    <div
      className="mt-1 flex h-20 gap-0.5 px-[0.5px] sm:mt-2 sm:h-28 md:h-40"
      style={{
        backgroundImage:
          "radial-gradient(circle, #08080A 0.5px, transparent 0.5px)",
        backgroundSize: "3px 3px",
      }}
    />
  )
}

const SimpleKeyboard = () => {
  return (
    <div className="mx-0.5 h-full rounded-md bg-[#050505] p-0.5 sm:mx-1 sm:p-1">
      {[14, 14, 14, 13, 12, 10].map((keyCount, rowIdx) => (
        <div key={rowIdx} className="mb-px flex w-full shrink-0 gap-px sm:mb-0.5 sm:gap-0.5">
          {Array.from({ length: keyCount }).map((_, keyIdx) => (
            <div
              key={keyIdx}
              className="h-3 flex-1 rounded-xs bg-[#0A090D] sm:h-4 sm:rounded-[3px] md:h-6 md:rounded-[3.5px]"
              style={{
                boxShadow:
                  "0px -0.5px 2px 0 #0D0D0F inset, -0.5px 0px 2px 0 #0D0D0F inset",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
