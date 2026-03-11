"use client"

import { useRef, useEffect } from "react"

export default function Starfield() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    const dpr = window.devicePixelRatio || 1

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      ctx.scale(dpr, dpr)
    }

    resize()

    // Generate stars once
    const starCount = 210
    const stars = Array.from({ length: starCount }, () => {
      const size = Math.random() < 0.5 ? 1 : Math.random() < 0.8 ? 2 : 3
      const colors = ["#ffffff", "#ffd699", "#ffe4b5"]
      return {
        x: Math.random() * 2000,
        y: Math.random() * 2000,
        size,
        color: colors[Math.floor(Math.random() * colors.length)],
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.7,
      }
    })

    let animationId
    function draw(time) {
      const w = canvas.width / dpr
      const h = canvas.height / dpr
      ctx.clearRect(0, 0, w, h)

      for (const star of stars) {
        const opacity = 0.3 + 0.7 * ((Math.sin(time * 0.001 * star.speed + star.phase) + 1) / 2)
        ctx.globalAlpha = opacity
        ctx.fillStyle = star.color
        ctx.beginPath()
        ctx.arc(star.x % w, star.y % h, star.size * 0.5, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.globalAlpha = 1
      animationId = requestAnimationFrame(draw)
    }

    animationId = requestAnimationFrame(draw)

    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)

    return () => {
      cancelAnimationFrame(animationId)
      ro.disconnect()
    }
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  )
}
