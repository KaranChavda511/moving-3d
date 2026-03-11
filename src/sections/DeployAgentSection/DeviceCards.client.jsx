"use client"

import { useState, useEffect, useRef } from "react"

/* ═══════════════════════════════════════════════════════
   useActiveState — hover on desktop, viewport on mobile
   Only ONE device can be active at a time on mobile.
   ═══════════════════════════════════════════════════════ */
const subscribers = new Set()

const notifyActive = (activeId) => {
  subscribers.forEach((sub) => sub(activeId))
}

const useActiveState = (id) => {
  const [active, setActive] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const ref = useRef(null)
  const ratioRef = useRef(0)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.matchMedia("(max-width: 768px)").matches)
    checkMobile()
    const mql = window.matchMedia("(max-width: 768px)")
    mql.addEventListener("change", checkMobile)
    return () => mql.removeEventListener("change", checkMobile)
  }, [])

  // Listen for "another device became active" — deactivate self
  useEffect(() => {
    if (!isMobile) return
    const handler = (activeId) => {
      if (activeId !== id) setActive(false)
    }
    subscribers.add(handler)
    return () => subscribers.delete(handler)
  }, [isMobile, id])

  useEffect(() => {
    if (!isMobile || !ref.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        ratioRef.current = entry.intersectionRatio
        if (entry.isIntersecting) {
          setActive(true)
          notifyActive(id)
        } else {
          setActive(false)
        }
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [isMobile, id])

  const hoverProps = isMobile
    ? {}
    : { onMouseEnter: () => setActive(true), onMouseLeave: () => setActive(false) }

  return { active, ref, hoverProps }
}

/* ═══════════════════════════════════════════════
   SCREEN IMAGE — the portrait shown on screens
   ═══════════════════════════════════════════════ */
const ScreenImage = () => (
  <div className="absolute inset-0 bg-white">
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-slate-50 via-slate-100 to-slate-200" />
      <svg viewBox="0 0 100 140" className="relative z-10 h-full" style={{ maxWidth: "60%" }}>
        <ellipse cx="50" cy="38" rx="22" ry="26" fill="#2d1b0e" />
        <ellipse cx="50" cy="42" rx="16" ry="18" fill="#f0c8a0" />
        <path d="M 30 35 Q 35 15 50 14 Q 65 15 70 35 Q 68 25 50 24 Q 32 25 30 35" fill="#2d1b0e" />
        <path d="M 30 35 Q 28 50 30 65 Q 32 55 34 42 Z" fill="#2d1b0e" />
        <path d="M 70 35 Q 72 50 70 65 Q 68 55 66 42 Z" fill="#2d1b0e" />
        <ellipse cx="42" cy="42" rx="2.5" ry="2" fill="#3d2b1f" />
        <ellipse cx="58" cy="42" rx="2.5" ry="2" fill="#3d2b1f" />
        <path d="M 50 46 Q 48 50 50 51 Q 52 50 50 46" fill="#d4a574" strokeWidth="0.5" stroke="#d4a574" />
        <path d="M 44 55 Q 50 59 56 55" fill="none" stroke="#c07070" strokeWidth="1.2" />
        <rect x="44" y="58" width="12" height="8" fill="#f0c8a0" rx="2" />
        <path d="M 25 72 Q 30 64 50 64 Q 70 64 75 72 L 80 100 L 20 100 Z" fill="#4a5568" />
        <path d="M 40 66 L 50 74 L 60 66" fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
      </svg>
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-linear-to-t from-indigo-100/40 to-transparent" />
    </div>
  </div>
)

/* ═══════════════════════════════════════
   DYNAMIC ISLAND — iPhone-style notch
   ═══════════════════════════════════════ */
const ISLAND_DOT_WIDTH = 24
const DynamicIsland = ({ width = 56, active = false, label = "Connected" }) => {
  const [showTextReady, setShowTextReady] = useState(false)

  useEffect(() => {
    if (!active) return
    const timer = setTimeout(() => setShowTextReady(true), 1000)
    return () => {
      clearTimeout(timer)
      setShowTextReady(false)
    }
  }, [active])

  const showText = active && showTextReady
  // Inactive: hidden pill, Active+loading: small dot-sized, Active+text: full width
  const currentWidth = !active ? ISLAND_DOT_WIDTH : showText ? width : ISLAND_DOT_WIDTH
  const currentHeight = !active ? 10 : showText ? 16 : 10

  return (
    <div className="relative overflow-hidden bg-black"
      style={{
        width: currentWidth,
        height: currentHeight,
        borderRadius: currentHeight / 2,
        opacity: active ? 1 : 0,
        transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1), height 0.5s cubic-bezier(0.4, 0, 0.2, 1), border-radius 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease-out",
      }}>
      {/* Loading dots */}
      <div className="absolute inset-0 flex items-center justify-center"
        style={{
          opacity: active && !showText ? 1 : 0,
          transition: "opacity 0.3s ease-out",
        }}>
        <div className="flex items-center" style={{ gap: "3px" }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-full bg-neutral-400"
              style={{
                width: 3, height: 3,
                animation: "islandPulse 1s ease-in-out infinite",
                animationDelay: `${i * 0.2}s`,
              }} />
          ))}
        </div>
        <style>{`
          @keyframes islandPulse {
            0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
            40% { opacity: 1; transform: scale(1.2); }
          }
        `}</style>
      </div>
      {/* Label text */}
      <div className="absolute inset-0 flex items-center justify-center"
        style={{
          opacity: showText ? 1 : 0,
          transition: "opacity 0.4s ease-out 0.15s",
        }}>
        <span className="whitespace-nowrap font-medium text-white" style={{ fontSize: "6px", lineHeight: 1 }}>
          {label}
        </span>
        {label.includes("Airpods") && (
          <div className="ml-0.5 flex items-center rounded-sm border border-green-500"
            style={{ width: 12, height: 6 }}>
            <div className="bg-green-500" style={{ width: "85%", height: "100%" }} />
          </div>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   PHONE DEVICE — iPhone with Dynamic Island
   ══════════════════════════════════════════════ */
export const PhoneDevice = () => {
  const { active, ref, hoverProps } = useActiveState("phone")

  return (
    <div ref={ref} className="flex flex-col items-center" {...hoverProps}>
      <div style={{ cursor: "pointer" }}>
        <div className="relative mx-auto" style={{ width: 125 }}>
          <div className="absolute flex flex-col" style={{ top: 50, left: -2, gap: 8 }}>
            <div className="rounded-l-sm" style={{ width: 2, height: 12, background: "#525252" }} />
            <div className="rounded-l-sm" style={{ width: 2, height: 20, background: "#525252" }} />
            <div className="rounded-l-sm" style={{ width: 2, height: 20, background: "#525252" }} />
          </div>
          <div className="absolute" style={{ top: 72, right: -2 }}>
            <div className="rounded-r-sm" style={{ width: 2, height: 32, background: "#525252" }} />
          </div>

          <div className="p-1 shadow-sm"
            style={{
              borderRadius: 26,
              background: "#333",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 2px 8px rgba(0,0,0,0.3)",
            }}>
            <div className="relative overflow-hidden"
              style={{ height: 210, borderRadius: 22, background: "#171717" }}>
              <div className="absolute inset-0"
                style={{
                  opacity: active ? 1 : 0,
                  filter: active ? "blur(0px)" : "blur(8px)",
                  transition: "opacity 0.6s ease-out, filter 0.6s ease-out",
                }}>
                <ScreenImage />
              </div>
              <div className="absolute inset-x-0 top-0 z-20 flex justify-center pt-2">
                <DynamicIsland width={56} active={active} label="Connected" />
              </div>
            </div>
          </div>
          <div className="absolute inset-x-0 mx-auto rounded-full"
            style={{ bottom: 7, width: 40, height: 3, background: "#666" }} />
        </div>
      </div>

      <h3 className="mt-6 text-center text-base font-medium text-neutral-100">
        Agents in your pocket
      </h3>
      <p className="mx-auto mt-2 max-w-xs text-center text-sm text-neutral-400"
        style={{ textWrap: "balance" }}>
        Monitor workflows and receive real-time alerts on the go.
      </p>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   LAPTOP DEVICE — MacBook with lid-open hover animation
   ═══════════════════════════════════════════════════════ */
export const LaptopDevice = () => {
  const { active, ref, hoverProps } = useActiveState("laptop")

  return (
    <div ref={ref} className="flex flex-col items-center" {...hoverProps}>
      <div className="w-full" style={{ cursor: "pointer" }}>
        <div className="mx-auto w-full max-w-90 md:max-w-95" style={{ perspective: 800 }}>
          <div className="mx-auto overflow-hidden p-1.5"
            style={{
              width: "90%",
              height: 200,
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
              background: "#333",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 2px 8px rgba(0,0,0,0.3)",
              transformOrigin: "center bottom",
              transform: active ? "rotateX(0deg)" : "rotateX(-60deg)",
              transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
            }}>
            <div className="relative h-full w-full overflow-hidden"
              style={{
                background: "#171717",
                borderTopLeftRadius: 5,
                borderTopRightRadius: 8,
                borderBottomLeftRadius: 2,
                borderBottomRightRadius: 2,
              }}>
              <div className="absolute inset-0"
                style={{
                  opacity: active ? 1 : 0,
                  filter: active ? "blur(0px)" : "blur(8px)",
                  transition: "opacity 0.6s ease-out 0.3s, filter 0.6s ease-out 0.3s",
                }}>
                <ScreenImage />
              </div>
              <div className="absolute inset-x-0 top-0 z-20 flex justify-center pt-1.5">
                <DynamicIsland width={79} active={active} label="Airpods Connected" />
              </div>
            </div>
          </div>
          <div className="relative w-full"
            style={{
              height: 16,
              borderTopLeftRadius: 6,
              borderTopRightRadius: 6,
              borderBottomLeftRadius: 26,
              borderBottomRightRadius: 26,
              background: "linear-gradient(to bottom, #404040, #262626)",
              boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05)",
            }}>
            <div className="absolute inset-x-0 top-0 mx-auto rounded-b-sm"
              style={{ width: 52, height: 7, background: "#555" }} />
          </div>
        </div>
      </div>

      <h3 className="mt-6 text-center text-base font-medium text-neutral-100">
        Full control at your desk
      </h3>
      <p className="mx-auto mt-2 max-w-xs text-center text-sm text-neutral-400"
        style={{ textWrap: "balance" }}>
        Build, debug, and deploy agents with powerful desktop tools.
      </p>
    </div>
  )
}

/* ════════════════════════════════════════════
   TABLET DEVICE — iPad with Dynamic Island
   ════════════════════════════════════════════ */
export const TabletDevice = () => {
  const { active, ref, hoverProps } = useActiveState("tablet")

  return (
    <div ref={ref} className="flex flex-col items-center" {...hoverProps}>
      <div className="w-full" style={{ cursor: "pointer" }}>
        <div className="relative mx-auto w-full max-w-67.5">
          <div className="absolute flex flex-col" style={{ top: 28, right: -2, gap: 8 }}>
            <div className="rounded-r-sm" style={{ width: 2, height: 24, background: "#525252" }} />
            <div className="rounded-r-sm" style={{ width: 2, height: 24, background: "#525252" }} />
          </div>
          <div className="absolute" style={{ top: -2, right: 48 }}>
            <div className="rounded-t-sm" style={{ width: 28, height: 2, background: "#525252" }} />
          </div>

          <div className="p-1 shadow-sm"
            style={{
              borderRadius: 20,
              background: "#333",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 2px 8px rgba(0,0,0,0.3)",
            }}>
            <div className="relative overflow-hidden"
              style={{ height: 180, borderRadius: 16, background: "#171717" }}>
              <div className="absolute inset-0"
                style={{
                  opacity: active ? 1 : 0,
                  filter: active ? "blur(0px)" : "blur(8px)",
                  transition: "opacity 0.6s ease-out, filter 0.6s ease-out",
                }}>
                <ScreenImage />
              </div>
              <div className="absolute inset-x-0 top-0 z-20 flex justify-center pt-2">
                <DynamicIsland width={48} active={active} label="Connected" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <h3 className="mt-6 text-center text-base font-medium text-neutral-100">
        Orchestrate from anywhere
      </h3>
      <p className="mx-auto mt-2 max-w-xs text-center text-sm text-neutral-400"
        style={{ textWrap: "balance" }}>
        Manage complex workflows with touch-friendly dashboards.
      </p>
    </div>
  )
}
