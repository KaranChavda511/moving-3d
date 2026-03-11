"use client"

import React, { useRef, useSyncExternalStore } from "react"
import Image from "next/image"
import { motion, useScroll, useTransform } from "motion/react"

const subscribe = (cb) => {
  window.addEventListener("resize", cb)
  return () => window.removeEventListener("resize", cb)
}

export const MacbookScroll = ({ src, videoSrc, title, showGradient = true }) => {
  const ref = useRef(null)

  const isMobile = useSyncExternalStore(
    subscribe,
    () => window.innerWidth < 768,
    () => false,
  )

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  })

  // === TIMELINE ===
  // 0–20%  → closed laptop (lid flat on base, logo visible)
  // 20–60% → lid opens from hinge
  // 60–80% → screen powers on
  // 80–100% → idle

  // Lid rotation: -115° = completely flat/closed (past 90, folded onto base)
  // 15° = fully open (screen facing user, tilted back slightly)
  const lidRotate = useTransform(
    scrollYProgress,
    isMobile ? [0, 0.2, 0.4, 0.55] : [0, 0.2, 0.45, 0.6],
    [-100, -100, -70, 15],
  )

  // Camera tilt — looking down at 60° initially to see the flat closed laptop
  const cameraTilt = useTransform(
    scrollYProgress,
    isMobile ? [0, 0.2, 0.55] : [0, 0.2, 0.6],
    [90, 80, 4],
  )

  // Keyboard cover — hides keyboard when closed
  const coverOpacity = useTransform(
    scrollYProgress,
    isMobile ? [0.3, 0.45] : [0.3, 0.5],
    [1, 0],
  )

  // Screen content fades in AFTER lid is open
  const screenOpacity = useTransform(
    scrollYProgress,
    isMobile ? [0.5, 0.7] : [0.6, 0.8],
    [0, 1],
  )

  // Screen glow
  const screenGlowOpacity = useTransform(
    scrollYProgress,
    isMobile ? [0.5, 0.6, 0.75] : [0.6, 0.7, 0.85],
    [0, 0.5, 0],
  )

  // Title text — visible while closed, fades during opening
  const textTransform = useTransform(
    scrollYProgress,
    isMobile ? [0.15, 0.35] : [0.15, 0.35],
    [0, -60],
  )
  const textOpacity = useTransform(
    scrollYProgress,
    isMobile ? [0.15, 0.3] : [0.15, 0.3],
    [1, 0],
  )

  // Reveal text — appears when laptop is fully open
  const revealTextOpacity = useTransform(
    scrollYProgress,
    isMobile ? [0.55, 0.7] : [0.6, 0.75],
    [0, 1],
  )
  const revealTextY = useTransform(
    scrollYProgress,
    isMobile ? [0.55, 0.7] : [0.6, 0.75],
    [30, 0],
  )

  return (
    <div
      ref={ref}
      className="relative min-h-[200vh] sm:min-h-[250vh] md:min-h-[300vh]"
    >
      {/* Sticky container — stays centered in viewport while scrolling */}
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center">
        <motion.h2
          style={{
            translateY: textTransform,
            opacity: textOpacity,
          }}
          className="mb-6 px-4 text-center text-2xl font-bold text-white sm:mb-8 sm:text-3xl md:mb-10"
        >
          {title || (
            <span>
              Scroll to reveal the <br /> magic within.
            </span>
          )}
        </motion.h2>

        {/* 3D Laptop */}
        <motion.div
          style={{
            perspective: "1200px",
            rotateX: cameraTilt,
            willChange: "transform",
          }}
          className="flex items-center justify-center"
        >
          <div className="relative" style={{ transformStyle: "preserve-3d" }}>

            {/* === LID === */}
            <motion.div
              style={{
                rotateX: lidRotate,
                transformOrigin: "bottom center",
                transformStyle: "preserve-3d",
                willChange: "transform",
              }}
              className="relative -mb-px w-64 sm:w-96 md:w-lg"
            >
              {/* Screen face (hidden when closed — backface) */}
              <div
                className="relative h-36 w-full rounded-t-xl bg-[#0a0a0a] p-1.5 sm:h-52 sm:rounded-t-2xl sm:p-2 md:h-72 md:p-3"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="relative h-full w-full overflow-hidden rounded-lg bg-[#1a1a1a]">
                  {/* Screen glow */}
                  <motion.div
                    style={{ opacity: screenGlowOpacity }}
                    className="absolute -inset-4 rounded-xl bg-blue-400/20 blur-xl"
                  />
                  {/* Screen content */}
                  <motion.div
                    style={{ opacity: screenOpacity }}
                    className="absolute inset-0"
                  >
                    {videoSrc ? (
                      <video
                        src={videoSrc}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="h-full w-full rounded-lg object-cover object-top-left"
                      />
                    ) : src ? (
                      <Image
                        src={src}
                        alt="Macbook screen content"
                        fill
                        unoptimized={src.endsWith(".gif")}
                        className="rounded-lg object-contain"
                      />
                    ) : null}
                  </motion.div>
                </div>
              </div>

              {/* Logo/back face (visible when closed — faces up) */}
              <div
                className="absolute inset-0 flex h-36 w-full items-center justify-center rounded-t-xl sm:h-52 sm:rounded-t-2xl md:h-72"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateX(180deg)",
                  background: "linear-gradient(160deg, #2a2a2c 0%, #1a1a1c 30%, #141416 70%, #0e0e10 100%)",
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.06) inset",
                }}
              >
                <svg
                  className="h-8 w-8 opacity-15 sm:h-10 sm:w-10 md:h-12 md:w-12"
                  viewBox="0 0 170 170"
                  fill="currentColor"
                >
                  <path
                    d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.2-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.28 2.13-9.54 3.24-12.8 3.35-4.93.21-9.84-1.96-14.75-6.52-3.13-2.73-7.05-7.41-11.76-14.04-5.05-7.08-9.2-15.29-12.46-24.65-3.49-10.11-5.24-19.9-5.24-29.38 0-10.86 2.35-20.22 7.04-28.06 3.69-6.3 8.6-11.27 14.75-14.91 6.15-3.64 12.8-5.5 19.97-5.63 3.92 0 9.06 1.21 15.43 3.59 6.36 2.39 10.44 3.6 12.24 3.6 1.35 0 5.92-1.42 13.67-4.24 7.33-2.62 13.52-3.7 18.59-3.27 13.73 1.11 24.05 6.52 30.9 16.28-12.28 7.44-18.36 17.86-18.24 31.22.11 10.41 3.89 19.07 11.31 25.95 3.37 3.19 7.12 5.66 11.29 7.41-.91 2.63-1.86 5.14-2.87 7.55zM119.11 7.24c0 8.16-2.98 15.78-8.93 22.83-7.18 8.4-15.86 13.25-25.28 12.49a25.4 25.4 0 0 1-.19-3.09c0-7.83 3.41-16.22 9.47-23.07 3.03-3.45 6.88-6.32 11.56-8.61 4.67-2.26 9.08-3.51 13.24-3.75.12 1.08.13 2.16.13 3.2z"
                    className="text-white"
                  />
                </svg>
              </div>
            </motion.div>

            {/* === BASE === */}
            <div
              className="relative h-36 w-64 overflow-hidden rounded-b-xl sm:h-52 sm:w-96 sm:rounded-b-2xl md:h-72 md:w-lg"
              style={{
                background: "linear-gradient(180deg, #3a3a3e 0%, #2c2c30 40%, #252528 100%)",
              }}
            >
              {/* Cover — hides keyboard when closed */}
              <motion.div
                style={{ opacity: coverOpacity }}
                className="absolute inset-0 z-10 rounded-b-xl bg-[#131313]"
              />

              {/* Hinge strip */}
              <div
                className="h-1.5 w-full sm:h-2 md:h-2.5"
                style={{ background: "linear-gradient(180deg, #1a1a1c 0%, #2a2a2e 100%)" }}
              />

              {/* Speaker + Keyboard row */}
              <div className="flex px-1.5 pt-1 sm:px-2.5 sm:pt-1.5 md:px-4 md:pt-2">
                {/* Left speaker */}
                <div className="w-[8%] pt-0.5 sm:pt-1">
                  <SpeakerGrid />
                </div>

                {/* Keyboard area */}
                <div className="flex-1 px-1 sm:px-1.5 md:px-2">
                  <SimpleKeyboard />
                </div>

                {/* Right speaker */}
                <div className="w-[8%] pt-0.5 sm:pt-1">
                  <SpeakerGrid />
                </div>
              </div>

              {/* Trackpad */}
              <div
                className="mx-auto mt-1.5 h-10 w-[38%] rounded-md sm:mt-2 sm:h-16 sm:rounded-lg md:mt-3 md:h-24 md:rounded-xl"
                style={{
                  background: "linear-gradient(180deg, #2e2e32 0%, #28282c 100%)",
                  boxShadow: "0 0 0 0.5px #1a1a1e inset, 0 1px 2px rgba(0,0,0,0.3) inset",
                }}
              />

              {/* Bottom notch */}
              <div className="absolute inset-x-0 bottom-0 flex justify-center">
                <div
                  className="h-1 w-10 rounded-t-lg sm:h-1.5 sm:w-14 md:w-16"
                  style={{ background: "linear-gradient(180deg, #1e1e22 0%, #28282c 100%)" }}
                />
              </div>

              {showGradient && (
                <div className="absolute inset-x-0 bottom-0 z-50 h-16 w-full bg-linear-to-t from-black via-black to-transparent sm:h-24 md:h-32" />
              )}
            </div>
          </div>
        </motion.div>

        {/* Reveal text — appears when laptop is fully open */}
        <motion.div
          style={{
            opacity: revealTextOpacity,
            translateY: revealTextY,
          }}
          className="mt-6 px-4 text-center sm:mt-8 md:mt-10"
        >
          <h3 className="text-xl font-semibold text-white sm:text-2xl md:text-3xl">
            Hello, Visitors.
          </h3>
          <p className="mt-2 text-sm text-white/50 sm:text-base md:text-lg">
            Explore the 3D Carousel experience across all your devices.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

