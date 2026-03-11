import AnimatedBeam from "./AnimatedBeam.client"
import { PhoneDevice, LaptopDevice, TabletDevice } from "./DeviceCards.client"
import { SecurityCard, WorldMapCard, ComplianceCard } from "./FeatureCards.client"

const Dot = () => (
  <div className="flex shrink-0 items-center justify-center rounded-full"
    style={{ width: 16, height: 16, background: "#333" }}>
    <div className="rounded-full bg-indigo-500" style={{ width: 8, height: 8 }} />
  </div>
)

export default function DeployAgentsSection() {
  return (
    <div style={{ background: "#0a0a0a", fontFamily: "'Inter', system-ui, -apple-system, sans-serif", color: "#e5e5e5" }}>
      <div className="mx-auto px-4 py-10 md:px-8 md:py-20 lg:py-32" style={{ maxWidth: 1280 }}>

        {/* Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-2xl tracking-tight md:text-4xl lg:text-5xl"
            style={{ color: "#d4d4d4", textWrap: "balance" }}>
            Deploy agents across every platform
          </h2>
          <p className="text-sm md:text-base lg:text-lg"
            style={{ color: "#a3a3a3", textWrap: "balance" }}>
            Your AI agents work seamlessly on mobile, desktop, and tablet.
            Monitor and orchestrate from anywhere.
          </p>
        </div>

        {/* Beam connection bar (desktop only) */}
        <div className="relative mx-auto mb-8 hidden h-12 w-full items-center lg:flex">
          <div className="relative flex h-full w-full items-center">
            <div className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
              style={{ left: "calc(100% / 6)" }}><Dot /></div>
            <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"><Dot /></div>
            <div className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
              style={{ left: "calc(500% / 6)" }}><Dot /></div>

            <div className="absolute top-1/2 -translate-y-1/2"
              style={{ left: "calc(100% / 6)", width: "calc(400% / 6)" }}>
              <AnimatedBeam id="full" delay={0} />
            </div>
          </div>
        </div>

        {/* Three Device Cards */}
        <div className="mx-auto grid w-full grid-cols-1 items-center gap-10 overflow-hidden py-4 md:grid-cols-3 md:py-10">
          <PhoneDevice />
          <LaptopDevice />
          <TabletDevice />
        </div>

        {/* Feature Cards */}
        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
          <SecurityCard />
          <WorldMapCard />
          <ComplianceCard />
        </div>
      </div>
    </div>
  )
}
