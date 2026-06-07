'use client';

export function ImportHeader() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6 md:p-8 text-card-foreground shadow-sm">
      <div className="flex flex-col gap-4 max-w-3xl">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground mb-2">
            Nhập dữ liệu từ tệp Excel
          </h1>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            Hệ thống hỗ trợ nhập dữ liệu hàng loạt từ các file bảng tính Excel để nhanh chóng thiết
            lập danh mục sản phẩm, cập nhật số liệu doanh thu hoặc theo dõi lượng hàng dự trữ tồn
            kho.
          </p>
        </div>
      </div>
    </div>
  );
}
