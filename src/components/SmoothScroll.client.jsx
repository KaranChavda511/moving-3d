"use client"

import { useEffect } from "react"
import Lenis from "lenis"

const SmoothScroll = ({ children }) => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
      autoRaf: true,
    })

    return () => lenis.destroy()
  }, [])

  return children
}

export default SmoothScroll
