'use client';

import { useEffect, useState } from 'react';
import { DashboardHeader } from '@/components/dashboard-header';
import { getLandingConfig, LandingConfig } from '@/lib/landing-config';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <div className="flex flex-1 flex-col p-6 gap-6 max-w-7xl mx-auto w-full">
      <DashboardHeader
        title="Quản trị Landing Page"
        description="Quản lý toàn bộ thông tin chung, chức năng AI, các tính năng nổi bật, phản hồi của khách hàng và bảng giá."
        icon={Globe}
      />

      {/* Tab Navigation */}
      <div className="flex border-b border-border/60 pb-px gap-2 overflow-x-auto scrollbar-none">
        {(
          [
            { key: 'general', label: 'Thông tin chung & FAQ' },
            { key: 'features', label: 'Tính năng nổi bật' },
            { key: 'ai', label: 'Chức năng AI' },
            { key: 'testimonials', label: 'Ý kiến khách hàng' },
            { key: 'pricing', label: 'Gói Bảng giá' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'pb-3 text-sm font-semibold relative transition-all px-4 py-2.5 rounded-t-lg cursor-pointer flex items-center gap-2 outline-none',
              activeTab === tab.key
                ? 'text-indigo-600 font-bold dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex flex-col gap-6">
        {activeTab === 'general' && <GeneralTab config={config} setConfig={setConfig} />}
        {activeTab === 'features' && <FeaturesTab />}
        {activeTab === 'ai' && <AiInsightsTab />}
        {activeTab === 'testimonials' && <TestimonialsTab />}
        {activeTab === 'pricing' && <PricingTab />}
      </div>
    </div>
  );
}
