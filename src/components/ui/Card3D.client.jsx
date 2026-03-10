"use client"

import { useRef, useState } from "react"
import { motion } from "motion/react"

const Card3D = ({ children, className = "" }) => {
  const ref = useRef(null)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e) => {
    const card = ref.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    setRotateX((y - centerY) / centerY * -20)
    setRotateY((x - centerX) / centerX * 20)
  }

  const handleMouseEnter = () => setIsHovered(true)

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
    setIsHovered(false)
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
        animate={{
          rotateX,
          rotateY,
          scale: isHovered ? 1.05 : 1,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        style={{ transformStyle: "preserve-3d" }}
        className={className}
      >
        {children}

        {/* Dynamic shadow based on tilt */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          animate={{
            boxShadow: isHovered
              ? `${-rotateY * 1.5}px ${rotateX * 1.5}px 40px rgba(79,140,255,0.15), 0 20px 60px rgba(0,0,0,0.4)`
              : "0 0 0 rgba(0,0,0,0)",
          }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
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
