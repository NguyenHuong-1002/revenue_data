'use client';

import * as React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import type { IBranch } from '@/lib/types/branch';

interface BranchesRegionChartProps {
  branches: IBranch[];
}

const REGION_COLORS = {
  North: { fill: '#3b82f6' },
  Central: { fill: '#6366f1' },
  South: { fill: '#a855f7' },
};

const classifyRegion = (city: string): 'North' | 'Central' | 'South' => {
  const c = city.trim().toLowerCase();
  const north = ['hà nội', 'hanoi', 'hải phòng', 'hai phong', 'lạng sơn', 'lang son', 'vinh'];
  const central = ['đà nẵng', 'da nang', 'huế', 'hue', 'nha trang', 'đà lạt', 'da lat'];
  if (north.some(n => c.includes(n))) return 'North';
  if (central.some(ce => c.includes(ce))) return 'Central';
  return 'South'; // Mặc định phía Nam (Hồ Chí Minh, Cần Thơ, miền Tây, miền Đông)
};

export function BranchesRegionChart({ branches }: BranchesRegionChartProps) {
  // 1. Phân nhóm chi nhánh theo vùng miền
  const regionalData = React.useMemo(() => {
    const groups = {
      North: [] as IBranch[],
      Central: [] as IBranch[],
      South: [] as IBranch[],
    };

    branches.forEach((b) => {
      const region = classifyRegion(b.city);
      groups[region].push(b);
    });

    return [
      {
        key: 'North',
        name: 'Miền Bắc',
        value: groups.North.length,
        items: groups.North,
        ...REGION_COLORS.North,
      },
      {
        key: 'Central',
        name: 'Miền Trung',
        value: groups.Central.length,
        items: groups.Central,
        ...REGION_COLORS.Central,
      },
      {
        key: 'South',
        name: 'Miền Nam',
        value: groups.South.length,
        items: groups.South,
        ...REGION_COLORS.South,
      },
    ].filter((g) => g.value > 0);
  }, [branches]);

  // Tổng số chi nhánh có trong biểu đồ
  const total = React.useMemo(() => {
    return regionalData.reduce((acc, curr) => acc + curr.value, 0);
  }, [regionalData]);

  // Custom Tooltip cho biểu đồ quạt
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percent = ((data.value / total) * 100).toFixed(1);
      return (
        <div className="bg-slate-900/95 dark:bg-slate-950/98 border border-white/10 text-white p-3 rounded-xl shadow-xl text-xs">
          <div className="font-bold flex items-center gap-1.5 mb-1 text-slate-100">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: data.fill }}
            />
            {data.name}
          </div>
          <div className="text-[11px] text-slate-300 font-semibold">
            {data.value} chi nhánh ({percent}%)
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-md flex flex-col h-full overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Header Biểu đồ */}
      <div className="flex items-center gap-2 mb-4 border-b border-border/50 pb-3">
        <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
          <PieIcon className="size-4 animate-spin-slow" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">
            Phân bố chi nhánh vùng miền
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Tỷ lệ phân bố cơ sở kinh doanh theo vùng miền
          </p>
        </div>
      </div>

      {/* Layout dọc: chart trên, danh sách bên dưới – phù hợp cột 1/3 */}
      <div className="flex flex-col gap-4 flex-1">
        {/* Donut Chart */}
        <div className="relative flex items-center justify-center" style={{ height: 180, minHeight: 180 }}>
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
                      <Cell key={`cell-${index}`} fill={entry.fill} className="focus:outline-none transition-all duration-300 hover:opacity-85" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-foreground tracking-tight leading-none">{total}</span>
                <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Cơ sở</span>
              </div>
            </>
          )}
        </div>

        {/* Chú thích màu sắc siêu tối giản */}
        <div className="space-y-1 overflow-y-auto pr-1" style={{ maxHeight: 280 }}>
          {regionalData.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground">
              Chưa có chi nhánh nào được cấu hình
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
  );
}
