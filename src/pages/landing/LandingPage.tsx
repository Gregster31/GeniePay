import { Header } from './sections/Header';
import { Hero } from './sections/Hero';
import { Stats } from './sections/Stats';
import { GetStarted } from './sections/GetStarted';
import { FeatureCards } from './sections/FeatureCards';
import { CaseStudies } from './sections/CaseStudies';
import { CTA } from './sections/CTA';
import { LandingFooter } from './sections/LandingFooter';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black">
      <Header />
      <Hero />
      <Stats />
      <GetStarted />
      <FeatureCards />
      <CaseStudies />
      <CTA />
      <LandingFooter />
    </main>
  );
}
