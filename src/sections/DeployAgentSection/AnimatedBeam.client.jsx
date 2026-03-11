"use client"

import { useEffect, useRef } from "react"

const AnimatedBeam = ({ id, delay = 0, onProgress }) => {
  const svgRef = useRef(null)
  const raf = useRef(null)

  useEffect(() => {
    let running = true
    let offset = -30

    const svg = svgRef.current
    if (!svg) return

    const stops = svg.querySelectorAll(`[data-beam-stop]`)
    const s0 = stops[0], s1 = stops[1], s2 = stops[2], s3 = stops[3]

    const timer = setTimeout(() => {
      const animate = () => {
        if (!running) return
        offset = offset > 130 ? -30 : offset + 0.35
        if (s0) {
          s0.setAttribute("offset", `${offset}%`)
          s1.setAttribute("offset", `${offset + 10}%`)
          s2.setAttribute("offset", `${offset + 25}%`)
          s3.setAttribute("offset", `${offset + 35}%`)
        }
        // Notify parent of beam progress (0-100 range center of pulse)
        if (onProgress) {
          const center = offset + 17.5
          onProgress(center)
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
  }, [delay, id, onProgress])

  return (
    <svg ref={svgRef} className="h-12 w-full" viewBox="0 0 600 80" fill="none" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`bg-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="20%" stopColor="#818cf8" />
          <stop offset="50%" stopColor="#c7d2fe" />
          <stop offset="80%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
        <filter id={`gl-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id={`bf-${id}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="600" y2="0">
          <stop data-beam-stop offset="-30%" stopColor="black" />
          <stop data-beam-stop offset="-20%" stopColor="white" />
          <stop data-beam-stop offset="-5%" stopColor="white" />
          <stop data-beam-stop offset="5%" stopColor="black" />
        </linearGradient>
        <mask id={`bm-${id}`}>
          <path d="M 0 40 C 75 40 75 10 150 10 S 225 40 300 40 S 375 10 450 10 S 525 40 600 40"
            stroke={`url(#bf-${id})`} strokeWidth="8" strokeLinecap="round" fill="none" />
        </mask>
      </defs>
      {/* Dotted baseline */}
      <path d="M 0 40 C 75 40 75 10 150 10 S 225 40 300 40 S 375 10 450 10 S 525 40 600 40"
        stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 8" strokeLinecap="round" fill="none" />
      {/* Glowing beam — dashed travelling pulse that lights up each dash */}
      <g filter={`url(#gl-${id})`}>
        <path d="M 0 40 C 75 40 75 10 150 10 S 225 40 300 40 S 375 10 450 10 S 525 40 600 40"
          stroke={`url(#bg-${id})`} strokeWidth="3" strokeLinecap="round"
          strokeDasharray="4 8" fill="none" mask={`url(#bm-${id})`} />
      </g>
    </svg>
  )
}

export default AnimatedBeam
