import Starfield from '@/components/3dCarousel/Starfield.client'
import MacbookScrollContent from './MacbookScrollContent.client'

const MacbookScrollSection = () => {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: [
          'radial-gradient(ellipse at 60% 30%, #1a2744 0%, transparent 50%)',
          'radial-gradient(ellipse at 40% 70%, #162033 0%, transparent 45%)',
          'radial-gradient(circle at 80% 50%, #1c2540 0%, transparent 35%)',
          'linear-gradient(180deg, #0c1220 0%, #070b13 60%, #050810 100%)',
        ].join(', '),
      }}
    >
      <Starfield />
      <MacbookScrollContent />
    </section>
  )
}

export default MacbookScrollSection
