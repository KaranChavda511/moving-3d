'use client';

import dynamic from 'next/dynamic';
import './atmos.css';

const AtmosScene = dynamic(() => import('@/components/AtmosScene'), {
  ssr: false,
  loading: () => <div className="atmos-loading">Loading Experience...</div>,
});

export default function AtmosPage() {
  return (
    <div className="atmos-wrapper">
      <AtmosScene />
    </div>
  );
}
