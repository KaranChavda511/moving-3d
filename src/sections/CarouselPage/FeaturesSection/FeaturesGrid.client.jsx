"use client"

import { Zap, BarChart3, Palette, Lock, Smartphone, Cloud } from 'lucide-react'
import { Card3D, CardItem } from '@/components/ui/Card3D.client'

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

const FeaturesGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {features.map((feature, idx) => {
        const Icon = feature.icon
        return (
          <Card3D
            key={idx}
            className="relative p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-primary/30 transition-colors duration-300 hover:shadow-lg hover:shadow-primary/5"
          >
            <CardItem translateZ={80}>
              <div className="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center mb-5 shadow-lg shadow-primary/10">
                <Icon className="w-7 h-7 text-primary" />
              </div>
            </CardItem>

            <CardItem translateZ={60}>
              <h3 className="text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>
            </CardItem>

            <CardItem translateZ={40}>
              <p className="text-white/60 leading-relaxed">
                {feature.description}
              </p>
            </CardItem>
          </Card3D>
        )
      })}
    </div>
  )
}

export default FeaturesGrid
