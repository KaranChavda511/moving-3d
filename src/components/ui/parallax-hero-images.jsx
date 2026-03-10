"use client"
import React, { useEffect, useMemo, memo } from "react"
import Image from "next/image"
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react"

const positionStyles = {
  "top-left": { top: "8%", left: "4%" },
  "top-right": { top: "8%", right: "4%" },
  "mid-left": { top: "38%", left: "6%" },
  "mid-right": { top: "38%", right: "6%" },
  "bottom-left": { top: "68%", left: "4%" },
  "bottom-right": { top: "68%", right: "4%" },
  "far-left": { top: "52%", left: "2%" },
  "far-right": { top: "52%", right: "2%" },
}

const positionOrder = [
  "top-left",
  "top-right",
  "mid-left",
  "mid-right",
  "bottom-left",
  "bottom-right",
  "far-left",
  "far-right",
]

const depthValuesByVariant = {
  default: [0.3, 0.35, 0.9, 0.85, 0.4, 0.45, 0.25, 0.2],
  "edge-focus": [0.85, 0.9, 0.3, 0.35, 0.8, 0.85, 0.4, 0.45],
}

const SPRING_CONFIG = { damping: 25, stiffness: 120 }

export const ParallaxHeroImages = ({
  images,
  className,
  imageClassName,
  variant = "default",
}) => {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const smoothMouseX = useSpring(mouseX, SPRING_CONFIG)
  const smoothMouseY = useSpring(mouseY, SPRING_CONFIG)

  const positions = useMemo(() => {
    const limitedImages = images.slice(0, 8)
    const depthValues = depthValuesByVariant[variant]
    return limitedImages.map((src, index) => ({
      src,
      position: positionOrder[index],
      depth: depthValues[index],
      delay: index * 0.12,
    }))
  }, [images, variant])

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = (e.clientY / window.innerHeight) * 2 - 1
      mouseX.set(x)
      mouseY.set(y)
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [mouseX, mouseY])

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
}) {
  const maxOffset = 40

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

  const posStyle = positionStyles[position]

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
        className={`aspect-4/3 h-20 w-32 rounded-lg object-cover shadow-sm ring-1 ring-black/10 sm:h-40 sm:w-56 md:h-52 md:w-80 dark:ring-white/10 ${imageClassName || ""}`}
      />
    </motion.div>
  )
})
