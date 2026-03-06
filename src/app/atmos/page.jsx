import AtmosSceneLoader from '@/components/AtmosScene/AtmosSceneLoader';
import AboutSectionLoader from '@/components/AtmosScene/AboutSectionLoader';

export const metadata = {
  title: 'ATMOS — Aviation Facts Experience',
  description:
    'An immersive scroll-driven 3D flight experience through the clouds, featuring fascinating aviation facts.',
};

export default function AtmosPage() {
  return (
    <main>
      {/* Scroll-driven 3D flight — uses sticky+tall-wrapper, native scroll */}
      <AtmosSceneLoader />

      {/* Normal-flow sections stack naturally below */}
      <AboutSectionLoader />

      {/* Future scroll sections go here — each owns its own scroll progress */}
      {/* <NightFlightSection /> */}
      {/* <LandingSection /> */}
    </main>
  );
}
