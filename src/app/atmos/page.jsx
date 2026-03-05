'use client';

import dynamic from 'next/dynamic';
import AboutSection from '@/components/AtmosScene/AboutSection';

const AtmosScene = dynamic(() => import('@/components/AtmosScene'), {
  ssr: false,
  loading: () => (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse text-2xl text-white">
      Loading Experience...
    </div>
  ),
});

export default function AtmosPage() {
  return (
    <main>
      {/* The 3D experience — internally handles its own scroll capture */}
      <AtmosScene />

      {/* Normal-scroll content section below */}
      <AboutSection />
    </main>
  );
}
