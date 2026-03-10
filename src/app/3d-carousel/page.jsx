import CarouselHeroSection from "@/sections/CarouselPage/CarouselHeroSection"
import FeaturesSection from "@/sections/CarouselPage/FeaturesSection"
import ParallaxShowcaseSection from "@/sections/CarouselPage/ParallaxShowcaseSection"
import DraggableGallerySection from "@/sections/CarouselPage/DraggableGallerySection"
import MacbookScrollSection from "@/sections/CarouselPage/MacbookScrollSection"
import HeroParallaxSection from "@/sections/CarouselPage/HeroParallaxSection"

export default function CarouselPage() {
  return (
    <>
      <CarouselHeroSection />
      <FeaturesSection />
      <ParallaxShowcaseSection />
      <DraggableGallerySection />
      <MacbookScrollSection />
      <HeroParallaxSection />
    </>
  )
}
