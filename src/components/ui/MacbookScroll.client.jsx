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

            {/* === BASE === rendered at native 32rem, scaled to fit */}
            <div className="h-44 w-64 [--base-s:0.5] sm:h-66 sm:w-96 sm:[--base-s:0.75] md:h-88 md:w-lg md:[--base-s:1]">
              <div
                className="relative origin-top-left overflow-hidden rounded-b-xl sm:rounded-b-2xl"
                style={{
                  width: "32rem",
                  height: "22rem",
                  transform: "scale(var(--base-s))",
                  background: "linear-gradient(180deg, #3a3a3e 0%, #2c2c30 40%, #252528 100%)",
                }}
              >
                {/* Cover — hides keyboard when closed */}
                <motion.div
                  style={{ opacity: coverOpacity, pointerEvents: "none" }}
                  className="absolute inset-0 z-10 rounded-b-xl bg-[#131313]"
                />

                {/* Hinge strip / above keyboard bar */}
                <div className="relative h-10 w-full">
                  <div className="absolute inset-x-0 mx-auto h-4 w-[80%] bg-[#050505]" />
                </div>

                {/* Speaker + Keyboard + Speaker */}
                <div className="relative flex">
                  <div className="mx-auto h-full w-[10%] overflow-hidden">
                    <SpeakerGrid />
                  </div>
                  <div className="mx-auto h-full w-[80%]">
                    <Keypad />
                  </div>
                  <div className="mx-auto h-full w-[10%] overflow-hidden">
                    <SpeakerGrid />
                  </div>
                </div>

                {/* Trackpad */}
                <div
                  className="mx-auto my-1 h-32 w-[40%] rounded-xl bg-[#262630]"
                  style={{
                    boxShadow:
                      "0px 0px 1px 1px rgba(255,255,255,0.08) inset, 0px 2px 4px 0px rgba(0,0,0,0.5) inset, 0px -1px 2px 0px rgba(255,255,255,0.04)",
                  }}
                />

                {/* Bottom notch */}
                <div className="absolute inset-x-0 bottom-0 mx-auto h-2 w-20 rounded-tl-3xl rounded-tr-3xl bg-linear-to-t from-[#272729] to-[#050505]" />

                {showGradient && (
                  <div className="absolute inset-x-0 bottom-0 z-50 h-40 w-full bg-linear-to-t from-black via-black to-transparent" />
                )}
              </div>
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

const SpeakerGrid = () => (
  <div
    className="mt-2 flex h-40 gap-0.5 px-[0.5px]"
    style={{
      backgroundImage: "radial-gradient(circle, #08080A 0.5px, transparent 0.5px)",
      backgroundSize: "3px 3px",
    }}
  />
)

const KBtn = ({ className, children, childrenClassName, backlit = true }) => (
  <div
    className={`group/key cursor-pointer rounded-sm p-[0.5px] transition-all duration-100 ease-out will-change-transform active:duration-40 ${backlit ? "bg-white/20 shadow-sm shadow-white/40 active:bg-white/10 active:shadow-white/20" : ""}`}
    style={{ transformStyle: "preserve-3d" }}
  >
    <div
      className={`flex h-6 w-6 items-center justify-center rounded-[3.5px] bg-[#0A090D] transition-all duration-100 ease-out group-active/key:translate-y-[1.5px] group-active/key:scale-[0.97] group-active/key:bg-[#070709] active:duration-40 ${className || ""}`}
      style={{
        boxShadow: "0px -0.5px 2px 0 #0D0D0F inset, -0.5px 0px 2px 0 #0D0D0F inset",
      }}
    >
      <div className={`flex w-full flex-col items-center justify-center text-[5px] text-white transition-opacity duration-100 group-active/key:opacity-80 ${childrenClassName || ""}`}>
        {children}
      </div>
    </div>
  </div>
)

const OptionKey = ({ className }) => (
  <svg
    fill="none"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
    className={className}
  >
    <rect stroke="currentColor" strokeWidth={2} x="18" y="5" width="10" height="2" />
    <polygon stroke="currentColor" strokeWidth={2} points="10.6,5 4,5 4,7 9.4,7 18.4,27 28,27 28,25 19.6,25" />
    <rect width="32" height="32" stroke="none" />
  </svg>
)

