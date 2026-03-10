"use client"
import React, { useEffect, useMemo, memo, useCallback, useRef, useSyncExternalStore } from "react"

const subscribeResize = (cb) => {
  window.addEventListener("resize", cb)
  return () => window.removeEventListener("resize", cb)
}
import Image from "next/image"
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react"

// Desktop: spread wide across viewport
const desktopPositions = {
  "top-left": { top: "8%", left: "4%" },
  "top-right": { top: "8%", right: "4%" },
  "mid-left": { top: "38%", left: "6%" },
  "mid-right": { top: "38%", right: "6%" },
  "bottom-left": { top: "68%", left: "4%" },
  "bottom-right": { top: "68%", right: "4%" },
}

// Mobile: tighter 2-column grid that fits small screens
const mobilePositions = {
  "top-left": { top: "5%", left: "2%" },
  "top-right": { top: "5%", right: "2%" },
  "mid-left": { top: "35%", left: "0%" },
  "mid-right": { top: "35%", right: "0%" },
  "bottom-left": { top: "65%", left: "2%" },
  "bottom-right": { top: "65%", right: "2%" },
}

const positionOrder = [
  "top-left",
  "top-right",
  "mid-left",
  "mid-right",
  "bottom-left",
  "bottom-right",
]

const depthValuesByVariant = {
  default: [0.3, 0.35, 0.9, 0.85, 0.4, 0.45],
  "edge-focus": [0.85, 0.9, 0.3, 0.35, 0.8, 0.85],
}

const SPRING_CONFIG = { damping: 25, stiffness: 120 }

export const ParallaxHeroImages = ({
  images,
  className,
  imageClassName,
  variant = "default",
  onTiltStatusChange,
}) => {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const isMobile = useSyncExternalStore(
    subscribeResize,
    () => window.innerWidth < 768,
    () => false,
  )
  const lastEventRef = useRef(null)

  const smoothMouseX = useSpring(mouseX, SPRING_CONFIG)
  const smoothMouseY = useSpring(mouseY, SPRING_CONFIG)

  // Limit to 6 images (3 rows × 2 columns)
  const positions = useMemo(() => {
    const limitedImages = images.slice(0, 6)
    const depthValues = depthValuesByVariant[variant]
    return limitedImages.map((src, index) => ({
      src,
      position: positionOrder[index],
      depth: depthValues[index],
      delay: index * 0.12,
    }))
  }, [images, variant])

  const startOrientationListener = useCallback(() => {
    // Store raw events and process via rAF for performance
    const handleEvent = (e) => {
      lastEventRef.current = e
    }
    window.addEventListener("deviceorientation", handleEvent)

    let rafId
    const tick = () => {
      const e = lastEventRef.current
      if (e && e.beta !== null && e.gamma !== null) {
        // beta: front-back tilt. Resting upright = ~90°, so subtract 90 to center at 0
        // gamma: left-right tilt. Resting = 0°
        // Clamp to [-20, 20] so small tilts produce strong parallax
        const normalizedBeta = Math.max(-20, Math.min(20, e.beta - 90))
        const normalizedGamma = Math.max(-20, Math.min(20, e.gamma))
        // Convert to -1..1 range
        mouseX.set(normalizedGamma / 20)
        mouseY.set(normalizedBeta / 20)
      }
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    onTiltStatusChange?.("active")

    return () => {
      window.removeEventListener("deviceorientation", handleEvent)
      cancelAnimationFrame(rafId)
    }
  }, [mouseX, mouseY, onTiltStatusChange])

  useEffect(() => {
    if (!isMobile) {
      const handleMouseMove = (e) => {
        const x = (e.clientX / window.innerWidth) * 2 - 1
        const y = (e.clientY / window.innerHeight) * 2 - 1
        mouseX.set(x)
        mouseY.set(y)
      }
      window.addEventListener("mousemove", handleMouseMove)
      return () => window.removeEventListener("mousemove", handleMouseMove)
    }

    // Mobile: check if we need permission (iOS 13+)
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      // iOS — needs user tap to grant permission
      onTiltStatusChange?.("needs-permission")
    } else if (typeof DeviceOrientationEvent !== "undefined") {
      // Android / other — just listen directly, no permission needed
      return startOrientationListener()
    }
  }, [isMobile, mouseX, mouseY, onTiltStatusChange, startOrientationListener])

  // Handle iOS permission request triggered by parent via custom event
  useEffect(() => {
    if (!isMobile) return

    const handlePermissionRequest = async () => {
      if (
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function"
      ) {
        try {
          const permission = await DeviceOrientationEvent.requestPermission()
          if (permission === "granted") {
            startOrientationListener()
          } else {
            onTiltStatusChange?.("denied")
          }
        } catch {
          onTiltStatusChange?.("denied")
        }
      }
    }

    window.addEventListener("request-device-orientation", handlePermissionRequest)
    return () => window.removeEventListener("request-device-orientation", handlePermissionRequest)
  }, [isMobile, startOrientationListener, onTiltStatusChange])

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className || ""}`}
    >
      {positions.map((pos, index) => (
        <ParallaxImage
          key={`${pos.src}-${index}`}
          src={pos.src}
          position={pos.position}
          depth={pos.depth}
          delay={pos.delay}
          imageClassName={imageClassName}
          smoothMouseX={smoothMouseX}
          smoothMouseY={smoothMouseY}
          isMobile={isMobile}
        />
      ))}
    </div>
  )
}

const ParallaxImage = memo(function ParallaxImage({
  src,
  position,
  depth,
  delay,
  imageClassName,
  smoothMouseX,
  smoothMouseY,
  isMobile,
}) {
  const maxOffset = isMobile ? 40 : 40

  const translateX = useTransform(
    smoothMouseX,
    [-1, 1],
    [-maxOffset * depth, maxOffset * depth],
  )

  const translateY = useTransform(
    smoothMouseY,
    [-1, 1],
    [-maxOffset * depth, maxOffset * depth],
  )

  const posStyle = isMobile
    ? mobilePositions[position]
    : desktopPositions[position]

  return (
    <motion.div
      className="absolute"
      style={{
        top: posStyle.top,
        left: posStyle.left,
        right: posStyle.right,
        x: translateX,
        y: translateY,
        zIndex: Math.round(depth * 10),
      }}
      initial={{ opacity: 0, filter: "blur(20px)", scale: 0.9 }}
      animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
      transition={{
        duration: 0.8,
        delay: delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      <Image
        src={src}
        alt=""
        width={320}
        height={240}
        loading="lazy"
        className={`aspect-4/3 h-24 w-[42vw] max-w-32 rounded-lg object-cover shadow-sm ring-1 ring-black/10 sm:h-40 sm:max-w-56 md:h-52 md:max-w-80 dark:ring-white/10 ${imageClassName || ""}`}
      />
    </motion.div>
  )
})
