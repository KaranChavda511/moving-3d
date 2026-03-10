import { Zap, BarChart3, Palette, Lock, Smartphone, Cloud } from 'lucide-react'
import Starfield from '@/components/3dCarousel/Starfield.client'

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized rendering delivers smooth 60fps animations with minimal lag'
  },
  {
    icon: Palette,
    title: 'Fully Customizable',
    description: 'Control colors, animations, speed, and behavior to match your brand'
  },
  {
    icon: Smartphone,
    title: 'Responsive Design',
    description: 'Works flawlessly on desktop, tablet, and mobile devices'
  },
  {
    icon: Lock,
    title: 'Production Ready',
    description: 'Battle-tested code with enterprise-level reliability'
  },
  {
    icon: Cloud,
    title: 'Easy Integration',
    description: 'Simple API with comprehensive documentation and examples'
  },
  {
    icon: BarChart3,
    title: 'Analytics Ready',
    description: 'Built-in tracking for user interactions and engagement metrics'
  },
]

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

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div
                key={idx}
                className="group relative p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
              >
                {/* Hover background effect */}
                <div className="absolute inset-0 bg-primary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-3">
                    {feature.title}
                  </h3>

                  <p className="text-white/60 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
