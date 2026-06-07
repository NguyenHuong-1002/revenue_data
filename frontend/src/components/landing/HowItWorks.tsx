import { DatabaseIcon, LineChartIcon, DownloadIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const steps = [
  {
    step: '01',
    icon: DatabaseIcon,
    title: 'Import dữ liệu',
    desc: 'Tải lên file Excel sản phẩm, doanh số và tồn kho. Hệ thống tự động xử lý và chuẩn hóa.',
  },
  {
    step: '02',
    icon: LineChartIcon,
    title: 'Phân tích & Dự báo',
    desc: 'Dashboard trực quan, AI phân tích chỉ số và dự báo doanh thu/tồn kho tương lai.',
  },
  {
    step: '03',
    icon: DownloadIcon,
    title: 'Báo cáo & Xuất dữ liệu',
    desc: 'Xuất báo cáo tăng trưởng và doanh thu dưới dạng PDF/Excel để chia sẻ với đội ngũ.',
  },
];

export function HowItWorks() {
  return (
    <section className="border-t border-zinc-200 dark:border-white/5 bg-zinc-50/10 dark:bg-white/[0.01]">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center animate-fade-in">
          <Badge
            variant="outline"
            className="mb-4 border-amber-500/30 text-amber-400 bg-amber-500/5"
          >
            Quy trình
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Bắt đầu chỉ trong <span className="text-primary">3 bước</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Không cần cài đặt phức tạp. Không cần đào tạo dài dòng.
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-3 relative">
          {steps.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="text-center relative animate-fade-in"
                style={{ animationDelay: `${0.1 + i * 0.15}s` }}
              >
                {i < 2 && <div className="connector-line hidden sm:block" />}
                <span className="flex mx-auto size-14 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold shadow-lg shadow-primary/20 transition-transform duration-300 hover:scale-110">
                  {item.step}
                </span>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <Icon className="size-5 text-primary" />
                  <h3 className="font-semibold">{item.title}</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
