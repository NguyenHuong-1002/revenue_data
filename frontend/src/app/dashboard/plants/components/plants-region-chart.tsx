'use client';

import * as React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieIcon, ZoomIn } from 'lucide-react';
import type { IPlant } from '@/lib/types/plant';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface PlantsRegionChartProps {
  plants: IPlant[];
}

const REGION_COLORS = {
  North: { fill: 'var(--primary)' },
  Central: { fill: 'var(--chart-4)' },
  South: { fill: 'var(--chart-5)' },
};

const classifyRegion = (address: string): 'North' | 'Central' | 'South' => {
  const addr = address.toLowerCase();
  const north = [
    'hà nội',
    'hanoi',
    'hải phòng',
    'hai phong',
    'lạng sơn',
    'lang son',
    'vinh',
    'bắc ninh',
    'hưng yên',
    'quảng ninh',
    'miền bắc',
  ];
  const central = [
    'đà nẵng',
    'da nang',
    'huế',
    'hue',
    'nha trang',
    'đà lạt',
    'da lat',
    'quảng nam',
    'khánh hòa',
    'miền trung',
  ];
  if (north.some((n) => addr.includes(n))) return 'North';
  if (central.some((ce) => addr.includes(ce))) return 'Central';
  return 'South'; // Mặc định phía Nam (Hồ Chí Minh, Bình Dương, Đồng Nai, v.v.)
};

export function PlantsRegionChart({ plants }: PlantsRegionChartProps) {
  const [isZoomed, setIsZoomed] = React.useState(false);

  // Phân nhóm nhà kho theo vùng miền từ địa chỉ
  const regionalData = React.useMemo(() => {
    const groups = {
      North: 0,
      Central: 0,
      South: 0,
    };

    plants.forEach((p) => {
      const region = classifyRegion(p.address);
      groups[region]++;
    });

    return [
      {
        key: 'North',
        name: 'Miền Bắc',
        value: groups.North,
        ...REGION_COLORS.North,
      },
      {
        key: 'Central',
        name: 'Miền Trung',
        value: groups.Central,
        ...REGION_COLORS.Central,
      },
      {
        key: 'South',
        name: 'Miền Nam',
        value: groups.South,
        ...REGION_COLORS.South,
      },
    ].filter((g) => g.value > 0);
  }, [plants]);

  // Tổng số nhà kho
  const total = React.useMemo(() => {
    return regionalData.reduce((acc, curr) => acc + curr.value, 0);
  }, [regionalData]);

  // Custom Tooltip cho Recharts Pie
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percent = ((data.value / total) * 100).toFixed(1);
      return (
        <div className="bg-slate-900/95 dark:bg-slate-950/98 border border-white/10 text-white p-3 rounded-xl shadow-xl text-xs">
          <div className="font-bold flex items-center gap-1.5 mb-1 text-slate-100">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: data.fill }} />
            {data.name}
          </div>
          <div className="text-[11px] text-slate-300 font-semibold">
            {data.value} nhà kho ({percent}%)
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <div
        onClick={() => setIsZoomed(true)}
        className="bg-card border border-border rounded-xl p-5 shadow-md flex flex-col h-full overflow-hidden hover:shadow-lg hover:border-indigo-500/50 transition-all duration-300 cursor-pointer group"
      >
        {/* Header Biểu đồ */}
        <div className="flex items-center justify-between mb-4 border-b border-border/50 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
              <PieIcon className="size-4 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Phân bố nhà kho vùng miền</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Tỷ lệ phân bố cơ sở kho bãi theo địa chỉ vùng miền
              </p>
            </div>
          </div>
          <ZoomIn className="size-4 text-muted-foreground group-hover:text-indigo-500 transition-colors" />
        </div>

        {/* Content layout */}
        <div className="flex flex-col gap-4 flex-1">
          {/* Donut Chart */}
          <div
            className="relative flex items-center justify-center"
            style={{ height: 180, minHeight: 180 }}
          >
            {total === 0 ? (
              <div className="text-center text-xs text-muted-foreground">Không có dữ liệu</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Tooltip content={<CustomTooltip />} />
                    <Pie
                      data={regionalData}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={72}
                      paddingAngle={3}
                      dataKey="value"
                      isAnimationActive={true}
                    >
                      {regionalData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.fill}
                          className="focus:outline-none transition-all duration-300 hover:opacity-85"
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-foreground tracking-tight leading-none">
                    {total}
                  </span>
                  <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
                    Nhà kho
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Chú thích màu sắc siêu tối giản */}
          <div className="space-y-1 overflow-y-auto pr-1" style={{ maxHeight: 280 }}>
            {regionalData.length === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground">
                Chưa có nhà kho nào được cấu hình
              </div>
            ) : (
              regionalData.map((region) => {
                const percent = ((region.value / total) * 100).toFixed(0);
                return (
                  <div
                    key={region.key}
                    className="flex items-center justify-between text-xs py-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: region.fill }}
                      />
                      <span className="text-muted-foreground font-medium">{region.name}</span>
                    </div>
                    <span className="text-foreground font-semibold">
                      {region.value} ({percent}%)
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <Dialog open={isZoomed} onOpenChange={(open) => !open && setIsZoomed(false)}>
        <DialogContent className="sm:max-w-3xl bg-card border-border p-6 rounded-2xl">
          <DialogHeader className="border-b border-border/50 pb-4">
            <DialogTitle className="text-lg font-bold text-foreground">
              Phân tích cơ cấu vùng miền nhà kho
            </DialogTitle>
            <DialogDescription className="text-xs">
              Biểu đồ trực quan và số liệu chi tiết về tỷ lệ nhà kho tại miền Bắc, miền Trung, và
              miền Nam.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center pt-4">
            {/* Biểu đồ quạt phóng to */}
            <div className="col-span-1 md:col-span-3 h-[320px] w-full flex items-center justify-center relative">
              {regionalData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip content={<CustomTooltip />} />
                      <Pie
                        data={regionalData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={4}
                        dataKey="value"
                        isAnimationActive={true}
                      >
                        {regionalData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.fill}
                            className="focus:outline-none"
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-black text-foreground tracking-tight leading-none">
                      {total}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
                      Nhà kho
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground italic">Không có dữ liệu</div>
              )}
            </div>

            {/* Chi tiết số liệu bên cạnh */}
            <div className="col-span-1 md:col-span-2 space-y-4">
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Chi tiết phân bổ
                </span>
                <div className="space-y-2.5">
                  {regionalData.map((region) => {
                    const percent = ((region.value / total) * 100).toFixed(1);
                    return (
                      <div key={region.key} className="flex items-center justify-between">
                        <span className="text-sm text-foreground/80 flex items-center gap-2">
                          <span
                            className="size-3 rounded-full"
                            style={{ backgroundColor: region.fill }}
                          />
                          {region.name}
                        </span>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-foreground">
                            {region.value}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1.5">({percent}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-xs text-indigo-600 dark:text-indigo-400">
                <p className="font-semibold mb-1">💡 Định hướng kho bãi</p>
                <p className="leading-relaxed opacity-90">
                  Phân bổ nhà kho theo vùng miền giúp tối ưu hóa chuỗi cung ứng, quản lý tồn kho cục
                  bộ hiệu quả và giảm thiểu thời gian giao nhận hàng hóa.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
