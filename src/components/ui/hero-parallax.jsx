"use client"

import React, { useSyncExternalStore } from "react"
import Image from "next/image"
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from "motion/react"

const subscribe = (cb) => {
  window.addEventListener("resize", cb)
  return () => window.removeEventListener("resize", cb)
}

export const HeroParallax = ({ products }) => {
  const isMobile = useSyncExternalStore(
    subscribe,
    () => window.innerWidth < 768,
    () => false,
  )

  const firstRow = products.slice(0, 5)
  const secondRow = products.slice(5, 10)
  const thirdRow = products.slice(10, 15)
  const ref = React.useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })

  const springConfig = { stiffness: 300, damping: 30, bounce: 100 }

  const translateX = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, isMobile ? 400 : 1000]),
    springConfig,
  )
  const translateXReverse = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, isMobile ? -400 : -1000]),
    springConfig,
  )
  const rotateX = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [15, 0]),
    springConfig,
  )
  const opacity = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [0.2, 1]),
    springConfig,
  )
  const rotateZ = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [20, 0]),
    springConfig,
  )
  const translateY = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [isMobile ? -300 : -700, isMobile ? 250 : 500]),
    springConfig,
  )

  return (
    <div
      ref={ref}
      className="relative flex h-[150vh] flex-col self-auto overflow-hidden py-20 antialiased sm:h-[200vh] sm:py-30 md:h-[300vh] md:py-40 perspective-[1000px] transform-3d"
    >
      <Header />
      <motion.div
        style={{
          rotateX,
          rotateZ,
          translateY,
          opacity,
        }}
      >
        <motion.div className="mb-10 flex flex-row-reverse gap-10 sm:mb-16 sm:gap-16 md:mb-20 md:gap-20">
          {firstRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={product.title}
            />
          ))}
        </motion.div>
        <motion.div className="mb-10 flex flex-row gap-10 sm:mb-16 sm:gap-16 md:mb-20 md:gap-20">
          {secondRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateXReverse}
              key={product.title}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row-reverse gap-10 sm:gap-16 md:gap-20">
          {thirdRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={product.title}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}

const Header = () => {
  return (
    <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-10 sm:py-20 md:py-40">
      <h2 className="text-3xl font-bold text-white sm:text-5xl md:text-7xl">
        The Ultimate <br /> development studio
      </h2>
      <p className="mt-4 max-w-2xl text-sm text-neutral-200 sm:mt-6 sm:text-base md:mt-8 md:text-xl">
        We build beautiful products with the latest technologies and frameworks.
        We are a team of passionate developers and designers that love to build
        amazing products.
      </p>
    </div>
  )
}

const ProductCard = ({ product, translate }) => {
  return (
    <motion.div
      style={{
        x: translate,
      }}
      whileHover={{
        y: -20,
      }}
      key={product.title}
      className="group/product relative h-48 w-[16rem] shrink-0 sm:h-72 sm:w-88 md:h-96 md:w-120"
    >
      <a
        href={product.link}
        className="block group-hover/product:shadow-2xl"
      >
        <Image
          src={product.thumbnail}
          height={600}
          width={600}
          className="absolute inset-0 h-full w-full rounded-lg object-cover object-top-left"
          alt={product.title}
        />
      </a>
      <div className="pointer-events-none absolute inset-0 h-full w-full rounded-lg bg-black opacity-0 group-hover/product:opacity-80" />
      <h3 className="absolute bottom-2 left-2 text-sm text-white opacity-0 group-hover/product:opacity-100 sm:bottom-4 sm:left-4 sm:text-base">
        {product.title}
      </h3>
    </motion.div>
  )
}
