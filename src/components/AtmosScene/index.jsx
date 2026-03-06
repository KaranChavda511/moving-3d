'use client';

import { Canvas } from '@react-three/fiber';
import { useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'motion/react';
import AtmosExperience from './AtmosExperience';
import styles from './atmos.module.css';

// Text overlay that fades in/out based on scroll progress range
function TextOverlay({ text, start, end, scrollYProgress }) {
  const opacity = useTransform(
    scrollYProgress,
    [start, start + 0.03, end - 0.03, end],
    [0, 1, 1, 0]
  );
  const scale = useTransform(
    scrollYProgress,
    [start, start + 0.03, end - 0.03, end],
    [0.85, 1, 1, 1.1]
  );
  const y = useTransform(
    scrollYProgress,
    [start, start + 0.03, end - 0.03, end],
    [30, 0, 0, -20]
  );

  return (
    <motion.div
      className={`pointer-events-none absolute top-[65%] z-15 max-w-85 -translate-y-1/2 text-white ${
        text.side === 'right'
          ? 'right-[5%] left-auto text-left'
          : 'left-[5%] right-auto text-right'
      }`}
      style={{
        opacity,
        scale,
        y,
        transformOrigin: text.side === 'right' ? 'right center' : 'left center',
      }}
    >
      {text.isIntroText ? (
        <p className="text-[clamp(14px,1.5vw,17px)] font-normal leading-relaxed opacity-90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.15)]">
          {text.body}
        </p>
      ) : (
        <>
          {text.sup && (
            <div className="mb-2.5 text-[13px] font-normal tracking-[0.15em] opacity-85 drop-shadow-[0_2px_10px_rgba(0,0,0,0.15)]">
              {text.sup}
            </div>
          )}
          {text.title && (
            <div className="mb-4 font-serif text-[clamp(36px,5vw,64px)] font-normal uppercase leading-[1.05] tracking-[0.02em] drop-shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
              {text.title.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  {i < text.title.split('\n').length - 1 && <br />}
                </span>
              ))}
            </div>
          )}
          <p className="text-[clamp(14px,1.5vw,17px)] font-normal leading-relaxed opacity-90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.15)]">
            {text.body}
          </p>
        </>
      )}
    </motion.div>
  );
}

export default function AtmosScene() {
  const wrapperRef = useRef(null);
  // scrollYProgress: 0 at top of wrapper, 1 at bottom — driven by native scroll
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start start', 'end end'],
  });

  // Bridge MotionValue → plain number ref for Three.js useFrame
  const scrollRef = useRef(0);
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    scrollRef.current = v;
  });

  // Intro/hint visibility driven by scroll progress
  const introOpacity = useTransform(scrollYProgress, [0, 0.02], [1, 0]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.015], [1, 0]);

  // Contrail line length
  const trailY2 = useTransform(scrollYProgress, [0, 1], [48, 100]);

  // Text content with scroll ranges (start, end) instead of single progress points
  const textContent = [
    {
      start: 0.06,
      end: 0.2,
      sup: null,
      title: null,
      body: 'Hello passengers and welcome aboard. Please sit back, relax, and enjoy the view while we tell you some of our favourite facts about the aviation world.',
      isIntroText: true,
      side: 'right',
    },
    {
      start: 0.22,
      end: 0.38,
      sup: 'Fact #01',
      title: 'SKY\nBABIES',
      body: 'Apart from a crash, the worst nightmare of every flight attendant is childbirth on board. Although extremely rare, nearly 60 babies were born in the sky!',
      side: 'right',
    },
    {
      start: 0.40,
      end: 0.56,
      sup: 'Fact #02',
      title: 'FORBIDDEN\nNUMBER',
      body: "Since the number 13 is considered an unlucky number in Western culture, most airlines don't have a row 13 on their planes!",
      side: 'left',
    },
    {
      start: 0.58,
      end: 0.74,
      sup: 'Fact #03',
      title: 'FAST AS\nLIGHTNING',
      body: "Commercial aircraft typically cruise at speeds of around 575 mph. That's roughly 80% the speed of sound!",
      side: 'right',
    },
    {
      start: 0.76,
      end: 0.92,
      sup: 'Fact #04',
      title: 'FLIGHT\nTO HEL',
      body: 'In 2017, on a Friday the 13th, Flight 666 to HEL took off for the last time, before being renumbered.',
      side: 'left',
    },
  ];

  // Pre-compute equalizer bar heights (deterministic)
  const eqBarHeights = Array.from({ length: 12 }, (_, i) => 8 + ((i * 7 + 3) % 16));

  return (
    <div ref={wrapperRef} className="relative h-[600vh]">
      {/* Sticky viewport — stays pinned while user scrolls through the tall wrapper */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* 3D Canvas */}
        <Canvas
          className="absolute! inset-0 h-full w-full"
          camera={{ position: [0, 0, 0], fov: 75 }}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          dpr={[1, 1.5]}
          onCreated={({ gl }) => {
            gl.setClearColor('#1a2fa0');
          }}
        >
          <AtmosExperience scrollRef={scrollRef} />
        </Canvas>

        {/* Contrail SVG */}
        <svg
          className="pointer-events-none absolute inset-0 z-8 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="trailGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="white" stopOpacity="0.9" />
              <stop offset="60%" stopColor="white" stopOpacity="0.5" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.line
            x1="50"
            y1="48"
            x2="50"
            y2={trailY2}
            stroke="url(#trailGrad)"
            strokeWidth="0.6"
          />
        </svg>

        {/* Fixed Header */}
        <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between px-10 py-7 max-md:px-6 max-md:py-5">
          <div className="flex h-6 items-end gap-0.5">
            {[...Array(12)].map((_, i) => (
              <span
                key={i}
                className={`block w-0.5 bg-white opacity-80 ${styles.eqBar}`}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  height: `${eqBarHeights[i]}px`,
                }}
              />
            ))}
          </div>
          <div className="font-serif text-[22px] font-normal tracking-[0.35em] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.2)]">
            ATMOS
          </div>
          <div className="pointer-events-auto cursor-pointer text-[15px] font-normal tracking-[0.05em] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.2)]">
            About
          </div>
        </header>

        {/* Intro title */}
        <motion.div
          className="pointer-events-none absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 text-center text-white"
          style={{ opacity: introOpacity }}
        >
          <h1 className="m-0 font-serif text-[clamp(60px,12vw,140px)] font-normal tracking-[0.3em] drop-shadow-[0_4px_30px_rgba(0,0,0,0.3)] max-md:tracking-[0.2em] max-[480px]:tracking-[0.15em]">
            {'ATMOS'.split('').map((letter, i) => (
              <span
                key={i}
                className={styles.introLetter}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {letter}
              </span>
            ))}
          </h1>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          className={`pointer-events-none absolute bottom-15 left-1/2 z-20 text-base font-normal tracking-[0.05em] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)] max-[480px]:bottom-10 max-[480px]:text-sm ${styles.scrollHint}`}
          style={{ opacity: hintOpacity }}
        >
          Scroll to begin the journey ↓
        </motion.div>

        {/* Text overlays — each driven by its own scroll range */}
        {textContent.map((text, index) => (
          <TextOverlay
            key={index}
            text={text}
            start={text.start}
            end={text.end}
            scrollYProgress={scrollYProgress}
          />
        ))}
      </div>
    </div>
  );
}
