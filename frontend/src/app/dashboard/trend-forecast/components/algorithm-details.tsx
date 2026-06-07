'use client';

import { Sigma, TrendingUp } from 'lucide-react';
import * as React from 'react';

interface AlgorithmCardProps {
  icon: React.ReactNode;
  name: string;
  nameEn: string;
  formula: string;
  formulaLatex?: string;
  params: { label: string; value: string }[];
  principles: string[];
  pros: string[];
  cons: string[];
  accentColor: string;
}

function AlgorithmCard({
  icon,
  name,
  nameEn,
  formula,
  params,
  principles,
  pros,
  cons,
  accentColor,
}: AlgorithmCardProps) {
  return (
    <div className="flex-1 border border-border/60 bg-card rounded-xl p-5 shadow-sm flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="size-9 rounded-lg flex items-center justify-center shrink-0"
          style={{
            backgroundColor: `rgba(var(--${accentColor}-rgb), 0.08)`,
            color: `var(--${accentColor})`,
          }}
        >
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">{name}</h3>
          <p className="text-[10px] text-muted-foreground italic">{nameEn}</p>
        </div>
      </div>

      {/* Công thức */}
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
          Công thức
        </p>
        <div className="bg-muted/30 rounded-lg p-3 border border-border/40">
          <code className="text-xs font-mono text-foreground">{formula}</code>
        </div>
      </div>

      {/* Tham số */}
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
          Tham số
        </p>
        <div className="space-y-1">
          {params.map((p, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="font-mono font-bold text-foreground min-w-[80px]">{p.label}</span>
              <span className="text-muted-foreground">{p.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Nguyên lý hoạt động */}
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
          Nguyên lý hoạt động
        </p>
        <ol className="list-decimal list-inside space-y-1">
          {principles.map((p, i) => (
            <li key={i} className="text-xs text-muted-foreground leading-relaxed">
              {p}
            </li>
          ))}
        </ol>
      </div>

      {/* Ưu / Nhược điểm */}
      <div className="grid grid-cols-2 gap-3 mt-auto">
        <div className="rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30 p-2.5">
          <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 mb-1">
            Ưu điểm
          </p>
          <ul className="list-disc list-inside space-y-0.5">
            {pros.map((p, i) => (
              <li
                key={i}
                className="text-[10px] text-emerald-600 dark:text-emerald-300 leading-relaxed"
              >
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 p-2.5">
          <p className="text-[10px] font-bold text-red-600 dark:text-red-400 mb-1">Nhược điểm</p>
          <ul className="list-disc list-inside space-y-0.5">
            {cons.map((c, i) => (
              <li key={i} className="text-[10px] text-red-600 dark:text-red-300 leading-relaxed">
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function AlgorithmDetails() {
  return (
    <div className="border border-border bg-card p-6 rounded-xl shadow-sm">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-6 select-none">
        Giải thích thuật toán dự báo xu hướng
      </h2>
      <div className="flex flex-col gap-5">
        {/* Linear Regression Algorithm */}
        <AlgorithmCard
          icon={<TrendingUp className="size-4" />}
          name="Hồi quy tuyến tính"
          nameEn="Linear Regression"
          formula="Y = β₀ + β₁ · X  (với X = 1, 2, 3, …, n)"
          params={[
            { label: 'β₁ (Slope)', value: 'Độ dốc — tốc độ thay đổi trung bình mỗi chu kỳ.' },
            { label: 'β₀ (Intercept)', value: 'Giá trị cơ sở khi X = 1 (chu kỳ đầu tiên).' },
            { label: 'X', value: 'Biến thời gian (index 1, 2, 3…, n, n+1,…).' },
            { label: 'Y', value: 'Giá trị dự đoán tại chu kỳ X.' },
          ]}
          principles={[
            'Xác định biến độc lập X là chỉ số thời gian (1, 2, …, n) và biến phụ thuộc Y là giá trị thực tế.',
            'Tính tổng ΣX, ΣY, ΣXY, ΣX² từ chuỗi dữ liệu lịch sử.',
            'Tính slope: β₁ = (n·ΣXY − ΣX·ΣY) / (n·ΣX² − (ΣX)²). Nếu mẫu số bằng 0, slope = 0.',
            'Tính intercept: β₀ = (ΣY − β₁·ΣX) / n.',
            'Dự báo tương lai: gán X = n + k (k = 1…horizon), tính Y = β₀ + β₁·X.',
            'Mỗi chu kỳ tương lai giá trị tăng/giảm đúng bằng slope so với chu kỳ trước.',
          ]}
          pros={[
            'Phát hiện xu hướng tăng/giảm rõ ràng qua độ dốc (slope).',
            'Dự báo có tính xu hướng, không bị "phẳng" như EMA.',
            'Cung cấp thêm thông tin: tốc độ thay đổi (slope) và mức cơ sở (intercept).',
            'Phù hợp chuỗi dữ liệu có xu hướng tuyến tính ổn định.',
          ]}
          cons={[
            'Nhạy cảm với nhiễu và điểm ngoại lai (outlier).',
            'Giả định mối quan hệ tuyến tính — không đúng nếu dữ liệu phi tuyến.',
            'Không bắt được tính mùa vụ hoặc chu kỳ lặp lại.',
            'Độ chính xác giảm dần khi horizon càng xa.',
          ]}
          accentColor="primary"
        />
      </div>
    </div>
  );
}
