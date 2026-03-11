"use client"

import { useEffect, useRef } from "react"

const WORLD_DOTS = generateDots()

/* ═══════════════════════════════
   ANIMATED SECURITY DOTTED LINE
   ═══════════════════════════════ */
const AnimLine = ({ delay = 0 }) => {
  const lineRef = useRef(null)
  const raf = useRef(null)

  useEffect(() => {
    let running = true
    let pos = -100
    const timer = setTimeout(() => {
      const go = () => {
        if (!running) return
        pos = pos > 400 ? -100 : pos + 1.5
        if (lineRef.current) {
          lineRef.current.style.transform = `translateX(${pos}%)`
          lineRef.current.style.opacity = Math.min(1, Math.max(0, (pos + 100) / 200))
        }
        raf.current = requestAnimationFrame(go)
      }
      raf.current = requestAnimationFrame(go)
    }, delay)
    return () => { running = false; clearTimeout(timer); if (raf.current) cancelAnimationFrame(raf.current) }
  }, [delay])

  return (
    <div className="relative h-px w-full overflow-hidden">
      <div className="absolute inset-0 border-t border-dotted" style={{ borderColor: "#444" }} />
      <div ref={lineRef} className="absolute top-0 h-px"
        style={{
          width: 40,
          background: "linear-gradient(to right, transparent, #6366f1 20%, #6366f1 80%, transparent)",
          maskImage: "repeating-linear-gradient(to right, black 0px, black 2px, transparent 2px, transparent 5px)",
          transform: "translateX(-100%)",
          opacity: 0,
        }} />
    </div>
  )
}

/* ═══════════════════
   SECURITY CARD
   ═══════════════════ */
