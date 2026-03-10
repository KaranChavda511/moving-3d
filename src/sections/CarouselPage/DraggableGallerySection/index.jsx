import Starfield from '@/components/3dCarousel/Starfield.client'
import DraggableGalleryContent from './DraggableGalleryContent.client'

const DraggableGallerySection = () => {
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

      {/* Warm glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: '500px',
          height: '500px',
          background:
            'radial-gradient(circle, rgba(246,193,119,0.1) 0%, rgba(79,140,255,0.06) 40%, transparent 65%)',
          filter: 'blur(80px)',
        }}
      />

      <DraggableGalleryContent />
    </section>
  )
}

export default DraggableGallerySection
