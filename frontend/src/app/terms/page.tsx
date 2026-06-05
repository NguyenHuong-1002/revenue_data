import { ArrowLeftIcon, BarChart3Icon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DynamicBreadcrumb } from '@/components/dynamic-breadcrumb';

export const metadata: Metadata = {
  title: 'Điều khoản dịch vụ | Hệ thống Doanh thu',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex size-9 items-center justify-center rounded-4xl bg-primary text-primary-foreground">
              <BarChart3Icon className="size-4" />
            </span>
            Hệ thống Doanh thu
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <ArrowLeftIcon className="size-4 mr-1" />
              Quay lại
            </Link>
          </Button>
        </div>

        <div className="space-y-8">
          <DynamicBreadcrumb />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Điều khoản dịch vụ</h1>
            <p className="mt-2 text-sm text-muted-foreground">Cập nhật lần cuối: 01/06/2026</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">1. Chấp nhận điều khoản</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Bằng cách truy cập hoặc sử dụng Hệ thống Doanh thu (&quot;Dịch vụ&quot;), bạn xác nhận
              rằng bạn đã đọc, hiểu và đồng ý bị ràng buộc bởi các Điều khoản dịch vụ này. Nếu bạn
              không đồng ý với bất kỳ phần nào của điều khoản, bạn không được phép sử dụng Dịch vụ.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">2. Mô tả dịch vụ</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Hệ thống Doanh thu là nền tảng quản lý doanh thu toàn diện, cung cấp các tính năng bao
              gồm: nhập dữ liệu từ Excel, quản lý sản phẩm/chi nhánh/nhà máy, dự báo thông minh,
              phân tích AI, xuất báo cáo PDF/Excel và các tính năng liên quan khác. Chúng tôi có
              quyền cập nhật, thay đổi hoặc ngừng cung cấp bất kỳ tính năng nào mà không cần thông
              báo trước.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">3. Đăng ký tài khoản</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Khi đăng ký tài khoản, bạn cam kết cung cấp thông tin chính xác, đầy đủ và cập nhật.
              Bạn chịu trách nhiệm bảo mật thông tin đăng nhập và mọi hoạt động diễn ra trên tài
              khoản của mình. Chúng tôi có quyền tạm ngưng hoặc chấm dứt tài khoản nếu phát hiện
              hành vi vi phạm.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">4. Quyền sở hữu trí tuệ</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Toàn bộ nội dung, giao diện, mã nguồn, cơ sở dữ liệu và tài liệu liên quan đến Dịch vụ
              đều thuộc sở hữu của chúng tôi và được bảo vệ bởi luật sở hữu trí tuệ. Bạn không được
              sao chép, sửa đổi, phân phối hoặc tạo ra các sản phẩm phái sinh từ Dịch vụ mà không có
              sự đồng ý bằng văn bản.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">5. Dữ liệu người dùng</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Dữ liệu bạn nhập vào hệ thống thuộc quyền sở hữu của bạn. Chúng tôi chỉ sử dụng dữ
              liệu này để cung cấp và cải thiện Dịch vụ. Chúng tôi cam kết không bán hoặc chia sẻ dữ
              liệu của bạn với bên thứ ba, trừ khi được pháp luật yêu cầu hoặc có sự đồng ý của bạn.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">6. Giới hạn trách nhiệm</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Dịch vụ được cung cấp &quot;nguyên trạng&quot; mà không có bất kỳ bảo đảm nào, dù rõ
              ràng hay ngụ ý. Chúng tôi không chịu trách nhiệm về bất kỳ thiệt hại trực tiếp, gián
              tiếp, ngẫu nhiên hoặc do hậu quả nào phát sinh từ việc sử dụng hoặc không thể sử dụng
              Dịch vụ, ngay cả khi đã được thông báo về khả năng xảy ra thiệt hại đó.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">7. Chấm dứt</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Chúng tôi có quyền chấm dứt hoặc tạm ngưng quyền truy cập Dịch vụ của bạn ngay lập tức
              nếu bạn vi phạm bất kỳ điều khoản nào. Khi tài khoản bị chấm dứt, quyền sử dụng Dịch
              vụ của bạn sẽ ngay lập tức chấm dứt. Bạn có thể xuất dữ liệu của mình trong vòng 30
              ngày sau khi chấm dứt.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">8. Liên hệ</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Mọi thắc mắc về Điều khoản dịch vụ, vui lòng liên hệ với chúng tôi qua email:{' '}
              <a href="mailto:support@hethongdoanhthu.vn" className="text-primary hover:underline">
                support@hethongdoanhthu.vn
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          &copy; 2026 Hệ thống Doanh thu. Tất cả quyền được bảo lưu.
        </div>
      </div>
    </div>
  );
}
