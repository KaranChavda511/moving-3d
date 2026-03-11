"use client"

import { useRef } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "motion/react"

const springConfig = { type: "spring", stiffness: 200, damping: 15 }

const Card3D = ({ children, className = "" }) => {
  const ref = useRef(null)

  // MotionValues instead of setState — zero re-renders on mouse move
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const isHovered = useMotionValue(0) // 0 = false, 1 = true

  const rotateX = useSpring(
    useTransform(mouseY, (v) => v * -20),
    springConfig,
  )
  const rotateY = useSpring(
    useTransform(mouseX, (v) => v * 20),
    springConfig,
  )
  const scale = useSpring(
    useTransform(isHovered, [0, 1], [1, 1.05]),
    springConfig,
  )

  // Shadow driven by motion values — no setState, no re-render
  const shadowX = useTransform(rotateY, (v) => `${-v * 1.5}px`)
  const shadowY = useTransform(rotateX, (v) => `${v * 1.5}px`)
  const boxShadow = useTransform(
    [shadowX, shadowY, isHovered],
    ([sx, sy, h]) =>
      h > 0.5
        ? `${sx} ${sy} 40px rgba(79,140,255,0.15), 0 20px 60px rgba(0,0,0,0.4)`
        : "0 0 0 rgba(0,0,0,0)",
  )

  const handleMouseMove = (e) => {
    const card = ref.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    mouseX.set((e.clientX - rect.left - centerX) / centerX)
    mouseY.set((e.clientY - rect.top - centerY) / centerY)
  }

  const handleMouseEnter = () => isHovered.set(1)

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
    isHovered.set(0)
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: "800px" }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          scale,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
        className={className}
      >
        {children}

        {/* Dynamic shadow based on tilt */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{ boxShadow }}
        />
      </motion.div>
    </div>
  )
}

const CardItem = ({ children, className = "", translateZ = 0 }) => {
  return (
    <motion.div
      className={className}
      style={{
        transform: `translateZ(${translateZ}px)`,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </motion.div>
  )
}

export { Card3D, CardItem }
