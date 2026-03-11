"use client"

import { useState, useEffect, useRef } from "react"

const AnimatedBeam = ({ id, delay = 0 }) => {
  const [offset, setOffset] = useState(-20)
  const raf = useRef(null)

  useEffect(() => {
    let running = true
    const timer = setTimeout(() => {
      const animate = () => {
        if (!running) return
        setOffset((prev) => (prev > 120 ? -20 : prev + 0.4))
        raf.current = requestAnimationFrame(animate)
      }
      raf.current = requestAnimationFrame(animate)
    }, delay)
    return () => {
      running = false
      clearTimeout(timer)
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [delay])

  return (
    <svg className="h-12 w-full" viewBox="0 0 600 80" fill="none" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`bg-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="30%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#818cf8" />
          <stop offset="70%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
        <filter id={`gl-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id={`bf-${id}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="600" y2="0">
          <stop offset={`${offset}%`} stopColor="black" />
          <stop offset={`${offset + 5}%`} stopColor="white" />
          <stop offset={`${offset + 15}%`} stopColor="white" />
          <stop offset={`${offset + 20}%`} stopColor="black" />
        </linearGradient>
        <mask id={`bm-${id}`}>
          <path d="M 0 40 C 75 40 75 10 150 10 S 225 40 300 40 S 375 10 450 10 S 525 40 600 40"
            stroke={`url(#bf-${id})`} strokeWidth="6" strokeLinecap="round" fill="none" />
        </mask>
      </defs>
      {/* Dotted baseline */}
      <path d="M 0 40 C 75 40 75 10 150 10 S 225 40 300 40 S 375 10 450 10 S 525 40 600 40"
        stroke="#404040" strokeWidth="2" strokeDasharray="1 6" strokeLinecap="round" fill="none" />
      {/* Glowing beam */}
      <g filter={`url(#gl-${id})`}>
        <path d="M 0 40 C 75 40 75 10 150 10 S 225 40 300 40 S 375 10 450 10 S 525 40 600 40"
          stroke={`url(#bg-${id})`} strokeWidth="3" strokeLinecap="round"
          strokeDasharray="1 6" fill="none" mask={`url(#bm-${id})`} />
      </g>
    </svg>
  )
}

export default AnimatedBeam
