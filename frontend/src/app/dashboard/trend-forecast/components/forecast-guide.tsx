'use client';

import * as React from 'react';

export function ForecastGuide() {
  const steps = [
    {
      step: '01',
      title: 'Chọn cấu hình bộ lọc',
      description:
        'Lọc theo danh mục dữ liệu cần dự đoán (Doanh số / Tồn kho), chu kỳ thời gian (Tuần / Tháng / Quý) và khoảng thời gian dự kiến (Horizon) mong muốn.',
    },
    {
      step: '02',
      title: 'Xác định thời kỳ dự báo',
      description:
        'Chọn khoảng thời gian dự kiến (Horizon) phù hợp để chạy dự đoán. Horizon ngắn hơn sẽ cho độ tin cậy cao hơn, trong khi horizon dài hơn hỗ trợ hoạch định chiến lược dài hạn.',
    },
    {
      step: '03',
      title: 'Áp dụng & Phân tích xu hướng',
      description:
        'Nhấn nút "Cập nhật dự báo" để chạy thuật toán. Hệ thống sẽ ngay lập tức tính toán độ dốc (Slope) và mức cơ sở (Intercept) để phác thảo hướng phát triển sắp tới.',
    },
    {
      step: '04',
      title: 'Đọc kết quả & Đưa quyết định',
      description:
        'Theo dõi các cảnh báo biến động tự động và khuyến nghị hành động trên biểu đồ trực quan để tối ưu hóa tồn kho an toàn và chiến dịch bán hàng.',
    },
  ];

  return (
    <div className="border border-border bg-card p-6 rounded-xl shadow-sm">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-6 select-none">
        Hướng dẫn phân tích & dự báo xu hướng
      </h2>
      <div className="flex flex-col gap-6 relative pl-1">
        {steps.map((item, index) => {
          const isLast = index === steps.length - 1;
          return (
            <div key={index} className="relative flex items-start gap-4 group">
              {/* Stepper Vertical Connector Line */}
              {!isLast && (
                <div
                  aria-hidden
                  className="absolute left-[15px] top-8 bottom-[-24px] w-0.5 bg-border dark:bg-zinc-800/80"
                />
              )}

              {/* Step Badge */}
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-bold text-xs shrink-0 select-none z-10">
                {item.step}
              </div>

              {/* Step Info */}
              <div className="flex-1 min-w-0 pt-0.5">
                <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed mt-1 max-w-3xl">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
