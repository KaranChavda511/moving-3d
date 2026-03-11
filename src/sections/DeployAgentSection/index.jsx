import BeamBar from "./BeamBar.client"
import { PhoneDevice, LaptopDevice, TabletDevice } from "./DeviceCards.client"

export default function DeployAgentsSection() {
  return (
    <div style={{
      background: [
        'radial-gradient(ellipse at 40% 20%, #1a2744 0%, transparent 50%)',
        'radial-gradient(ellipse at 70% 70%, #162033 0%, transparent 45%)',
        'radial-gradient(circle at 20% 60%, #1c2540 0%, transparent 35%)',
        'linear-gradient(180deg, #050810 0%, #0c1220 40%, #070b13 70%, #050810 100%)',
      ].join(', '),
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      color: "#e5e5e5",
    }}>
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
        <BeamBar />

        {/* Three Device Cards */}
        <div className="mx-auto flex w-full flex-col items-center gap-20 py-4 md:flex-row md:items-end md:justify-center md:gap-12 md:py-10 lg:gap-20">
          <PhoneDevice />
          <LaptopDevice />
          <TabletDevice />
        </div>
      </div>
    </div>
  )
}
