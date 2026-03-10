import CarouselHeroSection from "@/sections/CarouselPage/CarouselHeroSection"
import FeaturesSection from "@/sections/CarouselPage/FeaturesSection"
import ParallaxShowcaseSection from "@/sections/CarouselPage/ParallaxShowcaseSection"
import DraggableGallerySection from "@/sections/CarouselPage/DraggableGallerySection"

export default function CarouselPage() {
  return (
    <>
      <CarouselHeroSection />
      <FeaturesSection />
      <ParallaxShowcaseSection />
      <DraggableGallerySection />
    </>
  )
}
