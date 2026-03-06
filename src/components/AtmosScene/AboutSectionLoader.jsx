'use client';

import dynamic from 'next/dynamic';

const AboutSection = dynamic(() => import('@/components/AtmosScene/AboutSection'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-[#eef0f4]" />,
});

export default function AboutSectionLoader() {
  return <AboutSection />;
}
