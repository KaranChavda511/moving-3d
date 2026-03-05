'use client';

import dynamic from 'next/dynamic';

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
    <div className="relative h-screen w-screen overflow-hidden bg-[#1a2fa0]">
      <AtmosScene />
    </div>
  );
}