const SpeakerGrid = () => {
  return (
    <div
      className="h-14 w-full rounded-sm sm:h-20 md:h-28"
      style={{
        backgroundImage:
          "radial-gradient(circle, #1a1a1e 0.5px, transparent 0.5px)",
        backgroundSize: "3px 3px",
      }}
    />
  )
}

const KEYBOARD_ROWS = [
  ["esc", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12", "⏏"],
  ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "⌫"],
  ["⇥", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]", "\\"],
  ["⇪", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "⏎"],
  ["⇧", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "⇧"],
  ["fn", "⌃", "⌥", "⌘", "", "⌘", "⌥", "←", "↑", "↓", "→"],
]

const SimpleKeyboard = () => {
  return (
    <div className="flex flex-col gap-[1.5px] sm:gap-0.5 md:gap-0.75">
      {KEYBOARD_ROWS.map((row, rowIdx) => (
        <div key={rowIdx} className="flex w-full gap-[1.5px] sm:gap-0.5 md:gap-0.75">
          {row.map((key, keyIdx) => (
            <div
              key={keyIdx}
              className={`flex items-center justify-center rounded-[1.5px] text-white/40 sm:rounded-xs md:rounded-sm ${
                key === "" ? "flex-3" : rowIdx === 0 ? "h-2 flex-1 sm:h-3 md:h-4" : "h-3 flex-1 sm:h-4.5 md:h-6"
              }`}
              style={{
                fontSize: rowIdx === 0 ? "4px" : "5px",
                background: "linear-gradient(180deg, #222226 0%, #18181c 100%)",
                boxShadow:
                  "0 1px 0 0 #2e2e32, 0 -0.5px 0 0 #0c0c10 inset, 0.5px 0 0 0 #0c0c10 inset, -0.5px 0 0 0 #0c0c10 inset",
              }}
            >
              <span className="hidden sm:block sm:text-[6px] md:text-[8px]">{key}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
