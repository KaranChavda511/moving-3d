"use client"

import { MacbookScroll } from "@/components/ui/MacbookScroll.client"

const MacbookScrollContent = () => {
  return (
    <MacbookScroll
      title={
        <span>
          Experience the 3D Carousel <br /> on any device.
        </span>
      }
      src="/images/image-2.jpg"
      showGradient={false}
    />
  )
}

export default MacbookScrollContent
