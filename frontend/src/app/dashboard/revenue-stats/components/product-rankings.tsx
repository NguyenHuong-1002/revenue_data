'use client';

import { Package } from 'lucide-react';
import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { HighlightProducts } from '../types';
import { getProductDisplayName } from '../utils';

type RankingTab =
  | 'topRevenue'
  | 'bottomRevenue'
  | 'topQuantity'
  | 'bottomQuantity'
  | 'topGrowth'
  | 'bottomGrowth';

interface ProductRankingsProps {
  highlights: HighlightProducts;
  activeTab: RankingTab;
  setActiveTab: (tab: RankingTab) => void;
}

export function ProductRankings({ highlights, activeTab, setActiveTab }: ProductRankingsProps) {
  const tabsList = [
    { key: 'topRevenue', label: 'Cực đại doanh thu' },
    { key: 'bottomRevenue', label: 'Doanh thu thấp nhất' },
    { key: 'topQuantity', label: 'Tiêu thụ lớn nhất' },
    { key: 'bottomQuantity', label: 'Tiêu thụ ít nhất' },
    { key: 'topGrowth', label: 'Tăng trưởng nhanh nhất' },
    { key: 'bottomGrowth', label: 'Tăng trưởng tệ nhất' },
  ] as const;

  return (
    <Card className="border border-border/80 bg-card/35 backdrop-blur-xs">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Package className="h-4 w-4 text-purple-500" />
          Bảng xếp hạng sản phẩm tiêu biểu
        </CardTitle>
        <CardDescription className="text-xs">
          Phân tích top 10 sản phẩm theo các tiêu chí doanh thu, sản lượng và tăng trưởng
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {/* Tabs header */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-border/50 pb-4">
          {tabsList.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border',
                activeTab === tab.key
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                  : 'bg-muted/40 text-muted-foreground border-border/60 hover:bg-muted hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content list */}
        <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-2">
          {highlights[activeTab]?.length > 0 ? (
            highlights[activeTab].map((item, index) => {
              const displayName = getProductDisplayName(item);
              const isTopType = activeTab.startsWith('top');

              return (
                <div
                  key={`${item.id}-${index}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-muted/20 border border-border/60 rounded-xl hover:border-border transition-all hover:bg-muted/40"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={cn(
                        'flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold border',
                        isTopType
                          ? index === 0
                            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                            : index === 1
                              ? 'bg-slate-300/30 text-slate-600 dark:text-slate-400 border-slate-300/40'
                              : 'bg-primary/10 text-primary border-primary/20'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                      )}
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p
                        className="font-bold text-foreground text-xs md:text-sm truncate"
                        title={displayName}
                      >
                        {displayName}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Mã sản phẩm: {item.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                    {/* Metric rendering based on active tab */}
                    {activeTab === 'topRevenue' || activeTab === 'bottomRevenue' ? (
                      <div className="text-right">
                        <span className="font-bold text-foreground text-sm">
                          {new Intl.NumberFormat('vi-VN').format(item.revenue)} đ
                        </span>
                        <span className="block text-[10px] text-muted-foreground text-right">
                          Đã bán: {item.quantity} chiếc
                        </span>
                      </div>
                    ) : activeTab === 'topQuantity' || activeTab === 'bottomQuantity' ? (
                      <div className="text-right">
                        <span className="font-bold text-foreground text-sm">
                          {item.quantity} sản phẩm
                        </span>
                        <span className="block text-[10px] text-muted-foreground text-right">
                          Doanh thu: {new Intl.NumberFormat('vi-VN').format(item.revenue)} đ
                        </span>
                      </div>
                    ) : (
                      // Growth stats (percentage MoM + sold quantity difference)
                      <div className="text-right flex items-center gap-4">
                        <div className="text-[10px] text-muted-foreground text-left hidden sm:block">
                          <div>
                            Tháng này:{' '}
                            <span className="font-semibold text-foreground">{item.qty1} chiếc</span>
                          </div>
                          <div>
                            Tháng trước:{' '}
                            <span className="font-semibold text-foreground">{item.qty2} chiếc</span>
                          </div>
                        </div>

                        <div className="text-right space-y-0.5">
                          <span
                            className={cn(
                              'text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 justify-end',
                              (item.growthPercent ?? 0) > 0
                                ? 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/20'
                                : (item.growthPercent ?? 0) < 0
                                  ? 'text-rose-600 bg-rose-500/10 dark:text-rose-400 border border-rose-500/20'
                                  : 'text-muted-foreground bg-muted border border-border'
                            )}
                          >
                            {(item.growthPercent ?? 0) > 0 ? '+' : ''}
                            {item.growthPercent}%
                          </span>

                          <span
                            className={cn(
                              'block text-[10px] font-medium text-right',
                              (item.qtyDiff ?? 0) > 0
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : (item.qtyDiff ?? 0) < 0
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : 'text-muted-foreground'
                            )}
                          >
                            {(item.qtyDiff ?? 0) > 0 ? '+' : ''}
                            {item.qtyDiff} sp so với tháng trước
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border rounded-xl">
              <span className="text-xs text-muted-foreground">
                Không có dữ liệu xếp hạng sản phẩm
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
