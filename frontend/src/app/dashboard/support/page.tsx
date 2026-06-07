'use client';

import { useState, useEffect } from 'react';
import { FaqSection } from './components/faq-section';
import { QuickContact } from './components/quick-contact';
import { SupportBanner } from './components/support-banner';
import { SupportForm } from './components/support-form';
import { SupportSkeleton } from './components/support-skeleton';

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Giả lập loading 1 giây
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
        <SupportSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      {/* Banner */}
      <SupportBanner searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Panel: FAQs */}
        <div className="lg:col-span-2">
          <FaqSection searchQuery={searchQuery} />
        </div>

        {/* Right Panel: Form & Contacts */}
        <div className="flex flex-col gap-6">
          <SupportForm />
          <QuickContact />
        </div>
      </div>
    </div>
  );
}
