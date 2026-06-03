import { FileSpreadsheetIcon, HomeIcon, ArrowRightIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="landing-surface relative flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center overflow-hidden grid-pattern">
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-blue-500/2 rounded-full blur-[120px] pointer-events-none" />

      {/* Spreadsheet Error Mockup */}
      <div className="relative mb-8 w-full max-w-sm border border-white/10 bg-zinc-950/90 rounded-lg shadow-2xl backdrop-blur-md overflow-hidden animate-fade-in stagger-1">
        {/* Spreadsheet Header / Tab */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-white/1">
          <div className="flex items-center gap-2">
            <FileSpreadsheetIcon className="size-4 text-emerald-500" />
            <span className="text-xs font-mono text-white">page_not_found.xlsx</span>
          </div>
          <div className="flex gap-1">
            <span className="size-2 rounded-full bg-green-500" />
            <span className="size-2 rounded-full bg-red-500" />
          </div>
        </div>

        {/* Spreadsheet Column Headers (A, B, C) */}
        <div className="grid grid-cols-[30px_1fr_1.2fr] border-b border-white/5 text-[10px] font-mono text-muted-foreground bg-white/[0.02] text-center">
          <div className="border-r border-white/5 py-1 bg-white/1 shrink-0" />
          <div className="border-r border-white/5 py-1">A</div>
          <div className="py-1">B</div>
        </div>

        {/* Spreadsheet Rows */}
        <div className="text-xs font-mono text-left">
          {/* Row 1 */}
          <div className="grid grid-cols-[30px_1fr_1.2fr] border-b border-white/5">
            <div className="border-r border-white/5 text-[9px] text-muted-foreground text-center py-2 bg-white/[0.02] shrink-0">
              1
            </div>
            <div className="border-r border-white/5 px-3 py-2 text-white/50">ERROR_CODE</div>
            <div className="px-3 py-2 text-red-400 font-bold bg-red-500/5">404</div>
          </div>
          {/* Row 2 */}
          <div className="grid grid-cols-[30px_1fr_1.2fr] border-b border-white/5">
            <div className="border-r border-white/5 text-[9px] text-muted-foreground text-center py-2 bg-white/[0.02] shrink-0">
              2
            </div>
            <div className="border-r border-white/5 px-3 py-2 text-white/50">STATUS</div>
            <div className="px-3 py-2 text-amber-400">NOT_FOUND</div>
          </div>
          {/* Row 3 */}
          <div className="grid grid-cols-[30px_1fr_1.2fr] border-b border-white/5">
            <div className="border-r border-white/5 text-[9px] text-muted-foreground text-center py-2 bg-white/[0.02] shrink-0">
              3
            </div>
            <div className="border-r border-white/5 px-3 py-2 text-white/50">RESOURCE</div>
            <div className="px-3 py-2 text-white/80 select-all truncate">undefined_route</div>
          </div>
          {/* Row 4 */}
          <div className="grid grid-cols-[30px_1fr_1.2fr]">
            <div className="border-r border-white/5 text-[9px] text-muted-foreground text-center py-2 bg-white/[0.02] shrink-0">
              4
            </div>
            <div className="border-r border-white/5 px-3 py-2 text-white/50">DIAGNOSIS</div>
            <div className="px-3 py-2 text-white/40 italic">NullPointerException</div>
          </div>
        </div>
      </div>

      {/* Main content texts */}
      <div className="relative z-10 max-w-md">
        <h2 className="text-2xl font-bold tracking-tight text-gray-700 animate-fade-in stagger-2">
          Lỗi tham chiếu dữ liệu
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-black animate-fade-in stagger-3 max-w-sm mx-auto">
          Trang bạn đang truy cập không khớp với bất kỳ bảng tham chiếu nào trong hệ thống. Vui lòng
          quay trở lại màn hình chính.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center animate-fade-in stagger-4 w-full sm:w-auto">
          <Button
            asChild
            className="w-full sm:w-auto px-6 bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all shadow-lg hover:shadow-blue-500/10"
          >
            <Link href="/dashboard">
              Quay lại Bảng điều khiển
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto px-6 border-white/10 hover:bg-white/5 text-muted-foreground hover:text-white transition-all"
          >
            <Link href="/">
              <HomeIcon className="mr-2 h-4 w-4" />
              Trang chủ
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
