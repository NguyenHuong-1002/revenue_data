import { ArrowRightIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function CTA() {
  return (
    <section className="relative border-t border-white/5 overflow-hidden">
      <div className="absolute inset-0 bg-primary/[0.05] pointer-events-none" />
      <div className="orb orb-1" style={{ opacity: 0.15 }} />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-20 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8 relative">
        <div className="max-w-xl animate-fade-in">
          <p className="text-sm font-medium text-primary">Sẵn sàng bắt đầu?</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Nhập dữ liệu, <span className="text-primary">AI phân tích</span>, báo cáo ngay — tất cả
            trong một hệ thống.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Dùng thử miễn phí 14 ngày, không cần thẻ tín dụng.
          </p>
        </div>
        <Button
          asChild
          size="lg"
          className="animate-glow-pulse bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
        >
          <Link href="/dashboard">
            Khám phá báo cáo
            <ArrowRightIcon data-icon="inline-end" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
