"use client"

import Image from "next/image"
import {
  DraggableCardBody,
  DraggableCardContainer,
} from "@/components/ui/DraggableCard.client"

const items = [
  {
    title: "Mountain Sunset",
    image: "/images/image-1.jpg",
    className: "absolute top-10 left-[15%] rotate-[-5deg]",
  },
  {
    title: "Ocean Breeze",
    image: "/images/image-2.jpg",
    className: "absolute top-32 left-[35%] rotate-[8deg]",
  },
  {
    title: "Forest Lake",
    image: "/images/image-3.jpg",
    className: "absolute top-10 right-[30%] rotate-[-7deg]",
  },
  {
    title: "Coastal View",
    image: "/images/image-4.jpg",
    className: "absolute top-36 right-[15%] rotate-[5deg]",
  },
]

const DraggableGalleryContent = () => {
  return (
    <DraggableCardContainer className="relative flex min-h-screen w-full items-center justify-center overflow-clip">
      <p className="absolute top-1/2 mx-auto max-w-sm -translate-y-3/4 text-center text-2xl font-black text-white/15 md:text-4xl">
        Drag the cards around to explore the gallery
      </p>
      {items.map((item, idx) => (
        <DraggableCardBody key={idx} className={item.className}>
          <Image
            src={item.image}
            alt={item.title}
            width={320}
            height={320}
            className="pointer-events-none relative z-10 h-80 w-80 rounded-md object-cover"
          />
          <h3 className="mt-4 text-center text-2xl font-bold text-white/80">
            {item.title}
          </h3>
        </DraggableCardBody>
      ))}
    </DraggableCardContainer>
  )
}

export default DraggableGalleryContent
