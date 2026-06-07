'use client';

import * as React from 'react';
import * as LucideIcons from 'lucide-react';

export const AVAILABLE_ICONS = [
  'DatabaseIcon',
  'Building2Icon',
  'FactoryIcon',
  'PackageIcon',
  'CandlestickChartIcon',
  'BrainCircuitIcon',
  'DownloadIcon',
  'BellIcon',
  'NetworkIcon',
  'TrendingUpIcon',
  'SparklesIcon',
  'ShieldAlert',
  'HelpCircle',
  'MessageSquare',
  'Zap',
  'Layers',
  'Star',
];

interface IconRendererProps {
  iconName?: string;
  className?: string;
}

export function IconRenderer({
  iconName,
  className = 'h-5 w-5',
}: IconRendererProps) {
  if (!iconName) return <LucideIcons.HelpCircle className={className} />;
  const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.HelpCircle;
  return <IconComponent className={className} />;
}
