import { ArrowLeftIcon, BarChart3Icon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Chính sách bảo mật | Hệ thống Doanh thu',
};

export default function PrivacyPage() {
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
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Chính sách bảo mật</h1>
            <p className="mt-2 text-sm text-muted-foreground">Cập nhật lần cuối: 01/06/2026</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">1. Giới thiệu</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Chúng tôi (&quot;Hệ thống Doanh thu&quot;) cam kết bảo vệ quyền riêng tư và dữ liệu cá
              nhân của bạn. Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng, lưu
              trữ và bảo vệ thông tin của bạn khi bạn sử dụng Dịch vụ.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">2. Thông tin chúng tôi thu thập</h2>
            <div className="text-sm leading-relaxed text-muted-foreground space-y-2">
              <p>Chúng tôi có thể thu thập các loại thông tin sau:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Thông tin tài khoản:</strong> Họ tên, email, mật khẩu (được mã hóa), số
                  điện thoại và thông tin công ty.
                </li>
                <li>
                  <strong>Dữ liệu kinh doanh:</strong> Dữ liệu sản phẩm, doanh số, tồn kho và báo
                  cáo bạn nhập vào hệ thống.
                </li>
                <li>
                  <strong>Dữ liệu sử dụng:</strong> Lịch sử truy cập, thao tác trên dashboard, tần
                  suất sử dụng và nhật ký hệ thống.
                </li>
                <li>
                  <strong>Thông tin kỹ thuật:</strong> Địa chỉ IP, loại trình duyệt, hệ điều hành và
                  thông tin thiết bị.
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">3. Cách chúng tôi sử dụng thông tin</h2>
            <div className="text-sm leading-relaxed text-muted-foreground space-y-2">
              <p>Thông tin của bạn được sử dụng để:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Cung cấp, vận hành và duy trì Dịch vụ</li>
                <li>Cải thiện, cá nhân hóa trải nghiệm người dùng</li>
                <li>Xử lý giao dịch và gửi thông báo liên quan</li>
                <li>Phân tích xu hướng sử dụng để nâng cao chất lượng dịch vụ</li>
                <li>Tuân thủ nghĩa vụ pháp lý và bảo vệ quyền lợi hợp pháp</li>
                <li>Phát hiện và ngăn chặn các hoạt động gian lận hoặc vi phạm</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">4. Bảo mật dữ liệu</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Chúng tôi áp dụng các biện pháp bảo mật tiêu chuẩn ngành bao gồm mã hóa SSL/TLS cho
              truyền dữ liệu, mã hóa AES-256 cho dữ liệu lưu trữ, xác thực JWT đa lớp, tường lửa ứng
              dụng web (WAF) và kiểm tra bảo mật định kỳ. Tuy nhiên, không có phương thức truyền tải
              hoặc lưu trữ nào trên Internet là hoàn toàn an toàn.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">5. Chia sẻ dữ liệu với bên thứ ba</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Chúng tôi không bán, trao đổi hoặc chuyển nhượng thông tin cá nhân của bạn cho bên thứ
              ba, trừ các trường hợp sau: (a) được sự đồng ý của bạn; (b) chia sẻ với các đối tác
              cung cấp dịch vụ hỗ trợ hoạt động của chúng tôi (xử lý thanh toán, lưu trữ dữ liệu) và
              họ cam kết bảo mật; (c) tuân thủ theo yêu cầu pháp luật; (d) bảo vệ quyền lợi và sự an
              toàn của chúng tôi hoặc người dùng khác.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">6. Cookie và công nghệ theo dõi</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Chúng tôi sử dụng cookie và công nghệ tương tự để cải thiện trải nghiệm người dùng,
              phân tích xu hướng và quản lý phiên đăng nhập. Bạn có thể kiểm soát cookie thông qua
              cài đặt trình duyệt. Tuy nhiên, việc vô hiệu hóa cookie có thể ảnh hưởng đến một số
              tính năng của Dịch vụ.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">7. Quyền của bạn</h2>
            <div className="text-sm leading-relaxed text-muted-foreground space-y-2">
              <p>Bạn có quyền:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Quyền truy cập:</strong> Yêu cầu bản sao dữ liệu cá nhân của bạn
                </li>
                <li>
                  <strong>Quyền chỉnh sửa:</strong> Yêu cầu sửa thông tin không chính xác
                </li>
                <li>
                  <strong>Quyền xóa:</strong> Yêu cầu xóa dữ liệu cá nhân của bạn
                </li>
                <li>
                  <strong>Quyền xuất dữ liệu:</strong> Xuất dữ liệu của bạn ở định dạng phổ biến
                </li>
                <li>
                  <strong>Quyền rút lại sự đồng ý:</strong> Rút lại sự đồng ý bất kỳ lúc nào
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">8. Lưu trữ dữ liệu</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Dữ liệu của bạn được lưu trữ trên các máy chủ an toàn tại Việt Nam. Chúng tôi duy trì
              dữ liệu của bạn trong suốt thời gian tài khoản còn hoạt động và tối đa 90 ngày sau khi
              tài khoản bị đóng, trừ khi pháp luật yêu cầu lưu trữ lâu hơn.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">9. Thay đổi chính sách</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Chúng tôi có quyền cập nhật chính sách bảo mật này theo thời gian. Mọi thay đổi sẽ
              được đăng tải trên trang này và thông báo qua email nếu là thay đổi quan trọng. Việc
              bạn tiếp tục sử dụng Dịch vụ sau khi thay đổi có hiệu lực đồng nghĩa với việc bạn chấp
              nhận các thay đổi đó.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">10. Liên hệ</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật này, vui lòng liên hệ:
            </p>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                Email:{' '}
                <a
                  href="mailto:privacy@hethongdoanhthu.vn"
                  className="text-primary hover:underline"
                >
                  privacy@hethongdoanhthu.vn
                </a>
              </p>
              <p>Địa chỉ: Tầng 5, Số 123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</p>
            </div>
          </section>
        </div>

        <div className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          &copy; 2026 Hệ thống Doanh thu. Tất cả quyền được bảo lưu.
        </div>
      </div>
    </div>
  );
}
