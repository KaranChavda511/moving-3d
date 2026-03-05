'use client';

import { Canvas } from '@react-three/fiber';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import AtmosExperience from './AtmosExperience';

export default function AtmosScene() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [showHint, setShowHint] = useState(true);
  const targetScroll = useRef(0);
  const currentScroll = useRef(0);
  const textRefs = useRef([]);
  const touchStartY = useRef(0);

  // Text content
  const textContent = useMemo(() => [
    {
      progress: 0.12,
      sup: null,
      title: null,
      body: 'Hello passengers and welcome aboard. Please sit back, relax, and enjoy the view while we tell you some of our favourite facts about the aviation world.',
      isIntroText: true,
      side: 'right',
    },
    {
      progress: 0.30,
      sup: 'Fact #01',
      title: 'SKY\nBABIES',
      body: 'Apart from a crash, the worst nightmare of every flight attendant is childbirth on board. Although extremely rare, nearly 60 babies were born in the sky!',
      side: 'right',
    },
    {
      progress: 0.48,
      sup: 'Fact #02',
      title: 'FORBIDDEN\nNUMBER',
      body: "Since the number 13 is considered an unlucky number in Western culture, most airlines don't have a row 13 on their planes!",
      side: 'left',
    },
    {
      progress: 0.66,
      sup: 'Fact #03',
      title: 'FAST AS\nLIGHTNING',
      body: "Commercial aircraft typically cruise at speeds of around 575 mph. That's roughly 80% the speed of sound!",
      side: 'right',
    },
    {
      progress: 0.84,
      sup: 'Fact #04',
      title: 'FLIGHT\nTO HEL',
      body: 'In 2017, on a Friday the 13th, Flight 666 to HEL took off for the last time, before being renumbered.',
      side: 'left',
    },
  ], []);

  // Pre-compute equalizer bar heights (deterministic)
  const eqBarHeights = useMemo(
    () => Array.from({ length: 12 }, (_, i) => 8 + ((i * 7 + 3) % 16)),
    []
  );

  // Ref callback for text overlays
  const setTextRef = useCallback((index) => (el) => {
    if (el) textRefs.current[index] = el;
  }, []);

  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault();
      const rawDelta = Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 50);
      const delta = rawDelta * 0.00008;
      targetScroll.current = Math.max(0, Math.min(1, targetScroll.current + delta));
    };

    const smoothScroll = () => {
      const lerp = (start, end, factor) => start + (end - start) * factor;
      currentScroll.current = lerp(currentScroll.current, targetScroll.current, 0.04);
      setScrollProgress(currentScroll.current);

      if (currentScroll.current > 0.02 && showIntro) {
        setShowIntro(false);
        setShowHint(false);
      }

      // Drive text overlay animations with vanilla JS (replaces gsap.set)
      textContent.forEach((text, index) => {
        const el = textRefs.current[index];
        if (!el) return;

        const diff = currentScroll.current - text.progress;
        const absDiff = Math.abs(diff);
        const visibility = Math.max(0, 1 - absDiff * 16);

        let scale, opacity;
        if (diff < 0) {
          scale = 0.3 + visibility * 0.7;
          opacity = visibility;
        } else {
          scale = 1.0 + diff * 6;
          opacity = visibility;
        }

        // Direct style manipulation - GPU-accelerated via transform
        el.style.opacity = opacity;
        el.style.transform = `translateY(-50%) scale(${scale})`;
        el.style.visibility = opacity < 0.01 ? 'hidden' : 'visible';
      });

      requestAnimationFrame(smoothScroll);
    };

    const handleTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY.current - touchY;
      touchStartY.current = touchY;
      const delta = deltaY * 0.0004;
      targetScroll.current = Math.max(0, Math.min(1, targetScroll.current + delta));
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    const animationId = requestAnimationFrame(smoothScroll);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animationId);
    };
  }, [showIntro, textContent]);

  return (
    <div className="atmos-container">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 0], fov: 75 }}
        gl={{ antialias: true }}
        onCreated={({ gl }) => { gl.setClearColor('#1a2fa0'); }}
      >
        <AtmosExperience scrollProgress={scrollProgress} />
      </Canvas>

      {/* Contrail SVG */}
      <svg className="contrail-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="trailGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0.9" />
            <stop offset="60%" stopColor="white" stopOpacity="0.5" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line
          x1="50" y1="48"
          x2="50" y2={48 + scrollProgress * 52}
          stroke="url(#trailGrad)"
          strokeWidth="0.6"
        />
      </svg>

      {/* Fixed Header */}
      <header className="atmos-header">
        <div className="atmos-equalizer">
          {[...Array(12)].map((_, i) => (
            <span
              key={i}
              className="eq-bar"
              style={{
                animationDelay: `${i * 0.1}s`,
                height: `${eqBarHeights[i]}px`,
              }}
            />
          ))}
        </div>
        <div className="atmos-logo">ATMOS</div>
        <div className="atmos-about">About</div>
      </header>

      {/* Intro title */}
      {showIntro && (
        <div className="atmos-intro">
          <h1>
            <span>A</span><span>T</span><span>M</span><span>O</span><span>S</span>
          </h1>
        </div>
      )}

      {showHint && (
        <div className="atmos-hint">Scroll to begin the journey ↓</div>
      )}

      {/* Text overlays */}
      {textContent.map((text, index) => (
        <div
          key={index}
          ref={setTextRef(index)}
          className={`atmos-text-overlay text-${text.side}`}
          style={{
            opacity: 0,
            transformOrigin: text.side === 'right' ? 'right center' : 'left center',
          }}
        >
          {text.isIntroText ? (
            <p className="body">{text.body}</p>
          ) : (
            <>
              {text.sup && <div className="sup">{text.sup}</div>}
              {text.title && (
                <div className="title">
                  {text.title.split('\n').map((line, i) => (
                    <span key={i}>{line}{i < text.title.split('\n').length - 1 && <br />}</span>
                  ))}
                </div>
              )}
              <p className="body">{text.body}</p>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
