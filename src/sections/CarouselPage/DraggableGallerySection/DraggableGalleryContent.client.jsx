"use client"

import Image from "next/image"
import {
  DraggableCardBody,
  DraggableCardContainer,
} from "@/components/ui/DraggableCard.client"

const items = [
  { title: "Forest Lake", image: "/images/image-3.jpg", rotate: "rotate-[-5deg]" },
  { title: "Ocean Breeze", image: "/images/image-2.jpg", rotate: "rotate-[8deg]" },
  { title: "Mountain Sunset", image: "/images/image-1.jpg", rotate: "rotate-[-7deg]" },
  { title: "Coastal View", image: "/images/image-4.jpg", rotate: "rotate-[5deg]" },
]

const DraggableGalleryContent = () => {
  return (
    <DraggableCardContainer className="relative flex min-h-screen w-full items-center justify-center overflow-clip">
      <div className="flex flex-col items-center gap-4 py-10 md:gap-6 md:py-0">
        {/* Top row */}
        <div className="flex w-full justify-center gap-4 px-4 md:gap-16">
          {items.slice(0, 2).map((item, idx) => (
            <DraggableCardBody key={idx} className={item.rotate}>
              <Image
                src={item.image}
                alt={item.title}
                width={320}
                height={320}
                sizes="(max-width: 640px) 45vw, (max-width: 768px) 50vw, 320px"
                className="pointer-events-none relative z-10 h-36 w-full rounded-md object-cover sm:h-52 md:h-72 md:w-72"
              />
              <h3 className="mt-2 text-center text-sm font-bold text-white/80 sm:text-lg md:mt-4 md:text-2xl">
                {item.title}
              </h3>
            </DraggableCardBody>
          ))}
        </div>

        {/* Center text */}
        <p className="max-w-xs px-4 text-center text-xl font-black text-white/15 sm:text-2xl md:max-w-sm md:text-4xl">
          Drag the cards around to explore the gallery
        </p>

        {/* Bottom row */}
        <div className="flex w-full justify-center gap-4 px-4 md:gap-16">
          {items.slice(2, 4).map((item, idx) => (
            <DraggableCardBody key={idx + 2} className={item.rotate}>
              <Image
                src={item.image}
                alt={item.title}
                width={320}
                height={320}
                sizes="(max-width: 640px) 45vw, (max-width: 768px) 50vw, 320px"
                className="pointer-events-none relative z-10 h-36 w-full rounded-md object-cover sm:h-52 md:h-72 md:w-72"
              />
              <h3 className="mt-2 text-center text-sm font-bold text-white/80 sm:text-lg md:mt-4 md:text-2xl">
                {item.title}
              </h3>
            </DraggableCardBody>
          ))}
        </div>
      </div>
    </DraggableCardContainer>
  )
}

export default DraggableGalleryContent
