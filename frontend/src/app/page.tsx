'use client';

import { useEffect, useState } from 'react';
import { AiInsights } from '@/components/landing/AiInsights';
import { CTA } from '@/components/landing/CTA';
import { FAQ } from '@/components/landing/FAQ';
import { Features } from '@/components/landing/Features';
import { Footer } from '@/components/landing/Footer';
import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Pricing } from '@/components/landing/Pricing';
import { Stats } from '@/components/landing/Stats';
import { Testimonials } from '@/components/landing/Testimonials';
import { getLandingConfig, LandingConfig } from '@/lib/landing-config';
import {
  landingService,
  FeatureItem,
  AiInsightItem,
  TestimonialItem,
  PricingItem,
} from '@/lib/services/landing.service';

export default function Home() {
  const [config] = useState<LandingConfig | null>(getLandingConfig);
  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [aiInsights, setAiInsights] = useState<AiInsightItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [pricing, setPricing] = useState<PricingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDbData = async () => {
      setIsLoading(true);
      // Simulate delay to display skeletons beautifully
      await new Promise((resolve) => setTimeout(resolve, 2000));
      try {
        const [feats, insights, tests, prices] = await Promise.all([
          landingService.getFeatures(),
          landingService.getAiInsights(),
          landingService.getTestimonials(),
          landingService.getPricing(),
        ]);
        setFeatures(feats);
        setAiInsights(insights);
        setTestimonials(tests);
        setPricing(prices);
      } catch (err) {
        console.error(
          'Failed to load landing page database data, fallback to static defaults:',
          err
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDbData();
  }, []);

  return (
    <main className="dark min-h-screen bg-background text-foreground overflow-hidden relative selection:bg-primary/30">
      {/* Background Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-chart-4/5 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-chart-2/5 blur-[120px] pointer-events-none" />

      <Header />
      <Hero title={config?.heroTitle} subtitle={config?.heroSubtitle} />
      <Features items={features} isLoading={isLoading} />
      <AiInsights items={aiInsights} isLoading={isLoading} />
      <Stats items={config?.stats} />
      <HowItWorks />
      <Testimonials items={testimonials} isLoading={isLoading} />
      <Pricing items={pricing} isLoading={isLoading} />
      <FAQ items={config?.faqs} />
      <CTA />
      <Footer />
    </main>
  );
}
