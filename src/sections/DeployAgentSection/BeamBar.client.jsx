"use client"

import { useRef, useCallback } from "react"
import AnimatedBeam from "./AnimatedBeam.client"

// Dot positions as % of beam (0=start, 50=center, 100=end)
const DOT_POSITIONS = [0, 50, 100]
const GLOW_RANGE = 15 // how close the pulse center needs to be to trigger glow

const BeamBar = () => {
  const dotRefs = useRef([])

  const handleProgress = useCallback((center) => {
    for (let i = 0; i < DOT_POSITIONS.length; i++) {
      const dot = dotRefs.current[i]
      if (!dot) continue
      const dist = Math.abs(center - DOT_POSITIONS[i])
      const intensity = Math.max(0, 1 - dist / GLOW_RANGE)
      const inner = dot.firstElementChild
      if (intensity > 0) {
        dot.style.boxShadow = `0 0 ${8 + intensity * 16}px rgba(165,180,252,${0.3 + intensity * 0.7})`
        dot.style.background = `rgba(99,102,241,${0.15 + intensity * 0.35})`
        inner.style.background = `rgb(${165 + intensity * 60},${180 + intensity * 50},${252})`
        inner.style.transform = `scale(${1 + intensity * 0.4})`
      } else {
        dot.style.boxShadow = "0 0 8px rgba(129,140,248,0.3)"
        dot.style.background = "rgba(99,102,241,0.15)"
        inner.style.background = "#818cf8"
        inner.style.transform = "scale(1)"
      }
    }
  }, [])

  return (
    <div className="relative mx-auto mb-8 hidden h-12 w-full items-center lg:flex">
      <div className="relative flex h-full w-full items-center">
        {DOT_POSITIONS.map((_, i) => (
          <div key={i}
            ref={(el) => { dotRefs.current[i] = el }}
            className="absolute top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
            style={{
              left: i === 0 ? "calc(100% / 6)" : i === 1 ? "50%" : "calc(500% / 6)",
              width: 20, height: 20,
              background: "rgba(99,102,241,0.15)",
              boxShadow: "0 0 8px rgba(129,140,248,0.3)",
              transition: "box-shadow 0.15s, background 0.15s",
            }}>
            <div className="rounded-full"
              style={{
                width: 10, height: 10,
                background: "#818cf8",
                transition: "transform 0.15s, background 0.15s",
              }} />
          </div>
        ))}

        <div className="absolute top-1/2 -translate-y-1/2"
          style={{ left: "calc(100% / 6)", width: "calc(400% / 6)" }}>
          <AnimatedBeam id="full" delay={0} onProgress={handleProgress} />
        </div>
      </div>
    </div>
  )
}

export default BeamBar
