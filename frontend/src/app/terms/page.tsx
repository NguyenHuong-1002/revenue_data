import {
  ArrowLeftIcon,
  BarChart3Icon,
  CalendarIcon,
  FileCheckIcon,
  LayersIcon,
  UserPlusIcon,
  ShieldAlertIcon,
  DatabaseIcon,
  ScaleIcon,
  PowerIcon,
  MailIcon,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { DynamicBreadcrumb } from '@/components/dynamic-breadcrumb';

export const metadata: Metadata = {
  title: 'Điều khoản dịch vụ | Hệ thống Doanh thu',
};

const sections = [
  {
    id: 'chap-nhan',
    icon: FileCheckIcon,
    title: '1. Chấp nhận điều khoản',
    content: `Bằng cách truy cập hoặc sử dụng Hệ thống Doanh thu ("Dịch vụ"), bạn xác nhận rằng bạn đã đọc, hiểu và đồng ý bị ràng buộc bởi các Điều khoản dịch vụ này.

Nếu bạn không đồng ý với bất kỳ phần nào của điều khoản, bạn không được phép sử dụng Dịch vụ.`,
  },
  {
    id: 'mo-ta',
    icon: LayersIcon,
    title: '2. Mô tả dịch vụ',
    content: `Hệ thống Doanh thu là nền tảng quản lý doanh thu toàn diện, cung cấp các tính năng bao gồm: nhập dữ liệu từ Excel, quản lý sản phẩm/chi nhánh/nhà máy, dự báo thông minh, phân tích AI, xuất báo cáo PDF/Excel và các tính năng liên quan khác.

Chúng tôi có quyền cập nhật, thay đổi hoặc ngừng cung cấp bất kỳ tính năng nào mà không cần thông báo trước.`,
  },
  {
    id: 'dang-ky',
    icon: UserPlusIcon,
    title: '3. Đăng ký tài khoản',
    content: `Khi đăng ký tài khoản, bạn cam kết cung cấp thông tin chính xác, đầy đủ và cập nhật. Bạn chịu trách nhiệm bảo mật thông tin đăng nhập và mọi hoạt động diễn ra trên tài khoản của mình.

Chúng tôi có quyền tạm ngưng hoặc chấm dứt tài khoản nếu phát hiện hành vi vi phạm hoặc cung cấp thông tin sai lệch.`,
  },
  {
    id: 'so-huu-tri-tue',
    icon: ShieldAlertIcon,
    title: '4. Quyền sở hữu trí tuệ',
    content: `Toàn bộ nội dung, giao diện, mã nguồn, cơ sở dữ liệu và tài liệu liên quan đến Dịch vụ đều thuộc sở hữu của chúng tôi và được bảo vệ bởi luật sở hữu trí tuệ Việt Nam và quốc tế.

Bạn không được sao chép, sửa đổi, phân phối hoặc tạo ra các sản phẩm phái sinh từ Dịch vụ mà không có sự đồng ý bằng văn bản từ chúng tôi.`,
  },
  {
    id: 'du-lieu',
    icon: DatabaseIcon,
    title: '5. Dữ liệu người dùng',
    content: `Dữ liệu bạn nhập vào hệ thống thuộc quyền sở hữu độc quyền của bạn. Chúng tôi chỉ sử dụng dữ liệu này cho mục đích kỹ thuật để vận hành và cải thiện Dịch vụ.

Chúng tôi cam kết bảo mật tuyệt đối, không bán hoặc chia sẻ dữ liệu của bạn với bên thứ ba dưới bất kỳ hình thức nào, trừ khi được cơ quan pháp luật yêu cầu hoặc có sự đồng ý của bạn.`,
  },
  {
    id: 'trach-nhiem',
    icon: ScaleIcon,
    title: '6. Giới hạn trách nhiệm',
    content: `Dịch vụ được cung cấp "nguyên trạng" mà không có bất kỳ bảo đảm nào, dù rõ ràng hay ngụ ý.

Chúng tôi không chịu trách nhiệm về bất kỳ thiệt hại trực tiếp, gián tiếp, ngẫu nhiên hoặc do hậu quả nào phát sinh từ việc sử dụng hoặc không thể sử dụng Dịch vụ, bao gồm việc gián đoạn kinh doanh hoặc mất mát dữ liệu.`,
  },
  {
    id: 'cham-dut',
    icon: PowerIcon,
    title: '7. Chấm dứt',
    content: `Chúng tôi có quyền chấm dứt hoặc tạm ngưng quyền truy cập Dịch vụ của bạn ngay lập tức mà không cần báo trước nếu bạn vi phạm bất kỳ điều khoản nào trong thỏa thuận này.

Khi tài khoản bị chấm dứt, quyền sử dụng Dịch vụ của bạn sẽ dừng lại. Bạn được hỗ trợ xuất toàn bộ dữ liệu của mình trong vòng 30 ngày kể từ ngày chấm dứt dịch vụ.`,
  },
  {
    id: 'lien-he',
    icon: MailIcon,
    title: '8. Liên hệ',
    content: `Mọi thắc mắc, phản hồi hoặc báo cáo vi phạm liên quan đến Điều khoản dịch vụ này, vui lòng gửi thông tin chính thức cho chúng tôi qua email:`,
  },
];

export default function TermsPage() {
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
                Điều khoản dịch vụ
              </h1>
              <p className="mt-2 text-zinc-400 text-sm md:text-base">
                Các quy định và thỏa thuận sử dụng Hệ thống Doanh thu
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
                  <div className="mt-4">
                    <a
                      href="mailto:support@hethongdoanhthu.vn"
                      className="inline-flex items-center gap-2 text-primary hover:underline font-semibold text-sm md:text-base"
                    >
                      <MailIcon className="size-4" />
                      support@hethongdoanhthu.vn
                    </a>
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
