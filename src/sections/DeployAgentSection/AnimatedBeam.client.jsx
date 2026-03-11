"use client"

import { useEffect, useRef } from "react"

const AnimatedBeam = ({ id, delay = 0 }) => {
  const svgRef = useRef(null)
  const raf = useRef(null)

  useEffect(() => {
    let running = true
    let offset = -20

    // Cache the 4 stop elements for direct attribute updates (no re-render)
    const svg = svgRef.current
    if (!svg) return

    const stops = svg.querySelectorAll(`[data-beam-stop]`)
    const s0 = stops[0], s1 = stops[1], s2 = stops[2], s3 = stops[3]

    const timer = setTimeout(() => {
      const animate = () => {
        if (!running) return
        offset = offset > 120 ? -20 : offset + 0.4
        if (s0) {
          s0.setAttribute("offset", `${offset}%`)
          s1.setAttribute("offset", `${offset + 5}%`)
          s2.setAttribute("offset", `${offset + 15}%`)
          s3.setAttribute("offset", `${offset + 20}%`)
        }
        raf.current = requestAnimationFrame(animate)
      }
      raf.current = requestAnimationFrame(animate)
    }, delay)
    return () => {
      running = false
      clearTimeout(timer)
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [delay, id])

  return (
    <svg ref={svgRef} className="h-12 w-full" viewBox="0 0 600 80" fill="none" preserveAspectRatio="none">
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
          <stop data-beam-stop offset="-20%" stopColor="black" />
          <stop data-beam-stop offset="-15%" stopColor="white" />
          <stop data-beam-stop offset="-5%" stopColor="white" />
          <stop data-beam-stop offset="0%" stopColor="black" />
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
