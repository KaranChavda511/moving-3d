'use client';

import dynamic from 'next/dynamic';

const TransformSection = dynamic(() => import('@/components/AtmosScene/TransformSection'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-[#08080c]" />,
});

export default function TransformSectionLoader() {
  return <TransformSection />;
}
