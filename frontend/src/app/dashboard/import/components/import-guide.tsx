'use client';

import * as React from 'react';

export function ImportGuide() {
  const steps = [
    {
      step: '01',
      title: 'Xem cấu trúc mẫu',
      description:
        'Chọn danh mục cần nhập bên dưới và xem bảng giả lập Excel mẫu (kiểm tra các cột bắt buộc, định dạng dữ liệu gợi ý và ví dụ về các dòng dữ liệu hợp lệ / báo lỗi).',
    },
    {
      step: '02',
      title: 'Chuẩn bị tệp Excel',
      description:
        'Lập tệp dữ liệu định dạng .xlsx hoặc .xls. Hàng tiêu đề đầu tiên trong file của bạn phải trùng khớp chính xác 100% với tên cột mẫu (cả chữ viết hoa/thường).',
    },
    {
      step: '03',
      title: 'Tải tệp lên hệ thống',
      description:
        'Kéo thả tệp vào khu vực quy định hoặc click để chọn tệp. Hệ thống sẽ tự động hiển thị bảng xem trước (Preview) 5 dòng đầu kèm cảnh báo nếu phát hiện sai tên cột.',
    },
    {
      step: '04',
      title: 'Kiểm tra kết quả',
      description:
        'Nhấn nút "Tiến hành tải lên". Hệ thống sẽ xử lý và báo cáo tức thì: số dòng thêm mới thành công, số dòng bị bỏ qua (do trùng lặp hoặc lỗi định dạng).',
    },
  ];

  return (
    <div className="border border-border bg-card p-6 rounded-xl shadow-sm">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-6 select-none">
        Hướng dẫn các bước thực hiện
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