export const SecurityCard = () => (
  <div className="rounded-2xl p-6 shadow-sm"
    style={{ background: "#171717", boxShadow: "0 0 0 1px rgba(255,255,255,0.06)" }}>
    <div className="relative flex items-center justify-center"
      style={{ minHeight: 160, maskImage: "radial-gradient(circle, black 20%, transparent 70%)" }}>
      <div className="mx-auto flex max-w-20 items-center justify-center p-2">
        <div className="absolute inset-0 h-full w-full overflow-hidden rounded-lg opacity-10"
          style={{
            backgroundImage: "repeating-linear-gradient(315deg, #fff 0, #fff 1px, transparent 0, transparent 50%)",
            backgroundSize: "8px 8px",
          }} />
        <div className="flex items-center">
          <div className="relative z-10 shrink-0 overflow-hidden rounded-full"
            style={{ width: 28, height: 28, boxShadow: "0 0 0 2px rgba(255,255,255,0.2)" }}>
            <div className="h-full w-full bg-linear-to-br from-orange-300 to-red-400" style={{ filter: "blur(2px)" }} />
          </div>
          <div className="relative flex items-center">
            <div className="flex flex-col" style={{ width: 56, gap: 8 }}>
              <AnimLine delay={0} />
              <AnimLine delay={400} />
              <AnimLine delay={800} />
            </div>
            <div className="relative z-10 shrink-0 flex items-center justify-center rounded-xl shadow-sm"
              style={{ width: 40, height: 40, background: "#222", boxShadow: "0 0 0 1px rgba(255,255,255,0.08)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div className="flex flex-col" style={{ width: 56, gap: 8 }}>
              <AnimLine delay={1200} />
            </div>
          </div>
          <div className="relative z-10 shrink-0 overflow-hidden rounded-full"
            style={{ width: 24, height: 24, boxShadow: "0 0 0 2px rgba(255,255,255,0.2)" }}>
            <div className="h-full w-full bg-linear-to-br from-blue-300 to-purple-400" />
          </div>
        </div>
      </div>
    </div>
    <h3 className="mt-4 text-sm font-semibold text-white">Enterprise-grade security</h3>
    <p className="mt-2 text-sm text-neutral-400" style={{ textWrap: "balance" }}>
      End-to-end encryption and SOC 2 compliance ensure your agent data stays protected across all devices.
    </p>
  </div>
)

/* ════════════════════
   WORLD DOTS GENERATOR
   ════════════════════ */
function generateDots() {
  const seed = (x) => +(Math.abs(Math.sin(x * 12.9898 + x * 78.233) * 43758.5453 % 1).toFixed(6))
  const dots = []
  const add = (xMin, xMax, yMin, yMax, count) => {
    for (let i = 0; i < count; i++) {
      dots.push({
        cx: +(xMin + seed(dots.length + i * 7 + 1) * (xMax - xMin)).toFixed(4),
        cy: +(yMin + seed(dots.length + i * 13 + 2) * (yMax - yMin)).toFixed(4),
      })
    }
  }
  add(10, 40, 3, 22, 60)
  add(25, 42, 25, 55, 30)
  add(48, 65, 3, 18, 35)
  add(48, 70, 18, 45, 40)
  add(62, 115, 2, 28, 70)
  add(88, 118, 32, 50, 20)
  return dots
}

/* ════════════════════
   WORLD MAP CARD
   ════════════════════ */
export const WorldMapCard = () => {
  const pulseRef = useRef(null)
  const raf = useRef(null)

  useEffect(() => {
    let t = 0
    const go = () => {
      t += 0.02
      if (pulseRef.current) {
        pulseRef.current.style.transform = `scale(${1 + Math.sin(t) * 0.3})`
      }
      raf.current = requestAnimationFrame(go)
    }
    raf.current = requestAnimationFrame(go)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [])

  return (
    <div className="rounded-2xl p-6 shadow-sm"
      style={{ background: "#171717", boxShadow: "0 0 0 1px rgba(255,255,255,0.06)" }}>
      <div className="relative flex items-center justify-center"
        style={{ minHeight: 160, maskImage: "radial-gradient(circle, black 20%, transparent 70%)" }}>
        <div className="relative h-40 w-full overflow-hidden">
          <svg viewBox="0 0 120 60" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
            {WORLD_DOTS.map((d, i) => (
              <circle key={i} cx={d.cx} cy={d.cy} r="0.3" fill="#444" />
            ))}
          </svg>
          <div className="absolute flex items-center justify-center"
            style={{ transform: "translate(-50%,-50%)", left: "82%", top: "55%" }}>
            <div ref={pulseRef} className="absolute rounded-full"
              style={{ width: 32, height: 32, background: "#333" }} />
            <div className="relative overflow-hidden rounded-full"
              style={{ width: 28, height: 28, boxShadow: "0 0 0 2px #555, 0 0 0 4px #222" }}>
              <div className="h-full w-full bg-linear-to-br from-green-300 to-teal-500" />
            </div>
          </div>
        </div>
      </div>
      <h3 className="mt-4 text-sm font-semibold text-white">Edge computing ready</h3>
      <p className="mt-2 text-sm text-neutral-400" style={{ textWrap: "balance" }}>
        Deploy agents closer to your users with our global edge network for ultra-low latency responses.
      </p>
    </div>
  )
}

/* ════════════════════
   COMPLIANCE CARD
   ════════════════════ */
export const ComplianceCard = () => (
  <div className="rounded-2xl p-6 shadow-sm"
    style={{ background: "#171717", boxShadow: "0 0 0 1px rgba(255,255,255,0.06)" }}>
    <div className="relative flex items-center justify-center"
      style={{ minHeight: 160, maskImage: "radial-gradient(circle, black 20%, transparent 70%)" }}>
      <div className="flex items-center justify-center gap-3">
        {["GDPR", "ISO", "SOC2"].map((l) => (
          <div key={l} className="flex items-center justify-center" style={{ width: 72, height: 72 }}>
            <div className="flex items-center justify-center rounded-xl border text-xs font-bold"
              style={{ width: 56, height: 56, borderColor: "#333", background: "#222", color: "#888" }}>
              {l}
            </div>
          </div>
        ))}
      </div>
    </div>
    <h3 className="mt-4 text-sm font-semibold text-white">SOC2 and HIPAA compliant</h3>
    <p className="mt-2 text-sm text-neutral-400" style={{ textWrap: "balance" }}>
      Built-in encryption and compliance features ensure your agent data stays protected across all devices.
    </p>
  </div>
)
