import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { features as defaultFeatures } from './data/features';
import { FeatureItem } from '@/lib/services/landing.service';
import * as LucideIcons from 'lucide-react';

interface FeaturesProps {
  items?: FeatureItem[];
}

export function Features({ items }: FeaturesProps) {
  // Normalize icons and values
  const displayFeatures = items && items.length > 0 ? items : null;

  return (
    <section id="features" className="relative border-t border-white/5 grid-pattern">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center animate-fade-in">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary bg-primary/5">
            Tính năng
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Mọi thứ bạn cần để <span className="gradient-text">quản lý doanh thu</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Bộ công cụ toàn diện giúp đội ngũ của bạn vận hành trơn tru từ dữ liệu đến quyết định.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayFeatures
            ? displayFeatures.map((feature, i) => {
                // Resolve icon by string name from database
                const IconComponent = (LucideIcons as any)[feature.icon] || LucideIcons.HelpCircle;
                return (
                  <Card
                    key={feature.id || feature.title}
                    size="sm"
                    className="group border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(96,165,250,0.08)] animate-fade-in"
                    style={{ animationDelay: `${0.1 + i * 0.05}s` }}
                  >
                    <CardHeader>
                      <span className="mb-2 flex size-10 items-center justify-center rounded-4xl bg-primary/10 text-primary group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                        <IconComponent className="size-4" />
                      </span>
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {feature.title}
                      </CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                );
              })
            : defaultFeatures.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={feature.title}
                    size="sm"
                    className="group border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(96,165,250,0.08)] animate-fade-in"
                    style={{ animationDelay: `${0.1 + i * 0.05}s` }}
                  >
                    <CardHeader>
                      <span className="mb-2 flex size-10 items-center justify-center rounded-4xl bg-primary/10 text-primary group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                        <Icon className="size-4" />
                      </span>
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {feature.title}
                      </CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
        </div>
      </div>
    </section>
  );
}
