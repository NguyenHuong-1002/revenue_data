import { BarChart3Icon, ArrowRightIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-background/80 border-b border-zinc-200 dark:border-white/5 animate-fade-in">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-zinc-900 hover:text-primary dark:text-zinc-200 dark:hover:text-white transition-colors"
        >
          <span className="flex size-9 items-center justify-center rounded-4xl bg-primary text-primary-foreground ">
            <BarChart3Icon className="size-4" />
          </span>
          Hệ thống Doanh thu
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-zinc-600 dark:text-zinc-400 md:flex">
          <a
            href="#features"
            className="transition-colors hover:text-zinc-900 dark:hover:text-white animate-fade-in stagger-1"
          >
            Tính năng
          </a>
          <a
            href="#ai-insights"
            className="transition-colors hover:text-zinc-900 dark:hover:text-white animate-fade-in stagger-2"
          >
            AI
          </a>
          <a
            href="#stats"
            className="transition-colors hover:text-zinc-900 dark:hover:text-white animate-fade-in stagger-3"
          >
            Thống kê
          </a>
          {/* <a href="#pricing" className="transition-colors hover:text-zinc-900 dark:hover:text-white animate-fade-in stagger-4">
            Bảng giá
          </a> */}
          <a
            href="#faq"
            className="transition-colors hover:text-zinc-900 dark:hover:text-white animate-fade-in stagger-5"
          >
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
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