const Keypad = () => (
  <div className="relative mx-1 h-full rounded-md bg-[#050505] p-1 transform-[translateZ(0)] will-change-transform">
    {/* Function row */}
    <div className="mb-0.5 flex w-full shrink-0 gap-0.5">
      <KBtn className="w-10 items-end justify-start pb-0.5 pl-1" childrenClassName="items-start">esc</KBtn>
      <KBtn><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-1.5 w-1.5"><circle cx="12" cy="12" r="3"/><path d="M12 5l0 .01M17 7l0 .01M19 12l0 .01M17 17l0 .01M12 19l0 .01M7 17l0 .01M5 12l0 .01M7 7l0 .01"/></svg><span className="mt-1 inline-block">F1</span></KBtn>
      <KBtn><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-1.5 w-1.5"><circle cx="12" cy="12" r="3"/><path d="M12 5l0 -2M17 7l1.4 -1.4M19 12l2 0M17 17l1.4 1.4M12 19l0 2M7 17l-1.4 1.4M6 12l-2 0M7 7l-1.4 -1.4"/></svg><span className="mt-1 inline-block">F2</span></KBtn>
      <KBtn><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-1.5 w-1.5"><path d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14z"/><path d="M3 10h18"/><path d="M10 3v18"/></svg><span className="mt-1 inline-block">F3</span></KBtn>
      <KBtn><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-1.5 w-1.5"><circle cx="10" cy="10" r="7"/><path d="M21 21l-6 -6"/></svg><span className="mt-1 inline-block">F4</span></KBtn>
      <KBtn><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-1.5 w-1.5"><path d="M9 2m0 3a3 3 0 0 1 3 -3h0a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h0a3 3 0 0 1 -3 -3z"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M8 21l8 0"/><path d="M12 17l0 4"/></svg><span className="mt-1 inline-block">F5</span></KBtn>
      <KBtn><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-1.5 w-1.5"><path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"/></svg><span className="mt-1 inline-block">F6</span></KBtn>
      <KBtn><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-1.5 w-1.5"><path d="M21 5v14l-8 -7z"/><path d="M10 5v14l-8 -7z"/></svg><span className="mt-1 inline-block">F7</span></KBtn>
      <KBtn><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-1.5 w-1.5"><path d="M4 5v14l12 -7z"/><path d="M20 5l0 14"/></svg><span className="mt-1 inline-block">F8</span></KBtn>
      <KBtn><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-1.5 w-1.5"><path d="M3 5v14l8 -7z"/><path d="M14 5v14l8 -7z"/></svg><span className="mt-1 inline-block">F9</span></KBtn>
      <KBtn><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-1.5 w-1.5"><path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5"/><path d="M16 10l4 4m0 -4l-4 4"/></svg><span className="mt-1 inline-block">F10</span></KBtn>
      <KBtn><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-1.5 w-1.5"><path d="M15 8a5 5 0 0 1 0 8"/><path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5"/></svg><span className="mt-1 inline-block">F11</span></KBtn>
      <KBtn><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-1.5 w-1.5"><path d="M15 8a5 5 0 0 1 0 8"/><path d="M17.7 5a9 9 0 0 1 0 14"/><path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5"/></svg><span className="mt-1 inline-block">F12</span></KBtn>
      <KBtn><div className="h-4 w-4 rounded-full bg-linear-to-b from-neutral-900 from-20% via-black via-50% to-neutral-900 to-95% p-px"><div className="h-full w-full rounded-full bg-black" /></div></KBtn>
    </div>

    {/* Number row */}
    <div className="mb-0.5 flex w-full shrink-0 gap-0.5">
      <KBtn><span className="block">~</span><span className="mt-1 block">`</span></KBtn>
      {[["!","1"],["@","2"],["#","3"],["$","4"],["%","5"],["^","6"],["&","7"],["*","8"],["(","9"],[")","0"]].map(([t,b],i) => (
        <KBtn key={i}><span className="block">{t}</span><span className="block">{b}</span></KBtn>
      ))}
      <KBtn><span className="block">&mdash;</span><span className="block">_</span></KBtn>
      <KBtn><span className="block">+</span><span className="block">=</span></KBtn>
      <KBtn className="w-10 items-end justify-end pr-1 pb-0.5" childrenClassName="items-end">delete</KBtn>
    </div>

    {/* QWERTY row */}
    <div className="mb-0.5 flex w-full shrink-0 gap-0.5">
      <KBtn className="w-10 items-end justify-start pb-0.5 pl-1" childrenClassName="items-start">tab</KBtn>
      {["Q","W","E","R","T","Y","U","I","O","P"].map(k => <KBtn key={k}><span className="block">{k}</span></KBtn>)}
      <KBtn><span className="block">{"{"}</span><span className="block">{"["}</span></KBtn>
      <KBtn><span className="block">{"}"}</span><span className="block">{"]"}</span></KBtn>
      <KBtn><span className="block">{"|"}</span><span className="block">{"\\"}</span></KBtn>
    </div>

    {/* Home row */}
    <div className="mb-0.5 flex w-full shrink-0 gap-0.5">
      <KBtn className="w-[2.8rem] items-end justify-start pb-0.5 pl-1" childrenClassName="items-start">caps lock</KBtn>
      {["A","S","D","F","G","H","J","K","L"].map(k => <KBtn key={k}><span className="block">{k}</span></KBtn>)}
      <KBtn><span className="block">:</span><span className="block">;</span></KBtn>
      <KBtn><span className="block">&quot;</span><span className="block">&apos;</span></KBtn>
      <KBtn className="w-[2.85rem] items-end justify-end pr-1 pb-0.5" childrenClassName="items-end">return</KBtn>
    </div>

    {/* Shift row */}
    <div className="mb-0.5 flex w-full shrink-0 gap-0.5">
      <KBtn className="w-[3.65rem] items-end justify-start pb-0.5 pl-1" childrenClassName="items-start">shift</KBtn>
      {["Z","X","C","V","B","N","M"].map(k => <KBtn key={k}><span className="block">{k}</span></KBtn>)}
      <KBtn><span className="block">&lt;</span><span className="block">,</span></KBtn>
      <KBtn><span className="block">&gt;</span><span className="block">.</span></KBtn>
      <KBtn><span className="block">?</span><span className="block">/</span></KBtn>
      <KBtn className="w-[3.65rem] items-end justify-end pr-1 pb-0.5" childrenClassName="items-end">shift</KBtn>
    </div>

    {/* Bottom row */}
    <div className="mb-0.5 flex w-full shrink-0 gap-0.5">
      <KBtn childrenClassName="h-full justify-between py-1">
        <div className="flex w-full justify-end pr-1"><span className="block">fn</span></div>
        <div className="flex w-full justify-start pl-1"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-1.5 w-1.5"><circle cx="12" cy="12" r="9"/><path d="M3.6 9h16.8M3.6 15h16.8M11.5 3a17 17 0 0 0 0 18M12.5 3a17 17 0 0 1 0 18"/></svg></div>
      </KBtn>
      <KBtn childrenClassName="h-full justify-between py-1">
        <div className="flex w-full justify-end pr-1"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-1.5 w-1.5"><path d="M6 15l6 -6l6 6"/></svg></div>
        <div className="flex w-full justify-start pl-1"><span className="block">control</span></div>
      </KBtn>
      <KBtn childrenClassName="h-full justify-between py-1">
        <div className="flex w-full justify-end pr-1"><OptionKey className="h-1.5 w-1.5" /></div>
        <div className="flex w-full justify-start pl-1"><span className="block">option</span></div>
      </KBtn>
      <KBtn className="w-8" childrenClassName="h-full justify-between py-1">
        <div className="flex w-full justify-end pr-1"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-1.5 w-1.5"><path d="M7 9a2 2 0 1 1 2 -2v10a2 2 0 1 1 -2 -2h10a2 2 0 1 1 -2 2v-10a2 2 0 1 1 2 2h-10"/></svg></div>
        <div className="flex w-full justify-start pl-1"><span className="block">command</span></div>
      </KBtn>
      <KBtn className="w-[8.2rem]" />
      <KBtn className="w-8" childrenClassName="h-full justify-between py-1">
        <div className="flex w-full justify-start pl-1"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-1.5 w-1.5"><path d="M7 9a2 2 0 1 1 2 -2v10a2 2 0 1 1 -2 -2h10a2 2 0 1 1 -2 2v-10a2 2 0 1 1 2 2h-10"/></svg></div>
        <div className="flex w-full justify-start pl-1"><span className="block">command</span></div>
      </KBtn>
      <KBtn childrenClassName="h-full justify-between py-1">
        <div className="flex w-full justify-start pl-1"><OptionKey className="h-1.5 w-1.5" /></div>
        <div className="flex w-full justify-start pl-1"><span className="block">option</span></div>
      </KBtn>
    </div>

    {/* Arrow keys — absolutely positioned bottom-right, spanning shift + bottom rows */}
    <div className="absolute bottom-1 right-1 flex flex-col items-center gap-0.5">
      <KBtn className="h-3 w-6"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="h-1.5 w-1.5"><path d="M11.293 7.293a1 1 0 0 1 1.32 -.083l.094 .083l6 6l.083 .094l.054 .077l.054 .096l.017 .036l.027 .067l.032 .108l.01 .053l.01 .06l.004 .057l.002 .059l-.002 .059l-.005 .058l-.009 .06l-.01 .052l-.032 .108l-.027 .067l-.07 .132l-.065 .09l-.073 .081l-.094 .083l-.077 .054l-.096 .054l-.036 .017l-.067 .027l-.108 .032l-.053 .01l-.06 .01l-.057 .004l-.059 .002h-12c-.852 0 -1.297 -.986 -.783 -1.623l.076 -.084l6 -6z"/></svg></KBtn>
      <div className="flex gap-0.5">
        <KBtn className="h-3 w-6"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="h-1.5 w-1.5"><path d="M13.883 5.007l.058 -.005h.118l.058 .005l.06 .009l.052 .01l.108 .032l.067 .027l.132 .07l.09 .065l.081 .073l.083 .094l.054 .077l.054 .096l.017 .036l.027 .067l.032 .108l.01 .053l.01 .06l.004 .057l.002 .059v12c0 .852 -.986 1.297 -1.623 .783l-.084 -.076l-6 -6a1 1 0 0 1 -.083 -1.32l.083 -.094l6 -6l.094 -.083l.077 -.054l.096 -.054l.036 -.017l.067 -.027l.108 -.032l.053 -.01l.06 -.01z"/></svg></KBtn>
        <KBtn className="h-3 w-6"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="h-1.5 w-1.5"><path d="M18 9c.852 0 1.297 .986 .783 1.623l-.076 .084l-6 6a1 1 0 0 1 -1.32 .083l-.094 -.083l-6 -6l-.083 -.094l-.054 -.077l-.054 -.096l-.017 -.036l-.027 -.067l-.032 -.108l-.01 -.053l-.01 -.06l-.004 -.057v-.118l.005 -.058l.009 -.06l.01 -.052l.032 -.108l.027 -.067l.07 -.132l.065 -.09l.073 -.081l.094 -.083l.077 -.054l.096 -.054l.036 -.017l.067 -.027l.108 -.032l.053 -.01l.06 -.01l.057 -.004l12.059 -.002z"/></svg></KBtn>
        <KBtn className="h-3 w-6"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="h-1.5 w-1.5"><path d="M9 6c0 -.852 .986 -1.297 1.623 -.783l.084 .076l6 6a1 1 0 0 1 .083 1.32l-.083 .094l-6 6l-.094 .083l-.077 .054l-.096 .054l-.036 .017l-.067 .027l-.108 .032l-.053 .01l-.06 .01l-.057 .004l-.059 .002l-.059 -.002l-.058 -.005l-.06 -.009l-.052 -.01l-.108 -.032l-.067 -.027l-.132 -.07l-.09 -.065l-.081 -.073l-.083 -.094l-.054 -.077l-.054 -.096l-.017 -.036l-.027 -.067l-.032 -.108l-.01 -.053l-.01 -.06l-.004 -.057l-.002 -12.059z"/></svg></KBtn>
      </div>
    </div>
  </div>
)
