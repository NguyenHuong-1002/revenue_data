'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { getLandingConfig, LandingConfig } from '@/lib/landing-config';
import { Globe } from 'lucide-react';

import { GeneralTab } from './components/general-tab';
import { FeaturesTab } from './components/features-tab';
import { AiInsightsTab } from './components/ai-insights-tab';
import { TestimonialsTab } from './components/testimonials-tab';
import { PricingTab } from './components/pricing-tab';

export default function LandingManagerPage() {
  const [activeTab, setActiveTab] = useState<
    'general' | 'features' | 'ai' | 'testimonials' | 'pricing'
  >('general');

  // Local config (Hero, Stats, FAQs)
  const [config, setConfig] = useState<LandingConfig | null>(null);

  useEffect(() => {
    setConfig(getLandingConfig());
  }, []);

  if (!config) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Đang tải cấu hình...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col p-6 gap-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Globe className="size-8 text-blue-500" />
            Quản trị Landing Page
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Quản lý toàn bộ thông tin chung, chức năng AI, các tính năng nổi bật, phản hồi của khách hàng và bảng giá.
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as any)}
        className="w-full flex flex-col gap-6"
      >
        <TabsList className="bg-muted p-1 rounded-full w-fit">
          <TabsTrigger value="general" className="cursor-pointer">
            Thông tin chung & FAQ
          </TabsTrigger>
          <TabsTrigger value="features" className="cursor-pointer">
            Tính năng nổi bật
          </TabsTrigger>
          <TabsTrigger value="ai" className="cursor-pointer">
            Chức năng AI
          </TabsTrigger>
          <TabsTrigger value="testimonials" className="cursor-pointer">
            Ý kiến khách hàng
          </TabsTrigger>
          <TabsTrigger value="pricing" className="cursor-pointer">
            Gói Bảng giá
          </TabsTrigger>
        </TabsList>

        <div className="mt-2">
          {/* ==================== ACTIVE TAB: GENERAL ==================== */}
          <TabsContent value="general" className="mt-0">
            <GeneralTab config={config} setConfig={setConfig} />
          </TabsContent>

          {/* ==================== ACTIVE TAB: FEATURES ==================== */}
          <TabsContent value="features" className="mt-0">
            <FeaturesTab />
          </TabsContent>

          {/* ==================== ACTIVE TAB: AI INSIGHTS ==================== */}
          <TabsContent value="ai" className="mt-0">
            <AiInsightsTab />
          </TabsContent>

          {/* ==================== ACTIVE TAB: TESTIMONIALS ==================== */}
          <TabsContent value="testimonials" className="mt-0">
            <TestimonialsTab />
          </TabsContent>

          {/* ==================== ACTIVE TAB: PRICING ==================== */}
          <TabsContent value="pricing" className="mt-0">
            <PricingTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
