import React from 'react';
import HeroSection from '../components/Home/hero_section';
import FeatureSection from '../components/Home/feature_section';
import HowItWorksSection from '../components/Home/how_it_works_section';
import AboutSection from '../components/Home/about_section';
import PricingSection from '../components/Home/pricing_section';
import CTASection from '../components/Home/cta_section';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <div>
      <HeroSection />
      <FeatureSection />
      <HowItWorksSection />
      <AboutSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Home;
