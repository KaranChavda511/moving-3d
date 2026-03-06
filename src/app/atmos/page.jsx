import AtmosSceneLoader from '@/components/AtmosScene/AtmosSceneLoader';
import AboutSection from '@/components/AtmosScene/AboutSection';

export default function AtmosPage() {
  return (
    <main>
      {/* Scroll-driven 3D flight — uses sticky+tall-wrapper, native scroll */}
      <AtmosSceneLoader />

      {/* Normal-flow sections stack naturally below */}
      <AboutSection />

      {/* Future scroll sections go here — each owns its own scroll progress */}
      {/* <NightFlightSection /> */}
      {/* <LandingSection /> */}
    </main>
  );
}
