import CarouselNavbar from "@/components/3dCarousel/CarouselNavbar.client"
import HeroContent from "@/components/3dCarousel/HeroContent.client"
import FeatureCards from "@/components/3dCarousel/FeatureCards.client"
import CarouselCanvasLoader from "@/components/3dCarousel/CarouselCanvasLoader.client"
import Starfield from "@/components/3dCarousel/Starfield.client"

const CarouselHeroSection = () => {
  return (
    <section
      className="relative w-full overflow-hidden md:h-screen"
      style={{
        background: [
          "radial-gradient(ellipse at 60% 30%, #1a2744 0%, transparent 50%)",
          "radial-gradient(ellipse at 40% 70%, #162033 0%, transparent 45%)",
          "radial-gradient(circle at 80% 50%, #1c2540 0%, transparent 35%)",
          "linear-gradient(180deg, #0c1220 0%, #070b13 60%, #050810 100%)",
        ].join(", "),
      }}
    >
      {/* CSS Starfield — covers entire section including behind cards */}
      <Starfield />

      {/* Noise overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          mixBlendMode: "overlay",
        }}
      />

      {/* Light wave / energy trail */}
      <div
        className="pointer-events-none absolute top-[45%] left-[5%] h-px w-[90%] opacity-50 md:top-[55%]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(246,193,119,0.3) 20%, rgba(79,140,255,0.5) 50%, rgba(167,139,250,0.4) 80%, transparent 100%)",
          filter: "blur(4px)",
        }}
      />

      {/* Main glow behind carousel — blue/purple */}
      <div
        className="pointer-events-none absolute top-[30%] right-[5%] -translate-y-1/2 md:top-[40%] md:right-[10%]"
        style={{
          width: "600px",
          height: "600px",
          background:
            "radial-gradient(circle, rgba(79,140,255,0.2) 0%, rgba(167,139,250,0.1) 35%, transparent 65%)",
          filter: "blur(90px)",
        }}
      />

      {/* Strong golden/orange warm glow — behind and below carousel */}
      <div
        className="pointer-events-none absolute top-[40%] right-[15%] -translate-y-1/2 md:top-[50%] md:right-[20%]"
        style={{
          width: "550px",
          height: "550px",
          background:
            "radial-gradient(circle, rgba(246,193,119,0.2) 0%, rgba(232,160,74,0.1) 30%, transparent 60%)",
          filter: "blur(70px)",
        }}
      />

      {/* Secondary warm glow — lower area for card region on mobile */}
      <div
        className="pointer-events-none absolute bottom-[10%] left-[30%] md:hidden"
        style={{
          width: "400px",
          height: "400px",
          background:
            "radial-gradient(circle, rgba(246,193,119,0.12) 0%, transparent 60%)",
          filter: "blur(60px)",
        }}
      />

      {/* Navbar */}
      <CarouselNavbar />

      {/* Main content */}
      <div className="relative z-10 flex h-full flex-col md:flex-row md:items-center">
        {/* Left: Text content */}
        <HeroContent />

        {/* 3D Canvas */}
        <div className="h-[50vh] w-full shrink-0 md:h-full md:flex-1">
          <CarouselCanvasLoader />
        </div>
      </div>

      {/* Feature cards */}
      <FeatureCards />
    </section>
  )
}

export default CarouselHeroSection
