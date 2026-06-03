import { BrainCircuitIcon, TrendingUpIcon, SparklesIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AiInsightItem } from '@/lib/services/landing.service';
import * as LucideIcons from 'lucide-react';

interface AiInsightsProps {
  items?: AiInsightItem[];
}

export function AiInsights({ items }: AiInsightsProps) {
  const displayInsights = items && items.length > 0 ? items : null;

  return (
    <section id="ai-insights" className="relative border-t border-white/5">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none" />
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 relative">
        <div className="mx-auto max-w-2xl text-center animate-fade-in">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary bg-primary/5">
            AI thông minh
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Phân tích chỉ số kinh doanh với <span className="gradient-text">AI</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Tích hợp DeepSeek AI giúp bạn hiểu sâu hơn về dữ liệu doanh thu, phát hiện bất thường và
            nhận gợi ý chiến lược.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {displayInsights ? (
            displayInsights.map((insight, i) => {
              const IconComponent = (LucideIcons as any)[insight.icon] || LucideIcons.BrainCircuit;
              return (
                <Card
                  key={insight.id || insight.title}
                  className="group border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] animate-fade-in"
                  style={{ animationDelay: `${0.1 + i * 0.1}s` }}
                >
                  <CardHeader>
                    <span className="mb-2 flex size-10 items-center justify-center rounded-4xl bg-primary/10 text-primary group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                      <IconComponent className="size-5" />
                    </span>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {insight.title}
                    </CardTitle>
                    <CardDescription>{insight.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })
          ) : (
            <>
              <Card className="group border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] animate-fade-in stagger-1">
                <CardHeader>
                  <span className="mb-2 flex size-10 items-center justify-center rounded-4xl bg-primary/10 text-primary group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                    <BrainCircuitIcon className="size-5" />
                  </span>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    Phân tích tăng trưởng
                  </CardTitle>
                  <CardDescription>
                    AI tự động so sánh doanh thu theo tháng, theo năm, phân tích tốc độ tăng trưởng
                    và xác định xu hướng dài hạn.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="group border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] animate-fade-in stagger-2">
                <CardHeader>
                  <span className="mb-2 flex size-10 items-center justify-center rounded-4xl bg-primary/10 text-primary group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                    <TrendingUpIcon className="size-5" />
                  </span>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    Dự báo thông minh
                  </CardTitle>
                  <CardDescription>
                    Dự đoán doanh thu và tồn kho tương lai dựa trên dữ liệu lịch sử, hỗ trợ lập kế
                    hoạch kinh doanh chính xác.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="group border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] animate-fade-in stagger-3">
                <CardHeader>
                  <span className="mb-2 flex size-10 items-center justify-center rounded-4xl bg-primary/10 text-primary group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                    <SparklesIcon className="size-5" />
                  </span>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    Gợi ý chiến lược
                  </CardTitle>
                  <CardDescription>
                    AI đưa đề xuất hành động dựa trên phân tích dữ liệu, giúp bạn đưa ra quyết định
                    kinh doanh sáng suốt.
                  </CardDescription>
                </CardHeader>
              </Card>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
