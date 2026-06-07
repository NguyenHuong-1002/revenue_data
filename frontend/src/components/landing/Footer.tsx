import { BarChart3Icon } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-white/5 bg-zinc-50/10 dark:bg-white/[0.01]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="animate-fade-in">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="flex size-8 items-center justify-center rounded-4xl bg-primary text-primary-foreground">
                <BarChart3Icon className="size-3.5" />
              </span>
              Hệ thống Doanh thu
            </Link>
            <p className="mt-3 text-xs text-muted-foreground">
              Giải pháp quản lý doanh thu toàn diện cho doanh nghiệp Việt.
            </p>
          </div>
          <div className="animate-fade-in stagger-1">
            <h4 className="text-sm font-semibold">Sản phẩm</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#features" className="hover:text-primary transition-colors">
                  Tính năng
                </a>
              </li>
              <li>
                <a href="#ai-insights" className="hover:text-primary transition-colors">
                  AI Insights
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-primary transition-colors">
                  Bảng giá
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-primary transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="/api/docs" className="hover:text-primary transition-colors">
                  API Docs
                </a>
              </li>
            </ul>
          </div>
          <div className="animate-fade-in stagger-2">
            <h4 className="text-sm font-semibold">Công ty</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Về chúng tôi
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Tuyển dụng
                </a>
              </li>
            </ul>
          </div>
          <div className="animate-fade-in stagger-3">
            <h4 className="text-sm font-semibold">Hỗ trợ</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Trung tâm trợ giúp
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Liên hệ
                </a>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  Điều khoản dịch vụ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  Chính sách bảo mật
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-zinc-200 dark:border-white/5 pt-6 text-center text-xs text-muted-foreground">
          &copy; 2026 Hệ thống Doanh thu. Tất cả quyền được bảo lưu.
        </div>
      </div>
    </footer>
  );
}
