import { BarChart3Icon, ArrowRightIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#0a1628]/80 border-b border-white/5 animate-fade-in">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold text-white">
          <span className="flex size-9 items-center justify-center rounded-4xl bg-primary text-primary-foreground ">
            <BarChart3Icon className="size-4" />
          </span>
          Hệ thống Doanh thu
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <a
            href="#features"
            className="transition-colors hover:text-primary animate-fade-in stagger-1 text-white"
          >
            Tính năng
          </a>
          <a
            href="#ai-insights"
            className="transition-colors hover:text-primary animate-fade-in stagger-2 text-white"
          >
            AI
          </a>
          <a
            href="#stats"
            className="transition-colors hover:text-primary animate-fade-in stagger-3 text-white"
          >
            Thống kê
          </a>
          {/* <a href="#pricing" className="transition-colors hover:text-primary animate-fade-in stagger-4 text-white">
            Bảng giá
          </a> */}
          <a
            href="#faq"
            className="transition-colors hover:text-primary animate-fade-in stagger-5 text-white"
          >
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Button asChild size="sm">
            <Link href="/auth/login">
              Đăng nhập
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
