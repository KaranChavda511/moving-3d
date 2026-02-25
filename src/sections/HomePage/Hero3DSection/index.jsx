import Image from "next/image";
import SplineViewer from "@/components/SplineViewer";
import styles from "./Hero3DSection.module.css";
import gradientImg from "@/assets/images/gradient.png";

const Hero3DSection = (data) => {
  return (
    <section className="relative isolate min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_center,#050507_0%,#020203_55%,#000000_100%)] font-sans text-white">
      <div className="container relative z-20 mx-auto flex min-h-screen items-center px-6 md:px-12">
        <div className="absolute right-0 top-[-10%] z-10 hidden h-[120%] w-[65%] md:block">
          <SplineViewer />
        </div>

        <div className="flex w-full flex-col items-start md:w-1/2">
          <div className="mb-8 inline-flex items-center rounded-full border border-[#a855f7]/60 bg-black px-5 py-1.5 shadow-[0_0_18px_rgba(168,85,247,0.45)]">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#d8b4fe]">
              INTRUCING Δ
            </span>
          </div>

          <h1 className="mb-6 text-4xl font-semibold uppercase leading-[1.1] sm:text-5xl md:text-6xl lg:text-[64px]">
            EMAIL FOR
            <br />
            DEVELOPERS
          </h1>

          <p className="max-w-105 mb-12 text-sm leading-relaxed text-[#8a8a8a] md:text-[15px]">
            the best way to reach humans instead of spam folders,
            <br className="hidden md:block" />
            deliver transactional and marketing emails at scale.
          </p>

          <div className="flex gap-5">
            <button className="rounded-full border border-white/10 bg-[#0a0a0a] px-6 py-2.5 text-[#c084fc]">
              Documentation &gt;
            </button>

            <button className="rounded-full bg-white px-6 py-2.5 font-semibold text-black">
              Getstarted &gt;
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT PROJECTION GRADIENT */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="h-95 w-95 absolute right-0 top-0">
          <div className={styles.layerBlur} />
          <div className="absolute inset-0 opacity-70">
            <Image
              src={gradientImg}
              alt="grid layer"
              fill
              priority
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero3DSection;
