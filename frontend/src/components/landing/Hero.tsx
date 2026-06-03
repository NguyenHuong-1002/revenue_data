import { ArrowRightIcon, TrendingUpIcon } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { metrics } from './data/metrics';

interface HeroProps {
  title?: string;
  subtitle?: string;
}

export function Hero({ title, subtitle }: HeroProps) {
  return (
    <section className="relative mx-auto grid w-full max-w-7xl gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:pb-28 lg:pt-24 items-center">
      {/* Background radial highlight (extremely subtle) */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-500/[0.03] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-slate-500/[0.02] rounded-full blur-[100px] pointer-events-none" />

      <div className="flex flex-col justify-center items-center text-center lg:items-start lg:text-left relative z-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl leading-[1.1] text-gray-700 animate-fade-in stagger-1 max-w-3xl">
          {title || (
            <>
              Quản lý dữ liệu doanh thu & <span className="gradient-text">tự động hóa dự báo</span>
            </>
          )}
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg animate-fade-in stagger-2">
          {subtitle ||
            'Nền tảng vận hành doanh thu doanh nghiệp — nhập dữ liệu Excel thông minh, quản lý đa chi nhánh và nhà máy, tích hợp mô hình phân tích xu hướng và xuất báo cáo tài chính chuẩn xác.'}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row w-full sm:w-auto animate-fade-in stagger-3">
          <Button
            asChild
            size="lg"
            className="px-8 bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-blue-500/10 transition-all font-medium"
          >
            <Link href="/dashboard">
              Trải nghiệm Dashboard
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-white/10 hover:bg-white/5 px-8 text-muted-foreground hover:text-gray-700 transition-all"
          >
            <a href="#features">Tìm hiểu tính năng</a>
          </Button>
        </div>

        {/* Professional Metrics Signals */}
        <div className="mt-16 grid grid-cols-3 gap-8 border-t border-white/5 pt-8 w-full max-w-lg text-left">
          <div>
            <div className="text-2xl font-bold text-green-300  tracking-tight">100%</div>
            <div className="text-base text-muted-foreground mt-0.5 font-medium">
              Bảo mật dữ liệu
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-300 tracking-tight">Excel</div>
            <div className="text-base text-muted-foreground mt-0.5 font-medium">
              Đồng bộ hóa 1-click
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-300 tracking-tight">AI / ML</div>
            <div className="text-base text-muted-foreground mt-0.5 font-medium">
              Thuật toán dự báo
            </div>
          </div>
        </div>
      </div>

      <div id="dashboard" className="relative animate-fade-in-right z-10 w-full">
        {/* Subtle, realistic box shadow container */}
        <div className="rounded-xl border border-white/10 bg-zinc-950/60 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.7)] backdrop-blur-md overflow-hidden">
          {/* Browser Header Bar */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-white/1">
            <div className="flex gap-1.5 shrink-0">
              <div className="size-2 rounded-full bg-red-500" />
              <div className="size-2 rounded-full bg-white" />
              <div className="size-2 rounded-full bg-green-500" />
            </div>
            {/* Address Bar */}
            <div className="flex-1 max-w-xs sm:max-w-md mx-auto rounded bg-white/2 px-3 py-1 text-[10px] text-white font-mono flex items-center justify-center gap-1 border border-white/5">
              <svg
                className="size-3 text-white shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
              <span>revenue-ai.vn/dashboard</span>
            </div>
            <div className="w-10 shrink-0 hidden sm:block" />
          </div>

          <CardHeader className="border-b border-white/5 bg-white/1 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold tracking-tight text-white">
                  Báo cáo hiệu suất
                </CardTitle>
              </div>
              <Badge
                variant="outline"
                className="gap-1 border-white/10 text-white   bg-white/2 font-mono text-[10px]"
              >
                <TrendingUpIcon className="size-3 text-blue-500" />
                Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-6">
            {/* Minimalist Metrics Grid */}
            <div className="grid gap-3 grid-cols-3">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="p-3.5 rounded-lg border border-white/5 hover:border-white/10 transition-colors"
                >
                  <p className="text-[10px] text-white font-medium truncate uppercase tracking-wider">
                    {metric.label}
                  </p>
                  <p className="mt-1 text-xl font-bold tracking-tight text-white">{metric.value}</p>
                  <p className="mt-1 text-base font-medium text-emerald-500 flex items-center gap-0.5 font-mono">
                    {metric.change}
                  </p>
                </div>
              ))}
            </div>

            {/* Financial Area Chart (Extremely Clean & Corporate) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">
                  Xu hướng doanh thu & Mô hình học máy
                </span>
                <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 font-medium">
                  Dự báo Q4
                </span>
              </div>

              <div className="h-45 w-full relative overflow-hidden rounded-lg bg-black/30 p-3 border border-white/5 flex flex-col justify-between">
                <div className="w-full flex-1 relative flex items-end">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    <div className="border-b border-white/3 w-full" />
                    <div className="border-b border-white/3 w-full" />
                    <div className="border-b border-white/3 w-full" />
                    <div className="border-b border-white/3 w-full" />
                  </div>

                  <svg
                    className="w-full h-[85%] absolute inset-x-0 bottom-0"
                    viewBox="0 0 400 120"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="solid-chart-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Background Area Grid */}
                    <path
                      d="M 0 100 C 40 85, 80 90, 120 60 C 160 30, 200 70, 240 50 C 280 30, 320 20, 400 5 L 400 120 L 0 120 Z"
                      fill="url(#solid-chart-gradient)"
                    />

                    {/* Reference line */}
                    <path
                      d="M 0 100 C 40 85, 80 90, 120 60 C 160 30, 200 70, 240 50 C 280 30, 320 20, 400 5"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />

                    {/* Timeline vertical marker */}
                    <line
                      x1="240"
                      y1="0"
                      x2="240"
                      y2="120"
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeWidth="1"
                      strokeDasharray="3,3"
                    />

                    {/* Points */}
                    <circle cx="120" cy="60" r="3" fill="#3b82f6" />
                    <circle cx="240" cy="50" r="3.5" fill="#3b82f6" stroke="#000" strokeWidth="1" />
                    <circle cx="400" cy="5" r="4" fill="#3b82f6" stroke="#fff" strokeWidth="1.5" />
                  </svg>

                  {/* Clean Static Tooltip */}
                  <div className="absolute top-2 right-4 bg-zinc-900 border border-white/10 rounded px-2.5 py-1 text-[10px] text-white flex items-center gap-1.5 shadow-lg font-mono">
                    <span className="size-1.5 rounded-full bg-blue-500" />
                    <span>Dự kiến Q4: $1.42M (+13.6%)</span>
                  </div>
                </div>

                {/* X-Axis Labels */}
                <div className="flex justify-between border-t border-white/5 pt-2 text-[9px] text-white font-mono">
                  <span>T7</span>
                  <span>T8</span>
                  <span>T9</span>
                  <span>T10 (Hiện tại)</span>
                  <span>T11 (Dự báo)</span>
                  <span>T12 (Dự báo)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </div>
    </section>
  );
}
