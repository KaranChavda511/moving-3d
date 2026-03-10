import Starfield from '@/components/3dCarousel/Starfield.client'
import FeaturesGrid from './FeaturesGrid.client'

const FeaturesSection = () => {
  return (
    <section
      className="relative py-24 overflow-hidden"
      style={{
        background: [
          'radial-gradient(ellipse at 60% 30%, #1a2744 0%, transparent 50%)',
          'radial-gradient(ellipse at 40% 70%, #162033 0%, transparent 45%)',
          'radial-gradient(circle at 80% 50%, #1c2540 0%, transparent 35%)',
          'linear-gradient(180deg, #0c1220 0%, #070b13 60%, #050810 100%)',
        ].join(', '),
      }}
    >
      {/* CSS Starfield */}
      <Starfield />

      {/* Subtle glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: '600px',
          height: '600px',
          background:
            'radial-gradient(circle, rgba(79,140,255,0.1) 0%, rgba(167,139,250,0.05) 35%, transparent 65%)',
          filter: 'blur(80px)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white text-balance mb-4">
            Powerful Features for <span className="text-primary">Creative</span> Projects
          </h2>
          <p className="text-xl text-white/60">
            Everything you need to create stunning 3D carousel experiences
          </p>
        </div>

        {/* Features Grid with 3D Cards */}
        <FeaturesGrid />
      </div>
    </section>
  )
}

export default FeaturesSection
