"use client"

export default function HeroContent() {
  return (
    <div className="relative z-10 flex flex-col gap-5 px-6 pt-24 md:px-16 md:pt-0 md:pb-38 lg:max-w-[45%]">
      <h1 className="text-4xl leading-tight font-bold text-white md:text-5xl lg:text-6xl">
        3D Image{" "}
        <span className="bg-linear-to-r from-[#4f8cff] to-[#a78bfa] bg-clip-text text-transparent">
          Carousel
        </span>
      </h1>
      <p className="max-w-md text-base leading-relaxed text-gray-400 md:text-lg">
        Showcasing images in a sleek, 3D rotating cylinder gallery
      </p>
      <div>
        <button className="rounded-xl bg-linear-to-br from-[#4f8cff] to-[#2563eb] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(79,140,255,0.4)] transition-all hover:shadow-[0_14px_40px_rgba(79,140,255,0.55)]">
          Learn More
        </button>
      </div>
    </div>
  )
}
