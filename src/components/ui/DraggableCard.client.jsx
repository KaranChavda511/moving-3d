"use client"

import React, { useRef, useCallback } from "react"
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useAnimationControls,
} from "motion/react"

export const DraggableCardBody = ({ className = "", children }) => {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const cardRef = useRef(null)
  const containerRef = useRef(null)
  const controls = useAnimationControls()

  const springConfig = {
    stiffness: 100,
    damping: 20,
    mass: 0.5,
  }

  const rotateX = useSpring(
    useTransform(mouseY, [-300, 300], [25, -25]),
    springConfig,
  )
  const rotateY = useSpring(
    useTransform(mouseX, [-300, 300], [-25, 25]),
    springConfig,
  )

  const opacity = useSpring(
    useTransform(mouseX, [-300, 0, 300], [0.8, 1, 0.8]),
    springConfig,
  )

  const glareOpacity = useSpring(
    useTransform(mouseX, [-300, 0, 300], [0.2, 0, 0.2]),
    springConfig,
  )

  // Callback ref: sets both cardRef and containerRef synchronously
  // when the DOM node mounts — before Motion reads dragConstraints.
  // This fixes drag being unconstrained on page reload.
  const setRefs = useCallback((node) => {
    cardRef.current = node
    if (node) {
      containerRef.current = node.closest("[data-drag-container]")
    }
  }, [])

  const handleMouseMove = (e) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    mouseX.set(e.clientX - centerX)
    mouseY.set(e.clientY - centerY)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <motion.div
      ref={setRefs}
      drag
      dragConstraints={containerRef}
      dragElastic={0.15}
      onDragStart={() => {
        document.body.style.cursor = "grabbing"
      }}
      onDragEnd={() => {
        document.body.style.cursor = "default"

        controls.start({
          rotateX: 0,
          rotateY: 0,
          transition: {
            type: "spring",
            ...springConfig,
          },
        })
      }}
      dragTransition={{
        bounceStiffness: 300,
        bounceDamping: 20,
      }}
      style={{
        rotateX,
        rotateY,
        opacity,
        willChange: "transform",
        transformStyle: "preserve-3d",
      }}
      animate={controls}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative cursor-grab overflow-hidden rounded-md border border-white/10 bg-white/5 p-3 shadow-2xl backdrop-blur-sm active:cursor-grabbing sm:p-4 md:min-h-96 md:w-80 md:p-6 ${className}`}
    >
      {children}
      <motion.div
        style={{ opacity: glareOpacity }}
        className="pointer-events-none absolute inset-0 bg-white select-none"
      />
    </motion.div>
  )
}

export const DraggableCardContainer = ({ className = "", children }) => {
  return (
    <div
      data-drag-container
      className={className}
      style={{ perspective: "3000px" }}
    >
      {children}
    </div>
  )
}
