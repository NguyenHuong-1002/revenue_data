import * as LucideIcons from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FeatureItem } from '@/lib/services/landing.service';
import { features as defaultFeatures } from './data/features';

interface FeaturesProps {
  items?: FeatureItem[];
  isLoading?: boolean;
}

export function Features({ items, isLoading = false }: FeaturesProps) {
  // Normalize icons and values
  const displayFeatures = items && items.length > 0 ? items : null;

  return (
    <section
      id="features"
      className="relative border-t border-zinc-200 dark:border-white/5 grid-pattern"
    >
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
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Card
                  key={i}
                  size="sm"
                  className="border border-white/5 bg-white/[0.01] animate-pulse"
                >
                  <CardHeader>
                    <Skeleton className="mb-2 size-10 rounded-full bg-white/10" />
                    <Skeleton className="h-6 w-32 rounded-md bg-white/10" />
                    <Skeleton className="h-4 w-full rounded-md bg-white/10 mt-2" />
                    <Skeleton className="h-4 w-5/6 rounded-md bg-white/10 mt-1.5" />
                  </CardHeader>
                </Card>
              ))
            : displayFeatures
              ? displayFeatures.map((feature, i) => {
                  // Resolve icon by string name from database
                  const IconComponent =
                    (
                      LucideIcons as unknown as Record<
                        string,
                        React.ComponentType<{ className?: string }>
                      >
                    )[feature.icon] || LucideIcons.HelpCircle;
                  return (
                    <Card
                      key={feature.id || feature.title}
                      size="sm"
                      className="group border border-zinc-200 bg-zinc-50/30 hover:bg-zinc-50/80 dark:border-white/5 dark:bg-white/[0.02] dark:hover:bg-white/[0.06] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.08)] animate-fade-in"
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
                      className="group border border-zinc-200 bg-zinc-50/30 hover:bg-zinc-50/80 dark:border-white/5 dark:bg-white/[0.02] dark:hover:bg-white/[0.06] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.08)] animate-fade-in"
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
