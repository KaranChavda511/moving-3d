"use client";

import { useRef, useEffect, useCallback } from "react";
import { useScroll, useTransform, useMotionValueEvent } from "framer-motion";

export default function ProductBottleScroll({ product }) {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const currentFrameRef = useRef(0);
  const rafRef = useRef(null);

  const frameCount = product.frameCount || 120;
  const ext = product.frameExt || "webp";

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  const frameIndex = useTransform(
    scrollYProgress,
    [0, 1],
    [0, frameCount - 1]
  );

  const drawFrame = useCallback(
    (index) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const img = imagesRef.current[index];
      if (!img || !img.complete) return;

      const rect = canvas.getBoundingClientRect();
      // Cap canvas resolution at 1x CSS pixels to avoid
      // upscaling low-res source images on HiDPI screens
      const cw = rect.width;
      const ch = rect.height;

      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }

      // Enable image smoothing for better quality when scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.clearRect(0, 0, cw, ch);

      // cover fit — fill entire canvas, crop overflow
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const canvasRatio = cw / ch;
      let dw, dh;
      if (imgRatio > canvasRatio) {
        dh = ch;
        dw = ch * imgRatio;
      } else {
        dw = cw;
        dh = cw / imgRatio;
      }
      const dx = (cw - dw) / 2;
      const dy = (ch - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
    },
    []
  );

  // Preload images
  useEffect(() => {
    const imgs = [];
    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      img.src = `${product.folderPath}/${i}.${ext}`;
      imgs.push(img);
    }
    imagesRef.current = imgs;

    // Draw first frame when loaded
    imgs[0].onload = () => drawFrame(0);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [product.folderPath, frameCount, ext, drawFrame]);

  // Handle resize
  useEffect(() => {
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        drawFrame(currentFrameRef.current);
      }, 100);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
    };
  }, [drawFrame]);

  // Update frame on scroll
  useMotionValueEvent(frameIndex, "change", (v) => {
    const idx = Math.round(v);
    if (idx === currentFrameRef.current) return;
    currentFrameRef.current = idx;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => drawFrame(idx));
  });

  return (
    <div ref={wrapperRef} className="relative h-[500vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>
    </div>
  );
}
