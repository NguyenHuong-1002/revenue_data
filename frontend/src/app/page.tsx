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
  const [config, setConfig] = useState<LandingConfig | null>(null);
  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [aiInsights, setAiInsights] = useState<AiInsightItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [pricing, setPricing] = useState<PricingItem[]>([]);

  useEffect(() => {
    setConfig(getLandingConfig());

    const fetchDbData = async () => {
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
      }
    };

    fetchDbData();
  }, []);

  return (
    <main className="landing-surface min-h-screen bg-background text-foreground overflow-hidden">
      <Header />
      <Hero title={config?.heroTitle} subtitle={config?.heroSubtitle} />
      <Features items={features} />
      <AiInsights items={aiInsights} />
      <Stats items={config?.stats} />
      <HowItWorks />
      <Testimonials items={testimonials} />
      <Pricing items={pricing} />
      <FAQ items={config?.faqs} />
      <CTA />
      <Footer />
    </main>
  );
}
