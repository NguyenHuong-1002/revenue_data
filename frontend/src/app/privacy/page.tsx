import {
  ArrowLeftIcon,
  BarChart3Icon,
  CalendarIcon,
  BookOpenIcon,
  FileTextIcon,
  CpuIcon,
  LockIcon,
  Share2Icon,
  CookieIcon,
  UserCheckIcon,
  ServerIcon,
  RefreshCwIcon,
  MailIcon,
  MapPinIcon,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { DynamicBreadcrumb } from '@/components/dynamic-breadcrumb';

export const metadata: Metadata = {
  title: 'Chính sách bảo mật | Hệ thống Doanh thu',
};

const sections = [
  {
    id: 'gioi-thieu',
    icon: BookOpenIcon,
    title: '1. Giới thiệu',
    content: `Chúng tôi ("Hệ thống Doanh thu") cam kết bảo vệ quyền riêng tư và dữ liệu cá nhân của bạn.

Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ thông tin của bạn khi bạn sử dụng Dịch vụ.`,
  },
  {
    id: 'thu-thap',
    icon: FileTextIcon,
    title: '2. Thông tin thu thập',
    content: `Chúng tôi có thể thu thập các loại thông tin sau:

• Thông tin tài khoản: Họ tên, email, mật khẩu (được mã hóa), số điện thoại và thông tin công ty.
• Dữ liệu kinh doanh: Dữ liệu sản phẩm, doanh số, tồn kho và báo cáo tài chính bạn nhập vào hệ thống.
• Dữ liệu sử dụng: Lịch sử truy cập, thao tác trên dashboard, tần suất sử dụng và nhật ký hoạt động hệ thống.
• Thông tin kỹ thuật: Địa chỉ IP, loại trình duyệt, hệ điều hành và thông tin định danh thiết bị.`,
  },
  {
    id: 'su-dung',
    icon: CpuIcon,
    title: '3. Mục đích sử dụng',
    content: `Thông tin của bạn được sử dụng cho các mục đích hợp pháp sau:

• Cung cấp, vận hành, tối ưu hóa và duy trì Dịch vụ.
• Cải thiện và cá nhân hóa trải nghiệm người dùng trên dashboard.
• Xử lý giao dịch an toàn và gửi các thông báo quan trọng về hệ thống.
• Phân tích xu hướng sử dụng để nâng cao chất lượng mô hình dự báo AI.
• Tuân thủ các nghĩa vụ pháp lý và phát hiện, ngăn chặn các hành vi gian lận.`,
  },
  {
    id: 'bao-mat',
    icon: LockIcon,
    title: '4. Bảo mật dữ liệu',
    content: `Chúng tôi áp dụng các biện pháp bảo mật tiêu chuẩn ngành cao nhất bao gồm:

• Mã hóa đường truyền SSL/TLS bảo vệ dữ liệu khi gửi qua mạng.
• Mã hóa AES-256 đối với tất cả cơ sở dữ liệu lưu trữ.
• Xác thực đa lớp JWT kiểm soát quyền truy cập chặt chẽ.
• Hệ thống tường lửa ứng dụng Web (WAF) ngăn chặn tấn công xâm nhập.
• Thực hiện quét lỗ hổng và kiểm tra bảo mật định kỳ.`,
  },
  {
    id: 'chia-se',
    icon: Share2Icon,
    title: '5. Chia sẻ thông tin',
    content: `Chúng tôi cam kết không bán, trao đổi hoặc chuyển nhượng dữ liệu cá nhân và kinh doanh của bạn cho bên thứ ba dưới bất kỳ hình thức thương mại nào.

Chúng tôi chỉ chia sẻ thông tin trong các trường hợp: có sự đồng ý của bạn; chia sẻ với đối tác hỗ trợ kỹ thuật đáng tin cậy đã ký cam kết bảo mật; tuân thủ theo yêu cầu pháp lý chính thức từ cơ quan nhà nước; hoặc để bảo vệ an toàn cho hệ thống.`,
  },
  {
    id: 'cookie',
    icon: CookieIcon,
    title: '6. Cookie và theo dõi',
    content: `Chúng tôi sử dụng cookie để lưu trữ phiên làm việc, tự động ghi nhớ cấu hình ngôn ngữ/giao diện và phân tích lưu lượng truy cập tổng hợp.

Bạn có thể tắt cookie thông qua cài đặt của trình duyệt của mình, tuy nhiên điều này có thể làm ảnh hưởng đến một số tính năng tự động đăng nhập hoặc đồng bộ trên hệ thống.`,
  },
  {
    id: 'quyen-han',
    icon: UserCheckIcon,
    title: '7. Quyền của bạn',
    content: `Bạn có toàn bộ quyền kiểm soát đối với dữ liệu cá nhân của mình, bao gồm:

• Quyền truy cập: Yêu cầu xem và nhận bản sao dữ liệu cá nhân của bạn đang lưu trữ.
• Quyền chỉnh sửa: Tự cập nhật hoặc yêu cầu sửa thông tin không chính xác.
• Quyền xóa: Yêu cầu xóa vĩnh viễn tài khoản và dữ liệu liên quan.
• Quyền xuất dữ liệu: Tải xuống toàn bộ dữ liệu kinh doanh ở định dạng Excel hoặc JSON.
• Quyền rút lại sự đồng ý: Rút lại quyền xử lý dữ liệu cá nhân bất kỳ lúc nào.`,
  },
  {
    id: 'luu-tru',
    icon: ServerIcon,
    title: '8. Lưu trữ dữ liệu',
    content: `Dữ liệu của bạn được lưu trữ trên các máy chủ đám mây an toàn đặt tại Việt Nam.

Chúng tôi duy trì dữ liệu của bạn trong suốt thời gian tài khoản còn hoạt động. Khi bạn đóng tài khoản, toàn bộ dữ liệu sẽ được giữ lại tối đa 90 ngày (để phục vụ việc khôi phục nếu cần) trước khi bị xóa hoàn toàn khỏi hệ thống, trừ khi có yêu cầu pháp luật khác.`,
  },
  {
    id: 'thay-doi',
    icon: RefreshCwIcon,
    title: '9. Thay đổi chính sách',
    content: `Chúng tôi có quyền cập nhật chính sách bảo mật này để phù hợp với những nâng cấp kỹ thuật mới hoặc quy định pháp luật.

Mọi thay đổi sẽ được cập nhật trực tiếp trên trang này và hệ thống sẽ gửi thông báo email cho bạn nếu đó là những thay đổi quan trọng liên quan đến quyền lợi của bạn.`,
  },
  {
    id: 'lien-he',
    icon: MailIcon,
    title: '10. Liên hệ bảo mật',
    content: `Mọi yêu cầu hỗ trợ liên quan đến dữ liệu cá nhân hoặc các phản ánh về quyền riêng tư, vui lòng liên hệ với bộ phận phụ trách bảo mật của chúng tôi:`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Navigation Top Header */}
        <div className="mb-10 flex items-center justify-between border-b border-zinc-200 dark:border-white/5 pb-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-200 hover:text-primary transition-colors"
          >
            <span className="flex size-9 items-center justify-center rounded-4xl bg-primary text-primary-foreground">
              <BarChart3Icon className="size-4" />
            </span>
            Hệ thống Doanh thu
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg border border-zinc-200 dark:border-white/10 bg-background hover:bg-zinc-50 dark:hover:bg-white/5 px-4 py-2 text-sm font-medium transition-all group"
            >
              <ArrowLeftIcon className="size-4 mr-2 group-hover:-translate-x-0.5 transition-transform" />
              Quay lại
            </Link>
          </div>
        </div>

        {/* Breadcrumb path */}
        <div className="mb-8">
          <DynamicBreadcrumb />
        </div>

        {/* Hero Header Banner */}
        <div className="relative py-12 md:py-16 overflow-hidden rounded-3xl bg-zinc-900 text-white dark:bg-zinc-950 border border-white/5 mb-12 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-transparent to-transparent pointer-events-none" />
          <div className="absolute -top-12 -right-12 size-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <div className="relative max-w-3xl mx-auto px-6 text-center md:text-left md:px-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Chính sách bảo mật
              </h1>
              <p className="mt-2 text-zinc-400 text-sm md:text-base">
                Chúng tôi cam kết bảo vệ dữ liệu và quyền riêng tư của bạn
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 shrink-0 self-center md:self-auto text-xs font-mono text-zinc-300">
              <CalendarIcon className="size-3.5 text-primary" />
              Cập nhật: 01/06/2026
            </div>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
          {/* Left Column: Sticky Sidebar Table of Contents */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 px-3">
                Mục lục
              </h3>
              {sections.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white transition-all duration-200"
                >
                  <sec.icon className="size-4 shrink-0 text-muted-foreground/75" />
                  <span className="truncate">{sec.title.split('. ')[1]}</span>
                </a>
              ))}
            </div>
          </aside>

          {/* Right Column: Detailed Clauses */}
          <div className="space-y-8">
            {sections.map((sec) => (
              <section
                key={sec.id}
                id={sec.id}
                className="scroll-mt-24 group p-6 rounded-2xl border border-zinc-200 dark:border-white/5 bg-zinc-50/20 dark:bg-white/[0.01] hover:border-zinc-300 dark:hover:border-white/10 hover:bg-zinc-50/50 dark:hover:bg-white/[0.02] transition-all duration-300 hover:shadow-lg hover:shadow-primary/[0.005]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/5 transition-transform duration-300 group-hover:scale-110">
                    <sec.icon className="size-5" />
                  </span>
                  <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    {sec.title}
                  </h2>
                </div>
                <p className="text-sm md:text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                  {sec.content}
                </p>
                {sec.id === 'lien-he' && (
                  <div className="mt-4 space-y-3 pt-2 border-t border-zinc-200/50 dark:border-white/5">
                    <a
                      href="mailto:privacy@hethongdoanhthu.vn"
                      className="inline-flex items-center gap-2 text-primary hover:underline font-semibold text-sm md:text-base"
                    >
                      <MailIcon className="size-4" />
                      privacy@hethongdoanhthu.vn
                    </a>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPinIcon className="size-4 mt-0.5 text-zinc-400 shrink-0" />
                      <span>Địa chỉ: Tầng 5, Số 123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</span>
                    </div>
                  </div>
                )}
              </section>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 border-t border-zinc-200 dark:border-white/5 pt-8 text-center text-xs text-muted-foreground">
          &copy; 2026 Hệ thống Doanh thu. Tất cả quyền được bảo lưu.
        </div>
      </div>
    </div>
  );
}
